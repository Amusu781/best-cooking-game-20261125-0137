// Boot and the loop for Lantern Alley Kitchen. Input is read every frame, the game advances in
// fixed 1/60 s steps, events feed the particles and the synthesised sounds, and the renderer
// paints. ?seed=N fixes the night's orders. ?shot=rush|lastcall|shop|title stages a scene
// instead, paints it twice and sets window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createGame, newRun, nextDay, startDay, stepGame } from './service.js';
import { stationAtPoint } from './kitchen-layout.js';
import { buyUpgrade, UPGRADES } from './upgrades.js';
import { createInput } from './input.js';
import { createRenderer } from './render.js';
import { createParticles, burst, stepParticles } from './particles.js';
import { createAudio } from './audio.js';
import { SHOP } from './screens.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 1e9);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const renderer = createRenderer(canvas);

function readBest() {
  try { return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0; } catch { return 0; }
}
function saveBest(v) {
  try { window.localStorage.setItem(BEST_KEY, String(v)); } catch { /* storage off: best lasts this visit */ }
}

function inside(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

function runShot(name) {
  const particles = createParticles(3);
  const game = stageShot(name, Number.isInteger(seedParam) ? seedParam : 1, particles);
  let painted = 0;
  function paint() {
    renderer.draw(game, particles);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const game = createGame(seed);
  game.best = readBest();
  const particles = createParticles(seed);
  const audio = createAudio();
  const input = createInput(canvas, renderer.toLogical);
  window.__game = game;
  let acc = 0;
  let last = performance.now();
  let lastTick = 99;
  let pendingUse = false;
  let pendingClick = null;

  const announce = (m) => { status.textContent = m; };

  function confirm() {
    if (game.screen === 'title') startDay(game);
    else if (game.screen === 'shop') nextDay(game);
    else if (game.screen === 'pause') game.screen = 'play';
    else if (game.screen === 'over' || game.screen === 'win') {
      const best = game.best;
      newRun(game);
      game.best = best;
      game.screen = 'title';
    }
  }

  function handle() {
    const presses = input.takePresses();
    const clicks = input.takeClicks();
    let use = false;
    let click = null;
    for (const p of presses) {
      if (p === 'mute') audio.toggle();
      else if (p === 'pause') {
        if (game.screen === 'play') game.screen = 'pause';
        else if (game.screen === 'pause') game.screen = 'play';
      } else if (p === 'confirm') confirm();
      else if (p === 'use') {
        if (game.screen === 'play') use = true;
        else if (game.screen === 'title' || game.screen === 'over' || game.screen === 'win') confirm();
      } else if (p.startsWith('buy') && game.screen === 'shop') {
        const up = UPGRADES[Number(p.slice(3)) - 1];
        if (up) buyUpgrade(game, up.id);
      }
    }
    for (const c of clicks) {
      audio.unlock();
      if (game.screen === 'play') {
        const st = stationAtPoint(game.stations, c.x, c.y);
        if (st) click = st.id;
      } else if (game.screen === 'shop') {
        const card = SHOP.cards.find((k) => inside(c, k));
        if (card) buyUpgrade(game, card.id);
        else if (inside(c, SHOP.next)) nextDay(game);
      } else confirm();
    }
    if (presses.length) audio.unlock();
    return { use, click };
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    acc += dt;
    const before = game.screen;
    const fresh = handle();
    pendingUse = pendingUse || fresh.use;
    pendingClick = fresh.click ?? pendingClick;
    // a press or click waits for the next fixed step, so a fast frame never swallows it
    while (acc >= STEP) {
      const { dx, dy } = input.direction();
      stepGame(game, STEP, { dx, dy, use: pendingUse, hold: input.holding(), click: pendingClick });
      pendingUse = false;
      pendingClick = null;
      acc -= STEP;
    }
    if (game.screen !== 'play' && game.screen !== before) {
      const earned = game.history.reduce((a, d) => a + d.earned, 0);
      if (earned > game.best) { game.best = earned; saveBest(earned); }
    }
    if (game.screen === 'play' && game.time < 10 && Math.ceil(game.time) !== lastTick) {
      lastTick = Math.ceil(game.time);
      audio.play({ type: 'tick' });
    }
    for (const ev of game.events) {
      burst(particles, ev);
      audio.play(ev);
      if (ev.type === 'serve') announce(`Served ${ev.name}. ${ev.text} coins.`);
      else if (ev.type === 'miss') announce(`${ev.text} walked out.`);
    }
    game.events = [];
    stepParticles(particles, dt);
    renderer.draw(game, particles);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.screen === 'play') game.screen = 'pause';
  });
  announce('Lantern Alley Kitchen. Press Enter or click to open the stall.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
