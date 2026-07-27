import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CATEGORIES = [
  'Industrial Equipment',
  'IT Infrastructure',
  'Fleet Vehicles',
  'Office Furniture',
  'Manufacturing Tools',
];

export default function RegisterAssetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [price, setPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      router.push('/registration-success');
    }, 1500);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>â†</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Register Asset</Text>
        <TouchableOpacity style={styles.helpBtn}>
          <Text style={styles.helpIcon}>?</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.photoUpload}>
          <View style={styles.photoIconContainer}>
            <Text style={styles.photoIcon}>ðŸ“·</Text>
          </View>
          <Text style={styles.photoTitle}>Asset Photograph</Text>
          <Text style={styles.photoSubtitle}>
            High-resolution image of the physical asset or its identification plate.
          </Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Identity Details</Text>
          <Text style={styles.fieldLabel}>Asset Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Forklift X-200"
            placeholderTextColor={Colors.outlineVariant}
            value={name}
            onChangeText={setName}
          />
          <View style={styles.gridRow}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.selectBox}>
                <Text style={styles.selectText}>{category}</Text>
                <Text style={styles.selectArrow}>â–¾</Text>
              </View>
            </View>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Asset ID</Text>
              <View style={[styles.input, styles.readonlyInput]}>
                <Text style={styles.readonlyText}>AST-2024-0892</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Manufacturer Specs</Text>
          <View style={styles.gridRow}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Brand</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Caterpillar"
                placeholderTextColor={Colors.outlineVariant}
                value={brand}
                onChangeText={setBrand}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Model</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2023-F-Series"
                placeholderTextColor={Colors.outlineVariant}
                value={model}
                onChangeText={setModel}
              />
            </View>
          </View>
          <Text style={styles.fieldLabel}>Serial Number</Text>
          <View style={styles.serialRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="SN-XXXXXXXXXX"
              placeholderTextColor={Colors.outlineVariant}
              value={serial}
              onChangeText={setSerial}
            />
            <TouchableOpacity style={styles.scanBtn}>
              <Text style={styles.scanBtnIcon}>ðŸ“·</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Acquisition & Placement</Text>
          <View style={styles.gridRow}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Purchase Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.outlineVariant}
                value={purchaseDate}
                onChangeText={setPurchaseDate}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Purchase Price ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={Colors.outlineVariant}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
          </View>
          <Text style={styles.fieldLabel}>Supplier</Text>
          <TextInput
            style={styles.input}
            placeholder="Global Logistics Solutions"
            placeholderTextColor={Colors.outlineVariant}
            value={supplier}
            onChangeText={setSupplier}
          />
          <Text style={styles.fieldLabel}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Warehouse B, Bay 4"
            placeholderTextColor={Colors.outlineVariant}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Additional Documentation</Text>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Include special handling instructions, warranty terms..."
            placeholderTextColor={Colors.outlineVariant}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, processing && { opacity: 0.8 }]}
          onPress={handleSubmit}
          disabled={processing}
        >
          <Text style={styles.submitBtnText}>
            {processing ? 'â³ Registering...' : 'ðŸ“¦ Register Asset'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>
          By registering, this asset will be visible in the global inventory and tracking dashboard.
        </Text>
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
  backArrow: { fontSize: 22, color: Colors.primary },
  topTitle: { fontSize: 20, fontWeight: '600', color: Colors.primary },
  helpBtn: { padding: 8 },
  helpIcon: { fontSize: 20, color: Colors.onSurfaceVariant },
  scrollContent: { padding: 16, paddingBottom: 40 },
  photoUpload: {
    width: '100%', aspectRatio: 16 / 9, backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.outlineVariant,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  photoIconContainer: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primary + '1A',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  photoIcon: { fontSize: 28 },
  photoTitle: { fontSize: 18, fontWeight: '600', color: Colors.onSurfaceVariant },
  photoSubtitle: { fontSize: 14, color: Colors.outline, textAlign: 'center', marginTop: 4, paddingHorizontal: 32 },
  card: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 20, padding: 20,
    marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: Colors.outlineVariant + '33',
  },
  cardHeader: { fontSize: 12, fontWeight: '600', color: Colors.primary, letterSpacing: 0.1, textTransform: 'uppercase', marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.onSurfaceVariant, letterSpacing: 0.05, textTransform: 'uppercase', marginBottom: 6 },
  input: {
    backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 20, height: 48,
    fontSize: 16, color: Colors.onSurface, marginBottom: 12,
  },
  textarea: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
  gridRow: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  selectBox: {
    backgroundColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 20, height: 48,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12,
  },
  selectText: { fontSize: 16, color: Colors.onSurface },
  selectArrow: { fontSize: 16, color: Colors.outlineVariant },
  readonlyInput: { backgroundColor: Colors.surfaceContainerHigh, justifyContent: 'center' },
  readonlyText: { fontSize: 16, color: Colors.primary, fontWeight: '700' },
  serialRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scanBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  scanBtnIcon: { fontSize: 24 },
  submitBtn: {
    backgroundColor: Colors.primary, borderRadius: 28, height: 56, alignItems: 'center',
    justifyContent: 'center', marginBottom: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 8,
  },
  submitBtnText: { color: Colors.onPrimary, fontSize: 18, fontWeight: '600' },
  disclaimer: { fontSize: 14, color: Colors.outline, textAlign: 'center' },
});
