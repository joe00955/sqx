import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { courts } from '../data/mockData';
import { Player, TimeSlot } from '../data/types';
import { skillLabelFor } from '../logic/skill';
import { slotKey } from '../logic/slotKey';
import { colors, fonts, radius, spacing } from '../theme';

interface Props {
  me: Player;
  baseAvailability: TimeSlot[];
  skillLevel: number;
  onSkillChange: (level: number) => void;
  activeSlots: Record<string, boolean>;
  onToggleSlot: (key: string) => void;
}

const MIN_SKILL = 1;
const MAX_SKILL = 5;

export default function ProfileScreen({ me, baseAvailability, skillLevel, onSkillChange, activeSlots, onToggleSlot }: Props) {
  const homeCourt = courts.find((c) => c.id === me.homeCourtId);
  const skillFraction = (skillLevel - MIN_SKILL) / (MAX_SKILL - MIN_SKILL);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>YOUR PROFILE</Text>

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{me.initials}</Text>
          </View>
          <View>
            <Text style={styles.name}>{me.name}</Text>
            <View style={styles.homeCourtRow}>
              <Ionicons name="pin-outline" size={13} color={colors.textMuted} />
              <Text style={styles.muted}>{homeCourt?.name}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.bio}>{me.bio}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Skill level</Text>
        <View style={styles.stepperRow}>
          <Pressable
            hitSlop={8}
            onPress={() => onSkillChange(Math.max(MIN_SKILL, Math.round((skillLevel - 0.5) * 10) / 10))}
          >
            <Ionicons name="remove-circle-outline" size={34} color={colors.accent} />
          </Pressable>
          <View style={styles.stepperValue}>
            <Text style={styles.stepperValueText}>{skillLevel.toFixed(1)}</Text>
            <Text style={styles.muted}>{skillLabelFor(skillLevel)}</Text>
          </View>
          <Pressable
            hitSlop={8}
            onPress={() => onSkillChange(Math.min(MAX_SKILL, Math.round((skillLevel + 0.5) * 10) / 10))}
          >
            <Ionicons name="add-circle-outline" size={34} color={colors.accent} />
          </Pressable>
        </View>
        <View style={styles.skillTrack}>
          <View style={[styles.skillFill, { width: `${skillFraction * 100}%` }]} />
        </View>
        <View style={styles.skillEndsRow}>
          <Text style={styles.skillEndLabel}>Beginner</Text>
          <Text style={styles.skillEndLabel}>Pro</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your availability</Text>
        <Text style={styles.mutedSmall}>Tap a slot to mark it unavailable this week</Text>
        <View style={styles.slotWrap}>
          {baseAvailability.map((slot) => {
            const key = slotKey(slot);
            const active = activeSlots[key];
            return (
              <Pressable
                key={key}
                style={[styles.slotChip, active ? styles.slotChipActive : styles.slotChipInactive]}
                onPress={() => onToggleSlot(key)}
              >
                <Ionicons
                  name={active ? 'checkmark-circle' : 'close-circle-outline'}
                  size={14}
                  color={active ? colors.accent : colors.textFaint}
                  style={styles.slotChipIcon}
                />
                <Text style={[styles.slotChipText, !active && styles.slotChipTextInactive]}>
                  {slot.day} {slot.start}-{slot.end}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: 0.4,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md + 2,
    transform: [{ rotate: '-4deg' }],
  },
  avatarText: {
    color: colors.accentText,
    fontFamily: fonts.extrabold,
    fontSize: 18,
    transform: [{ rotate: '4deg' }],
  },
  name: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  homeCourtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  mutedSmall: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginBottom: spacing.md,
  },
  bio: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: spacing.md,
  },
  stepperValue: {
    alignItems: 'center',
    minWidth: 90,
  },
  stepperValueText: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 28,
  },
  skillTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  skillFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  skillEndsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  skillEndLabel: {
    color: colors.textFaint,
    fontFamily: fonts.bold,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  slotWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  slotChipActive: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.accent,
  },
  slotChipInactive: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  slotChipIcon: {
    marginRight: 5,
  },
  slotChipText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  slotChipTextInactive: {
    color: colors.textFaint,
    textDecorationLine: 'line-through',
  },
});
