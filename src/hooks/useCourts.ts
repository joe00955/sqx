import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { courts as mockCourts } from '../data/mockData';
import { Court, Day, TimeSlot } from '../data/types';

interface CourtRow {
  id: string;
  name: string;
  address: string;
}

interface SlotRow {
  court_id: string;
  day: Day;
  start_time: string;
  end_time: string;
}

const toHm = (time: string) => time.slice(0, 5);

export function useCourts(): { courts: Court[]; loading: boolean } {
  const [courts, setCourts] = useState<Court[]>(isSupabaseConfigured ? [] : mockCourts);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    (async () => {
      const [{ data: courtRows }, { data: slotRows }] = await Promise.all([
        supabase.from('courts').select('id, name, address'),
        supabase.from('court_bookable_slots').select('court_id, day, start_time, end_time'),
      ]);
      if (cancelled) return;

      const slotsByCourtId = new Map<string, TimeSlot[]>();
      ((slotRows as SlotRow[] | null) ?? []).forEach((row) => {
        const slot: TimeSlot = { day: row.day, start: toHm(row.start_time), end: toHm(row.end_time) };
        const list = slotsByCourtId.get(row.court_id) ?? [];
        list.push(slot);
        slotsByCourtId.set(row.court_id, list);
      });

      setCourts(
        ((courtRows as CourtRow[] | null) ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          address: row.address,
          distanceKm: 0,
          bookableSlots: slotsByCourtId.get(row.id) ?? [],
        }))
      );
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { courts, loading };
}
