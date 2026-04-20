import AuthBrandHeader from '@/components/auth/AuthBrandHeader';
import { AuthPrimaryButton } from '@/components/auth/AuthButtons';
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
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';

type SecondFactorMode = 'email_code' | 'totp' | 'backup_code';

export default function SignIn() {
  const { signIn, fetchStatus } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const [secondFactorMode, setSecondFactorMode] =
    useState<SecondFactorMode>('email_code');

  const [secondFactorSent, setSecondFactorSent] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    code?: string;
  }>({});

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetErrors = () => {
    setFieldErrors({});
    setFormError(null);
  };

  const validateEnter = (): boolean => {
    const next: typeof fieldErrors = {};
    const emailError = validateEmail(email);

    if (emailError) {
      next.email = emailError;
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      next.password = passwordError;
    }

    setFieldErrors(next);

    return Object.keys(next).length === 0;
  };

  const validateClientTrust = (): boolean => {
    const next: typeof fieldErrors = {};
    const codeError = validateCode(code);
    if (codeError) next.code = codeError;
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateSecondFactor = (): boolean => {
    const next: typeof fieldErrors = {};
    if (secondFactorMode === 'backup_code') {
      if (!code.trim()) next.code = 'Code is required.';
    } else {
      const codeError = validateCode(code);
      if (codeError) next.code = codeError;
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const finish = async () => {
    const { error } = await signIn.finalize({
      navigate: ({ session }) => {
        navigateAfterFinalize(session);
      },
    });
    if (error) throw error;
  };

  const onSubmit = async () => {
    if (!signIn) return;
    resetErrors();

    if (!validateEnter()) return;
    setSubmitting(true);
    try {
      const res = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if ((res as unknown as { status?: string })?.status === 'complete') {
        await finish();
        return;
      }

      if (signIn.status === 'complete') {
        await finish();
        return;
      }

      if (signIn.status === 'needs_client_trust') {
        const emailCodeFactor = signIn.supportedSecondFactors?.find(
          (factor: any) => factor.strategy === 'email_code',
        );
        if (emailCodeFactor) {
          await signIn.mfa.sendEmailCode();
          return;
        }
        setFormError(
          'This sign-in requires extra verification that is not available.',
        );
        return;
      }

      if (signIn.status === 'needs_second_factor') {
        const factors = signIn.supportedSecondFactors ?? [];
        const hasEmail = factors.some((f: any) => f.strategy === 'email_code');
        const hasTotp = factors.some((f: any) => f.strategy === 'totp');
        const hasBackup = factors.some(
          (f: any) => f.strategy === 'backup_code',
        );

        if (hasEmail) {
          setSecondFactorMode('email_code');
          if (!secondFactorSent) {
            await signIn.mfa.sendEmailCode();
            setSecondFactorSent(true);
          }
          return;
        }

        if (hasTotp) {
          setSecondFactorMode('totp');
          return;
        }

        if (hasBackup) {
          setSecondFactorMode('backup_code');
          return;
        }

        setFormError(
          'Two-factor authentication is required, but no supported method was found.',
        );
        return;
      }

      setFormError('We couldn’t finish signing you in. Please try again.');
    } catch (err) {
      setFormError(
        getClerkErrorMessage(err, 'Email or password is incorrect.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onVerifyClientTrust = async () => {
    if (!signIn) return;
    resetErrors();
    if (!validateClientTrust()) return;
    setSubmitting(true);
    try {
      await signIn.mfa.verifyEmailCode({ code: code.trim() });
      if (signIn.status === 'complete') {
        await finish();
        return;
      }
      setFormError('We couldn’t finish verification. Please try again.');
    } catch (err) {
      setFormError(
        getClerkErrorMessage(err, 'That code didn’t work. Try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onVerifySecondFactor = async () => {
    if (!signIn) return;
    resetErrors();
    if (!validateSecondFactor()) return;
    setSubmitting(true);
    try {
      if (secondFactorMode === 'email_code') {
        const res = await signIn.mfa.verifyEmailCode({ code: code.trim() });
        if ((res as any)?.error) throw (res as any).error;
      } else if (secondFactorMode === 'totp') {
        const res = await signIn.mfa.verifyTOTP({ code: code.trim() });
        if ((res as any)?.error) throw (res as any).error;
      } else {
        const res = await signIn.mfa.verifyBackupCode({ code: code.trim() });
        if ((res as any)?.error) throw (res as any).error;
      }

      if (signIn.status === 'complete') {
        await finish();
        return;
      }
      setFormError('We couldn’t finish verification. Please try again.');
    } catch (err) {
      setFormError(
        getClerkErrorMessage(err, 'That code didn’t work. Try again.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const header = (
    <AuthBrandHeader
      title="Welcome back"
      subtitle="Sign in to continue managing your subscriptions."
    />
  );

  if (signIn?.status === 'needs_client_trust') {
    return (
      <AuthScreenShell header={header}>
        <View className="auth-card">
          <View className="auth-form">
            {formError ? <Text className="auth-error">{formError}</Text> : null}
            <Text className="auth-helper">
              For your security, enter the code we sent to your email.
            </Text>

            <AuthTextField
              label="Code"
              value={code}
              onChangeText={setCode}
              placeholder="6-digit code"
              keyboardType="numeric"
              textContentType="oneTimeCode"
              error={fieldErrors.code}
              returnKeyType="done"
              onSubmitEditing={onVerifyClientTrust}
            />

            <AuthPrimaryButton
              disabled={!signIn || submitting || fetchStatus === 'fetching'}
              onPress={onVerifyClientTrust}
              accessibilityLabel="Verify"
            >
              Verify
            </AuthPrimaryButton>

            <Text
              className="auth-helper"
              onPress={() => signIn.mfa.sendEmailCode()}
            >
              Resend code
            </Text>
            <Text className="auth-helper" onPress={() => signIn.reset()}>
              Start over
            </Text>
          </View>
        </View>
      </AuthScreenShell>
    );
  }

  if (signIn?.status === 'needs_second_factor') {
    const helperText =
      secondFactorMode === 'totp'
        ? 'Enter the 6-digit code from your authenticator app.'
        : secondFactorMode === 'backup_code'
          ? 'Enter a backup code.'
          : 'Enter the 6-digit code we sent to your email.';

    const label = secondFactorMode === 'backup_code' ? 'Backup code' : 'Code';

    return (
      <AuthScreenShell header={header}>
        <View className="auth-card">
          <View className="auth-form">
            {formError ? <Text className="auth-error">{formError}</Text> : null}
            <Text className="auth-helper">{helperText}</Text>

            <AuthTextField
              label={label}
              value={code}
              onChangeText={setCode}
              placeholder={
                secondFactorMode === 'backup_code'
                  ? 'Enter code'
                  : '6-digit code'
              }
              keyboardType={
                secondFactorMode === 'backup_code' ? 'default' : 'numeric'
              }
              textContentType="oneTimeCode"
              error={fieldErrors.code}
              returnKeyType="done"
              onSubmitEditing={onVerifySecondFactor}
            />

            <AuthPrimaryButton
              disabled={!signIn || submitting || fetchStatus === 'fetching'}
              onPress={onVerifySecondFactor}
              accessibilityLabel="Verify"
            >
              Verify
            </AuthPrimaryButton>

            {secondFactorMode === 'email_code' ? (
              <Text
                className="auth-helper"
                onPress={() => {
                  setSecondFactorSent(false);
                  signIn.mfa.sendEmailCode();
                }}
              >
                Resend code
              </Text>
            ) : null}

            <Text
              className="auth-helper"
              onPress={() => {
                setCode('');
                setSecondFactorSent(false);
                signIn.reset();
              }}
            >
              Start over
            </Text>
          </View>
        </View>
      </AuthScreenShell>
    );
  }

  return (
    <AuthScreenShell header={header}>
      <View className="auth-card">
        <View className="auth-form">
          {formError ? <Text className="auth-error">{formError}</Text> : null}

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
            placeholder="Enter your password"
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            error={fieldErrors.password}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />

          <Link href="/forgot-password" asChild>
            <Text className="auth-helper">Forgot password?</Text>
          </Link>

          <AuthPrimaryButton
            disabled={!signIn || submitting || fetchStatus === 'fetching'}
            onPress={onSubmit}
            accessibilityLabel="Sign in"
          >
            Sign in
          </AuthPrimaryButton>
        </View>
      </View>

      <AuthLinkRow copy="New to Recurly?" href="/sign-up">
        Create an account
      </AuthLinkRow>
    </AuthScreenShell>
  );
}
