import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import AccentMotif from '../components/AccentMotif';
import PressScale from '../components/PressScale';
import { colors, fonts, gradients, radius, shadow, spacing } from '../theme';

interface Props {
  onEnterRally: () => void;
}

const comingSoon: { icon: keyof typeof Ionicons.glyphMap; name: string; description: string }[] = [
  {
    icon: 'analytics-outline',
    name: 'SquashX Coach',
    description: 'AI-assisted technique feedback and personalized training plans.',
  },
  {
    icon: 'stopwatch-outline',
    name: 'SquashX Score',
    description: 'Live scoring and a referee assistant for club and league matches.',
  },
  {
    icon: 'pricetag-outline',
    name: 'SquashX Gear',
    description: 'Reviews and a marketplace for rackets, strings and shoes.',
  },
];

export default function SquashXHomeScreen({ onEnterRally }: Props) {
  return (
    <LinearGradient colors={gradients.glow} style={styles.root}>
      <AccentMotif style={styles.motif} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Logo size="lg" suffix="" />
          <Text style={styles.tagline}>
            A growing family of squash enhancements — matchmaking, coaching, and more, all built to make the sport
            easier to find and play.
          </Text>
        </View>

        <View style={styles.featuredCard}>
          <View style={styles.featuredBadge}>
            <Ionicons name="flash-outline" size={20} color={colors.accentText} />
          </View>
          <Text style={styles.featuredName}>SquashX Rally</Text>
          <Text style={styles.featuredDescription}>
            Find players, join local communities, and climb a casual or competitive ladder.
          </Text>
          <PressScale style={styles.enterButton} onPress={onEnterRally}>
            <Text style={styles.enterButtonText}>Enter Rally</Text>
            <Ionicons name="arrow-forward-outline" size={16} color={colors.accentText} />
          </PressScale>
        </View>

        <Text style={styles.sectionTitle}>MORE FROM SQUASHX</Text>
        {comingSoon.map((product) => (
          <View key={product.name} style={styles.productCard}>
            <View style={styles.productIconWrap}>
              <Ionicons name={product.icon} size={18} color={colors.textMuted} />
            </View>
            <View style={styles.productTextWrap}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDescription}>{product.description}</Text>
            </View>
            <View style={styles.soonPill}>
              <Text style={styles.soonPillText}>Coming soon</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  motif: {
    width: 260,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 1.5,
    paddingBottom: spacing.xl,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: spacing.xl,
  },
  tagline: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.md,
  },
  featuredCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadow,
  },
  featuredBadge: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    transform: [{ rotate: '-4deg' }],
  },
  featuredName: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 20,
    marginBottom: 6,
  },
  featuredDescription: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 12,
  },
  enterButtonText: {
    color: colors.accentText,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  sectionTitle: {
    color: colors.textFaint,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    opacity: 0.75,
  },
  productIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  productTextWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  productName: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 13.5,
  },
  productDescription: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  soonPill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  soonPillText: {
    color: colors.textFaint,
    fontFamily: fonts.bold,
    fontSize: 9.5,
    textTransform: 'uppercase',
  },
});
