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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch, useMutation } from '@/hooks/useFetch';
import { Category } from '@/types/api';

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
    } catch (e: any) {
      Alert.alert('Error', submitError || 'Failed to save category. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>{isEdit ? 'Edit Category' : 'New Category'}</Text>
        <View style={styles.spacer} />
      </View>

      {loading && isEdit ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Category Details</Text>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Office Equipment"
              placeholderTextColor={Colors.outlineVariant}
              value={name}
              onChangeText={setName}
            />
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="What belongs in this category?"
              placeholderTextColor={Colors.outlineVariant}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
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
                  trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primaryContainer }}
                  thumbColor={isActive ? Colors.primary : Colors.outline}
                />
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.8 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.onPrimary} />
            ) : (
              <Text style={styles.submitBtnText}>{isEdit ? 'Update Category' : 'Create Category'}</Text>
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  switchLabelWrap: { flex: 1, marginRight: 12 },
  switchHint: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    textTransform: 'none',
    letterSpacing: 0,
    fontWeight: '400',
    marginTop: 2,
  },
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
