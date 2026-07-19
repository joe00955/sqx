import React, { useEffect, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text } from 'react-native';
import { MatchResult } from '../logic/matching';
import { MatchMode } from '../data/types';
import MatchCardContent from './MatchCardContent';
import { colors, fonts, radius } from '../theme';

const SWIPE_THRESHOLD = 120;
const ROTATION_RANGE = 10;
const FLY_OUT_DISTANCE = 700;

interface Props {
  match: MatchResult;
  mode: MatchMode;
  active: boolean;
  stackIndex: number;
  onSwipe: (direction: 'left' | 'right') => void;
  onMenuPress?: () => void;
}

export default function SwipeCard({ match, mode, active, stackIndex, onSwipe, onMenuPress }: Props) {
  const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const stackAnim = useRef(new Animated.Value(stackIndex)).current;

  const activeRef = useRef(active);
  activeRef.current = active;
  const onSwipeRef = useRef(onSwipe);
  onSwipeRef.current = onSwipe;

  useEffect(() => {
    Animated.spring(stackAnim, { toValue: stackIndex, useNativeDriver: false, friction: 8 }).start();
  }, [stackIndex, stackAnim]);

  useEffect(() => {
    if (active) {
      position.setValue({ x: 0, y: 0 });
    }
  }, [active, position]);

  const flyOut = (direction: 'left' | 'right') => {
    const toX = direction === 'right' ? FLY_OUT_DISTANCE : -FLY_OUT_DISTANCE;
    Animated.timing(position, { toValue: { x: toX, y: 20 }, duration: 220, useNativeDriver: false }).start(() => {
      onSwipeRef.current(direction);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => activeRef.current,
      onMoveShouldSetPanResponder: (_, gesture) => activeRef.current && Math.abs(gesture.dx) > 4,
      onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          flyOut('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          flyOut('left');
        } else {
          Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false, friction: 6 }).start();
        }
      },
    })
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-300, 0, 300],
    outputRange: [`-${ROTATION_RANGE}deg`, '0deg', `${ROTATION_RANGE}deg`],
    extrapolate: 'clamp',
  });

  const scale = stackAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [1, 0.96, 0.92], extrapolate: 'clamp' });
  const stackTranslateY = stackAnim.interpolate({ inputRange: [0, 1, 2], outputRange: [0, 12, 22], extrapolate: 'clamp' });

  const requestStampOpacity = position.x.interpolate({ inputRange: [10, 100], outputRange: [0, 1], extrapolate: 'clamp' });
  const passStampOpacity = position.x.interpolate({ inputRange: [-100, -10], outputRange: [1, 0], extrapolate: 'clamp' });

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          zIndex: 10 - stackIndex,
          transform: [
            { translateX: position.x },
            { translateY: Animated.add(position.y, stackTranslateY) },
            { scale },
            { rotate: active ? rotate : '0deg' },
          ],
        },
      ]}
      {...(active ? panResponder.panHandlers : {})}
    >
      <MatchCardContent match={match} mode={mode} onMenuPress={onMenuPress} />
      {active && (
        <>
          <Animated.View style={[styles.stamp, styles.requestStamp, { opacity: requestStampOpacity }]}>
            <Text style={styles.requestStampText}>REQUEST</Text>
          </Animated.View>
          <Animated.View style={[styles.stamp, styles.passStamp, { opacity: passStampOpacity }]}>
            <Text style={styles.passStampText}>PASS</Text>
          </Animated.View>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stamp: {
    position: 'absolute',
    top: 22,
    borderWidth: 3,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  requestStamp: {
    right: 20,
    borderColor: colors.accent,
    transform: [{ rotate: '14deg' }],
  },
  requestStampText: {
    color: colors.accent,
    fontFamily: fonts.extrabold,
    fontSize: 18,
    letterSpacing: 1,
  },
  passStamp: {
    left: 20,
    borderColor: colors.textFaint,
    transform: [{ rotate: '-14deg' }],
  },
  passStampText: {
    color: colors.textFaint,
    fontFamily: fonts.extrabold,
    fontSize: 18,
    letterSpacing: 1,
  },
});
