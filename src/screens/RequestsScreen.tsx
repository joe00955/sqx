import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Court, IncomingRequest, Player, RequestStatus } from '../data/types';
import Avatar from '../components/Avatar';
import PressScale from '../components/PressScale';
import { colors, fonts, radius, shadow, spacing } from '../theme';

interface Props {
  incoming: IncomingRequest[];
  outgoing: IncomingRequest[];
  players: Player[];
  courts: Court[];
  onRespond: (id: string, status: RequestStatus) => void;
}

function ContactReveal({ player }: { player: Player }) {
  if (!player.contactEmail) return null;
  return (
    <View style={styles.contactBox}>
      <Ionicons name="mail-outline" size={14} color={colors.success} style={styles.bookingIcon} />
      <Text style={styles.contactText}>
        You're matched! Reach {player.name.split(' ')[0]} at {player.contactEmail}
      </Text>
    </View>
  );
}

function RequestCard({
  request,
  players,
  courts,
  variant,
  onRespond,
}: {
  request: IncomingRequest;
  players: Player[];
  courts: Court[];
  variant: 'incoming' | 'outgoing';
  onRespond: (id: string, status: RequestStatus) => void;
}) {
  const player = players.find((p) => p.id === request.playerId);
  const court = courts.find((c) => c.id === request.courtId);
  if (!player || !court) return null;

  const resolved = request.status !== 'pending';

  return (
    <View style={[styles.card, resolved && styles.cardResolved]}>
      <View style={styles.headerRow}>
        <Avatar playerId={player.id} size={42} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{player.name}</Text>
          <Text style={styles.cardSubtitle}>
            {player.skillLabel} · {player.distanceKm.toFixed(1)} km away
          </Text>
        </View>
        <View style={[styles.modeTag, request.mode === 'competitive' && styles.modeTagCompetitive]}>
          <Ionicons
            name={request.mode === 'competitive' ? 'podium-outline' : 'happy-outline'}
            size={12}
            color={request.mode === 'competitive' ? colors.accent : colors.success}
          />
          <Text style={[styles.modeTagText, request.mode === 'competitive' && styles.modeTagTextCompetitive]}>
            {request.mode === 'competitive' ? 'Competitive' : 'Casual'}
          </Text>
        </View>
      </View>

      <View style={styles.bookingBox}>
        <Ionicons name="time-outline" size={16} color={colors.accent} style={styles.bookingIcon} />
        <Text style={styles.bookingDetail}>
          {request.day} {request.start}–{request.end} · {court.name}
        </Text>
      </View>

      {request.status === 'pending' && variant === 'incoming' ? (
        <View style={styles.actionRow}>
          <PressScale style={[styles.actionButton, styles.declineButton]} onPress={() => onRespond(request.id, 'declined')}>
            <Ionicons name="close-outline" size={16} color={colors.textMuted} />
            <Text style={styles.declineText}>Decline</Text>
          </PressScale>
          <PressScale style={[styles.actionButton, styles.acceptButton]} onPress={() => onRespond(request.id, 'accepted')}>
            <Ionicons name="checkmark-done-outline" size={16} color={colors.accentText} />
            <Text style={styles.acceptText}>Accept</Text>
          </PressScale>
        </View>
      ) : request.status === 'pending' ? (
        <View style={styles.statusRow}>
          <Ionicons name="time-outline" size={15} color={colors.textFaint} />
          <Text style={styles.statusText}>Waiting for a response</Text>
        </View>
      ) : (
        <View>
          <View style={styles.statusRow}>
            <Ionicons
              name={request.status === 'accepted' ? 'checkmark-done-circle-outline' : 'close-outline'}
              size={15}
              color={request.status === 'accepted' ? colors.success : colors.textFaint}
            />
            <Text style={styles.statusText}>{request.status === 'accepted' ? 'Accepted' : 'Declined'}</Text>
          </View>
          {request.status === 'accepted' && <ContactReveal player={player} />}
        </View>
      )}
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="mail-open-outline" size={28} color={colors.textFaint} />
      <Text style={styles.emptyTitle}>All caught up</Text>
      <Text style={styles.emptySubtitle}>{text}</Text>
    </View>
  );
}

export default function RequestsScreen({ incoming, outgoing, players, courts, onRespond }: Props) {
  const pending = useMemo(() => incoming.filter((r) => r.status === 'pending'), [incoming]);
  const resolved = useMemo(() => incoming.filter((r) => r.status !== 'pending'), [incoming]);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>REQUESTS</Text>
        <Text style={styles.subtitle}>People who want to play you</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {pending.length === 0 ? (
          <EmptyState text="No pending requests right now — new ones will show up here." />
        ) : (
          pending.map((r) => (
            <RequestCard key={r.id} request={r} players={players} courts={courts} variant="incoming" onRespond={onRespond} />
          ))
        )}

        {resolved.length > 0 && (
          <>
            <Text style={styles.resolvedHeading}>RESOLVED</Text>
            {resolved.map((r) => (
              <RequestCard key={r.id} request={r} players={players} courts={courts} variant="incoming" onRespond={onRespond} />
            ))}
          </>
        )}

        {outgoing.length > 0 && (
          <>
            <Text style={styles.resolvedHeading}>SENT BY YOU</Text>
            {outgoing.map((r) => (
              <RequestCard key={r.id} request={r} players={players} courts={courts} variant="outgoing" onRespond={onRespond} />
            ))}
          </>
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
  resolvedHeading: {
    color: colors.textFaint,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
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
  cardResolved: {
    opacity: 0.6,
    ...shadow,
    shadowOpacity: 0,
    elevation: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  cardSubtitle: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 2,
  },
  modeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  modeTagCompetitive: {
    borderColor: colors.accent,
  },
  modeTagText: {
    color: colors.success,
    fontFamily: fonts.bold,
    fontSize: 10.5,
  },
  modeTagTextCompetitive: {
    color: colors.accent,
  },
  bookingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bookingIcon: {
    marginRight: spacing.sm,
  },
  bookingDetail: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 13,
    flex: 1,
  },
  contactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentMuted,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  contactText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 12.5,
    flex: 1,
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
  declineButton: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  declineText: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 13.5,
  },
  acceptButton: {
    backgroundColor: colors.accent,
  },
  acceptText: {
    color: colors.accentText,
    fontFamily: fonts.bold,
    fontSize: 13.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    color: colors.textMuted,
    fontFamily: fonts.semibold,
    fontSize: 13,
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
    maxWidth: 260,
  },
});
