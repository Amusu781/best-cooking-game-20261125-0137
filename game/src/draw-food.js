// Food art, all drawn with canvas paths and gradients: every ingredient in its raw, chopped,
// cooked and burnt looks, and finished dishes built in layers in their own vessel (a red lacquer
// noodle bowl with amber broth, a porcelain rice bowl, a bamboo bao basket).
import { lookOf } from './ingredients.js';

const TAU = Math.PI * 2;

function radial(ctx, x, y, r, inner, outer, fx = -0.35, fy = -0.4) {
  const g = ctx.createRadialGradient(x + r * fx, y + r * fy, r * 0.1, x, y, r);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  return g;
}

function ellipse(ctx, x, y, rx, ry, fill, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
}

function shine(ctx, x, y, rx, ry, alpha = 0.55, rot = -0.5) {
  ellipse(ctx, x, y, rx, ry, `rgba(255,255,255,${alpha})`, rot);
}

function shadow(ctx, x, y, rx, ry) {
  ellipse(ctx, x, y, rx, ry, 'rgba(20,8,4,0.28)');
}

// ---------- single ingredients ----------

function drawNoodles(ctx, look, s, t) {
  if (look === 'raw') {
    ctx.lineWidth = 2.4 * s;
    for (let i = 0; i < 7; i += 1) {
      ctx.strokeStyle = i % 2 ? '#f3d27a' : '#e2b452';
      ctx.beginPath();
      for (let k = 0; k <= 16; k += 1) {
        const a = (k / 16) * TAU * 1.6 + i;
        const r = (6 + i * 1.6) * s;
        ctx.lineTo(Math.cos(a) * r * 1.2, Math.sin(a) * r * 0.75);
      }
      ctx.stroke();
    }
    return;
  }
  const col = look === 'burnt' ? ['#5a4630', '#3a2c1e'] : ['#ffe39a', '#f0bf55'];
  ctx.lineWidth = 3 * s;
  ctx.lineCap = 'round';
  for (let i = 0; i < 9; i += 1) {
    ctx.strokeStyle = col[i % 2];
    ctx.beginPath();
    const off = i * 0.7;
    for (let k = 0; k <= 20; k += 1) {
      const x = (-16 + k * 1.6) * s;
      const y = (Math.sin(k * 0.9 + off + t * 0) * 3 + (i - 4) * 2.2) * s;
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawRice(ctx, look, s) {
  ctx.beginPath();
  ctx.ellipse(0, 2 * s, 17 * s, 11 * s, 0, Math.PI, 0);
  ctx.ellipse(0, 2 * s, 17 * s, 5 * s, 0, 0, Math.PI);
  ctx.fillStyle = radial(ctx, 0, 0, 18 * s, '#ffffff', '#e4ddcd');
  ctx.fill();
  ctx.fillStyle = 'rgba(190,180,160,0.7)';
  for (let i = 0; i < 18; i += 1) {
    const a = i * 2.39;
    const r = (i % 6) * 2.4 * s;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * r, -2 * s + Math.sin(a) * r * 0.5, 1.6 * s, 0.8 * s, a, 0, TAU);
    ctx.fill();
  }
}

function drawBao(ctx, look, s) {
  const burnt = look === 'burnt';
  const raw = look === 'raw';
  const outer = burnt ? '#4b3a2e' : raw ? '#e9dcc2' : '#fffaf0';
  const inner = burnt ? '#6b5444' : raw ? '#f5ead4' : '#ffffff';
  ctx.beginPath();
  ctx.ellipse(0, 0, 17 * s, 13 * s, 0, 0, TAU);
  ctx.fillStyle = radial(ctx, 0, 0, 17 * s, inner, outer);
  ctx.fill();
  ctx.strokeStyle = burnt ? '#2a1e16' : 'rgba(170,150,120,0.6)';
  ctx.lineWidth = 1.2 * s;
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * TAU;
    ctx.beginPath();
    ctx.moveTo(0, -3 * s);
    ctx.quadraticCurveTo(Math.cos(a + 0.4) * 8 * s, Math.sin(a + 0.4) * 6 * s - 3 * s, Math.cos(a) * 12 * s, Math.sin(a) * 9 * s - 2 * s);
    ctx.stroke();
  }
  if (!raw && !burnt) shine(ctx, -6 * s, -6 * s, 5 * s, 2.5 * s, 0.7);
}

function drawScallion(ctx, look, s) {
  if (look === 'raw') {
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i += 1) {
      ctx.strokeStyle = '#f4f2dc';
      ctx.lineWidth = 4 * s;
      ctx.beginPath();
      ctx.moveTo((-16 + i * 2) * s, (6 + i * 3 - 4) * s);
      ctx.lineTo((-4 + i * 2) * s, (2 + i * 3 - 4) * s);
      ctx.stroke();
      ctx.strokeStyle = i === 1 ? '#3f9b3a' : '#56b84a';
      ctx.beginPath();
      ctx.moveTo((-4 + i * 2) * s, (2 + i * 3 - 4) * s);
      ctx.lineTo((17 + i) * s, (-6 + i * 4 - 4) * s);
      ctx.stroke();
    }
    return;
  }
  const ring = look === 'burnt' ? '#38412c' : '#5cc24f';
  for (let i = 0; i < 9; i += 1) {
    const x = ((i * 37) % 26) - 13;
    const y = ((i * 23) % 14) - 7;
    ctx.beginPath();
    ctx.arc(x * s, y * s, 3.4 * s, 0, TAU);
    ctx.fillStyle = ring;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x * s, y * s, 1.6 * s, 0, TAU);
    ctx.fillStyle = look === 'burnt' ? '#222' : '#c9efa4';
    ctx.fill();
  }
}

