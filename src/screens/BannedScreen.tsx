import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '../theme';

interface Props {
  reason: string | null;
  onSignOut: () => void;
}

export default function BannedScreen({ reason, onSignOut }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="ban" size={40} color={colors.danger} />
      <Text style={styles.title}>Account suspended</Text>
      <Text style={styles.body}>
        Your SquashX Rally account has been suspended by a moderator{reason ? ':' : '.'}
      </Text>
      {!!reason && <Text style={styles.reason}>{reason}</Text>}
      <Text style={styles.body}>If you think this is a mistake, get in touch with the SquashX team.</Text>
      <Pressable style={styles.signOutButton} onPress={onSignOut} hitSlop={8}>
        <Ionicons name="log-out-outline" size={15} color={colors.textMuted} />
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 22,
    marginTop: spacing.sm,
  },
  body: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13.5,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 19,
  },
  reason: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 13.5,
    textAlign: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: 320,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.lg,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  signOutText: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
});
