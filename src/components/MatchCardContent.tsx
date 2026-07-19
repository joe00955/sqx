import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MatchResult } from '../logic/matching';
import { MatchMode } from '../data/types';
import Avatar from './Avatar';
import { colors, fonts, radius, shadow, spacing } from '../theme';

interface Props {
  match: MatchResult;
  mode: MatchMode;
}

function skillMatchMeta(skillDiff: number): { label: string; color: string } {
  if (skillDiff <= 0.5) return { label: 'Very close skill match', color: colors.success };
  if (skillDiff <= 1.5) return { label: 'Reasonably close skill level', color: colors.accent };
  return { label: 'Bigger skill gap — good for a friendly', color: colors.textMuted };
}

export default function MatchCardContent({ match, mode }: Props) {
  const { player, score, skillDiff, suggestedBookings } = match;
  const best = suggestedBookings[0];
  const skillMeta = skillMatchMeta(skillDiff);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Avatar playerId={player.id} size={64} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{player.name}</Text>
          <View style={styles.subtitleRow}>
            <Ionicons name="location-outline" size={13} color={colors.textMuted} />
            <Text style={styles.subtitle}>
              {player.skillLabel} · {player.distanceKm.toFixed(1)} km away
            </Text>
          </View>
        </View>
        <View style={styles.scoreWrap}>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.scoreUnit}>% match</Text>
        </View>
      </View>

      <View style={styles.scoreTrack}>
        <View style={[styles.scoreFill, { width: `${score}%` }]} />
      </View>

      <Text style={styles.bio}>{player.bio}</Text>

      <View style={styles.skillNoteRow}>
        <View style={[styles.dot, { backgroundColor: skillMeta.color }]} />
        <Text style={styles.skillNote}>{skillMeta.label}</Text>
      </View>

      {best ? (
        <View style={styles.bookingBox}>
          <View style={styles.bookingAccent} />
          <Ionicons name="time-outline" size={18} color={colors.accent} style={styles.bookingIcon} />
          <View style={styles.bookingTextWrap}>
            <Text style={styles.bookingLabel}>Suggested game</Text>
            <Text style={styles.bookingDetail}>
              {best.day} {best.start}–{best.end} · {best.court.name} ({best.court.distanceKm.toFixed(1)} km)
            </Text>
            {suggestedBookings.length > 1 && (
              <Text style={styles.bookingMore}>+{suggestedBookings.length - 1} more shared slot(s)</Text>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.noOverlapBox}>
          <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
          <Text style={styles.noOverlap}>No shared availability yet — propose a time when you message.</Text>
        </View>
      )}

      <View style={styles.spacer} />

      <View style={styles.modeFooter}>
        <Ionicons
          name={mode === 'competitive' ? 'podium-outline' : 'happy-outline'}
          size={13}
          color={colors.textFaint}
        />
        <Text style={styles.modeFooterText}>
          Swiping right sends a {mode === 'competitive' ? 'competitive (affects ELO)' : 'casual'} request
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 19,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  scoreWrap: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    color: colors.accent,
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 30,
  },
  scoreUnit: {
    color: colors.textFaint,
    fontFamily: fonts.bold,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  scoreTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.surfaceAlt,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  bio: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  skillNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  skillNote: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  bookingBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
    overflow: 'hidden',
  },
  bookingAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.accent,
  },
  bookingIcon: {
    marginRight: spacing.sm,
    marginTop: 1,
  },
  bookingTextWrap: {
    flex: 1,
  },
  bookingLabel: {
    color: colors.accent,
    fontFamily: fonts.bold,
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  bookingDetail: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  bookingMore: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  noOverlapBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noOverlap: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  modeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: spacing.md,
  },
  modeFooterText: {
    color: colors.textFaint,
    fontFamily: fonts.medium,
    fontSize: 11.5,
    flex: 1,
  },
});
