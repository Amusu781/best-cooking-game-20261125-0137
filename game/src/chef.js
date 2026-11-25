// The chef: walks the floor with WASD or the arrows (sliding along counters), faces where they
// walk, carries one thing at a time, and when a station is clicked walks there (round the island
// if needed) and uses it.
import { CHEF } from './config.js';
import { approachPoint, isFree, rectDistance, waypointAround } from './kitchen-layout.js';

export function createChef() {
  return { x: 640, y: 560, faceX: 0, faceY: -1, held: null, target: null, walk: 0, chopping: 0, moving: false };
}

export function moveChef(chef, dx, dy, dt, speed) {
  const len = Math.hypot(dx, dy);
  chef.moving = len > 0.01;
  if (!chef.moving) return;
  const vx = (dx / len) * speed * dt;
  const vy = (dy / len) * speed * dt;
  if (isFree(chef.x + vx, chef.y)) chef.x += vx;
  if (isFree(chef.x, chef.y + vy)) chef.y += vy;
  chef.faceX = dx / len;
  chef.faceY = dy / len;
  chef.walk += dt * 10;
}

/** The station the chef can reach, closest first (ties go to the one they face). */
export function nearestStation(chef, stations) {
  let best = null;
  let bestScore = Infinity;
  for (const st of stations) {
    const d = rectDistance(chef.x, chef.y, st) - CHEF.radius;
    if (d > CHEF.reach) continue;
    const cx = st.x + st.w / 2 - chef.x;
    const cy = st.y + st.h / 2 - chef.y;
    const facing = (cx * chef.faceX + cy * chef.faceY) / (Math.hypot(cx, cy) || 1);
    const score = d - facing * 18;
    if (score < bestScore) {
      bestScore = score;
      best = st;
    }
  }
  return best;
}

export function canReach(chef, station) {
  return rectDistance(chef.x, chef.y, station) - CHEF.radius <= CHEF.reach;
}

/** Step toward a clicked station; returns true once it is in reach. */
export function walkToStation(chef, station, dt, speed) {
  if (canReach(chef, station)) {
    const cx = station.x + station.w / 2 - chef.x;
    const cy = station.y + station.h / 2 - chef.y;
    const l = Math.hypot(cx, cy) || 1;
    chef.faceX = cx / l;
    chef.faceY = cy / l;
    chef.moving = false;
    return true;
  }
  const goal = approachPoint(station, chef);
  const via = waypointAround(chef, goal) ?? goal;
  const dx = via.x - chef.x;
  const dy = via.y - chef.y;
  if (Math.hypot(dx, dy) < 3) {
    chef.moving = false;
    return canReach(chef, station);
  }
  const before = { x: chef.x, y: chef.y };
  moveChef(chef, dx, dy, dt, Math.min(speed, Math.hypot(dx, dy) / dt));
  if (Math.hypot(chef.x - before.x, chef.y - before.y) < 0.01) chef.target = null;
  return false;
}
