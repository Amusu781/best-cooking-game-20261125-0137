// One night of service and the run around it: the game state, the screens it moves through
// (title, play, paused, shop between days, closed on losing every star, won after day 5), the
// fixed step that moves the chef, chops, cooks and ages tickets, and how a day ends.
import { CHEF, DAY_SECONDS, LAST_DAY, START_STARS } from './config.js';
import { createRandom } from './random.js';
import { createStations, stationById } from './kitchen-layout.js';
import { createChef, moveChef, nearestStation, walkToStation } from './chef.js';
import { chopStation, tickStations, useStation } from './stations.js';
import { createOrders, tickOrders } from './orders.js';
import { modifiers } from './upgrades.js';
import { nextStep } from './ingredients.js';

function blankStats() {
  return { served: 0, missed: 0, earned: 0, tips: 0, burnt: 0, wasted: 0 };
}

export function createGame(seed) {
  const owned = new Set();
  const mods = modifiers(owned);
  return {
    seed,
    rng: createRandom(seed),
    screen: 'title',
    day: 1,
    time: DAY_SECONDS,
    clock: 0,
    coins: 0,
    stars: START_STARS,
    combo: 0,
    bestCombo: 0,
    owned,
    mods,
    stations: createStations(mods),
    chef: createChef(),
    orders: createOrders(),
    events: [],
    toast: null,
    focus: null,
    dayStats: blankStats(),
    history: [],
  };
}

export function startDay(game) {
  game.mods = modifiers(game.owned);
  game.stations = createStations(game.mods);
  game.chef = createChef();
  game.orders = createOrders();
  game.time = DAY_SECONDS;
  game.combo = 0;
  game.dayStats = blankStats();
  game.toast = { text: `Day ${game.day}: the lanterns are lit`, t: 3 };
  game.screen = 'play';
  game.events.push({ type: 'open' });
}

export function newRun(game) {
  const fresh = createGame(game.seed + 1);
  Object.assign(game, fresh);
  startDay(game);
}

function endDay(game) {
  game.history.push({ day: game.day, ...game.dayStats, left: game.orders.list.length });
  game.screen = game.day >= LAST_DAY ? 'win' : 'shop';
  game.events.push({ type: game.screen === 'win' ? 'win' : 'close' });
}

export function nextDay(game) {
  if (game.screen !== 'shop') return;
  game.day += 1;
  startDay(game);
}

/**
 * One fixed step of play. `intent` = { dx, dy, use, hold, click } where use is a fresh press,
 * hold is the use key or mouse held down, and click is a station id the mouse chose.
 */
export function stepGame(game, dt, intent) {
  game.clock += dt;
  if (game.toast) {
    game.toast.t -= dt;
    if (game.toast.t <= 0) game.toast = null;
  }
  if (game.screen !== 'play') return;
  const chef = game.chef;
  const speed = CHEF.speed * game.mods.speed;
  if (intent.click) chef.target = intent.click;
  if (Math.hypot(intent.dx, intent.dy) > 0.01) {
    chef.target = null;
    moveChef(chef, intent.dx, intent.dy, dt, speed);
  } else if (chef.target) {
    const st = stationById(game.stations, chef.target);
    if (st && walkToStation(chef, st, dt, speed)) {
      chef.target = null;
      useStation(game, st);
    }
  } else {
    chef.moving = false;
  }
  game.focus = nearestStation(chef, game.stations);
  if (intent.use && game.focus && !intent.click) useStation(game, game.focus);
  chef.chopping = Math.max(0, chef.chopping - dt);
  if (intent.hold && !chef.target && game.focus && game.focus.kind === 'board' && game.focus.item && nextStep(game.focus.item) === 'chop') {
    chopStation(game, game.focus, dt);
    chef.chopping = 0.15;
  }
  tickStations(game, dt);
  tickOrders(game, dt);
  game.time -= dt;
  if (game.stars <= 0) {
    game.stars = 0;
    game.history.push({ day: game.day, ...game.dayStats, left: game.orders.list.length });
    game.screen = 'over';
    game.events.push({ type: 'lose' });
  } else if (game.time <= 0) {
    game.time = 0;
    endDay(game);
  }
}
