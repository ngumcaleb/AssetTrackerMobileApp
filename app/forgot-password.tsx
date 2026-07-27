import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { forgotPassword, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const handleSendResetLink = async () => {
    if (!email.trim()) return;

    setIsSending(true);
    clearError();
    try {
      await forgotPassword(email.trim());
      setSentEmail(email.trim());
      setIsSuccess(true);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not send reset link. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleResend = async () => {
    setIsSending(true);
    clearError();
    try {
      await forgotPassword(sentEmail);
    } catch (e: any) {
      // Silently fail on resend
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={20} color={Colors.onBackground} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {!isSuccess ? (
            <>
              <View style={styles.iconCircle}>
                <Ionicons name="mail-outline" size={36} color={Colors.primary} />
              </View>

              <Text style={styles.headline}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Enter the email address associated with your account and we'll
                send you a link to reset your password.
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={Colors.outline} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. technician@scantrack.com"
                    placeholderTextColor={Colors.outlineVariant}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!email.trim() || isSending) && styles.primaryButtonDisabled,
                ]}
                onPress={handleSendResetLink}
                disabled={!email.trim() || isSending}
                activeOpacity={0.8}
              >
                {isSending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.primaryButtonText}>Send Reset Link</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark" size={40} color="#ffffff" />
              </View>

              <Text style={styles.headline}>Check Your Email</Text>
              <Text style={styles.subtitle}>
                We've sent a password reset link to{' '}
                <Text style={styles.emailHighlight}>{sentEmail}</Text>. Please
                check your inbox.
              </Text>

              <TouchableOpacity
                style={styles.outlinedButton}
                activeOpacity={0.8}
              >
                <Ionicons name="mail-outline" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.outlinedButtonText}>Open Mail App</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendLink}
                onPress={handleResend}
                disabled={isSending}
                activeOpacity={0.7}
              >
                {isSending ? (
                  <ActivityIndicator color={Colors.primary} size="small" />
                ) : (
                  <Text style={styles.resendText}>
                    Didn't receive the email?{' '}
                    <Text style={styles.resendBold}>Resend</Text>
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      <TouchableOpacity
        style={styles.bottomLink}
        onPress={() => router.push('/login')}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
        <Text style={styles.backToSignIn}>Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 12 : 36,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.onBackground,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onBackground,
    marginBottom: 8,
    letterSpacing: 0.05,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.onBackground,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.primaryContainer,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryContainer,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onPrimaryContainer,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emailHighlight: {
    fontWeight: '700',
    color: Colors.onBackground,
  },
  outlinedButton: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  outlinedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  resendLink: {
    padding: 12,
  },
  resendText: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
  },
  resendBold: {
    fontWeight: '700',
    color: Colors.primary,
  },
  bottomLink: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 24 : 32,
    padding: 12,
  },
  backToSignIn: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
});
