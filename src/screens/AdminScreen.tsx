import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PendingVerification } from '../hooks/useAdminVerifications';
import { AdminReport } from '../hooks/useAdminReports';
import AdminVerificationScreen from './AdminVerificationScreen';
import AdminReportsScreen from './AdminReportsScreen';
import { colors, fonts, radius, spacing } from '../theme';

type Section = 'verifications' | 'reports';

interface Props {
  pending: PendingVerification[];
  verificationsLoading: boolean;
  verificationError: string | null;
  onApprove: (userId: string, videoPath: string | null) => void;
  onReject: (userId: string, videoPath: string | null) => void;
  reports: AdminReport[];
  reportsLoading: boolean;
  moderationError: string | null;
  onBan: (userId: string, reason: string) => void;
  onWarn: (userId: string, message: string) => void;
}

export default function AdminScreen({
  pending,
  verificationsLoading,
  verificationError,
  onApprove,
  onReject,
  reports,
  reportsLoading,
  moderationError,
  onBan,
  onWarn,
}: Props) {
  const [section, setSection] = useState<Section>('verifications');

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>ADMIN</Text>
        <Text style={styles.subtitle}>Moderation tools</Text>
      </View>

      <View style={styles.segmentRow}>
        <Pressable
          style={[styles.segment, section === 'verifications' && styles.segmentActive]}
          onPress={() => setSection('verifications')}
        >
          <Text style={[styles.segmentText, section === 'verifications' && styles.segmentTextActive]}>
            Verifications{pending.length > 0 ? ` (${pending.length})` : ''}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segment, section === 'reports' && styles.segmentActive]}
          onPress={() => setSection('reports')}
        >
          <Text style={[styles.segmentText, section === 'reports' && styles.segmentTextActive]}>
            Reports{reports.length > 0 ? ` (${reports.length})` : ''}
          </Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        {section === 'verifications' ? (
          <AdminVerificationScreen
            pending={pending}
            loading={verificationsLoading}
            error={verificationError}
            onApprove={onApprove}
            onReject={onReject}
            embedded
          />
        ) : (
          <AdminReportsScreen
            reports={reports}
            loading={reportsLoading}
            error={moderationError}
            onBan={onBan}
            onWarn={onWarn}
          />
        )}
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
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: spacing.md,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: radius.pill,
  },
  segmentActive: {
    backgroundColor: colors.accent,
  },
  segmentText: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 12.5,
  },
  segmentTextActive: {
    color: colors.accentText,
  },
  body: {
    flex: 1,
  },
});
