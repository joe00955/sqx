import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Conversation } from '../hooks/useConversations';
import { Player } from '../data/types';
import Avatar from '../components/Avatar';
import VerifiedBadge from '../components/VerifiedBadge';
import { colors, fonts, radius, shadow, spacing } from '../theme';

interface Props {
  conversations: Conversation[];
  players: Player[];
  loading: boolean;
  onOpenChat: (requestId: string) => void;
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  return sameDay
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function ConversationRow({ conversation, player, onPress }: { conversation: Conversation; player: Player; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Avatar playerId={player.id} imageUrl={player.avatarUrl} size={48} style={styles.avatar} />
      <View style={styles.rowText}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{player.name}</Text>
          {player.verificationStatus === 'verified' && <VerifiedBadge size={11} />}
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {conversation.lastMessageBody ?? 'Say hi and sort out a time to play.'}
        </Text>
      </View>
      {conversation.lastMessageAt && <Text style={styles.time}>{formatWhen(conversation.lastMessageAt)}</Text>}
    </Pressable>
  );
}

export default function MessagesScreen({ conversations, players, loading, onOpenChat }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>MESSAGES</Text>
        <Text style={styles.subtitle}>Conversations with players you've matched with</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={28} color={colors.textFaint} />
            <Text style={styles.emptyTitle}>{loading ? 'Loading…' : 'No conversations yet'}</Text>
            <Text style={styles.emptySubtitle}>
              Once you and another player accept a match request, you can message here.
            </Text>
          </View>
        ) : (
          conversations.map((c) => {
            const player = players.find((p) => p.id === c.playerId);
            if (!player) return null;
            return (
              <ConversationRow
                key={c.requestId}
                conversation={c}
                player={player}
                onPress={() => onOpenChat(c.requestId)}
              />
            );
          })
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  avatar: {
    marginRight: spacing.md,
  },
  rowText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14.5,
  },
  preview: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    marginTop: 2,
  },
  time: {
    color: colors.textFaint,
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 1.5,
    gap: 8,
    paddingHorizontal: spacing.xl,
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
