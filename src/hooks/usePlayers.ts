import { useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { players as mockPlayers } from '../data/mockData';
import { Day, Player, TimeSlot, VerificationStatus } from '../data/types';
import { skillLabelFor } from '../logic/skill';
import { haversineKm } from '../logic/geo';
import { Coords } from './useLocation';

interface ProfileRow {
  id: string;
  name: string;
  bio: string;
  skill_level: number;
  home_court_id: string | null;
  competitive_elo: number;
  casual_games_played: number;
  latitude: number | null;
  longitude: number | null;
  contact_email: string | null;
  avatar_url: string | null;
  verification_status: VerificationStatus;
}

interface AvailabilityRow {
  user_id: string;
  day: Day;
  start_time: string;
  end_time: string;
}

interface RawPlayer {
  id: string;
  name: string;
  bio: string;
  skillLevel: number;
  homeCourtId: string;
  competitiveElo: number;
  casualGamesPlayed: number;
  latitude: number | null;
  longitude: number | null;
  contactEmail: string | null;
  avatarUrl: string | null;
  verificationStatus: VerificationStatus;
  availability: TimeSlot[];
}

const toHm = (time: string) => time.slice(0, 5);

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

export function usePlayers(currentUserId: string | null, myLocation?: Coords | null): { players: Player[]; loading: boolean } {
  const [rawPlayers, setRawPlayers] = useState<RawPlayer[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    (async () => {
      let profilesQuery = supabase
        .from('profiles')
        .select(
          'id, name, bio, skill_level, home_court_id, competitive_elo, casual_games_played, latitude, longitude, contact_email, avatar_url, verification_status'
        );
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

      setRawPlayers(
        ((profileRows as ProfileRow[] | null) ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          bio: row.bio,
          skillLevel: Number(row.skill_level),
          homeCourtId: row.home_court_id ?? '',
          competitiveElo: row.competitive_elo,
          casualGamesPlayed: row.casual_games_played,
          latitude: row.latitude,
          longitude: row.longitude,
          contactEmail: row.contact_email,
          avatarUrl: row.avatar_url,
          verificationStatus: row.verification_status,
          availability: slotsByUser.get(row.id) ?? [],
        }))
      );
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  const players: Player[] = useMemo(() => {
    if (!isSupabaseConfigured) return mockPlayers;
    return rawPlayers.map((row) => ({
      id: row.id,
      name: row.name,
      initials: initialsFor(row.name),
      skillLevel: row.skillLevel,
      skillLabel: skillLabelFor(row.skillLevel),
      bio: row.bio,
      homeCourtId: row.homeCourtId,
      distanceKm:
        myLocation && row.latitude != null && row.longitude != null
          ? haversineKm(myLocation.latitude, myLocation.longitude, row.latitude, row.longitude)
          : 0,
      availability: row.availability,
      competitiveElo: row.competitiveElo,
      casualGamesPlayed: row.casualGamesPlayed,
      contactEmail: row.contactEmail ?? undefined,
      avatarUrl: row.avatarUrl ?? undefined,
      verificationStatus: row.verificationStatus,
    }));
  }, [rawPlayers, myLocation]);

  return { players, loading };
}
