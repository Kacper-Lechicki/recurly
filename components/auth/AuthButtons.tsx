import cx from 'clsx';
import type { PropsWithChildren } from 'react';
import React from 'react';
import { Pressable, Text } from 'react-native';

type BaseButtonProps = PropsWithChildren<{
  disabled?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}>;

export function AuthPrimaryButton({
  disabled,
  onPress,
  children,
  accessibilityLabel,
}: BaseButtonProps) {
  return (
    <Pressable
      className={cx('auth-button', disabled && 'auth-button-disabled')}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text className="auth-button-text">{children}</Text>
    </Pressable>
  );
}

export function AuthSecondaryButton({
  disabled,
  onPress,
  children,
  accessibilityLabel,
}: BaseButtonProps) {
  return (
    <Pressable
      className="auth-secondary-button"
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => (pressed ? { opacity: 0.85 } : undefined)}
    >
      <Text className="auth-secondary-button-text">{children}</Text>
    </Pressable>
  );
}
