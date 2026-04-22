import { icons, type IconKey } from '@/constants/icons';

/** Icons suitable for subscription logos (excludes UI chrome). */
export const SUBSCRIPTION_ICON_KEYS = [
  'notion',
  'dropbox',
  'openai',
  'adobe',
  'medium',
  'figma',
  'spotify',
  'github',
  'claude',
  'canva',
] as const satisfies readonly IconKey[];

export type SubscriptionIconKey = (typeof SUBSCRIPTION_ICON_KEYS)[number];

export const DEFAULT_SUBSCRIPTION_ICON_KEY: SubscriptionIconKey = 'notion';

export function isSubscriptionIconKey(key: string): key is SubscriptionIconKey {
  return (SUBSCRIPTION_ICON_KEYS as readonly string[]).includes(key);
}

export function resolveIconKey(key: string): IconKey {
  if (key in icons) return key as IconKey;
  return DEFAULT_SUBSCRIPTION_ICON_KEY;
}
