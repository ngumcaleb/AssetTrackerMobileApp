import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useDrawer } from '@/context/DrawerContext';
import { useFetch } from '@/hooks/useFetch';
import { getInitials } from '@/utils/format';
import type { DashboardSummary } from '@/types/api';

const BRAND       = '#800020';
const BRAND_LIGHT = '#fde6e6';

const softShadow = Platform.select({
  ios:     { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 2 },
  web:     { boxShadow: '0 2px 14px rgba(15, 23, 42, 0.07)' },
});

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onPress} disabled={!onPress}>
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Ionicons name={icon} size={18} color={danger ? '#dc2626' : BRAND} />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {onPress ? <Ionicons name="chevron-forward" size={16} color="#cbd5e1" /> : null}
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeaderWrap}>
      <Text style={styles.sectionHeader}>{title}</Text>
    </View>
  );
}

export default function MoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { openDrawer } = useDrawer();
  const { data: summary, loading } = useFetch<DashboardSummary>({ endpoint: '/api/summary' });

  const handleLogout = React.useCallback(async () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  }, [logout, router]);

  const stats = [
    { label: 'Total',     value: loading ? '—' : (summary?.total ?? 0),       icon: 'cube-outline'              as const },
    { label: 'Active',    value: loading ? '—' : (summary?.active ?? 0),      icon: 'checkmark-circle-outline'  as const },
    { label: 'Checked Out', value: loading ? '—' : (summary?.checked_out ?? 0), icon: 'swap-horizontal-outline' as const },
    { label: 'Archived',  value: loading ? '—' : (summary?.archived ?? 0),    icon: 'archive-outline'           as const },
  ];

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── App Bar ────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={openDrawer}>
          <Ionicons name="menu" size={24} color="#1e293b" />
        </TouchableOpacity>

        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.brandLogo}
          resizeMode="contain"
        />

        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={22} color="#1e293b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatar} activeOpacity={0.85} onPress={() => router.push('/profile')}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Band ─────────────────────────────────────── */}
        <LinearGradient
          colors={['#4a0012', '#800020', '#8a0d28']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={[styles.decorOrb, styles.decorOrbA]} />
          <View style={[styles.decorOrb, styles.decorOrbB]} />

          <Text style={styles.heroEyebrow}>ACCOUNT & TOOLS</Text>
          <Text style={styles.heroTitle}>More</Text>
          <Text style={styles.heroSubtitle}>
            Manage your account, inventory tools and preferences.
          </Text>
        </LinearGradient>

        {/* ── Profile Card (overlapping the band) ───────────── */}
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.8} onPress={() => router.push('/profile')}>
          <View style={styles.profileRow}>
            <LinearGradient
              colors={['#66001a', '#800020', '#8a0d28']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileAvatar}
            >
              <Text style={styles.profileAvatarText}>{getInitials(user?.name)}</Text>
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>{user?.name ?? 'User'}</Text>
              <Text style={styles.profileMeta} numberOfLines={1}>
                {user?.email}
                {user?.department ? ` · ${user.department}` : ''}
              </Text>
              <View style={styles.roleBadge}>
                <Ionicons name="shield-checkmark-outline" size={11} color={BRAND} />
                <Text style={styles.roleText}>{user?.role ?? 'member'}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </View>

          <View style={styles.profileDivider} />
          <View style={styles.statsRow}>
            {stats.map((s, idx) => (
              <React.Fragment key={s.label}>
                {idx > 0 && <View style={styles.statDivider} />}
                <View style={styles.statItem}>
                  <Ionicons name={s.icon} size={15} color={BRAND} />
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </TouchableOpacity>

        {/* ── Inventory Tools ───────────────────────────────── */}
        <SectionHeader title="Inventory Tools" />
        <View style={styles.card}>
          <SettingsRow icon="search-outline" label="Search Assets" onPress={() => router.push('/search')} />
          <View style={styles.divider} />
          <SettingsRow icon="folder-open-outline" label="Categories" onPress={() => router.push('/categories')} />
          <View style={styles.divider} />
          <SettingsRow icon="swap-horizontal-outline" label="Check-outs" onPress={() => router.push('/checkouts')} />
          <View style={styles.divider} />
          <SettingsRow icon="archive-outline" label="Archived Assets" onPress={() => router.push('/archived-assets')} />
          <View style={styles.divider} />
          <SettingsRow icon="add-circle-outline" label="Register Asset" onPress={() => router.push('/register-asset')} />
        </View>

        {/* ── Preferences ───────────────────────────────────── */}
        <SectionHeader title="Preferences" />
        <View style={styles.card}>
          <SettingsRow icon="notifications-outline" label="Notifications" onPress={() => router.push('/notifications')} />
          <View style={styles.divider} />
          <SettingsRow icon="settings-outline" label="Settings" onPress={() => router.push('/settings')} />
          <View style={styles.divider} />
          <SettingsRow icon="key-outline" label="Change Password" onPress={() => router.push('/settings')} />
        </View>

        {/* ── About ─────────────────────────────────────────── */}
        <SectionHeader title="About" />
        <View style={styles.card}>
          <SettingsRow icon="information-circle-outline" label="App Version" value="1.0.0" />
        </View>

        {/* ── Logout ────────────────────────────────────────── */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.75} onPress={handleLogout}>
          <LinearGradient
            colors={['#fef2f2', '#ffe4e6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out-outline" size={19} color="#dc2626" />
            <Text style={styles.logoutText}>Log Out</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.version}>Royalty World Asset Tracker v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f4f4' },

  // ── App Bar ─────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 3 },
      web: { boxShadow: '0 1px 6px rgba(15, 23, 42, 0.06)' },
    }),
  },
  brandLogo: { height: 30, width: 130 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f8f4f4', alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  // ── Hero Band ───────────────────────────────────────────
  hero: {
    paddingTop: 22,
    paddingBottom: 38,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  decorOrb: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)' },
  decorOrbA: { top: -50, right: -40, width: 190, height: 190 },
  decorOrbB: { bottom: -70, left: -40, width: 160, height: 160 },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#fff',
    marginBottom: 4,
  },
  heroSubtitle: { fontSize: 13.5, color: 'rgba(255,255,255,0.72)' },

  // ── Profile Card ────────────────────────────────────────
  profileCard: {
    marginHorizontal: 16,
    marginTop: -34,
    marginBottom: 6,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    ...softShadow,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  profileAvatarText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '800', color: '#0f172a', letterSpacing: -0.2 },
  profileMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: BRAND_LIGHT,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },
  roleText: { fontSize: 10, fontWeight: '800', color: BRAND, textTransform: 'uppercase', letterSpacing: 0.6 },

  profileDivider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 14 },
  statsRow: { flexDirection: 'row', alignItems: 'flex-start' },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, alignSelf: 'stretch', backgroundColor: '#f1f5f9' },
  statValue: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginTop: 2 },
  statLabel: { fontSize: 10.5, fontWeight: '600', color: '#94a3b8', textAlign: 'center' },

  // ── Sections ────────────────────────────────────────────
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  sectionHeaderWrap: { paddingHorizontal: 20, marginTop: 22, marginBottom: 10 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 4,
    marginHorizontal: 16,
    marginBottom: 4,
    ...softShadow,
  },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: BRAND_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowIconDanger: { backgroundColor: '#fee2e2' },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1e293b' },
  rowLabelDanger: { color: '#dc2626' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 13, color: '#64748b' },

  // ── Logout ──────────────────────────────────────────────
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 18,
    borderRadius: 20,
    overflow: 'hidden',
    ...softShadow,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#dc2626' },

  version: { fontSize: 12, color: '#94a3b8', textAlign: 'center' },
});
