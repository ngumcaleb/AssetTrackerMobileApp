import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
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
import { getInitials, statusMeta } from '@/utils/format';
import { mediaSource } from '@/utils/media';
import type { Asset, DashboardSummary, PaginatedResponse } from '@/types/api';

const BRAND       = '#800020';
const BRAND_DARK  = '#4a0012';
const BRAND_LIGHT = '#fde6e6';

type StatusFilter = 'all' | 'active' | 'checked_out';

const softShadow = Platform.select({
  ios:     { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 2 },
  web:     { boxShadow: '0 2px 14px rgba(15, 23, 42, 0.07)' },
});

export default function AssetsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { openDrawer } = useDrawer();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: summaryData } = useFetch<DashboardSummary>({
    endpoint: '/api/summary',
  });

  const { data: assetsData, loading, error, refetch } = useFetch<PaginatedResponse<Asset>>({
    endpoint: '/api/assets',
    params: {
      search: debouncedSearch || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      per_page: 50,
    },
  });

  const assets = assetsData?.data ?? [];

  const stats = [
    { label: 'Total',    value: summaryData?.total       ?? '—', icon: 'cube-outline'           as const },
    { label: 'Active',   value: summaryData?.active      ?? '—', icon: 'checkmark-circle-outline' as const },
    { label: 'Checked Out', value: summaryData?.checked_out ?? '—', icon: 'swap-horizontal-outline'  as const },
    { label: 'Archived', value: summaryData?.archived    ?? '—', icon: 'archive-outline'          as const },
  ];

  const renderCard = ({ item }: { item: Asset }) => {
    const meta = statusMeta(item.status);
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.75}
        onPress={() => router.push({ pathname: '/asset-detail', params: { id: String(item.id) } })}
      >
        <View style={styles.cardLeft}>
          {mediaSource(item.photo_url) ? (
            <Image source={mediaSource(item.photo_url)!} style={styles.cardImage} />
          ) : (
            <LinearGradient
              colors={['#fde6e6', '#fbd0d0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardIcon}
            >
              <Text style={styles.cardIconText}>{item.category?.icon ?? '📦'}</Text>
            </LinearGradient>
          )}
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardSerial}>{item.asset_tag}</Text>
          <View style={styles.cardMeta}>
            <View style={[styles.reasonBadge, { backgroundColor: meta.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: meta.dot }]} />
              <Text style={[styles.reasonText, { color: meta.color }]}>{meta.label}</Text>
            </View>
            {item.location ? (
              <View style={styles.locationPill}>
                <Ionicons name="location-outline" size={11} color="#64748b" />
                <Text style={styles.cardDate} numberOfLines={1}>{item.location}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#cbd5e1" style={styles.rowChevron} />
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
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
        <Text style={styles.heroTitle}>Asset Inventory</Text>
        <Text style={styles.heroSubtitle}>
          Live inventory — tap any asset for full details.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsRow}
        >
          {stats.map((s, idx) => (
            <TouchableOpacity
              key={s.label}
              style={styles.statChip}
              activeOpacity={0.8}
              onPress={() => (s.label === 'Archived' ? router.push('/archived-assets') : undefined)}
              disabled={s.label !== 'Archived'}
            >
              <Ionicons name={s.icon} size={15} color="#fff" />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* ── Search (overlapping the band) ─────────────────── */}
      <View style={styles.searchRow}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={18} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchTextInput}
            placeholder="Search by name, tag or serial..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectionColor={BRAND}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.archiveBtnWrap}
          activeOpacity={0.85}
          onPress={() => router.push('/archived-assets')}
        >
          <LinearGradient
            colors={['#66001a', '#800020', '#8a0d28']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.archiveBtn}
          >
            <Ionicons name="archive-outline" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── Filter Chips ──────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChips}
      >
        {(
          [
            { key: 'all', label: 'All Assets' },
            { key: 'active', label: 'Active Only' },
            { key: 'checked_out', label: 'Checked Out' },
          ] as const
        ).map((chip) => (
          <TouchableOpacity
            key={chip.key}
            style={[styles.chip, statusFilter === chip.key && styles.chipActive]}
            activeOpacity={0.8}
            onPress={() => setStatusFilter(chip.key)}
          >
            {statusFilter === chip.key ? (
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
        ))}
      </ScrollView>

      <Text style={styles.listHeader}>
        {statusFilter === 'all'
          ? 'All Assets'
          : statusFilter === 'active'
          ? 'Active Assets'
          : 'Checked Out Assets'}
        <Text style={styles.listCount}>  ·  {assets.length}</Text>
      </Text>
    </>
  );

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

      {loading && !assetsData ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={BRAND} />
          <Text style={styles.loadingText}>Loading assets…</Text>
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
        <FlatList
          data={assets}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCard}
          onRefresh={refetch}
          refreshing={loading}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="cube-outline" size={40} color={BRAND} />
              </View>
              <Text style={styles.emptyTitle}>No Assets Found</Text>
              <Text style={styles.emptySub}>Try adjusting your search or status filter.</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fabWrap}
        activeOpacity={0.85}
        onPress={() => router.push('/register-asset')}
      >
        <LinearGradient
          colors={['#66001a', '#800020', '#8a0d28']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ──────────────────────────────────────────────────────────
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
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f8f4f4', alignItems: 'center', justifyContent: 'center' },
  brandLogo: { height: 30, width: 130 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
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
  archiveBtnWrap: {
    borderRadius: 14,
    ...Platform.select({
      ios: { shadowColor: BRAND_DARK, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
      android: { elevation: 5 },
      web: { boxShadow: '0 6px 18px rgba(74, 0, 18, 0.35)' },
    }),
  },
  archiveBtn: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

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

  // ── List Header ─────────────────────────────────────────
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
  listContent: { paddingBottom: 100 },

  // ── Cards ───────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 20,
    padding: 14,
    ...softShadow,
  },
  cardLeft: { marginRight: 13 },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: { width: 48, height: 48, borderRadius: 14 },
  cardIconText: { fontSize: 22 },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#0f172a', letterSpacing: -0.2 },
  cardSerial: { fontSize: 12, color: '#94a3b8', marginTop: 2, fontVariant: ['tabular-nums'] },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 7, gap: 10 },
  locationPill: { flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 1 },
  cardDate: { fontSize: 11, color: '#64748b', flexShrink: 1 },
  reasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 9,
    gap: 4,
  },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  reasonText: { fontSize: 10, fontWeight: '700' },
  rowChevron: { marginLeft: 6 },

  // ── States ──────────────────────────────────────────────
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 6 },
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

  // ── FAB ─────────────────────────────────────────────────
  fabWrap: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    borderRadius: 28,
    ...Platform.select({
      ios: { shadowColor: BRAND_DARK, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
      android: { elevation: 8 },
      web: { boxShadow: '0 10px 26px rgba(74, 0, 18, 0.4)' },
    }),
  },
  fab: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
});
