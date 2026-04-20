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
    validateCode,
    validateEmail,
    validatePassword,
} from '@/lib/auth/validation';
import { useSignIn } from '@clerk/expo';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

type Step = 'email' | 'code' | 'new_password';

export default function ForgotPassword() {
  const { signIn, fetchStatus } = useSignIn();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    code?: string;
    password?: string;
  }>({});

  const resetErrors = () => {
    setFieldErrors({});
    setFormError(null);
  };

  const validateCurrent = (): boolean => {
    const next: typeof fieldErrors = {};

    if (step === 'email') {
      const e = validateEmail(email);

      if (e) {
        next.email = e;
      }
    } else if (step === 'code') {
      const c = validateCode(code);

      if (c) {
        next.code = c;
      }
    } else {
      const p = validatePassword(password);

      if (p) {
        next.password = p;
      }
    }

    setFieldErrors(next);

    return Object.keys(next).length === 0;
  };

  const sendCode = async () => {
    if (!signIn) {
      return;
    }

    resetErrors();

    if (!validateCurrent()) {
      return;
    }

    setSubmitting(true);

    try {
      const create = await signIn.create({ identifier: email.trim() });

      if ((create as any)?.error) {
        throw (create as any).error;
      }

      const send = await signIn.resetPasswordEmailCode.sendCode();

      if ((send as any)?.error) {
        throw (send as any).error;
      }

      setStep('code');
    } catch (err) {
      setFormError(
        getClerkErrorMessage(err, 'We couldn’t send a reset code. Try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const verifyCode = async () => {
    if (!signIn) {
      return;
    }

    resetErrors();

    if (!validateCurrent()) {
      return;
    }

    setSubmitting(true);

    try {
      const verify = await signIn.resetPasswordEmailCode.verifyCode({
        code: code.trim(),
      });

      if ((verify as any)?.error) {
        throw (verify as any).error;
      }

      if (signIn.status === 'needs_new_password') {
        setStep('new_password');
      } else {
        setFormError('Please continue to set a new password.');
      }
    } catch (err) {
      setFormError(
        getClerkErrorMessage(err, 'That code didn’t work. Try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const submitNewPassword = async () => {
    if (!signIn) {
      return;
    }

    resetErrors();

    if (!validateCurrent()) {
      return;
    }

    setSubmitting(true);
    try {
      const submit = await signIn.resetPasswordEmailCode.submitPassword({
        password,
      });

      if ((submit as any)?.error) {
        throw (submit as any).error;
      }

      if (signIn.status === 'complete') {
        const { error } = await signIn.finalize({
          navigate: ({ session }) => {
            navigateAfterFinalize(session);
          },
        });

        if (error) {
          throw error;
        }

        return;
      }

      setFormError('One more step is required to finish the reset.');
    } catch (err) {
      setFormError(
        getClerkErrorMessage(
          err,
          'We couldn’t reset your password. Try again.',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const header = (
    <AuthBrandHeader
      title="Reset your password"
      subtitle="We’ll send a secure code to confirm it’s you."
    />
  );

  return (
    <AuthScreenShell header={header}>
      <View className="auth-card">
        <View className="auth-form">
          {formError ? <Text className="auth-error">{formError}</Text> : null}

          {step === 'email' ? (
            <AuthTextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              error={fieldErrors.email}
              returnKeyType="done"
              onSubmitEditing={sendCode}
            />
          ) : null}

          {step === 'code' ? (
            <AuthTextField
              label="Code"
              value={code}
              onChangeText={setCode}
              placeholder="6-digit code"
              keyboardType="numeric"
              textContentType="oneTimeCode"
              error={fieldErrors.code}
              returnKeyType="done"
              onSubmitEditing={verifyCode}
            />
          ) : null}

          {step === 'new_password' ? (
            <AuthTextField
              label="New password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a new password"
              secureTextEntry
              textContentType="newPassword"
              error={fieldErrors.password}
              returnKeyType="done"
              onSubmitEditing={submitNewPassword}
            />
          ) : null}

          {step === 'email' ? (
            <AuthPrimaryButton
              disabled={!signIn || submitting || fetchStatus === 'fetching'}
              onPress={sendCode}
            >
              Send reset code
            </AuthPrimaryButton>
          ) : null}

          {step === 'code' ? (
            <>
              <AuthPrimaryButton
                disabled={!signIn || submitting || fetchStatus === 'fetching'}
                onPress={verifyCode}
              >
                Verify code
              </AuthPrimaryButton>
              <AuthSecondaryButton
                disabled={submitting || fetchStatus === 'fetching'}
                onPress={sendCode}
              >
                Resend code
              </AuthSecondaryButton>
            </>
          ) : null}

          {step === 'new_password' ? (
            <AuthPrimaryButton
              disabled={!signIn || submitting || fetchStatus === 'fetching'}
              onPress={submitNewPassword}
            >
              Set new password
            </AuthPrimaryButton>
          ) : null}
        </View>
      </View>

      <AuthLinkRow copy="Remembered it?" href="/sign-in">
        Back to sign in
      </AuthLinkRow>
    </AuthScreenShell>
  );
}
