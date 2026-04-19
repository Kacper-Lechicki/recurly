import dayjs from 'dayjs';

const DEFAULT_CURRENCY = 'USD';

/**
 * Formats a number as U.S.-style currency (e.g. $1,234.56) with exactly two decimal places.
 * Defaults to USD. On invalid locale/currency or formatter errors, falls back to a plain $…0.00 string.
 */
export function formatCurrency(
  value: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    const num = Number(value);

    if (!Number.isFinite(num)) {
      return '$0.00';
    }

    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    const [whole, frac = ''] = abs.toFixed(2).split('.');
    const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${sign}$${withCommas}.${frac}`;
  }
}

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) {
    return 'Not provided';
  }

  const parsedDate = dayjs(value);

  return parsedDate.isValid()
    ? parsedDate.format('MM/DD/YYYY')
    : 'Not provided';
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) {
    return 'Unknown';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};
