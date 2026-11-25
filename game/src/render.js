// Paints one frame: the stall at a fixed 1280x720 logical size, scaled to fit the window with
// letterboxing, then particles, the HUD, and whichever screen is up. Also maps pointer positions
// back into logical coordinates for clicks.
import { VIEW } from './config.js';
import { drawKitchen } from './draw-kitchen.js';
import { drawControlsStrip, drawHud, drawToast } from './draw-hud.js';
import { drawParticles } from './particles.js';
import { drawEnd, drawPause, drawShop, drawTitle } from './screens.js';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let scale = 1;
  let ox = 0;
  let oy = 0;
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    scale = Math.min(w / VIEW.width, h / VIEW.height);
    ox = (w - VIEW.width * scale) / 2;
    oy = (h - VIEW.height * scale) / 2;
    return dpr;
  }
  let dpr = resize();
  window.addEventListener('resize', () => { dpr = resize(); });
  return {
    toLogical(clientX, clientY) {
      return { x: (clientX - ox) / scale, y: (clientY - oy) / scale };
    },
    draw(game, particles) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#0c0410';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * ox, dpr * oy);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, VIEW.width, VIEW.height);
      ctx.clip();
      drawKitchen(ctx, game);
      drawParticles(ctx, particles);
      drawHud(ctx, game);
      if (game.screen === 'play') {
        drawToast(ctx, game);
        drawControlsStrip(ctx);
      }
      if (game.screen === 'title') drawTitle(ctx, game);
      else if (game.screen === 'pause') drawPause(ctx);
      else if (game.screen === 'shop') drawShop(ctx, game);
      else if (game.screen === 'over') drawEnd(ctx, game, false);
      else if (game.screen === 'win') drawEnd(ctx, game, true);
      ctx.restore();
    },
  };
}
