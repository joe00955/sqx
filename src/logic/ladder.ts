import { Player } from '../data/types';

export interface LadderRow {
  rank: number;
  player: Player;
  isMe: boolean;
}

export function competitiveLadder(me: Player, players: Player[]): LadderRow[] {
  return [me, ...players]
    .sort((a, b) => b.competitiveElo - a.competitiveElo)
    .map((player, index) => ({ rank: index + 1, player, isMe: player.id === me.id }));
}

export function casualLadder(me: Player, players: Player[]): LadderRow[] {
  return [me, ...players]
    .sort((a, b) => b.casualGamesPlayed - a.casualGamesPlayed)
    .map((player, index) => ({ rank: index + 1, player, isMe: player.id === me.id }));
}
