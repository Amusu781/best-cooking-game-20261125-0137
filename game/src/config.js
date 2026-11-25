// Tuning numbers for Lantern Alley Kitchen, all in one place: the logical screen size, the
// fixed step, how long a service lasts, how fast food cooks and burns, and how the pace of a
// night grows from day 1 to day 5.

export const VIEW = { width: 1280, height: 720 };
export const STEP = 1 / 60;
export const DAY_SECONDS = 180;
export const LAST_DAY = 5;
export const MAX_STARS = 5;
export const START_STARS = 5;

export const CHEF = { radius: 22, speed: 255, reach: 40 };
/** Walkable floor: the chef's centre stays inside this box. */
export const FLOOR = { x0: 150, y0: 258, x1: 1122, y1: 606 };

/** Seconds of work for each kind of prep, before upgrades. */
export const COOK = { chop: 1.5, grill: 6.5, pot: 7, steam: 6, burn: 7, chopTap: 0.14 };

/** Per day: seconds between new tickets, how many tickets fit on the rail, and a patience factor. */
export const PACE = [
  null,
  { every: 20, max: 3, patience: 1.0 },
  { every: 17, max: 4, patience: 0.96 },
  { every: 15, max: 4, patience: 0.92 },
  { every: 13, max: 5, patience: 0.88 },
  { every: 11.5, max: 5, patience: 0.84 },
];

/** A serve this fast (fraction of patience left) keeps the rush combo going. */
export const COMBO_KEEP = 0.3;
/** At this combo the rush multiplier applies; every RESTORE_EVERY combo serves win back a star. */
export const RUSH_AT = 3;
export const RUSH_MULT = 1.25;
export const RESTORE_EVERY = 5;

export const BEST_KEY = 'lantern-alley-kitchen-best';
