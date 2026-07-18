import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { currentUser, courts } from '../data/mockData';
import { skillLabelFor } from '../logic/skill';
import { slotKey } from '../logic/slotKey';
import { colors, radius, spacing } from '../theme';

interface Props {
  skillLevel: number;
  onSkillChange: (level: number) => void;
  activeSlots: Record<string, boolean>;
  onToggleSlot: (key: string) => void;
}

const MIN_SKILL = 1;
const MAX_SKILL = 5;

export default function ProfileScreen({ skillLevel, onSkillChange, activeSlots, onToggleSlot }: Props) {
  const homeCourt = courts.find((c) => c.id === currentUser.homeCourtId);
  const skillFraction = (skillLevel - MIN_SKILL) / (MAX_SKILL - MIN_SKILL);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your profile</Text>

      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{currentUser.initials}</Text>
          </View>
          <View>
            <Text style={styles.name}>{currentUser.name}</Text>
            <View style={styles.homeCourtRow}>
              <Ionicons name="pin-outline" size={13} color={colors.textMuted} />
              <Text style={styles.muted}>{homeCourt?.name}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.bio}>{currentUser.bio}</Text>
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
          {currentUser.availability.map((slot) => {
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
    fontSize: 22,
    fontWeight: '800',
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
    borderRadius: 27,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md + 2,
  },
  avatarText: {
    color: colors.accentText,
    fontWeight: '800',
    fontSize: 18,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  homeCourtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  muted: {
    color: colors.textMuted,
    fontSize: 13,
  },
  mutedSmall: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.md,
  },
  bio: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
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
    fontSize: 24,
    fontWeight: '800',
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
    fontSize: 11,
    fontWeight: '600',
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
    borderRadius: radius.pill,
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
    fontSize: 12,
    fontWeight: '600',
  },
  slotChipTextInactive: {
    color: colors.textFaint,
    textDecorationLine: 'line-through',
  },
});
