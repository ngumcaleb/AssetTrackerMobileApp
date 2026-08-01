import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { DrawerProvider } from '@/context/DrawerContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <DrawerProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#f8fafc' },
          }}
          initialRouteName="index"
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="login" />
          <Stack.Screen name="sign-up" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="register-asset" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="checkout-asset" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="checkin-asset" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="registration-success" options={{ presentation: 'modal', animation: 'fade_from_bottom' }} />
          <Stack.Screen name="archived-assets" />
          <Stack.Screen name="asset-history" />
          <Stack.Screen name="asset-detail" />
          <Stack.Screen name="asset-edit" />
          <Stack.Screen name="categories" />
          <Stack.Screen name="category-form" />
          <Stack.Screen name="checkouts" />
          <Stack.Screen name="checkout-detail" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="search" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="print-qr" />
        </Stack>
        <StatusBar style="dark" />
      </DrawerProvider>
    </AuthProvider>
  );
}


