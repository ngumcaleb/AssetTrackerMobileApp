import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import AuthBrandHeader from '@/components/auth/auth-brand-header';
import AuthField from '@/components/auth/auth-field';
import AuthButton from '@/components/auth/auth-button';
import AuthErrorBanner from '@/components/auth/auth-error-banner';

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, error, clearError } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) setLocalError(error);
  }, [error]);

  useEffect(() => {
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 450,
      delay: 120,
      useNativeDriver: true,
    }).start();
  }, [cardAnim]);

  const getPasswordStrength = (pw: string): { level: number; color: string; label: string } => {
    if (pw.length === 0) return { level: 0, color: 'transparent', label: '' };
    if (pw.length < 6) return { level: 1, color: '#ef4444', label: 'Weak' };
    if (pw.length < 10) return { level: 2, color: '#f59e0b', label: 'Medium' };
    return { level: 3, color: '#22c55e', label: 'Strong' };
  };

  const strength = getPasswordStrength(password);

  const handleCreateAccount = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }

    if (!agreed) {
      setLocalError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    setLocalError(null);
    clearError();
    try {
      await register({
        name: fullName.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
        department: department.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e?.message || 'Could not create account. Please try again.';
      setLocalError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3d0010" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthBrandHeader
            showBack
            onBack={() => router.back()}
            eyebrow="Join Royalty World"
            title="Create your account"
            subtitle="Start tracking your enterprise assets in minutes."
          />

          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardAnim,
                transform: [
                  {
                    translateY: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <AuthField
              label="Full name"
              icon="person-outline"
              placeholder="Enter your full name"
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
            />

            <AuthField
              label="Work email"
              icon="mail-outline"
              placeholder="you@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <AuthField
              label="Phone number"
              icon="call-outline"
              placeholder="+237 6 00 00 00 00"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <AuthField
              label="Department"
              icon="business-outline"
              placeholder="e.g. Engineering, IT, Operations"
              autoCapitalize="words"
              value={department}
              onChangeText={setDepartment}
            />

            <View>
              <AuthField
                label="Password"
                icon="lock-closed-outline"
                placeholder="Create a strong password"
                secure
                value={password}
                onChangeText={setPassword}
              />
              {password.length > 0 ? (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthTrack}>
                    <View
                      style={[
                        styles.strengthFill,
                        {
                          width: `${(strength.level / 3) * 100}%`,
                          backgroundColor: strength.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>
                    {strength.label}
                  </Text>
                </View>
              ) : null}
            </View>

            <AuthField
              label="Confirm password"
              icon="shield-checkmark-outline"
              placeholder="Re-enter your password"
              secure
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreed(!agreed)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed ? <Ionicons name="checkmark" size={14} color="#ffffff" /> : null}
              </View>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {localError ? (
              <AuthErrorBanner message={localError} onDismiss={() => setLocalError(null)} />
            ) : null}

            <AuthButton
              label="Create Account"
              icon="arrow-forward"
              loading={isLoading}
              onPress={handleCreateAccount}
            />
          </Animated.View>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
            <Text style={styles.footerText}>Already have an account?{' '}</Text>
            <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.7}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  card: {
    marginHorizontal: 20,
    marginTop: -30,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#3d0010',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -6,
    marginBottom: 18,
    gap: 10,
  },
  strengthTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.outlineVariant,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 52,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.onSurfaceVariant,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 15,
    color: Colors.onSurfaceVariant,
  },
  signInLink: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
});
