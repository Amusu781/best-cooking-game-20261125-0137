// The stall itself: terracotta floor under lantern light, teak counters with brass trim, the neon
// stall sign, every station drawn with its live state (crate piles, knife marks and chop rings,
// glowing coals with cook and burn rings, a bubbling pot, the bamboo steamer, assembly mats with
// their READY TO SERVE banner, the serving pass), and the chef.
import { INGREDIENTS, nextStep } from './ingredients.js';
import { candidates, exactRecipe, missingParts, unlockedRecipes } from './recipes.js';
import { cookTime, burnTime } from './stations.js';
import { drawDish, drawFood, drawIngredient, drawSteam } from './draw-food.js';
import { BACK_COUNTER, FRONT_COUNTER, ISLAND, LEFT_COUNTER, RIGHT_COUNTER } from './kitchen-layout.js';

const TAU = Math.PI * 2;
export const FONT = '"Trebuchet MS", "Segoe UI", Verdana, sans-serif';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function label(ctx, text, x, y, size, color, align = 'center', weight = '700') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function outlinedLabel(ctx, text, x, y, size, color, stroke = 'rgba(30,10,5,0.85)') {
  ctx.font = `800 ${size}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 4;
  ctx.strokeStyle = stroke;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

/** Progress ring: fraction p, coloured arc on a dark track. */
export function ring(ctx, x, y, r, p, color, width = 5) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.strokeStyle = 'rgba(20,10,6,0.65)';
  ctx.lineWidth = width + 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * Math.max(0, Math.min(1, p)));
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.lineCap = 'butt';
}

// ---------- room ----------

function drawFloor(ctx, t) {
  const g = ctx.createLinearGradient(0, 132, 0, 720);
  g.addColorStop(0, '#3a1f1a');
  g.addColorStop(1, '#2a1512');
  ctx.fillStyle = g;
  ctx.fillRect(0, 132, 1280, 588);
  const size = 56;
  for (let y = 236; y < 720; y += size) {
    for (let x = 0; x < 1280; x += size) {
      const odd = ((x / size) + (y - 236) / size) % 2 === 0;
      ctx.fillStyle = odd ? '#6b3424' : '#5c2c20';
      ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    }
  }
  // lantern light pools
  for (const [lx, ly, r] of [[320, 330, 260], [760, 560, 300], [1000, 330, 240]]) {
    const pool = ctx.createRadialGradient(lx, ly, 10, lx, ly, r);
    pool.addColorStop(0, `rgba(255,170,80,${0.22 + Math.sin(t * 2 + lx) * 0.02})`);
    pool.addColorStop(1, 'rgba(255,170,80,0)');
    ctx.fillStyle = pool;
    ctx.fillRect(lx - r, ly - r, r * 2, r * 2);
  }
  // lacquered rug framing the island
  ctx.fillStyle = '#6e1420';
  rr(ctx, 300, 350, 680, 196, 18);
  ctx.fill();
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 3;
  rr(ctx, 310, 360, 660, 176, 14);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(217,164,65,0.45)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 22; i += 1) {
    const px = 326 + i * 30;
    for (const py of [370, 526]) {
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI, py > 400);
      ctx.stroke();
    }
  }
  // vignette
  const v = ctx.createRadialGradient(640, 430, 300, 640, 430, 760);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(10,0,10,0.55)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 132, 1280, 588);
}

function counter(ctx, r) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  rr(ctx, r.x + 4, r.y + 8, r.w, r.h, 10);
  ctx.fill();
  const g = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
  g.addColorStop(0, '#a8643a');
  g.addColorStop(1, '#7a4024');
  ctx.fillStyle = g;
  rr(ctx, r.x, r.y, r.w, r.h, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(60,25,10,0.35)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 6; i += 1) {
    ctx.beginPath();
    const yy = r.y + (r.h * i) / 6;
    ctx.moveTo(r.x + 8, yy);
    ctx.bezierCurveTo(r.x + r.w * 0.3, yy + 3, r.x + r.w * 0.6, yy - 3, r.x + r.w - 8, yy);
    ctx.stroke();
  }
  ctx.strokeStyle = '#e0a84a';
  ctx.lineWidth = 3;
  rr(ctx, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 9);
  ctx.stroke();
}

function drawSign(ctx, t) {
  const x = 16;
  const y = 140;
  ctx.fillStyle = '#1b0c1e';
  rr(ctx, x, y, 114, 94, 12);
  ctx.fill();
  const flicker = 0.85 + Math.sin(t * 9) * 0.05;
  ctx.shadowColor = '#ff4fa0';
  ctx.shadowBlur = 16;
  ctx.strokeStyle = `rgba(255,90,170,${flicker})`;
  ctx.lineWidth = 3;
  rr(ctx, x + 5, y + 5, 104, 84, 10);
  ctx.stroke();
  ctx.shadowColor = '#ffcf5a';
  label(ctx, 'LANTERN', x + 57, y + 30, 19, `rgba(255,214,110,${flicker})`, 'center', '800');
  label(ctx, 'ALLEY', x + 57, y + 52, 19, `rgba(255,214,110,${flicker})`, 'center', '800');
  ctx.shadowBlur = 0;
  label(ctx, 'NOODLE  ·  BAO', x + 57, y + 74, 10, 'rgba(120,230,255,0.9)', 'center', '700');
}

// ---------- stations ----------

function drawCrate(ctx, st, t) {
  const { x, y, w, h } = st;
  ctx.fillStyle = '#c99556';
  rr(ctx, x + 4, y + 4, w - 8, h - 8, 6);
  ctx.fill();
  ctx.fillStyle = '#8a5a2c';
  for (let i = 0; i < 3; i += 1) ctx.fillRect(x + 6, y + 10 + i * ((h - 20) / 2.4), w - 12, 4);
  ctx.strokeStyle = '#5e3a1a';
  ctx.lineWidth = 2;
  rr(ctx, x + 4, y + 4, w - 8, h - 8, 6);
  ctx.stroke();
  const id = st.ingredient;
  const look = id === 'rice' ? 'cooked' : 'raw';
  const s = st.side === 'left' ? 0.95 : 0.8;
  const cx = x + w / 2;
  const cy = y + h / 2 - 6;
  if (id === 'rice') {
    // a rice cooker tub
    ctx.fillStyle = '#e9e4da';
    rr(ctx, cx - 34, cy - 18, 68, 44, 12);
    ctx.fill();
    drawIngredient(ctx, 'rice', 'cooked', cx, cy - 2, 1.5);
    drawSteam(ctx, cx, cy - 18, 0.8, t, 0.3, 0.3);
  } else {
    drawIngredient(ctx, id, look, cx - 12 * s, cy + 6 * s, s);
    drawIngredient(ctx, id, look, cx + 13 * s, cy + 4 * s, s);
    drawIngredient(ctx, id, look, cx, cy - 6 * s, s);
  }
  ctx.fillStyle = 'rgba(30,12,6,0.82)';
  rr(ctx, x + 6, y + h - 22, w - 12, 17, 5);
  ctx.fill();
  label(ctx, INGREDIENTS[id].short.toUpperCase(), cx, y + h - 13.5, st.side === 'left' ? 12 : 10.5, '#ffe7b8');
}

function drawBoard(ctx, st, t, chopping) {
  const { x, y, w, h } = st;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  rr(ctx, x + 10, y + 12, w - 16, h - 18, 12);
  ctx.fill();
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, '#f3d9a4');
  g.addColorStop(1, '#d6ad6c');
  ctx.fillStyle = g;
  rr(ctx, x + 6, y + 6, w - 16, h - 18, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(150,100,50,0.35)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i += 1) {
    ctx.beginPath();
    ctx.ellipse(x + w / 2 - 5, y + h / 2 - 6, i * 16, i * 8, 0, 0, TAU);
    ctx.stroke();
  }
  // knife marks accumulate with every stroke
  ctx.strokeStyle = 'rgba(110,70,30,0.45)';
  ctx.lineWidth = 1.3;
  const marks = Math.min(18, st.marks + 5);
  for (let i = 0; i < marks; i += 1) {
    const mx = x + 18 + ((i * 47) % (w - 44));
    const my = y + 16 + ((i * 31) % (h - 40));
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(mx + 10, my + 6);
    ctx.stroke();
  }
  // cleaver
  const bob = chopping ? Math.abs(Math.sin(t * 28)) * -10 : 0;
  ctx.save();
  ctx.translate(x + w - 22, y + 30 + bob);
  ctx.rotate(0.35);
  ctx.fillStyle = '#5a2e14';
  rr(ctx, -4, 18, 8, 22, 3);
  ctx.fill();
  const blade = ctx.createLinearGradient(-12, 0, 12, 0);
  blade.addColorStop(0, '#9aa6b0');
  blade.addColorStop(0.5, '#eef3f6');
  blade.addColorStop(1, '#8a96a0');
  ctx.fillStyle = blade;
  rr(ctx, -12, -18, 24, 36, 3);
  ctx.fill();
  ctx.restore();
  if (st.item) {
    drawFood(ctx, st.item, x + w / 2 - 10, y + h / 2 - 6, 1.15, t);
    if (nextStep(st.item) === 'chop' && st.progress > 0) {
      ring(ctx, x + 22, y + 22, 13, st.progress, '#7dff8a');
      label(ctx, `${Math.round(st.progress * 100)}%`, x + 22, y + 22, 9, '#e8ffe8');
    }
    if (nextStep(st.item) !== 'chop') {
      label(ctx, nextStep(st.item) ? `→ ${nextStep(st.item).toUpperCase()}` : 'READY', x + w / 2 - 6, y + h - 6, 11, '#ffe7b8');
    }
  }
  label(ctx, 'CHOPPING BOARD', x + w / 2 - 4, y + h + 4, 10, 'rgba(255,225,170,0.85)');
}

function cookerSlots(st) {
  const n = st.step === 'grill' ? 3 : st.capacity;
  const out = [];
  for (let i = 0; i < n; i += 1) {
    if (st.step === 'grill') out.push({ x: st.x + 42 + i * 74, y: st.y + st.h / 2 + 2 });
    else out.push({ x: st.x + st.w / 2 + (n > 1 ? (i - 0.5) * 30 : 0), y: st.y + st.h / 2 + 2 });
  }
  return out;
}

function slotRing(ctx, slot, st, mods, x, y) {
  const need = cookTime(st, mods);
  if (slot.item.burnt) {
    label(ctx, 'BURNT!', x, y + 26, 11, '#ff5a3a', 'center', '900');
    return;
  }
  if (!slot.cooked) {
    ring(ctx, x + 22, y - 22, 10, slot.t / need, '#ffd34a', 4);
  } else {
    const p = (slot.t - need) / burnTime(mods);
    const danger = p > 0.55;
    ring(ctx, x + 22, y - 22, 10, 1 - p, danger ? '#ff3b2a' : '#6cff7c', 4);
    label(ctx, danger ? 'HOT!' : 'DONE', x, y + 26, 11, danger ? '#ff6a4a' : '#9dffa6', 'center', '900');
  }
}

function drawGrill(ctx, st, t, mods) {
  const { x, y, w, h } = st;
  ctx.fillStyle = '#211a18';
  rr(ctx, x + 4, y + 4, w - 8, h - 8, 10);
  ctx.fill();
  const slots = cookerSlots(st);
  slots.forEach((p, i) => {
    const locked = i >= st.capacity;
    const glow = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, 34);
    glow.addColorStop(0, locked ? '#3a3230' : `rgba(255,${150 + Math.sin(t * 5 + i) * 30},60,1)`);
    glow.addColorStop(0.6, locked ? '#2a2422' : '#b8361a');
    glow.addColorStop(1, '#2a1612');
    ctx.fillStyle = glow;
    rr(ctx, p.x - 33, p.y - 33, 66, 64, 8);
    ctx.fill();
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 2;
    for (let k = -2; k <= 2; k += 1) {
      ctx.beginPath();
      ctx.moveTo(p.x - 30, p.y + k * 12);
      ctx.lineTo(p.x + 30, p.y + k * 12);
      ctx.stroke();
    }
    if (locked) {
      label(ctx, 'UPGRADE', p.x, p.y, 10, '#9a8a80');
      return;
    }
    const slot = st.slots[i];
    if (slot) {
      drawFood(ctx, slot.item, p.x, p.y, 1.05, t);
      if (slot.item.burnt) drawSteam(ctx, p.x, p.y - 8, 1, t, i * 0.3, 0.55);
      else drawSteam(ctx, p.x, p.y - 10, 0.8, t, i * 0.3, 0.25);
      slotRing(ctx, slot, st, mods, p.x, p.y);
    }
  });
  label(ctx, 'CHARCOAL GRILL', x + w / 2, y + h - 2, 10, 'rgba(255,225,170,0.85)');
}

function drawPot(ctx, st, t, mods) {
  const { x, y, w, h } = st;
  const cx = x + w / 2;
  const cy = y + h / 2 - 2;
  ctx.fillStyle = '#2a1e1a';
  rr(ctx, x + 4, y + 4, w - 8, h - 8, 10);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 34, 0, TAU);
  ctx.fillStyle = '#8d979e';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 29, 0, TAU);
  ctx.fillStyle = radial2(ctx, cx, cy, 29, '#e3c27a', '#a0702e');
  ctx.fill();
  for (let i = 0; i < 6; i += 1) {
    const k = (t * 1.4 + i * 0.37) % 1;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(i * 2.1) * 16, cy + Math.sin(i * 2.1) * 12, 2 + k * 3, 0, TAU);
    ctx.strokeStyle = `rgba(255,250,230,${0.7 * (1 - k)})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  const slots = cookerSlots(st);
  st.slots.forEach((slot, i) => {
    const p = slots[i];
    drawFood(ctx, slot.item, p.x, p.y, st.capacity > 1 ? 0.7 : 0.9, t);
    slotRing(ctx, slot, st, mods, p.x, p.y);
  });
  drawSteam(ctx, cx, cy - 18, 1, t, 0.1, 0.35);
  label(ctx, st.step === 'pot' ? 'NOODLE POT' : 'STEAMER', cx, y + h - 2, 10, 'rgba(255,225,170,0.85)');
}

