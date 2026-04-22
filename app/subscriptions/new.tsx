import SubscriptionForm from '@/components/SubscriptionForm';
import SubscriptionScreenHeader from '@/components/SubscriptionScreenHeader';
import { useAppStore } from '@/lib/subscriptions/store';
import type { SubscriptionInput } from '@/lib/subscriptions/types';
import { useAuth } from '@clerk/expo';
import { Redirect, router } from 'expo-router';
import { styled } from 'nativewind';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

export default function NewSubscriptionScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const defaultCurrency = useAppStore((s) => s.defaultCurrency);
  const addSubscription = useAppStore((s) => s.addSubscription);

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/sign-in" />;

  const onSubmit = (values: SubscriptionInput) => {
    addSubscription(values);
    router.back();
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={['top', 'left', 'right']}
    >
      <SubscriptionScreenHeader title="Add subscription" />
      <View className="flex-1 px-5 pt-4">
        <SubscriptionForm
          defaultCurrency={defaultCurrency}
          submitLabel="Save subscription"
          onSubmit={onSubmit}
          onCancel={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
}
