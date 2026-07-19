import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface PendingVerification {
  id: string;
  name: string;
  avatarUrl: string | null;
  videoUrl: string | null;
  videoPath: string | null;
}

interface Result {
  pending: PendingVerification[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  approve: (userId: string, videoPath: string | null) => Promise<void>;
  reject: (userId: string, videoPath: string | null) => Promise<void>;
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
          return {
            id: row.id,
            name: row.name,
            avatarUrl: row.avatar_url,
            videoUrl,
            videoPath: row.verification_video_path,
          };
        })
      );
      setPending(withVideoUrls);
      setLoading(false);
    })();
  }, [isAdmin]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Once a decision is made the video has served its purpose — delete it rather
  // than retain it indefinitely (GDPR storage-limitation: keep data only as long
  // as it's needed for the purpose it was collected for).
  const setStatus = useCallback(async (userId: string, status: 'verified' | 'rejected', videoPath: string | null) => {
    setError(null);
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ verification_status: status, verification_video_path: null })
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

    if (videoPath) {
      const { error: removeError } = await supabase.storage.from('verification-videos').remove([videoPath]);
      if (removeError) {
        setError(`Status updated, but the video couldn't be deleted: ${removeError.message}`);
      }
    }

    setPending((prev) => prev.filter((p) => p.id !== userId));
  }, []);

  const approve = useCallback(
    (userId: string, videoPath: string | null) => setStatus(userId, 'verified', videoPath),
    [setStatus]
  );
  const reject = useCallback(
    (userId: string, videoPath: string | null) => setStatus(userId, 'rejected', videoPath),
    [setStatus]
  );

  return { pending, loading, error, refetch, approve, reject };
}
