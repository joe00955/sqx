import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts as useAnton, Anton_400Regular } from '@expo-google-fonts/anton';
import {
  useFonts as useManrope,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import BrowseScreen from './src/screens/BrowseScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CommunitiesScreen from './src/screens/CommunitiesScreen';
import LaddersScreen from './src/screens/LaddersScreen';
import Logo from './src/components/Logo';
import AccentMotif from './src/components/AccentMotif';
import { currentUser } from './src/data/mockData';
import { skillLabelFor } from './src/logic/skill';
import { slotKey } from './src/logic/slotKey';
import { colors, fonts, gradients, radius, spacing } from './src/theme';

type Tab = 'browse' | 'communities' | 'ladders' | 'profile';

const tabs: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'browse', label: 'Browse', icon: 'search-outline' },
  { key: 'communities', label: 'Communities', icon: 'people-outline' },
  { key: 'ladders', label: 'Ladders', icon: 'podium-outline' },
  { key: 'profile', label: 'Profile', icon: 'person-outline' },
];

const WIDE_BREAKPOINT = 820;
const MAX_CONTENT_WIDTH = 720;

export default function App() {
  const [antonLoaded] = useAnton({ Anton_400Regular });
  const [manropeLoaded] = useManrope({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });
  const fontsReady = antonLoaded && manropeLoaded;

  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;

  const [tab, setTab] = useState<Tab>('browse');
  const [skillLevel, setSkillLevel] = useState(currentUser.skillLevel);
  const [activeSlots, setActiveSlots] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(currentUser.availability.map((slot) => [slotKey(slot), true]))
  );
  const [joinedCommunities, setJoinedCommunities] = useState<Record<string, boolean>>({});

  const toggleSlot = (key: string) => setActiveSlots((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleCommunity = (id: string) => setJoinedCommunities((prev) => ({ ...prev, [id]: !prev[id] }));

  const me = useMemo(
    () => ({
      ...currentUser,
      skillLevel,
      skillLabel: skillLabelFor(skillLevel),
      availability: currentUser.availability.filter((slot) => activeSlots[slotKey(slot)]),
    }),
    [skillLevel, activeSlots]
  );

  if (!fontsReady) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const activeScreen =
    tab === 'browse' ? (
      <BrowseScreen me={me} />
    ) : tab === 'communities' ? (
      <CommunitiesScreen joined={joinedCommunities} onToggleJoin={toggleCommunity} />
    ) : tab === 'ladders' ? (
      <LaddersScreen me={me} />
    ) : (
      <ProfileScreen
        skillLevel={skillLevel}
        onSkillChange={setSkillLevel}
        activeSlots={activeSlots}
        onToggleSlot={toggleSlot}
      />
    );

  if (isWide) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.wideRoot}>
          <LinearGradient colors={gradients.glow} style={styles.sidebar}>
            <AccentMotif style={styles.sidebarMotif} />
            <View style={styles.sidebarLogoWrap}>
              <Logo />
            </View>
            {tabs.map((t) => {
              const active = t.key === tab;
              return (
                <Pressable
                  key={t.key}
                  style={[styles.sidebarItem, active && styles.sidebarItemActive]}
                  onPress={() => setTab(t.key)}
                >
                  <Ionicons name={t.icon} size={18} color={active ? colors.accent : colors.textMuted} />
                  <Text style={[styles.sidebarLabel, active && styles.sidebarLabelActive]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </LinearGradient>
          <View style={styles.wideContentOuter}>
            <View style={styles.wideContentInner}>{activeScreen}</View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <LinearGradient colors={gradients.glow} style={styles.header}>
        <AccentMotif style={styles.headerMotif} />
        <Logo />
      </LinearGradient>

      <View style={styles.content}>{activeScreen}</View>

      <View style={styles.tabBar}>
        {tabs.map((t) => {
          const active = t.key === tab;
          return (
            <Pressable key={t.key} style={styles.tabButton} onPress={() => setTab(t.key)}>
              <Ionicons name={t.icon} size={19} color={active ? colors.accent : colors.textMuted} />
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
  loadingScreen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Narrow (mobile) layout
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    overflow: 'hidden',
  },
  headerMotif: {
    width: 200,
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
    fontFamily: fonts.semibold,
    fontSize: 11.5,
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

  // Wide (web) layout
  wideRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 220,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
  sidebarMotif: {
    width: 220,
  },
  sidebarLogoWrap: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    marginBottom: 4,
  },
  sidebarItemActive: {
    backgroundColor: colors.surface,
  },
  sidebarLabel: {
    color: colors.textMuted,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  sidebarLabelActive: {
    color: colors.text,
  },
  wideContentOuter: {
    flex: 1,
    alignItems: 'center',
  },
  wideContentInner: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
  },
});
