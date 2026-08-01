import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch, useMutation } from '@/hooks/useFetch';
import type { Asset, PaginatedResponse, DashboardSummary } from '@/types/api';

const ASSET_ICONS: Record<string, string> = {
  forklift: '🚜',
  laser: '⚙️',
  scanner: '📱',
  server: '🖥️',
  conveyor: '🔄',
  default: '📦',
};

function getAssetIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('forklift')) return ASSET_ICONS.forklift;
  if (lower.includes('laser')) return ASSET_ICONS.laser;
  if (lower.includes('scanner')) return ASSET_ICONS.scanner;
  if (lower.includes('server')) return ASSET_ICONS.server;
  if (lower.includes('conveyor')) return ASSET_ICONS.conveyor;
  return ASSET_ICONS.default;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ArchivedAssetsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [restoringId, setRestoringId] = useState<number | null>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, loading, error, refetch } = useFetch<PaginatedResponse<Asset>>({
    endpoint: '/api/assets',
    params: { archived: true, search: debouncedSearch || undefined },
  });

  const { data: summary } = useFetch<DashboardSummary>({
    endpoint: '/api/summary',
  });

  const { execute: restoreAsset } = useMutation('PATCH', (params: { id: number }) => `/api/assets/${params.id}/restore`);

  const assets = data?.data ?? [];

  const handleRestore = async (assetId: number) => {
    setRestoringId(assetId);
    try {
      await restoreAsset({ id: assetId });
      refetch();
    } catch {} finally {
      setRestoringId(null);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Royalty World</Text>
        <View style={styles.topRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.screenTitle}>Archived Assets</Text>
        <Text style={styles.screenSubtitle}>Manage decommissioned inventory and historical logs.</Text>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search archived items..."
            placeholderTextColor={Colors.outlineVariant}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statChip, { backgroundColor: Colors.primary + '1A', borderColor: Colors.primary + '33' }]}>
            <Text style={[styles.statText, { color: Colors.primary }]}>Total: {summary?.total ?? 0}</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: Colors.error + '1A', borderColor: Colors.error + '33' }]}>
            <Text style={[styles.statText, { color: Colors.error }]}>Damaged: {summary?.damaged ?? 0}</Text>
          </View>
          <View style={[styles.statChip, { backgroundColor: Colors.onSurfaceVariant + '1A', borderColor: Colors.onSurfaceVariant + '33' }]}>
            <Text style={[styles.statText, { color: Colors.onSurfaceVariant }]}>Expired: {summary?.expired ?? 0}</Text>
          </View>
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

        {!loading && !error && assets.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.assetCard}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/asset-detail', params: { id: String(item.id) } })}
          >
            <View style={styles.cardTop}>
              <View style={styles.cardLeft}>
                <View style={styles.cardIcon}>
                  <Text style={styles.cardIconText}>{getAssetIcon(item.name)}</Text>
                </View>
                <View>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardSerial}>SN: {item.serial}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.restoreBtn}
                onPress={(e) => {
                  e?.stopPropagation?.();
                  handleRestore(item.id);
                }}
                disabled={restoringId === item.id}
              >
                {restoringId === item.id ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Text style={styles.restoreBtnIcon}>↩</Text>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.cardBottom}>
              <View>
                <Text style={styles.cardLabel}>Archive Date</Text>
                <Text style={styles.cardDate}>{formatDate(item.archived_at)}</Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>Reason</Text>
                <View style={[styles.reasonBadge, item.archived_reason?.toLowerCase().includes('damage') ? styles.reasonError : styles.reasonNeutral]}>
                  <Text style={[styles.reasonText, item.archived_reason?.toLowerCase().includes('damage') ? styles.reasonTextError : styles.reasonTextNeutral]}>
                    {item.archived_reason ?? 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {!loading && !error && assets.length === 0 && (
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>No archived assets</Text>
            <Text style={styles.emptyDesc}>Archived assets will appear here.</Text>
          </View>
        )}
      </ScrollView>
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
  backBtn: { padding: 8 },
  backArrow: { fontSize: 22, color: Colors.primary },
  topTitle: { fontSize: 20, fontWeight: '600', color: Colors.primary },
  topRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 8 },
  notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryContainer },
  content: { padding: 16 },
  screenTitle: { fontSize: 20, fontWeight: '600', color: Colors.onSurface, marginBottom: 4 },
  screenSubtitle: { fontSize: 14, color: Colors.onSurfaceVariant, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16, paddingHorizontal: 16, height: 48, borderWidth: 1, borderColor: Colors.outlineVariant + '4D',
    marginBottom: 12, gap: 8,
  },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, fontSize: 16, color: Colors.onSurface, padding: 0 },
  filterBtn: { padding: 4 },
  filterIcon: { fontSize: 18, color: Colors.onSurfaceVariant },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statChip: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1,
  },
  statText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.05 },
  assetCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 20, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12,
    elevation: 3, borderWidth: 1, borderColor: Colors.outlineVariant + '1A',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  cardIcon: {
    width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  cardIconText: { fontSize: 24 },
  cardName: { fontSize: 18, fontWeight: '600', color: Colors.onSurface },
  cardSerial: { fontSize: 14, color: Colors.onSurfaceVariant, marginTop: 2 },
  restoreBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center', justifyContent: 'center',
  },
  restoreBtnIcon: { fontSize: 18, color: Colors.primary },
  cardBottom: { borderTopWidth: 1, borderTopColor: Colors.surfaceContainer + '80', paddingTop: 12, gap: 8 },
  cardLabel: { fontSize: 10, fontWeight: '700', color: Colors.outline, letterSpacing: 0.05, textTransform: 'uppercase' },
  cardDate: { fontSize: 14, color: Colors.onSurface, marginTop: 2 },
  reasonBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginTop: 4 },
  reasonError: { backgroundColor: Colors.errorContainer },
  reasonNeutral: { backgroundColor: Colors.surfaceContainerHigh },
  reasonText: { fontSize: 12, fontWeight: '600' },
  reasonTextError: { color: Colors.onErrorContainer },
  reasonTextNeutral: { color: Colors.onSurfaceVariant },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.onSurface, marginBottom: 4 },
  emptyDesc: { fontSize: 14, color: Colors.outline },
  filterChip: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow, borderWidth: 1, borderColor: Colors.outlineVariant + '4D',
  },
  filterChipText: { fontSize: 14, fontWeight: '500', color: Colors.onSurfaceVariant },
});
