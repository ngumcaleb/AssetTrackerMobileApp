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
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useDrawer } from '@/context/DrawerContext';
import { useFetch } from '@/hooks/useFetch';
import { getInitials } from '@/utils/format';
import type { DashboardSummary } from '@/types/api';

const BRAND = '#800020';
const BRAND_LIGHT = '#fde6e6';

function SettingsRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onPress} disabled={!onPress}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <Ionicons name={icon} size={19} color={BRAND} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {onPress ? <Ionicons name="chevron-forward" size={18} color="#94a3b8" /> : null}
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
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
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color="#1e293b" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatar}
            activeOpacity={0.85}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>More & Settings</Text>
        <Text style={styles.screenSubtitle}>Account, inventory management tools, and preferences.</Text>

        <SectionHeader title="Account" />
        <View style={styles.card}>
          <TouchableOpacity style={styles.orgRow} activeOpacity={0.7} onPress={() => router.push('/profile')}>
            <View style={styles.orgAvatar}>
              <Text style={styles.orgAvatarText}>{getInitials(user?.name)}</Text>
            </View>
            <View style={styles.orgInfo}>
              <Text style={styles.orgName}>{user?.name ?? 'User'}</Text>
              <Text style={styles.orgPlan}>
                {user?.email}
                {user?.department ? ` · ${user.department}` : ''}
              </Text>
              <Text style={styles.orgSub}>
                {loading ? '…' : `${summary?.total ?? 0} assets in inventory`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

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

        <SectionHeader title="Preferences" />
        <View style={styles.card}>
          <SettingsRow icon="notifications-outline" label="Notifications" onPress={() => router.push('/notifications')} />
          <View style={styles.divider} />
          <SettingsRow icon="settings-outline" label="Settings" onPress={() => router.push('/settings')} />
          <View style={styles.divider} />
          <SettingsRow icon="key-outline" label="Change Password" onPress={() => router.push('/settings')} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#dc2626" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Royalty World Asset Tracker v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f4f4' },

  // App bar
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
    }),
  },
  logo: { height: 30, width: 130 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f8f4f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  screenTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginTop: 4, letterSpacing: -0.3 },
  screenSubtitle: { fontSize: 13, color: '#64748b', marginTop: 3, marginBottom: 20 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 4,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 4,
    marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  orgRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  orgAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orgAvatarText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  orgInfo: { flex: 1 },
  orgName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  orgPlan: { fontSize: 12, color: '#64748b', marginTop: 1 },
  orgSub: { fontSize: 12, color: BRAND, fontWeight: '600', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginHorizontal: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: BRAND_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 13, color: '#64748b' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#dc2626' },
  version: { fontSize: 12, color: '#94a3b8', textAlign: 'center' },
});
