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
  Image,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch, useMutation } from '@/hooks/useFetch';
import { api } from '@/services/api';
import { Asset, Category, PaginatedResponse } from '@/types/api';

const CONDITIONS = ['New', 'Good', 'Fair', 'Poor'];

export default function AssetEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [name, setName] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryLabel, setCategoryLabel] = useState('Select category');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [condition, setCondition] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [price, setPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { loading } = useFetch<Asset>({
    endpoint: `/api/assets/${id}`,
    onSuccess: (asset) => {
      setName(asset.name);
      setAssetTag(asset.asset_tag);
      setCategoryId(asset.category?.id ?? null);
      setCategoryLabel(asset.category?.name ?? 'Select category');
      setBrand(asset.brand ?? '');
      setModel(asset.model ?? '');
      setSerial(asset.serial ?? '');
      setCondition(asset.condition ?? '');
      setPurchaseDate(asset.purchase_date ?? '');
      setPrice(asset.purchase_price != null ? String(asset.purchase_price) : '');
      setSupplier(asset.supplier ?? '');
      setLocation(asset.location ?? '');
      setDescription(asset.description ?? '');
      setPhotoPreview(asset.photo_url);
    },
  });

  const { data: categoriesData } = useFetch<PaginatedResponse<Category>>({
    endpoint: '/api/categories',
  });
  const categories = categoriesData?.data ?? [];

  const { execute: updateAsset, loading: submitting, error: submitError } = useMutation(
    'PUT',
    `/api/assets/${id}`
  );

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
      setPhotoPreview(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload: Record<string, any> = {
        name,
        category_id: categoryId ?? undefined,
        brand,
        model,
        serial,
        condition,
        purchase_date: purchaseDate || undefined,
        purchase_price: price ? parseFloat(price) : undefined,
        supplier,
        location,
        description,
      };

      if (photoUri) {
        // PHP only populates uploaded files on POST — use multipart update route.
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            formData.append(key, String(value));
          }
        });
        const ext = (photoUri.split('.').pop() ?? 'jpg').toLowerCase();
        const mime = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
        formData.append('photo', { uri: photoUri, name: `photo.${ext}`, type: mime } as any);
        await api.request(`/api/assets/${id}/update`, { method: 'POST', body: formData, isFormData: true });
      } else {
        await updateAsset(payload);
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Error', submitError || 'Failed to update asset. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Edit Asset</Text>
        <View style={styles.spacer} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.photoUpload} onPress={handlePickPhoto}>
            {photoPreview ? (
              <Image source={{ uri: photoPreview }} style={styles.photoPreview} resizeMode="cover" />
            ) : (
              <View style={styles.photoIconContainer}>
                <Text style={styles.photoIcon}>📷</Text>
                <Text style={styles.photoTitle}>Asset Photograph</Text>
                <Text style={styles.photoSubtitle}>
                  Tap to change the photo of this asset.
                </Text>
              </View>
            )}
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
            <Text style={styles.fieldLabel}>Asset Tag (auto-generated)</Text>
            <View style={[styles.input, styles.readonlyInput]}>
              <Text style={styles.readonlyText}>{assetTag || '—'}</Text>
            </View>
            <Text style={styles.fieldLabel}>Category</Text>
            <TouchableOpacity
              style={styles.selectBox}
              onPress={() => {
                if (categories.length > 0) {
                  Alert.alert(
                    'Select Category',
                    '',
                    categories.map((c) => ({
                      text: c.name,
                      onPress: () => {
                        setCategoryId(c.id);
                        setCategoryLabel(c.name);
                      },
                    }))
                  );
                }
              }}
            >
              <Text style={styles.selectText}>{categoryLabel}</Text>
              <Text style={styles.selectArrow}>▾</Text>
            </TouchableOpacity>
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
            <TextInput
              style={styles.input}
              placeholder="SN-XXXXXXXXXX"
              placeholderTextColor={Colors.outlineVariant}
              value={serial}
              onChangeText={setSerial}
            />
            <Text style={styles.fieldLabel}>Condition</Text>
            <TouchableOpacity
              style={styles.selectBox}
              onPress={() =>
                Alert.alert(
                  'Select Condition',
                  '',
                  CONDITIONS.map((c) => ({
                    text: c,
                    onPress: () => setCondition(c),
                  }))
                )
              }
            >
              <Text style={styles.selectText}>{condition || 'Select condition'}</Text>
              <Text style={styles.selectArrow}>▾</Text>
            </TouchableOpacity>
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
            style={[styles.submitBtn, submitting && { opacity: 0.8 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.onPrimary} />
            ) : (
              <Text style={styles.submitBtnText}>Update Asset</Text>
            )}
          </TouchableOpacity>
          {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
        </ScrollView>
      )}
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
  spacer: { width: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  photoUpload: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  photoPreview: { width: '100%', height: '100%' },
  photoIconContainer: { alignItems: 'center' },
  photoIcon: { fontSize: 28, marginBottom: 8 },
  photoTitle: { fontSize: 18, fontWeight: '600', color: Colors.onSurfaceVariant },
  photoSubtitle: {
    fontSize: 14,
    color: Colors.outline,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.outlineVariant + '33',
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.05,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 48,
    fontSize: 16,
    color: Colors.onSurface,
    marginBottom: 12,
  },
  textarea: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
  gridRow: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  selectBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  selectText: { fontSize: 16, color: Colors.onSurface },
  selectArrow: { fontSize: 16, color: Colors.outlineVariant },
  readonlyInput: {
    backgroundColor: Colors.surfaceContainerHigh,
    justifyContent: 'center',
  },
  readonlyText: { fontSize: 16, color: Colors.primary, fontWeight: '700' },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  submitBtnText: { color: Colors.onPrimary, fontSize: 18, fontWeight: '600' },
  errorText: { color: Colors.error, fontSize: 14, textAlign: 'center', marginBottom: 12 },
});
