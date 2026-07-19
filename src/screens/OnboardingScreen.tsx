import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { availabilityPresets } from '../data/mockData';
import { Court, TimeSlot } from '../data/types';
import { computeSkillLevel, skillQuizQuestions } from '../logic/skillQuiz';
import { slotKey } from '../logic/slotKey';
import Logo from '../components/Logo';
import FadeIn from '../components/FadeIn';
import PressScale from '../components/PressScale';
import SkillQuizForm from '../components/SkillQuizForm';
import { colors, fonts, radius, spacing } from '../theme';

interface OnboardingResult {
  name: string;
  skillLevel: number;
  homeCourtId: string;
  availability: TimeSlot[];
}

interface Props {
  courts: Court[];
  onComplete: (result: OnboardingResult) => void;
  onSkip?: () => void;
}

const STEP_COUNT = 4;

export default function OnboardingScreen({ courts, onComplete, onSkip }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(() => skillQuizQuestions.map(() => null));
  const [homeCourtId, setHomeCourtId] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, boolean>>({});

  const selectedCount = Object.values(selectedSlots).filter(Boolean).length;
  const quizComplete = quizAnswers.every((a) => a !== null);

  const canProceed = useMemo(() => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return quizComplete;
    if (step === 2) return !!homeCourtId;
    if (step === 3) return selectedCount > 0;
    return true;
  }, [step, name, quizComplete, homeCourtId, selectedCount]);

  const toggleSlot = (slot: TimeSlot) => {
    const key = slotKey(slot);
    setSelectedSlots((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAnswerQuestion = (questionIndex: number, points: number) => {
    setQuizAnswers((prev) => prev.map((value, index) => (index === questionIndex ? points : value)));
  };

  const handleNext = () => {
    if (step < STEP_COUNT - 1) {
      setStep(step + 1);
      return;
    }
    const availability = availabilityPresets.filter((slot) => selectedSlots[slotKey(slot)]);
    const skillLevel = computeSkillLevel(quizAnswers as number[]);
    onComplete({ name: name.trim(), skillLevel, homeCourtId: homeCourtId!, availability });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Logo size="lg" />
        {onSkip && (
          <Pressable onPress={onSkip} hitSlop={8}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.progressRow}>
        {Array.from({ length: STEP_COUNT }).map((_, index) => (
          <View key={index} style={[styles.progressDot, index <= step && styles.progressDotActive]} />
        ))}
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
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
              <Text style={styles.subtitle}>
                Answer honestly — we work out a fair starting level from this instead of asking you to guess a number.
              </Text>
              <SkillQuizForm answers={quizAnswers} onAnswer={handleAnswerQuestion} />
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
      </ScrollView>

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
  scrollArea: {
    flex: 1,
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
  muted: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginTop: 2,
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