function drawChili(ctx, look, s) {
  if (look === 'raw') {
    ctx.beginPath();
    ctx.moveTo(-14 * s, -4 * s);
    ctx.bezierCurveTo(-4 * s, -10 * s, 10 * s, -6 * s, 18 * s, 9 * s);
    ctx.bezierCurveTo(8 * s, 2 * s, -4 * s, 4 * s, -14 * s, 4 * s);
    ctx.closePath();
    ctx.fillStyle = radial(ctx, 0, 0, 18 * s, '#ff6b4a', '#b0150f');
    ctx.fill();
    shine(ctx, -2 * s, -4 * s, 7 * s, 1.6 * s, 0.6, 0.1);
    ctx.fillStyle = '#3c8a2e';
    ctx.beginPath();
    ctx.ellipse(-15 * s, 0, 3 * s, 5 * s, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = '#2f6e24';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(-16 * s, 0);
    ctx.lineTo(-21 * s, -5 * s);
    ctx.stroke();
    return;
  }
  for (let i = 0; i < 7; i += 1) {
    const x = ((i * 41) % 26) - 13;
    const y = ((i * 29) % 14) - 7;
    ctx.beginPath();
    ctx.arc(x * s, y * s, 3.8 * s, 0, TAU);
    ctx.fillStyle = look === 'burnt' ? '#3a1d16' : '#e0281b';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x * s, y * s, 2 * s, 0, TAU);
    ctx.fillStyle = look === 'burnt' ? '#1c100c' : '#ffd8a8';
    ctx.fill();
  }
}

function drawBokchoy(ctx, look, s) {
  const leaf = look === 'burnt' ? '#2e3a26' : '#2f8f3a';
  const stem = look === 'burnt' ? '#5a5a48' : '#eef6d6';
  const halves = look === 'raw' ? [[0, 0, 0]] : [[-8, 0, -0.5], [8, 2, 0.6]];
  for (const [ox, oy, rot] of halves) {
    ctx.save();
    ctx.translate(ox * s, oy * s);
    ctx.rotate(rot);
    const k = look === 'raw' ? 1 : 0.7;
    ctx.beginPath();
    ctx.ellipse(0, -6 * s * k, 11 * s * k, 13 * s * k, 0, 0, TAU);
    ctx.fillStyle = radial(ctx, 0, -6 * s * k, 13 * s * k, '#5fcf5c', leaf);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-5 * s * k, -2 * s * k);
    ctx.quadraticCurveTo(0, 18 * s * k, 5 * s * k, -2 * s * k);
    ctx.quadraticCurveTo(0, 22 * s * k, -5 * s * k, -2 * s * k);
    ctx.fillStyle = stem;
    ctx.beginPath();
    ctx.ellipse(0, 7 * s * k, 5 * s * k, 10 * s * k, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,240,190,0.7)';
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.moveTo(0, 2 * s * k);
    ctx.lineTo(0, -16 * s * k);
    ctx.stroke();
    ctx.restore();
  }
}

