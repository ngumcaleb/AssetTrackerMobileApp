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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch } from '@/hooks/useFetch';
import { api } from '@/services/api';
import { Category, PaginatedResponse, Asset } from '@/types/api';

export default function RegisterAssetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryLabel, setCategoryLabel] = useState('Select category');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [price, setPrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: categoriesData, loading: categoriesLoading } = useFetch<PaginatedResponse<Category>>({
    endpoint: '/api/categories',
  });
  const categories = categoriesData?.data ?? [];

  const pickCategory = () => {
    if (!categories.length) {
      Alert.alert('No categories', 'Create a category first from More → Categories.');
      return;
    }
    Alert.alert(
      'Select Category',
      undefined,
      categories.map((c) => ({
        text: c.name,
        onPress: () => {
          setCategoryId(c.id);
          setCategoryLabel(c.name);
        },
      })).concat([{ text: 'Cancel', style: 'cancel' } as any])
    );
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !serial.trim() || !categoryId) {
      Alert.alert('Missing fields', 'Name, serial, and category are required.');
      return;
    }
    setSubmitting(true);
    try {
      let created: Asset;
      if (photoUri) {
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('serial', serial.trim());
        formData.append('category_id', String(categoryId));
        if (brand) formData.append('brand', brand);
        if (model) formData.append('model', model);
        if (purchaseDate) formData.append('purchase_date', purchaseDate);
        if (price) formData.append('purchase_price', price);
        if (supplier) formData.append('supplier', supplier);
        if (location) formData.append('location', location);
        if (description) formData.append('description', description);
        const ext = (photoUri.split('.').pop() ?? 'jpg').toLowerCase();
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
        formData.append('photo', { uri: photoUri, name: `photo.${ext}`, type: mime } as any);
        created = await api.post<Asset>('/api/assets', formData, true);
      } else {
        created = await api.post<Asset>('/api/assets', {
          name: name.trim(),
          serial: serial.trim(),
          category_id: categoryId,
          brand: brand || undefined,
          model: model || undefined,
          purchase_date: purchaseDate || undefined,
          purchase_price: price ? parseFloat(price) : undefined,
          supplier: supplier || undefined,
          location: location || undefined,
          description: description || undefined,
        });
      }

      router.replace({
        pathname: '/registration-success',
        params: {
          id: String(created.id),
          name: created.name,
          asset_tag: created.asset_tag,
          category: created.category?.name ?? categoryLabel,
          location: created.location ?? location,
          created_at: created.created_at,
        },
      });
    } catch (e: any) {
      const details = e?.errors
        ? Object.values(e.errors as Record<string, string[]>)
            .flat()
            .join('\n')
        : e?.message;
      Alert.alert('Error', details || 'Failed to register asset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Register Asset</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.photoUpload} onPress={pickPhoto}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          ) : (
            <>
              <Text style={styles.photoIcon}>📷</Text>
              <Text style={styles.photoTitle}>Asset Photograph</Text>
              <Text style={styles.photoSubtitle}>Tap to add a photo (optional)</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Identity Details</Text>
          <Text style={styles.fieldLabel}>Asset Name *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Forklift X-200" placeholderTextColor={Colors.outline} />

          <Text style={styles.fieldLabel}>Category *</Text>
          <TouchableOpacity style={styles.select} onPress={pickCategory}>
            <Text style={styles.selectText}>{categoriesLoading ? 'Loading…' : categoryLabel}</Text>
          </TouchableOpacity>

          <Text style={styles.fieldLabel}>Serial Number *</Text>
          <TextInput style={styles.input} value={serial} onChangeText={setSerial} placeholder="Unique serial" placeholderTextColor={Colors.outline} autoCapitalize="characters" />

          <View style={styles.gridRow}>
            <View style={styles.half}>
              <Text style={styles.fieldLabel}>Brand</Text>
              <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholderTextColor={Colors.outline} placeholder="Brand" />
            </View>
            <View style={styles.half}>
              <Text style={styles.fieldLabel}>Model</Text>
              <TextInput style={styles.input} value={model} onChangeText={setModel} placeholderTextColor={Colors.outline} placeholder="Model" />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Purchase Date (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={purchaseDate} onChangeText={setPurchaseDate} placeholder="2024-01-15" placeholderTextColor={Colors.outline} />

          <Text style={styles.fieldLabel}>Purchase Price</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={Colors.outline} />

          <Text style={styles.fieldLabel}>Supplier</Text>
          <TextInput style={styles.input} value={supplier} onChangeText={setSupplier} placeholderTextColor={Colors.outline} placeholder="Supplier" />

          <Text style={styles.fieldLabel}>Location</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholderTextColor={Colors.outline} placeholder="Warehouse A" />

          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            multiline
            placeholderTextColor={Colors.outline}
            placeholder="Notes"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Register Asset</Text>}
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
  scrollContent: { padding: 16, paddingBottom: 40 },
  photoUpload: {
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerHigh,
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  photoPreview: { width: '100%', height: 160 },
  photoIcon: { fontSize: 32, marginBottom: 8 },
  photoTitle: { fontSize: 16, fontWeight: '600', color: Colors.onSurface },
  photoSubtitle: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 4 },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: { fontSize: 14, fontWeight: '700', color: Colors.primary, marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    color: Colors.onSurface,
    backgroundColor: Colors.surface,
  },
  textarea: { height: 90, textAlignVertical: 'top', paddingTop: 12 },
  select: {
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  selectText: { color: Colors.onSurface },
  gridRow: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: Colors.onPrimary, fontSize: 16, fontWeight: '600' },
});
