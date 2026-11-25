// Keyboard and mouse. Held keys give a walking direction and the "hold to chop" state. One-shot
// presses (use, pause, confirm, shop digits, mute) queue until the loop takes them, so a quick
// tap between frames is never lost. A click is kept as a logical point for the loop to resolve.

const MOVE = {
  KeyW: [0, -1], ArrowUp: [0, -1], KeyS: [0, 1], ArrowDown: [0, 1],
  KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0],
};
const USE = new Set(['KeyE', 'Space']);

export function createInput(canvas, toLogical) {
  const held = new Set();
  let presses = [];
  let clicks = [];
  let mouseDown = false;

  window.addEventListener('keydown', (e) => {
    if (MOVE[e.code]) held.add(e.code);
    else if (USE.has(e.code)) {
      held.add('use');
      if (!e.repeat) presses.push('use');
    } else if (e.code === 'Enter') { if (!e.repeat) presses.push('confirm'); }
    else if (e.code === 'KeyP' || e.code === 'Escape') { if (!e.repeat) presses.push('pause'); }
    else if (e.code === 'KeyM') presses.push('mute');
    else if (/^Digit[1-8]$/.test(e.code)) presses.push(`buy${e.code.slice(5)}`);
    else return;
    e.preventDefault();
  });
  window.addEventListener('keyup', (e) => {
    if (MOVE[e.code]) held.delete(e.code);
    else if (USE.has(e.code)) held.delete('use');
  });
  window.addEventListener('blur', () => { held.clear(); mouseDown = false; });
  canvas.addEventListener('pointerdown', (e) => {
    mouseDown = true;
    clicks.push(toLogical(e.clientX, e.clientY));
  });
  window.addEventListener('pointerup', () => { mouseDown = false; });

  return {
    direction() {
      let dx = 0;
      let dy = 0;
      for (const code of held) {
        if (MOVE[code]) {
          dx += MOVE[code][0];
          dy += MOVE[code][1];
        }
      }
      return { dx, dy };
    },
    holding: () => held.has('use') || mouseDown,
    takePresses() { const p = presses; presses = []; return p; },
    takeClicks() { const c = clicks; clicks = []; return c; },
  };
}
