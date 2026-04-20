const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Email is required.';
  }

  if (!EMAIL_RE.test(trimmed)) {
    return 'Enter a valid email address.';
  }

  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) {
    return 'Password is required.';
  }

  if (value.length < 8) {
    return 'Use at least 8 characters.';
  }

  return null;
}

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Very weak' | 'Weak' | 'Okay' | 'Strong' | 'Very strong';
};

export function getPasswordStrength(password: string): PasswordStrength {
  const value = password ?? '';

  if (!value) {
    return { score: 0, label: 'Very weak' };
  }

  let score = 0;

  if (value.length >= 8) {
    score += 1;
  }

  if (value.length >= 12) {
    score += 1;
  }

  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) {
    score += 1;
  }

  if (/\d/.test(value)) {
    score += 1;
  }

  if (/[^a-zA-Z0-9]/.test(value)) {
    score += 1;
  }

  const clamped = Math.max(0, Math.min(4, score)) as 0 | 1 | 2 | 3 | 4;

  const label =
    clamped === 0
      ? 'Very weak'
      : clamped === 1
        ? 'Weak'
        : clamped === 2
          ? 'Okay'
          : clamped === 3
            ? 'Strong'
            : 'Very strong';

  return { score: clamped, label };
}

export function validateCode(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Code is required.';
  }

  if (!/^[0-9]{6}$/.test(trimmed)) {
    return 'Enter the 6-digit code.';
  }

  return null;
}

type ClerkErrorLike =
  | {
      errors?: { message?: string; longMessage?: string }[];
    }
  | { message?: string };

export function getClerkErrorMessage(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') {
    return fallback;
  }

  const maybe = err as ClerkErrorLike;

  const errors =
    'errors' in maybe && Array.isArray((maybe as any).errors)
      ? ((maybe as any).errors as {
          message?: string;
          longMessage?: string;
        }[])
      : null;

  const msg =
    errors?.[0]?.longMessage || errors?.[0]?.message || (maybe as any).message;

  if (msg && typeof msg === 'string') {
    return msg;
  }

  return fallback;
}
