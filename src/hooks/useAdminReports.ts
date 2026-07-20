import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface AdminReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedId: string;
  reportedName: string;
  matchRequestId: string | null;
  reason: string;
  details: string;
  createdAt: string;
}

interface ReportRow {
  id: string;
  reporter_id: string;
  reported_id: string;
  match_request_id: string | null;
  reason: string;
  details: string;
  created_at: string;
}

interface Result {
  reports: AdminReport[];
  loading: boolean;
  refetch: () => void;
}

export function useAdminReports(isAdmin: boolean): Result {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(() => {
    if (!isAdmin) return;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('reports')
        .select('id, reporter_id, reported_id, match_request_id, reason, details, created_at')
        .order('created_at', { ascending: false });

      const rows = (data as ReportRow[] | null) ?? [];
      const ids = Array.from(new Set(rows.flatMap((r) => [r.reporter_id, r.reported_id])));
      const { data: profileRows } = ids.length
        ? await supabase.from('profiles').select('id, name').in('id', ids)
        : { data: [] as { id: string; name: string }[] };
      const nameById = new Map((profileRows ?? []).map((p) => [p.id, p.name]));

      setReports(
        rows.map((r) => ({
          id: r.id,
          reporterId: r.reporter_id,
          reporterName: nameById.get(r.reporter_id) ?? 'Unknown',
          reportedId: r.reported_id,
          reportedName: nameById.get(r.reported_id) ?? 'Unknown',
          matchRequestId: r.match_request_id,
          reason: r.reason,
          details: r.details,
          createdAt: r.created_at,
        }))
      );
      setLoading(false);
    })();
  }, [isAdmin]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { reports, loading, refetch };
}
