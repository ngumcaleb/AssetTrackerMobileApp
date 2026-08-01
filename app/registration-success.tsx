import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDate } from '@/utils/format';

export default function RegistrationSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    asset_tag?: string;
    category?: string;
    location?: string;
    created_at?: string;
  }>();

  const name = params.name ?? 'Asset';
  const tag = params.asset_tag ?? 'N/A';
  const category = params.category ?? 'N/A';
  const location = params.location || 'Not set';
  const created = formatDate(params.created_at);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/assets')} style={styles.closeBtn}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Royalty World</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.successSection}>
          <View style={styles.successCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Asset Registered</Text>
          <Text style={styles.successDesc}>The asset has been added to your inventory.</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryLabel}>Asset Name</Text>
              <Text style={styles.summaryName}>{name}</Text>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>Active</Text>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <View>
              <Text style={styles.summaryLabel}>Asset Tag</Text>
              <Text style={styles.summaryValue}>{tag}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.summaryLabel}>Category</Text>
              <Text style={styles.summaryValue}>{category}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View>
            <Text style={styles.summaryLabel}>Location</Text>
            <Text style={styles.summaryValue}>{location}</Text>
          </View>
          {params.created_at ? (
            <Text style={styles.dateText}>Registered {created}</Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              if (params.id) {
                router.replace({ pathname: '/asset-detail', params: { id: String(params.id) } });
              } else {
                router.replace('/(tabs)/assets');
              }
            }}
          >
            <Text style={styles.primaryBtnText}>View Asset</Text>
          </TouchableOpacity>
          <View style={styles.secondaryRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() =>
                router.push({
                  pathname: '/print-qr',
                  params: { name, asset_tag: tag, created_at: params.created_at },
                })
              }
            >
              <Text style={styles.secondaryBtnText}>Print QR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/register-asset')}>
              <Text style={styles.secondaryBtnText}>Add New</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  closeBtn: { padding: 8 },
  closeIcon: { fontSize: 20, color: Colors.onSurfaceVariant },
  topTitle: { fontSize: 18, fontWeight: '600', color: Colors.primary },
  content: { padding: 16, alignItems: 'center' },
  successSection: { alignItems: 'center', marginBottom: 24 },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  checkmark: { fontSize: 48, color: '#fff', fontWeight: '700' },
  successTitle: { fontSize: 28, fontWeight: '700', color: Colors.onSurface, marginBottom: 8 },
  successDesc: { fontSize: 15, color: Colors.onSurfaceVariant, textAlign: 'center' },
  summaryCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  summaryName: { fontSize: 18, fontWeight: '600', color: Colors.onSurface, marginTop: 4 },
  activeBadge: {
    backgroundColor: Colors.primary + '1A',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    height: 28,
  },
  activeText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryValue: { fontSize: 16, fontWeight: '700', color: Colors.onSurface, marginTop: 4 },
  divider: { height: 1, backgroundColor: Colors.outlineVariant + '4D', marginBottom: 16 },
  dateText: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 10 },
  actions: { width: '100%', gap: 12, marginBottom: 24 },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: Colors.onPrimary, fontSize: 17, fontWeight: '600' },
  secondaryRow: { flexDirection: 'row', gap: 12 },
  secondaryBtn: {
    flex: 1,
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  secondaryBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
});
