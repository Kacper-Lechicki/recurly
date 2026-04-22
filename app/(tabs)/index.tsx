import ListHeading from '@/components/ListHeading';
import SubscriptionCard from '@/components/SubscriptionCard';
import UpcomingSubscriptionCard from '@/components/UpcomingSubscriptionCard';
import UserAvatar from '@/components/UserAvatar';
import { icons } from '@/constants/icons';
import { useAppStoreHydrated } from '@/lib/subscriptions/hooks';
import {
    getDistinctCurrencies,
    getHomeBalance,
    getUpcomingRenewals,
    hasMultipleCurrencies,
    toUiSubscription,
} from '@/lib/subscriptions/selectors';
import { useAppStore } from '@/lib/subscriptions/store';
import { formatCurrency } from '@/lib/utils';
import { useUser } from '@clerk/expo';
import dayjs from 'dayjs';
import { router } from 'expo-router';
import { styled } from 'nativewind';
import { useMemo } from 'react';
import {
    FlatList,
    Image,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const hydrated = useAppStoreHydrated();
  const { subscriptions, defaultCurrency } = useAppStore(
    useShallow((s) => ({
      subscriptions: s.subscriptions,
      defaultCurrency: s.defaultCurrency,
    })),
  );
  const { isLoaded, user } = useUser();

  const displayName =
    isLoaded && user
      ? [user.firstName, user.lastName].filter(Boolean).join(' ') ||
        user.emailAddresses?.[0]?.emailAddress ||
        user.id
      : '—';

  const balance = useMemo(
    () => getHomeBalance(subscriptions, defaultCurrency),
    [subscriptions, defaultCurrency],
  );

  const upcoming = useMemo(
    () => getUpcomingRenewals(subscriptions),
    [subscriptions],
  );

  const homeList = useMemo(
    () => subscriptions.map(toUiSubscription),
    [subscriptions],
  );

  const multiCurrency = useMemo(
    () => hasMultipleCurrencies(subscriptions),
    [subscriptions],
  );

  const currencyListLabel = useMemo(() => {
    if (!multiCurrency) return '';
    return getDistinctCurrencies(subscriptions).join(', ');
  }, [subscriptions, multiCurrency]);

  const goToSubscriptionsTab = () => {
    router.push('/(tabs)/subscriptions');
  };

  if (!hydrated) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="font-sans-medium text-muted-foreground">Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user flex-1 min-w-0">
                <UserAvatar
                  uri={isLoaded ? user?.imageUrl : null}
                  fallbackText={displayName}
                  className="home-avatar"
                />
                <Text
                  className="home-user-name flex-1 min-w-0"
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add subscription"
                hitSlop={10}
                onPress={() => router.push('/subscriptions/new')}
              >
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Monthly spend</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(balance.amount, balance.currency)}
                </Text>

                <Text className="home-balance-date">
                  {balance.nextRenewalDate
                    ? dayjs(balance.nextRenewalDate).format('MM/DD')
                    : '—'}
                </Text>
              </View>
            </View>

            {multiCurrency ? (
              <Text className="mb-1 text-sm font-sans-medium text-muted-foreground">
                Totals use {defaultCurrency} only. You also have:{' '}
                {currencyListLabel}.
              </Text>
            ) : null}

            <View>
              <ListHeading
                title="Upcoming"
                onViewAllPress={goToSubscriptionsTab}
              />

              {upcoming.length === 0 ? (
                <Text className="home-empty-state">
                  No upcoming renewals yet.
                </Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
                >
                  {upcoming.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => router.push(`/subscriptions/${item.id}`)}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.name}, details`}
                    >
                      <UpcomingSubscriptionCard {...item} />
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>

            <ListHeading
              title="All Subscriptions"
              onViewAllPress={goToSubscriptionsTab}
            />
          </>
        )}
        data={homeList}
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
          <Text className="home-empty-state">No subscriptions yet.</Text>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
}
