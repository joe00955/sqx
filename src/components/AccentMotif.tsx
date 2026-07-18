import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

interface Props {
  style?: object;
}

/** Decorative angled "speed lines" — purely visual, evokes the pace of the game. */
export default function AccentMotif({ style }: Props) {
  return (
    <View style={[styles.wrap, style]} pointerEvents="none">
      <View style={[styles.bar, styles.bar1]} />
      <View style={[styles.bar, styles.bar2]} />
      <View style={[styles.bar, styles.bar3]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 160,
    overflow: 'hidden',
  },
  bar: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  bar1: {
    width: 90,
    top: '18%',
    right: -10,
    opacity: 0.5,
    transform: [{ rotate: '-32deg' }],
  },
  bar2: {
    width: 140,
    top: '46%',
    right: -30,
    opacity: 0.28,
    transform: [{ rotate: '-32deg' }],
  },
  bar3: {
    width: 70,
    top: '72%',
    right: 10,
    opacity: 0.16,
    transform: [{ rotate: '-32deg' }],
  },
});
