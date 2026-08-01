import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/services/api';

export default function CheckoutAssetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    assetId?: string;
    assetName?: string;
    assetTag?: string;
  }>();

  const [assignee, setAssignee] = useState('');
  const [department, setDepartment] = useState('');
  const [purpose, setPurpose] = useState('');
  const [destination, setDestination] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!params.assetId) {
      Alert.alert('No asset selected', 'Pick an asset first, then check it out.', [
        { text: 'Search Assets', onPress: () => router.replace('/search') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    if (!assignee.trim()) {
      Alert.alert('Assignee required', 'Enter who this asset is assigned to.');
      return;
    }
    setProcessing(true);
    try {
      await api.post('/api/checkouts', {
        asset_id: Number(params.assetId),
        assignee_name: assignee.trim(),
        department: department || undefined,
        purpose: purpose || undefined,
        destination: destination || undefined,
        expected_return: returnDate || undefined,
        notes: notes || undefined,
      });
      Alert.alert('Checked out', 'Asset checked out successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to check out asset.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Check Out</Text>
        <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications')}>
          <Text>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionLabel}>Asset</Text>
        <View style={styles.assetCard}>
          <View style={styles.assetInfo}>
            <Text style={styles.assetName}>{params.assetName || 'No asset selected'}</Text>
            <Text style={styles.assetId}>Tag: {params.assetTag || 'N/A'}</Text>
          </View>
          {!params.assetId ? (
            <TouchableOpacity onPress={() => router.push('/search')}>
              <Text style={styles.link}>Pick asset</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.fieldLabel}>Assign To *</Text>
        <TextInput
          style={styles.input}
          placeholder="Technician or employee name"
          placeholderTextColor={Colors.outline}
          value={assignee}
          onChangeText={setAssignee}
        />

        <Text style={styles.fieldLabel}>Department</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Engineering"
          placeholderTextColor={Colors.outline}
          value={department}
          onChangeText={setDepartment}
        />

        <Text style={styles.fieldLabel}>Purpose</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Site inspection"
          placeholderTextColor={Colors.outline}
          value={purpose}
          onChangeText={setPurpose}
        />

        <Text style={styles.fieldLabel}>Destination</Text>
        <TextInput
          style={styles.input}
          placeholder="Where is it going?"
          placeholderTextColor={Colors.outline}
          value={destination}
          onChangeText={setDestination}
        />

        <Text style={styles.fieldLabel}>Expected Return (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="2026-08-15"
          placeholderTextColor={Colors.outline}
          value={returnDate}
          onChangeText={setReturnDate}
        />

        <Text style={styles.fieldLabel}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Optional notes"
          placeholderTextColor={Colors.outline}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <TouchableOpacity
          style={[styles.submitBtn, processing && { opacity: 0.7 }]}
          onPress={handleConfirm}
          disabled={processing}
        >
          {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Confirm Check Out</Text>}
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
  notifBtn: { padding: 8 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.onSurfaceVariant, marginBottom: 8 },
  assetCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetInfo: { flex: 1 },
  assetName: { fontSize: 16, fontWeight: '600', color: Colors.onSurface },
  assetId: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 2 },
  link: { color: Colors.primary, fontWeight: '600' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainerLowest,
    marginBottom: 4,
  },
  textarea: { height: 90, textAlignVertical: 'top', paddingTop: 12 },
  submitBtn: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: Colors.onPrimary, fontSize: 16, fontWeight: '600' },
});
