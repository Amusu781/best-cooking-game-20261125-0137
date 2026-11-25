// What each station does when the chef uses it, and how cookers and boards advance each step.
// Crates hand out raw food. Boards chop while the key or mouse is held, and each tap adds a quick
// stroke. The grill, pot and steamer cook an item to its next step, then start a burn window.
// Assembly mats only take prepared food some unlocked dish still fits, and the pass serves.
import { COOK } from './config.js';
import { INGREDIENTS, STEP_VERB, describeItem, isPrepared, makeItem, nextStep } from './ingredients.js';
import { candidates, exactRecipe, unlockedRecipes } from './recipes.js';
import { serveDish } from './orders.js';

export function cookTime(station, mods) {
  if (station.step === 'grill') return COOK.grill;
  if (station.step === 'pot') return COOK.pot;
  return COOK.steam / mods.steamSpeed;
}

export function burnTime(mods) {
  return COOK.burn * mods.burn;
}

function say(game, text, station) {
  game.toast = { text, t: 2.2 };
  if (station) game.events.push({ type: 'nope', x: station.x + station.w / 2, y: station.y });
}

function center(station) {
  return { x: station.x + station.w / 2, y: station.y + station.h / 2 };
}

/** The chef presses use at `station`. Returns true when something changed. */
export function useStation(game, station) {
  const chef = game.chef;
  const held = chef.held;
  const c = center(station);
  switch (station.kind) {
    case 'crate': {
      if (!held) {
        chef.held = makeItem(station.ingredient);
        game.events.push({ type: 'pick', x: c.x, y: c.y });
        return true;
      }
      if (held.kind === 'food' && held.id === station.ingredient && held.done === 0 && !held.burnt) {
        chef.held = null;
        game.events.push({ type: 'drop', x: c.x, y: c.y });
        return true;
      }
      say(game, 'Hands full: put it down first', station);
      return false;
    }
    case 'board': {
      if (!station.item && held && nextStep(held) === 'chop') {
        station.item = held;
        station.progress = 0;
        chef.held = null;
        game.events.push({ type: 'drop', x: c.x, y: c.y });
        return true;
      }
      if (station.item && nextStep(station.item) === 'chop') {
        chopStation(game, station, 0, true);
        return true;
      }
      if (station.item && !held) {
        chef.held = station.item;
        station.item = null;
        station.progress = 0;
        game.events.push({ type: 'pick', x: c.x, y: c.y });
        return true;
      }
      if (held && !station.item) say(game, `${describeItem(held)}: not for the board`, station);
      else say(game, 'Board busy', station);
      return false;
    }
    case 'cooker': {
      if (held && nextStep(held) === station.step) {
        if (station.slots.length >= station.capacity) {
          say(game, `${station.label} is full`, station);
          return false;
        }
        station.slots.push({ item: held, t: 0, cooked: false });
        chef.held = null;
        game.events.push({ type: station.step === 'grill' ? 'sizzle' : 'splash', x: c.x, y: c.y });
        return true;
      }
      if (!held) {
        const ready = station.slots.filter((s) => s.cooked || s.item.burnt).sort((a, b) => b.t - a.t)[0];
        if (ready) {
          station.slots.splice(station.slots.indexOf(ready), 1);
          chef.held = ready.item;
          game.events.push({ type: 'pick', x: c.x, y: c.y });
          return true;
        }
        say(game, station.slots.length ? 'Still cooking...' : `Nothing on the ${station.label.toLowerCase()}`, station);
        return false;
      }
      say(game, `${describeItem(held)}: wrong station`, station);
      return false;
    }
    case 'plate': {
      if (held && held.kind === 'food') {
        if (!isPrepared(held)) {
          say(game, held.burnt ? 'Burnt! Bin it' : `${INGREDIENTS[held.id].short} needs to ${STEP_VERB[nextStep(held)]} first`, station);
          return false;
        }
        const next = [...station.parts, held.id];
        if (candidates(next, unlockedRecipes(game.day)).length === 0) {
          say(game, 'No dish on the menu uses that here', station);
          return false;
        }
        station.parts = next;
        chef.held = null;
        game.events.push({ type: 'plate', x: c.x, y: c.y });
        if (exactRecipe(next, unlockedRecipes(game.day))) game.events.push({ type: 'ready', x: c.x, y: c.y });
        return true;
      }
      if (held && held.kind === 'dish' && station.parts.length === 0) {
        station.parts = held.parts;
        chef.held = null;
        return true;
      }
      if (!held && station.parts.length) {
        chef.held = { kind: 'dish', parts: station.parts };
        station.parts = [];
        game.events.push({ type: 'pick', x: c.x, y: c.y });
        return true;
      }
      say(game, 'Mat is busy', station);
      return false;
    }
    case 'pass': {
      if (held && held.kind === 'dish') {
        const result = serveDish(game, held.parts);
        if (!result) {
          say(game, 'No ticket wants that dish', station);
          return false;
        }
        chef.held = null;
        station.flash = 1;
        game.events.push({ type: 'serve', x: c.x, y: c.y, text: `+${result.pay}`, rush: result.rush, restored: result.restored, name: result.order.recipe.name });
        return true;
      }
      say(game, held ? 'Plate it on a mat first' : 'Bring a finished dish here', station);
      return false;
    }
    case 'bin': {
      if (!held) return false;
      chef.held = null;
      game.dayStats.wasted += 1;
      game.events.push({ type: 'bin', x: c.x, y: c.y });
      return true;
    }
    case 'shelf': {
      if (held && !station.item) {
        station.item = held;
        chef.held = null;
        return true;
      }
      if (!held && station.item) {
        chef.held = station.item;
        station.item = null;
        return true;
      }
      if (held && station.item) {
        chef.held = station.item;
        station.item = held;
        return true;
      }
      return false;
    }
    default:
      return false;
  }
}

/** Chop at a board for dt seconds of held work (tap adds a quick stroke). */
export function chopStation(game, station, dt, tap = false) {
  if (!station.item || nextStep(station.item) !== 'chop') return false;
  const before = station.progress;
  station.progress += (dt / COOK.chop + (tap ? COOK.chopTap : 0)) * game.mods.chop;
  if (Math.floor(station.progress * 6) > Math.floor(before * 6) || tap) {
    station.marks += 1;
    game.events.push({ type: 'chop', x: station.x + station.w / 2, y: station.y + station.h / 2, id: station.item.id });
  }
  if (station.progress >= 1) {
    station.item.done += 1;
    station.progress = 0;
    game.events.push({ type: 'chopped', x: station.x + station.w / 2, y: station.y + station.h / 2 });
  }
  return true;
}

/** Advance every cooker: cook to the next step, then burn if left too long. */
export function tickStations(game, dt) {
  for (const st of game.stations) {
    if (st.kind === 'pass') st.flash = Math.max(0, st.flash - dt * 1.5);
    if (st.kind !== 'cooker') continue;
    const need = cookTime(st, game.mods);
    for (const slot of st.slots) {
      if (slot.item.burnt) continue;
      slot.t += dt;
      if (!slot.cooked && slot.t >= need) {
        slot.cooked = true;
        slot.item.done += 1;
        game.events.push({ type: 'cooked', x: st.x + st.w / 2, y: st.y + 20 });
      }
      if (slot.cooked && slot.t >= need + burnTime(game.mods)) {
        slot.item.burnt = true;
        game.dayStats.burnt += 1;
        game.events.push({ type: 'burnt', x: st.x + st.w / 2, y: st.y + 20 });
      }
    }
  }
}
