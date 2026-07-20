import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Result {
  error: string | null;
  banUser: (userId: string, reason: string) => Promise<boolean>;
  unbanUser: (userId: string) => Promise<boolean>;
  warnUser: (userId: string, message: string) => Promise<boolean>;
}

export function useAdminModeration(): Result {
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (userId: string, patch: Record<string, unknown>) => {
    setError(null);
    const { data, error: updateError } = await supabase.from('profiles').update(patch).eq('id', userId).select('id');
    if (updateError) {
      setError(updateError.message);
      return false;
    }
    if (!data || data.length === 0) {
      setError("That didn't save — check the admin RLS policy on profiles.");
      return false;
    }
    return true;
  }, []);

  const banUser = useCallback(
    (userId: string, reason: string) => run(userId, { banned: true, ban_reason: reason }),
    [run]
  );

  const unbanUser = useCallback((userId: string) => run(userId, { banned: false, ban_reason: null }), [run]);

  const warnUser = useCallback(
    (userId: string, message: string) =>
      run(userId, { warning_message: message, warned_at: new Date().toISOString() }),
    [run]
  );

  return { error, banUser, unbanUser, warnUser };
}
