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

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('john.doe@scantrack.io');
  const [phone, setPhone] = useState('+1 (555) 012-3456');

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
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnIcon}>âœï¸</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>John Doe</Text>
          <Text style={styles.profileRole}>Logistics Manager</Text>
          <View style={styles.deptBadge}>
            <Text style={styles.deptText}>Supply Chain Operations</Text>
          </View>
        </View>

        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Email Address</Text>
          <View style={styles.fieldInput}>
            <Text style={styles.fieldIcon}>âœ‰ï¸</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Phone Number</Text>
          <View style={styles.fieldInput}>
            <Text style={styles.fieldIcon}>ðŸ“ž</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Employee ID</Text>
          <View style={[styles.fieldInput, { opacity: 0.7 }]}>
            <Text style={styles.fieldIcon}>ðŸªª</Text>
            <TextInput style={styles.input} value="ST-99203" editable={false} />
          </View>
          <Text style={styles.fieldHint}>Employee ID is managed by System Administration.</Text>
        </View>

        <View style={styles.prefsCard}>
          <Text style={styles.prefsTitle}>Preferences</Text>
          <TouchableOpacity style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <Text style={styles.prefIcon}>ðŸŒ</Text>
              <Text style={styles.prefLabel}>Language</Text>
            </View>
            <View style={styles.prefRight}>
              <Text style={styles.prefValue}>English (US)</Text>
              <Text style={styles.chevron}>â€º</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <Text style={styles.prefIcon}>ðŸŒ™</Text>
              <Text style={styles.prefLabel}>Appearance</Text>
            </View>
            <View style={styles.prefRight}>
              <Text style={styles.prefValue}>Light Mode</Text>
              <Text style={styles.chevron}>â€º</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>
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
  iconBtn: { padding: 8 },
  menuIcon: { gap: 3 },
  menuLine: { width: 18, height: 2, backgroundColor: Colors.onSurfaceVariant, borderRadius: 1 },
  topTitle: { fontSize: 20, fontWeight: '600', color: Colors.primary },
  notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryContainer },
  content: { padding: 16, alignItems: 'center' },
  profileSection: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: Colors.surfaceContainerHighest,
    borderWidth: 4, borderColor: Colors.surfaceContainer, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 40, fontWeight: '600', color: Colors.onSurfaceVariant },
  editBtn: {
    position: 'absolute', bottom: 0, right: 0, width: 36, height: 36,
    borderRadius: 18, backgroundColor: Colors.primaryContainer, alignItems: 'center',
    justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  editBtnIcon: { fontSize: 16 },
  profileName: { fontSize: 24, fontWeight: '600', color: Colors.onSurface },
  profileRole: { fontSize: 16, color: Colors.onSurfaceVariant, marginTop: 4 },
  deptBadge: {
    backgroundColor: Colors.primary + '1A', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, marginTop: 8,
  },
  deptText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  fieldCard: {
    width: '100%', backgroundColor: Colors.surfaceContainerLowest, borderRadius: 20,
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.outlineVariant + '4D',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.onSurfaceVariant, letterSpacing: 0.05, textTransform: 'uppercase', marginBottom: 8 },
  fieldInput: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  fieldIcon: { fontSize: 18 },
  input: { flex: 1, fontSize: 16, color: Colors.onSurface, padding: 0 },
  fieldHint: { fontSize: 10, color: Colors.onSurfaceVariant, marginTop: 8 },
  prefsCard: {
    width: '100%', backgroundColor: Colors.surfaceContainerLowest, borderRadius: 20,
    padding: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.outlineVariant + '4D',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  prefsTitle: { fontSize: 18, fontWeight: '600', color: Colors.onSurface, marginBottom: 12 },
  prefRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  prefLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prefIcon: { fontSize: 18 },
  prefLabel: { fontSize: 16, color: Colors.onSurface },
  prefRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  prefValue: { fontSize: 14, color: Colors.onSurfaceVariant },
  chevron: { fontSize: 18, color: Colors.outlineVariant },
  divider: { height: 1, backgroundColor: Colors.outlineVariant + '1A' },
  saveBtn: {
    width: '100%', backgroundColor: Colors.primaryContainer, borderRadius: 28, height: 56,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: Colors.primaryContainer, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 8,
  },
  saveBtnText: { color: Colors.onPrimary, fontSize: 18, fontWeight: '600' },
  logoutBtn: { width: '100%', alignItems: 'center', paddingVertical: 12, marginBottom: 24 },
  logoutBtnText: { color: Colors.error, fontSize: 16 },
});