function drawMushroom(ctx, look, s) {
  if (look === 'raw') {
    ctx.fillStyle = '#f1e6cf';
    ctx.fillRect(-4 * s, 0, 8 * s, 12 * s);
    ctx.beginPath();
    ctx.ellipse(0, 0, 16 * s, 10 * s, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = radial(ctx, 0, -4 * s, 16 * s, '#b77a4a', '#6a3b1d');
    ctx.fill();
    ctx.fillStyle = 'rgba(255,230,200,0.6)';
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.arc((-8 + i * 5) * s, (-4 - (i % 2) * 2) * s, 1.4 * s, 0, TAU);
      ctx.fill();
    }
    return;
  }
  const cooked = look === 'cooked';
  const burnt = look === 'burnt';
  for (let i = 0; i < 4; i += 1) {
    ctx.save();
    ctx.translate((-12 + i * 8) * s, ((i % 2) * 4 - 2) * s);
    ctx.rotate(-0.3 + i * 0.2);
    ctx.beginPath();
    ctx.ellipse(0, 0, 6 * s, 9 * s, 0, Math.PI * 1.1, Math.PI * 1.9 + Math.PI);
    ctx.closePath();
    ctx.fillStyle = burnt ? '#241510' : cooked ? '#8a4f24' : '#e8d8b8';
    ctx.fill();
    ctx.strokeStyle = burnt ? '#100806' : cooked ? '#4a2410' : '#7a4a26';
    ctx.lineWidth = 2.2 * s;
    ctx.stroke();
    if (cooked) shine(ctx, -1 * s, -3 * s, 2 * s, 1 * s, 0.5);
    ctx.restore();
  }
}

function drawPork(ctx, look, s) {
  const burnt = look === 'burnt';
  const cooked = look === 'cooked';
  if (look === 'raw') {
    ctx.save();
    ctx.rotate(-0.12);
    const layers = ['#f5d6c8', '#e7798a', '#fbe5da', '#d65f72'];
    layers.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.roundRect(-18 * s, (-10 + i * 5) * s, 36 * s, 5.4 * s, 2 * s);
      ctx.fill();
    });
    shine(ctx, -8 * s, -8 * s, 6 * s, 1.4 * s, 0.4, 0);
    ctx.restore();
    return;
  }
  for (let i = 0; i < 4; i += 1) {
    ctx.save();
    ctx.translate((-12 + i * 8) * s, ((i % 2) * 3 - 1) * s);
    ctx.rotate(0.25);
    const meat = burnt ? '#1e1410' : cooked ? '#b0541f' : '#e47a88';
    const fat = burnt ? '#3a2a20' : cooked ? '#f0b56a' : '#fbe4da';
    ctx.fillStyle = fat;
    ctx.beginPath();
    ctx.roundRect(-4 * s, -11 * s, 8 * s, 22 * s, 3 * s);
    ctx.fill();
    ctx.fillStyle = meat;
    ctx.beginPath();
    ctx.roundRect(-4 * s, -11 * s, 8 * s, 9 * s, 3 * s);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(-4 * s, 2 * s, 8 * s, 6 * s, 2 * s);
    ctx.fill();
    if (cooked) {
      ctx.strokeStyle = 'rgba(60,20,5,0.75)';
      ctx.lineWidth = 1.4 * s;
      ctx.beginPath();
      ctx.moveTo(-4 * s, -6 * s);
      ctx.lineTo(4 * s, -9 * s);
      ctx.moveTo(-4 * s, 4 * s);
      ctx.lineTo(4 * s, 1 * s);
      ctx.stroke();
      shine(ctx, -1.5 * s, -8 * s, 1.6 * s, 2.5 * s, 0.45, 0);
    }
    ctx.restore();
  }
}

