// The between-days shop: eight costed upgrades bought with the night's coins, and the modifier
// table the rest of the game reads (chop speed, cooker slots, guest patience, burn window, tips,
// chef speed).

export const UPGRADES = [
  { id: 'cleaver', name: 'Moonsteel Cleaver', text: 'Chop 60% faster', cost: 35 },
  { id: 'burner', name: 'Third Grill Burner', text: 'Grill three at once', cost: 60 },
  { id: 'pot', name: 'Twin Noodle Pot', text: 'Boil two nests at once', cost: 45 },
  { id: 'steamer', name: 'Double Steamer', text: 'Two bao, 25% faster', cost: 40 },
  { id: 'tea', name: 'Jasmine Tea Service', text: 'Guests wait 25% longer', cost: 50 },
  { id: 'coals', name: 'Banked Coals', text: 'Burns 70% slower', cost: 30 },
  { id: 'bell', name: 'Brass Service Bell', text: 'Tips +40%', cost: 55 },
  { id: 'slippers', name: 'Cloud Slippers', text: 'Chef walks 20% faster', cost: 35 },
];

export function modifiers(owned) {
  const has = (id) => owned.has(id);
  return {
    chop: has('cleaver') ? 1.6 : 1,
    grillSlots: has('burner') ? 3 : 2,
    potSlots: has('pot') ? 2 : 1,
    steamSlots: has('steamer') ? 2 : 1,
    steamSpeed: has('steamer') ? 1.25 : 1,
    patience: has('tea') ? 1.25 : 1,
    burn: has('coals') ? 1.7 : 1,
    tips: has('bell') ? 1.4 : 1,
    speed: has('slippers') ? 1.2 : 1,
  };
}

export function canBuy(game, id) {
  const up = UPGRADES.find((u) => u.id === id);
  return !!up && !game.owned.has(id) && game.coins >= up.cost;
}

/** Spend coins on an upgrade; true when bought. */
export function buyUpgrade(game, id) {
  if (!canBuy(game, id)) return false;
  const up = UPGRADES.find((u) => u.id === id);
  game.coins -= up.cost;
  game.owned.add(id);
  game.events.push({ type: 'buy', text: up.name });
  return true;
}
