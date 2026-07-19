import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { availabilityPresets, courts } from '../data/mockData';
import { TimeSlot } from '../data/types';
import { skillLabelFor } from '../logic/skill';
import { slotKey } from '../logic/slotKey';
import Logo from '../components/Logo';
import FadeIn from '../components/FadeIn';
import PressScale from '../components/PressScale';
import { colors, fonts, radius, spacing } from '../theme';

interface OnboardingResult {
  name: string;
  skillLevel: number;
  homeCourtId: string;
  availability: TimeSlot[];
}

interface Props {
  onComplete: (result: OnboardingResult) => void;
  onSkip: () => void;
}

const STEP_COUNT = 4;
const MIN_SKILL = 1;
const MAX_SKILL = 5;

export default function OnboardingScreen({ onComplete, onSkip }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [skillLevel, setSkillLevel] = useState(3.0);
  const [homeCourtId, setHomeCourtId] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, boolean>>({});

  const skillFraction = (skillLevel - MIN_SKILL) / (MAX_SKILL - MIN_SKILL);
  const selectedCount = Object.values(selectedSlots).filter(Boolean).length;

  const canProceed = useMemo(() => {
    if (step === 0) return name.trim().length > 0;
    if (step === 2) return !!homeCourtId;
    if (step === 3) return selectedCount > 0;
    return true;
  }, [step, name, homeCourtId, selectedCount]);

  const toggleSlot = (slot: TimeSlot) => {
    const key = slotKey(slot);
    setSelectedSlots((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = () => {
    if (step < STEP_COUNT - 1) {
      setStep(step + 1);
      return;
    }
    const availability = availabilityPresets.filter((slot) => selectedSlots[slotKey(slot)]);
    onComplete({ name: name.trim(), skillLevel, homeCourtId: homeCourtId!, availability });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Logo size="lg" />
        <Pressable onPress={onSkip} hitSlop={8}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </View>

      <View style={styles.progressRow}>
        {Array.from({ length: STEP_COUNT }).map((_, index) => (
          <View key={index} style={[styles.progressDot, index <= step && styles.progressDotActive]} />
        ))}
      </View>

      <FadeIn key={step} style={styles.stepBody}>
        {step === 0 && (
          <View>
            <Text style={styles.headline}>WELCOME TO THE CLUB</Text>
            <Text style={styles.subtitle}>Let's set up your player profile — it only takes a minute.</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
              autoFocus
            />
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.headline}>WHAT'S YOUR LEVEL?</Text>
            <Text style={styles.subtitle}>Be honest — it just helps us find fair matches.</Text>
            <View style={styles.card}>
              <View style={styles.stepperRow}>
                <Pressable
                  hitSlop={8}
                  onPress={() => setSkillLevel(Math.max(MIN_SKILL, Math.round((skillLevel - 0.5) * 10) / 10))}
                >
                  <Ionicons name="remove-circle-outline" size={34} color={colors.accent} />
                </Pressable>
                <View style={styles.stepperValue}>
                  <Text style={styles.stepperValueText}>{skillLevel.toFixed(1)}</Text>
                  <Text style={styles.muted}>{skillLabelFor(skillLevel)}</Text>
                </View>
                <Pressable
                  hitSlop={8}
                  onPress={() => setSkillLevel(Math.min(MAX_SKILL, Math.round((skillLevel + 0.5) * 10) / 10))}
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
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.headline}>PICK YOUR HOME COURT</Text>
            <Text style={styles.subtitle}>Where do you usually play around Duisburg?</Text>
            {courts.map((court) => {
              const selected = court.id === homeCourtId;
              return (
                <Pressable
                  key={court.id}
                  style={[styles.courtCard, selected && styles.courtCardSelected]}
                  onPress={() => setHomeCourtId(court.id)}
                >
                  <View style={styles.courtTextWrap}>
                    <Text style={styles.courtName}>{court.name}</Text>
                    <Text style={styles.muted}>{court.address}</Text>
                  </View>
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selected ? colors.accent : colors.textFaint}
                  />
                </Pressable>
              );
            })}
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.headline}>WHEN CAN YOU PLAY?</Text>
            <Text style={styles.subtitle}>Pick as many as apply — you can change these anytime in your profile.</Text>
            <View style={styles.slotWrap}>
              {availabilityPresets.map((slot) => {
                const key = slotKey(slot);
                const active = !!selectedSlots[key];
                return (
                  <Pressable
                    key={key}
                    style={[styles.slotChip, active && styles.slotChipActive]}
                    onPress={() => toggleSlot(slot)}
                  >
                    <Ionicons
                      name={active ? 'checkmark-circle' : 'ellipse-outline'}
                      size={14}
                      color={active ? colors.accent : colors.textFaint}
                      style={styles.slotChipIcon}
                    />
                    <Text style={[styles.slotChipText, active && styles.slotChipTextActive]}>
                      {slot.day} {slot.start}-{slot.end}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </FadeIn>

      <View style={styles.footerRow}>
        {step > 0 ? (
          <Pressable style={styles.backButton} onPress={() => setStep(step - 1)} hitSlop={8}>
            <Ionicons name="arrow-back-outline" size={16} color={colors.textMuted} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <PressScale
          style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canProceed}
        >
          <Text style={styles.nextText}>{step === STEP_COUNT - 1 ? 'Get started' : 'Next'}</Text>
          <Ionicons
            name={step === STEP_COUNT - 1 ? 'rocket-outline' : 'arrow-forward-outline'}
            size={16}
            color={colors.accentText}
          />
        </PressScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  skipText: {
    color: colors.textMuted,
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.xl,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceAlt,
  },
  progressDotActive: {
    backgroundColor: colors.accent,
  },
  stepBody: {
    flexGrow: 0,
  },
  headline: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
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
  muted: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginTop: 2,
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
  courtCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  courtCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  courtTextWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  courtName: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
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
    paddingVertical: 9,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  slotChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  slotChipIcon: {
    marginRight: 6,
  },
  slotChipText: {
    color: colors.textMuted,
    fontFamily: fonts.semibold,
    fontSize: 12.5,
  },
  slotChipTextActive: {
    color: colors.text,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  backText: {
    color: colors.textMuted,
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextText: {
    color: colors.accentText,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});
