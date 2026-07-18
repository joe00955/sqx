import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MatchResult } from '../logic/matching';
import { colors } from '../theme';

interface Props {
  match: MatchResult;
}

export default function MatchCard({ match }: Props) {
  const [requested, setRequested] = useState(false);
  const { player, score, skillDiff, suggestedBookings } = match;
  const best = suggestedBookings[0];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{player.initials}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{player.name}</Text>
          <Text style={styles.subtitle}>
            {player.skillLabel} · {player.distanceKm.toFixed(1)} km away
          </Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{score}%</Text>
        </View>
      </View>

      <Text style={styles.bio}>{player.bio}</Text>

      <Text style={styles.skillNote}>
        {skillDiff <= 0.5
          ? 'Very close skill match'
          : skillDiff <= 1.5
          ? 'Reasonably close skill level'
          : 'Bigger skill gap — good for a friendly'}
      </Text>

      {best ? (
        <View style={styles.bookingBox}>
          <Text style={styles.bookingLabel}>Suggested game</Text>
          <Text style={styles.bookingDetail}>
            {best.day} {best.start}–{best.end} · {best.court.name} ({best.court.distanceKm.toFixed(1)} km)
          </Text>
          {suggestedBookings.length > 1 && (
            <Text style={styles.bookingMore}>+{suggestedBookings.length - 1} more shared slot(s)</Text>
          )}
        </View>
      ) : (
        <Text style={styles.noOverlap}>No shared availability yet — propose a time when you message.</Text>
      )}

      <Pressable
        style={[styles.button, requested && styles.buttonRequested]}
        onPress={() => setRequested(true)}
        disabled={requested}
      >
        <Text style={[styles.buttonText, requested && styles.buttonTextRequested]}>
          {requested ? 'Request sent ✓' : 'Send match request'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.accentDark,
    fontWeight: '700',
    fontSize: 15,
  },
  headerText: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  scoreBadge: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  scoreText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 13,
  },
  bio: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  skillNote: {
    color: colors.text,
    fontSize: 12,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  bookingBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  bookingLabel: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  bookingDetail: {
    color: colors.text,
    fontSize: 13,
  },
  bookingMore: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  noOverlap: {
    color: colors.danger,
    fontSize: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonRequested: {
    backgroundColor: colors.surfaceAlt,
  },
  buttonText: {
    color: colors.accentDark,
    fontWeight: '700',
    fontSize: 14,
  },
  buttonTextRequested: {
    color: colors.textMuted,
  },
});
