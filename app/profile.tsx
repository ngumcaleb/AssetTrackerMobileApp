import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { getInitials } from '@/utils/format';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [department, setDepartment] = useState(user?.department ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone ?? '');
      setDepartment(user.department ?? '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Missing fields', 'Name and email are required.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        department: department.trim() || null,
      } as any);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Profile</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
          <Text style={{ fontSize: 18 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.role}>{user?.role ?? 'user'}{user?.department ? ` · ${user.department}` : ''}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor={Colors.outline} />

          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={Colors.outline}
          />

          <Text style={styles.fieldLabel}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor={Colors.outline}
          />

          <Text style={styles.fieldLabel}>Department</Text>
          <TextInput
            style={styles.input}
            value={department}
            onChangeText={setDepartment}
            placeholderTextColor={Colors.outline}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Changes</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
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
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.outlineVariant,
  },
  iconBtn: { padding: 8, minWidth: 40 },
  backArrow: { fontSize: 22, color: Colors.onSurface },
  topTitle: { fontSize: 18, fontWeight: '600', color: Colors.primary },
  content: { padding: 16, paddingBottom: 40 },
  profileSection: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: Colors.onPrimaryContainer },
  name: { fontSize: 22, fontWeight: '700', color: Colors.onSurface },
  role: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 4, textTransform: 'capitalize' },
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant, marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    color: Colors.onSurface,
    backgroundColor: Colors.surface,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  saveText: { color: Colors.onPrimary, fontSize: 16, fontWeight: '600' },
  logoutBtn: {
    backgroundColor: Colors.errorContainer,
    borderRadius: 28,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { color: Colors.onErrorContainer, fontSize: 16, fontWeight: '600' },
});
