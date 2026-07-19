import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { players, courts } from '../data/mockData';
import { MatchMode, Player } from '../data/types';
import { findMatches, MatchResult } from '../logic/matching';
import SwipeCard from '../components/SwipeCard';
import PressScale from '../components/PressScale';
import { colors, fonts, radius, spacing } from '../theme';

type SortMode = 'best' | 'closest' | 'skill' | 'availability';

const sortModes: { key: SortMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'best', label: 'Best match', icon: 'sparkles-outline' },
  { key: 'closest', label: 'Closest', icon: 'location-outline' },
  { key: 'skill', label: 'Similar skill', icon: 'trophy-outline' },
  { key: 'availability', label: 'Has a slot', icon: 'time-outline' },
];

function sortMatches(matches: MatchResult[], mode: SortMode): MatchResult[] {
  const copy = [...matches];
  switch (mode) {
    case 'closest':
      return copy.sort((a, b) => a.player.distanceKm - b.player.distanceKm);
    case 'skill':
      return copy.sort((a, b) => a.skillDiff - b.skillDiff);
    case 'availability':
      return copy.sort((a, b) => b.suggestedBookings.length - a.suggestedBookings.length);
    case 'best':
    default:
      return copy.sort((a, b) => b.score - a.score);
  }
}

const STACK_DEPTH = 3;

interface Props {
  me: Player;
}

export default function BrowseScreen({ me }: Props) {
  const [sortMode, setSortMode] = useState<SortMode>('best');
  const [mode, setMode] = useState<MatchMode>('casual');
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  const allMatches = useMemo(() => findMatches(me, players, courts), [me]);
  const sorted = useMemo(() => sortMatches(allMatches, sortMode), [allMatches, sortMode]);
  const remaining = useMemo(() => sorted.filter((m) => !dismissed[m.player.id]), [sorted, dismissed]);
  const visibleStack = remaining.slice(0, STACK_DEPTH);
  const topId = visibleStack[0]?.player.id;

  const dismiss = (playerId: string) => setDismissed((prev) => ({ ...prev, [playerId]: true }));
  const startOver = () => setDismissed({});

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>FIND A GAME</Text>
        <Text style={styles.subtitle}>{me.availability.length} slot(s) active this week</Text>
      </View>

      <View style={styles.filterRow}>
        {sortModes.map((sm) => {
          const active = sm.key === sortMode;
          return (
            <Pressable
              key={sm.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setSortMode(sm.key)}
            >
              <Ionicons
                name={sm.icon}
                size={13}
                color={active ? colors.accentText : colors.textMuted}
                style={styles.filterIcon}
              />
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{sm.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.modeRow}>
        <Pressable style={[styles.modeChip, mode === 'casual' && styles.modeChipActive]} onPress={() => setMode('casual')}>
          <Ionicons name="happy-outline" size={13} color={mode === 'casual' ? colors.accentText : colors.textMuted} />
          <Text style={[styles.modeText, mode === 'casual' && styles.modeTextActive]}>Casual</Text>
        </Pressable>
        <Pressable
          style={[styles.modeChip, mode === 'competitive' && styles.modeChipActive]}
          onPress={() => setMode('competitive')}
        >
          <Ionicons name="podium-outline" size={13} color={mode === 'competitive' ? colors.accentText : colors.textMuted} />
          <Text style={[styles.modeText, mode === 'competitive' && styles.modeTextActive]}>Competitive · affects ELO</Text>
        </Pressable>
      </View>

      <View style={styles.deckArea}>
        {visibleStack.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={32} color={colors.textFaint} />
            <Text style={styles.emptyTitle}>You've seen everyone</Text>
            <Text style={styles.emptySubtitle}>
              Check back later for new players, or start over to review who you passed on.
            </Text>
            <PressScale style={styles.startOverButton} onPress={startOver}>
              <Ionicons name="refresh-outline" size={15} color={colors.accentText} />
              <Text style={styles.startOverText}>Start over</Text>
            </PressScale>
          </View>
        ) : (
          visibleStack
            .slice()
            .reverse()
            .map((match, reverseIndex) => {
              const stackIndex = visibleStack.length - 1 - reverseIndex;
              return (
                <SwipeCard
                  key={match.player.id}
                  match={match}
                  mode={mode}
                  active={stackIndex === 0}
                  stackIndex={stackIndex}
                  onSwipe={() => dismiss(match.player.id)}
                />
              );
            })
        )}
      </View>

      {visibleStack.length > 0 && (
        <View style={styles.actionRow}>
          <PressScale style={[styles.actionButton, styles.passButton]} onPress={() => topId && dismiss(topId)}>
            <Ionicons name="close" size={22} color={colors.textMuted} />
          </PressScale>
          <PressScale style={[styles.actionButton, styles.requestButton]} onPress={() => topId && dismiss(topId)}>
            <Ionicons name="flash" size={22} color={colors.accentText} />
          </PressScale>
        </View>
      )}
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
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginTop: 3,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterIcon: {
    marginRight: 5,
  },
  filterText: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  filterTextActive: {
    color: colors.accentText,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  modeText: {
    color: colors.textMuted,
    fontFamily: fonts.semibold,
    fontSize: 11.5,
  },
  modeTextActive: {
    color: colors.accentText,
  },
  deckArea: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    textAlign: 'center',
  },
  startOverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  startOverText: {
    color: colors.accentText,
    fontFamily: fonts.bold,
    fontSize: 13.5,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requestButton: {
    backgroundColor: colors.accent,
  },
});
