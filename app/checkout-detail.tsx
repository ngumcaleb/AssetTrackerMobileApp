import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch } from '@/hooks/useFetch';
import { CheckOut } from '@/types/api';

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Check-Out Details</Text>
        <View style={styles.spacer} />
      </View>

      {loading && !checkout ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error || !checkout ? (
        <View style={styles.centered}>
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
          <View style={styles.heroCard}>
            <View style={styles.heroRow}>
              <View style={styles.heroIcon}>
                <Text style={styles.heroIconText}>{checkout.asset?.category?.icon ?? '📦'}</Text>
              </View>
              <View style={styles.heroBody}>
                <TouchableOpacity
                  onPress={() =>
                    checkout.asset?.id
                      ? router.push({ pathname: '/asset-detail', params: { id: String(checkout.asset.id) } })
                      : undefined
                  }
                >
                  <Text style={styles.heroAssetName} numberOfLines={1}>
                    {checkout.asset?.name ?? 'Deleted Asset'}
                  </Text>
                  <Text style={styles.heroAssetTag}>{checkout.asset?.asset_tag ?? '—'}</Text>
                </TouchableOpacity>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: checkout.returned_at ? '#e6f9e6' : '#fef3c7' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: checkout.returned_at ? '#16a34a' : '#d97706' },
                  ]}
                >
                  {checkout.returned_at ? 'Returned' : 'Active'}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.assigneeRow}>
              <View style={styles.assigneeAvatar}>
                <Text style={styles.assigneeAvatarText}>
                  {checkout.assignee_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </Text>
              </View>
              <View>
                <Text style={styles.assigneeLabel}>Assigned To</Text>
                <Text style={styles.assigneeName}>{checkout.assignee_name}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionHeader}>Check-Out Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>{checkout.department || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Purpose</Text>
              <Text style={styles.infoValue}>{checkout.purpose || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Destination</Text>
              <Text style={styles.infoValue}>{checkout.destination || '—'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Checked Out</Text>
              <Text style={styles.infoValue}>{formatDateTime(checkout.checked_out_at)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Expected Return</Text>
              <Text style={styles.infoValue}>{formatDate(checkout.expected_return)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Returned At</Text>
              <Text style={styles.infoValue}>{formatDateTime(checkout.returned_at)}</Text>
            </View>
            {checkout.notes ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Notes</Text>
                <Text style={[styles.infoValue, styles.infoValueWide]}>{checkout.notes}</Text>
              </View>
            ) : null}
            {checkout.return_notes ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Return Notes</Text>
                <Text style={[styles.infoValue, styles.infoValueWide]}>{checkout.return_notes}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}

      {checkout && !checkout.returned_at ? (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.8}
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
            <Text style={styles.primaryBtnText}>✓ Process Return</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.outlineVariant,
  },
  backBtn: { padding: 8 },
  backArrow: { fontSize: 22, color: Colors.onSurface },
  topTitle: { fontSize: 20, fontWeight: '600', color: Colors.primary },
  spacer: { width: 40 },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 32, flex: 1 },
  errorText: { fontSize: 15, color: Colors.onErrorContainer, textAlign: 'center', marginBottom: 12 },
  retryBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryText: { fontSize: 14, fontWeight: '600', color: Colors.onPrimaryContainer },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },
  heroCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroIconText: { fontSize: 22 },
  heroBody: { flex: 1 },
  heroAssetName: { fontSize: 17, fontWeight: '700', color: Colors.primary },
  heroAssetTag: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  divider: { height: 0.5, backgroundColor: Colors.outlineVariant + '40', marginVertical: 14 },
  assigneeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  assigneeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assigneeAvatarText: { fontSize: 15, fontWeight: '700', color: Colors.onPrimaryContainer },
  assigneeLabel: { fontSize: 12, fontWeight: '600', color: Colors.onSurfaceVariant, textTransform: 'uppercase' },
  assigneeName: { fontSize: 16, fontWeight: '600', color: Colors.onSurface, marginTop: 2 },
  infoCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.outlineVariant + '40',
  },
  infoLabel: { fontSize: 14, color: Colors.outline, fontWeight: '500', marginRight: 16 },
  infoValue: { fontSize: 14, fontWeight: '600', color: Colors.onSurface, textAlign: 'right', flexShrink: 1 },
  infoValueWide: { flex: 1 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 0.5,
    borderTopColor: Colors.outlineVariant + '33',
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryBtnText: { color: Colors.onPrimary, fontSize: 18, fontWeight: '600' },
});
