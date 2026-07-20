import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminReport } from '../hooks/useAdminReports';
import { useMessages } from '../hooks/useMessages';
import { colors, fonts, radius, shadow, spacing } from '../theme';

interface Props {
  reports: AdminReport[];
  loading: boolean;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function ConversationViewer({ matchRequestId }: { matchRequestId: string }) {
  const { messages, loading } = useMessages(matchRequestId, null);
  if (loading) {
    return <Text style={styles.mutedSmall}>Loading conversation…</Text>;
  }
  if (messages.length === 0) {
    return <Text style={styles.mutedSmall}>No messages in this conversation.</Text>;
  }
  return (
    <View style={styles.conversationBox}>
      {messages.map((m) => (
        <Text key={m.id} style={styles.messageLine}>
          <Text style={styles.messageSender}>{m.senderId.slice(0, 8)}: </Text>
          {m.body}
        </Text>
      ))}
    </View>
  );
}

function ReportCard({ report }: { report: AdminReport }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="flag" size={15} color={colors.danger} />
        <Text style={styles.headline}>
          {report.reporterName} reported {report.reportedName}
        </Text>
      </View>
      <Text style={styles.reason}>{report.reason}</Text>
      {!!report.details && <Text style={styles.details}>{report.details}</Text>}
      <Text style={styles.timestamp}>{formatDateTime(report.createdAt)}</Text>

      {report.matchRequestId && (
        <View>
          <Text style={styles.viewToggle} onPress={() => setExpanded((v) => !v)}>
            {expanded ? 'Hide conversation' : 'View conversation'}
          </Text>
          {expanded && <ConversationViewer matchRequestId={report.matchRequestId} />}
        </View>
      )}
    </View>
  );
}

export default function AdminReportsScreen({ reports, loading }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
      {reports.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="shield-checkmark-outline" size={26} color={colors.textFaint} />
          <Text style={styles.emptyTitle}>{loading ? 'Loading…' : 'No reports'}</Text>
          <Text style={styles.emptySubtitle}>Reports filed by players will show up here.</Text>
        </View>
      ) : (
        reports.map((r) => <ReportCard key={r.id} report={r} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    gap: 8,
    marginBottom: spacing.sm,
  },
  headline: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
    flex: 1,
  },
  reason: {
    color: colors.accent,
    fontFamily: fonts.bold,
    fontSize: 12.5,
    marginBottom: 4,
  },
  details: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  timestamp: {
    color: colors.textFaint,
    fontFamily: fonts.medium,
    fontSize: 11,
    marginBottom: spacing.sm,
  },
  viewToggle: {
    color: colors.accent,
    fontFamily: fonts.bold,
    fontSize: 12.5,
    marginTop: 4,
  },
  conversationBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: 6,
  },
  messageLine: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 12.5,
  },
  messageSender: {
    color: colors.textFaint,
    fontFamily: fonts.bold,
  },
  mutedSmall: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: spacing.sm,
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
