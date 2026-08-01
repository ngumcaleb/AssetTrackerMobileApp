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
  Switch,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch, useMutation } from '@/hooks/useFetch';
import { Category } from '@/types/api';

const BRAND = '#800020';

const softShadow = Platform.select({
  ios:     { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 2 },
  web:     { boxShadow: '0 2px 14px rgba(15, 23, 42, 0.07)' },
});

export default function CategoryFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const { loading } = useFetch<Category>({
    endpoint: `/api/categories/${id}`,
    enabled: isEdit,
    onSuccess: (category) => {
      setName(category.name);
      setDescription(category.description ?? '');
      setIsActive(category.is_active);
    },
  });

  const { execute: saveCategory, loading: submitting, error: submitError } = useMutation(
    isEdit ? 'PUT' : 'POST',
    isEdit ? `/api/categories/${id}` : '/api/categories'
  );

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Category name is required.');
      return;
    }
    try {
      await saveCategory({
        name: name.trim(),
        description: description.trim() || undefined,
        is_active: isEdit ? isActive : undefined,
      });
      router.back();
    } catch {
      Alert.alert('Error', submitError || 'Failed to save category. Please try again.');
    }
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── App Bar ────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{isEdit ? 'Edit Category' : 'New Category'}</Text>
        <View style={styles.spacer} />
      </View>

      {loading && isEdit ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={BRAND} />
          <Text style={styles.loadingText}>Loading category…</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* ── Hero Band ─────────────────────────────────────── */}
          <LinearGradient
            colors={['#4a0012', '#800020', '#8a0d28']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={[styles.decorOrb, styles.decorOrbA]} />
            <View style={[styles.decorOrb, styles.decorOrbB]} />

            <Text style={styles.heroEyebrow}>CATEGORY</Text>
            <Text style={styles.heroTitle}>{isEdit ? 'Edit Category' : 'New Category'}</Text>
            <Text style={styles.heroSubtitle}>
              {isEdit
                ? 'Update the name and details of this category.'
                : 'Add a new category to keep your inventory organized.'}
            </Text>
          </LinearGradient>

          {/* ── Form Card ────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Category Details</Text>

            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Office Equipment"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
              selectionColor={BRAND}
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="What belongs in this category?"
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              selectionColor={BRAND}
            />

            {isEdit ? (
              <View style={styles.switchRow}>
                <View style={styles.switchLabelWrap}>
                  <Text style={styles.fieldLabel}>Active</Text>
                  <Text style={styles.switchHint}>Inactive categories are hidden from asset forms</Text>
                </View>
                <Switch
                  value={isActive}
                  onValueChange={setIsActive}
                  trackColor={{ false: '#e2e8f0', true: '#fbd0d0' }}
                  thumbColor={isActive ? BRAND : '#94a3b8'}
                />
              </View>
            ) : null}
          </View>

          {/* ── Submit ───────────────────────────────────────── */}
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
                  <Ionicons
                    name={isEdit ? 'checkmark-circle-outline' : 'add-circle-outline'}
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.submitBtnText}>
                    {isEdit ? 'Update Category' : 'Create Category'}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
        </ScrollView>
      )}
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
    paddingBottom: 28,
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

  // ── Form ────────────────────────────────────────────────
  scrollContent: { paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginTop: -20,
    ...softShadow,
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 7,
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
    marginBottom: 16,
  },
  textarea: { height: 104, paddingTop: 13, paddingBottom: 13 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  switchLabelWrap: { flex: 1, marginRight: 12 },
  switchHint: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'none',
    letterSpacing: 0,
    fontWeight: '400',
    marginTop: 2,
  },

  // ── Submit ──────────────────────────────────────────────
  submitWrap: {
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    ...Platform.select({
      ios: { shadowColor: '#4a0012', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.35, shadowRadius: 10 },
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
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // ── States ──────────────────────────────────────────────
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  loadingText: { fontSize: 13, color: '#94a3b8', marginTop: 8 },
  errorText: { color: '#dc2626', fontSize: 14, textAlign: 'center', marginTop: 16, marginHorizontal: 16 },
});
