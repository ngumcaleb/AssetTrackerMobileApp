import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch, useMutation } from '@/hooks/useFetch';
import type { Notification, PaginatedResponse } from '@/types/api';

type FilterType = 'All' | 'Unread' | 'Check-Ins' | 'Check-Outs' | 'Maintenance' | 'System';

interface NotificationGroup {
  label: string;
  data: Notification[];
}

const FILTERS: FilterType[] = ['All', 'Unread', 'Check-Ins', 'Check-Outs', 'Maintenance', 'System'];

const TYPE_CONFIG: Record<string, { bg: string; icon: string }> = {
  checkout: { bg: Colors.secondaryContainer, icon: '↓' },
  checkin: { bg: Colors.secondaryContainer, icon: '↓' },
  return: { bg: Colors.secondaryContainer, icon: '↓' },
  maintenance: { bg: Colors.tertiaryContainer, icon: '⚙' },
  registration: { bg: Colors.tertiaryContainer, icon: '+' },
  asset_created: { bg: Colors.tertiaryContainer, icon: '+' },
  alert: { bg: Colors.errorContainer, icon: '!' },
  overdue: { bg: Colors.errorContainer, icon: '!' },
  system: { bg: Colors.surfaceContainerHighest, icon: '★' },
};

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

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
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
    if (notification.is_read) return;
    try {
      await markRead({ id: notification.id });
      setLocalNotifications((prev) => {
        const current = prev ?? data?.data ?? [];
        return current.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n));
      });
    } catch {}
  };

  const renderNotification = (item: Notification) => {
    const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.system;

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.notifCard,
        ]}
        activeOpacity={0.7}
        onPress={() => handleMarkRead(item)}
      >
        <View style={styles.notifLeft}>
          <View style={[styles.notifIcon, { backgroundColor: config.bg }]}>
            <Text style={styles.notifIconText}>{config.icon}</Text>
          </View>
        </View>

        <View style={styles.notifBody}>
          <View style={styles.notifTitleRow}>
            <Text style={[styles.notifTitle, !item.is_read && styles.notifTitleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.is_read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notifDesc} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.notifTimestamp}>{formatTime(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>
          Notifications{unreadCount ? ` (${unreadCount})` : ''}
        </Text>
        <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead} disabled={markingAll}>
          <Text style={styles.markAllText}>{markingAll ? '...' : 'Mark all read'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === filter && styles.filterChipTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {error && !loading && (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptyDesc}>{error}</Text>
          <TouchableOpacity onPress={refetch} style={[styles.filterChip, { marginTop: 12 }]}>
            <Text style={styles.filterChipText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredGroups.map((group) => (
            <View key={group.label} style={styles.section}>
              <Text style={styles.sectionHeader}>{group.label}</Text>
              {group.data.map(renderNotification)}
            </View>
          ))}

          {filteredGroups.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyDesc}>Nothing matches this filter right now.</Text>
            </View>
          )}

          <View style={styles.caughtUp}>
            <View style={styles.caughtUpDot} />
            <Text style={styles.caughtUpText}>You're all caught up!</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.outlineVariant,
  },
  backBtn: {
    padding: 8,
  },
  backArrow: {
    fontSize: 22,
    color: Colors.primary,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
  },
  markAllBtn: {
    padding: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primaryContainer,
  },
  filtersWrapper: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.outlineVariant + '4D',
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '4D',
  },
  filterChipActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primaryContainer,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  filterChipTextActive: {
    color: Colors.onPrimaryContainer,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.outline,
    letterSpacing: 0.05,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '1A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  notifCardUrgent: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
  },
  notifLeft: {
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIconText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  notifBody: {
    flex: 1,
    gap: 4,
  },
  notifTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.onSurface,
    flexShrink: 1,
  },
  notifTitleUnread: {
    fontWeight: '700',
    color: Colors.onSurface,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    flexShrink: 0,
  },
  notifDesc: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },
  notifTimestamp: {
    fontSize: 12,
    color: Colors.outline,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.outline,
  },
  caughtUp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  caughtUpDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondaryContainer,
  },
  caughtUpText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.outline,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
