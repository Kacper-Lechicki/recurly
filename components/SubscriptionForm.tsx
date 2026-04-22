import {
    AuthPrimaryButton,
    AuthSecondaryButton,
} from '@/components/auth/AuthButtons';
import AuthTextField from '@/components/auth/AuthTextField';
import { icons } from '@/constants/icons';
import {
    DEFAULT_SUBSCRIPTION_ICON_KEY,
    SUBSCRIPTION_ICON_KEYS,
    type SubscriptionIconKey,
} from '@/lib/subscriptions/icon-map';
import type { SubscriptionInput } from '@/lib/subscriptions/types';
import {
    parsePrice,
    validateColorOptional,
    validateCurrency,
    validateDateOptional,
    validateName,
    validateRenewalDate,
} from '@/lib/subscriptions/validation';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

type SubscriptionFormProps = {
  initial?: Partial<SubscriptionInput> & { iconKey?: SubscriptionIconKey };
  defaultCurrency: string;
  submitLabel: string;
  onSubmit: (values: SubscriptionInput) => void;
  onCancel: () => void;
};

const STATUS_OPTIONS: { value: SubscriptionInput['status']; label: string }[] =
  [
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

export default function SubscriptionForm({
  initial,
  defaultCurrency,
  submitLabel,
  onSubmit,
  onCancel,
}: SubscriptionFormProps) {
  const [iconKey, setIconKey] = useState<SubscriptionIconKey>(
    initial?.iconKey ?? DEFAULT_SUBSCRIPTION_ICON_KEY,
  );
  const [name, setName] = useState(initial?.name ?? '');
  const [plan, setPlan] = useState(initial?.plan ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [paymentMethod, setPaymentMethod] = useState(
    initial?.paymentMethod ?? '',
  );
  const [status, setStatus] = useState<SubscriptionInput['status']>(
    initial?.status ?? 'active',
  );
  const [startDate, setStartDate] = useState(
    initial?.startDate?.slice(0, 10) ?? '',
  );
  const [price, setPrice] = useState(
    initial?.price !== undefined ? String(initial.price) : '',
  );
  const [currency, setCurrency] = useState(
    initial?.currency ?? defaultCurrency,
  );
  const [billing, setBilling] = useState<SubscriptionInput['billing']>(
    initial?.billing ?? 'Monthly',
  );
  const [renewalDate, setRenewalDate] = useState(
    initial?.renewalDate?.slice(0, 10) ?? '',
  );
  const [color, setColor] = useState(initial?.color ?? '');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const iconData = useMemo(
    () => SUBSCRIPTION_ICON_KEYS.map((key) => ({ key, source: icons[key] })),
    [],
  );

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const nameErr = validateName(name);
    if (nameErr) next.name = nameErr;
    const priceRes = parsePrice(price);
    if (!priceRes.ok) next.price = priceRes.error;
    const curErr = validateCurrency(currency);
    if (curErr) next.currency = curErr;
    const renErr = validateRenewalDate(renewalDate);
    if (renErr) next.renewalDate = renErr;
    const startErr = validateDateOptional(startDate);
    if (startErr) next.startDate = startErr;
    const colorErr = validateColorOptional(color);
    if (colorErr) next.color = colorErr;

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const priceRes = parsePrice(price);
    if (!priceRes.ok) return;

    const renewalIso = renewalDate.trim()
      ? `${renewalDate.trim()}T12:00:00.000Z`
      : undefined;
    const startIso = startDate.trim()
      ? `${startDate.trim()}T12:00:00.000Z`
      : undefined;

    onSubmit({
      iconKey,
      name: name.trim(),
      plan: plan.trim() || undefined,
      category: category.trim() || undefined,
      paymentMethod: paymentMethod.trim() || undefined,
      status,
      startDate: startIso,
      price: priceRes.value,
      currency: currency.trim().toUpperCase(),
      billing,
      renewalDate: renewalIso,
      color: color.trim() || undefined,
    });
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-4">
        <View>
          <Text className="auth-label mb-2">Icon</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: 'row', gap: 8 }}
          >
            {iconData.map((item) => {
              const selected = item.key === iconKey;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setIconKey(item.key)}
                  className={`size-14 items-center justify-center rounded-2xl border-2 ${
                    selected
                      ? 'border-accent bg-muted'
                      : 'border-border bg-card'
                  }`}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Icon ${item.key}`}
                >
                  <Image
                    source={item.source}
                    className="size-9"
                    resizeMode="contain"
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <AuthTextField
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Netflix"
          error={fieldErrors.name}
          autoCapitalize="words"
        />

        <AuthTextField
          label="Price"
          value={price}
          onChangeText={setPrice}
          placeholder="9.99"
          error={fieldErrors.price}
          keyboardType="numeric"
        />

        <AuthTextField
          label="Currency"
          value={currency}
          onChangeText={setCurrency}
          placeholder="USD"
          error={fieldErrors.currency}
          autoCapitalize="characters"
        />

        <View>
          <Text className="auth-label mb-2">Billing</Text>
          <View className="flex-row gap-2">
            {(['Monthly', 'Yearly'] as const).map((b) => (
              <Pressable
                key={b}
                onPress={() => setBilling(b)}
                className={`flex-1 rounded-2xl border-2 py-3 ${
                  billing === b
                    ? 'border-accent bg-muted'
                    : 'border-border bg-card'
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: billing === b }}
              >
                <Text className="text-center font-sans-semibold text-primary">
                  {b}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <AuthTextField
          label="Next renewal (YYYY-MM-DD)"
          value={renewalDate}
          onChangeText={setRenewalDate}
          placeholder="2026-05-01"
          error={fieldErrors.renewalDate}
        />

        <AuthTextField
          label="Started (optional)"
          value={startDate}
          onChangeText={setStartDate}
          placeholder="2025-01-01"
          error={fieldErrors.startDate}
        />

        <AuthTextField
          label="Plan (optional)"
          value={plan}
          onChangeText={setPlan}
          placeholder="Pro"
          autoCapitalize="words"
        />

        <AuthTextField
          label="Category (optional)"
          value={category}
          onChangeText={setCategory}
          placeholder="Entertainment"
          autoCapitalize="words"
        />

        <AuthTextField
          label="Payment method (optional)"
          value={paymentMethod}
          onChangeText={setPaymentMethod}
          placeholder="Visa …1234"
        />

        <AuthTextField
          label="Accent color (optional)"
          value={color}
          onChangeText={setColor}
          placeholder="#f5c542"
          error={fieldErrors.color}
          autoCapitalize="none"
        />

        <View>
          <Text className="auth-label mb-2">Status</Text>
          <View className="flex-row flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setStatus(opt.value)}
                className={`rounded-full border-2 px-4 py-2 ${
                  status === opt.value
                    ? 'border-accent bg-muted'
                    : 'border-border bg-card'
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: status === opt.value }}
              >
                <Text className="font-sans-medium text-primary">
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <AuthPrimaryButton onPress={handleSubmit}>
          {submitLabel}
        </AuthPrimaryButton>
        <AuthSecondaryButton onPress={onCancel}>Cancel</AuthSecondaryButton>
      </View>
    </ScrollView>
  );
}
