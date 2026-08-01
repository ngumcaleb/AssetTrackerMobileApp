import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch } from '@/hooks/useFetch';
import { api } from '@/services/api';
import { formatCurrency, formatDate, getInitials, statusMeta } from '@/utils/format';
import { mediaSource } from '@/utils/media';
import { Asset } from '@/types/api';

export default function AssetDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [busy, setBusy] = useState(false);
  const [reasonModal, setReasonModal] = useState<'archive' | 'discard' | null>(null);
  const [reason, setReason] = useState('');

  const { data: asset, loading, error, refetch } = useFetch<Asset>({
    endpoint: `/api/assets/${id}`,
    enabled: !!id,
  });

  useFocusEffect(
    useCallback(() => {
      if (id) refetch();
    }, [id, refetch])
  );

  const submitStatusChange = async () => {
    if (!asset || !reasonModal || !reason.trim()) {
      Alert.alert('Reason required', 'Please enter a reason.');
      return;
    }
    setBusy(true);
    try {
      await api.post(`/api/assets/${asset.id}/${reasonModal}`, { reason: reason.trim() });
      setReasonModal(null);
      setReason('');
      Alert.alert('Done', `Asset ${reasonModal}d successfully.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || `Failed to ${reasonModal} asset.`);
    } finally {
      setBusy(false);
    }
  };

  const handleMoreOptions = () => {
    if (!asset) return;
    const options: { text: string; onPress?: () => void; style?: 'cancel' | 'destructive' }[] = [
      {
        text: 'Edit Asset',
        onPress: () => router.push({ pathname: '/asset-edit', params: { id: String(asset.id) } }),
      },
    ];
    if (asset.status !== 'archived' && asset.status !== 'discarded' && asset.status !== 'checked_out') {
      options.push({ text: 'Archive Asset', style: 'destructive', onPress: () => setReasonModal('archive') });
      options.push({ text: 'Discard Asset', style: 'destructive', onPress: () => setReasonModal('discard') });
    }
    if (asset.status === 'archived') {
      options.push({
        text: 'Restore Asset',
        onPress: async () => {
          try {
            await api.patch(`/api/assets/${asset.id}/restore`);
            refetch();
            Alert.alert('Restored', 'Asset restored to active inventory.');
          } catch (e: any) {
            Alert.alert('Error', e?.message || 'Failed to restore.');
          }
        },
      });
    }
    options.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('More Options', 'Select an action', options);
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Asset Detail</Text>
          <View style={styles.moreBtn} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (error || !asset) {
    return (
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Asset Detail</Text>
          <View style={styles.moreBtn} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error || 'Asset not found'}</Text>
          <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const checkout = asset.current_checkout;
  const meta = statusMeta(asset.status);
  const canCheckout = asset.status === 'active';
  const canCheckin = asset.status === 'checked_out' && !!checkout?.id;

  const ASSET_INFO = [
    { label: 'Asset ID', value: asset.asset_tag },
    { label: 'Category', value: asset.category?.name || 'N/A' },
    { label: 'Brand', value: asset.brand || 'N/A' },
    { label: 'Model', value: asset.model || 'N/A' },
    { label: 'Serial', value: asset.serial || 'N/A' },
    { label: 'Condition', value: asset.condition || 'N/A' },
    { label: 'Purchase Date', value: formatDate(asset.purchase_date) },
    { label: 'Purchase Price', value: formatCurrency(asset.purchase_price) },
    { label: 'Supplier', value: asset.supplier || 'N/A' },
  ];

  const photoSource = mediaSource(asset.photo_url);

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Asset Detail</Text>
        <TouchableOpacity onPress={handleMoreOptions} style={styles.moreBtn}>
          <Text style={styles.moreIcon}>···</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.imagePlaceholder}>
            {photoSource ? (
              <Image source={photoSource} style={styles.heroImage} resizeMode="cover" />
            ) : (
              <>
                <Text style={styles.cameraIcon}>📷</Text>
                <Text style={styles.imageLabel}>No Photo</Text>
              </>
            )}
          </View>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroAssetName}>{asset.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: meta.dot }]} />
              <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          {asset.location ? (
            <View style={styles.statChip}>
              <Text style={styles.statChipText}>{asset.location}</Text>
            </View>
          ) : null}
          <View style={styles.statChip}>
            <Text style={styles.statChipText}>Since {formatDate(asset.created_at)}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionHeader}>Asset Details</Text>
          {ASSET_INFO.map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
          {asset.description ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Description</Text>
              <Text style={[styles.infoValue, { flex: 1, textAlign: 'right' }]}>{asset.description}</Text>
            </View>
          ) : null}
        </View>

        {checkout ? (
          <View style={styles.infoCard}>
            <Text style={styles.sectionHeader}>Current Assignment</Text>
            <View style={styles.assignmentRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{getInitials(checkout.assignee_name)}</Text>
              </View>
              <View style={styles.assignmentInfo}>
                <Text style={styles.assignmentName}>{checkout.assignee_name}</Text>
                <Text style={styles.assignmentSub}>{checkout.department || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Since</Text>
              <Text style={styles.infoValue}>{formatDate(checkout.checked_out_at)}</Text>
            </View>
            {checkout.expected_return ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Expected Return</Text>
                <Text style={styles.infoValue}>{formatDate(checkout.expected_return)}</Text>
              </View>
            ) : null}
            {checkout.purpose ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Purpose</Text>
                <Text style={styles.infoValue}>{checkout.purpose}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {canCheckin ? (
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: '/checkin-asset',
                params: {
                  checkoutId: String(checkout!.id),
                  assetName: asset.name,
                  assetTag: asset.asset_tag,
                },
              })
            }
          >
            <Text style={styles.primaryBtnText}>Check In</Text>
          </TouchableOpacity>
        ) : canCheckout ? (
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: '/checkout-asset',
                params: {
                  assetId: String(asset.id),
                  assetName: asset.name,
                  assetTag: asset.asset_tag,
                },
              })
            }
          >
            <Text style={styles.primaryBtnText}>Check Out</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.outlinedBtn}
            onPress={() => router.push({ pathname: '/asset-history', params: { id: String(asset.id) } })}
          >
            <Text style={styles.outlinedBtnText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlinedBtn}
            onPress={() =>
              router.push({
                pathname: '/print-qr',
                params: {
                  name: asset.name,
                  asset_tag: asset.asset_tag,
                  created_at: asset.created_at,
                },
              })
            }
          >
            <Text style={styles.outlinedBtnText}>Print QR</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={!!reasonModal} transparent animationType="fade" onRequestClose={() => setReasonModal(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{reasonModal === 'archive' ? 'Archive Asset' : 'Discard Asset'}</Text>
            <Text style={styles.modalSub}>Provide a reason for this action.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Reason"
              placeholderTextColor={Colors.outline}
              value={reason}
              onChangeText={setReason}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setReasonModal(null)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={submitStatusChange} disabled={busy}>
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalConfirmText}>Confirm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
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
  topTitle: { fontSize: 18, fontWeight: '600', color: Colors.primary },
  moreBtn: { padding: 8, minWidth: 40, alignItems: 'center' },
  moreIcon: { fontSize: 20, fontWeight: '700', color: Colors.onSurfaceVariant, letterSpacing: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 180 },
  heroSection: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerLowest,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cameraIcon: { fontSize: 40, marginBottom: 4 },
  imageLabel: { fontSize: 13, fontWeight: '500', color: Colors.outline },
  heroOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  heroAssetName: { fontSize: 17, fontWeight: '700', color: Colors.onSurface, flex: 1, marginRight: 12 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statChip: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statChipText: { fontSize: 12, fontWeight: '600', color: Colors.onSurfaceVariant },
  infoCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.outlineVariant + '40',
    gap: 12,
  },
  infoLabel: { fontSize: 14, color: Colors.outline, fontWeight: '500' },
  infoValue: { fontSize: 14, fontWeight: '600', color: Colors.onSurface, maxWidth: '60%', textAlign: 'right' },
  assignmentRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Colors.onPrimaryContainer },
  assignmentInfo: { flex: 1 },
  assignmentName: { fontSize: 16, fontWeight: '600', color: Colors.onSurface },
  assignmentSub: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 16, color: Colors.error, textAlign: 'center', marginBottom: 12 },
  retryBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: { color: Colors.onPrimaryContainer, fontWeight: '600' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: Colors.outlineVariant + '33',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: Colors.onPrimary, fontSize: 17, fontWeight: '600' },
  secondaryActions: { flexDirection: 'row', gap: 10 },
  outlinedBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlinedBtnText: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.onSurface },
  modalSub: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 6, marginBottom: 14 },
  modalInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
    color: Colors.onSurface,
    marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalCancel: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
  },
  modalCancelText: { fontWeight: '600', color: Colors.onSurface },
  modalConfirm: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  modalConfirmText: { fontWeight: '600', color: Colors.onPrimary },
});
