// Pure logic for the footwork ghosting timer — a squash training drill where a
// player reacts to a randomly called court zone before a shrinking timer runs out.
// Kept free of React/DOM so it can be unit tested and driven by any UI.

export type Zone = 'T' | 'FL' | 'FR' | 'BL' | 'BR';

export const ZONES: Zone[] = ['T', 'FL', 'FR', 'BL', 'BR'];

export const ZONE_LABELS: Record<Zone, string> = {
  T: 'T',
  FL: 'Front Left',
  FR: 'Front Right',
  BL: 'Back Left',
  BR: 'Back Right',
};

export const START_MS = 1400;
export const MIN_MS = 480;
export const STEP_MS = 22;
export const MAX_LIVES = 3;

/**
 * Picks the next zone to call, never repeating the immediately previous one
 * (repeats would let a player "stay put", which defeats the footwork drill).
 */
export function pickNextZone(previous: Zone | null, random: () => number = Math.random): Zone {
  const choices = previous ? ZONES.filter((z) => z !== previous) : ZONES;
  const index = Math.floor(random() * choices.length);
  return choices[Math.min(index, choices.length - 1)];
}

/**
 * The reaction-time budget for a rep, in milliseconds. Shrinks with each
 * correct rep (the streak) to ramp difficulty, floored at MIN_MS.
 */
export function timeForRep(streak: number): number {
  return Math.max(MIN_MS, START_MS - streak * STEP_MS);
}
