import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressScale from './PressScale';
import { colors, fonts, radius, spacing } from '../theme';

const REPORT_REASONS = ['Inappropriate behavior', 'Fake profile', 'No-show', 'Other'];

interface Props {
  visible: boolean;
  playerName: string;
  onClose: () => void;
  onBlock: () => void;
  onReport: (reason: string, details: string) => void;
}

export default function SafetyMenu({ visible, playerName, onClose, onBlock, onReport }: Props) {
  const [mode, setMode] = useState<'menu' | 'report'>('menu');
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  const reset = () => {
    setMode('menu');
    setReason(null);
    setDetails('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleBlock = () => {
    onBlock();
    handleClose();
  };

  const handleSubmitReport = () => {
    if (!reason) return;
    onReport(reason, details.trim());
    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {mode === 'menu' ? (
            <View>
              <Text style={styles.title}>{playerName}</Text>
              <Pressable style={styles.row} onPress={() => setMode('report')} hitSlop={8}>
                <Ionicons name="flag-outline" size={18} color={colors.text} />
                <Text style={styles.rowText}>Report {playerName.split(' ')[0]}</Text>
              </Pressable>
              <Pressable style={styles.row} onPress={handleBlock} hitSlop={8}>
                <Ionicons name="ban-outline" size={18} color={colors.danger} />
                <Text style={[styles.rowText, { color: colors.danger }]}>Block {playerName.split(' ')[0]}</Text>
              </Pressable>
              <Pressable style={styles.cancelRow} onPress={handleClose} hitSlop={8}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <Text style={styles.title}>Report {playerName.split(' ')[0]}</Text>
              <Text style={styles.subtitle}>What happened?</Text>
              <View style={styles.chipWrap}>
                {REPORT_REASONS.map((r) => {
                  const active = reason === r;
                  return (
                    <Pressable
                      key={r}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setReason(r)}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{r}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <TextInput
                value={details}
                onChangeText={setDetails}
                placeholder="Add details (optional)"
                placeholderTextColor={colors.textFaint}
                style={styles.input}
                multiline
              />
              <View style={styles.actionsRow}>
                <Pressable style={styles.backButton} onPress={() => setMode('menu')} hitSlop={8}>
                  <Text style={styles.cancelText}>Back</Text>
                </Pressable>
                <PressScale
                  style={[styles.submitButton, !reason && styles.submitButtonDisabled]}
                  onPress={handleSubmitReport}
                  disabled={!reason}
                >
                  <Text style={styles.submitText}>Submit report</Text>
                </PressScale>
              </View>
            </View>
          )}
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
    marginBottom: spacing.md,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 14.5,
  },
  cancelRow: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  cancelText: {
    color: colors.textMuted,
    fontFamily: fonts.semibold,
    fontSize: 13.5,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  chipText: {
    color: colors.textMuted,
    fontFamily: fonts.semibold,
    fontSize: 12.5,
  },
  chipTextActive: {
    color: colors.text,
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
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 11,
    paddingHorizontal: 4,
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 11,
    paddingHorizontal: spacing.lg,
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
