import { resolveIconKey } from './icon-map';
import type {
    StoredSubscription,
    SubscriptionBilling,
    SubscriptionStatus,
} from './types';

const BILLING: SubscriptionBilling[] = ['Monthly', 'Yearly'];
const STATUS: SubscriptionStatus[] = ['active', 'paused', 'cancelled'];

function normalizeBilling(v: unknown): SubscriptionBilling {
  if (v === 'Yearly' || v === 'Monthly') return v;
  if (typeof v === 'string') {
    const m = BILLING.find((b) => b.toLowerCase() === v.toLowerCase());
    if (m) return m;
  }
  return 'Monthly';
}

function normalizeStatus(v: unknown): SubscriptionStatus {
  if (v === 'active' || v === 'paused' || v === 'cancelled') return v;
  if (typeof v === 'string') {
    const s = STATUS.find((x) => x === v.toLowerCase());
    if (s) return s;
  }
  return 'active';
}

function normalizeIsoDate(v: unknown): string | undefined {
  if (typeof v !== 'string' || !v.trim()) return undefined;
  const t = v.trim();
  if (Number.isNaN(Date.parse(t))) return undefined;
  return t;
}

function normalizeCurrency(v: unknown): string {
  if (typeof v !== 'string' || !v.trim()) return 'USD';
  const u = v.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(u) ? u : 'USD';
}

function normalizeColor(v: unknown): string | undefined {
  if (typeof v !== 'string' || !v.trim()) return undefined;
  const t = v.trim();
  return /^#[0-9A-Fa-f]{6}$/.test(t) ? t : undefined;
}

const nowIso = () => new Date().toISOString();

/**
 * Coerces unknown JSON into a valid StoredSubscription or returns null.
 */
export function sanitizeSubscriptionRow(
  raw: unknown,
): StoredSubscription | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;

  const id = typeof o.id === 'string' && o.id.trim() ? o.id.trim() : null;
  if (!id) return null;

  const name =
    typeof o.name === 'string' && o.name.trim()
      ? o.name.trim()
      : 'Subscription';

  const priceRaw = o.price;
  const price =
    typeof priceRaw === 'number' && Number.isFinite(priceRaw) && priceRaw >= 0
      ? priceRaw
      : typeof priceRaw === 'string' && priceRaw.trim()
        ? Number.parseFloat(priceRaw.replace(',', '.'))
        : NaN;
  if (!Number.isFinite(price) || price < 0) return null;

  const ts = nowIso();
  const createdAt =
    typeof o.createdAt === 'string' && o.createdAt ? o.createdAt : ts;
  const updatedAt =
    typeof o.updatedAt === 'string' && o.updatedAt ? o.updatedAt : ts;

  return {
    id,
    iconKey: resolveIconKey(
      typeof o.iconKey === 'string' ? o.iconKey : 'notion',
    ),
    name,
    plan:
      typeof o.plan === 'string' && o.plan.trim() ? o.plan.trim() : undefined,
    category:
      typeof o.category === 'string' && o.category.trim()
        ? o.category.trim()
        : undefined,
    paymentMethod:
      typeof o.paymentMethod === 'string' && o.paymentMethod.trim()
        ? o.paymentMethod.trim()
        : undefined,
    status: normalizeStatus(o.status),
    startDate: normalizeIsoDate(o.startDate),
    price,
    currency: normalizeCurrency(o.currency),
    billing: normalizeBilling(o.billing),
    renewalDate: normalizeIsoDate(o.renewalDate),
    color: normalizeColor(o.color),
    createdAt,
    updatedAt,
  };
}

export function sanitizeSubscriptions(raw: unknown): StoredSubscription[] {
  if (!Array.isArray(raw)) return [];
  const out: StoredSubscription[] = [];
  for (const item of raw) {
    const row = sanitizeSubscriptionRow(item);
    if (row) out.push(row);
  }
  return out;
}

export function sanitizePersistedSlice(p: unknown): {
  subscriptions: StoredSubscription[];
  defaultCurrency: string;
  hasCompletedOnboarding: boolean;
} {
  if (!p || typeof p !== 'object') {
    return {
      subscriptions: [],
      defaultCurrency: 'USD',
      hasCompletedOnboarding: false,
    };
  }
  const o = p as Record<string, unknown>;
  return {
    subscriptions: sanitizeSubscriptions(o.subscriptions),
    defaultCurrency: normalizeCurrency(o.defaultCurrency),
    hasCompletedOnboarding: Boolean(o.hasCompletedOnboarding),
  };
}
