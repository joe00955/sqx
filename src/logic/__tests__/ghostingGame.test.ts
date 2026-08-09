import { MAX_LIVES, MIN_MS, START_MS, STEP_MS, ZONES, pickNextZone, timeForRep } from '../ghostingGame';

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

describe('timeForRep', () => {
  it('starts at START_MS with no streak', () => {
    expect(timeForRep(0)).toBe(START_MS);
  });

  it('shrinks by STEP_MS per streak point', () => {
    expect(timeForRep(1)).toBe(START_MS - STEP_MS);
    expect(timeForRep(5)).toBe(START_MS - 5 * STEP_MS);
  });

  it('never drops below MIN_MS', () => {
    expect(timeForRep(1000)).toBe(MIN_MS);
  });
});

describe('MAX_LIVES', () => {
  it('is a small positive number of misses allowed', () => {
    expect(MAX_LIVES).toBeGreaterThan(0);
    expect(MAX_LIVES).toBeLessThanOrEqual(5);
  });
});
