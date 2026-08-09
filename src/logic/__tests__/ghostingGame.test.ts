import {
  ON_COURT_PACING,
  REACTION_MAX_LIVES,
  REACTION_PACING,
  ZONES,
  intervalForRep,
  pickNextZone,
} from '../ghostingGame';

describe('pickNextZone', () => {
  it('never repeats the immediately previous zone', () => {
    for (const previous of ZONES) {
      for (let i = 0; i < 20; i++) {
        const next = pickNextZone(previous, () => i / 20);
        expect(next).not.toBe(previous);
      }
    }
  });

  it('can return any zone when there is no previous zone', () => {
    const seen = new Set(ZONES.map((_, i) => pickNextZone(null, () => i / ZONES.length)));
    expect(seen.size).toBe(ZONES.length);
  });

  it('stays within the remaining zone list for edge-case random values', () => {
    expect(ZONES).toContain(pickNextZone('T', () => 0));
    expect(ZONES).toContain(pickNextZone('T', () => 0.999999));
  });
});

describe('intervalForRep', () => {
  const pacing = { startMs: 1000, minMs: 400, stepMs: 50 };

  it('starts at pacing.startMs with no reps completed', () => {
    expect(intervalForRep(0, pacing)).toBe(1000);
  });

  it('shrinks by pacing.stepMs per rep', () => {
    expect(intervalForRep(1, pacing)).toBe(950);
    expect(intervalForRep(5, pacing)).toBe(750);
  });

  it('never drops below pacing.minMs', () => {
    expect(intervalForRep(1000, pacing)).toBe(400);
  });

  it('paces the on-court drill slower than the reaction trainer throughout', () => {
    for (const rep of [0, 5, 20, 100]) {
      expect(intervalForRep(rep, ON_COURT_PACING)).toBeGreaterThan(intervalForRep(rep, REACTION_PACING));
    }
  });
});

describe('REACTION_MAX_LIVES', () => {
  it('is a small positive number of misses allowed', () => {
    expect(REACTION_MAX_LIVES).toBeGreaterThan(0);
    expect(REACTION_MAX_LIVES).toBeLessThanOrEqual(5);
  });
});
