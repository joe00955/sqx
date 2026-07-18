import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import BrowseScreen from './src/screens/BrowseScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { currentUser } from './src/data/mockData';
import { skillLabelFor } from './src/logic/skill';
import { slotKey } from './src/logic/slotKey';
import { colors } from './src/theme';

type Tab = 'browse' | 'profile';

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
        <Pressable style={styles.tabButton} onPress={() => setTab('browse')}>
          <Text style={[styles.tabLabel, tab === 'browse' && styles.tabLabelActive]}>Browse</Text>
        </Pressable>
        <Pressable style={styles.tabButton} onPress={() => setTab('profile')}>
          <Text style={[styles.tabLabel, tab === 'profile' && styles.tabLabelActive]}>Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.accent,
  },
});
