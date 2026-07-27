import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="register-asset" options={{ presentation: 'modal' }} />
        <Stack.Screen name="checkout-asset" options={{ presentation: 'modal' }} />
        <Stack.Screen name="checkin-asset" options={{ presentation: 'modal' }} />
        <Stack.Screen name="archived-assets" />
        <Stack.Screen name="asset-history" />
        <Stack.Screen name="asset-detail" />
        <Stack.Screen name="categories" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="search" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="registration-success" options={{ presentation: 'modal' }} />
        <Stack.Screen name="print-qr" />
      </Stack>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}
