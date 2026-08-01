import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch, useMutation } from '@/hooks/useFetch';
import { formatTimeAgo } from '@/utils/format';
import type { Notification, PaginatedResponse } from '@/types/api';

const BRAND       = '#800020';
const BRAND_LIGHT = '#fde6e6';

type FilterType = 'All' | 'Unread' | 'Check-Ins' | 'Check-Outs' | 'Maintenance' | 'System';

interface NotificationGroup {
  label: string;
  data: Notification[];
}

const FILTERS: FilterType[] = ['All', 'Unread', 'Check-Ins', 'Check-Outs', 'Maintenance', 'System'];

const TYPE_CONFIG: Record<string, { bg: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  checkout: { bg: '#fef3c7', icon: 'arrow-up-circle-outline', color: '#b45309' },
  checkin: { bg: '#d1fae5', icon: 'arrow-down-circle-outline', color: '#065f46' },
  return: { bg: '#d1fae5', icon: 'arrow-down-circle-outline', color: '#065f46' },
  maintenance: { bg: '#e0e7ff', icon: 'construct-outline', color: '#4338ca' },
  registration: { bg: BRAND_LIGHT, icon: 'add-circle-outline', color: BRAND },
  asset_created: { bg: BRAND_LIGHT, icon: 'add-circle-outline', color: BRAND },
  alert: { bg: '#ffe4e6', icon: 'alert-circle-outline', color: '#dc2626' },
  overdue: { bg: '#ffe4e6', icon: 'alert-circle-outline', color: '#dc2626' },
  system: { bg: '#f1f5f9', icon: 'notifications-outline', color: '#475569' },
};

const softShadow = Platform.select({
  ios:     { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 2 },
  web:     { boxShadow: '0 2px 14px rgba(15, 23, 42, 0.07)' },
});

