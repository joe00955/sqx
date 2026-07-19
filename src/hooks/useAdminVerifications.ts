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
  refetch: () => void;
  approve: (userId: string) => Promise<void>;
  reject: (userId: string) => Promise<void>;
}

const SIGNED_URL_TTL_SECONDS = 60 * 30;

export function useAdminVerifications(isAdmin: boolean): Result {
  const [pending, setPending] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(() => {
    if (!isAdmin) return;
    setLoading(true);
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

  const approve = useCallback(
    async (userId: string) => {
      await supabase.from('profiles').update({ verification_status: 'verified' }).eq('id', userId);
      setPending((prev) => prev.filter((p) => p.id !== userId));
    },
    []
  );

  const reject = useCallback(
    async (userId: string) => {
      await supabase.from('profiles').update({ verification_status: 'rejected' }).eq('id', userId);
      setPending((prev) => prev.filter((p) => p.id !== userId));
    },
    []
  );

  return { pending, loading, refetch, approve, reject };
}
