import {
    AuthPrimaryButton,
    AuthSecondaryButton,
} from '@/components/auth/AuthButtons';
import SubscriptionScreenHeader from '@/components/SubscriptionScreenHeader';
import { theme } from '@/constants/theme';
import { toUiSubscription } from '@/lib/subscriptions/selectors';
import { useAppStore } from '@/lib/subscriptions/store';
import {
    formatCurrency,
    formatStatusLabel,
    formatSubscriptionDateTime,
} from '@/lib/utils';
import { useAuth } from '@clerk/expo';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { styled } from 'nativewind';
import React from 'react';
import { Alert, Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

const SubscriptionDetails = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const getById = useAppStore((s) => s.getById);
  const removeSubscription = useAppStore((s) => s.removeSubscription);

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/sign-in" />;

  const row = id ? getById(id) : undefined;

  if (!row) {
    return (
      <SafeAreaView
        className="flex-1 bg-background"
        edges={['top', 'left', 'right']}
      >
        <SubscriptionScreenHeader title="Subscription" />
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-center font-sans-medium text-muted-foreground">
            Subscription not found.
          </Text>
          <AuthPrimaryButton
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            Go back
          </AuthPrimaryButton>
        </View>
      </SafeAreaView>
    );
  }

  const sub = toUiSubscription(row);

  const onDelete = () => {
    Alert.alert('Remove subscription', `Remove “${sub.name}” from your list?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeSubscription(row.id);
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={['top', 'left', 'right']}
    >
      <SubscriptionScreenHeader title={sub.name} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: theme.spacing[5],
          paddingTop: theme.spacing[4],
          paddingBottom: theme.spacing[10],
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="rounded-3xl border border-border p-5"
          style={
            sub.color
              ? { backgroundColor: sub.color }
              : { backgroundColor: theme.colors.card }
          }
        >
          <View className="flex-row items-center gap-4">
            <Image source={sub.icon} className="sub-icon" />
            <View className="min-w-0 flex-1">
              <Text
                className="font-sans-bold text-xl text-primary"
                numberOfLines={2}
              >
                {sub.name}
              </Text>
              <Text className="mt-1 font-sans-semibold text-primary">
                {formatCurrency(sub.price, sub.currency)} · {sub.billing}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-6 gap-4 rounded-3xl border border-border bg-card p-5">
          {!!sub.plan?.trim() && <Row label="Plan" value={sub.plan} />}
          {!!sub.category?.trim() && (
            <Row label="Category" value={sub.category} />
          )}
          {!!sub.paymentMethod?.trim() && (
            <Row label="Payment" value={sub.paymentMethod} />
          )}
          {!!sub.startDate && (
            <Row
              label="Started"
              value={formatSubscriptionDateTime(sub.startDate)}
            />
          )}
          {!!sub.renewalDate && (
            <Row
              label="Renewal"
              value={formatSubscriptionDateTime(sub.renewalDate)}
            />
          )}
          {!!sub.status && (
            <Row label="Status" value={formatStatusLabel(sub.status)} />
          )}
        </View>

        <View className="mt-6 gap-3">
          <AuthPrimaryButton
            onPress={() => router.push(`/subscriptions/edit/${row.id}`)}
            accessibilityLabel="Edit subscription"
          >
            Edit
          </AuthPrimaryButton>
          <AuthSecondaryButton
            onPress={onDelete}
            accessibilityLabel="Remove subscription"
          >
            Remove
          </AuthSecondaryButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-3">
      <Text className="font-sans-medium text-muted-foreground">{label}</Text>
      <Text className="max-w-[65%] text-right font-sans-semibold text-primary">
        {value}
      </Text>
    </View>
  );
}

export default SubscriptionDetails;
