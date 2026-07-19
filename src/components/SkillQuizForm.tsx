import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { skillQuizQuestions } from '../logic/skillQuiz';
import { colors, fonts, radius, spacing } from '../theme';

interface Props {
  answers: (number | null)[];
  onAnswer: (questionIndex: number, points: number) => void;
}

export default function SkillQuizForm({ answers, onAnswer }: Props) {
  return (
    <View>
      {skillQuizQuestions.map((question, questionIndex) => (
        <View key={question.id} style={styles.card}>
          <Text style={styles.question}>{question.question}</Text>
          {question.options.map((option) => {
            const selected = answers[questionIndex] === option.points;
            return (
              <Pressable
                key={option.label}
                style={[styles.optionRow, selected && styles.optionRowSelected]}
                onPress={() => onAnswer(questionIndex, option.points)}
              >
                <Ionicons
                  name={selected ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={selected ? colors.accent : colors.textFaint}
                />
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  question: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: 2,
  },
  optionRowSelected: {
    backgroundColor: colors.accentMuted,
  },
  optionText: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    flex: 1,
  },
  optionTextSelected: {
    color: colors.text,
    fontFamily: fonts.semibold,
  },
});