function drawShrimp(ctx, look, s) {
  const burnt = look === 'burnt';
  const cooked = look === 'cooked';
  const body = burnt ? '#2a1a14' : cooked ? '#ff7a45' : '#b9b3c4';
  const edge = burnt ? '#120a08' : cooked ? '#d8461e' : '#8b8398';
  ctx.lineCap = 'round';
  ctx.lineWidth = 9 * s;
  ctx.strokeStyle = edge;
  ctx.beginPath();
  ctx.arc(0, 0, 10 * s, Math.PI * 0.85, Math.PI * 2.25);
  ctx.stroke();
  ctx.lineWidth = 6.5 * s;
  ctx.strokeStyle = body;
  ctx.stroke();
  ctx.strokeStyle = cooked ? '#fff0d8' : 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1.2 * s;
  for (let i = 0; i < 5; i += 1) {
    const a = Math.PI * (0.95 + i * 0.25);
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 7 * s, Math.sin(a) * 7 * s);
    ctx.lineTo(Math.cos(a) * 13 * s, Math.sin(a) * 13 * s);
    ctx.stroke();
  }
  ctx.fillStyle = cooked ? '#e83a1c' : edge;
  ctx.beginPath();
  ctx.moveTo(Math.cos(Math.PI * 0.85) * 10 * s, Math.sin(Math.PI * 0.85) * 10 * s);
  ctx.lineTo(-16 * s, 12 * s);
  ctx.lineTo(-6 * s, 12 * s);
  ctx.fill();
}

function drawEgg(ctx, look, s) {
  if (look === 'raw') {
    ctx.beginPath();
    ctx.ellipse(0, 0, 11 * s, 14 * s, 0.2, 0, TAU);
    ctx.fillStyle = radial(ctx, 0, 0, 14 * s, '#f7f1e4', '#b9c6c8');
    ctx.fill();
    ctx.fillStyle = 'rgba(80,110,120,0.35)';
    for (let i = 0; i < 6; i += 1) {
      ctx.beginPath();
      ctx.arc(((i * 7) % 14 - 6) * s, ((i * 5) % 18 - 8) * s, 1 * s, 0, TAU);
      ctx.fill();
    }
    shine(ctx, -4 * s, -6 * s, 3 * s, 4 * s, 0.6, 0.2);
    return;
  }
  const burnt = look === 'burnt';
  ctx.beginPath();
  for (let i = 0; i <= 12; i += 1) {
    const a = (i / 12) * TAU;
    const r = (15 + Math.sin(i * 2.7) * 3) * s;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.8);
  }
  ctx.closePath();
  ctx.fillStyle = burnt ? '#3a2a20' : '#fffdf6';
  ctx.fill();
  ctx.strokeStyle = burnt ? '#1a100a' : '#e7b568';
  ctx.lineWidth = 1.6 * s;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(2 * s, -1 * s, 6.5 * s, 0, TAU);
  ctx.fillStyle = burnt ? '#5a3a10' : radial(ctx, 2 * s, -1 * s, 7 * s, '#ffd75a', '#f08f12');
  ctx.fill();
  if (!burnt) shine(ctx, 0, -3.5 * s, 2.4 * s, 1.4 * s, 0.8);
}

const DRAWERS = {
  noodles: drawNoodles, rice: drawRice, bao: drawBao, scallion: drawScallion, chili: drawChili,
  bokchoy: drawBokchoy, mushroom: drawMushroom, pork: drawPork, shrimp: drawShrimp, egg: drawEgg,
};

/** Draw a food item (or a carried dish) centred at x, y; s = 1 is about 40 px across. */
export function drawFood(ctx, item, x, y, s, t = 0) {
  if (item.kind === 'dish') {
    drawDish(ctx, item.parts, x, y, s * 0.8, t);
    return;
  }
  drawIngredient(ctx, item.id, lookOf(item), x, y, s, t);
}

export function drawIngredient(ctx, id, look, x, y, s, t = 0) {
  ctx.save();
  ctx.translate(x, y);
  shadow(ctx, 2 * s, 10 * s, 15 * s, 4 * s);
  DRAWERS[id](ctx, look, s, t);
  ctx.restore();
}

// ---------- dishes ----------

/** Where toppings sit on a dish, by vessel. */
const TOPPING_SPOTS = {
  bowl: [[-14, -6], [14, -7], [0, -12], [-6, 2], [10, 2]],
  plate: [[-16, -4], [14, -4], [0, -10], [-6, 6], [10, 6]],
};

