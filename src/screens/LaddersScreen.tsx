import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { players } from '../data/mockData';
import { Player } from '../data/types';
import { casualLadder, competitiveLadder, LadderRow } from '../logic/ladder';
import { colors, radius, spacing } from '../theme';

type LadderMode = 'competitive' | 'casual';

interface Props {
  me: Player;
}

const rankColors: Record<number, string> = {
  1: '#FFC94D',
  2: '#C9CCD1',
  3: '#D08A52',
};

function LadderRowItem({ row, mode }: { row: LadderRow; mode: LadderMode }) {
  const medalColor = rankColors[row.rank];
  return (
    <View style={[styles.row, row.isMe && styles.rowMe]}>
      <View style={styles.rankWrap}>
        {medalColor ? (
          <Ionicons name="trophy" size={18} color={medalColor} />
        ) : (
          <Text style={styles.rankText}>{row.rank}</Text>
        )}
      </View>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{row.player.initials}</Text>
      </View>
      <View style={styles.nameWrap}>
        <Text style={styles.name}>
          {row.player.name}
          {row.isMe && <Text style={styles.youTag}>  (you)</Text>}
        </Text>
        <Text style={styles.subtitle}>{row.player.skillLabel}</Text>
      </View>
      <View style={styles.statWrap}>
        {mode === 'competitive' ? (
          <>
            <Text style={styles.statValue}>{row.player.competitiveElo}</Text>
            <Text style={styles.statUnit}>ELO</Text>
          </>
        ) : (
          <>
            <Text style={styles.statValue}>{row.player.casualGamesPlayed}</Text>
            <Text style={styles.statUnit}>games</Text>
          </>
        )}
      </View>
    </View>
  );
}

export default function LaddersScreen({ me }: Props) {
  const [mode, setMode] = useState<LadderMode>('competitive');

  const rows = useMemo(
    () => (mode === 'competitive' ? competitiveLadder(me, players) : casualLadder(me, players)),
    [mode, me, players]
  );

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>Ladders</Text>
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

      <FlatList
        data={rows}
        keyExtractor={(item) => item.player.id}
        renderItem={({ item }) => <LadderRowItem row={item} mode={mode} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
    fontSize: 22,
    fontWeight: '800',
  },
  subtitleHeader: {
    color: colors.textMuted,
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
    marginBottom: spacing.md,
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
    fontSize: 13,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: colors.accentText,
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
  rankWrap: {
    width: 26,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  rankText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 14,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.accentText,
    fontWeight: '800',
    fontSize: 13,
  },
  nameWrap: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  youTag: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  statWrap: {
    alignItems: 'flex-end',
  },
  statValue: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '800',
  },
  statUnit: {
    color: colors.textFaint,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
