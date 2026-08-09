import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PressScale from '../components/PressScale';
import { MAX_LIVES, Zone, ZONES, pickNextZone, timeForRep } from '../logic/ghostingGame';
import { playCueSound, playGameOverSound, playHitSound, playMissSound } from '../lib/sound';
import { colors, fonts, radius, shadow, spacing } from '../theme';

type Phase = 'idle' | 'playing' | 'gameover';

const ZONE_POSITIONS: Record<Zone, { top: string; left: string }> = {
  FL: { top: '14%', left: '22%' },
  FR: { top: '14%', left: '78%' },
  T: { top: '50%', left: '50%' },
  BL: { top: '88%', left: '22%' },
  BR: { top: '88%', left: '78%' },
};

const NEXT_REP_PAUSE_MS = 220;

interface Props {
  onBack: () => void;
}

export default function CoachScreen({ onBack }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [activeZone, setActiveZone] = useState<Zone | null>(null);
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null);

  const repTokenRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progress = useRef(new Animated.Value(1)).current;

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    progress.stopAnimation();
  }, [progress]);

  useEffect(() => clearTimers, [clearTimers]);

  const startRep = useCallback(
    (nextScore: number, previousZone: Zone | null) => {
      const token = ++repTokenRef.current;
      const zone = pickNextZone(previousZone);
      const durationMs = timeForRep(nextScore);

      setActiveZone(zone);
      progress.setValue(1);
      playCueSound();

      Animated.timing(progress, {
        toValue: 0,
        duration: durationMs,
        useNativeDriver: false,
      }).start();

      timeoutRef.current = setTimeout(() => {
        if (repTokenRef.current !== token) return;
        resolveRep(false, zone, nextScore, token);
      }, durationMs);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progress]
  );

  const resolveRep = useCallback(
    (hit: boolean, zone: Zone, scoreAtRep: number, token: number) => {
      if (repTokenRef.current !== token) return;
      repTokenRef.current += 1; // invalidate this rep so its timeout/tap can't double-fire
      clearTimers();

      if (hit) {
        playHitSound();
        setFlash('hit');
        const nextScore = scoreAtRep + 1;
        setScore(nextScore);
        setBest((prev) => Math.max(prev, nextScore));
        setTimeout(() => {
          setFlash(null);
          startRep(nextScore, zone);
        }, NEXT_REP_PAUSE_MS);
        return;
      }

      playMissSound();
      setFlash('miss');
      setLives((prevLives) => {
        const remaining = prevLives - 1;
        if (remaining <= 0) {
          setTimeout(() => {
            setFlash(null);
            setActiveZone(null);
            playGameOverSound();
            setPhase('gameover');
          }, NEXT_REP_PAUSE_MS);
        } else {
          setTimeout(() => {
            setFlash(null);
            startRep(scoreAtRep, zone);
          }, NEXT_REP_PAUSE_MS);
        }
        return remaining;
      });
    },
    [clearTimers, startRep]
  );

  const handleZonePress = (zone: Zone) => {
    if (phase !== 'playing' || !activeZone) return;
    resolveRep(zone === activeZone, activeZone, score, repTokenRef.current);
  };

  const startGame = () => {
    clearTimers();
    setScore(0);
    setLives(MAX_LIVES);
    setFlash(null);
    setPhase('playing');
    startRep(0, null);
  };

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <View>
          <Text style={styles.title}>SQUASHX COACH</Text>
          <Text style={styles.subtitle}>Footwork ghosting timer</Text>
        </View>
      </View>

      {phase === 'idle' && (
        <View style={styles.card}>
          <Ionicons name="footsteps-outline" size={26} color={colors.accent} />
          <Text style={styles.cardTitle}>Beat the call</Text>
          <Text style={styles.cardBody}>
            A court zone lights up — sprint to it before the bar runs out. Miss three and it's game over. The
            calls come faster the longer you last.
          </Text>
          {best > 0 && (
            <View style={styles.bestRow}>
              <Ionicons name="trophy-outline" size={14} color={colors.accent} />
              <Text style={styles.bestText}>Best this session: {best}</Text>
            </View>
          )}
          <PressScale style={styles.startButton} onPress={startGame}>
            <Ionicons name="play" size={16} color={colors.accentText} />
            <Text style={styles.startButtonText}>Start drill</Text>
          </PressScale>
        </View>
      )}

      {phase === 'playing' && (
        <View style={styles.playArea}>
          <View style={styles.statRow}>
            <View style={styles.statCell}>
              <Text style={styles.statValue}>{score}</Text>
              <Text style={styles.statLabel}>SCORE</Text>
            </View>
            <View style={styles.livesRow}>
              {Array.from({ length: MAX_LIVES }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < lives ? 'heart' : 'heart-outline'}
                  size={16}
                  color={i < lives ? colors.danger : colors.textFaint}
                />
              ))}
            </View>
          </View>

          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, { width: barWidth }]} />
          </View>

          <View style={styles.court}>
            {ZONES.map((zone) => {
              const active = zone === activeZone;
              return (
                <Pressable
                  key={zone}
                  onPress={() => handleZonePress(zone)}
                  style={[
                    styles.zone,
                    ZONE_POSITIONS[zone] as any,
                    active && styles.zoneActive,
                    active && flash === 'hit' && styles.zoneHit,
                    active && flash === 'miss' && styles.zoneMiss,
                  ]}
                >
                  <Text style={[styles.zoneText, active && styles.zoneTextActive]}>{zone}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {phase === 'gameover' && (
        <View style={styles.card}>
          <Ionicons name="flag-outline" size={26} color={colors.accent} />
          <Text style={styles.cardTitle}>Drill over</Text>
          <Text style={styles.finalScore}>{score}</Text>
          <Text style={styles.cardBody}>
            {score >= best && score > 0 ? "New session best!" : `Session best: ${best}`}
          </Text>
          <PressScale style={styles.startButton} onPress={startGame}>
            <Ionicons name="refresh" size={16} color={colors.accentText} />
            <Text style={styles.startButtonText}>Play again</Text>
          </PressScale>
          <Pressable onPress={onBack} hitSlop={8} style={styles.laterButton}>
            <Text style={styles.laterText}>Back to home</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 20,
    letterSpacing: 0.4,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    marginTop: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadow,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 20,
    marginTop: spacing.sm,
  },
  cardBody: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  finalScore: {
    color: colors.accent,
    fontFamily: fonts.display,
    fontSize: 44,
    marginTop: spacing.xs,
  },
  bestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  bestText: {
    color: colors.accent,
    fontFamily: fonts.bold,
    fontSize: 12.5,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  startButtonText: {
    color: colors.accentText,
    fontFamily: fonts.bold,
    fontSize: 14,
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
  playArea: {
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statCell: {
    alignItems: 'flex-start',
  },
  statValue: {
    color: colors.accent,
    fontFamily: fonts.display,
    fontSize: 26,
  },
  statLabel: {
    color: colors.textFaint,
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  livesRow: {
    flexDirection: 'row',
    gap: 4,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  court: {
    flex: 1,
    minHeight: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  zone: {
    position: 'absolute',
    width: 60,
    height: 60,
    marginLeft: -30,
    marginTop: -30,
    borderRadius: 30,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
    borderWidth: 2,
  },
  zoneHit: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  zoneMiss: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  zoneText: {
    color: colors.textMuted,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  zoneTextActive: {
    color: colors.text,
  },
});
