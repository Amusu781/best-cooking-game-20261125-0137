// The top band the player reads at a glance: the ORDERS rail of paper tickets (dish picture,
// ingredients with how each is prepped, a draining patience bar), the service TIMER dial, the day,
// coins, five lantern stars and the RUSH meter; plus the hint toast and the controls strip.
import { DAY_SECONDS, LAST_DAY, MAX_STARS, RUSH_AT } from './config.js';
import { INGREDIENTS } from './ingredients.js';
import { drawDish, drawIngredient } from './draw-food.js';
import { label, ring, FONT } from './draw-kitchen.js';

const TAU = Math.PI * 2;
const PREP_MARK = { chop: 'CHOP', grill: 'GRILL', pot: 'BOIL', steam: 'STEAM' };

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function wrapName(name) {
  if (name.length <= 15) return [name];
  const words = name.split(' ');
  const half = Math.ceil(words.length / 2);
  return [words.slice(0, half).join(' '), words.slice(half).join(' ')];
}

function drawTicket(ctx, order, x, y, w, h, t, index) {
  const frac = Math.max(0, order.left / order.patience);
  const urgent = frac < 0.25;
  const shake = urgent ? Math.sin(t * 30 + index) * 1.5 : 0;
  const age = Math.min(1, (t - order.born) * 3);
  ctx.save();
  ctx.translate(x + shake, y - (1 - age) * 30);
  ctx.globalAlpha = Math.max(0.2, age);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  rr(ctx, 4, 6, w, h, 6);
  ctx.fill();
  const paper = ctx.createLinearGradient(0, 0, 0, h);
  paper.addColorStop(0, urgent ? '#ffd9cc' : '#fff6e0');
  paper.addColorStop(1, urgent ? '#f6b8a6' : '#f1e2bf');
  ctx.fillStyle = paper;
  rr(ctx, 0, 0, w, h, 6);
  ctx.fill();
  // clip
  ctx.fillStyle = '#c9a046';
  rr(ctx, w / 2 - 16, -6, 32, 10, 3);
  ctx.fill();
  ctx.fillStyle = '#7a1c14';
  ctx.fillRect(0, 8, 4, h - 16);
  label(ctx, `#${order.id}`, w - 8, 13, 10, '#9a6a3a', 'right');
  const lines = wrapName(order.recipe.name);
  lines.forEach((ln, i) => label(ctx, ln, 10, 14 + i * 14, 12.5, '#3a1608', 'left', '800'));
  drawDish(ctx, order.recipe.parts, 40, 60, 0.62, t);
  // ingredient chips with prep
  order.recipe.parts.forEach((p, i) => {
    const cx = 86 + (i % 3) * 22;
    const cy = 46 + Math.floor(i / 3) * 24;
    ctx.fillStyle = 'rgba(120,70,30,0.15)';
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, TAU);
    ctx.fill();
    const steps = INGREDIENTS[p].steps;
    const look = steps.length === 0 ? 'cooked' : steps.some((s) => s !== 'chop') ? 'cooked' : 'chopped';
    drawIngredient(ctx, p, look, cx, cy, 0.42, t);
    if (steps.length) {
      ctx.font = `800 6.5px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#7a1c14';
      ctx.fillText(PREP_MARK[steps[steps.length - 1]], cx, cy + 13);
    }
  });
  // patience bar
  const col = frac > 0.5 ? '#3fbf5a' : frac > 0.25 ? '#f0a020' : '#e8321e';
  ctx.fillStyle = 'rgba(60,30,10,0.25)';
  rr(ctx, 8, h - 16, w - 50, 9, 4);
  ctx.fill();
  ctx.fillStyle = col;
  rr(ctx, 8, h - 16, (w - 50) * frac, 9, 4);
  ctx.fill();
  label(ctx, `${Math.ceil(order.left)}s`, w - 22, h - 11.5, 11, urgent ? '#b0140a' : '#5a3010', 'center', '800');
  label(ctx, `${order.recipe.price}¢`, w - 10, 32, 10, '#2f7a32', 'right', '800');
  ctx.restore();
}

function drawLantern(ctx, x, y, lit, t) {
  if (lit) {
    const g = ctx.createRadialGradient(x, y, 2, x, y, 20);
    g.addColorStop(0, 'rgba(255,140,60,0.6)');
    g.addColorStop(1, 'rgba(255,140,60,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 20, y - 20, 40, 40);
  }
  ctx.fillStyle = lit ? '#e8322a' : '#4a2a2a';
  ctx.beginPath();
  ctx.ellipse(x, y, 10, 12, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = lit ? 'rgba(255,200,120,0.6)' : 'rgba(120,90,90,0.5)';
  ctx.lineWidth = 1;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.abs(i) * 6 + 2, 12, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.fillStyle = lit ? '#ffd36a' : '#5a4a3a';
  ctx.fillRect(x - 5, y - 15, 10, 3);
  ctx.fillRect(x - 5, y + 12, 10, 3);
  if (lit) {
    ctx.fillStyle = `rgba(255,240,180,${0.5 + Math.sin(t * 6 + x) * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(x - 3, y - 3, 2.5, 4, 0, 0, TAU);
    ctx.fill();
  }
}

export function drawHud(ctx, game) {
  const t = game.clock;
  const band = ctx.createLinearGradient(0, 0, 0, 132);
  band.addColorStop(0, '#2a0f24');
  band.addColorStop(1, '#170814');
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, 1280, 132);
  ctx.fillStyle = '#d9a441';
  ctx.fillRect(0, 129, 1280, 3);
  // ORDERS tab
  ctx.fillStyle = '#7a1c14';
  rr(ctx, 8, 10, 46, 112, 8);
  ctx.fill();
  ctx.save();
  ctx.translate(31, 66);
  ctx.rotate(-Math.PI / 2);
  label(ctx, 'ORDERS', 0, 0, 17, '#ffe3a0', 'center', '900');
  ctx.restore();
  // rail
  ctx.strokeStyle = '#a87a3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(60, 12);
  ctx.lineTo(880, 12);
  ctx.stroke();
  const list = game.orders.list;
  list.forEach((order, i) => drawTicket(ctx, order, 66 + i * 163, 16, 154, 108, t, i));
  if (list.length === 0 && game.screen === 'play') label(ctx, 'Waiting for guests...', 440, 66, 16, 'rgba(255,220,170,0.5)');

  // TIMER dial
  const frac = game.time / DAY_SECONDS;
  const late = game.time < 30;
  const tx = 952;
  const ty = 68;
  ctx.beginPath();
  ctx.arc(tx, ty, 52, 0, TAU);
  ctx.fillStyle = '#0e050c';
  ctx.fill();
  ring(ctx, tx, ty, 46, frac, late ? (Math.floor(t * 4) % 2 ? '#ff3b2a' : '#ffa040') : '#ffcf5a', 8);
  label(ctx, 'TIMER', tx, ty - 20, 11, '#d9b880', 'center', '800');
  label(ctx, formatTime(game.time), tx, ty + 6, late ? 30 : 28, late ? '#ff7a5a' : '#fff1cc', 'center', '900');
  // day, coins
  label(ctx, `DAY ${game.day} OF ${LAST_DAY}`, 1024, 26, 18, '#ffe3a0', 'left', '900');
  ctx.beginPath();
  ctx.arc(1036, 58, 11, 0, TAU);
  ctx.fillStyle = '#f5c242';
  ctx.fill();
  ctx.strokeStyle = '#9a6a14';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#9a6a14';
  ctx.fillRect(1033, 53, 6, 10);
  label(ctx, `${game.coins} coins`, 1054, 58, 18, '#ffd76a', 'left', '900');
  for (let i = 0; i < MAX_STARS; i += 1) drawLantern(ctx, 1036 + i * 26, 92, i < game.stars, t);
  label(ctx, 'STARS', 1172, 92, 11, '#d9b880', 'left', '800');
  // rush meter
  const rush = game.combo >= RUSH_AT;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  rr(ctx, 1024, 110, 236, 14, 7);
  ctx.fill();
  const fill = Math.min(1, game.combo / 5);
  const rg = ctx.createLinearGradient(1024, 0, 1260, 0);
  rg.addColorStop(0, '#ff8a2a');
  rg.addColorStop(1, '#ff2a6a');
  ctx.fillStyle = rg;
  rr(ctx, 1024, 110, 236 * fill, 14, 7);
  ctx.fill();
  label(ctx, rush ? `RUSH x${game.combo}  · PAY x1.25` : `RUSH ${game.combo}/${RUSH_AT}`, 1142, 117, 10.5, '#fff', 'center', '900');
}

export function drawToast(ctx, game) {
  if (!game.toast) return;
  const a = Math.min(1, game.toast.t * 2);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.font = `800 17px ${FONT}`;
  const w = ctx.measureText(game.toast.text).width + 40;
  ctx.fillStyle = 'rgba(20,8,14,0.88)';
  rr(ctx, 640 - w / 2, 560, w, 34, 17);
  ctx.fill();
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 2;
  ctx.stroke();
  label(ctx, game.toast.text, 640, 577, 17, '#ffe7b8');
  ctx.restore();
}

export function drawControlsStrip(ctx) {
  ctx.fillStyle = 'rgba(20,8,14,0.82)';
  rr(ctx, 22, 608, 102, 96, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(217,164,65,0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  const rows = ['WASD  walk', 'E / SPACE  use', 'HOLD E  chop', 'CLICK  go + use', 'P  pause'];
  rows.forEach((r, i) => label(ctx, r, 73, 622 + i * 17, 9.5, i === 2 ? '#9dffa6' : '#ffe3b0', 'center', '800'));
}
