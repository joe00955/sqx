import React, { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Court, Player, TimeSlot, VerificationStatus } from '../data/types';
import { skillLabelFor } from '../logic/skill';
import { computeSkillLevel, skillQuizQuestions } from '../logic/skillQuiz';
import { slotKey } from '../logic/slotKey';
import Avatar from '../components/Avatar';
import PressScale from '../components/PressScale';
import SkillQuizForm from '../components/SkillQuizForm';
import VerifiedBadge from '../components/VerifiedBadge';
import { colors, fonts, radius, spacing } from '../theme';

interface Props {
  me: Player;
  courts: Court[];
  baseAvailability: TimeSlot[];
  skillLevel: number;
  onSkillChange: (level: number) => void;
  activeSlots: Record<string, boolean>;
  onToggleSlot: (key: string) => void;
  onSignOut?: () => void;
  verificationStatus?: VerificationStatus;
  onUploadAvatar?: (file: File) => Promise<string | null>;
  onUploadVerificationVideo?: (file: File) => Promise<boolean>;
}

const MIN_SKILL = 1;
const MAX_SKILL = 5;

export default function ProfileScreen({
  me,
  courts,
  baseAvailability,
  skillLevel,
  onSkillChange,
  activeSlots,
  onToggleSlot,
  onSignOut,
  verificationStatus,
  onUploadAvatar,
  onUploadVerificationVideo,
}: Props) {
  const homeCourt = courts.find((c) => c.id === me.homeCourtId);
  const skillFraction = (skillLevel - MIN_SKILL) / (MAX_SKILL - MIN_SKILL);

  const [retaking, setRetaking] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(() => skillQuizQuestions.map(() => null));
  const quizComplete = quizAnswers.every((a) => a !== null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarSelected = async (e: { target: { files: FileList | null } }) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadAvatar) return;
    setAvatarUploading(true);
    await onUploadAvatar(file);
    setAvatarUploading(false);
  };

  const handleVideoSelected = async (e: { target: { files: FileList | null } }) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadVerificationVideo) return;
    setVideoUploading(true);
    await onUploadVerificationVideo(file);
    setVideoUploading(false);
  };

  const startRetake = () => {
    setQuizAnswers(skillQuizQuestions.map(() => null));
    setRetaking(true);
  };

  const handleAnswerQuestion = (questionIndex: number, points: number) => {
    setQuizAnswers((prev) => prev.map((value, index) => (index === questionIndex ? points : value)));
  };

  const saveRetake = () => {
    onSkillChange(computeSkillLevel(quizAnswers as number[]));
    setRetaking(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroAvatarWrap}>
          <Avatar playerId={me.id} imageUrl={me.avatarUrl} size={96} rotate={false} style={styles.heroAvatar} />
          {onUploadAvatar && (
            <Pressable
              style={styles.avatarEditButton}
              onPress={() => avatarInputRef.current?.click()}
              hitSlop={8}
            >
              {avatarUploading ? (
                <ActivityIndicator size="small" color={colors.accentText} />
              ) : (
                <Ionicons name="camera" size={14} color={colors.accentText} />
              )}
            </Pressable>
          )}
          {onUploadAvatar && (
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarSelected}
            />
          )}
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.heroName}>{me.name}</Text>
          {verificationStatus === 'verified' && <VerifiedBadge size={13} />}
        </View>
        <View style={styles.homeCourtRow}>
          <Ionicons name="pin-outline" size={13} color={colors.textMuted} />
          <Text style={styles.muted}>{homeCourt?.name}</Text>
        </View>
        <Text style={styles.heroBio}>{me.bio}</Text>

        <View style={styles.statRow}>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{skillLevel.toFixed(1)}</Text>
            <Text style={styles.statLabel}>SKILL</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{me.competitiveElo}</Text>
            <Text style={styles.statLabel}>ELO</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{me.casualGamesPlayed}</Text>
            <Text style={styles.statLabel}>GAMES</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Skill assessment</Text>
        {retaking ? (
          <View>
            <Text style={styles.mutedSmall}>
              Answer honestly — we work out your level from this instead of you guessing a number.
            </Text>
            <SkillQuizForm answers={quizAnswers} onAnswer={handleAnswerQuestion} />
            <View style={styles.retakeActionsRow}>
              <Pressable style={styles.cancelButton} onPress={() => setRetaking(false)} hitSlop={8}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <PressScale
                style={[styles.saveButton, !quizComplete && styles.saveButtonDisabled]}
                onPress={saveRetake}
                disabled={!quizComplete}
              >
                <Text style={styles.saveText}>Save level</Text>
              </PressScale>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.muted}>{skillLabelFor(skillLevel)}</Text>
            <View style={styles.skillTrack}>
              <View style={[styles.skillFill, { width: `${skillFraction * 100}%` }]} />
            </View>
            <View style={styles.skillEndsRow}>
              <Text style={styles.skillEndLabel}>Beginner</Text>
              <Text style={styles.skillEndLabel}>Pro</Text>
            </View>
            <Pressable style={styles.retakeButton} onPress={startRetake} hitSlop={8}>
              <Ionicons name="refresh-outline" size={14} color={colors.accent} />
              <Text style={styles.retakeText}>Retake skill assessment</Text>
            </Pressable>
          </View>
        )}
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

      {onUploadVerificationVideo && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Identity verification</Text>
          {verificationStatus === 'verified' ? (
            <View style={styles.verifiedRow}>
              <Ionicons name="shield-checkmark" size={18} color={colors.success} />
              <Text style={styles.verifiedRowText}>You're verified — other players can see your badge.</Text>
            </View>
          ) : verificationStatus === 'pending' ? (
            <View style={styles.verifiedRow}>
              <Ionicons name="time-outline" size={18} color={colors.textMuted} />
              <Text style={styles.mutedSmallNoMargin}>
                Your video is with our team for review. This usually doesn't take long, and the video is
                permanently deleted the moment a decision is made — we only keep the verified/not result.
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.mutedSmall}>
                {verificationStatus === 'rejected'
                  ? "We couldn't confirm your last submission — add a real profile photo and a short video of your face, and we'll take another look."
                  : "Add a real profile photo, then upload a short video of your face so our team can confirm you're really you. This builds trust with players you meet in person."}
                {' '}Your video is only ever used for this one check and is permanently deleted as soon as it's
                reviewed — we never keep it, share it, or use it for anything else.
              </Text>
              <PressScale style={styles.verifyButton} onPress={() => videoInputRef.current?.click()} disabled={videoUploading}>
                {videoUploading ? (
                  <ActivityIndicator size="small" color={colors.accentText} />
                ) : (
                  <>
                    <Ionicons name="videocam-outline" size={16} color={colors.accentText} />
                    <Text style={styles.verifyButtonText}>Upload verification video</Text>
                  </>
                )}
              </PressScale>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                capture="user"
                style={{ display: 'none' }}
                onChange={handleVideoSelected}
              />
            </View>
          )}
        </View>
      )}

      {onSignOut && (
        <Pressable style={styles.signOutButton} onPress={onSignOut} hitSlop={8}>
          <Ionicons name="log-out-outline" size={15} color={colors.danger} />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.md + 2,
  },
  heroAvatarWrap: {
    marginBottom: spacing.md,
  },
  heroAvatar: {
    borderWidth: 3,
    borderColor: colors.accent,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroName: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: 0.3,
  },
  heroBio: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    width: '100%',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.border,
  },
  statValue: {
    color: colors.accent,
    fontFamily: fonts.display,
    fontSize: 20,
  },
  statLabel: {
    color: colors.textFaint,
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 2,
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
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
    marginBottom: spacing.md,
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
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.lg,
    paddingVertical: 8,
  },
  retakeText: {
    color: colors.accent,
    fontFamily: fonts.bold,
    fontSize: 12.5,
  },
  retakeActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelButton: {
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
  },
  cancelText: {
    color: colors.textMuted,
    fontFamily: fonts.semibold,
    fontSize: 13.5,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 11,
    paddingHorizontal: spacing.lg,
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveText: {
    color: colors.accentText,
    fontFamily: fonts.bold,
    fontSize: 13.5,
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
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedRowText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 13,
    flex: 1,
  },
  mutedSmallNoMargin: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
    flex: 1,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 12,
  },
  verifyButtonText: {
    color: colors.accentText,
    fontFamily: fonts.bold,
    fontSize: 13.5,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: 12,
  },
  signOutText: {
    color: colors.danger,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
});
