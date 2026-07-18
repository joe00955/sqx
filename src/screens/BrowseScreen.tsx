import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { players, courts } from '../data/mockData';
import { Player } from '../data/types';
import { findMatches, MatchResult } from '../logic/matching';
import MatchCard from '../components/MatchCard';
import { colors, radius, spacing } from '../theme';

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

interface Props {
  me: Player;
}

export default function BrowseScreen({ me }: Props) {
  const [sortMode, setSortMode] = useState<SortMode>('best');
  const allMatches = useMemo(() => findMatches(me, players, courts), [me]);
  const sorted = useMemo(() => sortMatches(allMatches, sortMode), [allMatches, sortMode]);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>Find a game</Text>
        <Text style={styles.subtitle}>{me.availability.length} slot(s) active this week</Text>
      </View>

      <View style={styles.filterRow}>
        {sortModes.map((mode) => {
          const active = mode.key === sortMode;
          return (
            <Pressable
              key={mode.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setSortMode(mode.key)}
            >
              <Ionicons
                name={mode.icon}
                size={13}
                color={active ? colors.accentText : colors.textMuted}
                style={styles.filterIcon}
              />
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{mode.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.player.id}
        renderItem={({ item }) => <MatchCard match={item} />}
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
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 3,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md + 2,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
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
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.accentText,
  },
  list: {
    paddingBottom: 24,
  },
});