function radial2(ctx, x, y, r, a, b) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 2, x, y, r);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  return g;
}

function drawSteamer(ctx, st, t, mods) {
  const { x, y, w, h } = st;
  const cx = x + w / 2;
  const cy = y + h / 2 - 2;
  ctx.fillStyle = '#2a1e1a';
  rr(ctx, x + 4, y + 4, w - 8, h - 8, 10);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 34, 0, TAU);
  ctx.fillStyle = '#b48a46';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, 29, 0, TAU);
  ctx.fillStyle = '#e8d6a2';
  ctx.fill();
  ctx.strokeStyle = 'rgba(140,100,40,0.5)';
  ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.moveTo(cx + i * 10, cy - 27);
    ctx.lineTo(cx + i * 10, cy + 27);
    ctx.stroke();
  }
  const slots = cookerSlots(st);
  st.slots.forEach((slot, i) => {
    const p = slots[i];
    drawFood(ctx, slot.item, p.x, p.y, st.capacity > 1 ? 0.75 : 0.95, t);
    slotRing(ctx, slot, st, mods, p.x, p.y);
  });
  drawSteam(ctx, cx, cy - 16, 1.1, t, 0.6, 0.4);
  label(ctx, 'BAMBOO STEAMER', cx, y + h - 2, 9.5, 'rgba(255,225,170,0.85)');
}

