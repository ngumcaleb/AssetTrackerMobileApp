import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/context/AuthContext';
import { useDrawer } from '@/context/DrawerContext';
import { formatTimeAgo, getInitials } from '@/utils/format';
import type { PaginatedResponse, ActivityLog } from '@/types/api';

const BRAND       = '#800020';
const BRAND_LIGHT = '#fde6e6';

type ActivityType = 'check-in' | 'check-out' | 'maintenance' | 'registration';

interface DisplayActivity {
  id: string;
  type: ActivityType;
  title: string;
  time: string;
  description: string;
  assetTag: string;
  assetId?: number;
}

const apiTypeToLocalType: Record<string, ActivityType> = {
  return: 'check-in',
  checkout: 'check-out',
  asset_created: 'registration',
  asset_archived: 'maintenance',
  asset_restored: 'check-in',
  asset_deleted: 'maintenance',
};

const activityTypeLabels: Record<string, string> = {
  return: 'Return',
  checkout: 'Checkout',
  asset_created: 'Asset Created',
  asset_archived: 'Asset Archived',
  asset_restored: 'Asset Restored',
  asset_deleted: 'Asset Deleted',
};

const filterChips = [
  { label: 'All', value: '' },
  { label: 'Check-Ins', value: 'return' },
  { label: 'Check-Outs', value: 'checkout' },
  { label: 'Archived', value: 'asset_archived' },
];

const typeConfig: Record<ActivityType, { bg: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  'check-in': { bg: '#d1fae5', icon: 'arrow-down-circle-outline', color: '#065f46' },
  'check-out': { bg: '#fff3cd', icon: 'arrow-up-circle-outline', color: '#b45309' },
  maintenance: { bg: '#f1f5f9', icon: 'archive-outline', color: '#475569' },
  registration: { bg: BRAND_LIGHT, icon: 'add-circle-outline', color: BRAND },
};

const softShadow = Platform.select({
  ios:     { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 2 },
  web:     { boxShadow: '0 2px 14px rgba(15, 23, 42, 0.07)' },
});

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(iso: string): number {
  const now = startOfDay(new Date());
  const date = startOfDay(new Date(iso));
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDateGroup(iso: string): string {
  const diffDays = daysAgo(iso);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return 'This Week';
  return 'Older';
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function groupActivities(items: DisplayActivity[]): { title: string; data: DisplayActivity[] }[] {
  const groups: Record<string, DisplayActivity[]> = {};

  for (const item of items) {
    const group = formatDateGroup(item.time);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
  }

  const orderedLabels = ['Today', 'Yesterday', 'This Week', 'Older'];
  return orderedLabels
    .filter((label) => groups[label]?.length)
    .map((label) => ({ title: label, data: groups[label] }));
}

function ActivityCard({ item, onPress }: { item: DisplayActivity; onPress?: () => void }) {
  const config = typeConfig[item.type];
  return (
    <TouchableOpacity
      style={styles.activityCard}
      activeOpacity={0.75}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.activityIconCircle, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.activityTime}>{formatTimeAgo(item.time)}</Text>
        </View>
        <Text style={styles.activityDesc} numberOfLines={2}>{item.description}</Text>
        {item.assetTag !== 'N/A' && (
          <View style={styles.assetTagChip}>
            <Ionicons name="pricetag-outline" size={10} color={BRAND} />
            <Text style={styles.assetTagText}>{item.assetTag}</Text>
          </View>
        )}
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color="#cbd5e1" style={styles.rowChevron} />}
    </TouchableOpacity>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyBox}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="time-outline" size={40} color={BRAND} />
      </View>
      <Text style={styles.emptyTitle}>No Activity Found</Text>
      <Text style={styles.emptySub}>Activity logs will appear here as assets are created or modified.</Text>
    </View>
  );
}

