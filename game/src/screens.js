// Full screens over the stall: the title with the menu book of all eight dishes and how each is
// prepped, the end-of-day ledger beside the upgrade shop, pause, the closed-down screen and the
// win screen. Also where the shop's cards and button sit, for mouse clicks.
import { LAST_DAY } from './config.js';
import { INGREDIENTS } from './ingredients.js';
import { RECIPES, newOnDay } from './recipes.js';
import { UPGRADES } from './upgrades.js';
import { drawDish, drawIngredient, drawSteam } from './draw-food.js';
import { label } from './draw-kitchen.js';

const TAU = Math.PI * 2;

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  rr(ctx, x + 6, y + 8, w, h, 16);
  ctx.fill();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#3a1430');
  g.addColorStop(1, '#1e0a1a');
  ctx.fillStyle = g;
  rr(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 3;
  rr(ctx, x + 2, y + 2, w - 4, h - 4, 14);
  ctx.stroke();
}

function dim(ctx, a = 0.62) {
  ctx.fillStyle = `rgba(12,4,14,${a})`;
  ctx.fillRect(0, 0, 1280, 720);
}

function hangingLanterns(ctx, t) {
  ctx.strokeStyle = 'rgba(255,210,140,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 18);
  for (let x = 0; x <= 1280; x += 40) ctx.lineTo(x, 18 + Math.sin(x / 160) * 14);
  ctx.stroke();
  for (let i = 0; i < 14; i += 1) {
    const x = 40 + i * 92;
    const y = 30 + Math.sin(x / 160) * 14;
    const g = ctx.createRadialGradient(x, y + 12, 2, x, y + 12, 34);
    g.addColorStop(0, 'rgba(255,120,60,0.55)');
    g.addColorStop(1, 'rgba(255,120,60,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 34, y - 22, 68, 68);
    ctx.fillStyle = i % 3 === 1 ? '#f0b030' : '#e3302a';
    ctx.beginPath();
    ctx.ellipse(x, y + 12, 11 + Math.sin(t + i) * 0.4, 14, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#2a1206';
    ctx.fillRect(x - 6, y - 4, 12, 3);
  }
}

function prepPath(id) {
  const steps = INGREDIENTS[id].steps.map((s) => ({ chop: 'chop', grill: 'grill', pot: 'boil', steam: 'steam' })[s]);
  return steps.length ? steps.join('+') : 'scoop';
}

export function drawTitle(ctx, game) {
  const t = game.clock;
  dim(ctx, 0.7);
  hangingLanterns(ctx, t);
  // logo
  ctx.save();
  ctx.shadowColor = '#ff4fa0';
  ctx.shadowBlur = 24;
  label(ctx, 'LANTERN ALLEY', 300, 130, 58, '#ffd36a', 'center', '900');
  ctx.shadowBlur = 0;
  ctx.restore();
  label(ctx, 'K I T C H E N', 300, 180, 30, '#9fe8ff', 'center', '900');
  label(ctx, 'A night-market noodle & bao stall', 300, 216, 16, '#f3d9b0', 'center', '600');
  drawDish(ctx, ['noodles', 'pork', 'egg', 'bokchoy', 'chili'], 200, 300, 1.7, t);
  drawSteam(ctx, 200, 262, 1.6, t, 0.2, 0.4);
  drawDish(ctx, ['bao', 'pork', 'scallion'], 400, 310, 1.5, t);
  drawSteam(ctx, 400, 276, 1.4, t, 0.6, 0.4);
  const lines = [
    'Five nights of service, 3:00 each. Fill tickets before guests walk out.',
    'WASD / arrows: walk     E or Space: pick up, put down, use',
    'Hold E (or hold the mouse) on a board to chop',
    'Click any station: the chef walks there and uses it',
    'P / Esc: pause     M: mute',
  ];
  lines.forEach((ln, i) => label(ctx, ln, 300, 396 + i * 26, i === 0 ? 14 : 13.5, i === 0 ? '#ffe7b8' : '#d8c0a0', 'center', i === 0 ? '700' : '600'));
  const pulse = 0.75 + Math.sin(t * 4) * 0.25;
  ctx.fillStyle = `rgba(255,196,60,${pulse})`;
  rr(ctx, 120, 548, 360, 54, 27);
  ctx.fill();
  label(ctx, 'PRESS ENTER OR CLICK TO OPEN THE STALL', 300, 575, 15, '#3a1604', 'center', '900');
  label(ctx, game.best ? `Best night: ${game.best} coins` : 'Win: finish day 5 with a star still lit', 300, 628, 13, '#c8a880');

  // menu book
  panel(ctx, 600, 70, 650, 600);
  label(ctx, 'MENU BOOK', 925, 104, 26, '#ffd36a', 'center', '900');
  label(ctx, 'every dish, what goes in it, and how each part is prepped', 925, 130, 12, '#d8c0a0', 'center', '600');
  RECIPES.forEach((r, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 620 + col * 318;
    const y = 150 + row * 128;
    ctx.fillStyle = 'rgba(255,240,210,0.07)';
    rr(ctx, x, y, 306, 118, 12);
    ctx.fill();
    drawDish(ctx, r.parts, x + 52, y + 62, 0.95, t);
    label(ctx, r.name, x + 104, y + 20, 15, '#fff1cc', 'left', '800');
    label(ctx, `${r.price} coins · day ${r.day}`, x + 104, y + 40, 11.5, '#ffc46a', 'left', '700');
    r.parts.forEach((p, k) => {
      const px = x + 120 + k * 38;
      drawIngredient(ctx, p, 'raw', px, y + 72, 0.5, t);
      label(ctx, prepPath(p), px, y + 98, 8.5, '#bfe6ff', 'center', '700');
    });
  });
}

export const SHOP = {
  cards: UPGRADES.map((u, i) => ({ id: u.id, x: 470 + (i % 4) * 196, y: 168 + Math.floor(i / 4) * 196, w: 184, h: 182 })),
  next: { x: 470, y: 572, w: 772, h: 64 },
};

function upgradeIcon(ctx, id, x, y, t) {
  ctx.save();
  ctx.translate(x, y);
  switch (id) {
    case 'cleaver': {
      const g = ctx.createLinearGradient(-20, 0, 20, 0);
      g.addColorStop(0, '#9aa6b0');
      g.addColorStop(0.5, '#f4f8fb');
      g.addColorStop(1, '#8a96a0');
      ctx.fillStyle = g;
      rr(ctx, -22, -18, 36, 28, 3);
      ctx.fill();
      ctx.fillStyle = '#5a2e14';
      rr(ctx, 14, -8, 20, 8, 3);
      ctx.fill();
      ctx.fillStyle = '#9fe8ff';
      ctx.beginPath();
      ctx.arc(-14, -11, 3, 0, TAU);
      ctx.fill();
      break;
    }
    case 'burner':
    case 'coals': {
      ctx.fillStyle = '#211a18';
      rr(ctx, -26, -18, 52, 36, 6);
      ctx.fill();
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
      glow.addColorStop(0, id === 'coals' ? '#ff7a3a' : '#ffd36a');
      glow.addColorStop(1, '#8a1a0a');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, TAU);
      ctx.fill();
      if (id === 'burner') label(ctx, '+1', 0, 1, 14, '#2a0a04', 'center', '900');
      break;
    }
    case 'pot':
      drawIngredient(ctx, 'noodles', 'raw', -14, 0, 0.8, t);
      drawIngredient(ctx, 'noodles', 'raw', 14, 0, 0.8, t);
      break;
    case 'steamer':
      drawIngredient(ctx, 'bao', 'cooked', -14, 0, 0.8, t);
      drawIngredient(ctx, 'bao', 'cooked', 14, 0, 0.8, t);
      break;
    case 'tea':
      ctx.fillStyle = '#2f5f9e';
      ctx.beginPath();
      ctx.ellipse(0, 6, 20, 14, 0, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#c99a3a';
      ctx.beginPath();
      ctx.ellipse(0, 4, 20, 5, 0, 0, TAU);
      ctx.fill();
      drawSteam(ctx, 0, -6, 0.7, t, 0.4, 0.6);
      break;
    case 'bell':
      ctx.fillStyle = '#ffcf5a';
      ctx.beginPath();
      ctx.arc(0, 6, 20, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#b07a28';
      ctx.fillRect(-24, 6, 48, 6);
      ctx.fillRect(-3, -20, 6, 8);
      break;
    case 'slippers':
      ctx.fillStyle = '#9fe8ff';
      ctx.beginPath();
      ctx.ellipse(-10, 0, 9, 18, -0.2, 0, TAU);
      ctx.ellipse(12, 2, 9, 18, 0.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-24, -14, 6, 0, TAU);
      ctx.arc(-16, -18, 7, 0, TAU);
      ctx.fill();
      break;
    default:
      break;
  }
  ctx.restore();
}

export function drawShop(ctx, game) {
  const t = game.clock;
  dim(ctx, 0.72);
  const day = game.history[game.history.length - 1] ?? { served: 0, missed: 0, earned: 0, tips: 0, burnt: 0, wasted: 0 };
  panel(ctx, 30, 40, 410, 640);
  label(ctx, `DAY ${game.day} CLOSED`, 235, 82, 30, '#ffd36a', 'center', '900');
  label(ctx, 'the lanterns dim, the ledger comes out', 235, 112, 13, '#d8c0a0', 'center', '600');
  const rows = [
    ['Dishes served', `${day.served}`],
    ['Guests walked out', `${day.missed}`],
    ['Tips earned', `${day.tips} coins`],
    ['Earned tonight', `${day.earned} coins`],
    ['Burnt on the grill', `${day.burnt}`],
    ['Stars still lit', `${game.stars} / 5`],
    ['Best rush', `x${game.bestCombo}`],
  ];
  rows.forEach(([k, v], i) => {
    const y = 156 + i * 40;
    ctx.fillStyle = i % 2 ? 'rgba(255,240,210,0.04)' : 'rgba(255,240,210,0.09)';
    rr(ctx, 54, y - 16, 362, 32, 8);
    ctx.fill();
    label(ctx, k, 68, y, 16, '#f3d9b0', 'left', '600');
    label(ctx, v, 402, y, 17, '#fff1cc', 'right', '900');
  });
  const fresh = newOnDay(game.day + 1);
  label(ctx, `NEW ON THE MENU FOR DAY ${game.day + 1}`, 235, 456, 14, '#9fe8ff', 'center', '900');
  fresh.forEach((r, i) => {
    const x = fresh.length === 1 ? 235 : 140 + i * 190;
    drawDish(ctx, r.parts, x, 520, 1.05, t);
    label(ctx, r.name, x, 566, 13, '#fff1cc', 'center', '800');
  });
  label(ctx, `Guests arrive faster on day ${game.day + 1}.`, 235, 640, 13, '#ff9a7a', 'center', '700');

  panel(ctx, 456, 40, 800, 640);
  label(ctx, 'NIGHT MARKET SUPPLY', 856, 82, 28, '#ffd36a', 'center', '900');
  label(ctx, `${game.coins} coins to spend   ·   press 1-8 or click a card`, 856, 118, 15, '#ffe7b8', 'center', '700');
  SHOP.cards.forEach((c, i) => {
    const up = UPGRADES[i];
    const owned = game.owned.has(up.id);
    const afford = game.coins >= up.cost;
    ctx.fillStyle = owned ? 'rgba(80,170,90,0.22)' : afford ? 'rgba(255,230,180,0.12)' : 'rgba(255,255,255,0.04)';
    rr(ctx, c.x, c.y, c.w, c.h, 12);
    ctx.fill();
    ctx.strokeStyle = owned ? '#6cd27c' : afford ? '#d9a441' : 'rgba(200,170,120,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    label(ctx, `${i + 1}`, c.x + 16, c.y + 16, 13, '#d9a441', 'center', '900');
    upgradeIcon(ctx, up.id, c.x + c.w / 2, c.y + 56, t);
    label(ctx, up.name, c.x + c.w / 2, c.y + 104, 14, '#fff1cc', 'center', '800');
    label(ctx, up.text, c.x + c.w / 2, c.y + 126, 12, '#d8c0a0', 'center', '600');
    label(ctx, owned ? 'OWNED' : `${up.cost} coins`, c.x + c.w / 2, c.y + 158, 16, owned ? '#7cf08c' : afford ? '#ffd36a' : '#8a7a6a', 'center', '900');
  });
  const n = SHOP.next;
  ctx.fillStyle = '#ffc43c';
  rr(ctx, n.x, n.y, n.w, n.h, 32);
  ctx.fill();
  label(ctx, `OPEN DAY ${game.day + 1} OF ${LAST_DAY}   ▶   (Enter)`, n.x + n.w / 2, n.y + n.h / 2, 20, '#3a1604', 'center', '900');
}

export function drawPause(ctx) {
  dim(ctx, 0.55);
  panel(ctx, 440, 250, 400, 200);
  label(ctx, 'PAUSED', 640, 320, 40, '#ffd36a', 'center', '900');
  label(ctx, 'P, Esc or Enter to get back to the wok', 640, 380, 15, '#f3d9b0');
}

function totals(game) {
  return game.history.reduce((a, d) => ({ served: a.served + d.served, missed: a.missed + d.missed, earned: a.earned + d.earned }), { served: 0, missed: 0, earned: 0 });
}

export function drawEnd(ctx, game, won) {
  const t = game.clock;
  dim(ctx, 0.72);
  hangingLanterns(ctx, t);
  panel(ctx, 340, 120, 600, 500);
  label(ctx, won ? 'THE ALLEY LOVES YOU' : 'THE LANTERNS WENT OUT', 640, 180, 34, won ? '#ffd36a' : '#ff7a5a', 'center', '900');
  label(ctx, won ? 'Five nights served. Your stall is the talk of the market.' : `Every star lost on day ${game.day}. The stall closes for now.`, 640, 218, 15, '#f3d9b0');
  const sum = totals(game);
  drawDish(ctx, ['noodles', 'pork', 'egg', 'bokchoy', 'chili'], 640, 300, 1.6, t);
  const rows = [['Dishes served', sum.served], ['Guests walked out', sum.missed], ['Coins earned', sum.earned], ['Best rush', `x${game.bestCombo}`]];
  rows.forEach(([k, v], i) => {
    label(ctx, k, 470, 380 + i * 36, 17, '#f3d9b0', 'left', '600');
    label(ctx, `${v}`, 810, 380 + i * 36, 18, '#fff1cc', 'right', '900');
  });
  label(ctx, 'Press Enter or click to light the lanterns again', 640, 580, 15, '#ffd36a', 'center', '800');
}
