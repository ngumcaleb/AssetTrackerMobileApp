import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 260],
  });

  const recentScans = [
    { id: '1', name: 'Asset-77492-X', desc: 'Industrial Compressor', time: '2m ago', color: Colors.primary },
    { id: '2', name: 'Shipment-B440', desc: 'North Wing Logistics', time: '15m ago', color: Colors.tertiary },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity style={styles.iconBtn}>
            <View style={styles.menuIcon}>
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>ScanTrack</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraArea}>
        <View style={styles.overlay}>
          <View style={styles.viewfinderContainer}>
            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
            </View>
            <View style={styles.instructionPill}>
              <Text style={styles.instructionText}>ALIGN QR CODE WITHIN FRAME</Text>
            </View>
          </View>

          <View style={styles.floatingControls}>
            <TouchableOpacity style={styles.floatBtn}>
              <Text style={styles.floatBtnIcon}>âš¡</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.floatBtn}>
              <Text style={styles.floatBtnIcon}>ðŸ”„</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.manualEntryBtn}>
            <Text style={styles.manualEntryText}>âŒ¨ Manual Entry</Text>
          </TouchableOpacity>

          <View style={styles.recentScansCard}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Recent Scans</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllBtn}>View All</Text>
              </TouchableOpacity>
            </View>
            {recentScans.map((scan) => (
              <TouchableOpacity key={scan.id} style={styles.scanItem}>
                <View style={[styles.scanItemIcon, { backgroundColor: scan.color + '15' }]}>
                  <View style={[styles.scanItemDot, { backgroundColor: scan.color }]} />
                </View>
                <View style={styles.scanItemInfo}>
                  <Text style={styles.scanItemName}>{scan.name}</Text>
                  <Text style={styles.scanItemDesc}>{scan.desc} Â· {scan.time}</Text>
                </View>
                <Text style={styles.chevron}>â€º</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    zIndex: 10,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { padding: 8 },
  menuIcon: { gap: 3 },
  menuLine: { width: 18, height: 2, backgroundColor: Colors.onSurfaceVariant, borderRadius: 1 },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: -0.01,
  },
  notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primaryContainer },
  cameraArea: { flex: 1, backgroundColor: '#111' },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderContainer: { alignItems: 'center' },
  viewfinder: {
    width: 260,
    height: 260,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.primaryContainer,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.primaryContainer,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.primaryContainer,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.primaryContainer,
    borderBottomRightRadius: 16,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primaryContainer,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 5,
  },
  instructionPill: {
    marginTop: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  instructionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.05,
  },
  floatingControls: {
    position: 'absolute',
    top: 20,
    right: 16,
    gap: 16,
  },
  floatBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatBtnIcon: { fontSize: 20 },
  manualEntryBtn: {
    position: 'absolute',
    bottom: 200,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  manualEntryText: {
    color: Colors.onPrimaryContainer,
    fontSize: 18,
    fontWeight: '600',
  },
  recentScansCard: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: { fontSize: 18, fontWeight: '600', color: Colors.onSurface },
  viewAllBtn: { color: Colors.primary, fontSize: 12, fontWeight: '600', letterSpacing: 0.05 },
  scanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
    gap: 12,
  },
  scanItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanItemDot: { width: 12, height: 12, borderRadius: 6 },
  scanItemInfo: { flex: 1 },
  scanItemName: { fontSize: 16, fontWeight: '500', color: Colors.onSurface },
  scanItemDesc: { fontSize: 14, color: Colors.onSurfaceVariant },
  chevron: { fontSize: 20, color: Colors.outlineVariant },
});
