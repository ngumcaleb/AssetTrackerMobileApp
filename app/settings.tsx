import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { changePassword } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !password || !passwordConfirmation) {
      Alert.alert('Missing fields', 'Fill in all password fields.');
      return;
    }
    if (password !== passwordConfirmation) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Too short', 'Password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    try {
      await changePassword(currentPassword, password, passwordConfirmation);
      setCurrentPassword('');
      setPassword('');
      setPasswordConfirmation('');
      Alert.alert('Success', 'Password updated successfully.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Settings</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.screenTitle}>Settings</Text>
        <Text style={styles.screenSubtitle}>Account security and preferences.</Text>

        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/profile')}>
            <Text style={styles.rowLabel}>Edit Profile</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => router.push('/notifications')}>
            <Text style={styles.rowLabel}>Notifications Inbox</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>Change Password</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Current Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholderTextColor={Colors.outline}
            placeholder="Current password"
          />
          <Text style={styles.fieldLabel}>New Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={Colors.outline}
            placeholder="At least 8 characters"
          />
          <Text style={styles.fieldLabel}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
            placeholderTextColor={Colors.outline}
            placeholder="Confirm password"
          />
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleChangePassword}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Update Password</Text>}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionHeader}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Email Notifications</Text>
              <Text style={styles.rowHint}>Local preference only</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: Colors.surfaceContainerHighest, true: Colors.primaryContainer }}
              thumbColor={emailNotifications ? Colors.primary : Colors.outline}
            />
          </View>
        </View>

        <Text style={styles.version}>Royalty World · AssetTracker 1.0.0</Text>
      </ScrollView>
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
  },
  backBtn: { padding: 8 },
  backArrow: { fontSize: 22, color: Colors.onSurface },
  topTitle: { fontSize: 18, fontWeight: '600', color: Colors.primary },
  spacer: { width: 40 },
  content: { padding: 16, paddingBottom: 40 },
  screenTitle: { fontSize: 26, fontWeight: '700', color: Colors.onBackground },
  screenSubtitle: { fontSize: 14, color: Colors.onSurfaceVariant, marginTop: 4, marginBottom: 20 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowLabel: { fontSize: 15, fontWeight: '500', color: Colors.onSurface },
  rowHint: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  chevron: { fontSize: 22, color: Colors.outline },
  divider: { height: 1, backgroundColor: Colors.outlineVariant, marginVertical: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    color: Colors.onSurface,
    backgroundColor: Colors.surface,
    marginBottom: 4,
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: Colors.onPrimary, fontWeight: '600' },
  version: { fontSize: 12, color: Colors.outline, textAlign: 'center' },
});