function groupNotifications(notifications: Notification[]): NotificationGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Older: [],
  };

  for (const n of notifications) {
    const d = new Date(n.created_at);
    if (d >= today) {
      groups.Today.push(n);
    } else if (d >= yesterday) {
      groups.Yesterday.push(n);
    } else if (d >= weekAgo) {
      groups['This Week'].push(n);
    } else {
      groups.Older.push(n);
    }
  }

  return Object.entries(groups)
    .filter(([, data]) => data.length > 0)
    .map(([label, data]) => ({ label, data }));
}

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [localNotifications, setLocalNotifications] = useState<Notification[] | null>(null);

  const { data, loading, error, refetch } = useFetch<{ data: Notification[]; meta: any; unread_count: number }>({
    endpoint: '/api/notifications',
  });

  const { execute: markAllRead, loading: markingAll } = useMutation('PUT', '/api/notifications/read-all');
  const { execute: markRead } = useMutation('PUT', (params: { id: number }) => `/api/notifications/${params.id}/read`);

  const notifications = localNotifications ?? data?.data ?? [];
  const unreadCount = data?.unread_count ?? notifications.filter((n) => !n.is_read).length;

  const groups = useMemo(() => groupNotifications(notifications), [notifications]);

  const matchFilter = useCallback((n: Notification, filter: FilterType): boolean => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return !n.is_read;
    if (filter === 'Check-Ins') return n.type === 'checkin' || n.type === 'registration' || n.type === 'asset_created';
    if (filter === 'Check-Outs') return n.type === 'checkout' || n.type === 'overdue';
    if (filter === 'Maintenance') return n.type === 'maintenance';
    if (filter === 'System') return n.type === 'system';
    return true;
  }, []);

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      data: group.data.filter((n) => matchFilter(n, activeFilter)),
    }))
    .filter((group) => group.data.length > 0);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead({});
      setLocalNotifications((prev) => {
        const current = prev ?? data?.data ?? [];
        return current.map((n) => ({ ...n, is_read: true }));
      });
    } catch {}
  };

  const handleMarkRead = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await markRead({ id: notification.id });
        setLocalNotifications((prev) => {
          const current = prev ?? data?.data ?? [];
          return current.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n));
        });
      } catch {}
    }
    const assetId = notification.metadata?.asset_id;
    if (assetId) {
      router.push({ pathname: '/asset-detail', params: { id: String(assetId) } });
    }
  };

  const renderNotification = (item: Notification) => {
    const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.system;
    const unread = !item.is_read;
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.notifCard, unread && styles.notifCardUnread]}
        activeOpacity={0.75}
        onPress={() => handleMarkRead(item)}
      >
        {unread && <View style={styles.unreadBar} />}
        <View style={[styles.notifIcon, { backgroundColor: config.bg }]}>
          <Ionicons name={config.icon} size={20} color={config.color} />
        </View>
        <View style={styles.notifBody}>
          <View style={styles.notifTitleRow}>
            <Text style={[styles.notifTitle, unread && styles.notifTitleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            {unread && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notifDesc} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.notifTimestamp}>{formatTimeAgo(item.created_at)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#cbd5e1" style={styles.rowChevron} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* ── App Bar ────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Notifications</Text>
        <TouchableOpacity
          style={styles.markAllBtn}
          onPress={handleMarkAllRead}
          disabled={markingAll || unreadCount === 0}
          activeOpacity={0.7}
        >
          <Text style={[styles.markAllText, (markingAll || unreadCount === 0) && styles.markAllDisabled]}>
            {markingAll ? 'Working…' : 'Mark all read'}
          </Text>
        </TouchableOpacity>
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

          <Text style={styles.heroEyebrow}>INBOX</Text>
          <Text style={styles.heroTitle}>Notifications</Text>
          <Text style={styles.heroSubtitle}>
            Stay on top of check-outs, returns and alerts.
          </Text>

          <View style={styles.heroChipRow}>
            <View style={styles.heroChip}>
              <View style={styles.heroChipDot} />
              <Text style={styles.heroChipValue}>{loading && !data ? '—' : unreadCount}</Text>
              <Text style={styles.heroChipLabel}>unread</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Filter Chips ──────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.chip, isActive && styles.chipActive]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(filter)}
              >
                {isActive ? (
                  <LinearGradient
                    colors={['#66001a', '#800020']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.chipGradient}
                  >
                    <Text style={styles.chipTextActive}>{filter}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={styles.chipText}>{filter}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading && !data ? (
          <View style={styles.centered}>
            <ActivityIndicator size="small" color={BRAND} />
            <Text style={styles.loadingText}>Loading notifications…</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons name="cloud-offline-outline" size={32} color={BRAND} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {filteredGroups.length === 0 ? (
              <View style={styles.emptyBox}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="notifications-off-outline" size={40} color={BRAND} />
                </View>
                <Text style={styles.emptyTitle}>No Notifications</Text>
                <Text style={styles.emptySub}>Nothing matches this filter right now.</Text>
              </View>
            ) : (
              <>
                {filteredGroups.map((group) => (
                  <View key={group.label}>
                    <View style={styles.sectionHeaderRow}>
                      <Text style={styles.sectionHeader}>{group.label}</Text>
                      <View style={styles.sectionCountBadge}>
                        <Text style={styles.sectionCount}>{group.data.length}</Text>
                      </View>
                    </View>
                    {group.data.map(renderNotification)}
                  </View>
                ))}

                <View style={styles.caughtUp}>
                  <View style={styles.caughtUpDot} />
                  <Text style={styles.caughtUpText}>You are all caught up!</Text>
                </View>
              </>
            )}
          </>
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
  topTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', letterSpacing: -0.2 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f8f4f4', alignItems: 'center', justifyContent: 'center' },
  markAllBtn: { padding: 6 },
  markAllText: { fontSize: 13, fontWeight: '700', color: BRAND },
  markAllDisabled: { color: '#cbd5e1' },

  // ── Hero Band ───────────────────────────────────────────
  hero: {
    paddingTop: 20,
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
  heroChipRow: { flexDirection: 'row' },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 22,
    paddingVertical: 9,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  heroChipDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fbd0d0' },
  heroChipValue: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  heroChipLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },

  // ── Filter Chips ────────────────────────────────────────
  filterChips: { paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  chip: {
    height: 40,
    minWidth: 92,
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

  // ── List ────────────────────────────────────────────────
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 22,
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

  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 20,
    padding: 14,
    ...softShadow,
  },
  notifCardUnread: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fde6e6',
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 14,
    bottom: 14,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: BRAND,
  },
  notifIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifBody: { flex: 1 },
  notifTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: '#334155', flexShrink: 1 },
  notifTitleUnread: { fontWeight: '800', color: '#0f172a' },
  unreadDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: BRAND, flexShrink: 0 },
  notifDesc: { fontSize: 12.5, color: '#64748b', lineHeight: 18, marginTop: 3 },
  notifTimestamp: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  rowChevron: { marginLeft: 8 },

  // ── States ──────────────────────────────────────────────
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

  caughtUp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 26,
    gap: 8,
  },
  caughtUpDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
  caughtUpText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
});
