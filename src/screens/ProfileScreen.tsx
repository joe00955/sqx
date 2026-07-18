import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { currentUser, courts } from '../data/mockData';
import { skillLabelFor } from '../logic/skill';
import { slotKey } from '../logic/slotKey';
import { colors } from '../theme';

interface Props {
  skillLevel: number;
  onSkillChange: (level: number) => void;
  activeSlots: Record<string, boolean>;
  onToggleSlot: (key: string) => void;
}

export default function ProfileScreen({ skillLevel, onSkillChange, activeSlots, onToggleSlot }: Props) {
  const homeCourt = courts.find((c) => c.id === currentUser.homeCourtId);

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
            <Text style={styles.muted}>{homeCourt?.name}</Text>
          </View>
        </View>
        <Text style={styles.bio}>{currentUser.bio}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Skill level</Text>
        <View style={styles.stepperRow}>
          <Pressable
            style={styles.stepperButton}
            onPress={() => onSkillChange(Math.max(1, Math.round((skillLevel - 0.5) * 10) / 10))}
          >
            <Text style={styles.stepperButtonText}>–</Text>
          </Pressable>
          <View style={styles.stepperValue}>
            <Text style={styles.stepperValueText}>{skillLevel.toFixed(1)}</Text>
            <Text style={styles.muted}>{skillLabelFor(skillLevel)}</Text>
          </View>
          <Pressable
            style={styles.stepperButton}
            onPress={() => onSkillChange(Math.min(5, Math.round((skillLevel + 0.5) * 10) / 10))}
          >
            <Text style={styles.stepperButtonText}>+</Text>
          </Pressable>
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
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 14,
  },
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
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: colors.accentDark,
    fontWeight: '700',
    fontSize: 17,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  muted: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  mutedSmall: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 10,
  },
  bio: {
    color: colors.text,
    fontSize: 13,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: '700',
  },
  stepperValue: {
    alignItems: 'center',
    minWidth: 90,
  },
  stepperValueText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  slotWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
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
  slotChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  slotChipTextInactive: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
});
