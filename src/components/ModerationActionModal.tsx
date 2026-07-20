import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import PressScale from './PressScale';
import { colors, fonts, radius, spacing } from '../theme';

interface Props {
  visible: boolean;
  mode: 'ban' | 'warn';
  playerName: string;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export default function ModerationActionModal({ visible, mode, playerName, onClose, onSubmit }: Props) {
  const [text, setText] = useState('');

  const handleClose = () => {
    setText('');
    onClose();
  };

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim());
    handleClose();
  };

  const copy =
    mode === 'ban'
      ? {
          title: `Ban ${playerName.split(' ')[0]}`,
          subtitle: 'They will be signed out of the app and removed from matching. Say why, for your own records.',
          placeholder: 'Reason for the ban',
          submitLabel: 'Confirm ban',
        }
      : {
          title: `Warn ${playerName.split(' ')[0]}`,
          subtitle: "They'll see this message next time they open the app and have to acknowledge it.",
          placeholder: 'Warning message',
          submitLabel: 'Send warning',
        };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={copy.placeholder}
            placeholderTextColor={colors.textFaint}
            style={styles.input}
            multiline
            autoFocus
          />
          <View style={styles.actionsRow}>
            <Pressable style={styles.cancelButton} onPress={handleClose} hitSlop={8}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <PressScale
              style={[styles.submitButton, mode === 'ban' && styles.banButton, !text.trim() && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!text.trim()}
            >
              <Text style={styles.submitText}>{copy.submitLabel}</Text>
            </PressScale>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 13.5,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelButton: {
    paddingVertical: 11,
    paddingHorizontal: 4,
  },
  cancelText: {
    color: colors.textMuted,
    fontFamily: fonts.semibold,
    fontSize: 13.5,
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 11,
    paddingHorizontal: spacing.lg,
  },
  banButton: {
    backgroundColor: colors.danger,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitText: {
    color: colors.accentText,
    fontFamily: fonts.bold,
    fontSize: 13.5,
  },
});