function drawBowl(ctx, s, colour, rimColour, inner) {
  ctx.beginPath();
  ctx.moveTo(-34 * s, -6 * s);
  ctx.bezierCurveTo(-32 * s, 22 * s, 32 * s, 22 * s, 34 * s, -6 * s);
  ctx.closePath();
  const g = ctx.createLinearGradient(-34 * s, 0, 34 * s, 0);
  g.addColorStop(0, colour[0]);
  g.addColorStop(0.45, colour[1]);
  g.addColorStop(1, colour[2]);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.fillStyle = rimColour;
  ctx.fillRect(-12 * s, 15 * s, 24 * s, 4 * s);
  ellipse(ctx, 0, -6 * s, 34 * s, 10 * s, rimColour);
  ellipse(ctx, 0, -6 * s, 31 * s, 8.4 * s, inner);
}

function drawPlateBase(ctx, s) {
  ellipse(ctx, 2 * s, 6 * s, 36 * s, 12 * s, 'rgba(20,8,4,0.3)');
  ellipse(ctx, 0, 0, 36 * s, 13 * s, '#e9eef0');
  ellipse(ctx, 0, -1 * s, 28 * s, 9 * s, radial(ctx, 0, -1 * s, 28 * s, '#ffffff', '#d7e0e4'));
  ctx.strokeStyle = '#3d6fb0';
  ctx.lineWidth = 1.4 * s;
  ctx.beginPath();
  ctx.ellipse(0, 0, 33 * s, 11.5 * s, 0, 0, TAU);
  ctx.stroke();
}

function drawBasket(ctx, s) {
  ellipse(ctx, 2 * s, 12 * s, 38 * s, 10 * s, 'rgba(20,8,4,0.3)');
  const g = ctx.createLinearGradient(0, -6 * s, 0, 16 * s);
  g.addColorStop(0, '#d9b36a');
  g.addColorStop(1, '#9b7034');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 6 * s, 36 * s, 11 * s, 0, 0, Math.PI);
  ctx.lineTo(-36 * s, -4 * s);
  ctx.ellipse(0, -4 * s, 36 * s, 11 * s, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,60,20,0.55)';
  ctx.lineWidth = 1 * s;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.ellipse(0, (-1 + i * 4) * s, 36 * s, 11 * s, 0, 0.1, Math.PI - 0.1);
    ctx.stroke();
  }
  ellipse(ctx, 0, -4 * s, 36 * s, 11 * s, '#c79a50');
  ellipse(ctx, 0, -4 * s, 32 * s, 9 * s, '#efe2b8');
  ctx.strokeStyle = 'rgba(150,120,60,0.5)';
  for (let i = -3; i <= 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * 9 * s, -12 * s);
    ctx.lineTo(i * 9 * s, 4 * s);
    ctx.stroke();
  }
}

/** A filled bao: steamed bun folded open with its filling peeking out. */
function drawFilledBao(ctx, toppings, x, y, s, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.ellipse(0, 2 * s, 20 * s, 10 * s, 0, 0, Math.PI);
  ctx.fillStyle = '#fffaf0';
  ctx.fill();
  toppings.forEach((id, i) => {
    ctx.save();
    ctx.translate((-8 + i * 8) * s, (-1 - i) * s);
    ctx.scale(0.55, 0.45);
    DRAWERS[id](ctx, 'cooked', s, t);
    ctx.restore();
  });
  ctx.beginPath();
  ctx.ellipse(0, -5 * s, 20 * s, 8 * s, -0.08, Math.PI, 0);
  ctx.fillStyle = radial(ctx, 0, -8 * s, 20 * s, '#ffffff', '#f2e9d6');
  ctx.fill();
  shine(ctx, -8 * s, -9 * s, 5 * s, 1.8 * s, 0.8, -0.1);
  ctx.restore();
}

/** Toppings in their finished look (chopped greens stay chopped). */
function toppingLook(id) {
  return id === 'scallion' || id === 'chili' || id === 'bokchoy' ? 'chopped' : 'cooked';
}

