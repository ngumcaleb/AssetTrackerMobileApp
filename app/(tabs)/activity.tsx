import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ActivityType = 'check-in' | 'check-out' | 'maintenance' | 'registration';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  time: string;
  description: string;
  assetTag: string;
}

const filterChips = ['All', 'Check-Ins', 'Check-Outs', 'Maintenance'];

const todayActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'check-in',
    title: 'Asset Checked In',
    time: '2:30 PM',
    description: 'Laptop returned by John Doe',
    assetTag: 'LPT-001',
  },
  {
    id: '2',
    type: 'check-out',
    title: 'Asset Checked Out',
    time: '11:15 AM',
    description: 'Monitor assigned to Sarah Lee',
    assetTag: 'MON-042',
  },
  {
    id: '3',
    type: 'maintenance',
    title: 'Maintenance Scheduled',
    time: '9:00 AM',
    description: 'Printer sent for repair',
    assetTag: 'PTR-018',
  },
];

const yesterdayActivities: ActivityItem[] = [
  {
    id: '4',
    type: 'registration',
    title: 'Asset Registered',
    time: '4:45 PM',
    description: 'New server added to inventory',
    assetTag: 'SRV-007',
  },
  {
    id: '5',
    type: 'check-out',
    title: 'Asset Checked Out',
    time: '1:20 PM',
    description: 'Keyboard issued to Mark Wilson',
    assetTag: 'KEY-093',
  },
];

const weekActivities: ActivityItem[] = [
  {
    id: '6',
    type: 'maintenance',
    title: 'Maintenance Completed',
    time: 'Mon 3:10 PM',
    description: 'Desktop cleaned and updated',
    assetTag: 'DST-021',
  },
  {
    id: '7',
    type: 'registration',
    title: 'Asset Registered',
    time: 'Mon 10:00 AM',
    description: '5 monitors added in bulk',
    assetTag: 'MON-050',
  },
  {
    id: '8',
    type: 'check-in',
    title: 'Asset Checked In',
    time: 'Sun 2:00 PM',
    description: 'Tablet returned by intern',
    assetTag: 'TAB-012',
  },
];

const typeConfig: Record<ActivityType, { bg: string; icon: string }> = {
  'check-in': { bg: Colors.secondaryContainer, icon: 'â†™' },
  'check-out': { bg: Colors.errorContainer, icon: 'â†—' },
  maintenance: { bg: Colors.tertiaryContainer, icon: 'ðŸ”§' },
  registration: { bg: Colors.surfaceContainerHighest, icon: '+' },
};

function ActivityCard({ item }: { item: ActivityItem }) {
  const config = typeConfig[item.type];
  return (
    <View style={styles.activityCard}>
      <View style={[styles.activityIconCircle, { backgroundColor: config.bg }]}>
        <Text style={styles.activityIcon}>{config.icon}</Text>
      </View>
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>{item.title}</Text>
          <Text style={styles.activityTime}>{item.time}</Text>
        </View>
        <Text style={styles.activityDesc}>{item.description}</Text>
        <View style={styles.assetTagChip}>
          <Text style={styles.assetTagText}>{item.assetTag}</Text>
        </View>
      </View>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function ActivityLogScreen() {
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.menuIcon}>â˜°</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ScanTrack</Text>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.bellIcon}>ðŸ””</Text>
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Activity Log</Text>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>ðŸ”</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search activities..."
            placeholderTextColor={Colors.outline}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {filterChips.map((chip) => (
            <TouchableOpacity
              key={chip}
              style={[
                styles.chip,
                activeFilter === chip && styles.chipActive,
              ]}
              onPress={() => setActiveFilter(chip)}
            >
              <Text
                style={[
                  styles.chipText,
                  activeFilter === chip && styles.chipTextActive,
                ]}
              >
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <SectionHeader title="Today" />
        {todayActivities.map((item) => (
          <ActivityCard key={item.id} item={item} />
        ))}

        <SectionHeader title="Yesterday" />
        {yesterdayActivities.map((item) => (
          <ActivityCard key={item.id} item={item} />
        ))}

        <SectionHeader title="This Week" />
        {weekActivities.map((item) => (
          <ActivityCard key={item.id} item={item} />
        ))}

        <View style={styles.healthCard}>
          <View style={styles.healthLeft}>
            <Text style={styles.healthLabel}>System Health</Text>
            <Text style={styles.healthValue}>99.8%</Text>
            <Text style={styles.healthSub}>All systems operational</Text>
          </View>
          <View style={styles.healthIndicator}>
            <View style={styles.healthDot} />
            <Text style={styles.healthStatus}>Healthy</Text>
          </View>
        </View>
      </ScrollView>
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
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 8,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.onSurface,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  chipActive: {
    backgroundColor: Colors.primaryContainer,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  chipTextActive: {
    color: Colors.onPrimaryContainer,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 10,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  activityIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityIcon: {
    fontSize: 16,
    color: Colors.onSurface,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  activityTime: {
    fontSize: 11,
    color: Colors.outline,
  },
  activityDesc: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginBottom: 6,
  },
  assetTagChip: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  assetTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  healthCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  healthLeft: {
    flex: 1,
  },
  healthLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  healthValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
  },
  healthSub: {
    fontSize: 11,
    color: Colors.outline,
    marginTop: 2,
  },
  healthIndicator: {
    alignItems: 'center',
    gap: 4,
  },
  healthDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
  },
  healthStatus: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
});
