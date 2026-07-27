import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/context/AuthContext';
import { PaginatedResponse, ActivityLog } from '@/types/api';

type ActivityType = 'check-in' | 'check-out' | 'maintenance' | 'registration';

interface DisplayActivity {
  id: string;
  type: ActivityType;
  title: string;
  time: string;
  description: string;
  assetTag: string;
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
  { label: 'Maintenance', value: 'asset_archived' },
];

const typeConfig: Record<ActivityType, { bg: string; icon: string }> = {
  'check-in': { bg: Colors.secondaryContainer, icon: 'â†™' },
  'check-out': { bg: Colors.errorContainer, icon: 'â†—' },
  maintenance: { bg: Colors.tertiaryContainer, icon: 'ðŸ"§' },
  registration: { bg: Colors.surfaceContainerHighest, icon: '+' },
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

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function groupActivities(items: DisplayActivity[]): { title: string; data: DisplayActivity[] }[] {
  const groups: Record<string, DisplayActivity[]> = {};
  const groupOrder: string[] = [];

  for (const item of items) {
    const group = formatDateGroup(item.time);
    if (!groups[group]) {
      groups[group] = [];
      groupOrder.push(group);
    }
    groups[group].push(item);
  }

  const orderedLabels = ['Today', 'Yesterday', 'This Week', 'Older'];
  return orderedLabels
    .filter((label) => groups[label]?.length)
    .map((label) => ({ title: label, data: groups[label] }));
}

function ActivityCard({ item }: { item: DisplayActivity }) {
  const config = typeConfig[item.type];
  return (
    <View style={styles.activityCard}>
      <View style={[styles.activityIconCircle, { backgroundColor: config.bg }]}>
        <Text style={styles.activityIcon}>{config.icon}</Text>
      </View>
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <Text style={styles.activityTime}>{item.time}</Text>
        </View>
        <Text style={styles.activityDesc}>{item.description}</Text>
        <View style={styles.assetTagChip}>
          <Text style={styles.assetTagText}>{item.assetTag}</Text>
        </View>
      </View>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>ðŸ“‹</Text>
      <Text style={styles.emptyText}>No activity found</Text>
    </View>
  );
}

export default function ActivityLogScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
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
    };
  });

  const grouped = groupActivities(activities);

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.menuIcon}>â˜°</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ScanTrack</Text>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.bellIcon}>ðŸ""</Text>
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Activity Log</Text>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>ðŸ"</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search activities..."
            placeholderTextColor={Colors.outline}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {filterChips.map((chip) => (
            <TouchableOpacity
              key={chip.value || 'all'}
              style={[
                styles.chip,
                activeFilter === chip.value && styles.chipActive,
              ]}
              onPress={() => setActiveFilter(chip.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  activeFilter === chip.value && styles.chipTextActive,
                ]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : grouped.length > 0 ? (
          grouped.map((group) => (
            <View key={group.title}>
              <SectionHeader title={group.title} />
              {group.data.map((item) => (
                <ActivityCard key={item.id} item={item} />
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
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 22,
    color: Colors.onSurface,
  },
  bellIcon: {
    fontSize: 20,
    color: Colors.onSurface,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 8,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.onSurface,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  chipActive: {
    backgroundColor: Colors.primaryContainer,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: Colors.onPrimaryContainer,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 10,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  activityIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityIcon: {
    fontSize: 16,
    color: Colors.onSurface,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  activityTime: {
    fontSize: 11,
    color: Colors.outline,
  },
  activityDesc: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginBottom: 6,
  },
  assetTagChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  assetTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
});
