import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { colors, theme } from '@/constants/theme';
import { ClerkProvider, useAuth } from '@clerk/expo';
import { resourceCache } from '@clerk/expo/resource-cache';
import { tokenCache } from '@clerk/expo/token-cache';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import './global.css';

SplashScreen.preventAutoHideAsync();
WebBrowser.maybeCompleteAuthSession();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY');
}
const publishableKeyStrict: string = publishableKey;

function RootNavigator() {
  useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Tabs live under (tabs); /subscriptions/* (new, [id], edit) is the sibling stack. */}
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="subscriptions" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="session-task" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'sans-regular': require('@/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('@/assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('@/assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('@/assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-light': require('@/assets/fonts/PlusJakartaSans-Light.ttf'),
    'sans-extrabold': require('@/assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Ensure Android system bar contrast on light background.
    void SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, []);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <AppErrorBoundary>
      <ClerkProvider
        publishableKey={publishableKeyStrict}
        tokenCache={tokenCache}
        __experimental_resourceCache={resourceCache}
      >
        <RootNavigator />
        <StatusBar style="dark" backgroundColor={theme.colors.background} />
      </ClerkProvider>
    </AppErrorBoundary>
  );
}
