import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MatchResult } from '../logic/matching';
import { colors, radius, shadow, spacing } from '../theme';

interface Props {
  match: MatchResult;
}

function skillMatchMeta(skillDiff: number): { label: string; color: string } {
  if (skillDiff <= 0.5) return { label: 'Very close skill match', color: colors.success };
  if (skillDiff <= 1.5) return { label: 'Reasonably close skill level', color: colors.accent };
  return { label: 'Bigger skill gap — good for a friendly', color: colors.textMuted };
}

type MatchMode = 'casual' | 'competitive';

export default function MatchCard({ match }: Props) {
  const [requested, setRequested] = useState(false);
  const [mode, setMode] = useState<MatchMode>('casual');
  const { player, score, skillDiff, suggestedBookings } = match;
  const best = suggestedBookings[0];
  const skillMeta = skillMatchMeta(skillDiff);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{player.initials}</Text>
        </View>
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
          <Ionicons name="tennisball-outline" size={18} color={colors.accent} style={styles.bookingIcon} />
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

      {!requested && (
        <View style={styles.modeRow}>
          <Pressable
            style={[styles.modeChip, mode === 'casual' && styles.modeChipActive]}
            onPress={() => setMode('casual')}
          >
            <Ionicons
              name="happy-outline"
              size={13}
              color={mode === 'casual' ? colors.accentText : colors.textMuted}
            />
            <Text style={[styles.modeText, mode === 'casual' && styles.modeTextActive]}>Casual</Text>
          </Pressable>
          <Pressable
            style={[styles.modeChip, mode === 'competitive' && styles.modeChipActive]}
            onPress={() => setMode('competitive')}
          >
            <Ionicons
              name="podium-outline"
              size={13}
              color={mode === 'competitive' ? colors.accentText : colors.textMuted}
            />
            <Text style={[styles.modeText, mode === 'competitive' && styles.modeTextActive]}>
              Competitive · affects ELO
            </Text>
          </Pressable>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          requested && styles.buttonRequested,
          pressed && !requested && styles.buttonPressed,
        ]}
        onPress={() => setRequested(true)}
        disabled={requested}
      >
        {requested && <Ionicons name="checkmark-circle" size={16} color={colors.success} style={styles.buttonIcon} />}
        <Text style={[styles.buttonText, requested && styles.buttonTextRequested]}>
          {requested
            ? `${mode === 'casual' ? 'Casual' : 'Competitive'} request sent`
            : 'Send match request'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.accentText,
    fontWeight: '800',
    fontSize: 15,
  },
  headerText: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12.5,
  },
  scoreWrap: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    color: colors.accent,
    fontWeight: '800',
    fontSize: 20,
    lineHeight: 22,
  },
  scoreUnit: {
    color: colors.textFaint,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  scoreTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceAlt,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  bio: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  skillNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  skillNote: {
    color: colors.text,
    fontSize: 12,
  },
  bookingBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
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
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 3,
    letterSpacing: 0.3,
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
  noOverlapBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  noOverlap: {
    color: colors.textMuted,
    fontSize: 12,
    flex: 1,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.sm,
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
    fontSize: 11.5,
    fontWeight: '600',
  },
  modeTextActive: {
    color: colors.accentText,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonRequested: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: colors.accentText,
    fontWeight: '700',
    fontSize: 14,
  },
  buttonTextRequested: {
    color: colors.textMuted,
  },
});
