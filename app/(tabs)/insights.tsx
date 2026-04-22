import { theme } from '@/constants/theme';
import { useAppStoreHydrated } from '@/lib/subscriptions/hooks';
import {
    getDistinctCurrencies,
    getSpendByCategory,
    getTopSubscriptionsByMonthly,
    getTotalMonthlyEquivalent,
    hasMultipleCurrencies,
} from '@/lib/subscriptions/selectors';
import { useAppStore } from '@/lib/subscriptions/store';
import { formatCurrency } from '@/lib/utils';
import { styled } from 'nativewind';
import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { useShallow } from 'zustand/react/shallow';

const SafeAreaView = styled(RNSafeAreaView);

const Insights = () => {
  const hydrated = useAppStoreHydrated();
  const { subscriptions, defaultCurrency } = useAppStore(
    useShallow((s) => ({
      subscriptions: s.subscriptions,
      defaultCurrency: s.defaultCurrency,
    })),
  );

  const activeCount = useMemo(
    () => subscriptions.filter((s) => s.status === 'active').length,
    [subscriptions],
  );

  const monthlyTotal = useMemo(
    () => getTotalMonthlyEquivalent(subscriptions, defaultCurrency),
    [subscriptions, defaultCurrency],
  );

  const byCategory = useMemo(
    () => getSpendByCategory(subscriptions, defaultCurrency),
    [subscriptions, defaultCurrency],
  );

  const top = useMemo(
    () => getTopSubscriptionsByMonthly(subscriptions, defaultCurrency, 5),
    [subscriptions, defaultCurrency],
  );

  const multiCurrency = useMemo(
    () => hasMultipleCurrencies(subscriptions),
    [subscriptions],
  );

  const currencyListLabel = useMemo(() => {
    if (!multiCurrency) return '';
    return getDistinctCurrencies(subscriptions).join(', ');
  }, [subscriptions, multiCurrency]);

  if (!hydrated) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <Text className="font-sans-medium text-muted-foreground">Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="font-sans-bold text-2xl text-primary">Insights</Text>
      <Text className="mt-1 font-sans-medium text-sm text-muted-foreground">
        Based on active subscriptions in {defaultCurrency}. Yearly plans are
        normalized to a monthly amount.
      </Text>
      {multiCurrency ? (
        <Text className="mt-2 font-sans-medium text-sm text-muted-foreground">
          Other currencies in your list ({currencyListLabel}) are not included
          in these totals.
        </Text>
      ) : null}

      <ScrollView
        className="mt-6 flex-1"
        contentContainerStyle={{ paddingBottom: theme.spacing[24] }}
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-3xl border border-border bg-card p-5">
          <Text className="font-sans-medium text-sm text-muted-foreground">
            Estimated monthly spend
          </Text>
          <Text className="mt-2 font-sans-extrabold text-3xl text-primary">
            {formatCurrency(monthlyTotal, defaultCurrency)}
          </Text>
          <Text className="mt-3 font-sans-medium text-sm text-muted-foreground">
            Active subscriptions:{' '}
            <Text className="font-sans-bold text-primary">{activeCount}</Text>
          </Text>
        </View>

        <Text className="mb-3 mt-8 font-sans-bold text-lg text-primary">
          Top subscriptions
        </Text>
        <View className="rounded-3xl border border-border bg-card p-5">
          {top.length === 0 ? (
            <Text className="font-sans-medium text-muted-foreground">
              Add subscriptions to see rankings.
            </Text>
          ) : (
            top.map((row, i) => (
              <View
                key={`${row.name}-${i}`}
                className={`flex-row items-center justify-between py-3 ${
                  i < top.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <Text
                  className="mr-3 flex-1 font-sans-semibold text-primary"
                  numberOfLines={1}
                >
                  {row.name}
                </Text>
                <Text className="font-sans-bold text-primary">
                  {formatCurrency(row.monthly, defaultCurrency)}/mo
                </Text>
              </View>
            ))
          )}
        </View>

        <Text className="mb-3 mt-8 font-sans-bold text-lg text-primary">
          By category
        </Text>
        <View className="rounded-3xl border border-border bg-card p-5">
          {byCategory.length === 0 ? (
            <Text className="font-sans-medium text-muted-foreground">
              No category data yet.
            </Text>
          ) : (
            byCategory.map((row, i) => (
              <View
                key={row.category}
                className={`flex-row items-center justify-between py-3 ${
                  i < byCategory.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <Text
                  className="mr-3 flex-1 font-sans-semibold text-primary"
                  numberOfLines={1}
                >
                  {row.category}
                </Text>
                <Text className="font-sans-bold text-primary">
                  {formatCurrency(row.monthly, defaultCurrency)}/mo
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;
