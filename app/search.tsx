import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import type { PaginatedResponse, Asset } from '@/types/api';

const FILTERS = ['All Results', 'Assets'];

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All Results');
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const searchParams: Record<string, string | number | undefined> = {};
  if (debouncedQuery.trim()) searchParams.search = debouncedQuery.trim();
  if (activeFilter === 'Assets') searchParams.status = 'active';

  const { data, loading } = useFetch<PaginatedResponse<Asset>>({
    endpoint: '/api/assets',
    params: searchParams,
  });

  const results = data?.data ?? [];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#E6F4EA', text: '#1E8E3E' };
      case 'checked_out': return { bg: '#FCE8E6', text: '#D93025' };
      case 'archived': return { bg: '#E8F0FE', text: '#1A73E8' };
      default: return { bg: Colors.surfaceContainerHigh, text: Colors.outline };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'checked_out': return 'Checked Out';
      case 'archived': return 'Archived';
      default: return status;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Text style={{ fontSize: 22, color: Colors.onSurface }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Search</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
          <Text style={{ fontSize: 18 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search assets, IDs, or users..."
              placeholderTextColor={Colors.outlineVariant}
              value={query}
              onChangeText={setQuery}
            />
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearBtn}>✖</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.resultCount}>
          Showing {results.length} results for "<Text style={{ fontWeight: '700' }}>{debouncedQuery || 'all assets'}</Text>"
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 32 }} />
        ) : results.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 48 }}>
            <Text style={{ fontSize: 16, color: Colors.onSurfaceVariant }}>No results found</Text>
          </View>
        ) : (
          results.map((item) => {
            const ss = getStatusStyle(item.status);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.resultCard}
                onPress={() => router.push({ pathname: '/asset-detail', params: { id: String(item.id) } })}
              >
                <View style={styles.resultImage}>
                  <Text style={styles.resultImageIcon}>📦</Text>
                </View>
                <View style={styles.resultInfo}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultName}>{item.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: ss.bg }]}>
                      <Text style={[styles.statusText, { color: ss.text }]}>{getStatusLabel(item.status)}</Text>
                    </View>
                  </View>
                  <Text style={styles.resultSerial}>SN: {item.serial}</Text>
                  <View style={styles.resultMeta}>
                    <Text style={styles.metaItem}>📍 {item.location ?? 'No location'}</Text>
                    <Text style={styles.metaItem}>🏷 {item.asset_tag}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
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
  searchContainer: { marginBottom: 16 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12, paddingHorizontal: 16, height: 56, gap: 12,
  },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, fontSize: 16, color: Colors.onSurface, padding: 0 },
  clearBtn: { fontSize: 18, color: Colors.onSurfaceVariant, padding: 4 },
  filters: { marginTop: 12 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  filterChipActive: { backgroundColor: Colors.primaryContainer },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.onSurfaceVariant, letterSpacing: 0.05 },
  filterTextActive: { color: Colors.onPrimaryContainer },
  resultCount: { fontSize: 14, color: Colors.onSurfaceVariant, marginBottom: 16 },
  resultCard: {
    flexDirection: 'row', backgroundColor: Colors.surfaceContainerLowest, borderRadius: 20,
    padding: 16, marginBottom: 12, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12,
    elevation: 3, borderWidth: 1, borderColor: Colors.outlineVariant + '33',
  },
  resultImage: {
    width: 80, height: 80, borderRadius: 16, backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  resultImageIcon: { fontSize: 32 },
  resultInfo: { flex: 1 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  resultName: { fontSize: 16, fontWeight: '600', color: Colors.onSurface, flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.05 },
  resultSerial: { fontSize: 14, color: Colors.onSurfaceVariant, marginTop: 4 },
  resultMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  metaItem: { fontSize: 12, color: Colors.outline },
});
