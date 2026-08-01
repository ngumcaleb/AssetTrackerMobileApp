import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch } from '@/hooks/useFetch';
import { CheckOut, PaginatedResponse } from '@/types/api';

type Tab = 'all' | 'active' | 'returned';

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'returned', label: 'Returned' },
];

export default function CheckOutsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, loading, error, refetch } = useFetch<PaginatedResponse<CheckOut>>({
    endpoint: '/api/checkouts',
    params: {
      status: tab === 'all' ? undefined : tab,
      search: debouncedSearch || undefined,
      per_page: 50,
    },
  });

  const checkouts = data?.data ?? [];

  const renderRow = ({ item }: { item: CheckOut }) => {
    const isReturned = !!item.returned_at;
    const statusBg = isReturned ? '#e6f9e6' : '#fef3c7';
    const statusText = isReturned ? '#16a34a' : '#d97706';
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push({ pathname: '/checkout-detail', params: { id: String(item.id) } })}
      >
        <View style={styles.cardIcon}>
          <Text style={styles.cardIconText}>{item.asset?.category?.icon ?? '📦'}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.asset?.name ?? 'Deleted Asset'}
          </Text>
          <Text style={styles.cardSerial}>{item.asset?.asset_tag ?? '—'}</Text>
          <Text style={styles.cardAssignee} numberOfLines={1}>
            To: {item.assignee_name}
          </Text>
          {item.department ? <Text style={styles.cardDept}>{item.department}</Text> : null}
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusText, { color: statusText }]}>{isReturned ? 'Returned' : 'Active'}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Check-Outs</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push('/search')}
        >
          <Text style={styles.newBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {loading && !data ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={checkouts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRow}
          ListHeaderComponent={
            <>
              <View style={styles.searchBar}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by asset name, tag or assignee..."
                  placeholderTextColor={Colors.outlineVariant}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <View style={styles.tabsRow}>
                {TABS.map((t) => {
                  const active = t.key === tab;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      style={[styles.tab, active && styles.tabActive]}
                      activeOpacity={0.7}
                      onPress={() => setTab(t.key)}
                    >
                      <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.listHeader}>
                {data?.meta.total ?? checkouts.length} check-out(s)
              </Text>
            </>
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No check-outs found.</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
  newBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  newBtnText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorText: { fontSize: 15, color: Colors.onErrorContainer, textAlign: 'center', marginBottom: 12 },
  retryBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryText: { fontSize: 14, fontWeight: '600', color: Colors.onPrimaryContainer },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginHorizontal: 16,
    marginTop: 14,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.onSurface, padding: 0 },
  tabsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginTop: 16 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: Colors.primaryContainer },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.onSurfaceVariant },
  tabTextActive: { color: Colors.onPrimaryContainer },
  listHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  listContent: { paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardIconText: { fontSize: 20 },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: Colors.onSurface },
  cardSerial: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  cardAssignee: { fontSize: 13, color: Colors.onSurface, marginTop: 6 },
  cardDept: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 1 },
  cardRight: { alignItems: 'flex-end', gap: 8, marginLeft: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  chevron: { fontSize: 20, color: Colors.outline, fontWeight: '300' },
  emptyText: { fontSize: 15, color: Colors.onSurfaceVariant },
});
