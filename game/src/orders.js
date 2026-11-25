// The order rail: tickets arrive at the day's pace, each with its own patience clock. A ticket
// that runs out costs a lantern star and breaks the rush. Serving pays the dish price plus a tip
// that shrinks as the ticket ages, and a rush of quick serves multiplies the pay and wins stars back.
import { COMBO_KEEP, MAX_STARS, PACE, RESTORE_EVERY, RUSH_AT, RUSH_MULT } from './config.js';
import { sameParts, unlockedRecipes, newOnDay } from './recipes.js';

export function createOrders() {
  return { list: [], nextId: 1, spawnIn: 1.2, last: null };
}

export function patienceFor(recipe, day, mods) {
  return Math.round((30 + recipe.parts.length * 13) * PACE[day].patience * mods.patience);
}

function pickRecipe(game) {
  const menu = unlockedRecipes(game.day);
  const fresh = new Set(newOnDay(game.day).map((r) => r.id));
  const weights = menu.map((r) => (r.id === game.orders.last ? 0.3 : 1) * (fresh.has(r.id) ? 1.8 : 1));
  let roll = game.rng.next() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < menu.length; i += 1) {
    roll -= weights[i];
    if (roll <= 0) return menu[i];
  }
  return menu[menu.length - 1];
}

export function addOrder(game, recipe, left = null) {
  const o = game.orders;
  const patience = patienceFor(recipe, game.day, game.mods);
  const order = { id: o.nextId, recipe, patience, left: left ?? patience, born: game.clock };
  o.nextId += 1;
  o.last = recipe.id;
  o.list.push(order);
  game.events.push({ type: 'order', text: recipe.name });
  return order;
}

export function tickOrders(game, dt) {
  const o = game.orders;
  const pace = PACE[game.day];
  for (const order of o.list) order.left -= dt;
  const expired = o.list.filter((order) => order.left <= 0);
  for (const order of expired) {
    o.list.splice(o.list.indexOf(order), 1);
    game.stars -= 1;
    game.combo = 0;
    game.dayStats.missed += 1;
    game.events.push({ type: 'miss', text: order.recipe.name });
  }
  if (game.time < 6) return;
  o.spawnIn -= dt;
  if (o.list.length === 0 && o.spawnIn > 2.5) o.spawnIn = 2.5;
  if (o.spawnIn <= 0 && o.list.length < pace.max) {
    addOrder(game, pickRecipe(game));
    o.spawnIn = pace.every * game.rng.range(0.8, 1.15);
  }
}

/** Tickets the dish could fill, most urgent first. */
export function matchingOrders(game, parts) {
  return game.orders.list.filter((order) => sameParts(order.recipe.parts, parts)).sort((a, b) => a.left - b.left);
}

/** Serve a dish at the pass: pays, updates the rush and returns the result, or null when no ticket wants it. */
export function serveDish(game, parts) {
  const order = matchingOrders(game, parts)[0];
  if (!order) return null;
  game.orders.list.splice(game.orders.list.indexOf(order), 1);
  const frac = Math.max(0, order.left / order.patience);
  if (frac >= COMBO_KEEP) game.combo += 1;
  else game.combo = 0;
  game.bestCombo = Math.max(game.bestCombo, game.combo);
  const rush = game.combo >= RUSH_AT;
  const tip = Math.round(order.recipe.price * 0.6 * frac * game.mods.tips);
  const pay = Math.round((order.recipe.price + tip) * (rush ? RUSH_MULT : 1));
  game.coins += pay;
  game.dayStats.served += 1;
  game.dayStats.earned += pay;
  game.dayStats.tips += tip;
  let restored = false;
  if (game.combo > 0 && game.combo % RESTORE_EVERY === 0 && game.stars < MAX_STARS) {
    game.stars += 1;
    restored = true;
  }
  return { order, pay, tip, rush, restored };
}
