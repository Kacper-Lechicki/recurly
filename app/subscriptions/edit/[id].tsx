import SubscriptionForm from '@/components/SubscriptionForm';
import SubscriptionScreenHeader from '@/components/SubscriptionScreenHeader';
import type { SubscriptionIconKey } from '@/lib/subscriptions/icon-map';
import { isSubscriptionIconKey } from '@/lib/subscriptions/icon-map';
import { useAppStore } from '@/lib/subscriptions/store';
import type { SubscriptionInput } from '@/lib/subscriptions/types';
import { useAuth } from '@clerk/expo';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { styled } from 'nativewind';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

export default function EditSubscriptionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLoaded, isSignedIn } = useAuth();
  const defaultCurrency = useAppStore((s) => s.defaultCurrency);
  const getById = useAppStore((s) => s.getById);
  const updateSubscription = useAppStore((s) => s.updateSubscription);

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/sign-in" />;

  const row = id ? getById(id) : undefined;

  if (!row) {
    return (
      <SafeAreaView
        className="flex-1 bg-background"
        edges={['top', 'left', 'right']}
      >
        <SubscriptionScreenHeader title="Edit subscription" />
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-center font-sans-medium text-muted-foreground">
            This subscription no longer exists.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const iconKey: SubscriptionIconKey = isSubscriptionIconKey(row.iconKey)
    ? row.iconKey
    : 'notion';

  const initial: Partial<SubscriptionInput> & { iconKey: SubscriptionIconKey } =
    {
      iconKey,
      name: row.name,
      plan: row.plan,
      category: row.category,
      paymentMethod: row.paymentMethod,
      status: row.status,
      startDate: row.startDate,
      price: row.price,
      currency: row.currency,
      billing: row.billing,
      renewalDate: row.renewalDate,
      color: row.color,
    };

  const onSubmit = (values: SubscriptionInput) => {
    if (!id) return;
    updateSubscription(id, values);
    router.back();
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={['top', 'left', 'right']}
    >
      <SubscriptionScreenHeader title="Edit subscription" />
      <View className="flex-1 px-5 pt-4">
        <SubscriptionForm
          initial={initial}
          defaultCurrency={defaultCurrency}
          submitLabel="Update subscription"
          onSubmit={onSubmit}
          onCancel={() => router.back()}
        />
      </View>
    </SafeAreaView>
  );
}
