import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegistrationSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeIcon}>âœ•</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>ScanTrack</Text>
        <TouchableOpacity style={styles.helpBtn}>
          <Text style={styles.helpIcon}>?</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.successSection}>
          <View style={styles.successCircle}>
            <Text style={styles.checkmark}>âœ“</Text>
          </View>
          <Text style={styles.successTitle}>Asset Registered</Text>
          <Text style={styles.successDesc}>
            Success! The entry has been securely added to your global inventory tracker.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>Asset Name</Text>
              <Text style={styles.summaryName}>High-Precision Industrial Laser</Text>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>Active</Text>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <View>
              <Text style={styles.summaryLabel}>Global ID</Text>
              <Text style={styles.summaryValue}>ST-8829-XL</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.summaryLabel}>Category</Text>
              <Text style={styles.summaryValue}>Precision Tools</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.locationRow}>
            <View style={styles.locationIcon}>
              <Text>ðŸ“</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Current Location</Text>
              <Text style={styles.summaryValue}>Main Warehouse, Zone B-4</Text>
            </View>
          </View>
        </View>

        <View style={styles.imagePlaceholder}>
          <View style={styles.imageOverlay}>
            <Text style={styles.imageDate}>Registered Oct 24, 2023 Â· 10:45 AM</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>ðŸ‘ View Asset</Text>
          </TouchableOpacity>
          <View style={styles.secondaryRow}>
            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>ðŸ–¨ Print QR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn}>
              <Text style={styles.secondaryBtnText}>ï¼‹ Add New</Text>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.surface,
  },
  closeBtn: { padding: 8 },
  closeIcon: { fontSize: 20, color: Colors.onSurfaceVariant },
  topTitle: { fontSize: 20, fontWeight: '600', color: Colors.primary },
  helpBtn: { padding: 8 },
  helpIcon: { fontSize: 20, color: Colors.onSurfaceVariant },
  content: { padding: 16, alignItems: 'center' },
  successSection: { alignItems: 'center', marginBottom: 24 },
  successCircle: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 8,
  },
  checkmark: { fontSize: 48, color: '#fff', fontWeight: '700' },
  successTitle: { fontSize: 32, fontWeight: '700', color: Colors.onSurface, marginBottom: 8, letterSpacing: -0.02 },
  successDesc: { fontSize: 16, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 24 },
  summaryCard: {
    width: '100%', backgroundColor: Colors.surfaceContainerLowest, borderRadius: 20,
    padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.outlineVariant + '4D',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
  },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  summaryLabel: { fontSize: 12, fontWeight: '600', color: Colors.primary, letterSpacing: 0.05, textTransform: 'uppercase' },
  summaryName: { fontSize: 18, fontWeight: '600', color: Colors.onSurface, marginTop: 4 },
  activeBadge: { backgroundColor: Colors.primary + '1A', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  activeText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryValue: { fontSize: 16, fontWeight: '700', color: Colors.onSurface, marginTop: 4 },
  divider: { height: 1, backgroundColor: Colors.outlineVariant + '4D', marginBottom: 16 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  locationIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  imagePlaceholder: {
    width: '100%', height: 128, borderRadius: 20, backgroundColor: Colors.surfaceContainer,
    marginBottom: 24, overflow: 'hidden', borderWidth: 1, borderColor: Colors.outlineVariant + '33',
  },
  imageOverlay: {
    flex: 1, justifyContent: 'flex-end', padding: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  imageDate: { color: '#fff', fontSize: 12, fontWeight: '600' },
  actions: { width: '100%', gap: 12, marginBottom: 24 },
  primaryBtn: {
    backgroundColor: Colors.primary, borderRadius: 28, height: 52,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primaryContainer, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 8,
  },
  primaryBtnText: { color: Colors.onPrimary, fontSize: 18, fontWeight: '600' },
  secondaryRow: { flexDirection: 'row', gap: 12 },
  secondaryBtn: {
    flex: 1, borderRadius: 28, height: 52, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: 'transparent',
  },
  secondaryBtnText: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
});
