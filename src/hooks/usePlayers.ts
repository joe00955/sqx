import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { players as mockPlayers } from '../data/mockData';
import { Day, Player, TimeSlot } from '../data/types';
import { skillLabelFor } from '../logic/skill';

interface ProfileRow {
  id: string;
  name: string;
  bio: string;
  skill_level: number;
  home_court_id: string | null;
  competitive_elo: number;
  casual_games_played: number;
}

interface AvailabilityRow {
  user_id: string;
  day: Day;
  start_time: string;
  end_time: string;
}

const toHm = (time: string) => time.slice(0, 5);

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export function usePlayers(currentUserId: string | null): { players: Player[]; loading: boolean } {
  const [players, setPlayers] = useState<Player[]>(isSupabaseConfigured ? [] : mockPlayers);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    (async () => {
      let profilesQuery = supabase
        .from('profiles')
        .select('id, name, bio, skill_level, home_court_id, competitive_elo, casual_games_played');
      if (currentUserId) {
        profilesQuery = profilesQuery.neq('id', currentUserId);
      }

      const [{ data: profileRows }, { data: slotRows }] = await Promise.all([
        profilesQuery,
        supabase.from('availability_slots').select('user_id, day, start_time, end_time').eq('active', true),
      ]);
      if (cancelled) return;

      const slotsByUser = new Map<string, TimeSlot[]>();
      ((slotRows as AvailabilityRow[] | null) ?? []).forEach((row) => {
        const list = slotsByUser.get(row.user_id) ?? [];
        list.push({ day: row.day, start: toHm(row.start_time), end: toHm(row.end_time) });
        slotsByUser.set(row.user_id, list);
      });

      setPlayers(
        ((profileRows as ProfileRow[] | null) ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          initials: initialsFor(row.name),
          skillLevel: Number(row.skill_level),
          skillLabel: skillLabelFor(Number(row.skill_level)),
          bio: row.bio,
          homeCourtId: row.home_court_id ?? '',
          distanceKm: 0,
          availability: slotsByUser.get(row.id) ?? [],
          competitiveElo: row.competitive_elo,
          casualGamesPlayed: row.casual_games_played,
        }))
      );
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  return { players, loading };
}
