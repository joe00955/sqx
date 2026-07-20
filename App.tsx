import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
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
import SquashXHomeScreen from './src/screens/SquashXHomeScreen';
import LegalScreen from './src/screens/LegalScreen';
import AuthScreen from './src/screens/AuthScreen';
import AdminScreen from './src/screens/AdminScreen';
import ChatScreen from './src/screens/ChatScreen';
import Logo from './src/components/Logo';
import AccentMotif from './src/components/AccentMotif';
import FadeIn from './src/components/FadeIn';
import { currentUser } from './src/data/mockData';
import { Player, RequestStatus, TimeSlot } from './src/data/types';
import { skillLabelFor } from './src/logic/skill';
import { slotKey } from './src/logic/slotKey';
import { colors, fonts, gradients, radius, spacing } from './src/theme';
import { isSupabaseConfigured } from './src/lib/supabase';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { useCourts } from './src/hooks/useCourts';
import { useProfile } from './src/hooks/useProfile';
import { usePlayers } from './src/hooks/usePlayers';
import { useCommunities } from './src/hooks/useCommunities';
import { useMatchRequests } from './src/hooks/useMatchRequests';
import { useLocation } from './src/hooks/useLocation';
import { useSafety } from './src/hooks/useSafety';
import { useVerification } from './src/hooks/useVerification';
import { useAdminVerifications } from './src/hooks/useAdminVerifications';
import { useMessages } from './src/hooks/useMessages';
import { useAdminReports } from './src/hooks/useAdminReports';

type Tab = 'browse' | 'requests' | 'communities' | 'ladders' | 'profile' | 'admin';

const baseTabs: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'browse', label: 'Browse', icon: 'search-outline' },
  { key: 'requests', label: 'Requests', icon: 'mail-outline' },
  { key: 'communities', label: 'Communities', icon: 'people-outline' },
  { key: 'ladders', label: 'Ladders', icon: 'podium-outline' },
  { key: 'profile', label: 'Profile', icon: 'person-outline' },
];

const adminTab: { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap } = {
  key: 'admin',
  label: 'Admin',
  icon: 'shield-outline',
};

const WIDE_BREAKPOINT = 820;
const MAX_CONTENT_WIDTH = 720;

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}

const isWeb = Platform.OS === 'web';

interface Route {
  view: 'hub' | 'rally';
  tab: Tab;
}

function pathForRoute(route: Route): string {
  return route.view === 'hub' ? '/' : `/${route.tab}`;
}

function routeForPath(pathname: string): Route {
  switch (pathname.replace(/\/+$/, '') || '/') {
    case '/requests':
      return { view: 'rally', tab: 'requests' };
    case '/communities':
      return { view: 'rally', tab: 'communities' };
    case '/ladders':
      return { view: 'rally', tab: 'ladders' };
    case '/profile':
      return { view: 'rally', tab: 'profile' };
    case '/browse':
      return { view: 'rally', tab: 'browse' };
    case '/admin':
      return { view: 'rally', tab: 'admin' };
    default:
      return { view: 'hub', tab: 'browse' };
  }
}

const initialRoute: Route = isWeb ? routeForPath(window.location.pathname) : { view: 'hub', tab: 'browse' };

