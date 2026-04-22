import {
    AuthPrimaryButton,
    AuthSecondaryButton,
} from '@/components/auth/AuthButtons';
import AuthScreenShell from '@/components/auth/AuthScreenShell';
import { useAuth } from '@clerk/expo';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Text, View } from 'react-native';

const CLERK_DOCS_HOME = 'https://clerk.com/docs';

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

  const onOpenClerkDocs = () => {
    void WebBrowser.openBrowserAsync(CLERK_DOCS_HOME);
  };

  return (
    <AuthScreenShell
      header={
        <View className="auth-brand-block">
          <Text className="auth-title">Finish signing in</Text>
          <Text className="auth-subtitle">
            Your organization enabled an extra security step (session task:{' '}
            <Text className="font-sans-bold text-primary">
              {task ?? 'unknown'}
            </Text>
            ). This build of Recurly does not yet run that step inside the app.
          </Text>
        </View>
      }
    >
      <View className="auth-card">
        <View className="auth-form">
          <Text className="auth-helper">
            You can sign out and try another account, complete any pending steps
            in the Clerk dashboard for your instance, or read Clerk’s session
            task guide for what this requirement means.
          </Text>

          <AuthSecondaryButton
            onPress={onOpenClerkDocs}
            accessibilityLabel="Open Clerk session tasks documentation"
          >
            Open Clerk docs
          </AuthSecondaryButton>

          <AuthPrimaryButton disabled={!isLoaded} onPress={onSignOut}>
            Sign out
          </AuthPrimaryButton>
        </View>
      </View>
    </AuthScreenShell>
  );
}
