import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AuthErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export default function AuthErrorBanner({ message, onDismiss }: AuthErrorBannerProps) {
  return (
    <View style={styles.banner}>
      <Ionicons name="alert-circle" size={18} color="#b3261e" />
      <Text style={styles.text}>{message}</Text>
      {onDismiss ? (
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={16} color="#b3261e" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 18,
  },
  text: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    color: '#991b1b',
  },
});
