import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface AuthFieldProps extends TextInputProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  labelRight?: React.ReactNode;
  secure?: boolean;
}

export default function AuthField({
  icon,
  label,
  labelRight,
  secure,
  onFocus,
  onBlur,
  ...rest
}: AuthFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(Boolean(secure));
  const tint = focused ? Colors.primary : Colors.outline;

  return (
    <View style={styles.group}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {labelRight}
      </View>
      <View
        style={[styles.wrapper, focused && styles.wrapperFocused]}
        collapsable={false}
      >
        <Ionicons name={icon} size={20} color={tint} style={styles.icon} />
        <TextInput
          {...rest}
          style={styles.input}
          placeholderTextColor={Colors.outline}
          secureTextEntry={hidden}
          selectionColor={Colors.primary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
        {secure ? (
          <TouchableOpacity
            onPress={() => setHidden((h) => !h)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={tint} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 4,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.08,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderRadius: 16,
  },
  wrapperFocused: {
    borderColor: Colors.primary,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.onSurface,
    paddingVertical: 0,
  },
});
