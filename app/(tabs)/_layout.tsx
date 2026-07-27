import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarShowLabel: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconWrap}>
              <View style={[styles.navIcon, { backgroundColor: color }]} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="assets"
        options={{
          title: 'Assets',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconWrap}>
              <View style={[styles.navIcon, { backgroundColor: color, width: 20, height: 16, borderRadius: 3 }]} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: () => null,
          tabBarButton: ({ onPress, onLongPress, accessibilityState, accessibilityLabel, testID }) => (
            <Pressable
              style={styles.scanButtonWrapper}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="button"
              accessibilityState={accessibilityState}
              accessibilityLabel={accessibilityLabel}
              testID={testID}
            >
              <View style={styles.scanButton}>
                <View style={styles.scanIconInner}>
                  <View style={styles.scanCorner} />
                  <View style={[styles.scanCorner, styles.scanCornerRight]} />
                  <View style={[styles.scanCorner, styles.scanCornerBottom]} />
                  <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />
                </View>
              </View>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconWrap}>
              <View style={[styles.navIcon, { backgroundColor: color, borderRadius: 10 }]} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => (
            <View style={styles.iconWrap}>
              <View style={[styles.navIcon, { backgroundColor: color, width: 20, height: 4, borderRadius: 2 }]} />
            </View>
          ),
        }}
      />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.outlineVariant,
    borderTopWidth: 0.5,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.05,
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  scanButtonWrapper: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    height: 64,
  },
  scanButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  scanIconInner: {
    width: 24,
    height: 24,
    position: 'relative',
  },
  scanCorner: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: Colors.onPrimaryContainer,
    top: 0,
    left: 0,
  },
  scanCornerRight: {
    left: 'auto',
    right: 0,
    borderLeftWidth: 0,
    borderRightWidth: 2,
  },
  scanCornerBottom: {
    top: 'auto',
    bottom: 0,
    borderTopWidth: 0,
    borderBottomWidth: 2,
  },
  scanCornerBottomRight: {
    top: 'auto',
    left: 'auto',
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
});
