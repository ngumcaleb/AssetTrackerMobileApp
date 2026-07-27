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

const MOCK_RESULTS = [
  { id: '1', name: 'Industrial Power Gen-X', serial: 'IND-990-2104', status: 'Active', location: 'North Wing, Floor 2', lastChecked: 'Checked 2h ago' },
  { id: '2', name: 'Industrial Hydraulic Press', serial: 'IND-042-9988', status: 'Maintenance', location: 'Main Lab', assignee: 'Marcus V.' },
  { id: '3', name: 'Industrial Filter Unit V8', serial: 'IND-881-3342', status: 'Standby', location: 'Roof Level 4', extra: '98% Efficiency' },
];

const FILTERS = ['All Results', 'Assets', 'Users', 'Locations'];

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('Industrial');
  const [activeFilter, setActiveFilter] = useState('All Results');

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active': return { bg: '#E6F4EA', text: '#1E8E3E' };
      case 'Maintenance': return { bg: '#FCE8E6', text: '#D93025' };
      case 'Standby': return { bg: '#E8F0FE', text: '#1A73E8' };
      default: return { bg: Colors.surfaceContainerHigh, text: Colors.outline };
    }
  };

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
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>ðŸ”</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search assets, IDs, or users..."
              placeholderTextColor={Colors.outlineVariant}
              value={query}
              onChangeText={setQuery}
            />
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearBtn}>âœ•</Text>
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
          Showing {MOCK_RESULTS.length} results for "<Text style={{ fontWeight: '700' }}>{query}</Text>"
        </Text>

        {MOCK_RESULTS.map((item) => {
          const ss = getStatusStyle(item.status);
          return (
            <TouchableOpacity key={item.id} style={styles.resultCard}>
              <View style={styles.resultImage}>
                <Text style={styles.resultImageIcon}>ðŸ“¦</Text>
              </View>
              <View style={styles.resultInfo}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: ss.bg }]}>
                    <Text style={[styles.statusText, { color: ss.text }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.resultSerial}>SN: {item.serial}</Text>
                <View style={styles.resultMeta}>
                  <Text style={styles.metaItem}>ðŸ“ {item.location}</Text>
                  {item.lastChecked && <Text style={styles.metaItem}>ðŸ• {item.lastChecked}</Text>}
                  {item.assignee && <Text style={styles.metaItem}>ðŸ‘¤ {item.assignee}</Text>}
                  {item.extra && <Text style={styles.metaItem}>ðŸ“ˆ {item.extra}</Text>}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
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
