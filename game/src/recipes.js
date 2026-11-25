// The menu: eight dishes built from the same ten ingredients in different combinations, unlocked
// day by day, plus the multiset checks the assembly board uses ("does any dish still fit what is
// on this plate?" and "is this plate exactly one dish?").

export const RECIPES = [
  { id: 'scallion-noodles', name: 'Scallion Oil Noodles', parts: ['noodles', 'scallion'], price: 14, day: 1 },
  { id: 'pork-bao', name: 'Pork Belly Bao', parts: ['bao', 'pork', 'scallion'], price: 20, day: 1 },
  { id: 'ember-ramen', name: 'Ember Chili Ramen', parts: ['noodles', 'pork', 'chili'], price: 22, day: 2 },
  { id: 'shrimp-rice', name: 'Golden Shrimp Rice', parts: ['rice', 'shrimp', 'egg', 'scallion'], price: 24, day: 2 },
  { id: 'forest-bao', name: 'Forest Shiitake Bao', parts: ['bao', 'mushroom', 'bokchoy'], price: 20, day: 3 },
  { id: 'garden-rice', name: 'Garden Lantern Rice', parts: ['rice', 'bokchoy', 'mushroom', 'egg'], price: 25, day: 3 },
  { id: 'lantern-special', name: 'Lantern Special', parts: ['noodles', 'pork', 'egg', 'bokchoy', 'chili'], price: 36, day: 4 },
  { id: 'firecracker-bao', name: 'Firecracker Shrimp Bao', parts: ['bao', 'shrimp', 'chili'], price: 24, day: 5 },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id) ?? null;
}

export function unlockedRecipes(day) {
  return RECIPES.filter((r) => r.day <= day);
}

export function newOnDay(day) {
  return RECIPES.filter((r) => r.day === day);
}

function counts(parts) {
  const map = new Map();
  for (const p of parts) map.set(p, (map.get(p) ?? 0) + 1);
  return map;
}

/** True when every part of `small` (with repeats) is in `big`. */
export function isSubset(small, big) {
  const have = counts(big);
  for (const [k, n] of counts(small)) if ((have.get(k) ?? 0) < n) return false;
  return true;
}

export function sameParts(a, b) {
  return a.length === b.length && isSubset(a, b);
}

/** Dishes from `recipes` that `parts` could still become. */
export function candidates(parts, recipes) {
  return recipes.filter((r) => isSubset(parts, r.parts));
}

export function exactRecipe(parts, recipes) {
  return recipes.find((r) => sameParts(parts, r.parts)) ?? null;
}

/** What is still missing from `parts` to make `recipe`. */
export function missingParts(parts, recipe) {
  const left = [...parts];
  const missing = [];
  for (const p of recipe.parts) {
    const i = left.indexOf(p);
    if (i >= 0) left.splice(i, 1);
    else missing.push(p);
  }
  return missing;
}
