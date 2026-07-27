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

export default function PrintQRScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>â†</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Print QR Label</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.settingsIcon}>âš™</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.qrCard}>
          <View style={styles.qrPlaceholder}>
            <View style={styles.qrGrid}>
              {Array.from({ length: 64 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.qrCell,
                    Math.random() > 0.4 && styles.qrCellFilled,
                  ]}
                />
              ))}
            </View>
          </View>
          <Text style={styles.assetName}>High-Precision Laser Welder</Text>
          <Text style={styles.assetId}>ST-8829-XL</Text>
          <Text style={styles.assetDate}>Registered Oct 24, 2023</Text>
        </View>

        <View style={styles.printOptions}>
          <Text style={styles.sectionTitle}>Print Options</Text>
          <TouchableOpacity style={styles.optionRow}>
            <Text style={styles.optionLabel}>Label Size</Text>
            <Text style={styles.optionValue}>Standard (2" Ã— 1")</Text>
            <Text style={styles.chevron}>â€º</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.optionRow}>
            <Text style={styles.optionLabel}>Printer</Text>
            <Text style={styles.optionValue}>Zebra ZD421</Text>
            <Text style={styles.chevron}>â€º</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.optionRow}>
            <Text style={styles.optionLabel}>Copies</Text>
            <Text style={styles.optionValue}>1</Text>
            <Text style={styles.chevron}>â€º</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.printBtn}>
          <Text style={styles.printBtnText}>ðŸ–¨ Print Label</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.surface,
    borderBottomWidth: 0.5, borderBottomColor: Colors.outlineVariant,
  },
  backBtn: { padding: 8 },
  backArrow: { fontSize: 22, color: Colors.onSurfaceVariant },
  topTitle: { fontSize: 20, fontWeight: '600', color: Colors.primary },
  iconBtn: { padding: 8 },
  settingsIcon: { fontSize: 20, color: Colors.onSurfaceVariant },
  content: { padding: 16, alignItems: 'center' },
  qrCard: {
    width: 240, backgroundColor: Colors.surfaceContainerLowest, borderRadius: 20,
    padding: 24, alignItems: 'center', marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
    borderWidth: 1, borderColor: Colors.outlineVariant + '33',
  },
  qrPlaceholder: {
    width: 160, height: 160, marginBottom: 16, alignItems: 'center', justifyContent: 'center',
  },
  qrGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 160, gap: 2 },
  qrCell: { width: 18, height: 18, backgroundColor: Colors.surfaceContainerHigh, borderRadius: 2 },
  qrCellFilled: { backgroundColor: Colors.onSurface },
  assetName: { fontSize: 16, fontWeight: '600', color: Colors.onSurface, textAlign: 'center' },
  assetId: { fontSize: 14, color: Colors.primary, fontWeight: '700', marginTop: 4 },
  assetDate: { fontSize: 12, color: Colors.outline, marginTop: 4 },
  printOptions: {
    width: '100%', backgroundColor: Colors.surfaceContainerLowest, borderRadius: 20,
    padding: 16, marginBottom: 24, borderWidth: 1, borderColor: Colors.outlineVariant + '33',
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.onSurface, marginBottom: 12 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  optionLabel: { fontSize: 16, color: Colors.onSurface },
  optionValue: { fontSize: 16, color: Colors.onSurfaceVariant, flex: 1, textAlign: 'right', marginRight: 8 },
  chevron: { fontSize: 18, color: Colors.outlineVariant },
  divider: { height: 1, backgroundColor: Colors.outlineVariant + '33' },
  printBtn: {
    width: '100%', backgroundColor: Colors.primary, borderRadius: 28, height: 56,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 8,
  },
  printBtnText: { color: Colors.onPrimary, fontSize: 18, fontWeight: '600' },
});
