import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch } from '@/hooks/useFetch';
import { useAuth } from '@/context/AuthContext';
import { useDrawer } from '@/context/DrawerContext';
import { formatTimeAgo, getInitials, statusMeta } from '@/utils/format';
import type { DashboardSummary } from '@/types/api';

const BRAND       = '#800020';
const BRAND_DARK  = '#4a0012';
const BRAND_LIGHT = '#fde6e6';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getDateLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function activityMeta(type: string): {
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  color: string;
} {
  switch (type) {
    case 'checkout':       return { icon: 'arrow-up-circle-outline',  bg: '#fff3cd', color: '#b45309' };
    case 'return':         return { icon: 'arrow-down-circle-outline', bg: '#d1fae5', color: '#065f46' };
    case 'asset_created':  return { icon: 'add-circle-outline',        bg: '#dbeafe', color: '#1d4ed8' };
    case 'asset_archived': return { icon: 'archive-outline',           bg: '#f1f5f9', color: '#475569' };
    case 'asset_restored': return { icon: 'refresh-circle-outline',    bg: '#d1fae5', color: '#065f46' };
    default:               return { icon: 'ellipse-outline',           bg: BRAND_LIGHT, color: BRAND };
  }
}

export default function DashboardScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const { user } = useAuth();
  const { openDrawer } = useDrawer();

  const { data: summary, loading, error, refetch } = useFetch<DashboardSummary>({
    endpoint: '/api/summary',
  });

  const heroAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heroAnim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, [heroAnim]);

  const quickActions = [
    { label: 'Register Asset', icon: 'add-circle-outline'      as const, route: '/register-asset', color: BRAND },
    { label: 'Scan QR Code',   icon: 'qr-code-outline'         as const, route: '/(tabs)/scan',     color: '#1d4ed8' },
    { label: 'Check Out',      icon: 'arrow-up-circle-outline' as const, route: '/checkouts',       color: '#b45309' },
    { label: 'Search Assets',  icon: 'search-outline'          as const, route: '/search',          color: '#065f46' },
  ];

  const total = summary?.total ?? 0;
  const breakdown = [
    { label: 'Total Assets',  value: total,                            icon: 'cube-outline'           as const, color: BRAND,     bg: BRAND_LIGHT },
    { label: 'Active',        value: summary?.active      ?? 0, icon: 'checkmark-circle-outline'  as const, color: '#16a34a', bg: '#dcfce7' },
    { label: 'Checked Out',   value: summary?.checked_out ?? 0, icon: 'swap-horizontal-outline'   as const, color: '#b45309', bg: '#fef3c7' },
    { label: 'Archived',      value: summary?.archived    ?? 0, icon: 'archive-outline'            as const, color: '#64748b', bg: '#f1f5f9' },
  ];
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const recentAssets   = summary?.recent_assets?.slice(0, 4)   ?? [];
  const recentActivity = summary?.recent_activity?.slice(0, 5)  ?? [];
  const hasAlerts      = (summary?.expired ?? 0) > 0 || (summary?.damaged ?? 0) > 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── App Header ───────────────────────────────────── */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={openDrawer}>
          <Ionicons name="menu" size={24} color="#1e293b" />
        </TouchableOpacity>

        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.appBarRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color="#1e293b" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarBtn}
            activeOpacity={0.85}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Main Scroll View ─────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor={BRAND}
            colors={[BRAND]}
          />
        }
      >

        {/* ── Hero Banner Card ────────────────────────────── */}
        <Animated.View
          style={[
            styles.heroCardContainer,
            {
              opacity: heroAnim,
              transform: [
                {
                  translateY: heroAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#4a0012', '#800020', '#8a0d28']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={[styles.decorOrb, styles.decorOrbA]} />
            <View style={[styles.decorOrb, styles.decorOrbB]} />
            <View style={styles.decorRing} />

            <View style={styles.heroTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroDate}>{getDateLabel().toUpperCase()}</Text>
                <Text style={styles.heroGreeting}>{getGreeting()}</Text>
                <Text style={styles.heroName} numberOfLines={1}>
                  {user?.name ? user.name.split(' ')[0] : 'Manager'}
                </Text>
                <Text style={styles.heroSub}>
                  Here&apos;s your live asset overview today
                </Text>
              </View>

              <View style={styles.heroAvatarCol}>
                <View style={styles.heroAvatar}>
                  <Text style={styles.heroAvatarText}>{getInitials(user?.name)}</Text>
                </View>
                <View style={styles.heroBadge}>
                  <View style={styles.heroBadgeDot} />
                  <Text style={styles.heroBadgeLabel}>Online</Text>
                </View>
              </View>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroStripRow}>
              <View style={styles.heroStripItem}>
                <Text style={styles.heroStripValue}>{summary?.total ?? '—'}</Text>
                <Text style={styles.heroStripLabel}>Total</Text>
              </View>
              <View style={styles.heroStripSep} />
              <View style={styles.heroStripItem}>
                <Text style={styles.heroStripValue}>{summary?.active ?? '—'}</Text>
                <Text style={styles.heroStripLabel}>Active</Text>
              </View>
              <View style={styles.heroStripSep} />
              <View style={styles.heroStripItem}>
                <Text style={styles.heroStripValue}>{summary?.checked_out ?? '—'}</Text>
                <Text style={styles.heroStripLabel}>Out</Text>
              </View>
              <View style={styles.heroStripSep} />
              <View style={styles.heroStripItem}>
                <Text style={styles.heroStripValue}>{summary?.archived ?? '—'}</Text>
                <Text style={styles.heroStripLabel}>Archived</Text>
              </View>
            </View>
          </LinearGradient>

          {hasAlerts && (
            <View style={styles.alertRow}>
              {(summary?.expired ?? 0) > 0 && (
                <View style={[styles.alertPill, { backgroundColor: '#fef2f2', borderColor: '#fca5a5' }]}>
                  <Ionicons name="alert-circle" size={13} color="#dc2626" />
                  <Text style={[styles.alertPillText, { color: '#dc2626' }]}>
                    {summary?.expired} Overdue
                  </Text>
                </View>
              )}
              {(summary?.damaged ?? 0) > 0 && (
                <View style={[styles.alertPill, { backgroundColor: '#fffbeb', borderColor: '#fcd34d' }]}>
                  <Ionicons name="warning" size={13} color="#d97706" />
                  <Text style={[styles.alertPillText, { color: '#d97706' }]}>
                    {summary?.damaged} Damaged
                  </Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>

        {/* ── Loading / Error Indicators ──────────────────── */}
        {loading && !summary && (
          <View style={styles.loadRow}>
            <ActivityIndicator size="small" color={BRAND} />
            <Text style={styles.loadText}>Loading dashboard metrics…</Text>
          </View>
        )}

        {error && !summary && (
          <View style={styles.errorCard}>
            <Ionicons name="cloud-offline-outline" size={32} color={BRAND} />
            <Text style={styles.errorTitle}>Connection Issue</Text>
            <Text style={styles.errorMsg}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Quick Actions ───────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.actionCard}
                activeOpacity={0.8}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: action.color + '15' }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionLabel} numberOfLines={2}>{action.label}</Text>
                <Ionicons name="chevron-forward" size={15} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Asset Breakdown ─────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Asset Breakdown</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/assets')} activeOpacity={0.7}>
              <Text style={styles.seeAll}>View all →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.breakdownCard}>
            {breakdown.map((row, idx) => (
              <TouchableOpacity
                key={row.label}
                style={[
                  styles.breakdownRow,
                  idx < breakdown.length - 1 && styles.rowBorder,
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  router.push(
                    row.label === 'Archived' ? '/archived-assets' : '/(tabs)/assets'
                  )
                }
              >
                <View style={[styles.breakdownIcon, { backgroundColor: row.bg }]}>
                  <Ionicons name={row.icon} size={18} color={row.color} />
                </View>
                <View style={styles.breakdownBody}>
                  <View style={styles.breakdownTopRow}>
                    <Text style={styles.breakdownLabel}>{row.label}</Text>
                    <Text style={[styles.breakdownValue, { color: row.color }]}>{row.value}</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${pct(row.value)}%`,
                          backgroundColor: row.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Recent Assets ───────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Recent Assets</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/assets')} activeOpacity={0.7}>
              <Text style={styles.seeAll}>View all →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardContainer}>
            {recentAssets.length > 0 ? (
              recentAssets.map((asset, idx) => {
                const meta = statusMeta(asset.status);
                return (
                  <TouchableOpacity
                    key={asset.id}
                    style={[
                      styles.assetRow,
                      idx < recentAssets.length - 1 && styles.rowBorder,
                    ]}
                    activeOpacity={0.75}
                    onPress={() =>
                      router.push({ pathname: '/asset-detail', params: { id: String(asset.id) } })
                    }
                  >
                    <View style={[styles.assetIconWrap, { backgroundColor: BRAND_LIGHT }]}>
                      <Text style={styles.assetEmoji}>{asset.category?.icon ?? '📦'}</Text>
                    </View>
                    <View style={styles.assetBody}>
                      <Text style={styles.assetName} numberOfLines={1}>{asset.name}</Text>
                      <Text style={styles.assetTag}>{asset.asset_tag}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
                      <View style={[styles.statusDot, { backgroundColor: meta.dot }]} />
                      <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={15} color="#cbd5e1" style={styles.rowChevron} />
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyRow}>
                <Ionicons name="cube-outline" size={24} color="#94a3b8" />
                <Text style={styles.emptyText}>No assets added yet</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Recent Activity ─────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Recent Activity</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/activity')} activeOpacity={0.7}>
              <Text style={styles.seeAll}>View all →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardContainer}>
            {recentActivity.length > 0 ? (
              recentActivity.map((log, idx) => {
                const ai = activityMeta(log.type);
                return (
                  <View
                    key={log.id}
                    style={[
                      styles.actRow,
                      idx < recentActivity.length - 1 && styles.rowBorder,
                    ]}
                  >
                    <View style={styles.timelineCol}>
                      <View style={[styles.actDot, { backgroundColor: ai.bg }]}>
                        <Ionicons name={ai.icon} size={15} color={ai.color} />
                      </View>
                      {idx < recentActivity.length - 1 && <View style={styles.timelineLine} />}
                    </View>

                    <View style={styles.actBody}>
                      <Text style={styles.actDesc} numberOfLines={2}>{log.description}</Text>
                      <Text style={styles.actTime}>{formatTimeAgo(log.created_at)}</Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyRow}>
                <Ionicons name="document-text-outline" size={24} color="#94a3b8" />
                <Text style={styles.emptyText}>No recent activity</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8f4f4' },

  // ── App Header ─────────────────────────────────────────
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  appBarRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#f8f4f4',
    alignItems: 'center', justifyContent: 'center',
  },
  logo: { height: 30, width: 130 },
  avatarBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: BRAND,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // ── Scroll ─────────────────────────────────────────────
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // ── Hero Banner ────────────────────────────────────────
  heroCardContainer: { marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  heroCard: {
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: BRAND_DARK, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.32, shadowRadius: 18 },
      android: { elevation: 8 },
    }),
  },
  decorOrb: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)' },
  decorOrbA: { top: -40, right: -30, width: 170, height: 170 },
  decorOrbB: { bottom: -50, left: -30, width: 150, height: 150 },
  decorRing: {
    position: 'absolute',
    top: 18,
    left: 40,
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  heroDate: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 8,
  },
  heroGreeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  heroName: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroSub: { fontSize: 12.5, color: 'rgba(255,255,255,0.65)', lineHeight: 17 },
  heroAvatarCol: { alignItems: 'center', marginLeft: 12 },
  heroAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  heroAvatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  heroBadgeDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' },
  heroBadgeLabel:{ fontSize: 10, color: '#fff', fontWeight: '600' },

  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginVertical: 16,
  },

  heroStripRow:  { flexDirection: 'row', alignItems: 'center' },
  heroStripItem: { flex: 1, alignItems: 'center' },
  heroStripValue:{ fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.4 },
  heroStripLabel:{ fontSize: 10, color: 'rgba(255,255,255,0.62)', marginTop: 3, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  heroStripSep:  { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },

  // ── Alert Pills ────────────────────────────────────────
  alertRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  alertPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  alertPillText: { fontSize: 12, fontWeight: '700' },

  // ── Loading & Error ────────────────────────────────────
  loadRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  loadText: { fontSize: 13, color: '#94a3b8' },
  errorCard:{
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  errorTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  errorMsg:   { fontSize: 13, color: '#64748b', textAlign: 'center' },
  retryBtn:   { marginTop: 6, backgroundColor: BRAND, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12 },
  retryText:  { color: '#fff', fontWeight: '700', fontSize: 13 },

  // ── Sections ───────────────────────────────────────────
  section: { paddingHorizontal: 16, marginTop: 26 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAccent: { width: 4, height: 18, borderRadius: 2, backgroundColor: BRAND },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', letterSpacing: -0.3 },
  seeAll: { fontSize: 13, fontWeight: '700', color: BRAND },

  // ── Quick Actions ──────────────────────────────────────
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  actionIconWrap: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { fontSize: 13, fontWeight: '700', color: '#1e293b', flex: 1 },

  // ── Asset Breakdown ────────────────────────────────────
  breakdownCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 },
  breakdownIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  breakdownBody: { flex: 1 },
  breakdownTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 },
  breakdownLabel: { fontSize: 13.5, fontWeight: '600', color: '#334155' },
  breakdownValue: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  barTrack: { height: 6, borderRadius: 3, backgroundColor: '#f1f5f9', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },

  // ── Common Card ────────────────────────────────────────
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#f6f1f1' },

  // ── Recent Assets ──────────────────────────────────────
  assetRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13 },
  assetIconWrap: {
    width: 42, height: 42, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  assetEmoji: { fontSize: 20 },
  assetBody:  { flex: 1 },
  assetName:  { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  assetTag:   { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 16, gap: 4,
  },
  statusDot:  { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 10, fontWeight: '700' },
  rowChevron: { marginLeft: 6 },

  // ── Activity ───────────────────────────────────────────
  actRow:      { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 13 },
  timelineCol: { alignItems: 'center', marginRight: 12, width: 32 },
  actDot: {
    width: 32, height: 32, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  timelineLine: {
    width: 1.5, flex: 1,
    backgroundColor: '#f1f5f9', marginTop: 5, marginBottom: -5,
  },
  actBody: { flex: 1, paddingTop: 4 },
  actDesc: { fontSize: 13, color: '#1e293b', fontWeight: '500', lineHeight: 18 },
  actTime: { fontSize: 11, color: '#94a3b8', marginTop: 3 },

  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  emptyText: { fontSize: 13, color: '#94a3b8' },
});
