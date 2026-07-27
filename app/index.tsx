import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const STATUSES = [
  'Initializing System',
  'Connecting to Cloud',
  'Syncing Local Assets',
  'Optimizing Scanner',
  'Ready',
];

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const statusOpacity = useRef(new Animated.Value(1)).current;

  const [statusIndex, setStatusIndex] = React.useState(0);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(progressWidth, {
      toValue: 1,
      duration: 3500,
      useNativeDriver: false,
    }).start();

    let index = 0;
    const interval = setInterval(() => {
      index++;
      if (index < STATUSES.length) {
        statusOpacity.setValue(0);
        setStatusIndex(index);
        Animated.timing(statusOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

  const progressInterpolate = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.ambientTop} />
      <View style={styles.ambientBottom} />

      <View style={styles.spacer} />

      <View style={styles.centerContent}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <View style={styles.logoShadow}>
            <View style={styles.logoInner}>
              <Text style={styles.logoText}>QR</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.Text
          style={[styles.brandName, { opacity: textOpacity }]}
        >
          ScanTrack
        </Animated.Text>

        <Animated.Text
          style={[styles.tagline, { opacity: taglineOpacity }]}
        >
          Smart Asset Management
        </Animated.Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, { width: progressInterpolate as any }]}
          />
        </View>
        <Animated.Text style={[styles.statusText, { opacity: statusOpacity }]}>
          {STATUSES[statusIndex]}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  ambientTop: {
    position: 'absolute',
    top: -width * 0.1,
    right: -width * 0.1,
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: `${Colors.primary}08`,
  },
  ambientBottom: {
    position: 'absolute',
    bottom: -width * 0.1,
    left: -width * 0.1,
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: `${Colors.secondary}08`,
  },
  spacer: {
    height: 64,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 8,
  },
  logoInner: {
    width: 128,
    height: 128,
    borderRadius: 32,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.primary,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.02,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.02,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 80,
    paddingHorizontal: 48,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.outline,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
  },
});
