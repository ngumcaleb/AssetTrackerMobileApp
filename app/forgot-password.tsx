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
  Linking,
  ActivityIndicator,
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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { forgotPassword, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
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

  const handleSendResetLink = async () => {
    if (!email.trim()) return;

    setIsSending(true);
    setLocalError(null);
    clearError();
    try {
      await forgotPassword(email.trim());
      setSentEmail(email.trim());
      setIsSuccess(true);
    } catch (e: any) {
      setLocalError(e?.message || 'Could not send reset link. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleResend = async () => {
    setIsSending(true);
    clearError();
    try {
      await forgotPassword(sentEmail);
    } catch {
      // Silently fail on resend
    } finally {
      setIsSending(false);
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
          {isSuccess ? (
            <AuthBrandHeader
              showBack
              onBack={() => router.back()}
              eyebrow="Request sent"
              title="Check your inbox"
              subtitle="Follow the link in the email to reset your password. The link expires shortly."
            />
          ) : (
            <AuthBrandHeader
              showBack
              onBack={() => router.back()}
              eyebrow="Account recovery"
              title="Reset your password"
              subtitle="Enter the email address associated with your account and we'll send you a reset link."
            />
          )}

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
            {isSuccess ? (
              <>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark" size={34} color="#ffffff" />
                </View>

                <Text style={styles.successTitle}>Email on its way</Text>
                <Text style={styles.successText}>
                  We&apos;ve sent a password reset link to{' '}
                  <Text style={styles.emailHighlight}>{sentEmail}</Text>. Please check your inbox
                  and spam folder.
                </Text>

                <TouchableOpacity
                  style={styles.outlinedButton}
                  activeOpacity={0.8}
                  onPress={() => Linking.openURL('mailto:')}
                >
                  <Ionicons name="mail-outline" size={20} color={Colors.primary} />
                  <Text style={styles.outlinedButtonText}>Open Mail App</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResend}
                  disabled={isSending}
                  activeOpacity={0.7}
                >
                  {isSending ? (
                    <ActivityIndicator color={Colors.primary} size="small" />
                  ) : (
                    <Text style={styles.resendText}>
                      Didn&apos;t receive the email?{' '}
                      <Text style={styles.resendBold}>Resend</Text>
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
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

                {localError ? (
                  <AuthErrorBanner message={localError} />
                ) : null}

                <AuthButton
                  label="Send Reset Link"
                  icon="arrow-forward"
                  loading={isSending}
                  disabled={!email.trim()}
                  onPress={handleSendResetLink}
                />
              </>
            )}
          </Animated.View>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
            <Ionicons name="chevron-back" size={16} color={Colors.primary} />
            <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.7}>
              <Text style={styles.backToSignIn}>Back to Sign In</Text>
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
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.onSurface,
    textAlign: 'center',
    marginBottom: 8,
  },
  successText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
  },
  emailHighlight: {
    fontWeight: '700',
    color: Colors.onSurface,
  },
  outlinedButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlinedButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  resendButton: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  resendText: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  resendBold: {
    fontWeight: '700',
    color: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  backToSignIn: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 2,
  },
});
