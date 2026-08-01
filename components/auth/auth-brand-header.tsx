import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const BAND_HEIGHT = 300;

interface AuthBrandHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function AuthBrandHeader({
  eyebrow,
  title,
  subtitle,
  showBack,
  onBack,
}: AuthBrandHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#3d0010', '#66001a', '#800020']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.95, y: 1 }}
      style={[styles.band, { paddingTop: insets.top }]}
    >
      <View style={[styles.orbLarge, { right: -90, top: 40 }]} />
      <View style={[styles.orbSmall, { left: -50, top: 120 }]} />
      <View style={[styles.orbRing, { right: 40, bottom: -60 }]} />

      <View style={styles.topRow}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}

        <View style={styles.brandRow}>
          <View style={styles.logoMark}>
            <Ionicons name="qr-code" size={18} color="#800020" />
          </View>
          <Text style={styles.brandWordmark}>ROYALTY WORLD</Text>
        </View>

        <View style={styles.backButton} />
      </View>

      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  band: {
    height: BAND_HEIGHT,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  orbLarge: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  orbSmall: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  orbRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandWordmark: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: '#ffffff',
  },
  copy: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2,
    color: '#fbd0d0',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.82)',
    maxWidth: width - 96,
  },
});
