import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/context/AuthContext';
import { useDrawer } from '@/context/DrawerContext';
import { formatTimeAgo, getInitials } from '@/utils/format';
import type { PaginatedResponse, ActivityLog } from '@/types/api';

const BRAND = '#800020';
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

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateGroup(iso: string): string {
  const now = startOfDay(new Date());
  const date = startOfDay(new Date(iso));
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

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
      activeOpacity={0.7}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.activityIconCircle, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <Text style={styles.activityTime}>{formatTimeAgo(item.time)}</Text>
        </View>
        <Text style={styles.activityDesc}>{item.description}</Text>
        {item.assetTag !== 'N/A' && (
          <View style={styles.assetTagChip}>
            <Text style={styles.assetTagText}>{item.assetTag}</Text>
          </View>
        )}
      </View>
      {onPress && <Ionicons name="chevron-forward" size={16} color="#cbd5e1" style={{ alignSelf: 'center' }} />}
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={44} color="#cbd5e1" />
      <Text style={styles.emptyTitle}>No Activity Found</Text>
      <Text style={styles.emptyText}>Activity logs will appear here as assets are created or modified.</Text>
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

  const { data, loading, error } = useFetch<PaginatedResponse<ActivityLog>>({
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
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={22} color="#1e293b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarCircle} onPress={() => router.push('/profile')}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Activity Log</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94a3b8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search activity logs..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {filterChips.map((chip) => {
            const isActive = activeFilter === chip.value;
            return (
              <TouchableOpacity
                key={chip.value || 'all'}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveFilter(chip.value)}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={BRAND} />
            <Text style={{ marginTop: 8, fontSize: 13, color: '#94a3b8' }}>Loading activity logs…</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={32} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : grouped.length > 0 ? (
          grouped.map((group) => (
            <View key={group.title}>
              <SectionHeader title={group.title} />
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
          ))
        ) : (
          <EmptyState />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f4f4' },

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
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  screenTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginTop: 4, marginBottom: 14, letterSpacing: -0.3 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  searchInput: { flex: 1, fontSize: 14, color: '#0f172a' },

  chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActive: { backgroundColor: BRAND, borderColor: BRAND },
  chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#fff' },

  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 8,
  },

  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    alignItems: 'flex-start',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  activityIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
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
  },
  activityTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  activityTime: { fontSize: 11, color: '#94a3b8' },
  activityDesc: { fontSize: 12, color: '#475569', marginBottom: 6, lineHeight: 17 },
  assetTagChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  assetTagText: { fontSize: 10, fontWeight: '700', color: '#475569', letterSpacing: 0.5 },

  loadingContainer: { alignItems: 'center', paddingVertical: 48 },
  errorContainer: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 16, gap: 8 },
  errorText: { fontSize: 14, color: '#dc2626', textAlign: 'center' },

  emptyContainer: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#334155' },
  emptyText: { fontSize: 13, color: '#94a3b8', textAlign: 'center', maxWidth: 240 },
});
