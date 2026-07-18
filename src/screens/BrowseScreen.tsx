import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { players, courts } from '../data/mockData';
import { Player } from '../data/types';
import { findMatches, MatchResult } from '../logic/matching';
import MatchCard from '../components/MatchCard';
import { colors } from '../theme';

type SortMode = 'best' | 'closest' | 'skill' | 'availability';

const sortModes: { key: SortMode; label: string }[] = [
  { key: 'best', label: 'Best match' },
  { key: 'closest', label: 'Closest' },
  { key: 'skill', label: 'Similar skill' },
  { key: 'availability', label: 'Has a slot' },
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
      <Text style={styles.title}>Find a game</Text>
      <Text style={styles.subtitle}>
        Matched on skill, distance & free time · {me.availability.length} slot(s) active
      </Text>

      <View style={styles.filterRow}>
        {sortModes.map((mode) => {
          const active = mode.key === sortMode;
          return (
            <Pressable
              key={mode.key}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setSortMode(mode.key)}
            >
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
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 14,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.accentDark,
  },
  list: {
    paddingBottom: 24,
  },
});
