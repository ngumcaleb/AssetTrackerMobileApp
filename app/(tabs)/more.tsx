import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

interface SettingsRowProps {
  icon: string;
  label: string;
  value?: string;
  hasChevron?: boolean;
  onPress?: () => void;
}

function SettingsRow({ icon, label, value, hasChevron = true, onPress }: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.6} onPress={onPress}>
      <View style={styles.rowLeft}>
        <View style={styles.rowIcon}>
          <Text style={styles.rowIconText}>{icon}</Text>
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        {hasChevron ? <Text style={styles.chevron}>›</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function MoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [biometricEnabled, setBiometricEnabled] = React.useState(true);

  const initials = React.useMemo(() => {
    if (!user?.name) return '??';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name]);

  const handleLogout = React.useCallback(async () => {
    try {
      await logout();
      router.replace('/login');
    } catch {}
  }, [logout, router]);

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>ScanTrack</Text>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Settings</Text>
        <Text style={styles.screenSubtitle}>
          Configure your ScanTrack workspace and account preferences.
        </Text>

        {/* Organization */}
        <SectionHeader title="Organization" />
        <View style={styles.card}>
          <TouchableOpacity style={styles.orgRow} activeOpacity={0.6}>
            <View style={styles.orgAvatar}>
              <Text style={styles.orgAvatarText}>GH</Text>
            </View>
            <View style={styles.orgInfo}>
              <Text style={styles.orgName}>Global Logistics Hub</Text>
              <Text style={styles.orgPlan}>Enterprise Plan · 128 assets</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <SettingsRow icon="🏢" label="Workspace Details" />
        </View>

        {/* Preferences */}
        <SectionHeader title="Preferences" />
        <View style={styles.card}>
          <SettingsRow icon="🎨" label="Theme" value="System Light" />
          <View style={styles.divider} />
          <SettingsRow icon="🔔" label="Notifications" value="Enabled" />
          <View style={styles.divider} />
          <SettingsRow icon="🌍" label="Language" value="English US" />
        </View>

        {/* Security */}
        <SectionHeader title="Security" />
        <View style={styles.card}>
          <SettingsRow icon="🔑" label="Change Password" />
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.rowIcon}>
                <Text style={styles.rowIconText}>🔐</Text>
              </View>
              <Text style={styles.rowLabel}>Biometric Lock</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primaryContainer }}
              thumbColor={biometricEnabled ? Colors.primary : Colors.outline}
            />
          </View>
        </View>

        {/* Data & Privacy */}
        <SectionHeader title="Data & Privacy" />
        <View style={styles.card}>
          <SettingsRow icon="☁️" label="Backup & Sync" />
          <View style={styles.divider} />
          <SettingsRow icon="📤" label="Export Assets Data" />
          <View style={styles.divider} />
          <SettingsRow icon="📄" label="Privacy Policy" />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>⏻</Text>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>ScanTrack v2.4.0 (Build 901)</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 8,
  },
  screenSubtitle: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 4,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    paddingVertical: 4,
    marginBottom: 20,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  orgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  orgAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orgAvatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  orgPlan: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.outlineVariant,
    marginHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowIconText: {
    fontSize: 15,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.onSurface,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowValue: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  chevron: {
    fontSize: 22,
    color: Colors.outline,
    fontWeight: '300',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.errorContainer,
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  logoutIcon: {
    fontSize: 18,
    color: Colors.onErrorContainer,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.onErrorContainer,
  },
  version: {
    fontSize: 12,
    color: Colors.outline,
    textAlign: 'center',
  },
});
