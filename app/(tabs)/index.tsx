import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const stats = [
  { label: 'Total Assets', value: '128' },
  { label: 'Damaged', value: '42' },
  { label: 'Expired', value: '86' },
];

const actions = [
  { label: 'Register Asset', route: '/register-asset' as const, icon: '+' },
  { label: 'Check Out', route: '/checkout-asset' as const, icon: 'â†—' },
  { label: 'Check In', route: '/checkin-asset' as const, icon: 'â†™' },
  { label: 'Scan QR', route: '/search' as const, icon: 'âŠž' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.menuIcon}>â˜°</Text>
        </TouchableOpacity>
        <Text style={styles.title}>ScanTrack</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.bellIcon}>ðŸ””</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Dashboard</Text>
        <Text style={styles.subGreeting}>Overview of your assets</Text>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionsGrid}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionCard}
              activeOpacity={0.7}
              onPress={() => router.push(action.route)}
            >
              <View style={styles.actionIconCircle}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 8,
  },
  subGreeting: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onBackground,
    marginBottom: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionIcon: {
    fontSize: 22,
    color: Colors.onPrimaryContainer,
    fontWeight: '600',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
    textAlign: 'center',
  },
});
