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
import { useMutation } from '@/hooks/useFetch';

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'];

export default function CheckinAssetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    checkoutId?: string;
    assetName?: string;
    assetTag?: string;
  }>();

  const [condition, setCondition] = useState('Excellent');
  const [notes, setNotes] = useState('');

  const { execute: returnAsset, loading: processing, error: submitError } = useMutation(
    'POST',
    `/api/checkouts/${params.checkoutId}/return`
  );

  const handleConfirm = async () => {
    if (!params.checkoutId) {
      Alert.alert('Error', 'No checkout specified for return.');
      return;
    }
    try {
      await returnAsset({
        return_notes: `[${condition}] ${notes}`.trim(),
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', submitError || 'Failed to check in asset. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>â†</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Check-In Asset</Text>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.assetCard}>
          <View style={styles.assetImagePlaceholder}>
            <Text style={styles.assetImageIcon}> drone</Text>
          </View>
          <View style={styles.assetInfo}>
            <Text style={styles.assetLabel}>Active Rental</Text>
            <Text style={styles.assetName}>{params.assetName || 'Unknown Asset'}</Text>
            <Text style={styles.assetId}>ID: {params.assetTag || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Asset Condition</Text>
          <Text style={styles.sectionDesc}>How would you describe the state of the asset?</Text>
          <View style={styles.conditionGrid}>
            {CONDITIONS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.conditionChip,
                  condition === c && styles.conditionChipActive,
                ]}
                onPress={() => setCondition(c)}
              >
                <Text
                  style={[
                    styles.conditionText,
                    condition === c && styles.conditionTextActive,
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Damage / Notes</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Describe any wear, tear, or technical issues encountered..."
            placeholderTextColor={Colors.outlineVariant}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.photoHeader}>
            <Text style={styles.sectionTitle}>Upload Photos</Text>
            <Text style={styles.photoCount}>0 / 4 images</Text>
          </View>
          <View style={styles.photoGrid}>
            <TouchableOpacity style={styles.photoAdd}>
              <Text style={styles.photoAddIcon}>ðŸ“·</Text>
              <Text style={styles.photoAddText}>Add</Text>
            </TouchableOpacity>
            <View style={styles.photoPlaceholder} />
            <View style={styles.photoPlaceholder} />
            <View style={styles.photoPlaceholder} />
          </View>
          <Text style={styles.photoHint}>
            Required: At least one photo of the device serial number and physical state.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {submitError && (
          <Text style={styles.errorText}>{submitError}</Text>
        )}
        <TouchableOpacity
          style={[styles.confirmBtn, processing && { opacity: 0.8 }]}
          onPress={handleConfirm}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <Text style={styles.confirmBtnText}>âœ“ Confirm Check-In</Text>
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
  backArrow: { fontSize: 22, color: Colors.onSurface },
  topTitle: { fontSize: 20, fontWeight: '600', color: Colors.primary },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 12, fontWeight: '600', color: Colors.onSurfaceVariant },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 120 },
  assetCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '4D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    gap: 16,
  },
  assetImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetImageIcon: { fontSize: 28 },
  assetInfo: { flex: 1, justifyContent: 'center' },
  assetLabel: { fontSize: 12, fontWeight: '600', color: Colors.primary, letterSpacing: 0.05, textTransform: 'uppercase' },
  assetName: { fontSize: 18, fontWeight: '600', color: Colors.onSurface, marginTop: 2 },
  assetId: { fontSize: 14, color: Colors.outline, marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: Colors.outline, letterSpacing: 0.05, textTransform: 'uppercase', marginBottom: 8 },
  sectionDesc: { fontSize: 14, color: Colors.onSurfaceVariant, marginBottom: 12 },
  conditionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  conditionChip: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
  },
  conditionChipActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primaryContainer,
  },
  conditionText: { fontSize: 16, color: Colors.onSurface },
  conditionTextActive: { color: Colors.onPrimaryContainer, fontWeight: '500' },
  textarea: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 100,
    fontSize: 16,
    color: Colors.onSurface,
    textAlignVertical: 'top',
  },
  photoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  photoCount: { fontSize: 14, color: Colors.outline },
  photoGrid: { flexDirection: 'row', gap: 12, marginTop: 8 },
  photoAdd: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
  },
  photoAddIcon: { fontSize: 20 },
  photoAddText: { fontSize: 10, fontWeight: '700', color: Colors.primary, textTransform: 'uppercase' },
  photoPlaceholder: {
    flex: 1,
    height: 72,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainer + '4D',
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '4D',
  },
  photoHint: { fontSize: 14, color: Colors.onSurfaceVariant, fontStyle: 'italic', marginTop: 8 },
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
  confirmBtnText: { color: Colors.onPrimary, fontSize: 18, fontWeight: '600' },
});
