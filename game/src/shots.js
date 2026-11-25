// Staged screenshot moments behind ?shot=rush|lastcall|shop|title. Each one builds a real game
// state with the game's own functions (startDay, addOrder, makeItem, chopStation, tickStations,
// stepGame) and freezes the clock, so the same URL always paints the same frame.
import { createGame, startDay, stepGame } from './service.js';
import { addOrder } from './orders.js';
import { recipeById } from './recipes.js';
import { makeItem } from './ingredients.js';
import { stationById } from './kitchen-layout.js';
import { chopStation, tickStations } from './stations.js';
import { burst, stepParticles } from './particles.js';

const IDLE = { dx: 0, dy: 0, use: false, hold: false, click: null };

function order(game, id, fraction) {
  const o = addOrder(game, recipeById(id));
  o.left = o.patience * fraction;
  o.born = game.clock - 10;
  return o;
}

function prepared(id, steps) {
  const item = makeItem(id);
  item.done = steps;
  return item;
}

/** Put an item on a cooker and let it cook for `seconds` with the real cooker rules. */
function cookFor(game, stationId, item, seconds) {
  const st = stationById(game.stations, stationId);
  const slot = { item, t: 0, cooked: false };
  const cookers = game.stations.filter((s) => s.kind === 'cooker');
  const saved = cookers.map((s) => s.slots);
  for (const s of cookers) s.slots = s === st ? [slot] : [];
  for (let i = 0; i < seconds * 60; i += 1) tickStations(game, 1 / 60);
  cookers.forEach((s, i) => { s.slots = saved[i]; });
  st.slots.push(slot);
}

function settle(game, particles, seconds) {
  for (let i = 0; i < seconds * 60; i += 1) {
    for (const ev of game.events) burst(particles, ev);
    game.events = [];
    stepParticles(particles, 1 / 60);
  }
}

function stageRush(game, particles) {
  game.day = 3;
  startDay(game);
  game.clock = 40;
  game.toast = null;
  game.coins = 186;
  game.stars = 4;
  game.combo = 3;
  game.bestCombo = 4;
  order(game, 'garden-rice', 0.84);
  order(game, 'pork-bao', 0.42);
  order(game, 'shrimp-rice', 0.63);
  order(game, 'ember-ramen', 0.18);
  order(game, 'forest-bao', 0.95);
  game.time = 84;
  const b1 = stationById(game.stations, 'board-1');
  b1.item = makeItem('pork');
  for (let i = 0; i < 4; i += 1) chopStation(game, b1, 0.1, true);
  const b2 = stationById(game.stations, 'board-2');
  b2.item = makeItem('chili');
  chopStation(game, b2, 0.05, true);
  cookFor(game, 'grill', makeItem('egg'), 9.5);
  cookFor(game, 'grill', makeItem('shrimp'), 3.6);
  cookFor(game, 'pot', makeItem('noodles'), 4.2);
  cookFor(game, 'steamer', makeItem('bao'), 2.4);
  stationById(game.stations, 'plate-1').parts = ['rice', 'egg'];
  stationById(game.stations, 'plate-2').parts = ['bao', 'pork', 'scallion'];
  stationById(game.stations, 'shelf-1').item = prepared('scallion', 1);
  stationById(game.stations, 'shelf-2').item = prepared('mushroom', 1);
  game.chef.x = 520;
  game.chef.y = 362;
  game.chef.faceX = -0.3;
  game.chef.faceY = 0.95;
  game.chef.held = prepared('scallion', 1);
  game.events = [];
  game.events.push({ type: 'chop', x: b1.x + 64, y: b1.y + 44, id: 'pork' });
  game.events.push({ type: 'serve', x: 1211, y: 330, text: '+31', rush: true, restored: false });
  settle(game, particles, 0.35);
  stepGame(game, 1 / 60, IDLE);
  game.chef.chopping = 0.15;
  game.focus = b1;
}

function stageLastCall(game, particles) {
  game.day = 5;
  ['burner', 'pot', 'cleaver', 'tea'].forEach((u) => game.owned.add(u));
  startDay(game);
  game.clock = 77;
  game.toast = { text: 'Last orders! The rush is on', t: 2 };
  game.coins = 412;
  game.stars = 2;
  game.combo = 5;
  game.bestCombo = 7;
  order(game, 'lantern-special', 0.31);
  order(game, 'firecracker-bao', 0.9);
  order(game, 'ember-ramen', 0.12);
  order(game, 'garden-rice', 0.55);
  order(game, 'firecracker-bao', 0.72);
  game.time = 24;
  cookFor(game, 'grill', prepared('pork', 1), 4.5);
  cookFor(game, 'grill', prepared('mushroom', 1), 11.8);
  cookFor(game, 'grill', makeItem('shrimp'), 17);
  cookFor(game, 'pot', makeItem('noodles'), 7.6);
  cookFor(game, 'pot', makeItem('noodles'), 2.2);
  cookFor(game, 'steamer', makeItem('bao'), 6.6);
  stationById(game.stations, 'plate-1').parts = ['noodles', 'pork', 'egg', 'bokchoy'];
  stationById(game.stations, 'plate-2').parts = ['bao', 'shrimp', 'chili'];
  const b1 = stationById(game.stations, 'board-1');
  b1.item = makeItem('chili');
  for (let i = 0; i < 3; i += 1) chopStation(game, b1, 0.1, true);
  stationById(game.stations, 'board-2').item = makeItem('bokchoy');
  stationById(game.stations, 'shelf-3').item = prepared('egg', 1);
  game.chef.x = 418;
  game.chef.y = 532;
  game.chef.faceX = 0;
  game.chef.faceY = -1;
  game.chef.held = null;
  game.events = [];
  for (let i = 0; i < 3; i += 1) game.events.push({ type: 'chop', x: b1.x + 60, y: b1.y + 44, id: 'chili' });
  game.events.push({ type: 'burnt', x: 900, y: 160 });
  settle(game, particles, 0.3);
  stepGame(game, 1 / 60, IDLE);
  game.chef.chopping = 0.15;
}

function stageShop(game) {
  game.day = 2;
  startDay(game);
  game.clock = 12;
  game.coins = 148;
  game.stars = 4;
  game.bestCombo = 4;
  game.owned.add('cleaver');
  game.history.push({ day: 1, served: 7, missed: 0, earned: 121, tips: 34, burnt: 1, wasted: 1, left: 1 });
  game.history.push({ day: 2, served: 9, missed: 1, earned: 168, tips: 41, burnt: 2, wasted: 1, left: 2 });
  game.screen = 'shop';
}

function stageTitle(game) {
  startDay(game);
  game.clock = 3;
  game.screen = 'title';
  order(game, 'pork-bao', 0.7);
  order(game, 'scallion-noodles', 0.4);
}

/** Build the named scene into a fresh game; returns it. */
export function stageShot(name, seed, particles) {
  const game = createGame(seed);
  if (name === 'rush') stageRush(game, particles);
  else if (name === 'lastcall') stageLastCall(game, particles);
  else if (name === 'shop') stageShop(game);
  else stageTitle(game);
  game.events = [];
  return game;
}
