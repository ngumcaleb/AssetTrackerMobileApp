import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch } from '@/hooks/useFetch';
import { Asset } from '@/types/api';

export default function AssetDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [copied, setCopied] = useState(false);

  const { data: asset, loading, error } = useFetch<Asset>({
    endpoint: `/api/assets/${id}`,
  });

  const handleCopyId = () => {
    if (asset) {
      setCopied(true);
      Alert.alert('Copied', 'Asset ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleMoreOptions = () => {
    Alert.alert('More Options', 'Select an action', [
      { text: 'Edit Asset', onPress: () => {} },
      { text: 'Archive Asset', onPress: () => {}, style: 'destructive' },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>â†</Text>
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
            <Text style={styles.backArrow}>â†</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Asset Detail</Text>
          <View style={styles.moreBtn} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error || 'Asset not found'}</Text>
        </View>
      </View>
    );
  }

  const checkout = asset.current_checkout;
  const statusLabel = asset.status === 'checked_out' ? 'Checked Out'
    : asset.status === 'archived' ? 'Archived'
    : 'Active';
  const statusColor = asset.status === 'checked_out' ? '#f59e0b'
    : asset.status === 'archived' ? Colors.outline
    : '#22c55e';
  const statusBg = asset.status === 'checked_out' ? '#fef3c7'
    : asset.status === 'archived' ? Colors.surfaceContainerHigh
    : '#e6f9e6';
  const statusTextColor = asset.status === 'checked_out' ? '#d97706'
    : asset.status === 'archived' ? Colors.outline
    : '#16a34a';

  const ASSET_INFO = [
    { label: 'Asset ID', value: asset.asset_tag, copyable: true },
    { label: 'Category', value: asset.category?.name || 'N/A' },
    { label: 'Brand', value: asset.brand || 'N/A' },
    { label: 'Model', value: asset.model || 'N/A' },
    { label: 'Serial', value: asset.serial || 'N/A' },
    { label: 'Purchase Date', value: asset.purchase_date || 'N/A' },
    { label: 'Purchase Price', value: asset.purchase_price != null ? `$${asset.purchase_price.toLocaleString()}` : 'N/A' },
    { label: 'Supplier', value: asset.supplier || 'N/A' },
  ];

  const assignedInitials = checkout?.assignee_name
    ? checkout.assignee_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>â†</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Asset Detail</Text>
        <TouchableOpacity onPress={handleMoreOptions} style={styles.moreBtn}>
          <Text style={styles.moreIcon}>â€¢â€¢â€¢</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.imagePlaceholder}>
            {asset.photo_url ? null : (
              <>
                <Text style={styles.cameraIcon}>ðŸ“·</Text>
                <Text style={styles.imageLabel}>Asset Photo</Text>
              </>
            )}
          </View>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroAssetName}>{asset.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusTextColor }]}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <View style={[styles.greenDot, { backgroundColor: statusColor }]} />
            <Text style={styles.statChipText}>{statusLabel}</Text>
          </View>
          {asset.location && (
            <View style={styles.statChip}>
              <Text style={styles.statChipIcon}>ðŸ“</Text>
              <Text style={styles.statChipText}>{asset.location}</Text>
            </View>
          )}
          {asset.created_at && (
            <View style={styles.statChip}>
              <Text style={styles.statChipIcon}>ðŸ“…</Text>
              <Text style={styles.statChipText}>Since {new Date(asset.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionHeader}>Asset Details</Text>
          {ASSET_INFO.map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <View style={styles.infoValueRow}>
                <Text style={styles.infoValue}>{item.value}</Text>
                {item.copyable && (
                  <TouchableOpacity
                    onPress={handleCopyId}
                    style={styles.copyBtn}
                  >
                    <Text style={styles.copyBtnText}>
                      {copied ? 'âœ"' : 'ðŸ"‹'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {checkout && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionHeader}>Current Assignment</Text>
            <View style={styles.assignmentRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{assignedInitials}</Text>
              </View>
              <View style={styles.assignmentInfo}>
                <Text style={styles.assignmentName}>{checkout.assignee_name}</Text>
                <Text style={styles.assignmentSub}>{checkout.department || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            {checkout.department && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Department</Text>
                <Text style={styles.infoValue}>{checkout.department}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Since</Text>
              <Text style={styles.infoValue}>{new Date(checkout.checked_out_at).toLocaleDateString()}</Text>
            </View>
            {checkout.purpose && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Purpose</Text>
                <Text style={styles.infoValue}>{checkout.purpose}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        {asset.status === 'checked_out' ? (
          <TouchableOpacity
            style={styles.checkInBtn}
            activeOpacity={0.8}
            onPress={() => router.push({
              pathname: '/checkin-asset',
              params: { checkoutId: String(checkout?.id), assetName: asset.name, assetTag: asset.asset_tag },
            })}
          >
            <Text style={styles.checkInBtnText}>âœ" Check In</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.checkInBtn}
            activeOpacity={0.8}
            onPress={() => router.push({
              pathname: '/checkout-asset',
              params: { assetId: String(asset.id), assetName: asset.name, assetTag: asset.asset_tag },
            })}
          >
            <Text style={styles.checkInBtnText}>â†— Check Out</Text>
          </TouchableOpacity>
        )}
        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={styles.outlinedBtn}
            activeOpacity={0.7}
            onPress={() => router.push({
              pathname: '/checkin-asset',
              params: { checkoutId: String(checkout?.id), assetName: asset.name, assetTag: asset.asset_tag },
            })}
          >
            <Text style={styles.outlinedBtnText}>âœ" Check In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlinedBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/asset-history')}
          >
            <Text style={styles.outlinedBtnText}>ðŸ• History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlinedBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/print-qr')}
          >
            <Text style={styles.outlinedBtnText}>ðŸ–¨ Print QR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
  backBtn: {
    padding: 8,
  },
  backArrow: {
    fontSize: 22,
    color: Colors.onSurface,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
  },
  moreBtn: {
    padding: 8,
  },
  moreIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 180,
  },
  heroSection: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  imagePlaceholder: {
    aspectRatio: 16 / 9,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 40,
    marginBottom: 4,
  },
  imageLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  heroAssetName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onSurface,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statChipIcon: {
    fontSize: 14,
  },
  statChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  infoCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.outlineVariant + '40',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.outline,
    fontWeight: '500',
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  copyBtn: {
    padding: 4,
  },
  copyBtnText: {
    fontSize: 16,
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  assignmentSub: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.outlineVariant + '40',
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
  },
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
    gap: 12,
  },
  checkInBtn: {
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
  checkInBtnText: {
    color: Colors.onPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
  },
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
  outlinedBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
});
