import { useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { courts as mockCourts } from '../data/mockData';
import { Court, Day, TimeSlot } from '../data/types';
import { haversineKm } from '../logic/geo';
import { Coords } from './useLocation';

interface CourtRow {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface SlotRow {
  court_id: string;
  day: Day;
  start_time: string;
  end_time: string;
}

interface RawCourt {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  bookableSlots: TimeSlot[];
}

const toHm = (time: string) => time.slice(0, 5);

export function useCourts(myLocation?: Coords | null): { courts: Court[]; loading: boolean } {
  const [rawCourts, setRawCourts] = useState<RawCourt[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    (async () => {
      const [{ data: courtRows }, { data: slotRows }] = await Promise.all([
        supabase.from('courts').select('id, name, address, latitude, longitude'),
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

      setRawCourts(
        ((courtRows as CourtRow[] | null) ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          address: row.address,
          latitude: row.latitude,
          longitude: row.longitude,
          bookableSlots: slotsByCourtId.get(row.id) ?? [],
        }))
      );
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const courts: Court[] = useMemo(() => {
    if (!isSupabaseConfigured) return mockCourts;
    return rawCourts.map((court) => ({
      id: court.id,
      name: court.name,
      address: court.address,
      distanceKm: myLocation
        ? haversineKm(myLocation.latitude, myLocation.longitude, court.latitude, court.longitude)
        : 0,
      bookableSlots: court.bookableSlots,
    }));
  }, [rawCourts, myLocation]);

  return { courts, loading };
}
