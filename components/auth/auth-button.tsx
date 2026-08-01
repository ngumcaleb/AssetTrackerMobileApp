import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function AuthButton({
  label,
  onPress,
  loading,
  disabled,
  icon,
}: AuthButtonProps) {
  const inactive = loading || disabled;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={inactive}
      style={[styles.shadowWrap, inactive && styles.inactive]}
    >
      <LinearGradient
        colors={['#66001a', '#800020', '#8a0d28']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <View style={styles.content}>
            <Text style={styles.text}>{label}</Text>
            {icon ? <Ionicons name={icon} size={20} color="#ffffff" /> : null}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: 16,
    shadowColor: '#66001a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 7,
  },
  inactive: {
    opacity: 0.6,
  },
  button: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: '#ffffff',
  },
});
