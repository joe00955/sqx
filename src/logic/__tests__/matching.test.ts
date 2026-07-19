import { findMatches } from '../matching';
import { Court, Player } from '../../data/types';

function makePlayer(overrides: Partial<Player>): Player {
  return {
    id: 'p',
    name: 'Test Player',
    initials: 'TP',
    skillLevel: 3,
    skillLabel: 'Intermediate',
    bio: '',
    homeCourtId: 'court-a',
    distanceKm: 5,
    availability: [],
    competitiveElo: 1500,
    casualGamesPlayed: 10,
    ...overrides,
  };
}

function makeCourt(overrides: Partial<Court>): Court {
  return {
    id: 'court-a',
    name: 'Court A',
    address: '',
    distanceKm: 1,
    bookableSlots: [],
    ...overrides,
  };
}

describe('findMatches', () => {
  const me = makePlayer({
    id: 'me',
    skillLevel: 3,
    distanceKm: 0,
    availability: [{ day: 'Mon', start: '18:00', end: '20:00' }],
  });

  it('suggests a bookable court/time when availability overlaps and a court covers it', () => {
    const candidate = makePlayer({
      id: 'alice',
      availability: [{ day: 'Mon', start: '18:30', end: '19:30' }],
    });
    const court = makeCourt({
      id: 'court-a',
      distanceKm: 1,
      bookableSlots: [{ day: 'Mon', start: '18:00', end: '21:00' }],
    });

    const [result] = findMatches(me, [candidate], [court]);

    expect(result.suggestedBookings).toHaveLength(1);
    expect(result.suggestedBookings[0]).toMatchObject({
      day: 'Mon',
      start: '18:30',
      end: '19:30',
    });
    expect(result.suggestedBookings[0].court.id).toBe('court-a');
  });

  it('returns no suggested bookings when availability does not overlap', () => {
    const candidate = makePlayer({
      id: 'bob',
      availability: [{ day: 'Tue', start: '09:00', end: '10:00' }],
    });
    const court = makeCourt({ bookableSlots: [{ day: 'Tue', start: '09:00', end: '10:00' }] });

    const [result] = findMatches(me, [candidate], [court]);

    expect(result.suggestedBookings).toEqual([]);
  });

  it('does not suggest a court whose bookable slot only partially covers the overlap', () => {
    const candidate = makePlayer({
      id: 'carl',
      availability: [{ day: 'Mon', start: '18:00', end: '20:00' }],
    });
    const court = makeCourt({ bookableSlots: [{ day: 'Mon', start: '19:00', end: '20:00' }] });

    const [result] = findMatches(me, [candidate], [court]);

    expect(result.suggestedBookings).toEqual([]);
  });

  it('computes skillDiff as the absolute difference in skill level', () => {
    const candidate = makePlayer({ id: 'dana', skillLevel: 4.5 });

    const [result] = findMatches(me, [candidate], []);

    expect(result.skillDiff).toBeCloseTo(1.5);
  });

  it('ranks a closer, similarly-skilled, overlapping candidate above a distant mismatched one', () => {
    const goodMatch = makePlayer({
      id: 'good',
      skillLevel: 3.1,
      distanceKm: 1,
      availability: [{ day: 'Mon', start: '18:00', end: '20:00' }],
    });
    const poorMatch = makePlayer({
      id: 'poor',
      skillLevel: 4.9,
      distanceKm: 14,
      availability: [{ day: 'Fri', start: '08:00', end: '09:00' }],
    });

    const results = findMatches(me, [poorMatch, goodMatch], []);

    expect(results.map((r) => r.player.id)).toEqual(['good', 'poor']);
    expect(results[0].score).toBeGreaterThan(results[1].score);
  });

  it('sorts the returned matches by score descending', () => {
    const a = makePlayer({ id: 'a', skillLevel: 3, distanceKm: 2 });
    const b = makePlayer({ id: 'b', skillLevel: 4.9, distanceKm: 14.9 });
    const c = makePlayer({ id: 'c', skillLevel: 3.2, distanceKm: 4 });

    const results = findMatches(me, [b, a, c], []);
    const scores = results.map((r) => r.score);

    expect(scores).toEqual([...scores].sort((x, y) => y - x));
  });
});