function drawPlateStation(ctx, st, t, day) {
  const { x, y, w, h } = st;
  ctx.fillStyle = '#2b3a3a';
  rr(ctx, x + 6, y + 6, w - 12, h - 14, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(220,200,150,0.35)';
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 1.5;
  rr(ctx, x + 11, y + 11, w - 22, h - 24, 9);
  ctx.stroke();
  ctx.setLineDash([]);
  const menu = unlockedRecipes(day);
  const parts = st.parts;
  if (parts.length === 0) {
    label(ctx, 'ASSEMBLY MAT', x + w / 2, y + h / 2 - 4, 11, 'rgba(230,220,190,0.55)');
    return;
  }
  drawDish(ctx, parts, x + w / 2, y + h / 2 + 2, 1.15, t);
  const exact = exactRecipe(parts, menu);
  if (exact) {
    drawSteam(ctx, x + w / 2, y + 26, 1, t, 0.2, 0.35);
    const pulse = 0.9 + Math.sin(t * 6) * 0.1;
    ctx.fillStyle = `rgba(255,196,60,${pulse})`;
    rr(ctx, x + 2, y - 26, w - 4, 24, 8);
    ctx.fill();
    ctx.strokeStyle = '#fff2c0';
    ctx.lineWidth = 2;
    ctx.stroke();
    label(ctx, 'READY TO SERVE', x + w / 2, y - 14, 12.5, '#3a1604', 'center', '900');
    outlinedLabel(ctx, exact.name, x + w / 2, y + h + 6, 12, '#fff2c0');
  } else {
    const options = candidates(parts, menu);
    const best = options.sort((a, b) => a.parts.length - b.parts.length)[0];
    if (best) {
      const miss = missingParts(parts, best).map((p) => INGREDIENTS[p].short);
      ctx.fillStyle = 'rgba(20,10,6,0.85)';
      rr(ctx, x + 2, y - 34, w - 4, 32, 7);
      ctx.fill();
      label(ctx, 'BUILDING', x + w / 2, y - 25, 9, '#9fe8ff', 'center', '900');
      label(ctx, best.name, x + w / 2, y - 12, best.name.length > 18 ? 10 : 11, '#d8f6ff', 'center', '800');
      outlinedLabel(ctx, `+ ${miss.join(', ')}`, x + w / 2, y + h + 6, 11, '#ffd38a');
    }
  }
}

function drawShelf(ctx, st, t) {
  const { x, y, w, h } = st;
  ctx.fillStyle = 'rgba(40,18,8,0.45)';
  rr(ctx, x + 6, y + 6, w - 12, h - 12, 8);
  ctx.fill();
  if (st.item) drawFood(ctx, st.item, x + w / 2, y + h / 2, 1, t);
  else label(ctx, 'SHELF', x + w / 2, y + h / 2, 11, 'rgba(255,225,170,0.4)');
}

function drawPass(ctx, st, t) {
  const { x, y, w, h } = st;
  // night street seen through the hatch
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, '#1a1240');
  sky.addColorStop(1, '#3d1a4a');
  ctx.fillStyle = sky;
  rr(ctx, x + 6, y + 6, w - 12, h - 12, 10);
  ctx.fill();
  for (let i = 0; i < 4; i += 1) {
    const lx = x + 22 + (i % 2) * 70;
    const ly = y + 32 + i * 44;
    const glow = ctx.createRadialGradient(lx, ly, 2, lx, ly, 26);
    glow.addColorStop(0, 'rgba(255,120,60,0.9)');
    glow.addColorStop(1, 'rgba(255,80,40,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(lx - 26, ly - 26, 52, 52);
    ctx.fillStyle = '#e8322a';
    ctx.beginPath();
    ctx.ellipse(lx, ly, 8, 10, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#ffd36a';
    ctx.fillRect(lx - 4, ly - 12, 8, 3);
  }
  // waiting guests silhouettes
  ctx.fillStyle = 'rgba(10,5,20,0.75)';
  for (let i = 0; i < 3; i += 1) {
    const gx = x + 30 + i * 32;
    ctx.beginPath();
    ctx.arc(gx, y + h - 64, 10, 0, TAU);
    ctx.fill();
    rr(ctx, gx - 13, y + h - 54, 26, 40, 10);
    ctx.fill();
  }
  // brass counter ledge
  const ledge = ctx.createLinearGradient(x, 0, x + w, 0);
  ledge.addColorStop(0, '#b07a28');
  ledge.addColorStop(0.5, '#ffd77a');
  ledge.addColorStop(1, '#b07a28');
  ctx.fillStyle = ledge;
  rr(ctx, x, y + h / 2 - 8, w, 16, 6);
  ctx.fill();
  // bell
  ctx.fillStyle = '#ffcf5a';
  ctx.beginPath();
  ctx.arc(x + w - 24, y + h / 2 - 14, 10, Math.PI, 0);
  ctx.fill();
  if (st.flash > 0) {
    ctx.fillStyle = `rgba(255,230,140,${st.flash * 0.5})`;
    rr(ctx, x, y, w, h, 10);
    ctx.fill();
  }
  ctx.fillStyle = '#1c0b06';
  rr(ctx, x + 14, y + h - 30, w - 28, 22, 6);
  ctx.fill();
  label(ctx, 'SERVE  ▶', x + w / 2, y + h - 19, 12, '#ffd36a', 'center', '900');
}

function drawBin(ctx, st) {
  const { x, y, w, h } = st;
  ctx.fillStyle = '#3c3a36';
  rr(ctx, x + 22, y + 14, w - 44, h - 26, 10);
  ctx.fill();
  ctx.fillStyle = '#56534c';
  rr(ctx, x + 16, y + 8, w - 32, 14, 6);
  ctx.fill();
  ctx.strokeStyle = '#26241f';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 40 + i * 20, y + 30);
    ctx.lineTo(x + 40 + i * 20, y + h - 20);
    ctx.stroke();
  }
  label(ctx, 'SCRAPS', x + w / 2, y + h - 4, 11, 'rgba(255,225,170,0.8)');
}

