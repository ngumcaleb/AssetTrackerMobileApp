import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  icon: string;
  archiveDate: string;
  reason: 'Irreparable Damage' | 'Decommissioned' | 'Lost' | 'Replaced';
}

const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Dell OptiPlex 7090',
    serialNumber: 'SN-DELL-2024-0847',
    icon: 'ðŸ’»',
    archiveDate: 'Jan 15, 2025',
    reason: 'Irreparable Damage',
  },
  {
    id: '2',
    name: 'HP LaserJet Pro M404',
    serialNumber: 'SN-HP-2023-1293',
    icon: 'ðŸ–¨ï¸',
    archiveDate: 'Mar 02, 2025',
    reason: 'Decommissioned',
  },
  {
    id: '3',
    name: 'Cisco Catalyst 2960',
    serialNumber: 'SN-CISCO-2022-0561',
    icon: 'ðŸŒ',
    archiveDate: 'Nov 18, 2024',
    reason: 'Replaced',
  },
  {
    id: '4',
    name: 'APC Smart-UPS 1500',
    serialNumber: 'SN-APC-2021-0038',
    icon: 'ðŸ”‹',
    archiveDate: 'Feb 28, 2025',
    reason: 'Irreparable Damage',
  },
  {
    id: '5',
    name: 'Logitech Rally Camera',
    serialNumber: 'SN-LOGI-2023-0774',
    icon: 'ðŸ“·',
    archiveDate: 'Dec 05, 2024',
    reason: 'Lost',
  },
  {
    id: '6',
    name: 'Lenovo ThinkPad T480',
    serialNumber: 'SN-LEN-2020-0192',
    icon: 'ðŸ’»',
    archiveDate: 'Apr 10, 2025',
    reason: 'Decommissioned',
  },
];

const stats = [
  { label: 'Total', value: '128', bg: Colors.surfaceContainerHigh, textColor: Colors.primary },
  { label: 'Damaged', value: '42', bg: Colors.errorContainer, textColor: Colors.onErrorContainer },
  { label: 'Expired', value: '86', bg: Colors.surfaceContainerHigh, textColor: Colors.onSurfaceVariant },
];

function getReasonStyle(reason: Asset['reason']) {
  switch (reason) {
    case 'Irreparable Damage':
    case 'Lost':
      return { bg: Colors.errorContainer, text: Colors.onErrorContainer };
    case 'Decommissioned':
    case 'Replaced':
    default:
      return { bg: Colors.surfaceContainerHigh, text: Colors.onSurfaceVariant };
  }
}

export default function AssetsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredAssets = mockAssets.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderCard = ({ item }: { item: Asset }) => {
    const reasonStyle = getReasonStyle(item.reason);
    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>{item.icon}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardSerial}>{item.serialNumber}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardDate}>{item.archiveDate}</Text>
            <View style={[styles.reasonBadge, { backgroundColor: reasonStyle.bg }]}>
              <Text style={[styles.reasonText, { color: reasonStyle.text }]}>{item.reason}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.restoreBtn} activeOpacity={0.7}>
          <Text style={styles.restoreBtnIcon}>â†»</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.menuIcon}>â˜°</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>ScanTrack</Text>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.bellIcon}>ðŸ””</Text>
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredAssets}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        ListHeaderComponent={
          <>
            {/* Search Bar */}
            <View style={styles.searchRow}>
              <View style={styles.searchInput}>
                <Text style={styles.searchIcon}>ðŸ”</Text>
                <TextInput
                  style={styles.searchTextInput}
                  placeholder="Search archived assets..."
                  placeholderTextColor={Colors.outline}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
                <Text style={styles.filterIcon}>âš™</Text>
              </TouchableOpacity>
            </View>

            {/* Header Section */}
            <Text style={styles.screenTitle}>Archived Assets</Text>
            <Text style={styles.screenSubtitle}>
              Manage decommissioned inventory and historical logs.
            </Text>

            {/* Stats Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsRow}
            >
              {stats.map((stat) => (
                <View key={stat.label} style={[styles.statChip, { backgroundColor: stat.bg }]}>
                  <Text style={[styles.statValue, { color: stat.textColor }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: stat.textColor }]}>{stat.label}</Text>
                </View>
              ))}
            </ScrollView>

            <Text style={styles.listHeader}>All Archived</Text>
          </>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push('/register-asset')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 22,
    color: Colors.onSurface,
  },
  bellIcon: {
    fontSize: 20,
    color: Colors.onSurface,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchTextInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.onSurface,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    fontSize: 18,
    color: Colors.onPrimaryContainer,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.onBackground,
    paddingHorizontal: 16,
    marginTop: 18,
  },
  screenSubtitle: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  statsRow: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 10,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  listHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onBackground,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  listContent: {
    paddingBottom: 100,
  },
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
  cardLeft: {
    marginRight: 12,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconText: {
    fontSize: 20,
  },
  cardBody: {
    flex: 1,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  cardSerial: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  cardDate: {
    fontSize: 11,
    color: Colors.outline,
  },
  reasonBadge: {
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  reasonText: {
    fontSize: 10,
    fontWeight: '600',
  },
  restoreBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  restoreBtnIcon: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: Colors.onPrimaryContainer,
    fontWeight: '300',
    marginTop: -1,
  },
});
