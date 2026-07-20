import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ChatMessage } from '../data/types';
import { playReceivedSound, playSentSound } from '../lib/sound';

const mockThread: ChatMessage[] = [
  {
    id: 'mock-1',
    matchRequestId: 'req-4',
    senderId: 'layla',
    body: "Hey! Looking forward to Saturday, see you at the court.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
];

interface MessageRow {
  id: string;
  match_request_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

const fromRow = (row: MessageRow): ChatMessage => ({
  id: row.id,
  matchRequestId: row.match_request_id,
  senderId: row.sender_id,
  body: row.body,
  createdAt: row.created_at,
});

interface Result {
  messages: ChatMessage[];
  loading: boolean;
  sendMessage: (body: string) => Promise<void>;
}

export function useMessages(matchRequestId: string | null, currentUserId: string | null): Result {
  const [mockMessages, setMockMessages] = useState<ChatMessage[]>(mockThread);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !matchRequestId) return;
    let cancelled = false;
    setLoading(true);

    (async () => {
      const { data } = await supabase
        .from('messages')
        .select('id, match_request_id, sender_id, body, created_at')
        .eq('match_request_id', matchRequestId)
        .order('created_at', { ascending: true });
      if (cancelled) return;
      setMessages(((data as MessageRow[] | null) ?? []).map(fromRow));
      setLoading(false);
    })();

    const channel = supabase
      .channel(`messages:${matchRequestId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_request_id=eq.${matchRequestId}` },
        (payload) => {
          const row = payload.new as MessageRow;
          if (row.sender_id !== currentUserId) playReceivedSound();
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, fromRow(row)]));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [matchRequestId, currentUserId]);

  const sendMessage = useCallback(
    async (body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;

      if (!isSupabaseConfigured || !matchRequestId) {
        if (!currentUserId) return;
        setMockMessages((prev) => [
          ...prev,
          {
            id: `mock-${Date.now()}`,
            matchRequestId: matchRequestId ?? 'mock',
            senderId: currentUserId,
            body: trimmed,
            createdAt: new Date().toISOString(),
          },
        ]);
        playSentSound();
        return;
      }

      if (!currentUserId) return;
      const { error } = await supabase
        .from('messages')
        .insert({ match_request_id: matchRequestId, sender_id: currentUserId, body: trimmed });
      if (!error) playSentSound();
    },
    [matchRequestId, currentUserId]
  );

  return { messages: isSupabaseConfigured ? messages : mockMessages, loading, sendMessage };
}
