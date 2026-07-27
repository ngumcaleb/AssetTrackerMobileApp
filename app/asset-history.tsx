import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TIMELINE = [
  { id: '1', type: 'location', title: 'Location Change', time: '2 HOURS AGO', desc: 'Moved from Warehouse A-12 to Manufacturing Floor (Bay 4)', user: 'Mike Chen', color: Colors.primary },
  { id: '2', type: 'maintenance', title: 'Maintenance Log', time: 'OCT 24, 09:15 AM', desc: 'Preventative maintenance completed. Replaced lens seal and recalibrated laser frequency.', color: '#F97316' },
  { id: '3', type: 'return', title: 'Return', time: 'OCT 22, 04:30 PM', desc: 'Returned by Sarah Smith. Asset inspected and cleared for general use.', color: Colors.secondary },
  { id: '4', type: 'checkout', title: 'Check-Out', time: 'OCT 18, 08:00 AM', desc: 'Assigned to John Doe for site deployment.', color: Colors.tertiary },
  { id: '5', type: 'registration', title: 'Registration', time: 'OCT 15, 11:20 AM', desc: 'Asset onboarded into ScanTrack system. Serial #9920-ABC-X.', color: Colors.outline },
];

export default function AssetHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>â†</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>ScanTrack</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.assetOverview}>
          <View style={styles.overviewIcon}>
            <Text style={styles.overviewIconText}>ðŸ­</Text>
          </View>
          <View style={styles.overviewInfo}>
            <Text style={styles.overviewId}>Asset ID: #STR-9920</Text>
            <Text style={styles.overviewName}>High-Precision Laser Welder</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Active</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Asset Lifecycle</Text>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timeline}>
          {TIMELINE.map((item, index) => (
            <View key={item.id} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, { backgroundColor: item.color }]}>
                  <View style={styles.timelineDotInner} />
                </View>
                {index < TIMELINE.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineTitle}>{item.title}</Text>
                  <Text style={styles.timelineTime}>{item.time}</Text>
                </View>
                <View style={styles.timelineCard}>
                  <Text style={styles.timelineDesc}>{item.desc}</Text>
                  {item.user && (
                    <View style={styles.userRow}>
                      <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>{item.user[0]}</Text>
                      </View>
                      <Text style={styles.userName}>Updated by {item.user}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  backBtn: { padding: 8 }, backArrow: { fontSize: 22, color: Colors.primary },
  topTitle: { fontSize: 20, fontWeight: '600', color: Colors.primary },
  iconBtn: { padding: 8 }, notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryContainer },
  content: { padding: 16 },
  assetOverview: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20, padding: 16, gap: 16, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12,
    elevation: 3, borderWidth: 1, borderColor: Colors.outlineVariant + '4D',
  },
  overviewIcon: { width: 64, height: 64, borderRadius: 16, backgroundColor: Colors.primary + '1A', alignItems: 'center', justifyContent: 'center' },
  overviewIconText: { fontSize: 28 },
  overviewInfo: { flex: 1 },
  overviewId: { fontSize: 12, fontWeight: '600', color: Colors.primary, letterSpacing: 0.05, textTransform: 'uppercase' },
  overviewName: { fontSize: 20, fontWeight: '600', color: Colors.onSurface, marginTop: 4 },
  badge: { backgroundColor: '#E6F4EA', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginTop: 8 },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#1E8E3E' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.onSurface },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  filterText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: 'row', marginBottom: 0 },
  timelineLeft: { width: 24, alignItems: 'center' },
  timelineDot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  timelineDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.outlineVariant + '4D', marginTop: 4 },
  timelineContent: { flex: 1, paddingBottom: 24 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  timelineTitle: { fontSize: 16, fontWeight: '600', color: Colors.onSurface },
  timelineTime: { fontSize: 11, color: Colors.outline, letterSpacing: 0.05 },
  timelineCard: {
    backgroundColor: Colors.surfaceContainerLowest, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: Colors.outlineVariant + '33',
  },
  timelineDesc: { fontSize: 14, color: Colors.onSurfaceVariant, lineHeight: 20 },
  userRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  userAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.surfaceContainerHigh, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontSize: 10, fontWeight: '600', color: Colors.onSurfaceVariant },
  userName: { fontSize: 12, color: Colors.onSurface },
});