// ---------- chef ----------

export function drawChef(ctx, chef, t) {
  const bob = chef.moving ? Math.sin(chef.walk) * 2.5 : 0;
  const { x } = chef;
  const y = chef.y + bob;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(chef.x, chef.y + 20, 24, 9, 0, 0, TAU);
  ctx.fill();
  // feet
  ctx.fillStyle = '#1a1a22';
  const step = chef.moving ? Math.sin(chef.walk) * 5 : 0;
  ctx.beginPath();
  ctx.ellipse(x - 9, chef.y + 16 + step, 7, 5, 0, 0, TAU);
  ctx.ellipse(x + 9, chef.y + 16 - step, 7, 5, 0, 0, TAU);
  ctx.fill();
  // body: indigo jacket, saffron apron
  const body = ctx.createLinearGradient(x - 20, 0, x + 20, 0);
  body.addColorStop(0, '#26306a');
  body.addColorStop(0.5, '#3c4aa0');
  body.addColorStop(1, '#232a5e');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.roundRect(x - 20, y - 14, 40, 34, 14);
  ctx.fill();
  ctx.fillStyle = '#f0a23a';
  ctx.beginPath();
  ctx.roundRect(x - 13, y - 4, 26, 24, 8);
  ctx.fill();
  ctx.fillStyle = '#d4862a';
  ctx.fillRect(x - 13, y - 4, 26, 3);
  // head
  ctx.fillStyle = '#9a5c38';
  ctx.beginPath();
  ctx.arc(x, y - 24, 14, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#2a1a12';
  const fx = chef.faceX * 4;
  const fy = chef.faceY > 0 ? 2 : -1;
  if (chef.faceY > -0.6) {
    ctx.beginPath();
    ctx.arc(x - 5 + fx, y - 24 + fy, 1.8, 0, TAU);
    ctx.arc(x + 5 + fx, y - 24 + fy, 1.8, 0, TAU);
    ctx.fill();
  }
  // headscarf + tall hat
  ctx.fillStyle = '#c8262a';
  ctx.fillRect(x - 14, y - 34, 28, 5);
  ctx.fillStyle = '#fdf8ee';
  ctx.beginPath();
  ctx.roundRect(x - 11, y - 52, 22, 20, 4);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - 8, y - 52, 8, 0, TAU);
  ctx.arc(x + 8, y - 52, 8, 0, TAU);
  ctx.arc(x, y - 57, 9, 0, TAU);
  ctx.fill();
  // arms + what is carried, held out toward where the chef faces
  const hx = x + chef.faceX * 22;
  const hy = y - 2 + Math.max(-0.4, chef.faceY) * 12;
  ctx.strokeStyle = '#3c4aa0';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 16, y - 6);
  ctx.lineTo(hx - 10, hy);
  ctx.moveTo(x + 16, y - 6);
  ctx.lineTo(hx + 10, hy);
  ctx.stroke();
  if (chef.held) {
    drawFood(ctx, chef.held, hx, hy - 6, 1.0, t);
  }
  ctx.restore();
}

