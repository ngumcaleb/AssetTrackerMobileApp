import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FilterType = 'All' | 'Unread' | 'Check-Ins' | 'Check-Outs' | 'Maintenance' | 'System';

interface Notification {
  id: string;
  type: 'checkin' | 'maintenance' | 'registration' | 'alert' | 'system';
  title: string;
  description: string;
  timestamp: string;
  unread: boolean;
  urgent: boolean;
}

interface NotificationGroup {
  label: string;
  data: Notification[];
}

const FILTERS: FilterType[] = ['All', 'Unread', 'Check-Ins', 'Check-Outs', 'Maintenance', 'System'];

const NOTIFICATION_GROUPS: NotificationGroup[] = [
  {
    label: 'Today',
    data: [
      {
        id: '1',
        type: 'checkin',
        title: 'Asset Checked In',
        description: 'Industrial Forklift XL-20 was returned by Sarah Jenkins',
        timestamp: '10:45 AM',
        unread: true,
        urgent: false,
      },
      {
        id: '2',
        type: 'maintenance',
        title: 'Maintenance Due',
        description: 'HVAC Unit B-Tier scheduled for quarterly maintenance',
        timestamp: '08:20 AM',
        unread: true,
        urgent: false,
      },
      {
        id: '3',
        type: 'registration',
        title: 'New Asset Registered',
        description: 'Pallet Jack P-5 added to inventory by System Admin',
        timestamp: '07:30 AM',
        unread: false,
        urgent: false,
      },
    ],
  },
  {
    label: 'Yesterday',
    data: [
      {
        id: '4',
        type: 'alert',
        title: 'Check-Out Overdue',
        description: 'Precision Laser Cutter return is 2 days overdue',
        timestamp: 'Yesterday',
        unread: true,
        urgent: true,
      },
      {
        id: '5',
        type: 'system',
        title: 'System Update',
        description: 'ScanTrack v2.4.0 is available with new features',
        timestamp: 'Yesterday',
        unread: false,
        urgent: false,
      },
    ],
  },
  {
    label: 'This Week',
    data: [
      {
        id: '6',
        type: 'system',
        title: 'Bulk Import Complete',
        description: '45 assets imported successfully from CSV',
        timestamp: 'Mon',
        unread: false,
        urgent: false,
      },
      {
        id: '7',
        type: 'system',
        title: 'Security Alert',
        description: 'New login detected from Chrome on Windows',
        timestamp: 'Mon',
        unread: false,
        urgent: false,
      },
    ],
  },
];

const TYPE_CONFIG: Record<Notification['type'], { bg: string; icon: string }> = {
  checkin: { bg: Colors.secondaryContainer, icon: 'â†“' },
  maintenance: { bg: Colors.tertiaryContainer, icon: 'âš™' },
  registration: { bg: Colors.tertiaryContainer, icon: '+' },
  alert: { bg: Colors.errorContainer, icon: '!' },
  system: { bg: Colors.surfaceContainerHighest, icon: 'â—†' },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const matchFilter = (n: Notification, filter: FilterType): boolean => {
    if (filter === 'All') return true;
    if (filter === 'Unread') return n.unread;
    if (filter === 'Check-Ins') return n.type === 'checkin' || n.type === 'registration';
    if (filter === 'Check-Outs') return n.title.toLowerCase().includes('checkout') || n.title.toLowerCase().includes('overdue');
    if (filter === 'Maintenance') return n.type === 'maintenance';
    if (filter === 'System') return n.type === 'system';
    return true;
  };

  const filteredGroups = NOTIFICATION_GROUPS.map((group) => ({
    ...group,
    data: group.data.filter((n) => matchFilter(n, activeFilter)),
  })).filter((group) => group.data.length > 0);

  const renderNotification = (item: Notification) => {
    const config = TYPE_CONFIG[item.type];

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.notifCard,
          item.urgent && styles.notifCardUrgent,
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.notifLeft}>
          <View style={[styles.notifIcon, { backgroundColor: config.bg }]}>
            <Text style={styles.notifIconText}>{config.icon}</Text>
          </View>
        </View>

        <View style={styles.notifBody}>
          <View style={styles.notifTitleRow}>
            <Text style={[styles.notifTitle, item.unread && styles.notifTitleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            {item.unread && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notifDesc} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.notifTimestamp}>{item.timestamp}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>â†</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Notifications</Text>
        <TouchableOpacity style={styles.markAllBtn}>
          <Text style={styles.markAllText}>Mark all read</Text>
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
            <Text style={styles.emptyIcon}>ðŸ””</Text>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyDesc}>Nothing matches this filter right now.</Text>
          </View>
        )}

        <View style={styles.caughtUp}>
          <View style={styles.caughtUpDot} />
          <Text style={styles.caughtUpText}>You're all caught up!</Text>
        </View>
      </ScrollView>
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
});
