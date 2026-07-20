import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Result {
  blockedIds: Set<string>;
  blockUser: (targetId: string) => void;
  reportUser: (targetId: string, reason: string, details: string, matchRequestId?: string | null) => Promise<void>;
}

export function useSafety(currentUserId: string | null): Result {
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isSupabaseConfigured || !currentUserId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('blocked_users').select('blocked_id').eq('blocker_id', currentUserId);
      if (cancelled) return;
      setBlockedIds(new Set((data ?? []).map((row) => row.blocked_id as string)));
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  const blockUser = useCallback(
    (targetId: string) => {
      if (!isSupabaseConfigured || !currentUserId) return;
      setBlockedIds((prev) => new Set(prev).add(targetId));
      supabase.from('blocked_users').insert({ blocker_id: currentUserId, blocked_id: targetId });
    },
    [currentUserId]
  );

  const reportUser = useCallback(
    async (targetId: string, reason: string, details: string, matchRequestId?: string | null) => {
      if (!isSupabaseConfigured || !currentUserId) return;
      await supabase.from('reports').insert({
        reporter_id: currentUserId,
        reported_id: targetId,
        reason,
        details,
        match_request_id: matchRequestId ?? null,
      });
    },
    [currentUserId]
  );

  return { blockedIds, blockUser, reportUser };
}
