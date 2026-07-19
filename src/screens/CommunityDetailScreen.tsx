import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { players } from '../data/mockData';
import { Community, Player } from '../data/types';
import Avatar from '../components/Avatar';
import PressScale from '../components/PressScale';
import { colors, fonts, radius, shadow, spacing } from '../theme';

interface Props {
  community: Community;
  me: Player;
  isJoined: boolean;
  onToggleJoin: () => void;
  onBack: () => void;
}

const vibeColor: Record<Community['vibe'], string> = {
  Casual: colors.success,
  Competitive: colors.accent,
  Mixed: colors.textMuted,
};

export default function CommunityDetailScreen({ community, me, isJoined, onToggleJoin, onBack }: Props) {
  const members = useMemo(
    () => community.memberIds.map((id) => players.find((p) => p.id === id)).filter((p): p is Player => !!p),
    [community.memberIds]
  );

  const ladder = useMemo(() => {
    const pool = isJoined ? [me, ...members] : members;
    return [...pool].sort((a, b) => b.casualGamesPlayed - a.casualGamesPlayed);
  }, [members, isJoined, me]);

  const memberCount = community.memberCount + (isJoined ? 1 : 0);

  return (
    <View style={styles.container}>
      <Pressable style={styles.backRow} onPress={onBack} hitSlop={8}>
        <Ionicons name="arrow-back-outline" size={16} color={colors.textMuted} />
        <Text style={styles.backText}>Communities</Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{community.name}</Text>
          <View style={[styles.vibeTag, { borderColor: vibeColor[community.vibe] }]}>
            <Text style={[styles.vibeText, { color: vibeColor[community.vibe] }]}>{community.vibe}</Text>
          </View>
        </View>

        <Text style={styles.description}>{community.description}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
          <Text style={styles.metaText}>{community.meetupNote}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="people-outline" size={13} color={colors.textMuted} />
          <Text style={styles.metaText}>{memberCount} members</Text>
        </View>

        <PressScale style={[styles.button, isJoined && styles.buttonJoined]} onPress={onToggleJoin}>
          <Ionicons
            name={isJoined ? 'checkmark-circle' : 'add-circle-outline'}
            size={16}
            color={isJoined ? colors.textMuted : colors.accentText}
            style={styles.buttonIcon}
          />
          <Text style={[styles.buttonText, isJoined && styles.buttonTextJoined]}>
            {isJoined ? 'Joined' : 'Join community'}
          </Text>
        </PressScale>

        <Text style={styles.sectionTitle}>MEMBERS</Text>
        <View style={styles.card}>
          {members.map((member, index) => (
            <View key={member.id} style={[styles.memberRow, index === members.length - 1 && styles.memberRowLast]}>
              <Avatar playerId={member.id} size={34} style={styles.avatar} />
              <View style={styles.memberText}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberSkill}>{member.skillLabel}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>COMMUNITY CASUAL LADDER</Text>
        <View style={styles.card}>
          {ladder.map((player, index) => {
            const isMe = player.id === me.id;
            return (
              <View
                key={player.id}
                style={[
                  styles.ladderRow,
                  index === ladder.length - 1 && styles.memberRowLast,
                  isMe && styles.ladderRowMe,
                ]}
              >
                <Text style={styles.rankText}>{index + 1}</Text>
                <Avatar playerId={player.id} size={34} style={styles.avatar} />
                <View style={styles.memberText}>
                  <Text style={styles.memberName}>
                    {player.name}
                    {isMe && <Text style={styles.youTag}>  (you)</Text>}
                  </Text>
                </View>
                <Text style={styles.ladderStat}>{player.casualGamesPlayed} games</Text>
              </View>
            );
          })}
          {!isJoined && (
            <Text style={styles.joinHint}>Join to see where you'd rank on this community's ladder.</Text>
          )}
        </View>
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
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  backText: {
    color: colors.textMuted,
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  name: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 22,
    flex: 1,
    marginRight: spacing.sm,
  },
  vibeTag: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  vibeText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  description: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metaText: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12.5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 11,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  buttonJoined: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: colors.accentText,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  buttonTextJoined: {
    color: colors.textMuted,
  },
  sectionTitle: {
    color: colors.textFaint,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    ...shadow,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ladderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  ladderRowMe: {
    backgroundColor: colors.accentMuted,
  },
  memberRowLast: {
    borderBottomWidth: 0,
  },
  rankText: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 13,
    width: 16,
  },
  avatar: {
    marginRight: spacing.md,
  },
  memberText: {
    flex: 1,
  },
  memberName: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 13.5,
  },
  memberSkill: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 2,
  },
  youTag: {
    color: colors.accent,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  ladderStat: {
    color: colors.accent,
    fontFamily: fonts.bold,
    fontSize: 12.5,
  },
  joinHint: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
    padding: spacing.md,
    textAlign: 'center',
  },
});
