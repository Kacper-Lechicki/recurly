export function parsePrice(
  raw: string,
): { ok: true; value: number } | { ok: false; error: string } {
  const t = raw.trim();
  if (!t) return { ok: false, error: 'Price is required.' };
  const n = Number.parseFloat(t.replace(',', '.'));
  if (!Number.isFinite(n) || n < 0)
    return { ok: false, error: 'Enter a valid price.' };
  return { ok: true, value: n };
}

export function validateCurrency(raw: string): string | undefined {
  const t = raw.trim().toUpperCase();
  if (!t) return 'Currency is required.';
  if (!/^[A-Z]{3}$/.test(t)) return 'Use a 3-letter code (e.g. USD).';
  return undefined;
}

export function validateDateOptional(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return 'Use YYYY-MM-DD.';
  const [y, m, d] = t.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
    return 'Invalid date.';
  }
  return undefined;
}

export function validateRenewalDate(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) return 'Renewal date is required.';
  return validateDateOptional(t);
}

export function validateName(raw: string): string | undefined {
  if (!raw.trim()) return 'Name is required.';
  return undefined;
}

export function validateColorOptional(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  if (!/^#[0-9A-Fa-f]{6}$/.test(t)) return 'Use #RRGGBB (optional).';
  return undefined;
}
