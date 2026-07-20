import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Player } from '../data/types';
import { casualLadder, competitiveLadder, LadderRow } from '../logic/ladder';
import Avatar from '../components/Avatar';
import UpgradeModal from '../components/UpgradeModal';
import { colors, fonts, radius, spacing } from '../theme';

type LadderMode = 'competitive' | 'casual';

interface Props {
  me: Player;
  players: Player[];
  isSubscribed?: boolean;
  checkoutUrl?: string | null;
}

const podiumColors: Record<1 | 2 | 3, string> = {
  1: colors.accent,
  2: '#C9CCD1',
  3: '#D08A52',
};

const podiumHeights: Record<1 | 2 | 3, number> = {
  1: 76,
  2: 54,
  3: 40,
};

const podiumAvatarSizes: Record<1 | 2 | 3, number> = {
  1: 60,
  2: 48,
  3: 46,
};

function statFor(row: LadderRow, mode: LadderMode) {
  return mode === 'competitive' ? row.player.competitiveElo : row.player.casualGamesPlayed;
}

function PodiumBlock({ row, mode, place }: { row: LadderRow; mode: LadderMode; place: 1 | 2 | 3 }) {
  return (
    <View style={[styles.podiumBlock, place === 1 && styles.podiumBlockFirst]}>
      <Ionicons name="trophy" size={14} color={podiumColors[place]} style={styles.podiumTrophy} />
      <Avatar
        playerId={row.player.id}
        size={podiumAvatarSizes[place]}
        style={[styles.podiumAvatar, row.isMe && { borderColor: colors.accent, borderWidth: 2 }]}
      />
      <Text style={styles.podiumName} numberOfLines={1}>
        {row.isMe ? 'You' : row.player.name.split(' ')[0]}
      </Text>
      <Text style={styles.podiumStat}>
        {statFor(row, mode)}
        <Text style={styles.podiumStatUnit}>{mode === 'competitive' ? '' : ' gm'}</Text>
      </Text>
      <View style={[styles.riser, { height: podiumHeights[place], backgroundColor: podiumColors[place] }]}>
        <Text style={styles.riserText}>{place}</Text>
      </View>
    </View>
  );
}

function LadderRowItem({ row, mode }: { row: LadderRow; mode: LadderMode }) {
  return (
    <View style={[styles.row, row.isMe && styles.rowMe]}>
      <Text style={styles.rankText}>{row.rank}</Text>
      <Avatar playerId={row.player.id} size={38} style={styles.avatar} />
      <View style={styles.nameWrap}>
        <Text style={styles.name}>
          {row.player.name}
          {row.isMe && <Text style={styles.youTag}>  (you)</Text>}
        </Text>
        <Text style={styles.subtitle}>{row.player.skillLabel}</Text>
      </View>
      <View style={styles.statWrap}>
        <Text style={styles.statValue}>{statFor(row, mode)}</Text>
        <Text style={styles.statUnit}>{mode === 'competitive' ? 'ELO' : 'games'}</Text>
      </View>
    </View>
  );
}

export default function LaddersScreen({ me, players, isSubscribed = true, checkoutUrl = null }: Props) {
  const [mode, setMode] = useState<LadderMode>('competitive');
  const [upgradeVisible, setUpgradeVisible] = useState(false);

  const rows = useMemo(
    () => (mode === 'competitive' ? competitiveLadder(me, players) : casualLadder(me, players)),
    [mode, me, players]
  );

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);
  const [first, second, third] = podium;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>LADDERS</Text>
        <Text style={styles.subtitleHeader}>
          {mode === 'competitive'
            ? 'Ranked by ELO — opt in per match to climb'
            : 'No pressure — just a fun tally of games played'}
        </Text>
      </View>

      <View style={styles.segmentRow}>
        <Pressable
          style={[styles.segment, mode === 'competitive' && styles.segmentActive]}
          onPress={() => setMode('competitive')}
        >
          <Ionicons
            name="podium-outline"
            size={14}
            color={mode === 'competitive' ? colors.accentText : colors.textMuted}
          />
          <Text style={[styles.segmentText, mode === 'competitive' && styles.segmentTextActive]}>Competitive</Text>
        </Pressable>
        <Pressable
          style={[styles.segment, mode === 'casual' && styles.segmentActive]}
          onPress={() => setMode('casual')}
        >
          <Ionicons
            name="happy-outline"
            size={14}
            color={mode === 'casual' ? colors.accentText : colors.textMuted}
          />
          <Text style={[styles.segmentText, mode === 'casual' && styles.segmentTextActive]}>Casual</Text>
        </Pressable>
      </View>

      {mode === 'competitive' && !isSubscribed && (
        <Pressable style={styles.upsellBanner} onPress={() => setUpgradeVisible(true)}>
          <Ionicons name="lock-closed" size={15} color={colors.accent} />
          <Text style={styles.upsellText}>
            You can see the ladder, but you'll need Competitive to climb it.
          </Text>
          <Text style={styles.upsellCta}>Upgrade</Text>
        </Pressable>
      )}

      {podium.length === 3 && (
        <View style={styles.podiumRow}>
          <PodiumBlock row={second} mode={mode} place={2} />
          <PodiumBlock row={first} mode={mode} place={1} />
          <PodiumBlock row={third} mode={mode} place={3} />
        </View>
      )}

      <FlatList
        data={rest}
        keyExtractor={(item) => item.player.id}
        renderItem={({ item }) => <LadderRowItem row={item} mode={mode} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      <UpgradeModal visible={upgradeVisible} checkoutUrl={checkoutUrl} onClose={() => setUpgradeVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: 0.4,
  },
  subtitleHeader: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginTop: 3,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: spacing.lg,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.pill,
  },
  segmentActive: {
    backgroundColor: colors.accent,
  },
  segmentText: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  segmentTextActive: {
    color: colors.accentText,
  },
  upsellBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  upsellText: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  upsellCta: {
    color: colors.accent,
    fontFamily: fonts.bold,
    fontSize: 12.5,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
    marginBottom: spacing.lg,
  },
  podiumBlock: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 120,
  },
  podiumBlockFirst: {
    marginBottom: 10,
  },
  podiumTrophy: {
    marginBottom: 4,
  },
  podiumAvatar: {
    marginBottom: 6,
  },
  podiumName: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 12.5,
    marginBottom: 2,
  },
  podiumStat: {
    color: colors.accent,
    fontFamily: fonts.display,
    fontSize: 15,
    marginBottom: 8,
  },
  podiumStatUnit: {
    fontFamily: fonts.bold,
    fontSize: 9,
  },
  riser: {
    width: '100%',
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
  },
  riserText: {
    color: colors.accentText,
    fontFamily: fonts.extrabold,
    fontSize: 16,
  },
  list: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowMe: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  rankText: {
    width: 26,
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 14,
    marginRight: spacing.sm,
  },
  avatar: {
    marginRight: spacing.md,
  },
  nameWrap: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  youTag: {
    color: colors.accent,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 2,
  },
  statWrap: {
    alignItems: 'flex-end',
  },
  statValue: {
    color: colors.accent,
    fontFamily: fonts.display,
    fontSize: 18,
  },
  statUnit: {
    color: colors.textFaint,
    fontFamily: fonts.bold,
    fontSize: 10,
    textTransform: 'uppercase',
  },
});
