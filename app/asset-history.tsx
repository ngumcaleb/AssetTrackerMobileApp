import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch } from '@/hooks/useFetch';
import type { ActivityLog, Asset, PaginatedResponse } from '@/types/api';

const ACTIVITY_COLORS: Record<string, string> = {
  checkout: Colors.tertiary,
  check_out: Colors.tertiary,
  checkin: Colors.secondary,
  check_in: Colors.secondary,
  return: Colors.secondary,
  location: Colors.primary,
  asset_created: Colors.outline,
  registration: Colors.outline,
  maintenance: '#F97316',
};

const ACTIVITY_TITLES: Record<string, string> = {
  checkout: 'Check-Out',
  check_out: 'Check-Out',
  checkin: 'Check-In',
  check_in: 'Check-In',
  return: 'Return',
  location: 'Location Change',
  asset_created: 'Registration',
  registration: 'Registration',
  maintenance: 'Maintenance Log',
};

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} MIN AGO`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} HOURS AGO`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() + ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function formatAssetDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AssetHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: asset, loading: assetLoading, error: assetError } = useFetch<Asset>({
    endpoint: `/api/assets/${id}`,
    enabled: !!id,
  });

  const { data: activitiesData, loading: activitiesLoading, error: activitiesError } = useFetch<PaginatedResponse<ActivityLog>>({
    endpoint: '/api/activity',
    params: { asset_id: id },
    enabled: !!id,
  });

  const activities = activitiesData?.data ?? [];

  const statusColor = asset?.status === 'active' ? '#1E8E3E' : asset?.status === 'checked_out' ? '#F9A825' : Colors.onSurfaceVariant;
  const statusBg = asset?.status === 'active' ? '#E6F4EA' : asset?.status === 'checked_out' ? '#FFF3E0' : Colors.surfaceContainerHigh;
  const statusLabel = asset?.status === 'active' ? 'Active' : asset?.status === 'checked_out' ? 'Checked Out' : 'Archived';

  const loading = assetLoading || activitiesLoading;
  const error = assetError || activitiesError;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>ScanTrack</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <View style={styles.notifDot} />
        </TouchableOpacity>
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
        </View>
      )}

      {!loading && !error && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.assetOverview}>
            <View style={styles.overviewIcon}>
              <Text style={styles.overviewIconText}>🏭</Text>
            </View>
            <View style={styles.overviewInfo}>
              <Text style={styles.overviewId}>Asset ID: #{asset?.asset_tag ?? id}</Text>
              <Text style={styles.overviewName}>{asset?.name ?? 'Unknown Asset'}</Text>
              <View style={[styles.badge, { backgroundColor: statusBg }]}>
                <Text style={[styles.badgeText, { color: statusColor }]}>{statusLabel}</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Asset Lifecycle</Text>
            <TouchableOpacity style={styles.filterBtn}>
              <Text style={styles.filterText}>Filter</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeline}>
            {activities.map((item, index) => {
              const color = ACTIVITY_COLORS[item.type] ?? Colors.primary;
              const title = ACTIVITY_TITLES[item.type] ?? item.type;

              return (
                <View key={item.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineDot, { backgroundColor: color }]}>
                      <View style={styles.timelineDotInner} />
                    </View>
                    {index < activities.length - 1 && <View style={styles.timelineLine} />}
                  </View>
                  <View style={styles.timelineContent}>
                    <View style={styles.timelineHeader}>
                      <Text style={styles.timelineTitle}>{title}</Text>
                      <Text style={styles.timelineTime}>{formatRelativeTime(item.created_at)}</Text>
                    </View>
                    <View style={styles.timelineCard}>
                      <Text style={styles.timelineDesc}>{item.description}</Text>
                      {item.user && (
                        <View style={styles.userRow}>
                          <View style={styles.userAvatar}>
                            <Text style={styles.userAvatarText}>{item.user.name?.[0] ?? 'U'}</Text>
                          </View>
                          <Text style={styles.userName}>Updated by {item.user.name}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}

            {activities.length === 0 && (
              <View style={styles.centered}>
                <Text style={styles.emptyTitle}>No activity yet</Text>
                <Text style={styles.emptyDesc}>Activity for this asset will appear here.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.surface,
    borderBottomWidth: 0.5, borderBottomColor: Colors.outlineVariant,
  },
  backBtn: { padding: 8 }, backArrow: { fontSize: 22, color: Colors.primary },
  topTitle: { fontSize: 20, fontWeight: '600', color: Colors.primary },
  iconBtn: { padding: 8 }, notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryContainer },
  content: { padding: 16 },
  assetOverview: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20, padding: 16, gap: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12,
    elevation: 3, borderWidth: 1, borderColor: Colors.outlineVariant + '4D',
  },
  overviewIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: Colors.primary + '1A', alignItems: 'center', justifyContent: 'center' },
  overviewIconText: { fontSize: 28 },
  overviewInfo: { flex: 1 },
  overviewId: { fontSize: 12, fontWeight: '600', color: Colors.primary, letterSpacing: 0.05, textTransform: 'uppercase' },
  overviewName: { fontSize: 20, fontWeight: '600', color: Colors.onSurface, marginTop: 4 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginTop: 8 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.onSurface },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  filterText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: 'row', marginBottom: 0 },
  timelineLeft: { width: 24, alignItems: 'center' },
  timelineDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  timelineDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.outlineVariant + '4D', marginTop: 4 },
  timelineContent: { flex: 1, paddingBottom: 24 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  timelineTitle: { fontSize: 16, fontWeight: '600', color: Colors.onSurface },
  timelineTime: { fontSize: 11, color: Colors.outline, letterSpacing: 0.05 },
  timelineCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: Colors.outlineVariant + '33',
  },
  timelineDesc: { fontSize: 14, color: Colors.onSurfaceVariant, lineHeight: 20 },
  userRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  userAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontSize: 10, fontWeight: '600', color: Colors.onSurfaceVariant },
  userName: { fontSize: 12, color: Colors.onSurface },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.onSurface, marginBottom: 4 },
  emptyDesc: { fontSize: 14, color: Colors.outline },
});
