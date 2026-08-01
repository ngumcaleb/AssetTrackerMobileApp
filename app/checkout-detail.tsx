import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch } from '@/hooks/useFetch';
import { getInitials } from '@/utils/format';
import { CheckOut } from '@/types/api';

const BRAND       = '#800020';
const BRAND_DARK  = '#4a0012';

const softShadow = Platform.select({
  ios:     { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 2 },
  web:     { boxShadow: '0 2px 14px rgba(15, 23, 42, 0.07)' },
});

function formatDateTime(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CheckOutDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: checkout, loading, error, refetch } = useFetch<CheckOut>({
    endpoint: `/api/checkouts/${id}`,
  });

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── App Bar ────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Check-Out Details</Text>
        <View style={styles.spacer} />
      </View>

      {loading && !checkout ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={BRAND} />
          <Text style={styles.loadingText}>Loading details…</Text>
        </View>
      ) : error || !checkout ? (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={32} color={BRAND} />
          <Text style={styles.errorText}>{error || 'Check-out not found'}</Text>
          <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
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

            <Text style={styles.heroEyebrow}>ASSIGNMENT</Text>
            <Text style={styles.heroTitle}>Check-Out Details</Text>
            <Text style={styles.heroSubtitle}>
              Review the assignment and return information below.
            </Text>
          </LinearGradient>

          {/* ── Asset Card (overlapping the band) ────────────── */}
          <TouchableOpacity
            style={styles.assetCard}
            activeOpacity={0.8}
            onPress={
              checkout.asset?.id
                ? () => router.push({ pathname: '/asset-detail', params: { id: String(checkout.asset!.id) } })
                : undefined
            }
          >
            <View style={styles.assetRow}>
              <LinearGradient
                colors={['#fde6e6', '#fbd0d0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.assetIcon}
              >
                <Text style={styles.assetIconText}>{checkout.asset?.category?.icon ?? '📦'}</Text>
              </LinearGradient>
              <View style={styles.assetBody}>
                <Text style={styles.assetName} numberOfLines={1}>{checkout.asset?.name ?? 'Deleted Asset'}</Text>
                <Text style={styles.assetTag}>{checkout.asset?.asset_tag ?? '—'}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: checkout.returned_at ? '#e6f9e6' : '#fef3c7' }]}>
                <View style={[styles.statusDot, { backgroundColor: checkout.returned_at ? '#22c55e' : '#f59e0b' }]} />
                <Text style={[styles.statusText, { color: checkout.returned_at ? '#16a34a' : '#d97706' }]}>
                  {checkout.returned_at ? 'Returned' : 'Active'}
                </Text>
              </View>
            </View>

            <View style={styles.assetDivider} />

            <View style={styles.assigneeRow}>
              <LinearGradient
                colors={['#66001a', '#800020', '#8a0d28']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.assigneeAvatar}
              >
                <Text style={styles.assigneeAvatarText}>{getInitials(checkout.assignee_name) || '?'}</Text>
              </LinearGradient>
              <View>
                <Text style={styles.assigneeLabel}>Assigned To</Text>
                <Text style={styles.assigneeName}>{checkout.assignee_name}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#cbd5e1" style={styles.assigneeChevron} />
            </View>
          </TouchableOpacity>

          {/* ── Info Card ────────────────────────────────────── */}
          <View style={styles.infoCard}>
            <Text style={styles.sectionHeader}>Check-Out Information</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoLabelWrap}>
                <Ionicons name="business-outline" size={15} color="#94a3b8" />
                <Text style={styles.infoLabel}>Department</Text>
              </View>
              <Text style={styles.infoValue}>{checkout.department || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelWrap}>
                <Ionicons name="flag-outline" size={15} color="#94a3b8" />
                <Text style={styles.infoLabel}>Purpose</Text>
              </View>
              <Text style={styles.infoValue}>{checkout.purpose || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelWrap}>
                <Ionicons name="navigate-outline" size={15} color="#94a3b8" />
                <Text style={styles.infoLabel}>Destination</Text>
              </View>
              <Text style={styles.infoValue}>{checkout.destination || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelWrap}>
                <Ionicons name="arrow-up-circle-outline" size={15} color="#94a3b8" />
                <Text style={styles.infoLabel}>Checked Out</Text>
              </View>
              <Text style={styles.infoValue}>{formatDateTime(checkout.checked_out_at)}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelWrap}>
                <Ionicons name="calendar-outline" size={15} color="#94a3b8" />
                <Text style={styles.infoLabel}>Expected Return</Text>
              </View>
              <Text style={styles.infoValue}>{formatDate(checkout.expected_return)}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoLabelWrap}>
                <Ionicons name="arrow-down-circle-outline" size={15} color="#94a3b8" />
                <Text style={styles.infoLabel}>Returned At</Text>
              </View>
              <Text style={styles.infoValue}>{formatDateTime(checkout.returned_at)}</Text>
            </View>

            {checkout.notes ? (
              <View style={[styles.infoRow, styles.infoRowWide]}>
                <View style={styles.infoLabelWrap}>
                  <Ionicons name="document-text-outline" size={15} color="#94a3b8" />
                  <Text style={styles.infoLabel}>Notes</Text>
                </View>
                <Text style={[styles.infoValue, styles.infoValueWide]}>{checkout.notes}</Text>
              </View>
            ) : null}
            {checkout.return_notes ? (
              <View style={[styles.infoRow, styles.infoRowWide]}>
                <View style={styles.infoLabelWrap}>
                  <Ionicons name="document-text-outline" size={15} color="#94a3b8" />
                  <Text style={styles.infoLabel}>Return Notes</Text>
                </View>
                <Text style={[styles.infoValue, styles.infoValueWide]}>{checkout.return_notes}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}

      {checkout && !checkout.returned_at ? (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.returnWrap}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: '/checkin-asset',
                params: {
                  checkoutId: String(checkout.id),
                  assetName: checkout.asset?.name ?? '',
                  assetTag: checkout.asset?.asset_tag ?? '',
                },
              })
            }
          >
            <LinearGradient
              colors={['#66001a', '#800020', '#8a0d28']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryBtn}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Process Return</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : null}
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
  spacer: { width: 38 },

  // ── Hero Band ───────────────────────────────────────────
  hero: {
    paddingTop: 20,
    paddingBottom: 30,
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
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#fff',
    marginBottom: 4,
  },
  heroSubtitle: { fontSize: 13.5, color: 'rgba(255,255,255,0.72)' },

  // ── Asset Card ──────────────────────────────────────────
  assetCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    marginHorizontal: 16,
    marginTop: -18,
    marginBottom: 14,
    ...softShadow,
  },
  assetRow: { flexDirection: 'row', alignItems: 'center' },
  assetIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetIconText: { fontSize: 23 },
  assetBody: { flex: 1 },
  assetName: { fontSize: 16, fontWeight: '800', color: BRAND, letterSpacing: -0.2 },
  assetTag: { fontSize: 13, color: '#94a3b8', marginTop: 2, fontVariant: ['tabular-nums'] },
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

  assetDivider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 14 },
  assigneeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  assigneeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assigneeAvatarText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  assigneeLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6 },
  assigneeName: { fontSize: 15.5, fontWeight: '700', color: '#0f172a', marginTop: 2 },
  assigneeChevron: { marginLeft: 'auto' },

  // ── Info Card ───────────────────────────────────────────
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    ...softShadow,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoRowWide: { flexDirection: 'column', alignItems: 'flex-start', gap: 6 },
  infoLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  infoLabel: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  infoValue: { fontSize: 13.5, fontWeight: '700', color: '#0f172a', textAlign: 'right', flexShrink: 1 },
  infoValueWide: { textAlign: 'left', marginTop: 2 },

  // ── Bottom Bar ──────────────────────────────────────────
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  returnWrap: {
    borderRadius: 16,
    ...Platform.select({
      ios: { shadowColor: BRAND_DARK, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 10 },
      android: { elevation: 6 },
      web: { boxShadow: '0 8px 20px rgba(74, 0, 18, 0.35)' },
    }),
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 16,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // ── States ──────────────────────────────────────────────
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
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
});
