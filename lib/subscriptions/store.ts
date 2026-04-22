import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { sanitizePersistedSlice } from './sanitize';
import type { StoredSubscription, SubscriptionInput } from './types';

/** Bump when persisted shape changes; implement migrate below. */
export const PERSIST_VERSION = 1;

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

interface AppPersistState {
  subscriptions: StoredSubscription[];
  defaultCurrency: string;
  hasCompletedOnboarding: boolean;
}

interface AppActions {
  addSubscription: (input: SubscriptionInput) => string;
  updateSubscription: (id: string, input: Partial<SubscriptionInput>) => void;
  removeSubscription: (id: string) => void;
  getById: (id: string) => StoredSubscription | undefined;
  setDefaultCurrency: (code: string) => void;
  setHasCompletedOnboarding: (done: boolean) => void;
}

export type AppStore = AppPersistState & AppActions;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      defaultCurrency: 'USD',
      hasCompletedOnboarding: false,

      addSubscription: (input) => {
        const id = newId();
        const ts = nowIso();
        const row: StoredSubscription = {
          id,
          iconKey: input.iconKey,
          name: input.name.trim(),
          plan: input.plan?.trim() || undefined,
          category: input.category?.trim() || undefined,
          paymentMethod: input.paymentMethod?.trim() || undefined,
          status: input.status,
          startDate: input.startDate,
          price: input.price,
          currency: input.currency.trim().toUpperCase() || 'USD',
          billing: input.billing,
          renewalDate: input.renewalDate,
          color: input.color,
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({ subscriptions: [...s.subscriptions, row] }));
        return id;
      },

      updateSubscription: (id, input) => {
        set((s) => ({
          subscriptions: s.subscriptions.map((row) => {
            if (row.id !== id) return row;
            const ts = nowIso();
            return {
              ...row,
              ...(input.iconKey !== undefined
                ? { iconKey: input.iconKey }
                : {}),
              ...(input.name !== undefined ? { name: input.name.trim() } : {}),
              ...(input.plan !== undefined
                ? { plan: input.plan.trim() || undefined }
                : {}),
              ...(input.category !== undefined
                ? { category: input.category.trim() || undefined }
                : {}),
              ...(input.paymentMethod !== undefined
                ? { paymentMethod: input.paymentMethod.trim() || undefined }
                : {}),
              ...(input.status !== undefined ? { status: input.status } : {}),
              ...(input.startDate !== undefined
                ? { startDate: input.startDate }
                : {}),
              ...(input.price !== undefined ? { price: input.price } : {}),
              ...(input.currency !== undefined
                ? {
                    currency:
                      input.currency.trim().toUpperCase() || row.currency,
                  }
                : {}),
              ...(input.billing !== undefined
                ? { billing: input.billing }
                : {}),
              ...(input.renewalDate !== undefined
                ? { renewalDate: input.renewalDate }
                : {}),
              ...(input.color !== undefined ? { color: input.color } : {}),
              updatedAt: ts,
            };
          }),
        }));
      },

      removeSubscription: (id) => {
        set((s) => ({
          subscriptions: s.subscriptions.filter((row) => row.id !== id),
        }));
      },

      getById: (id) => get().subscriptions.find((row) => row.id === id),

      setDefaultCurrency: (code) => {
        set({ defaultCurrency: code.trim().toUpperCase() || 'USD' });
      },

      setHasCompletedOnboarding: (done) => {
        set({ hasCompletedOnboarding: done });
      },
    }),
    {
      name: 'recurly-app',
      version: PERSIST_VERSION,
      migrate: (persisted) => {
        // When PERSIST_VERSION changes, normalize here. Same sanitizer as merge.
        return sanitizePersistedSlice(
          persisted && typeof persisted === 'object' ? persisted : {},
        );
      },
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        subscriptions: s.subscriptions,
        defaultCurrency: s.defaultCurrency,
        hasCompletedOnboarding: s.hasCompletedOnboarding,
      }),
      merge: (persisted, current) => {
        const slice = sanitizePersistedSlice(persisted);
        return {
          ...current,
          subscriptions: slice.subscriptions,
          defaultCurrency: slice.defaultCurrency,
          hasCompletedOnboarding: slice.hasCompletedOnboarding,
        };
      },
      onRehydrateStorage: () => (_state, error) => {
        if (error !== undefined && __DEV__) {
          console.warn('[recurly-app] persist rehydration failed:', error);
        }
      },
    },
  ),
);
