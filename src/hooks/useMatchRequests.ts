import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { incomingRequests as mockRequests } from '../data/mockData';
import { Day, IncomingRequest, MatchMode, RequestStatus } from '../data/types';
import { SuggestedBooking } from '../logic/matching';

interface RequestRow {
  id: string;
  from_user_id: string;
  to_user_id: string;
  mode: MatchMode;
  day: Day;
  start_time: string;
  end_time: string;
  court_id: string | null;
  status: RequestStatus;
}

const toHm = (time: string) => time.slice(0, 5);

interface Result {
  incoming: IncomingRequest[];
  outgoing: IncomingRequest[];
  respond: (id: string, status: RequestStatus) => Promise<void>;
  sendRequest: (input: { toUserId: string; mode: MatchMode; booking: SuggestedBooking }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useMatchRequests(currentUserId: string | null): Result {
  const [mockState, setMockState] = useState<IncomingRequest[]>(mockRequests);
  const [incomingRows, setIncomingRows] = useState<RequestRow[]>([]);
  const [outgoingRows, setOutgoingRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured || !currentUserId) return;
    setLoading(true);
    const columns = 'id, from_user_id, to_user_id, mode, day, start_time, end_time, court_id, status';
    const [{ data: incoming }, { data: outgoing }] = await Promise.all([
      supabase.from('match_requests').select(columns).eq('to_user_id', currentUserId).order('created_at', { ascending: false }),
      supabase.from('match_requests').select(columns).eq('from_user_id', currentUserId).order('created_at', { ascending: false }),
    ]);
    setIncomingRows((incoming as RequestRow[] | null) ?? []);
    setOutgoingRows((outgoing as RequestRow[] | null) ?? []);
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const toIncomingRequest = (row: RequestRow): IncomingRequest => ({
    id: row.id,
    playerId: row.from_user_id,
    mode: row.mode,
    day: row.day,
    start: toHm(row.start_time),
    end: toHm(row.end_time),
    courtId: row.court_id ?? '',
    status: row.status,
  });

  const toOutgoingRequest = (row: RequestRow): IncomingRequest => ({
    id: row.id,
    playerId: row.to_user_id,
    mode: row.mode,
    day: row.day,
    start: toHm(row.start_time),
    end: toHm(row.end_time),
    courtId: row.court_id ?? '',
    status: row.status,
  });

  const incoming: IncomingRequest[] = isSupabaseConfigured ? incomingRows.map(toIncomingRequest) : mockState;
  const outgoing: IncomingRequest[] = isSupabaseConfigured ? outgoingRows.map(toOutgoingRequest) : [];

  const respond = useCallback(async (id: string, status: RequestStatus) => {
    setError(null);
    if (!isSupabaseConfigured) {
      setMockState((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      return;
    }

    const { data, error: updateError } = await supabase
      .from('match_requests')
      .update({ status })
      .eq('id', id)
      .select('id');

    if (updateError) {
      setError(updateError.message);
      return;
    }
    if (!data || data.length === 0) {
      setError("That didn't save — the request may no longer be pending. Try reloading.");
      return;
    }

    setIncomingRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }, []);

  const sendRequest = useCallback(
    async (input: { toUserId: string; mode: MatchMode; booking: SuggestedBooking }) => {
      if (!isSupabaseConfigured || !currentUserId) return;
      setError(null);

      // If they've already sent us a pending request, that's a mutual match —
      // accept theirs instead of creating a second, opposite-direction request.
      const { data: reverse } = await supabase
        .from('match_requests')
        .select('id')
        .eq('from_user_id', input.toUserId)
        .eq('to_user_id', currentUserId)
        .eq('status', 'pending')
        .maybeSingle();

      if (reverse) {
        const { error: updateError } = await supabase
          .from('match_requests')
          .update({ status: 'accepted' })
          .eq('id', reverse.id);
        if (updateError) setError(updateError.message);
      } else {
        const { error: insertError } = await supabase.from('match_requests').insert({
          from_user_id: currentUserId,
          to_user_id: input.toUserId,
          mode: input.mode,
          day: input.booking.day,
          start_time: input.booking.start,
          end_time: input.booking.end,
          court_id: input.booking.court.id,
        });
        if (insertError) setError(insertError.message);
      }

      await refetch();
    },
    [currentUserId, refetch]
  );

  return { incoming, outgoing, respond, sendRequest, loading, error };
}
