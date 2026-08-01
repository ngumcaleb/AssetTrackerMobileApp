import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.outline,
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarShowLabel: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons
                name={focused ? 'grid' : 'grid-outline'}
                size={22}
                color={focused ? Colors.primary : Colors.outline}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="assets"
        options={{
          title: 'Assets',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons
                name={focused ? 'cube' : 'cube-outline'}
                size={22}
                color={focused ? Colors.primary : Colors.outline}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: () => null,
          tabBarButton: ({ onPress, onLongPress, accessibilityState, accessibilityLabel, testID }) => {
            const isFocused = accessibilityState?.selected;
            return (
              <Pressable
                style={styles.scanButtonWrapper}
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityRole="button"
                accessibilityState={accessibilityState}
                accessibilityLabel={accessibilityLabel}
                testID={testID}
              >
                <View style={[styles.scanButtonRing, isFocused && styles.scanButtonRingActive]}>
                  <View style={styles.scanButton}>
                    <Ionicons name="qr-code" size={26} color="#ffffff" />
                  </View>
                </View>
              </Pressable>
            );
          },
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons
                name={focused ? 'time' : 'time-outline'}
                size={22}
                color={focused ? Colors.primary : Colors.outline}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons
                name={focused ? 'apps' : 'apps-outline'}
                size={22}
                color={focused ? Colors.primary : Colors.outline}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopColor: '#e2e8f0',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 8,
    elevation: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    position: 'relative',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  iconContainer: {
    width: 40,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    backgroundColor: '#fde6e6',
  },
  scanButtonWrapper: {
    top: -24,
    justifyContent: 'center',
    alignItems: 'center',
    width: 68,
    height: 68,
  },
  scanButtonRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#ffffff',
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#800020',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 12,
  },
  scanButtonRingActive: {
    shadowColor: '#66001a',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    transform: [{ scale: 1.05 }],
  },
  scanButton: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: '#800020',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


