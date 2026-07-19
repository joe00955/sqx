import { haversineKm } from '../geo';

describe('haversineKm', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineKm(51.4344, 6.7623, 51.4344, 6.7623)).toBeCloseTo(0, 5);
  });

  it('matches the known distance between two Duisburg landmarks', () => {
    // Duisburg Hauptbahnhof to Duisburg Zoo, ~2.6km apart.
    const km = haversineKm(51.4296, 6.7778, 51.4344, 6.7623);
    expect(km).toBeGreaterThan(1);
    expect(km).toBeLessThan(4);
  });

  it('is symmetric regardless of argument order', () => {
    const a = haversineKm(51.5, 6.7, 52.0, 7.1);
    const b = haversineKm(52.0, 7.1, 51.5, 6.7);
    expect(a).toBeCloseTo(b, 10);
  });
});
