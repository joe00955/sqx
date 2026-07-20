import React from 'react';
import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressScale from './PressScale';
import { colors, fonts, radius, spacing } from '../theme';

interface Props {
  visible: boolean;
  checkoutUrl: string | null;
  onClose: () => void;
}

const PERKS = [
  'Send and receive competitive match requests',
  'Climb the competitive ELO ladder',
  'Get matched on skill for serious games',
];

export default function UpgradeModal({ visible, checkoutUrl, onClose }: Props) {
  const handleUpgrade = () => {
    if (checkoutUrl) Linking.openURL(checkoutUrl);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Ionicons name="podium" size={28} color={colors.accent} />
          <Text style={styles.title}>Competitive is a paid feature</Text>
          <Text style={styles.price}>
            €4.99<Text style={styles.priceUnit}>/month</Text>
          </Text>
          <View style={styles.perksBox}>
            {PERKS.map((perk) => (
              <View key={perk} style={styles.perkRow}>
                <Ionicons name="checkmark-circle" size={15} color={colors.success} />
                <Text style={styles.perkText}>{perk}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.subtitle}>Casual matches, chat, and everything else stay free.</Text>
          <PressScale style={styles.upgradeButton} onPress={handleUpgrade} disabled={!checkoutUrl}>
            <Text style={styles.upgradeButtonText}>Upgrade to Competitive</Text>
          </PressScale>
          <Pressable onPress={onClose} hitSlop={8} style={styles.laterButton}>
            <Text style={styles.laterText}>Maybe later</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    maxWidth: 380,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 19,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  price: {
    color: colors.accent,
    fontFamily: fonts.display,
    fontSize: 32,
    marginTop: spacing.sm,
  },
  priceUnit: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  perksBox: {
    width: '100%',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    gap: 8,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  perkText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 13,
    flex: 1,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  upgradeButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 13,
    width: '100%',
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: colors.accentText,
    fontFamily: fonts.bold,
    fontSize: 14.5,
  },
  laterButton: {
    marginTop: spacing.md,
    paddingVertical: 8,
  },
  laterText: {
    color: colors.textMuted,
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
});
