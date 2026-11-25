// Little bits of feedback that answer each action at once: chop flecks, sizzle sparks, smoke from
// burnt food, sparkles and a floating "+28" when a dish is served. Driven by game events, using
// their own seeded random so staged screenshots repeat exactly.
import { createRandom } from './random.js';
import { FONT } from './draw-kitchen.js';

const FLECK = { scallion: '#5cc24f', chili: '#e0281b', bokchoy: '#2f8f3a', mushroom: '#8a5a30', pork: '#e47a88' };

export function createParticles(seed = 7) {
  return { list: [], rng: createRandom(seed) };
}

function add(p, x, y, vx, vy, life, color, size, kind = 'dot', text = '') {
  p.list.push({ x, y, vx, vy, life, max: life, color, size, kind, text });
}

/** Turn game events into particles. */
export function burst(p, ev) {
  const r = p.rng;
  switch (ev.type) {
    case 'chop':
      for (let i = 0; i < 6; i += 1) add(p, ev.x + r.range(-20, 20), ev.y, r.range(-90, 90), r.range(-160, -60), 0.5, FLECK[ev.id] ?? '#fff', r.range(2, 4));
      break;
    case 'chopped':
      add(p, ev.x, ev.y - 30, 0, -40, 0.9, '#9dffa6', 16, 'text', 'CHOPPED!');
      break;
    case 'sizzle':
    case 'cooked':
      for (let i = 0; i < 8; i += 1) add(p, ev.x + r.range(-30, 30), ev.y + 10, r.range(-40, 40), r.range(-120, -40), 0.6, '#ffcf5a', r.range(1.5, 3));
      if (ev.type === 'cooked') add(p, ev.x, ev.y - 10, 0, -40, 0.9, '#ffe38a', 15, 'text', 'DONE!');
      break;
    case 'burnt':
      for (let i = 0; i < 10; i += 1) add(p, ev.x + r.range(-20, 20), ev.y, r.range(-20, 20), r.range(-60, -20), 1.4, 'rgba(60,60,60,0.7)', r.range(6, 12));
      add(p, ev.x, ev.y - 10, 0, -30, 1.1, '#ff5a3a', 16, 'text', 'BURNT!');
      break;
    case 'ready':
      for (let i = 0; i < 12; i += 1) add(p, ev.x, ev.y, r.range(-120, 120), r.range(-160, -20), 0.8, '#ffe38a', r.range(2, 4), 'star');
      break;
    case 'serve':
      for (let i = 0; i < 22; i += 1) add(p, ev.x, ev.y, r.range(-200, 120), r.range(-220, 40), 1, i % 2 ? '#ffd36a' : '#ff8ac0', r.range(2.5, 5), 'star');
      add(p, ev.x - 60, ev.y - 20, 0, -50, 1.3, '#ffe36a', 26, 'text', `${ev.text} coins`);
      if (ev.rush) add(p, ev.x - 60, ev.y + 14, 0, -40, 1.3, '#ff6aa0', 18, 'text', 'RUSH!');
      if (ev.restored) add(p, ev.x - 60, ev.y + 40, 0, -40, 1.5, '#ffb04a', 18, 'text', '+1 STAR');
      break;
    case 'miss':
      add(p, 440, 140, 0, 30, 1.6, '#ff5a3a', 22, 'text', `${ev.text} walked out! -1 star`);
      break;
    case 'nope':
      add(p, ev.x, ev.y, 0, -30, 0.6, '#ff9a7a', 22, 'text', '✕');
      break;
    default:
      break;
  }
}

export function stepParticles(p, dt) {
  for (const q of p.list) {
    q.life -= dt;
    q.x += q.vx * dt;
    q.y += q.vy * dt;
    if (q.kind !== 'text') q.vy += 300 * dt;
  }
  p.list = p.list.filter((q) => q.life > 0);
}

export function drawParticles(ctx, p) {
  for (const q of p.list) {
    const a = Math.min(1, q.life / q.max * 1.6);
    ctx.globalAlpha = a;
    if (q.kind === 'text') {
      ctx.font = `900 ${q.size}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(30,8,4,0.9)';
      ctx.strokeText(q.text, q.x, q.y);
      ctx.fillStyle = q.color;
      ctx.fillText(q.text, q.x, q.y);
    } else if (q.kind === 'star') {
      ctx.fillStyle = q.color;
      ctx.beginPath();
      for (let i = 0; i < 8; i += 1) {
        const r = i % 2 ? q.size * 0.4 : q.size;
        const ang = (i / 8) * Math.PI * 2;
        ctx.lineTo(q.x + Math.cos(ang) * r, q.y + Math.sin(ang) * r);
      }
      ctx.fill();
    } else {
      ctx.fillStyle = q.color;
      ctx.beginPath();
      ctx.arc(q.x, q.y, q.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
