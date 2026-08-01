import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { statusMeta } from '@/utils/format';
import { mediaSource } from '@/utils/media';
import type { PaginatedResponse, Asset } from '@/types/api';

const BRAND       = '#800020';
const BRAND_LIGHT = '#fde6e6';

const FILTERS = [
  { label: 'All Results', value: '' },
  { label: 'Assets Only', value: 'assets' },
];

const softShadow = Platform.select({
  ios:     { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 2 },
  web:     { boxShadow: '0 2px 14px rgba(15, 23, 42, 0.07)' },
});

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const searchParams: Record<string, string | number | undefined> = {};
  if (debouncedQuery.trim()) searchParams.search = debouncedQuery.trim();
  if (activeFilter === 'assets') searchParams.status = 'active';

  const { data, loading } = useFetch<PaginatedResponse<Asset>>({
    endpoint: '/api/assets',
    params: searchParams,
  });

  const results = data?.data ?? [];

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* ── App Bar ────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Search</Text>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={20} color="#1e293b" />
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

          <Text style={styles.heroEyebrow}>DISCOVER</Text>
          <Text style={styles.heroTitle}>Search Assets</Text>
          <Text style={styles.heroSubtitle}>
            Find assets by name, tag, serial or location.
          </Text>
        </LinearGradient>

        {/* ── Search (overlapping the band) ─────────────────── */}
        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Ionicons name="search" size={18} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchTextInput}
              placeholder="Search assets, IDs, or serials..."
              placeholderTextColor="#94a3b8"
              value={query}
              onChangeText={setQuery}
              selectionColor={BRAND}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Filter Chips ──────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
        >
          {FILTERS.map((chip) => {
            const isActive = activeFilter === chip.value;
            return (
              <TouchableOpacity
                key={chip.value || 'all'}
                style={[styles.chip, isActive && styles.chipActive]}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(chip.value)}
              >
                {isActive ? (
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
            );
          })}
        </ScrollView>

        <Text style={styles.listHeader}>
          Results<Text style={styles.listCount}>  ·  {results.length}</Text>
        </Text>

        {loading && !data ? (
          <View style={styles.centered}>
            <ActivityIndicator size="small" color={BRAND} />
            <Text style={styles.loadingText}>Searching…</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="search-outline" size={40} color={BRAND} />
            </View>
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptySub}>
              {debouncedQuery.trim()
                ? `Nothing matched "${debouncedQuery}". Try a different term.`
                : 'Start typing to search across your inventory.'}
            </Text>
          </View>
        ) : (
          results.map((item) => {
            const meta = statusMeta(item.status);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.resultCard}
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
                  <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
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
    paddingBottom: 28,
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
  heroSubtitle: { fontSize: 13.5, color: 'rgba(255,255,255,0.72)' },

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

  resultCard: {
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
  centered: { alignItems: 'center', paddingVertical: 48, gap: 6 },
  loadingText: { fontSize: 13, color: '#94a3b8', marginTop: 8 },
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
