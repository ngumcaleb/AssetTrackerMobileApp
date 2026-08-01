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
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { getInitials } from '@/utils/format';

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'];

export default function CheckinAssetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    checkoutId?: string;
    assetName?: string;
    assetTag?: string;
  }>();

  const [condition, setCondition] = useState('Good');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!params.checkoutId) {
      Alert.alert('Missing checkout', 'Open check-in from an asset that is currently checked out.');
      return;
    }
    setProcessing(true);
    try {
      const returnNotes = `[${condition}] ${notes}`.trim();
      await api.post(`/api/checkouts/${params.checkoutId}/return`, {
        return_notes: returnNotes,
      });
      Alert.alert('Checked in', 'Asset returned successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to check in asset.');
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
        <Text style={styles.topTitle}>Check In</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.assetCard}>
          <Text style={styles.assetName}>{params.assetName || 'Asset'}</Text>
          <Text style={styles.assetTag}>{params.assetTag || 'N/A'}</Text>
        </View>

        <Text style={styles.fieldLabel}>Condition on return</Text>
        <View style={styles.chips}>
          {CONDITIONS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, condition === c && styles.chipActive]}
              onPress={() => setCondition(c)}
            >
              <Text style={[styles.chipText, condition === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Return notes</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Optional notes about condition or issues"
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
          {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Confirm Check In</Text>}
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '700', color: Colors.onPrimaryContainer },
  content: { padding: 16, paddingBottom: 40 },
  assetCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  assetName: { fontSize: 17, fontWeight: '700', color: Colors.onSurface },
  assetTag: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant },
  chipTextActive: { color: Colors.onPrimary },
  input: {
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: Colors.onSurface,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  textarea: { height: 100, textAlignVertical: 'top', paddingTop: 12, marginBottom: 20 },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: Colors.onPrimary, fontSize: 16, fontWeight: '600' },
});
