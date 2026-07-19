import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

interface Props {
  size?: 'sm' | 'lg';
  suffix?: string;
  onPress?: () => void;
}

export default function Logo({ size = 'sm', suffix = 'RALLY', onPress }: Props) {
  const badgeSize = size === 'lg' ? 44 : 30;
  const content = (
    <View style={styles.row}>
      <View style={[styles.badge, { width: badgeSize, height: badgeSize }]}>
        <Text style={[styles.badgeText, size === 'lg' && styles.badgeTextLg]}>X</Text>
      </View>
      <Text style={[styles.wordmark, size === 'lg' && styles.wordmarkLg]}>
        SQUASH<Text style={styles.wordmarkAccent}>X</Text>
        {suffix ? ` ${suffix}` : ''}
      </Text>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    transform: [{ rotate: '-8deg' }],
  },
  badgeText: {
    color: colors.accentText,
    fontFamily: fonts.display,
    fontSize: 16,
    transform: [{ rotate: '8deg' }],
  },
  badgeTextLg: {
    fontSize: 24,
  },
  wordmark: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 16,
    letterSpacing: 0.6,
  },
  wordmarkLg: {
    fontSize: 22,
  },
  wordmarkAccent: {
    color: colors.accent,
  },
});
