import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { incomingRequests as mockRequests } from '../data/mockData';
import { Day, IncomingRequest, MatchMode, RequestStatus } from '../data/types';
import { SuggestedBooking } from '../logic/matching';

interface RequestRow {
  id: string;
  from_user_id: string;
  mode: MatchMode;
  day: Day;
  start_time: string;
  end_time: string;
  court_id: string | null;
  status: RequestStatus;
}

const toHm = (time: string) => time.slice(0, 5);

interface Result {
  requests: IncomingRequest[];
  respond: (id: string, status: RequestStatus) => void;
  sendRequest: (input: { toUserId: string; mode: MatchMode; booking: SuggestedBooking }) => Promise<void>;
  loading: boolean;
}

export function useMatchRequests(currentUserId: string | null): Result {
  const [mockState, setMockState] = useState<IncomingRequest[]>(mockRequests);
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured || !currentUserId) return;
    setLoading(true);
    const { data } = await supabase
      .from('match_requests')
      .select('id, from_user_id, mode, day, start_time, end_time, court_id, status')
      .eq('to_user_id', currentUserId)
      .order('created_at', { ascending: false });
    setRows((data as RequestRow[] | null) ?? []);
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const requests: IncomingRequest[] = isSupabaseConfigured
    ? rows.map((row) => ({
        id: row.id,
        playerId: row.from_user_id,
        mode: row.mode,
        day: row.day,
        start: toHm(row.start_time),
        end: toHm(row.end_time),
        courtId: row.court_id ?? '',
        status: row.status,
      }))
    : mockState;

  const respond = useCallback((id: string, status: RequestStatus) => {
    if (!isSupabaseConfigured) {
      setMockState((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    supabase.from('match_requests').update({ status }).eq('id', id);
  }, []);

  const sendRequest = useCallback(
    async (input: { toUserId: string; mode: MatchMode; booking: SuggestedBooking }) => {
      if (!isSupabaseConfigured || !currentUserId) return;
      await supabase.from('match_requests').insert({
        from_user_id: currentUserId,
        to_user_id: input.toUserId,
        mode: input.mode,
        day: input.booking.day,
        start_time: input.booking.start,
        end_time: input.booking.end,
        court_id: input.booking.court.id,
      });
    },
    [currentUserId]
  );

  return { requests, respond, sendRequest, loading };
}