function AppShell() {
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

  const [view, setView] = useState<'hub' | 'rally'>(initialRoute.view);
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState<Tab>(initialRoute.tab);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [chatRequestId, setChatRequestId] = useState<string | null>(null);
  const [legalPage, setLegalPage] = useState<'privacy' | 'terms' | null>(null);
  const skipNextUrlSync = useRef(false);

  useEffect(() => {
    if (!isWeb) return;
    const path = pathForRoute({ view, tab });
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false;
      return;
    }
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  }, [view, tab]);

  useEffect(() => {
    if (!isWeb) return;
    const handlePopState = () => {
      const route = routeForPath(window.location.pathname);
      skipNextUrlSync.current = true;
      setView(route.view);
      setTab(route.tab);
      setSelectedCommunityId(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  const { session, loading: authLoading, signOut } = useAuth();
  const userId = isSupabaseConfigured ? session?.user?.id ?? null : null;
  const { location: myLocation } = useLocation();
  const { courts: liveCourts } = useCourts(myLocation);
  const profile = useProfile(userId);
  const { players: allLivePlayers } = usePlayers(userId, myLocation);
  const { blockedIds, blockUser, reportUser } = useSafety(userId);
  const livePlayers = useMemo(
    () => allLivePlayers.filter((p) => !blockedIds.has(p.id)),
    [allLivePlayers, blockedIds]
  );
  const { communities: liveCommunities, joined: joinedCommunities, toggleJoin: toggleCommunity } = useCommunities(
    userId,
    livePlayers
  );
  const { incoming: incomingRequests, outgoing: outgoingRequests, respond: respondToRequest, sendRequest } = useMatchRequests(userId);
  const verification = useVerification(userId);
  const isAdmin = isSupabaseConfigured && profile.isAdmin;
  const adminVerifications = useAdminVerifications(isAdmin);
  const adminReports = useAdminReports(isAdmin);
  const visibleTabs = isAdmin ? [...baseTabs, adminTab] : baseTabs;

  const myId = isSupabaseConfigured ? userId : 'me';
  const chatRequest = chatRequestId
    ? [...incomingRequests, ...outgoingRequests].find((r) => r.id === chatRequestId) ?? null
    : null;
  const chatPlayer = chatRequest ? livePlayers.find((p) => p.id === chatRequest.playerId) ?? null : null;
  const chatMessages = useMessages(chatRequestId, myId);

  const handleUploadAvatar = async (file: File) => {
    const url = await verification.uploadAvatar(file);
    await profile.refetch();
    return url;
  };

  const handleUploadVerificationVideo = async (file: File) => {
    const ok = await verification.uploadVerificationVideo(file);
    await profile.refetch();
    return ok;
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !userId || !myLocation) return;
    profile.updateLocation(myLocation.latitude, myLocation.longitude);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, myLocation]);

  const toggleSlot = (key: string) => {
    if (isSupabaseConfigured) {
      const slot = profile.baseAvailability.find((s) => slotKey(s) === key);
      if (slot) profile.toggleSlotActive(slot);
      return;
    }
    setActiveSlots((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTabPress = (key: Tab) => {
    setTab(key);
    setSelectedCommunityId(null);
    setChatRequestId(null);
  };

  const handleOnboardingComplete = async (result: {
    name: string;
    skillLevel: number;
    homeCourtId: string;
    availability: TimeSlot[];
  }) => {
    if (isSupabaseConfigured) {
      await profile.createProfile({ ...result, contactEmail: session?.user?.email ?? null });
      return;
    }
    setName(result.name);
    setSkillLevel(result.skillLevel);
    setHomeCourtId(result.homeCourtId);
    setBaseAvailability(result.availability);
    setActiveSlots(Object.fromEntries(result.availability.map((slot) => [slotKey(slot), true])));
    setBio('New to SquashX Rally — up for casual games or a fair match.');
    setStats({ competitiveElo: 1400, casualGamesPlayed: 0 });
    setOnboarded(true);
  };

  const onSkillChange = (level: number) => {
    if (isSupabaseConfigured) {
      profile.updateSkillLevel(level);
      return;
    }
    setSkillLevel(level);
  };

  const me: Player = useMemo(() => {
    if (isSupabaseConfigured) {
      return {
        id: userId ?? 'me',
        name: profile.name,
        initials: initialsFor(profile.name || '?'),
        skillLevel: profile.skillLevel,
        skillLabel: skillLabelFor(profile.skillLevel),
        bio: profile.bio,
        homeCourtId: profile.homeCourtId ?? '',
        distanceKm: 0,
        availability: profile.baseAvailability.filter((slot) => profile.activeSlots[slotKey(slot)]),
        competitiveElo: profile.competitiveElo,
        casualGamesPlayed: profile.casualGamesPlayed,
        avatarUrl: profile.avatarUrl ?? undefined,
        verificationStatus: profile.verificationStatus,
      };
    }
    return {
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
    };
  }, [userId, profile, name, bio, skillLevel, homeCourtId, baseAvailability, activeSlots, stats]);

  const pendingCount = incomingRequests.filter((r) => r.status === 'pending').length;

  if (!fontsReady) {
    return (
      <View style={styles.loadingScreen}>
        <Image
          source={require('./assets/squashx-logo-light.png')}
          style={styles.loadingLogo}
          resizeMode="contain"
        />
        <ActivityIndicator color={colors.accent} style={styles.loadingSpinner} />
      </View>
    );
  }

  if (view === 'hub') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        {legalPage === 'privacy' ? (
          <LegalScreen
            title="Privacy Policy"
            body="SquashX Rally is an early-access product. Creating an account stores your profile (name, skill level, availability, home court), and — if you allow it — your approximate location, used only to show distance and sort matches. Once you and another player agree to a match, you can message each other in-app instead of exchanging personal contact details; messages are stored so the conversation works, but are only readable by the two of you — no one else can read a conversation unless it's reported. If you choose to verify your account, your profile photo and a short verification video are used only to confirm it's really you — the video is reviewed once by our team and permanently deleted the moment a decision is made; we keep only the verified/not-verified result, never the footage itself. You can report or block another player at any time; a report lets our team review the reported conversation (if any) to moderate it, and is never visible to other players. This is not yet a full legal privacy policy — one will be published before a commercial launch."
            onBack={() => setLegalPage(null)}
          />
        ) : legalPage === 'terms' ? (
          <LegalScreen
            title="Terms of Service"
            body="SquashX Rally is an early-access product, not a finished commercial service — expect rough edges and occasional resets. There are no payments or service guarantees at this stage. Be respectful of other players; abusive behavior can get you blocked or removed. A full terms of service will be published before a commercial launch."
            onBack={() => setLegalPage(null)}
          />
        ) : (
          <SquashXHomeScreen
            onEnterRally={() => setView('rally')}
            onOpenPrivacy={() => setLegalPage('privacy')}
            onOpenTerms={() => setLegalPage('terms')}
          />
        )}
      </SafeAreaView>
    );
  }

  if (isSupabaseConfigured && (authLoading || (session && profile.loading))) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <View style={styles.loadingScreen}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (isSupabaseConfigured && !session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <AuthScreen />
      </SafeAreaView>
    );
  }

  const needsOnboarding = isSupabaseConfigured ? !profile.exists : !onboarded;

  if (needsOnboarding) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <OnboardingScreen
          courts={liveCourts}
          onComplete={handleOnboardingComplete}
          onSkip={isSupabaseConfigured ? undefined : () => setOnboarded(true)}
        />
      </SafeAreaView>
    );
  }

  const selectedCommunity = selectedCommunityId ? liveCommunities.find((c) => c.id === selectedCommunityId) : null;

  const activeScreen =
    chatRequestId && chatPlayer ? (
      <ChatScreen
        player={chatPlayer}
        messages={chatMessages.messages}
        currentUserId={myId}
        loading={chatMessages.loading}
        onSend={chatMessages.sendMessage}
        onBack={() => setChatRequestId(null)}
        onBlock={() => {
          blockUser(chatPlayer.id);
          setChatRequestId(null);
        }}
        onReport={(reason, details) => reportUser(chatPlayer.id, reason, details, chatRequestId)}
      />
    ) : tab === 'browse' ? (
      <BrowseScreen
        me={me}
        players={livePlayers}
        courts={liveCourts}
        onSendRequest={(player, mode, booking) => sendRequest({ toUserId: player.id, mode, booking })}
        onBlockPlayer={blockUser}
        onReportPlayer={reportUser}
      />
    ) : tab === 'requests' ? (
      <RequestsScreen
        incoming={incomingRequests}
        outgoing={outgoingRequests}
        players={livePlayers}
        courts={liveCourts}
        onRespond={respondToRequest}
        onOpenChat={setChatRequestId}
      />
    ) : tab === 'communities' ? (
      selectedCommunity ? (
        <CommunityDetailScreen
          community={selectedCommunity}
          me={me}
          players={livePlayers}
          isJoined={!!joinedCommunities[selectedCommunity.id]}
          onToggleJoin={() => toggleCommunity(selectedCommunity.id)}
          onBack={() => setSelectedCommunityId(null)}
        />
      ) : (
        <CommunitiesScreen
          communities={liveCommunities}
          joined={joinedCommunities}
          onToggleJoin={toggleCommunity}
          onOpenDetail={setSelectedCommunityId}
        />
      )
    ) : tab === 'ladders' ? (
      <LaddersScreen me={me} players={livePlayers} />
    ) : tab === 'admin' ? (
      <AdminScreen
        pending={adminVerifications.pending}
        verificationsLoading={adminVerifications.loading}
        verificationError={adminVerifications.error}
        onApprove={adminVerifications.approve}
        onReject={adminVerifications.reject}
        reports={adminReports.reports}
        reportsLoading={adminReports.loading}
      />
    ) : (
      <ProfileScreen
        me={me}
        courts={liveCourts}
        baseAvailability={isSupabaseConfigured ? profile.baseAvailability : baseAvailability}
        skillLevel={me.skillLevel}
        onSkillChange={onSkillChange}
        activeSlots={isSupabaseConfigured ? profile.activeSlots : activeSlots}
        onToggleSlot={toggleSlot}
        onSignOut={isSupabaseConfigured ? signOut : undefined}
        verificationStatus={isSupabaseConfigured ? profile.verificationStatus : undefined}
        onUploadAvatar={isSupabaseConfigured ? handleUploadAvatar : undefined}
        onUploadVerificationVideo={isSupabaseConfigured ? handleUploadVerificationVideo : undefined}
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
              <Logo onPress={() => setView('hub')} />
            </View>
            {visibleTabs.map((t) => {
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
        <Logo onPress={() => setView('hub')} />
      </LinearGradient>

      <FadeIn key={contentKey} style={styles.content}>
        {activeScreen}
      </FadeIn>

      <View style={styles.tabBar}>
        {visibleTabs.map((t) => {
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

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
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
  loadingLogo: {
    width: 220,
    height: 58,
    marginBottom: spacing.xl,
  },
  loadingSpinner: {
    marginTop: spacing.sm,
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
