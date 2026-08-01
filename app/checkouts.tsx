import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch } from '@/hooks/useFetch';
import { getInitials } from '@/utils/format';
import { CheckOut, PaginatedResponse } from '@/types/api';

const BRAND       = '#800020';
const BRAND_LIGHT = '#fde6e6';

type Tab = 'all' | 'active' | 'returned';

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'returned', label: 'Returned' },
];

const softShadow = Platform.select({
  ios:     { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 2 },
  web:     { boxShadow: '0 2px 14px rgba(15, 23, 42, 0.07)' },
});

export default function CheckOutsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, loading, error, refetch } = useFetch<PaginatedResponse<CheckOut>>({
    endpoint: '/api/checkouts',
    params: {
      status: tab === 'all' ? undefined : tab,
      search: debouncedSearch || undefined,
      per_page: 50,
    },
  });

  const checkouts = data?.data ?? [];

  const isFirstLoad = loading && !data;
  const activeCount = checkouts.filter((c) => !c.returned_at).length;
  const returnedCount = checkouts.filter((c) => !!c.returned_at).length;

  const heroStats = [
    { label: 'Active',   value: isFirstLoad ? '—' : activeCount,    icon: 'swap-horizontal-outline' as const },
    { label: 'Returned', value: isFirstLoad ? '—' : returnedCount,  icon: 'checkmark-circle-outline' as const },
    { label: 'Total',    value: isFirstLoad ? '—' : checkouts.length, icon: 'cube-outline'            as const },
  ];

  const renderRow = ({ item }: { item: CheckOut }) => {
    const isReturned = !!item.returned_at;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.75}
        onPress={() => router.push({ pathname: '/checkout-detail', params: { id: String(item.id) } })}
      >
        <LinearGradient
          colors={['#fde6e6', '#fbd0d0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardIcon}
        >
          <Text style={styles.cardIconText}>{item.asset?.category?.icon ?? '📦'}</Text>
        </LinearGradient>
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.asset?.name ?? 'Deleted Asset'}
          </Text>
          <Text style={styles.cardSerial}>{item.asset?.asset_tag ?? '—'}</Text>
          <View style={styles.cardAssigneeRow}>
            <View style={styles.assigneeAvatar}>
              <Text style={styles.assigneeAvatarText}>{getInitials(item.assignee_name) || '?'}</Text>
            </View>
            <View style={styles.cardAssigneeText}>
              <Text style={styles.cardAssigneeLabel}>Assigned to</Text>
              <Text style={styles.cardAssignee} numberOfLines={1}>{item.assignee_name}</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.statusBadge, { backgroundColor: isReturned ? '#e6f9e6' : '#fef3c7' }]}>
            <View style={[styles.statusDot, { backgroundColor: isReturned ? '#22c55e' : '#f59e0b' }]} />
            <Text style={[styles.statusText, { color: isReturned ? '#16a34a' : '#d97706' }]}>
              {isReturned ? 'Returned' : 'Active'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── App Bar ────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Check-Outs</Text>
        <TouchableOpacity style={styles.newBtn} activeOpacity={0.85} onPress={() => router.push('/search')}>
          <LinearGradient
            colors={['#66001a', '#800020']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.newBtnInner}
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.newBtnText}>New</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {isFirstLoad ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={BRAND} />
          <Text style={styles.loadingText}>Loading check-outs…</Text>
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
          data={checkouts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRow}
          onRefresh={refetch}
          refreshing={loading}
          ListHeaderComponent={
            <>
              {/* ── Hero Band ─────────────────────────────────── */}
              <LinearGradient
                colors={['#4a0012', '#800020', '#8a0d28']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
              >
                <View style={[styles.decorOrb, styles.decorOrbA]} />
                <View style={[styles.decorOrb, styles.decorOrbB]} />

                <Text style={styles.heroEyebrow}>ASSIGNMENTS</Text>
                <Text style={styles.heroTitle}>Check-Outs</Text>
                <Text style={styles.heroSubtitle}>
                  Track who has what, and what is back in the warehouse.
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

              {/* ── Search (overlapping the band) ─────────────── */}
              <View style={styles.searchRow}>
                <View style={styles.searchInput}>
                  <Ionicons name="search" size={18} color="#94a3b8" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchTextInput}
                    placeholder="Search by asset, tag or assignee..."
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
              </View>

              {/* ── Tabs ──────────────────────────────────────── */}
              <View style={styles.tabsRow}>
                {TABS.map((t) => {
                  const active = t.key === tab;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      style={[styles.tab, active && styles.tabActive]}
                      activeOpacity={0.8}
                      onPress={() => setTab(t.key)}
                    >
                      {active ? (
                        <LinearGradient
                          colors={['#66001a', '#800020']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.tabGradient}
                        >
                          <Text style={styles.tabTextActive}>{t.label}</Text>
                        </LinearGradient>
                      ) : (
                        <Text style={styles.tabText}>{t.label}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.listHeader}>
                Check-Outs<Text style={styles.listCount}>  ·  {data?.meta.total ?? checkouts.length}</Text>
              </Text>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="swap-horizontal-outline" size={40} color={BRAND} />
              </View>
              <Text style={styles.emptyTitle}>No Check-Outs Found</Text>
              <Text style={styles.emptySub}>No assignments match this search.</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  newBtn: { borderRadius: 12 },
  newBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 13,
    height: 34,
    borderRadius: 12,
  },
  newBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },

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

  // ── Tabs ────────────────────────────────────────────────
  tabsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 16 },
  tab: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#efe7e7',
    overflow: 'hidden',
    ...softShadow,
  },
  tabActive: { borderColor: 'transparent' },
  tabGradient: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  tabTextActive: { fontSize: 13, fontWeight: '700', color: '#fff' },

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
  listContent: { paddingBottom: 36 },

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
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIconText: { fontSize: 22 },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#0f172a', letterSpacing: -0.2 },
  cardSerial: { fontSize: 12, color: '#94a3b8', marginTop: 2, fontVariant: ['tabular-nums'] },
  cardAssigneeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  assigneeAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assigneeAvatarText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  cardAssigneeText: { flex: 1 },
  cardAssigneeLabel: { fontSize: 9, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4 },
  cardAssignee: { fontSize: 12.5, color: '#334155', fontWeight: '600', marginTop: 1 },
  cardRight: { alignItems: 'flex-end', gap: 10, marginLeft: 8 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 10, fontWeight: '700' },

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
});
