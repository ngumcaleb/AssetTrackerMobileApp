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
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch } from '@/hooks/useFetch';
import { api } from '@/services/api';
import { Category, PaginatedResponse, Asset } from '@/types/api';

const BRAND       = '#800020';
const BRAND_DARK  = '#4a0012';

const softShadow = Platform.select({
  ios:     { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 2 },
  web:     { boxShadow: '0 2px 14px rgba(15, 23, 42, 0.07)' },
});

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
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* ── App Bar ────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Register Asset</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* ── Hero Band ─────────────────────────────────────── */}
        <LinearGradient
          colors={['#4a0012', '#800020', '#8a0d28']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={[styles.decorOrb, styles.decorOrbA]} />
          <View style={[styles.decorOrb, styles.decorOrbB]} />

          <Text style={styles.heroEyebrow}>NEW ASSET</Text>
          <Text style={styles.heroTitle}>Register Asset</Text>
          <Text style={styles.heroSubtitle}>
            Add a new asset to your inventory with its details.
          </Text>
        </LinearGradient>

        {/* ── Photo Upload (overlapping the band) ───────────── */}
        <TouchableOpacity style={styles.photoUpload} activeOpacity={0.85} onPress={pickPhoto}>
          {photoUri ? (
            <>
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
              <View style={styles.photoEditBadge}>
                <Ionicons name="camera-outline" size={14} color="#fff" />
                <Text style={styles.photoEditText}>Change</Text>
              </View>
            </>
          ) : (
            <View style={styles.photoPlaceholder}>
              <View style={styles.photoIconWrap}>
                <Ionicons name="camera-outline" size={26} color={BRAND} />
              </View>
              <Text style={styles.photoTitle}>Asset Photograph</Text>
              <Text style={styles.photoSubtitle}>Tap to add a photo (optional)</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ── Identity Details ──────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Identity Details</Text>

          <Text style={styles.fieldLabel}>Asset Name *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Forklift X-200" placeholderTextColor="#94a3b8" selectionColor={BRAND} />

          <Text style={styles.fieldLabel}>Category *</Text>
          <TouchableOpacity style={styles.select} activeOpacity={0.7} onPress={pickCategory}>
            <Text style={[styles.selectText, !categoryId && styles.selectPlaceholder]}>
              {categoriesLoading ? 'Loading…' : categoryLabel}
            </Text>
            <Ionicons name="chevron-down" size={17} color="#94a3b8" />
          </TouchableOpacity>

          <Text style={styles.fieldLabel}>Serial Number *</Text>
          <TextInput style={styles.input} value={serial} onChangeText={setSerial} placeholder="Unique serial" placeholderTextColor="#94a3b8" autoCapitalize="characters" selectionColor={BRAND} />

          <View style={styles.gridRow}>
            <View style={styles.half}>
              <Text style={styles.fieldLabel}>Brand</Text>
              <TextInput style={styles.input} value={brand} onChangeText={setBrand} placeholderTextColor="#94a3b8" placeholder="Brand" selectionColor={BRAND} />
            </View>
            <View style={styles.half}>
              <Text style={styles.fieldLabel}>Model</Text>
              <TextInput style={styles.input} value={model} onChangeText={setModel} placeholderTextColor="#94a3b8" placeholder="Model" selectionColor={BRAND} />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Purchase Date (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={purchaseDate} onChangeText={setPurchaseDate} placeholder="2024-01-15" placeholderTextColor="#94a3b8" selectionColor={BRAND} />

          <Text style={styles.fieldLabel}>Purchase Price</Text>
          <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="#94a3b8" selectionColor={BRAND} />

          <Text style={styles.fieldLabel}>Supplier</Text>
          <TextInput style={styles.input} value={supplier} onChangeText={setSupplier} placeholderTextColor="#94a3b8" placeholder="Supplier" selectionColor={BRAND} />

          <Text style={styles.fieldLabel}>Location</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholderTextColor="#94a3b8" placeholder="Warehouse A" selectionColor={BRAND} />

          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            placeholderTextColor="#94a3b8"
            placeholder="Notes"
            selectionColor={BRAND}
          />
        </View>

        {/* ── Submit ────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.submitWrap}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#66001a', '#800020', '#8a0d28']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.submitBtn, submitting && { opacity: 0.8 }]}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.submitText}>Register Asset</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f4f4' },

  // ── App Bar ─────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 3 },
      web: { boxShadow: '0 1px 6px rgba(15, 23, 42, 0.06)' },
    }),
  },
  topTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', letterSpacing: -0.2 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f8f4f4', alignItems: 'center', justifyContent: 'center' },
  spacer: { width: 38 },

  // ── Hero Band ───────────────────────────────────────────
  hero: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  decorOrb: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)' },
  decorOrbA: { top: -50, right: -40, width: 190, height: 190 },
  decorOrbB: { bottom: -70, left: -40, width: 160, height: 160 },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#fff',
    marginBottom: 4,
  },
  heroSubtitle: { fontSize: 13.5, color: 'rgba(255,255,255,0.72)' },

  // ── Photo Upload ────────────────────────────────────────
  photoUpload: {
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 20,
    backgroundColor: '#fff',
    minHeight: 150,
    overflow: 'hidden',
    ...softShadow,
  },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center', paddingVertical: 28 },
  photoIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#fde6e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  photoTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  photoSubtitle: { fontSize: 12.5, color: '#94a3b8', marginTop: 3 },
  photoPreview: { width: '100%', height: 170 },
  photoEditBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(74, 0, 18, 0.85)',
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  photoEditText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // ── Form ────────────────────────────────────────────────
  scrollContent: { paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 16,
    ...softShadow,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f8f4f4',
    borderWidth: 1,
    borderColor: '#efe7e7',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
    color: '#0f172a',
  },
  textarea: { height: 100, paddingTop: 13, paddingBottom: 13 },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f4f4',
    borderWidth: 1,
    borderColor: '#efe7e7',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
  },
  selectText: { fontSize: 15, color: '#0f172a', fontWeight: '600' },
  selectPlaceholder: { color: '#94a3b8', fontWeight: '400' },
  gridRow: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },

  // ── Submit ──────────────────────────────────────────────
  submitWrap: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    ...Platform.select({
      ios: { shadowColor: BRAND_DARK, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 10 },
      android: { elevation: 6 },
      web: { boxShadow: '0 8px 20px rgba(74, 0, 18, 0.35)' },
    }),
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 16,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
