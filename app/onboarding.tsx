import { AuthPrimaryButton } from '@/components/auth/AuthButtons';
import AuthTextField from '@/components/auth/AuthTextField';
import { colors, theme } from '@/constants/theme';
import { useAppStoreHydrated } from '@/lib/subscriptions/hooks';
import { useAppStore } from '@/lib/subscriptions/store';
import { validateCurrency } from '@/lib/subscriptions/validation';
import { useAuth } from '@clerk/expo';
import { Redirect, router } from 'expo-router';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import {
    SafeAreaView as RNSafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

const Onboarding = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const hydrated = useAppStoreHydrated();
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const defaultCurrency = useAppStore((s) => s.defaultCurrency);
  const setDefaultCurrency = useAppStore((s) => s.setDefaultCurrency);
  const setHasCompletedOnboarding = useAppStore(
    (s) => s.setHasCompletedOnboarding,
  );

  const [currency, setCurrency] = useState(defaultCurrency);
  const [currencyError, setCurrencyError] = useState<string | undefined>();

  const insets = useSafeAreaInsets();

  if (!isLoaded || !hydrated) {
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
  if (!isSignedIn) return <Redirect href="/sign-in" />;
  if (hasCompletedOnboarding) return <Redirect href="/" />;

  const onContinue = () => {
    const err = validateCurrency(currency);
    if (err) {
      setCurrencyError(err);
      return;
    }
    setCurrencyError(undefined);
    setDefaultCurrency(currency.trim());
    setHasCompletedOnboarding(true);
    router.replace('/');
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: theme.spacing[5],
          paddingTop: theme.spacing[8],
          paddingBottom: (insets.bottom ?? 0) + theme.spacing[10],
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-sans-extrabold text-3xl text-primary">
          Welcome to Recurly
        </Text>
        <Text className="mt-3 font-sans-medium text-base leading-6 text-muted-foreground">
          Track renewals and monthly spend. Your subscriptions stay on this
          device until you choose to sync elsewhere.
        </Text>

        <View className="mt-10">
          <AuthTextField
            label="Default currency"
            value={currency}
            onChangeText={(v) => {
              setCurrency(v);
              setCurrencyError(undefined);
            }}
            placeholder="USD"
            error={currencyError}
            autoCapitalize="characters"
          />
        </View>

        <View className="mt-10">
          <AuthPrimaryButton onPress={onContinue} accessibilityLabel="Continue">
            Continue
          </AuthPrimaryButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Onboarding;
