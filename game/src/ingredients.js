// The ten ingredients of the stall and the prep path each one walks before it can go in a bowl:
// a list of station steps ('chop', 'grill', 'pot', 'steam'). An item remembers how many steps it
// has done and whether it burnt, so the same pork belly is raw, sliced, then grilled.

export const INGREDIENTS = {
  noodles: { name: 'Egg Noodles', short: 'Noodles', steps: ['pot'] },
  rice: { name: 'Jasmine Rice', short: 'Rice', steps: [] },
  bao: { name: 'Bao Bun', short: 'Bao', steps: ['steam'] },
  scallion: { name: 'Scallion', short: 'Scallion', steps: ['chop'] },
  chili: { name: 'Ember Chili', short: 'Chili', steps: ['chop'] },
  bokchoy: { name: 'Bok Choy', short: 'Bok Choy', steps: ['chop'] },
  mushroom: { name: 'Shiitake', short: 'Shiitake', steps: ['chop', 'grill'] },
  pork: { name: 'Pork Belly', short: 'Pork', steps: ['chop', 'grill'] },
  shrimp: { name: 'Tiger Shrimp', short: 'Shrimp', steps: ['grill'] },
  egg: { name: 'Duck Egg', short: 'Egg', steps: ['grill'] },
};

/** Bases decide the vessel a dish is served in. */
export const BASES = ['noodles', 'rice', 'bao'];

export const STEP_VERB = { chop: 'chop', grill: 'grill', pot: 'boil', steam: 'steam' };

export function makeItem(id) {
  return { kind: 'food', id, done: 0, burnt: false };
}

/** The station step this item needs next, or null when it is ready (or ruined). */
export function nextStep(item) {
  if (!item || item.kind !== 'food' || item.burnt) return null;
  return INGREDIENTS[item.id].steps[item.done] ?? null;
}

export function isPrepared(item) {
  return !!item && item.kind === 'food' && !item.burnt && item.done >= INGREDIENTS[item.id].steps.length;
}

/** 'raw', 'chopped', 'cooked' or 'burnt', the look the food is drawn with. */
export function lookOf(item) {
  if (item.burnt) return 'burnt';
  const steps = INGREDIENTS[item.id].steps;
  const doneSteps = steps.slice(0, item.done);
  if (doneSteps.some((s) => s === 'grill' || s === 'pot' || s === 'steam')) return 'cooked';
  if (doneSteps.includes('chop')) return 'chopped';
  return item.id === 'rice' ? 'cooked' : 'raw';
}

export function describeItem(item) {
  if (!item) return '';
  if (item.kind === 'dish') return 'a dish';
  const name = INGREDIENTS[item.id].short;
  if (item.burnt) return `burnt ${name}`;
  const step = nextStep(item);
  return step ? `${name} (needs ${STEP_VERB[step]})` : `${name} (ready)`;
}
