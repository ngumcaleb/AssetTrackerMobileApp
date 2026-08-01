import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch, useMutation } from '@/hooks/useFetch';
import type { Asset, PaginatedResponse, DashboardSummary } from '@/types/api';

const BRAND       = '#800020';
const BRAND_DARK  = '#4a0012';
const BRAND_LIGHT = '#fde6e6';

const softShadow = Platform.select({
  ios:     { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 2 },
  web:     { boxShadow: '0 2px 14px rgba(15, 23, 42, 0.07)' },
});

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

  const isFirstLoad = loading && !data;
  const heroStats = [
    { label: 'Total',   value: isFirstLoad ? '—' : (summary?.total ?? 0),    icon: 'cube-outline'       as const },
    { label: 'Damaged', value: isFirstLoad ? '—' : (summary?.damaged ?? 0),  icon: 'warning-outline'     as const },
    { label: 'Expired', value: isFirstLoad ? '—' : (summary?.expired ?? 0),  icon: 'time-outline'        as const },
  ];

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
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* ── App Bar ────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Archived Assets</Text>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={20} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading && !isFirstLoad} onRefresh={refetch} tintColor={BRAND} colors={[BRAND]} />
        }
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

          <Text style={styles.heroEyebrow}>INVENTORY</Text>
          <Text style={styles.heroTitle}>Archived Assets</Text>
          <Text style={styles.heroSubtitle}>
            Manage decommissioned inventory and historical logs.
          </Text>

          <View style={styles.statsRow}>
            {heroStats.map((s) => (
              <View key={s.label} style={styles.statChip}>
                <Ionicons name={s.icon} size={15} color="#fff" />
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ── Search (overlapping the band) ─────────────────── */}
        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Ionicons name="search" size={18} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchTextInput}
              placeholder="Search archived items..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
              selectionColor={BRAND}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.listHeader}>
          Archived<Text style={styles.listCount}>  ·  {assets.length}</Text>
        </Text>

        {isFirstLoad ? (
          <View style={styles.centered}>
            <ActivityIndicator size="small" color={BRAND} />
            <Text style={styles.loadingText}>Loading archived assets…</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons name="cloud-offline-outline" size={32} color={BRAND} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : assets.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="archive-outline" size={40} color={BRAND} />
            </View>
            <Text style={styles.emptyTitle}>No Archived Assets</Text>
            <Text style={styles.emptySub}>
              {search.trim() ? `Nothing matched "${search}".` : 'Archived assets will appear here.'}
            </Text>
          </View>
        ) : (
          assets.map((item) => {
            const isDamaged = item.archived_reason?.toLowerCase().includes('damage');
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.assetCard}
                activeOpacity={0.75}
                onPress={() => router.push({ pathname: '/asset-detail', params: { id: String(item.id) } })}
              >
                <View style={styles.cardTop}>
                  <LinearGradient
                    colors={['#fde6e6', '#fbd0d0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardIcon}
                  >
                    <Text style={styles.cardIconText}>{getAssetIcon(item.name)}</Text>
                  </LinearGradient>
                  <View style={styles.cardIdentity}>
                    <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.cardSerial}>{item.asset_tag}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.restoreBtn}
                    onPress={(e) => {
                      e?.stopPropagation?.();
                      handleRestore(item.id);
                    }}
                    disabled={restoringId === item.id}
                    activeOpacity={0.85}
                  >
                    {restoringId === item.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <LinearGradient
                        colors={['#66001a', '#800020', '#8a0d28']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.restoreBtnInner}
                      >
                        <Ionicons name="refresh" size={17} color="#fff" />
                      </LinearGradient>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.cardBottom}>
                  <View>
                    <Text style={styles.cardLabel}>Archive Date</Text>
                    <Text style={styles.cardDate}>{formatDate(item.archived_at)}</Text>
                  </View>
                  <View style={styles.reasonCol}>
                    <Text style={styles.cardLabel}>Reason</Text>
                    <View style={[styles.reasonBadge, { backgroundColor: isDamaged ? '#ffe4e6' : '#f1f5f9' }]}>
                      <Ionicons name="alert-circle-outline" size={11} color={isDamaged ? '#dc2626' : '#64748b'} />
                      <Text style={[styles.reasonText, { color: isDamaged ? '#dc2626' : '#64748b' }]}>
                        {item.archived_reason ?? 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
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

  statsRow: { flexDirection: 'row', gap: 10 },
  statChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 22,
    paddingVertical: 9,
    paddingHorizontal: 10,
  },
  statValue: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  statLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },

  // ── Search ──────────────────────────────────────────────
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

  // ── List ────────────────────────────────────────────────
  listHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 12,
    letterSpacing: -0.2,
  },
  listCount: { fontSize: 14, fontWeight: '700', color: '#94a3b8' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 36 },

  assetCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    ...softShadow,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIconText: { fontSize: 23 },
  cardIdentity: { flex: 1 },
  cardName: { fontSize: 15.5, fontWeight: '700', color: '#0f172a', letterSpacing: -0.2 },
  cardSerial: { fontSize: 12, color: '#94a3b8', marginTop: 2, fontVariant: ['tabular-nums'] },
  restoreBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: BRAND_DARK, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
      android: { elevation: 4 },
      web: { boxShadow: '0 4px 12px rgba(74, 0, 18, 0.3)' },
    }),
  },
  restoreBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    gap: 12,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardDate: { fontSize: 13, fontWeight: '600', color: '#334155' },
  reasonCol: { alignItems: 'flex-end', flexShrink: 1 },
  reasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reasonText: { fontSize: 11, fontWeight: '700' },

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
});
