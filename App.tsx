import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BrowseScreen from './src/screens/BrowseScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { currentUser } from './src/data/mockData';
import { skillLabelFor } from './src/logic/skill';
import { slotKey } from './src/logic/slotKey';
import { colors, radius, spacing } from './src/theme';

type Tab = 'browse' | 'profile';

const tabs: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'browse', label: 'Browse', icon: 'search-outline' },
  { key: 'profile', label: 'Profile', icon: 'person-outline' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('browse');
  const [skillLevel, setSkillLevel] = useState(currentUser.skillLevel);
  const [activeSlots, setActiveSlots] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(currentUser.availability.map((slot) => [slotKey(slot), true]))
  );

  const toggleSlot = (key: string) => setActiveSlots((prev) => ({ ...prev, [key]: !prev[key] }));

  const me = useMemo(
    () => ({
      ...currentUser,
      skillLevel,
      skillLabel: skillLabelFor(skillLevel),
      availability: currentUser.availability.filter((slot) => activeSlots[slotKey(slot)]),
    }),
    [skillLevel, activeSlots]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <View style={styles.logoMark}>
          <Text style={styles.logoMarkText}>X</Text>
        </View>
        <Text style={styles.wordmark}>
          Squash<Text style={styles.wordmarkAccent}>X</Text> Rally
        </Text>
      </View>

      <View style={styles.content}>
        {tab === 'browse' ? (
          <BrowseScreen me={me} />
        ) : (
          <ProfileScreen
            skillLevel={skillLevel}
            onSkillChange={setSkillLevel}
            activeSlots={activeSlots}
            onToggleSlot={toggleSlot}
          />
        )}
      </View>

      <View style={styles.tabBar}>
        {tabs.map((t) => {
          const active = t.key === tab;
          return (
            <Pressable key={t.key} style={styles.tabButton} onPress={() => setTab(t.key)}>
              <Ionicons name={t.icon} size={20} color={active ? colors.accent : colors.textMuted} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
              {active && <View style={styles.tabIndicator} />}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: radius.sm - 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
  },
  logoMarkText: {
    color: colors.accentText,
    fontWeight: '900',
    fontSize: 16,
  },
  wordmark: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  wordmarkAccent: {
    color: colors.accent,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 3,
  },
  tabLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.accent,
  },
  tabIndicator: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
});
