import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch } from '@/hooks/useFetch';
import { Category, PaginatedResponse } from '@/types/api';

const BRAND       = '#800020';
const BRAND_DARK  = '#4a0012';
const BRAND_LIGHT = '#fde6e6';

const softShadow = Platform.select({
  ios:     { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 2 },
  web:     { boxShadow: '0 2px 14px rgba(15, 23, 42, 0.07)' },
});

export default function CategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const { data: categoriesData, loading, error, refetch } = useFetch<PaginatedResponse<Category>>({
    endpoint: '/api/categories',
  });

  const categories = categoriesData?.data ?? [];

  const filtered = categories.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* ── App Bar ────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Categories</Text>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={20} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading && !categoriesData} onRefresh={refetch} tintColor={BRAND} colors={[BRAND]} />}
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

          <Text style={styles.heroEyebrow}>ORGANIZE</Text>
          <Text style={styles.heroTitle}>Categories</Text>
          <Text style={styles.heroSubtitle}>
            Group your inventory into clear, searchable categories.
          </Text>
        </LinearGradient>

        {/* ── Search (overlapping the band) ─────────────────── */}
        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Ionicons name="search" size={18} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchTextInput}
              placeholder="Search categories..."
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
          <TouchableOpacity
            style={styles.addBtnWrap}
            activeOpacity={0.85}
            onPress={() => router.push('/category-form')}
          >
            <LinearGradient
              colors={['#66001a', '#800020', '#8a0d28']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.addBtn}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.listHeader}>
          All Categories<Text style={styles.listCount}>  ·  {filtered.length}</Text>
        </Text>

        {loading && !categoriesData ? (
          <View style={styles.centered}>
            <ActivityIndicator size="small" color={BRAND} />
            <Text style={styles.loadingText}>Loading categories…</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons name="cloud-offline-outline" size={32} color={BRAND} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="folder-open-outline" size={40} color={BRAND} />
            </View>
            <Text style={styles.emptyTitle}>No Categories Found</Text>
            <Text style={styles.emptySub}>
              {search.trim() ? `Nothing matched "${search}".` : 'Create your first category to start organizing assets.'}
            </Text>
          </View>
        ) : (
          filtered.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              activeOpacity={0.75}
              onPress={() => router.push({ pathname: '/category-form', params: { id: String(cat.id) } })}
            >
              <LinearGradient
                colors={['#fde6e6', '#fbd0d0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardIcon}
              >
                <Text style={styles.cardIconText}>{cat.icon || '📦'}</Text>
              </LinearGradient>
              <View style={styles.cardBody}>
                <Text style={styles.cardName} numberOfLines={1}>{cat.name}</Text>
                <View style={styles.cardMeta}>
                  <Ionicons name="cube-outline" size={12} color="#94a3b8" />
                  <Text style={styles.cardCount}>{cat.assets_count ?? 0} Assets</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            </TouchableOpacity>
          ))
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
  addBtnWrap: {
    borderRadius: 14,
    ...Platform.select({
      ios: { shadowColor: BRAND_DARK, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
      android: { elevation: 5 },
      web: { boxShadow: '0 6px 18px rgba(74, 0, 18, 0.35)' },
    }),
  },
  addBtn: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

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

  categoryCard: {
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
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  cardIconText: { fontSize: 24 },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15.5, fontWeight: '700', color: '#0f172a', letterSpacing: -0.2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  cardCount: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },

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
