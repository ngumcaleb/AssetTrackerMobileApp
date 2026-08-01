import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch } from '@/hooks/useFetch';
import { api } from '@/services/api';
import { formatTimeAgo, getInitials } from '@/utils/format';
import { useAuth } from '@/context/AuthContext';
import { normalizeScanPayload } from '@/utils/scan';
import type { PaginatedResponse, ActivityLog, Asset } from '@/types/api';

const softShadow = Platform.select({
  ios: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
  android: { elevation: 2 },
  web: { boxShadow: '0 2px 14px rgba(15, 23, 42, 0.07)' },
});

const isWeb = Platform.OS === 'web';

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [manualCode, setManualCode] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [torch, setTorch] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const lockRef = useRef(false);
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scanAnim]);

  const scanLineY = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 214] });

  const { data: activityData } = useFetch<PaginatedResponse<ActivityLog>>({
    endpoint: '/api/activity',
    params: { per_page: 8 },
  });

  const recent = (activityData?.data ?? []).slice(0, 5);

  const lookupCode = useCallback(
    async (code: string) => {
      const normalized = normalizeScanPayload(code);
      if (!normalized || lookingUp) return;

      setLookingUp(true);
      setLastScanned(normalized);
      try {
        const asset = await api.get<Asset>(`/api/scan/lookup?code=${encodeURIComponent(normalized)}`);
        if (asset?.id) {
          router.push({ pathname: '/asset-detail', params: { id: String(asset.id) } });
        } else {
          Alert.alert('Not Found', `No asset found for "${normalized}".`);
        }
      } catch (e: any) {
        const msg = e?.message || 'Could not find that asset.';
        Alert.alert('Lookup failed', `${msg}\n\nScanned: ${normalized}`);
      } finally {
        setLookingUp(false);
        setTimeout(() => {
          lockRef.current = false;
        }, 2000);
      }
    },
    [lookingUp, router]
  );

  const onBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (lockRef.current || lookingUp) return;
      lockRef.current = true;
      lookupCode(result.data);
    },
    [lookupCode, lookingUp]
  );

  const cameraReady = permission?.granted;
  const cameraFacing = isWeb ? 'front' : 'back';

  return (
    <View style={styles.screen}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── App Bar ─────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Scan</Text>
          <Text style={styles.subtitle}>Quick asset lookup</Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={21} color="#1e293b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatar} onPress={() => router.push('/profile')}>
            <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* ── Hero Band ─────────────────────────────────────── */}
        <LinearGradient
          colors={['#4a0012', '#800020', '#8a0d28']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={[styles.decorOrb, styles.decorOrbA]} />
          <View style={[styles.decorOrb, styles.decorOrbB]} />
          <Text style={styles.heroEyebrow}>QUICK LOOKUP</Text>
          <Text style={styles.heroTitle}>Scan an Asset</Text>
          <Text style={styles.heroSubtitle}>Point your camera at a QR code to instantly open the asset.</Text>
        </LinearGradient>

        {/* ── Camera Card ───────────────────────────────────── */}
        <View style={styles.cameraWrap}>
          {cameraReady ? (
            <CameraView
              style={styles.camera}
              facing={cameraFacing}
              enableTorch={torch}
              barcodeScannerSettings={{
                barcodeTypes: ['qr', 'code128', 'code39', 'code93', 'ean13', 'ean8', 'upc_a', 'upc_e', 'codabar', 'itf14'],
              }}
              onBarcodeScanned={lookingUp ? undefined : onBarcodeScanned}
            >
              <View style={styles.overlay}>
                <View style={styles.frameWrap}>
                  <View style={styles.frameArea}>
                    <View style={styles.bracketTL} />
                    <View style={styles.bracketTR} />
                    <View style={styles.bracketBL} />
                    <View style={styles.bracketBR} />
                    <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]} />
                  </View>
                </View>

                <View style={styles.statusPill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.statusPillText}>Live · Scanning</Text>
                </View>

                {lastScanned && !lookingUp ? (
                  <View style={styles.lastScannedChip}>
                    <Ionicons name="checkmark-circle" size={13} color="#4ade80" />
                    <Text style={styles.lastScannedText} numberOfLines={1}>Last: {lastScanned}</Text>
                  </View>
                ) : null}
              </View>

              {!isWeb ? (
                <TouchableOpacity style={styles.torchPill} activeOpacity={0.8} onPress={() => setTorch((t) => !t)}>
                  <Ionicons name={torch ? 'flash' : 'flash-off-outline'} size={16} color="#fff" />
                  <Text style={styles.torchText}>{torch ? 'Torch' : 'Torch Off'}</Text>
                </TouchableOpacity>
              ) : null}
            </CameraView>
          ) : (
            <View style={[styles.camera, styles.permissionBox]}>
              <View style={styles.permissionIcon}>
                <Ionicons name="camera-outline" size={30} color="#fbd0d0" />
              </View>
              <Text style={styles.fallbackTitle}>Camera Access Needed</Text>
              <Text style={styles.fallbackSub}>Allow camera access to scan asset QR codes.</Text>
              <TouchableOpacity style={styles.allowBtnWrap} activeOpacity={0.85} onPress={requestPermission}>
                <LinearGradient
                  colors={['#66001a', '#800020']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.allowBtn}
                >
                  <Text style={styles.allowBtnText}>Enable Camera</Text>
                </LinearGradient>
              </TouchableOpacity>
              {isWeb ? <Text style={styles.webHintInBox}>Camera scanning works best in a device build.</Text> : null}
            </View>
          )}
        </View>

        {isWeb ? (
          <View style={styles.webHintRow}>
            <Ionicons name="information-circle-outline" size={14} color="#94a3b8" />
            <Text style={styles.webHint}>Camera scanning works best in a device build.</Text>
          </View>
        ) : null}

        {/* ── Manual Entry ──────────────────────────────────── */}
        <View style={styles.manualCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWrap}>
              <View style={styles.sectionIcon}>
                <Ionicons name="keypad-outline" size={16} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Manual Entry</Text>
                <Text style={styles.sectionSub}>Enter the asset tag or serial number</Text>
              </View>
            </View>
          </View>

          <View style={styles.manualRow}>
            <View style={styles.manualInputWrap}>
              <Ionicons name="search" size={17} color="#94a3b8" />
              <TextInput
                style={styles.manualInput}
                placeholder="e.g. AST-2024-001"
                placeholderTextColor="#94a3b8"
                value={manualCode}
                onChangeText={setManualCode}
                autoCapitalize="characters"
                returnKeyType="search"
                onSubmitEditing={() => lookupCode(manualCode)}
              />
            </View>
            <TouchableOpacity
              style={[styles.lookupBtnWrap, lookingUp && { opacity: 0.6 }]}
              onPress={() => lookupCode(manualCode)}
              disabled={lookingUp}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#66001a', '#800020', '#8a0d28']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.lookupBtn}
              >
                {lookingUp ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Recent Activity ───────────────────────────────── */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.recentTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/activity')} activeOpacity={0.7}>
            <Text style={styles.link}>View all</Text>
          </TouchableOpacity>
        </View>

        {recent.map((log) => (
          <TouchableOpacity
            key={log.id}
            style={styles.recentCard}
            activeOpacity={0.75}
            onPress={() => {
              if (log.asset?.id) {
                router.push({ pathname: '/asset-detail', params: { id: String(log.asset.id) } });
              }
            }}
          >
            <View style={styles.recentIconWrap}>
              <Ionicons name={activityIcon(log.type)} size={17} color={Colors.primary} />
            </View>
            <View style={styles.recentBody}>
              <Text style={styles.recentText} numberOfLines={2}>{log.description}</Text>
              <View style={styles.recentMeta}>
                <Text style={styles.recentSub}>{log.asset?.asset_tag ?? log.type}</Text>
                <View style={styles.metaDot} />
                <Text style={styles.recentSub}>{formatTimeAgo(log.created_at)}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={17} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
        {recent.length === 0 ? (
          <View style={styles.emptyRecent}>
            <Text style={styles.emptyRecentText}>No activity yet.</Text>
          </View>
        ) : null}
      </ScrollView>
      </View>
    </View>
  );
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const activityIconMap: Record<string, IoniconName> = {
  checkin: 'arrow-down-circle',
  checkout: 'arrow-up-circle',
  create: 'add-circle',
  register: 'add-circle',
  update: 'create-outline',
  edit: 'create-outline',
  damage: 'warning-outline',
  damaged: 'warning-outline',
  archive: 'archive-outline',
  unarchive: 'return-down-back',
  discard: 'trash-outline',
};

function activityIcon(type?: string): IoniconName {
  return activityIconMap[type?.toLowerCase() ?? ''] ?? 'pulse';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f2eeee',
    width: '100%',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    backgroundColor: Colors.background,
    ...Platform.select({
      web: { boxShadow: '0 0 0 1px #ece5e5, 0 10px 40px rgba(15, 23, 42, 0.08)' },
    }),
  },

  // ── App Bar ───────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 3 },
      web: { boxShadow: '0 1px 6px rgba(15, 23, 42, 0.06)' },
    }),
  },
  title: { fontSize: 20, fontWeight: '800', color: Colors.primary, letterSpacing: -0.3 },
  subtitle: { fontSize: 12, color: '#94a3b8', marginTop: 1 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f8f4f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  content: { paddingBottom: 40 },

  // ── Hero Band ─────────────────────────────────────────────
  hero: {
    paddingTop: 22,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  decorOrb: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)' },
  decorOrbA: { top: -50, right: -40, width: 190, height: 190 },
  decorOrbB: { bottom: -70, left: -40, width: 160, height: 160 },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 6,
  },
  heroTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, color: '#fff', marginBottom: 4 },
  heroSubtitle: { fontSize: 13.5, color: 'rgba(255,255,255,0.72)', lineHeight: 19 },

  // ── Camera Card ───────────────────────────────────────────
  cameraWrap: {
    height: 340,
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#111',
    ...Platform.select({
      ios: { shadowColor: '#4a0012', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 22 },
      android: { elevation: 10 },
      web: { boxShadow: '0 14px 34px rgba(74, 0, 18, 0.35)' },
    }),
  },
  camera: { flex: 1 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.28)' },
  frameWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frameArea: { width: 240, height: 240 },
  bracketTL: { position: 'absolute', top: 0, left: 0, width: 46, height: 46, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#fbd0d0', borderTopLeftRadius: 18 },
  bracketTR: { position: 'absolute', top: 0, right: 0, width: 46, height: 46, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#fbd0d0', borderTopRightRadius: 18 },
  bracketBL: { position: 'absolute', bottom: 0, left: 0, width: 46, height: 46, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#fbd0d0', borderBottomLeftRadius: 18 },
  bracketBR: { position: 'absolute', bottom: 0, right: 0, width: 46, height: 46, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#fbd0d0', borderBottomRightRadius: 18 },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 0,
    height: 2,
    backgroundColor: 'rgba(251, 208, 208, 0.9)',
    borderRadius: 2,
  },
  statusPill: {
    position: 'absolute',
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4ade80' },
  statusPillText: { fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  lastScannedChip: {
    position: 'absolute',
    bottom: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    maxWidth: '70%',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 11,
  },
  lastScannedText: { fontSize: 11.5, fontWeight: '600', color: '#fff', flexShrink: 1 },
  torchPill: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 13,
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  torchText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // ── Fallback (no permission) ─────────────────────────────
  fallbackTitle: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3, marginBottom: 6 },
  fallbackSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 260,
  },
  webHintInBox: { fontSize: 12, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginTop: 16 },
  webHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 16,
  },
  webHint: { fontSize: 12, color: '#94a3b8' },
  permissionBox: { padding: 28, alignItems: 'center', justifyContent: 'center' },
  permissionIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(251, 208, 208, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  allowBtnWrap: {
    marginTop: 18,
    borderRadius: 14,
    ...Platform.select({
      ios: { shadowColor: '#800020', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
      android: { elevation: 5 },
      web: { boxShadow: '0 8px 20px rgba(128, 0, 32, 0.45)' },
    }),
  },
  allowBtn: { paddingHorizontal: 26, paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  allowBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // ── Manual Entry ──────────────────────────────────────────
  manualCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    ...softShadow,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#fde6e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', letterSpacing: -0.2 },
  sectionSub: { fontSize: 12, color: '#94a3b8', marginTop: 1 },
  manualRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  manualInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f4f4',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    gap: 8,
  },
  manualInput: { flex: 1, fontSize: 14, color: '#0f172a' },
  lookupBtnWrap: {
    borderRadius: 14,
    ...Platform.select({
      ios: { shadowColor: '#4a0012', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8 },
      android: { elevation: 5 },
      web: { boxShadow: '0 6px 18px rgba(74, 0, 18, 0.35)' },
    }),
  },
  lookupBtn: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  // ── Recent Activity ───────────────────────────────────────
  recentTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', letterSpacing: -0.2 },
  link: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 18,
    padding: 13,
    gap: 12,
    ...softShadow,
  },
  recentIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#fde6e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentBody: { flex: 1 },
  recentText: { fontSize: 13.5, fontWeight: '600', color: '#0f172a', lineHeight: 18 },
  recentMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  recentSub: { fontSize: 11.5, color: '#94a3b8', fontVariant: ['tabular-nums'] },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#cbd5e1' },
  emptyRecent: { marginTop: 14, alignItems: 'center' },
  emptyRecentText: { fontSize: 13, color: '#94a3b8' },
});
