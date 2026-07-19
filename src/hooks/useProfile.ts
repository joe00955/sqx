import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Day, TimeSlot } from '../data/types';
import { slotKey } from '../logic/slotKey';

interface ProfileRow {
  name: string;
  bio: string;
  skill_level: number;
  home_court_id: string | null;
  competitive_elo: number;
  casual_games_played: number;
}

interface AvailabilityRow {
  day: Day;
  start_time: string;
  end_time: string;
  active: boolean;
}

interface ProfileState {
  loading: boolean;
  exists: boolean;
  name: string;
  bio: string;
  skillLevel: number;
  homeCourtId: string | null;
  competitiveElo: number;
  casualGamesPlayed: number;
  baseAvailability: TimeSlot[];
  activeSlots: Record<string, boolean>;
}

const EMPTY: ProfileState = {
  loading: true,
  exists: false,
  name: '',
  bio: '',
  skillLevel: 3,
  homeCourtId: null,
  competitiveElo: 1400,
  casualGamesPlayed: 0,
  baseAvailability: [],
  activeSlots: {},
};

const toHm = (time: string) => time.slice(0, 5);

export function useProfile(userId: string | null) {
  const [state, setState] = useState<ProfileState>(EMPTY);

  const refetch = useCallback(async () => {
    if (!userId) {
      setState({ ...EMPTY, loading: false });
      return;
    }
    setState((prev) => ({ ...prev, loading: true }));

    const [{ data: profile }, { data: slots }] = await Promise.all([
      supabase.from('profiles').select('name, bio, skill_level, home_court_id, competitive_elo, casual_games_played').eq('id', userId).maybeSingle(),
      supabase.from('availability_slots').select('day, start_time, end_time, active').eq('user_id', userId),
    ]);

    if (!profile) {
      setState({ ...EMPTY, loading: false, exists: false });
      return;
    }

    const p = profile as ProfileRow;
    const rows = (slots as AvailabilityRow[] | null) ?? [];
    const baseAvailability: TimeSlot[] = rows.map((row) => ({
      day: row.day,
      start: toHm(row.start_time),
      end: toHm(row.end_time),
    }));
    const activeSlots = Object.fromEntries(
      rows.map((row) => [slotKey({ day: row.day, start: toHm(row.start_time), end: toHm(row.end_time) }), row.active])
    );

    setState({
      loading: false,
      exists: true,
      name: p.name,
      bio: p.bio,
      skillLevel: Number(p.skill_level),
      homeCourtId: p.home_court_id,
      competitiveElo: p.competitive_elo,
      casualGamesPlayed: p.casual_games_played,
      baseAvailability,
      activeSlots,
    });
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const createProfile = useCallback(
    async (input: {
      name: string;
      skillLevel: number;
      homeCourtId: string;
      availability: TimeSlot[];
      contactEmail?: string | null;
    }) => {
      if (!userId) return;
      await supabase.from('profiles').insert({
        id: userId,
        name: input.name,
        bio: 'New to SquashX Rally — up for casual games or a fair match.',
        skill_level: input.skillLevel,
        home_court_id: input.homeCourtId,
        contact_email: input.contactEmail ?? null,
      });
      if (input.availability.length > 0) {
        await supabase.from('availability_slots').insert(
          input.availability.map((slot) => ({
            user_id: userId,
            day: slot.day,
            start_time: slot.start,
            end_time: slot.end,
            active: true,
          }))
        );
      }
      await refetch();
    },
    [userId, refetch]
  );

  const updateSkillLevel = useCallback(
    async (skillLevel: number) => {
      if (!userId) return;
      setState((prev) => ({ ...prev, skillLevel }));
      await supabase.from('profiles').update({ skill_level: skillLevel }).eq('id', userId);
    },
    [userId]
  );

  const toggleSlotActive = useCallback(
    async (slot: TimeSlot) => {
      if (!userId) return;
      const key = slotKey(slot);
      const nextActive = !state.activeSlots[key];
      setState((prev) => ({ ...prev, activeSlots: { ...prev.activeSlots, [key]: nextActive } }));
      await supabase
        .from('availability_slots')
        .update({ active: nextActive })
        .eq('user_id', userId)
        .eq('day', slot.day)
        .eq('start_time', slot.start)
        .eq('end_time', slot.end);
    },
    [userId, state.activeSlots]
  );

  const updateLocation = useCallback(
    async (latitude: number, longitude: number) => {
      if (!userId) return;
      await supabase.from('profiles').update({ latitude, longitude }).eq('id', userId);
    },
    [userId]
  );

  return { ...state, refetch, createProfile, updateSkillLevel, toggleSlotActive, updateLocation };
}
