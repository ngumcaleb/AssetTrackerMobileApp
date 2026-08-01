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

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setLocalError(null);
    clearError();
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e?.message || 'Invalid credentials. Please try again.';
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
            eyebrow="Welcome back"
            title="Sign in to your account"
            subtitle="Track, verify, and manage your enterprise assets from anywhere."
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
              label="Email address"
              icon="mail-outline"
              placeholder="name@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            <AuthField
              label="Password"
              labelRight={
                <TouchableOpacity onPress={() => router.push('/forgot-password')} activeOpacity={0.7}>
                  <Text style={styles.forgotLink}>Forgot?</Text>
                </TouchableOpacity>
              }
              icon="lock-closed-outline"
              placeholder="Enter your password"
              secure
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />

            {localError ? (
              <AuthErrorBanner message={localError} onDismiss={() => setLocalError(null)} />
            ) : null}

            <AuthButton
              label="Sign In"
              icon="arrow-forward"
              loading={isLoading}
              onPress={handleLogin}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                <Ionicons name="logo-google" size={20} color="#4285F4" />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7}>
                <Ionicons name="people-outline" size={20} color={Colors.primary} />
                <Text style={styles.socialText}>SSO</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
            <Text style={styles.footerText}>
              Don&apos;t have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/sign-up')} activeOpacity={0.7}>
              <Text style={styles.signUpLink}>Sign Up</Text>
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
  forgotLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.05,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.outlineVariant,
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.08,
    color: Colors.outline,
    textTransform: 'uppercase',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
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
  signUpLink: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
});
