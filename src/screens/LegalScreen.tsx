import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing } from '../theme';

interface Props {
  title: string;
  body: string;
  onBack: () => void;
}

export default function LegalScreen({ title, body, onBack }: Props) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.backRow} onPress={onBack} hitSlop={8}>
        <Ionicons name="arrow-back-outline" size={16} color={colors.textMuted} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.lg,
  },
  backText: {
    color: colors.textMuted,
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: 0.4,
    marginBottom: spacing.md,
  },
  body: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
  },
});
