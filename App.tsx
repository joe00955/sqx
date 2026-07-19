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
import CommunityDetailScreen from './src/screens/CommunityDetailScreen';
import LaddersScreen from './src/screens/LaddersScreen';
import RequestsScreen from './src/screens/RequestsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import Logo from './src/components/Logo';
import AccentMotif from './src/components/AccentMotif';
import FadeIn from './src/components/FadeIn';
import { communities, currentUser, incomingRequests } from './src/data/mockData';
import { IncomingRequest, Player, RequestStatus, TimeSlot } from './src/data/types';
import { skillLabelFor } from './src/logic/skill';
import { slotKey } from './src/logic/slotKey';
import { colors, fonts, gradients, radius, spacing } from './src/theme';

type Tab = 'browse' | 'requests' | 'communities' | 'ladders' | 'profile';

const tabs: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'browse', label: 'Browse', icon: 'search-outline' },
  { key: 'requests', label: 'Requests', icon: 'mail-outline' },
  { key: 'communities', label: 'Communities', icon: 'people-outline' },
  { key: 'ladders', label: 'Ladders', icon: 'podium-outline' },
  { key: 'profile', label: 'Profile', icon: 'person-outline' },
];

const WIDE_BREAKPOINT = 820;
const MAX_CONTENT_WIDTH = 720;

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

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

  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState<Tab>('browse');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [skillLevel, setSkillLevel] = useState(currentUser.skillLevel);
  const [homeCourtId, setHomeCourtId] = useState(currentUser.homeCourtId);
  const [baseAvailability, setBaseAvailability] = useState<TimeSlot[]>(currentUser.availability);
  const [activeSlots, setActiveSlots] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(currentUser.availability.map((slot) => [slotKey(slot), true]))
  );
  const [stats, setStats] = useState({
    competitiveElo: currentUser.competitiveElo,
    casualGamesPlayed: currentUser.casualGamesPlayed,
  });

  const [joinedCommunities, setJoinedCommunities] = useState<Record<string, boolean>>({});
  const [requests, setRequests] = useState<IncomingRequest[]>(incomingRequests);

  const toggleSlot = (key: string) => setActiveSlots((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleCommunity = (id: string) => setJoinedCommunities((prev) => ({ ...prev, [id]: !prev[id] }));
  const respondToRequest = (id: string, status: RequestStatus) =>
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  const handleTabPress = (key: Tab) => {
    setTab(key);
    setSelectedCommunityId(null);
  };

  const handleOnboardingComplete = (result: {
    name: string;
    skillLevel: number;
    homeCourtId: string;
    availability: TimeSlot[];
  }) => {
    setName(result.name);
    setSkillLevel(result.skillLevel);
    setHomeCourtId(result.homeCourtId);
    setBaseAvailability(result.availability);
    setActiveSlots(Object.fromEntries(result.availability.map((slot) => [slotKey(slot), true])));
    setBio('New to SquashX Rally — up for casual games or a fair match.');
    setStats({ competitiveElo: 1400, casualGamesPlayed: 0 });
    setOnboarded(true);
  };

  const me: Player = useMemo(
    () => ({
      id: 'me',
      name,
      initials: initialsFor(name),
      skillLevel,
      skillLabel: skillLabelFor(skillLevel),
      bio,
      homeCourtId,
      distanceKm: 0,
      availability: baseAvailability.filter((slot) => activeSlots[slotKey(slot)]),
      competitiveElo: stats.competitiveElo,
      casualGamesPlayed: stats.casualGamesPlayed,
    }),
    [name, bio, skillLevel, homeCourtId, baseAvailability, activeSlots, stats]
  );

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  if (!fontsReady) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!onboarded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <OnboardingScreen onComplete={handleOnboardingComplete} onSkip={() => setOnboarded(true)} />
      </SafeAreaView>
    );
  }

  const selectedCommunity = selectedCommunityId ? communities.find((c) => c.id === selectedCommunityId) : null;

  const activeScreen =
    tab === 'browse' ? (
      <BrowseScreen me={me} />
    ) : tab === 'requests' ? (
      <RequestsScreen requests={requests} onRespond={respondToRequest} />
    ) : tab === 'communities' ? (
      selectedCommunity ? (
        <CommunityDetailScreen
          community={selectedCommunity}
          me={me}
          isJoined={!!joinedCommunities[selectedCommunity.id]}
          onToggleJoin={() => toggleCommunity(selectedCommunity.id)}
          onBack={() => setSelectedCommunityId(null)}
        />
      ) : (
        <CommunitiesScreen joined={joinedCommunities} onToggleJoin={toggleCommunity} onOpenDetail={setSelectedCommunityId} />
      )
    ) : tab === 'ladders' ? (
      <LaddersScreen me={me} />
    ) : (
      <ProfileScreen
        me={me}
        baseAvailability={baseAvailability}
        skillLevel={skillLevel}
        onSkillChange={setSkillLevel}
        activeSlots={activeSlots}
        onToggleSlot={toggleSlot}
      />
    );

  const contentKey = tab === 'communities' ? `communities-${selectedCommunityId ?? 'list'}` : tab;

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
              const badge = t.key === 'requests' ? pendingCount : 0;
              return (
                <Pressable
                  key={t.key}
                  style={[styles.sidebarItem, active && styles.sidebarItemActive]}
                  onPress={() => handleTabPress(t.key)}
                >
                  <View>
                    <Ionicons name={t.icon} size={18} color={active ? colors.accent : colors.textMuted} />
                    {badge > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.sidebarLabel, active && styles.sidebarLabelActive]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </LinearGradient>
          <View style={styles.wideContentOuter}>
            <FadeIn key={contentKey} style={styles.wideContentInner}>
              {activeScreen}
            </FadeIn>
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

      <FadeIn key={contentKey} style={styles.content}>
        {activeScreen}
      </FadeIn>

      <View style={styles.tabBar}>
        {tabs.map((t) => {
          const active = t.key === tab;
          const badge = t.key === 'requests' ? pendingCount : 0;
          return (
            <Pressable key={t.key} style={styles.tabButton} onPress={() => handleTabPress(t.key)}>
              <View>
                <Ionicons name={t.icon} size={19} color={active ? colors.accent : colors.textMuted} />
                {badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                )}
              </View>
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
    fontSize: 10.5,
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
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.accentText,
    fontFamily: fonts.extrabold,
    fontSize: 9,
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
