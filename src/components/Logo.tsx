import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

const LOGO_ASPECT_RATIO = 1381 / 365;

interface Props {
  size?: 'sm' | 'lg';
  suffix?: string;
  onPress?: () => void;
}

export default function Logo({ size = 'sm', suffix = 'RALLY', onPress }: Props) {
  const height = size === 'lg' ? 42 : 24;
  const width = Math.round(height * LOGO_ASPECT_RATIO);
  const content = (
    <View style={styles.row}>
      <Image
        source={require('../../assets/squashx-logo-light.png')}
        style={{ width, height }}
        resizeMode="contain"
      />
      {!!suffix && (
        <>
          <View style={[styles.divider, size === 'lg' && styles.dividerLg]} />
          <Text style={[styles.suffix, size === 'lg' && styles.suffixLg]}>{suffix}</Text>
        </>
      )}
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
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
    marginHorizontal: 9,
  },
  dividerLg: {
    height: 22,
  },
  suffix: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  suffixLg: {
    fontSize: 14,
  },
});
