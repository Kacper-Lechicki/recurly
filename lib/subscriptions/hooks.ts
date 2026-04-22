import { useSyncExternalStore } from 'react';

import { useAppStore } from './store';

/**
 * Tracks Zustand persist hydration. Uses useSyncExternalStore so we never miss
 * a completed hydration that happened before subscribe (raw useEffect + onFinishHydration can race).
 */
export function useAppStoreHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (useAppStore.persist.hasHydrated()) {
        queueMicrotask(() => {
          onStoreChange();
        });
      }
      return useAppStore.persist.onFinishHydration(() => {
        onStoreChange();
      });
    },
    () => useAppStore.persist.hasHydrated(),
    () => false,
  );
}