export default function ActivityLogScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { openDrawer } = useDrawer();
  const [activeFilter, setActiveFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 400);

  const { data, loading, error, refetch } = useFetch<PaginatedResponse<ActivityLog>>({
    endpoint: '/api/activity',
    params: {
      type: activeFilter || undefined,
      search: debouncedSearch || undefined,
    },
  });

  const activities: DisplayActivity[] = (data?.data ?? []).map((log) => {
    const localType = apiTypeToLocalType[log.type] ?? 'registration';
    const label = activityTypeLabels[log.type] ?? log.type;
    return {
      id: String(log.id),
      type: localType,
      title: label,
      time: log.created_at,
      description: log.description,
      assetTag: log.asset?.asset_tag ?? 'N/A',
      assetId: log.asset?.id,
    };
  });

  const grouped = groupActivities(activities);

  const todayCount = activities.filter((a) => daysAgo(a.time) === 0).length;
  const weekCount = activities.filter((a) => daysAgo(a.time) <= 7).length;
  const checkoutCount = activities.filter((a) => a.type === 'check-out').length;

  const isFirstLoad = loading && !data;
  const heroStats = [
    { label: 'Today',    value: isFirstLoad ? '—' : todayCount,    icon: 'today-outline'           as const },
    { label: 'This Week', value: isFirstLoad ? '—' : weekCount,    icon: 'calendar-outline'        as const },
    { label: 'Check-Outs', value: isFirstLoad ? '—' : checkoutCount, icon: 'swap-horizontal-outline' as const },
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
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={22} color="#1e293b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatar} onPress={() => router.push('/profile')}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading && !isFirstLoad} onRefresh={refetch} tintColor={BRAND} colors={[BRAND]} />}
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

          <Text style={styles.heroEyebrow}>ACTIVITY FEED</Text>
          <Text style={styles.heroTitle}>Activity Log</Text>
          <Text style={styles.heroSubtitle}>
            Every check-in, checkout and asset change — at a glance.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsRow}
          >
            {heroStats.map((s) => (
              <View key={s.label} style={styles.statChip}>
                <Ionicons name={s.icon} size={15} color="#fff" />
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </ScrollView>
        </LinearGradient>

        {/* ── Search (overlapping the band) ─────────────────── */}
        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Ionicons name="search" size={18} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchTextInput}
              placeholder="Search activity logs..."
              placeholderTextColor="#94a3b8"
              value={searchText}
              onChangeText={setSearchText}
              selectionColor={BRAND}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Filter Chips ──────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          {filterChips.map((chip) => {
            const isActive = activeFilter === chip.value;
            return (
              <TouchableOpacity
                key={chip.value || 'all'}
                style={[styles.chip, isActive && styles.chipActive]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(chip.value)}
              >
                {isActive ? (
                  <LinearGradient
                    colors={['#66001a', '#800020']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.chipGradient}
                  >
                    <Text style={styles.chipTextActive}>{chip.label}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.chipText}>{chip.label}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isFirstLoad ? (
          <View style={styles.centered}>
            <ActivityIndicator size="small" color={BRAND} />
            <Text style={styles.loadingText}>Loading activity logs…</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons name="cloud-offline-outline" size={32} color={BRAND} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : grouped.length > 0 ? (
          <>
            <Text style={styles.listHeader}>
              Recent Activity<Text style={styles.listCount}>  ·  {activities.length}</Text>
            </Text>
            {grouped.map((group) => (
              <View key={group.title}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeader}>{group.title}</Text>
                  <View style={styles.sectionCountBadge}>
                    <Text style={styles.sectionCount}>{group.data.length}</Text>
                  </View>
                </View>
                {group.data.map((item) => (
                  <ActivityCard
                    key={item.id}
                    item={item}
                    onPress={
                      item.assetId
                        ? () => router.push({ pathname: '/asset-detail', params: { id: String(item.assetId) } })
                        : undefined
                    }
                  />
                ))}
              </View>
            ))}
          </>
        ) : (
          <EmptyState />
        )}
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
    paddingBottom: 26,
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
  heroSubtitle: { fontSize: 13.5, color: 'rgba(255,255,255,0.72)', marginBottom: 18 },

  statsRow: { gap: 10, paddingRight: 8 },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 22,
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  statValue: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  statLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },

  // ── Search Row ──────────────────────────────────────────
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: -22,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#efe7e7',
    paddingHorizontal: 14,
    height: 50,
    ...softShadow,
  },
  searchIcon: { marginRight: 8 },
  searchTextInput: { flex: 1, fontSize: 14, color: '#0f172a' },

  // ── Filter Chips ────────────────────────────────────────
  filterChips: { paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  chip: {
    height: 40,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efe7e7',
    overflow: 'hidden',
    paddingHorizontal: 16,
    ...softShadow,
  },
  chipGradient: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { borderColor: 'transparent' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  chipTextActive: { fontSize: 13, fontWeight: '700', color: '#fff' },

  // ── List Header + Section Headers ───────────────────────
  listHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 14,
    letterSpacing: -0.2,
  },
  listCount: { fontSize: 14, fontWeight: '700', color: '#94a3b8' },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sectionCountBadge: {
    backgroundColor: BRAND_LIGHT,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionCount: { fontSize: 11, fontWeight: '800', color: BRAND },

  // ── Cards ───────────────────────────────────────────────
  activityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 20,
    padding: 14,
    ...softShadow,
  },
  activityIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: { flex: 1 },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
    gap: 8,
  },
  activityTitle: { fontSize: 14.5, fontWeight: '700', color: '#0f172a', flexShrink: 1, letterSpacing: -0.2 },
  activityTime: { fontSize: 11, color: '#94a3b8', flexShrink: 0 },
  activityDesc: { fontSize: 12.5, color: '#64748b', marginBottom: 7, lineHeight: 17, flexShrink: 1 },
  assetTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: BRAND_LIGHT,
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  assetTagText: { fontSize: 10.5, fontWeight: '700', color: BRAND, letterSpacing: 0.4 },
  rowChevron: { marginLeft: 6, alignSelf: 'center' },

  // ── States ──────────────────────────────────────────────
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 36 },
  centered: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 16, gap: 6 },
  loadingText: { fontSize: 13, color: '#94a3b8', marginTop: 8 },
  errorText: { fontSize: 14, color: '#dc2626', textAlign: 'center', marginBottom: 8 },
  retryBtn: {
    backgroundColor: BRAND,
    paddingVertical: 9,
    paddingHorizontal: 22,
    borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: BRAND, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
      android: { elevation: 3 },
      web: { boxShadow: '0 4px 12px rgba(128, 0, 32, 0.3)' },
    }),
  },
  retryText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  emptyBox: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32, gap: 4 },
  emptyIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: BRAND_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#334155' },
  emptySub: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },
});
