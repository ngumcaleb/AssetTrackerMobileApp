import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch } from '@/hooks/useFetch';
import { Category, PaginatedResponse } from '@/types/api';

export default function CategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const { data: categoriesData, loading, error } = useFetch<PaginatedResponse<Category>>({
    endpoint: '/api/categories',
  });

  const categories = categoriesData?.data ?? [];

  const filtered = categories.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn}>
            <View style={styles.menuIcon}>
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </View>
          </TouchableOpacity>
          <Text style={styles.topTitle}>ScanTrack</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn}>
            <View style={styles.menuIcon}>
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </View>
          </TouchableOpacity>
          <Text style={styles.topTitle}>ScanTrack</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn}>
          <View style={styles.menuIcon}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </View>
        </TouchableOpacity>
        <Text style={styles.topTitle}>ScanTrack</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.screenTitle}>Category Management</Text>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>ðŸ”</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search categories..."
            placeholderTextColor={Colors.outlineVariant}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.categoryList}>
          {filtered.map((cat) => {
            return (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() => {}}
              >
                <View style={styles.cardLeft}>
                  <View style={[styles.cardIcon, { backgroundColor: Colors.primary + '1A' }]}>
                    <Text style={styles.cardIconText}>{cat.icon || 'ðŸ“¦'}</Text>
                  </View>
                  <View>
                    <Text style={styles.cardName}>{cat.name}</Text>
                    <Text style={styles.cardCount}>{cat.assets_count ?? 0} Total Assets</Text>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.chevron}>â€º</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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
  iconBtn: { padding: 8 },
  menuIcon: { gap: 3 },
  menuLine: { width: 18, height: 2, backgroundColor: Colors.onSurfaceVariant, borderRadius: 1 },
  topTitle: { fontSize: 20, fontWeight: '600', color: Colors.primary },
  notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryContainer },
  content: { padding: 16 },
  screenTitle: { fontSize: 20, fontWeight: '600', color: Colors.onSurface, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12, paddingHorizontal: 16, height: 48, marginBottom: 20, gap: 8,
  },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, fontSize: 16, color: Colors.onSurface, padding: 0 },
  categoryList: { gap: 12 },
  categoryCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12,
    elevation: 3, borderWidth: 1, borderColor: Colors.outlineVariant + '33',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  cardIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardIconText: { fontSize: 24 },
  cardName: { fontSize: 18, fontWeight: '600', color: Colors.onSurface },
  cardCount: { fontSize: 14, color: Colors.onSurfaceVariant, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  chevron: { fontSize: 20, color: Colors.outlineVariant },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.05 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, color: Colors.error, textAlign: 'center' },
  fab: {
    position: 'absolute', right: 16, bottom: 100, width: 56, height: 56,
    borderRadius: 16, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primaryContainer, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 20, elevation: 8,
  },
  fabIcon: { fontSize: 28, color: Colors.onPrimary, fontWeight: '300' },
});
