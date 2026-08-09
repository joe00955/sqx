// Pure logic for the ghosting drill — a squash training exercise where a
// player reacts to a randomly called court zone. Two modes share this logic:
//   - On-Court Drill: corners are called by voice at a real, sprint-and-recover
//     pace, meant to be run on an actual court for genuine footwork/fitness work.
//   - Reaction Trainer: a fast screen-tap fallback for when there's no court handy.
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

export interface Pacing {
  /** Time budget for the very first rep, in ms. */
  startMs: number;
  /** Floor the time budget ramps down to, in ms. */
  minMs: number;
  /** How much the budget shrinks per completed rep, in ms. */
  stepMs: number;
}

// Real sprint-to-a-corner-and-recover pace — slow enough at the start to be
// physically doable, ramping to a genuinely demanding pace for fit players.
export const ON_COURT_PACING: Pacing = { startMs: 4200, minMs: 1800, stepMs: 45 };

// Fast screen-tap pace, tuned for reaction speed rather than footwork.
export const REACTION_PACING: Pacing = { startMs: 1400, minMs: 480, stepMs: 22 };

export const REACTION_MAX_LIVES = 3;

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
 * The time budget for a rep, in milliseconds, given how many reps have
 * already been completed. Shrinks with each rep to ramp difficulty, floored
 * at pacing.minMs.
 */
export function intervalForRep(rep: number, pacing: Pacing): number {
  return Math.max(pacing.minMs, pacing.startMs - rep * pacing.stepMs);
}
