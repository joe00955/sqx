import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Community } from '../data/types';
import PressScale from '../components/PressScale';
import { colors, fonts, radius, shadow, spacing } from '../theme';

interface Props {
  communities: Community[];
  joined: Record<string, boolean>;
  onToggleJoin: (id: string) => void;
  onOpenDetail: (id: string) => void;
}

const vibeColor: Record<Community['vibe'], string> = {
  Casual: colors.success,
  Competitive: colors.accent,
  Mixed: colors.textMuted,
};

function CommunityCard({
  community,
  isJoined,
  onToggle,
  onOpenDetail,
}: {
  community: Community;
  isJoined: boolean;
  onToggle: () => void;
  onOpenDetail: () => void;
}) {
  const memberCount = community.memberCount + (isJoined ? 1 : 0);
  return (
    <View style={styles.card}>
      <Pressable onPress={onOpenDetail}>
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
        <View style={styles.viewDetailRow}>
          <Text style={styles.viewDetailText}>View members & ladder</Text>
          <Ionicons name="chevron-forward-outline" size={13} color={colors.accent} />
        </View>
      </Pressable>

      <PressScale
        style={[styles.button, isJoined && styles.buttonJoined]}
        onPress={onToggle}
      >
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
    </View>
  );
}

export default function CommunitiesScreen({ communities, joined, onToggleJoin, onOpenDetail }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.title}>COMMUNITIES</Text>
        <Text style={styles.subtitle}>Regular groups and clubs around Duisburg — join instead of finding a partner from scratch every time</Text>
      </View>

      <FlatList
        data={communities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CommunityCard
            community={item}
            isJoined={!!joined[item.id]}
            onToggle={() => onToggleJoin(item.id)}
            onOpenDetail={() => onOpenDetail(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
    lineHeight: 18,
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  name: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
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
  viewDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  viewDetailText: {
    color: colors.accent,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 11,
    marginTop: spacing.md,
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
});
