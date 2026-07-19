import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PendingVerification } from '../hooks/useAdminVerifications';
import Avatar from '../components/Avatar';
import PressScale from '../components/PressScale';
import { colors, fonts, radius, shadow, spacing } from '../theme';

interface Props {
  pending: PendingVerification[];
  loading: boolean;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
}

function ReviewCard({
  item,
  onApprove,
  onReject,
}: {
  item: PendingVerification;
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Avatar playerId={item.id} imageUrl={item.avatarUrl ?? undefined} size={44} style={styles.avatar} />
        <Text style={styles.name}>{item.name}</Text>
      </View>

      {item.videoUrl ? (
        <video src={item.videoUrl} controls style={styles.video} />
      ) : (
        <View style={styles.noVideo}>
          <Ionicons name="videocam-off-outline" size={20} color={colors.textFaint} />
          <Text style={styles.noVideoText}>No video on file</Text>
        </View>
      )}

      <View style={styles.actionRow}>
        <PressScale style={[styles.actionButton, styles.rejectButton]} onPress={() => onReject(item.id)}>
          <Ionicons name="close-outline" size={16} color={colors.textMuted} />
          <Text style={styles.rejectText}>Reject</Text>
        </PressScale>
        <PressScale style={[styles.actionButton, styles.approveButton]} onPress={() => onApprove(item.id)}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.accentText} />
          <Text style={styles.approveText}>Approve</Text>
        </PressScale>
      </View>
    </View>
  );
}

export default function AdminVerificationScreen({ pending, loading, onApprove, onReject }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>ADMIN</Text>
        <Text style={styles.subtitle}>Verification requests waiting for review</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {pending.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle-outline" size={28} color={colors.textFaint} />
            <Text style={styles.emptyTitle}>{loading ? 'Loading…' : 'Nothing pending'}</Text>
            <Text style={styles.emptySubtitle}>New verification submissions will show up here.</Text>
          </View>
        ) : (
          pending.map((item) => (
            <ReviewCard key={item.id} item={item} onApprove={onApprove} onReject={onReject} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: 0.4,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginTop: 3,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {},
  name: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  video: {
    width: '100%',
    maxHeight: 320,
    borderRadius: radius.sm,
    backgroundColor: '#000',
    marginBottom: spacing.md,
  },
  noVideo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  noVideoText: {
    color: colors.textFaint,
    fontFamily: fonts.medium,
    fontSize: 12.5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: radius.sm,
  },
  rejectButton: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rejectText: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 13.5,
  },
  approveButton: {
    backgroundColor: colors.accent,
  },
  approveText: {
    color: colors.accentText,
    fontFamily: fonts.bold,
    fontSize: 13.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 1.5,
    gap: 8,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    textAlign: 'center',
  },
});
