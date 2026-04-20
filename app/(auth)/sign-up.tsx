import AuthBrandHeader from '@/components/auth/AuthBrandHeader';
import {
    AuthPrimaryButton,
    AuthSecondaryButton,
} from '@/components/auth/AuthButtons';
import AuthLinkRow from '@/components/auth/AuthLinkRow';
import AuthScreenShell from '@/components/auth/AuthScreenShell';
import AuthTextField from '@/components/auth/AuthTextField';
import { navigateAfterFinalize } from '@/lib/auth/navigateAfterFinalize';
import {
    getClerkErrorMessage,
    getPasswordStrength,
    validateCode,
    validateEmail,
    validatePassword,
} from '@/lib/auth/validation';
import { useSignUp } from '@clerk/expo';
import cx from 'clsx';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export default function SignUp() {
  const { signUp, fetchStatus } = useSignUp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [legalAccepted, setLegalAccepted] = useState(false);

  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    code?: string;
  }>({});

  const cta = useMemo(
    () => (verifying ? 'Verify and create account' : 'Create account'),
    [verifying],
  );

  const resetErrors = () => {
    setFieldErrors({});
    setFormError(null);
  };

  const validateCreate = (): boolean => {
    const next: typeof fieldErrors = {};
    const emailError = validateEmail(email);
    if (emailError) next.email = emailError;
    const passwordError = validatePassword(password);
    if (passwordError) next.password = passwordError;
    if (confirmPassword !== password)
      next.confirmPassword = 'Passwords do not match.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateVerify = (): boolean => {
    const next: typeof fieldErrors = {};
    const codeError = validateCode(code);
    if (codeError) next.code = codeError;
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const finish = async () => {
    const { error } = await signUp.finalize({
      navigate: ({ session }) => {
        navigateAfterFinalize(session);
      },
    });
    if (error) throw error;
  };

  const onSubmit = async () => {
    if (!signUp) return;
    resetErrors();

    if (!verifying) {
      if (!validateCreate()) return;
      if (!legalAccepted) {
        setFormError('Please accept the Terms and Privacy Policy to continue.');
        return;
      }

      setSubmitting(true);
      try {
        const res = await signUp.password({
          emailAddress: email.trim(),
          password,
          legalAccepted,
        });
        if ((res as unknown as { error?: unknown })?.error)
          throw (res as any).error;

        const send = await signUp.verifications.sendEmailCode();
        if ((send as unknown as { error?: unknown })?.error)
          throw (send as any).error;

        setVerifying(true);
      } catch (err) {
        setFormError(
          getClerkErrorMessage(
            err,
            'We couldn’t create your account. Try again.',
          ),
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!validateVerify()) return;
    setSubmitting(true);
    try {
      const verify = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });
      if ((verify as unknown as { error?: unknown })?.error)
        throw (verify as any).error;

      if (signUp.status === 'complete') {
        await finish();
        return;
      }

      setFormError('One more step is required to finish signing up.');
    } catch (err) {
      setFormError(
        getClerkErrorMessage(err, 'That code didn’t work. Try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resendCode = async () => {
    if (!signUp) return;
    resetErrors();
    setSubmitting(true);
    try {
      const send = await signUp.verifications.sendEmailCode();
      if ((send as unknown as { error?: unknown })?.error)
        throw (send as any).error;
    } catch (err) {
      setFormError(
        getClerkErrorMessage(err, 'We couldn’t resend the code. Try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const header = (
    <AuthBrandHeader
      title="Create your account"
      subtitle="Start tracking renewals and stay ahead of every bill."
    />
  );

  const showStrength = password.trim().length > 0;
  const strength = getPasswordStrength(password);
  const strengthBarClass =
    strength.score <= 1
      ? 'bg-destructive'
      : strength.score === 2
        ? 'bg-accent'
        : 'bg-success';
  const strengthWidthPct =
    strength.score === 0 ? 10 : (strength.score / 4) * 100;

  const confirmPasswordLiveError =
    confirmPassword.trim().length > 0 && confirmPassword !== password
      ? 'Passwords do not match.'
      : undefined;

  const canSubmitCreate =
    !validateEmail(email) &&
    !validatePassword(password) &&
    confirmPassword.length > 0 &&
    confirmPassword === password &&
    legalAccepted;

  return (
    <AuthScreenShell header={header}>
      <View className="auth-card">
        <View className="auth-form">
          {formError ? <Text className="auth-error">{formError}</Text> : null}

          {!verifying ? (
            <>
              <AuthTextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                error={fieldErrors.email}
                returnKeyType="next"
              />

              <AuthTextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry
                autoComplete="password"
                textContentType="newPassword"
                error={fieldErrors.password}
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />

              {showStrength ? (
                <View className="gap-2">
                  <View className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <View
                      className={cx('h-full', strengthBarClass)}
                      style={{ width: `${strengthWidthPct}%` }}
                    />
                  </View>
                  <Text className="auth-helper">
                    Password strength: {strength.label}
                  </Text>
                </View>
              ) : null}

              <AuthTextField
                label="Confirm password"
                value={confirmPassword}
                onChangeText={(value) => {
                  setConfirmPassword(value);
                  if (fieldErrors.confirmPassword && value === password) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }));
                  }
                }}
                placeholder="Re-enter your password"
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                error={fieldErrors.confirmPassword ?? confirmPasswordLiveError}
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />

              <View className="flex-row items-start gap-3">
                <Pressable
                  onPress={() => setLegalAccepted((v) => !v)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: legalAccepted }}
                  hitSlop={10}
                >
                  <View
                    className={cx(
                      'mt-0.5 size-5 items-center justify-center rounded-md border border-border bg-background',
                      legalAccepted && 'border-accent bg-accent/15',
                    )}
                  >
                    {legalAccepted ? (
                      <Text className="text-sm font-sans-bold text-primary">
                        ✓
                      </Text>
                    ) : null}
                  </View>
                </Pressable>

                <Text className="auth-helper">
                  I agree to the <Text className="auth-link">Terms</Text> and{' '}
                  <Text className="auth-link">Privacy Policy</Text>.
                </Text>
              </View>
            </>
          ) : (
            <>
              <AuthTextField
                label="Code"
                value={code}
                onChangeText={setCode}
                placeholder="6-digit code"
                keyboardType="numeric"
                textContentType="oneTimeCode"
                error={fieldErrors.code}
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />

              <AuthSecondaryButton disabled={submitting} onPress={resendCode}>
                Resend code
              </AuthSecondaryButton>
            </>
          )}

          <AuthPrimaryButton
            disabled={
              !signUp ||
              submitting ||
              fetchStatus === 'fetching' ||
              (!verifying && !canSubmitCreate)
            }
            onPress={onSubmit}
          >
            {cta}
          </AuthPrimaryButton>
        </View>
      </View>

      <AuthLinkRow copy="Already have an account?" href="/sign-in">
        Sign in
      </AuthLinkRow>
    </AuthScreenShell>
  );
}
