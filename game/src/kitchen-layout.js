// Where everything stands in the stall. Seven crates and the charcoal grill, noodle pot and bamboo
// steamer line the back counter. The noodle, rice and bao crates sit on the left counter, two
// chopping boards and two assembly mats on the centre island, three spare shelves on the front
// counter, and the serving pass and scrap bin on the right. Also the floor collision and the spot
// the chef walks to when a station is clicked.
import { CHEF, FLOOR } from './config.js';

export const ISLAND = { x: 340, y: 392, w: 600, h: 108 };
export const BACK_COUNTER = { x: 130, y: 136, w: 1016, h: 100 };
export const LEFT_COUNTER = { x: 14, y: 240, w: 118, h: 470 };
export const FRONT_COUNTER = { x: 300, y: 630, w: 700, h: 90 };
export const RIGHT_COUNTER = { x: 1146, y: 240, w: 128, h: 470 };

const BACK_CRATES = ['scallion', 'chili', 'bokchoy', 'mushroom', 'pork', 'shrimp', 'egg'];
const SIDE_CRATES = ['noodles', 'rice', 'bao'];

/** Build fresh stations; `mods` sets how many slots each cooker has. */
export function createStations(mods) {
  const list = [];
  BACK_CRATES.forEach((ing, i) => {
    list.push({ id: `crate-${ing}`, kind: 'crate', ingredient: ing, x: 138 + i * 82, y: 144, w: 78, h: 86, side: 'back' });
  });
  SIDE_CRATES.forEach((ing, i) => {
    list.push({ id: `crate-${ing}`, kind: 'crate', ingredient: ing, x: 20, y: 252 + i * 120, w: 106, h: 108, side: 'left' });
  });
  list.push({ id: 'grill', kind: 'cooker', step: 'grill', label: 'CHARCOAL GRILL', x: 724, y: 144, w: 232, h: 86, side: 'back', capacity: mods.grillSlots, slots: [] });
  list.push({ id: 'pot', kind: 'cooker', step: 'pot', label: 'NOODLE POT', x: 962, y: 144, w: 88, h: 86, side: 'back', capacity: mods.potSlots, slots: [] });
  list.push({ id: 'steamer', kind: 'cooker', step: 'steam', label: 'STEAMER', x: 1054, y: 144, w: 88, h: 86, side: 'back', capacity: mods.steamSlots, slots: [] });
  list.push({ id: 'board-1', kind: 'board', label: 'CHOP', x: 346, y: 398, w: 140, h: 96, side: 'island', item: null, progress: 0, marks: 0 });
  list.push({ id: 'board-2', kind: 'board', label: 'CHOP', x: 492, y: 398, w: 140, h: 96, side: 'island', item: null, progress: 0, marks: 0 });
  list.push({ id: 'plate-1', kind: 'plate', label: 'ASSEMBLE', x: 640, y: 398, w: 146, h: 96, side: 'island', parts: [] });
  list.push({ id: 'plate-2', kind: 'plate', label: 'ASSEMBLE', x: 790, y: 398, w: 146, h: 96, side: 'island', parts: [] });
  [0, 1, 2].forEach((i) => {
    list.push({ id: `shelf-${i + 1}`, kind: 'shelf', label: 'SHELF', x: 330 + i * 225, y: 636, w: 190, h: 72, side: 'front', item: null });
  });
  list.push({ id: 'pass', kind: 'pass', label: 'PASS', x: 1150, y: 250, w: 122, h: 230, side: 'right', flash: 0 });
  list.push({ id: 'bin', kind: 'bin', label: 'SCRAPS', x: 1150, y: 604, w: 122, h: 100, side: 'right' });
  return list;
}

export function stationById(stations, id) {
  return stations.find((s) => s.id === id) ?? null;
}

/** Distance from point to rectangle edge (0 inside). */
export function rectDistance(x, y, r) {
  const dx = Math.max(r.x - x, 0, x - (r.x + r.w));
  const dy = Math.max(r.y - y, 0, y - (r.y + r.h));
  return Math.hypot(dx, dy);
}

export function stationAtPoint(stations, x, y) {
  return stations.find((s) => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) ?? null;
}

/** True when a chef centred at (x, y) would stand on open floor. */
export function isFree(x, y) {
  if (x < FLOOR.x0 || x > FLOOR.x1 || y < FLOOR.y0 || y > FLOOR.y1) return false;
  return rectDistance(x, y, ISLAND) >= CHEF.radius;
}

/** The floor spot in front of a station, on the chef's side of the island. */
export function approachPoint(station, chef) {
  const cx = station.x + station.w / 2;
  const cy = station.y + station.h / 2;
  const clampX = (x) => Math.min(FLOOR.x1, Math.max(FLOOR.x0, x));
  const clampY = (y) => Math.min(FLOOR.y1, Math.max(FLOOR.y0, y));
  switch (station.side) {
    case 'back': return { x: clampX(cx), y: FLOOR.y0 };
    case 'left': return { x: FLOOR.x0, y: clampY(cy) };
    case 'right': return { x: FLOOR.x1, y: clampY(cy) };
    case 'front': return { x: clampX(cx), y: FLOOR.y1 };
    default: {
      const above = chef.y < ISLAND.y + ISLAND.h / 2;
      return { x: cx, y: above ? ISLAND.y - CHEF.radius - 4 : ISLAND.y + ISLAND.h + CHEF.radius + 4 };
    }
  }
}

/** True when a chef can walk the straight segment a→b without touching the island. */
export function clearPath(a, b) {
  const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 6));
  for (let i = 1; i <= steps; i += 1) {
    const x = a.x + ((b.x - a.x) * i) / steps;
    const y = a.y + ((b.y - a.y) * i) / steps;
    if (rectDistance(x, y, ISLAND) < CHEF.radius + 1) return false;
  }
  return true;
}

/** The next corner to walk to when the straight walk would cut through the island, else null. */
export function waypointAround(chef, goal) {
  if (clearPath(chef, goal)) return null;
  const m = CHEF.radius + 8;
  const corners = [
    { x: ISLAND.x - m, y: ISLAND.y - m }, { x: ISLAND.x + ISLAND.w + m, y: ISLAND.y - m },
    { x: ISLAND.x - m, y: ISLAND.y + ISLAND.h + m }, { x: ISLAND.x + ISLAND.w + m, y: ISLAND.y + ISLAND.h + m },
  ];
  const d = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
  let best = null;
  let bestLen = Infinity;
  for (const c of corners) {
    if (!clearPath(chef, c)) continue;
    if (clearPath(c, goal)) {
      const len = d(chef, c) + d(c, goal);
      if (len < bestLen) { bestLen = len; best = c; }
    }
    for (const c2 of corners) {
      if (c2 === c || !clearPath(c, c2) || !clearPath(c2, goal)) continue;
      const len = d(chef, c) + d(c, c2) + d(c2, goal);
      if (len < bestLen) { bestLen = len; best = c; }
    }
  }
  if (best) return best;
  // Hugging the island edge: step straight out from it first.
  const top = ISLAND.y + ISLAND.h / 2 > chef.y;
  return { x: chef.x, y: top ? ISLAND.y - m : ISLAND.y + ISLAND.h + m };
}
