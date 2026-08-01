import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Track Every Asset',
    description: 'Register and manage your entire asset inventory with QR codes. Instantly identify any asset in your organization.',
    icon: 'qr-code-outline' as const,
    iconBg: Colors.primaryContainer,
    accentColor: Colors.primary,
  },
  {
    id: '2',
    title: 'Check In & Out',
    description: 'Effortlessly assign assets to team members, track destinations, and manage returns with full accountability.',
    icon: 'swap-horizontal-outline' as const,
    iconBg: '#00569c',
    accentColor: '#00569c',
  },
  {
    id: '3',
    title: 'Real-time Insights',
    description: 'Monitor asset status, maintenance schedules, and team activity from a powerful dashboard anytime, anywhere.',
    icon: 'analytics-outline' as const,
    iconBg: '#1d4ed8',
    accentColor: '#1d4ed8',
  },
];

const SLIDE_WIDTH = width;

function SlideItem({ item, index }: { item: typeof SLIDES[0]; index: number }) {
  return (
    <View style={[styles.slide, { width: SLIDE_WIDTH }]}>
      <View style={styles.slideContent}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
          <Ionicons name={item.icon} size={64} color="#ffffff" />
        </View>

        {/* Decorative dots */}
        <View style={styles.decorDots}>
          <View style={[styles.decorDot, { backgroundColor: item.accentColor, opacity: 0.08, width: 120, height: 120 }]} />
          <View style={[styles.decorDot, { backgroundColor: item.accentColor, opacity: 0.05, width: 80, height: 80, top: -60, right: -20 }]} />
        </View>

        {/* Text */}
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('onboarding_complete', '1');
    router.replace('/login');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Skip Button */}
      <View style={styles.topBar}>
        <View style={styles.spacer} />
        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={({ item, index }) => <SlideItem item={item} index={index} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Dot Indicators */}
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => {
            const inputRange = [
              (index - 1) * SLIDE_WIDTH,
              index * SLIDE_WIDTH,
              (index + 1) * SLIDE_WIDTH,
            ];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            const dotColor = scrollX.interpolate({
              inputRange,
              outputRange: [Colors.outlineVariant, Colors.primary, Colors.outlineVariant],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: dotColor,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Next / Get Started Button */}
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          {currentIndex === SLIDES.length - 1 ? (
            <Text style={styles.nextBtnText}>Get Started</Text>
          ) : (
            <View style={styles.nextBtnContent}>
              <Text style={styles.nextBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  spacer: {
    width: 60,
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 8,
  },
  decorDots: {
    position: 'absolute',
    top: 20,
    right: 30,
  },
  decorDot: {
    position: 'absolute',
    borderRadius: 999,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.02,
  },
  slideDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 60,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  nextBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
});
