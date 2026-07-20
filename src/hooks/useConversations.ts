import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { IncomingRequest } from '../data/types';

export interface Conversation {
  requestId: string;
  playerId: string;
  lastMessageBody: string | null;
  lastMessageAt: string | null;
}

interface LatestRow {
  match_request_id: string;
  body: string;
  created_at: string;
}

export function useConversations(accepted: IncomingRequest[]): { conversations: Conversation[]; loading: boolean } {
  const [latest, setLatest] = useState<Map<string, { body: string; createdAt: string }>>(new Map());
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const requestIds = accepted.map((r) => r.id).join(',');

  useEffect(() => {
    if (!isSupabaseConfigured || accepted.length === 0) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data } = await supabase
        .from('messages')
        .select('match_request_id, body, created_at')
        .in('match_request_id', accepted.map((r) => r.id))
        .order('created_at', { ascending: false });
      if (cancelled) return;

      const byRequest = new Map<string, { body: string; createdAt: string }>();
      ((data as LatestRow[] | null) ?? []).forEach((row) => {
        if (!byRequest.has(row.match_request_id)) {
          byRequest.set(row.match_request_id, { body: row.body, createdAt: row.created_at });
        }
      });
      setLatest(byRequest);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestIds]);

  const conversations: Conversation[] = accepted
    .map((r) => ({
      requestId: r.id,
      playerId: r.playerId,
      lastMessageBody: latest.get(r.id)?.body ?? null,
      lastMessageAt: latest.get(r.id)?.createdAt ?? null,
    }))
    .sort((a, b) => {
      if (!a.lastMessageAt && !b.lastMessageAt) return 0;
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return b.lastMessageAt.localeCompare(a.lastMessageAt);
    });

  return { conversations, loading };
}
