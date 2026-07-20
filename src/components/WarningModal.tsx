import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressScale from './PressScale';
import { colors, fonts, radius, spacing } from '../theme';

interface Props {
  message: string | null;
  onAcknowledge: () => void;
}

export default function WarningModal({ message, onAcknowledge }: Props) {
  return (
    <Modal visible={!!message} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Ionicons name="alert-circle" size={26} color={colors.danger} />
          <Text style={styles.title}>A note from the SquashX team</Text>
          <Text style={styles.message}>{message}</Text>
          <PressScale style={styles.button} onPress={onAcknowledge}>
            <Text style={styles.buttonText}>I understand</Text>
          </PressScale>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  message: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    color: colors.accentText,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});
