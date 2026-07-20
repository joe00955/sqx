import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage, Player } from '../data/types';
import Avatar from '../components/Avatar';
import VerifiedBadge from '../components/VerifiedBadge';
import SafetyMenu from '../components/SafetyMenu';
import PressScale from '../components/PressScale';
import { colors, fonts, radius, spacing } from '../theme';

interface Props {
  player: Player;
  messages: ChatMessage[];
  currentUserId: string | null;
  loading: boolean;
  onSend: (body: string) => void;
  onBack: () => void;
  onBlock: () => void;
  onReport: (reason: string, details: string) => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatScreen({ player, messages, currentUserId, loading, onSend, onBack, onBlock, onReport }: Props) {
  const [draft, setDraft] = useState('');
  const [safetyOpen, setSafetyOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!draft.trim()) return;
    onSend(draft);
    setDraft('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack} hitSlop={8}>
          <Ionicons name="arrow-back-outline" size={18} color={colors.textMuted} />
        </Pressable>
        <Avatar playerId={player.id} imageUrl={player.avatarUrl} size={36} style={styles.headerAvatar} />
        <View style={styles.headerText}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{player.name}</Text>
            {player.verificationStatus === 'verified' && <VerifiedBadge size={11} />}
          </View>
          <Text style={styles.subtitle}>{player.skillLabel}</Text>
        </View>
        <Pressable style={styles.menuButton} onPress={() => setSafetyOpen(true)} hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-ellipses-outline" size={26} color={colors.textFaint} />
            <Text style={styles.emptyText}>No messages yet — say hi and sort out a time to play.</Text>
          </View>
        ) : (
          messages.map((message) => {
            const mine = message.senderId === currentUserId;
            return (
              <View key={message.id} style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={[styles.bubbleText, mine && styles.bubbleTextMine]}>{message.body}</Text>
                </View>
                <Text style={[styles.timeText, mine && styles.timeTextMine]}>{formatTime(message.createdAt)}</Text>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Message..."
          placeholderTextColor={colors.textFaint}
          style={styles.input}
          multiline
          onKeyPress={(e) => {
            const native = e.nativeEvent as unknown as { key: string; shiftKey?: boolean };
            if (native.key === 'Enter' && !native.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <PressScale style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]} onPress={handleSend} disabled={!draft.trim()}>
          <Ionicons name="send" size={16} color={colors.accentText} />
        </PressScale>
      </View>

      <SafetyMenu
        visible={safetyOpen}
        playerName={player.name}
        onClose={() => setSafetyOpen(false)}
        onBlock={onBlock}
        onReport={onReport}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: spacing.sm,
    padding: 4,
  },
  headerAvatar: {
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 11.5,
    marginTop: 1,
  },
  menuButton: {
    padding: 4,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.xl * 1.5,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    textAlign: 'center',
  },
  bubbleRow: {
    alignItems: 'flex-start',
    marginBottom: spacing.sm + 2,
    maxWidth: '80%',
  },
  bubbleRowMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
  },
  bubbleTheirs: {
    backgroundColor: colors.surfaceAlt,
    borderBottomLeftRadius: 4,
  },
  bubbleMine: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 19,
  },
  bubbleTextMine: {
    color: colors.accentText,
  },
  timeText: {
    color: colors.textFaint,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    marginTop: 3,
    marginLeft: 4,
  },
  timeTextMine: {
    marginRight: 4,
    marginLeft: 0,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
