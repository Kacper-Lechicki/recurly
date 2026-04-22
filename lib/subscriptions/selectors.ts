import dayjs from 'dayjs';

import { icons } from '@/constants/icons';
import type { ImageSourcePropType } from 'react-native';

import { resolveIconKey } from './icon-map';
import type { StoredSubscription } from './types';

export function monthlyEquivalent(
  price: number,
  billing: StoredSubscription['billing'],
): number {
  if (billing === 'Yearly') return price / 12;
  return price;
}

export function countsTowardSpend(s: StoredSubscription): boolean {
  return s.status === 'active';
}

export function countsTowardUpcoming(s: StoredSubscription): boolean {
  if (s.status === 'cancelled') return false;
  if (!s.renewalDate) return false;
  const d = dayjs(s.renewalDate);
  return d.isValid() && !d.isBefore(dayjs(), 'day');
}

export function getTotalMonthlyEquivalent(
  list: StoredSubscription[],
  currency: string,
): number {
  return list
    .filter(countsTowardSpend)
    .filter((s) => s.currency === currency)
    .reduce((sum, s) => sum + monthlyEquivalent(s.price, s.billing), 0);
}

export interface HomeBalance {
  amount: number;
  currency: string;
  nextRenewalDate: string | null;
}

export function getHomeBalance(
  list: StoredSubscription[],
  defaultCurrency: string,
): HomeBalance {
  const spenders = list
    .filter(countsTowardSpend)
    .filter((s) => s.currency === defaultCurrency);
  const amount = spenders.reduce(
    (sum, s) => sum + monthlyEquivalent(s.price, s.billing),
    0,
  );

  let next: string | null = null;
  for (const s of list.filter(countsTowardUpcoming)) {
    if (!s.renewalDate) continue;
    if (!next || dayjs(s.renewalDate).isBefore(dayjs(next))) {
      next = s.renewalDate;
    }
  }

  return { amount, currency: defaultCurrency, nextRenewalDate: next };
}

export interface UpcomingRow {
  id: string;
  icon: ImageSourcePropType;
  name: string;
  price: number;
  currency: string;
  daysLeft: number;
}

export function getUpcomingRenewals(
  list: StoredSubscription[],
  limit = 20,
): UpcomingRow[] {
  const rows: UpcomingRow[] = [];

  for (const s of list) {
    if (!countsTowardUpcoming(s) || !s.renewalDate) continue;
    const end = dayjs(s.renewalDate).endOf('day');
    const daysLeft = Math.max(0, end.diff(dayjs(), 'day'));
    const iconKey = resolveIconKey(s.iconKey);
    rows.push({
      id: s.id,
      icon: icons[iconKey],
      name: s.name,
      price: s.price,
      currency: s.currency,
      daysLeft,
    });
  }

  rows.sort((a, b) => a.daysLeft - b.daysLeft);
  return rows.slice(0, limit);
}

export function toUiSubscription(s: StoredSubscription): Subscription {
  const iconKey = resolveIconKey(s.iconKey);
  return {
    id: s.id,
    icon: icons[iconKey],
    name: s.name,
    plan: s.plan,
    category: s.category,
    paymentMethod: s.paymentMethod,
    status: s.status,
    startDate: s.startDate,
    price: s.price,
    currency: s.currency,
    billing: s.billing,
    renewalDate: s.renewalDate,
    color: s.color,
  };
}

export interface CategorySpend {
  category: string;
  monthly: number;
}

export function getSpendByCategory(
  list: StoredSubscription[],
  currency: string,
): CategorySpend[] {
  const map = new Map<string, number>();
  for (const s of list
    .filter(countsTowardSpend)
    .filter((x) => x.currency === currency)) {
    const cat = s.category?.trim() || 'Uncategorized';
    const m = monthlyEquivalent(s.price, s.billing);
    map.set(cat, (map.get(cat) ?? 0) + m);
  }
  return [...map.entries()]
    .map(([category, monthly]) => ({ category, monthly }))
    .sort((a, b) => b.monthly - a.monthly);
}

export function getTopSubscriptionsByMonthly(
  list: StoredSubscription[],
  currency: string,
  limit = 3,
): { name: string; monthly: number }[] {
  const rows = list
    .filter(countsTowardSpend)
    .filter((s) => s.currency === currency)
    .map((s) => ({
      name: s.name,
      monthly: monthlyEquivalent(s.price, s.billing),
    }))
    .sort((a, b) => b.monthly - a.monthly);
  return rows.slice(0, limit);
}

export function getDistinctCurrencies(list: StoredSubscription[]): string[] {
  const set = new Set<string>();
  for (const s of list) {
    const c = s.currency?.trim().toUpperCase();
    if (c) set.add(c);
  }
  return [...set].sort();
}

export function hasMultipleCurrencies(list: StoredSubscription[]): boolean {
  return getDistinctCurrencies(list).length > 1;
}
