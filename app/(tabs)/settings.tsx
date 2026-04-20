import { AuthPrimaryButton } from '@/components/auth/AuthButtons';
import { theme } from '@/constants/theme';
import { useAuth, useUser } from '@clerk/expo';
import { router } from 'expo-router';
import { styled } from 'nativewind';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import {
    SafeAreaView as RNSafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { isLoaded, signOut } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const insets = useSafeAreaInsets();

  const onLogout = async () => {
    if (!isLoaded) return;
    await signOut();
    router.replace('/sign-in');
  };

  const bottomPadding =
    (insets.bottom ?? 0) + theme.components.tabBar.height + theme.spacing[6];

  const primaryEmail =
    userLoaded && user?.emailAddresses?.length
      ? user.emailAddresses[0]?.emailAddress
      : null;
  const displayName =
    userLoaded && user
      ? [user.firstName, user.lastName].filter(Boolean).join(' ')
      : null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: theme.spacing[5],
          paddingTop: theme.spacing[5],
          paddingBottom: bottomPadding,
        }}
      >
        <Text className="text-2xl font-sans-bold text-primary">Settings</Text>

        <View className="mt-5 rounded-3xl border border-border bg-card p-5">
          <Text className="text-lg font-sans-bold text-primary">Account</Text>

          {!userLoaded ? (
            <Text className="mt-2 text-sm font-sans-medium text-muted-foreground">
              Loading account…
            </Text>
          ) : (
            <View className="mt-4 gap-3">
              <View className="flex-row items-center justify-between gap-3">
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  Name
                </Text>
                <Text
                  className="flex-1 text-right text-sm font-sans-semibold text-primary"
                  numberOfLines={1}
                >
                  {displayName || '—'}
                </Text>
              </View>

              <View className="flex-row items-center justify-between gap-3">
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  Email
                </Text>
                <Text
                  className="flex-1 text-right text-sm font-sans-semibold text-primary"
                  numberOfLines={1}
                >
                  {primaryEmail || '—'}
                </Text>
              </View>

              <View className="flex-row items-center justify-between gap-3">
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  User ID
                </Text>
                <Text
                  className="flex-1 text-right text-sm font-sans-semibold text-primary"
                  numberOfLines={1}
                >
                  {user?.id ?? '—'}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="mt-6">
          <AuthPrimaryButton disabled={!isLoaded} onPress={onLogout}>
            Log out
          </AuthPrimaryButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
