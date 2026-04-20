import { AuthPrimaryButton } from '@/components/auth/AuthButtons';
import AuthScreenShell from '@/components/auth/AuthScreenShell';
import { useAuth } from '@clerk/expo';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

export default function SessionTask() {
  const { task } = useLocalSearchParams<{ task?: string }>();
  const { isLoaded, isSignedIn, signOut } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/sign-in" />;

  const onSignOut = async () => {
    if (!isLoaded) return;
    await signOut();
    router.replace('/sign-in');
  };

  return (
    <AuthScreenShell
      header={
        <View className="auth-brand-block">
          <Text className="auth-title">Action required</Text>
          <Text className="auth-subtitle">
            To keep your account secure, we need one more step before you can
            continue.
          </Text>
        </View>
      }
    >
      <View className="auth-card">
        <View className="auth-form">
          <Text className="auth-helper">
            Task:{' '}
            <Text className="font-sans-bold text-primary">
              {task ?? 'unknown'}
            </Text>
          </Text>
          <Text className="auth-helper">
            This app doesn’t support completing this step yet. Please contact
            support or sign out and try again.
          </Text>

          <AuthPrimaryButton disabled={!isLoaded} onPress={onSignOut}>
            Sign out
          </AuthPrimaryButton>
        </View>
      </View>
    </AuthScreenShell>
  );
}