/** Draw a dish from its parts at (x, y); works mid-assembly too (parts in any order). */
export function drawDish(ctx, parts, x, y, s, t = 0) {
  ctx.save();
  ctx.translate(x, y);
  const toppings = parts.filter((p) => p !== 'noodles' && p !== 'rice' && p !== 'bao');
  if (parts.includes('noodles')) {
    ellipse(ctx, 3 * s, 16 * s, 34 * s, 7 * s, 'rgba(20,8,4,0.32)');
    drawBowl(ctx, s, ['#7d1414', '#d33a2a', '#6a0f10'], '#e8b04a', radial(ctx, 0, -6 * s, 31 * s, '#e9a556', '#a5571c'));
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, -6 * s, 30 * s, 8 * s, 0, 0, TAU);
    ctx.clip();
    ctx.lineWidth = 2.6 * s;
    for (let i = 0; i < 10; i += 1) {
      ctx.strokeStyle = i % 2 ? '#ffe7a0' : '#f3c25e';
      ctx.beginPath();
      for (let k = 0; k <= 24; k += 1) {
        const px = (-28 + k * 2.4) * s;
        const py = (-10 + i * 1.1 + Math.sin(k * 0.8 + i * 1.3) * 1.6) * s;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
    toppings.forEach((id, i) => {
      const [tx, ty] = TOPPING_SPOTS.bowl[i % 5];
      ctx.save();
      ctx.translate(tx * s, ty * s);
      ctx.scale(0.6 * s, 0.5 * s);
      DRAWERS[id](ctx, toppingLook(id), 1, t);
      ctx.restore();
    });
  } else if (parts.includes('rice')) {
    ellipse(ctx, 3 * s, 16 * s, 34 * s, 7 * s, 'rgba(20,8,4,0.32)');
    drawBowl(ctx, s, ['#bcd1e0', '#f4f8fb', '#9fb6c8'], '#2f5f9e', '#f4efe2');
    ctx.save();
    ctx.translate(0, -10 * s);
    ctx.scale(1.6 * s, 1.0 * s);
    drawRice(ctx, 'cooked', 1);
    ctx.restore();
    ctx.strokeStyle = '#2f5f9e';
    ctx.lineWidth = 1.5 * s;
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.arc(i * 11 * s, 8 * s, 3 * s, 0, Math.PI);
      ctx.stroke();
    }
    toppings.forEach((id, i) => {
      const [tx, ty] = TOPPING_SPOTS.bowl[i % 5];
      ctx.save();
      ctx.translate(tx * s, (ty - 5) * s);
      ctx.scale(0.6 * s, 0.5 * s);
      DRAWERS[id](ctx, toppingLook(id), 1, t);
      ctx.restore();
    });
  } else if (parts.includes('bao')) {
    drawBasket(ctx, s);
    drawFilledBao(ctx, toppings.slice(0, 3), -15 * s, -8 * s, s * 0.85, t);
    drawFilledBao(ctx, toppings.slice(0, 3), 15 * s, -6 * s, s * 0.85, t);
  } else {
    drawPlateBase(ctx, s);
    toppings.forEach((id, i) => {
      const [tx, ty] = TOPPING_SPOTS.plate[i % 5];
      ctx.save();
      ctx.translate(tx * s, ty * s);
      ctx.scale(0.6 * s, 0.5 * s);
      DRAWERS[id](ctx, toppingLook(id), 1, t);
      ctx.restore();
    });
  }
  ctx.restore();
}

/** Rising steam wisps over hot food; phase makes each source drift differently. */
export function drawSteam(ctx, x, y, s, t, phase = 0, alpha = 0.35) {
  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i += 1) {
    const k = (t * 0.6 + phase + i / 3) % 1;
    ctx.strokeStyle = `rgba(255,248,235,${alpha * (1 - k)})`;
    ctx.lineWidth = (4 + k * 5) * s;
    ctx.beginPath();
    const bx = x + (i - 1) * 10 * s;
    const by = y - k * 34 * s;
    ctx.moveTo(bx, by + 8 * s);
    ctx.bezierCurveTo(bx - 6 * s, by + 3 * s, bx + 6 * s, by - 3 * s, bx, by - 8 * s);
    ctx.stroke();
  }
  ctx.restore();
}
