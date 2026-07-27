import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation } from '@/hooks/useFetch';

export default function CheckoutAssetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    assetId?: string;
    assetName?: string;
    assetTag?: string;
  }>();

  const [assignee, setAssignee] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [purpose, setPurpose] = useState('Site Inspection');
  const [destination, setDestination] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [notes, setNotes] = useState('');

  const { execute: createCheckout, loading: processing, error: submitError } = useMutation(
    'POST',
    '/api/checkouts'
  );

  const handleConfirm = async () => {
    if (!params.assetId) {
      Alert.alert('Error', 'No asset specified for checkout.');
      return;
    }
    try {
      await createCheckout({
        asset_id: Number(params.assetId),
        assignee_name: assignee,
        department,
        purpose,
        destination,
        expected_return: returnDate || undefined,
        notes,
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', submitError || 'Failed to check out asset. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>â†</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>ScanTrack</Text>
        <TouchableOpacity style={styles.notifBtn}>
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionLabel}>Currently Scanning</Text>
        <View style={styles.assetCard}>
          <View style={styles.assetIcon}>
            <Text style={styles.assetIconText}>ðŸ“¦</Text>
          </View>
          <View style={styles.assetInfo}>
            <Text style={styles.assetName}>{params.assetName || 'Unknown Asset'}</Text>
            <Text style={styles.assetId}>Asset ID: {params.assetTag || 'N/A'}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Available</Text>
            </View>
          </View>
        </View>

        <Text style={styles.fieldLabel}>Assign To</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputIcon}>ðŸ‘¤</Text>
          <TextInput
            style={styles.input}
            placeholder="Search technician name or ID..."
            placeholderTextColor={Colors.outlineVariant}
            value={assignee}
            onChangeText={setAssignee}
          />
        </View>

        <View style={styles.gridRow}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Department</Text>
            <View style={styles.selectBox}>
              <Text style={styles.selectText}>{department}</Text>
              <Text style={styles.selectArrow}>â–¾</Text>
            </View>
          </View>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Purpose</Text>
            <View style={styles.selectBox}>
              <Text style={styles.selectText}>{purpose}</Text>
              <Text style={styles.selectArrow}>â–¾</Text>
            </View>
          </View>
        </View>

        <Text style={styles.fieldLabel}>Destination</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputIcon}>ðŸ“</Text>
          <TextInput
            style={styles.input}
            placeholder="Project Site / Warehouse / Client"
            placeholderTextColor={Colors.outlineVariant}
            value={destination}
            onChangeText={setDestination}
          />
        </View>

        <Text style={styles.fieldLabel}>Expected Return Date</Text>
        <View style={styles.inputRow}>
          <Text style={styles.inputIcon}>ðŸ“…</Text>
          <TextInput
            style={styles.input}
            placeholder="Select date"
            placeholderTextColor={Colors.outlineVariant}
            value={returnDate}
            onChangeText={setReturnDate}
          />
        </View>

        <Text style={styles.fieldLabel}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Additional details, condition notes..."
          placeholderTextColor={Colors.outlineVariant}
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
        />

        <View style={styles.infoBanner}>
          <Text style={styles.infoIcon}>â„¹ï¸</Text>
          <Text style={styles.infoText}>
            Ensure asset is calibrated and battery level is above 80% before finalizing check-out.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {submitError && (
          <Text style={styles.errorText}>{submitError}</Text>
        )}
        <TouchableOpacity
          style={[styles.confirmBtn, processing && styles.confirmBtnProcessing]}
          onPress={handleConfirm}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <Text style={styles.confirmBtnText}>âœ“ Confirm Check-Out</Text>
          )}
        </TouchableOpacity>
      </View>
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
  backArrow: { fontSize: 22, color: Colors.primary },
  topTitle: { fontSize: 20, fontWeight: '600', color: Colors.primary },
  notifBtn: { padding: 8 },
  notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryContainer },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.05,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  assetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '4D',
    gap: 16,
  },
  assetIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.primary + '1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetIconText: { fontSize: 28 },
  assetInfo: { flex: 1 },
  assetName: { fontSize: 18, fontWeight: '600', color: Colors.onSurface },
  assetId: { fontSize: 14, color: Colors.onSurfaceVariant, marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  statusText: { fontSize: 12, fontWeight: '600', color: Colors.primary, letterSpacing: 0.05 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.05,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    gap: 12,
  },
  inputIcon: { fontSize: 18 },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.onSurface,
    padding: 0,
  },
  textarea: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  gridRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  halfField: { flex: 1 },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  selectText: { fontSize: 16, color: Colors.onSurface },
  selectArrow: { fontSize: 16, color: Colors.outlineVariant },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.primary + '0D',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '1A',
  },
  infoIcon: { fontSize: 18 },
  infoText: { flex: 1, fontSize: 14, color: Colors.primary, lineHeight: 20 },
  errorText: { color: Colors.error, fontSize: 14, textAlign: 'center', marginBottom: 8 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 0.5,
    borderTopColor: Colors.outlineVariant + '33',
  },
  confirmBtn: {
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
  confirmBtnProcessing: { opacity: 0.8 },
  confirmBtnText: { color: Colors.onPrimary, fontSize: 18, fontWeight: '600' },
});
