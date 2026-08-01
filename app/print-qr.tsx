import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDate } from '@/utils/format';

export default function PrintQRScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { name, asset_tag, created_at } = useLocalSearchParams<{
    name?: string;
    asset_tag?: string;
    created_at?: string;
  }>();

  const displayName = name ?? 'Asset';
  const displayTag = asset_tag ?? 'N/A';
  const qrValue = displayTag !== 'N/A' ? displayTag : 'ASSET';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Asset: ${displayName}\nTag: ${displayTag}\nScan this tag in Royalty World AssetTracker.`,
      });
    } catch {
      Alert.alert('Share unavailable', 'Could not open the share sheet.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>QR Label</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.qrCard}>
          <View style={styles.qrBox}>
            <QRCode value={qrValue} size={200} backgroundColor="#fff" color="#000" />
          </View>
          <Text style={styles.assetName}>{displayName}</Text>
          <Text style={styles.assetId}>{displayTag}</Text>
          {created_at ? <Text style={styles.assetDate}>Registered {formatDate(created_at)}</Text> : null}
        </View>

        <Text style={styles.hint}>
          Print or share this QR. Scanning the tag value in the app will open the asset.
        </Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleShare}>
          <Text style={styles.primaryBtnText}>Share / Print</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  backBtn: { padding: 8 },
  backArrow: { fontSize: 22, color: Colors.onSurface },
  topTitle: { fontSize: 18, fontWeight: '600', color: Colors.primary },
  content: { padding: 16, alignItems: 'center' },
  qrCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  qrBox: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  assetName: { fontSize: 18, fontWeight: '700', color: Colors.onSurface, textAlign: 'center' },
  assetId: { fontSize: 15, fontWeight: '600', color: Colors.primary, marginTop: 6 },
  assetDate: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 8 },
  hint: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: Colors.onPrimary, fontSize: 16, fontWeight: '600' },
});
