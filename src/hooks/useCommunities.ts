import { useCallback, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { communities as mockCommunities } from '../data/mockData';
import { Community, Player } from '../data/types';

interface CommunityRow {
  id: string;
  name: string;
  description: string;
  meetup_note: string;
  vibe: Community['vibe'];
}

interface MembershipRow {
  community_id: string;
  user_id: string;
}

interface Result {
  communities: Community[];
  joined: Record<string, boolean>;
  toggleJoin: (communityId: string) => void;
  loading: boolean;
}

export function useCommunities(currentUserId: string | null, players: Player[]): Result {
  const [mockJoined, setMockJoined] = useState<Record<string, boolean>>({});
  const [baseCommunities, setBaseCommunities] = useState<Community[]>(isSupabaseConfigured ? [] : mockCommunities);
  const [membership, setMembership] = useState<MembershipRow[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const refetch = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const [{ data: communityRows }, { data: memberRows }] = await Promise.all([
      supabase.from('communities').select('id, name, description, meetup_note, vibe'),
      supabase.from('community_members').select('community_id, user_id'),
    ]);
    setBaseCommunities(
      ((communityRows as CommunityRow[] | null) ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        meetupNote: row.meetup_note,
        vibe: row.vibe,
        memberCount: 0,
        memberIds: [],
      }))
    );
    setMembership((memberRows as MembershipRow[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const playerIds = new Set(players.map((p) => p.id));

  const communities: Community[] = isSupabaseConfigured
    ? baseCommunities.map((c) => {
        const memberIds = membership
          .filter((m) => m.community_id === c.id && m.user_id !== currentUserId && playerIds.has(m.user_id))
          .map((m) => m.user_id);
        return { ...c, memberIds, memberCount: memberIds.length };
      })
    : baseCommunities;

  const joined: Record<string, boolean> = isSupabaseConfigured
    ? Object.fromEntries(
        baseCommunities.map((c) => [
          c.id,
          membership.some((m) => m.community_id === c.id && m.user_id === currentUserId),
        ])
      )
    : mockJoined;

  const toggleJoin = useCallback(
    (communityId: string) => {
      if (!isSupabaseConfigured) {
        setMockJoined((prev) => ({ ...prev, [communityId]: !prev[communityId] }));
        return;
      }
      if (!currentUserId) return;
      const isJoined = membership.some((m) => m.community_id === communityId && m.user_id === currentUserId);
      if (isJoined) {
        setMembership((prev) => prev.filter((m) => !(m.community_id === communityId && m.user_id === currentUserId)));
        supabase.from('community_members').delete().eq('community_id', communityId).eq('user_id', currentUserId);
      } else {
        setMembership((prev) => [...prev, { community_id: communityId, user_id: currentUserId }]);
        supabase.from('community_members').insert({ community_id: communityId, user_id: currentUserId });
      }
    },
    [currentUserId, membership]
  );

  return { communities, joined, toggleJoin, loading };
}
