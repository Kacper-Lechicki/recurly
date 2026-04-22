import type { IconKey } from '@/constants/icons';

export type SubscriptionBilling = 'Monthly' | 'Yearly';

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface StoredSubscription {
  id: string;
  iconKey: IconKey;
  name: string;
  plan?: string;
  category?: string;
  paymentMethod?: string;
  status: SubscriptionStatus;
  startDate?: string;
  price: number;
  currency: string;
  billing: SubscriptionBilling;
  renewalDate?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionInput {
  iconKey: IconKey;
  name: string;
  plan?: string;
  category?: string;
  paymentMethod?: string;
  status: SubscriptionStatus;
  startDate?: string;
  price: number;
  currency: string;
  billing: SubscriptionBilling;
  renewalDate?: string;
  color?: string;
}
