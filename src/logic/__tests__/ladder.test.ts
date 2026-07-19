import { casualLadder, competitiveLadder } from '../ladder';
import { Player } from '../../data/types';

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

describe('competitiveLadder', () => {
  it('ranks players by ELO descending, with sequential rank numbers', () => {
    const me = makePlayer({ id: 'me', competitiveElo: 1500 });
    const players = [
      makePlayer({ id: 'high', competitiveElo: 1800 }),
      makePlayer({ id: 'low', competitiveElo: 1200 }),
    ];

    const rows = competitiveLadder(me, players);

    expect(rows.map((r) => r.player.id)).toEqual(['high', 'me', 'low']);
    expect(rows.map((r) => r.rank)).toEqual([1, 2, 3]);
  });

  it('flags isMe only on the current user row', () => {
    const me = makePlayer({ id: 'me', competitiveElo: 1500 });
    const players = [makePlayer({ id: 'other', competitiveElo: 1400 })];

    const rows = competitiveLadder(me, players);
    const meRow = rows.find((r) => r.player.id === 'me');
    const otherRow = rows.find((r) => r.player.id === 'other');

    expect(meRow?.isMe).toBe(true);
    expect(otherRow?.isMe).toBe(false);
  });
});

describe('casualLadder', () => {
  it('ranks players by casual games played descending, independent of ELO', () => {
    const me = makePlayer({ id: 'me', competitiveElo: 1900, casualGamesPlayed: 2 });
    const players = [
      makePlayer({ id: 'social', competitiveElo: 1000, casualGamesPlayed: 40 }),
      makePlayer({ id: 'occasional', competitiveElo: 1600, casualGamesPlayed: 15 }),
    ];

    const rows = casualLadder(me, players);

    expect(rows.map((r) => r.player.id)).toEqual(['social', 'occasional', 'me']);
  });
});
