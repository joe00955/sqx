import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';

export default function VerifiedBadge({ size = 12 }: { size?: number }) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="checkmark-circle" size={size} color={colors.success} />
      <Text style={[styles.text, { fontSize: size - 1 }]}>Verified</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  text: {
    color: colors.success,
    fontFamily: fonts.bold,
  },
});