/** The whole room, every station and the chef. */
export function drawKitchen(ctx, game) {
  const t = game.clock;
  drawFloor(ctx, t);
  counter(ctx, BACK_COUNTER);
  counter(ctx, LEFT_COUNTER);
  counter(ctx, RIGHT_COUNTER);
  counter(ctx, FRONT_COUNTER);
  counter(ctx, ISLAND);
  drawSign(ctx, t);
  const chopping = game.chef.chopping > 0 && game.focus;
  for (const st of game.stations) {
    if (st.kind === 'crate') drawCrate(ctx, st, t);
    else if (st.kind === 'board') drawBoard(ctx, st, t, chopping && game.focus === st);
    else if (st.kind === 'cooker' && st.step === 'grill') drawGrill(ctx, st, t, game.mods);
    else if (st.kind === 'cooker' && st.step === 'pot') drawPot(ctx, st, t, game.mods);
    else if (st.kind === 'cooker') drawSteamer(ctx, st, t, game.mods);
    else if (st.kind === 'shelf') drawShelf(ctx, st, t);
    else if (st.kind === 'pass') drawPass(ctx, st, t);
    else if (st.kind === 'bin') drawBin(ctx, st);
  }
  // mats last so their banners sit on top of the boards
  for (const st of game.stations) if (st.kind === 'plate') drawPlateStation(ctx, st, t, game.day);
  if (game.focus) {
    const f = game.focus;
    ctx.strokeStyle = `rgba(255,240,160,${0.65 + Math.sin(t * 8) * 0.25})`;
    ctx.lineWidth = 3;
    rr(ctx, f.x - 2, f.y - 2, f.w + 4, f.h + 4, 12);
    ctx.stroke();
  }
  drawChef(ctx, game.chef, t);
}
