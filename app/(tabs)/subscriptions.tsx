import ListHeading from '@/components/ListHeading';
import SubscriptionCard from '@/components/SubscriptionCard';
import { icons } from '@/constants/icons';
import { theme } from '@/constants/theme';
import { useAppStoreHydrated } from '@/lib/subscriptions/hooks';
import { toUiSubscription } from '@/lib/subscriptions/selectors';
import { useAppStore } from '@/lib/subscriptions/store';
import type { SubscriptionStatus } from '@/lib/subscriptions/types';
import { router } from 'expo-router';
import { styled } from 'nativewind';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

const SafeAreaView = styled(RNSafeAreaView);

type Filter = 'active' | 'all';

function matchesFilter(status: SubscriptionStatus, filter: Filter): boolean {
  if (filter === 'all') return true;
  return status === 'active';
}

const Subscriptions = () => {
  const hydrated = useAppStoreHydrated();
  const subscriptions = useAppStore(useShallow((s) => s.subscriptions));
  const [filter, setFilter] = useState<Filter>('active');

  const list = useMemo(() => {
    return subscriptions
      .filter((s) => matchesFilter(s.status, filter))
      .map(toUiSubscription);
  }, [subscriptions, filter]);

  if (!hydrated) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="font-sans-medium text-muted-foreground">Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="mb-4 flex-row items-center justify-between gap-3">
        <Text className="flex-1 font-sans-bold text-2xl text-primary">
          Subscriptions
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add subscription"
          hitSlop={10}
          onPress={() => router.push('/subscriptions/new')}
        >
          <Image source={icons.add} className="size-8" resizeMode="contain" />
        </Pressable>
      </View>

      <View className="mb-5 flex-row gap-2">
        {(['active', 'all'] as const).map((key) => (
          <Pressable
            key={key}
            onPress={() => setFilter(key)}
            className={`rounded-full border-2 px-4 py-2 ${
              filter === key
                ? 'border-accent bg-muted'
                : 'border-border bg-card'
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === key }}
          >
            <Text className="font-sans-semibold capitalize text-primary">
              {key === 'active' ? 'Active' : 'All'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ListHeading
        title={filter === 'active' ? 'Active' : 'All subscriptions'}
      />

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            onPress={() => router.push(`/subscriptions/${item.id}`)}
          />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">
            {filter === 'active'
              ? 'No active subscriptions.'
              : 'No subscriptions yet.'}
          </Text>
        }
        contentContainerStyle={{ paddingBottom: theme.spacing[24] }}
      />
    </SafeAreaView>
  );
};

export default Subscriptions;
