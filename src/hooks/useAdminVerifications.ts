import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface PendingVerification {
  id: string;
  name: string;
  avatarUrl: string | null;
  videoUrl: string | null;
}

interface Result {
  pending: PendingVerification[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  approve: (userId: string) => Promise<void>;
  reject: (userId: string) => Promise<void>;
}

const SIGNED_URL_TTL_SECONDS = 60 * 30;

export function useAdminVerifications(isAdmin: boolean): Result {
  const [pending, setPending] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, verification_video_path')
        .eq('verification_status', 'pending');

      const rows = data ?? [];
      const withVideoUrls = await Promise.all(
        rows.map(async (row) => {
          let videoUrl: string | null = null;
          if (row.verification_video_path) {
            const { data: signed } = await supabase.storage
              .from('verification-videos')
              .createSignedUrl(row.verification_video_path, SIGNED_URL_TTL_SECONDS);
            videoUrl = signed?.signedUrl ?? null;
          }
          return { id: row.id, name: row.name, avatarUrl: row.avatar_url, videoUrl };
        })
      );
      setPending(withVideoUrls);
      setLoading(false);
    })();
  }, [isAdmin]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const setStatus = useCallback(async (userId: string, status: 'verified' | 'rejected') => {
    setError(null);
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ verification_status: status })
      .eq('id', userId)
      .select('id');

    if (updateError) {
      setError(updateError.message);
      return;
    }
    if (!data || data.length === 0) {
      setError(
        "Update didn't apply — your account may be missing the admin RLS policy on profiles. See the migration SQL for 'admins can update any profile'."
      );
      return;
    }
    setPending((prev) => prev.filter((p) => p.id !== userId));
  }, []);

  const approve = useCallback((userId: string) => setStatus(userId, 'verified'), [setStatus]);
  const reject = useCallback((userId: string) => setStatus(userId, 'rejected'), [setStatus]);

  return { pending, loading, error, refetch, approve, reject };
}
