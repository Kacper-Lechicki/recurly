import cx from 'clsx';
import React from 'react';
import type { TextInputProps } from 'react-native';
import { Text, TextInput, View } from 'react-native';

type AuthTextFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: TextInputProps['autoComplete'];
  keyboardType?: 'default' | 'email-address' | 'numeric';
  secureTextEntry?: boolean;
  textContentType?:
    | 'none'
    | 'emailAddress'
    | 'password'
    | 'oneTimeCode'
    | 'newPassword';
  returnKeyType?: 'done' | 'next';
  onSubmitEditing?: () => void;
};

export default function AuthTextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  autoCapitalize = 'none',
  autoComplete,
  keyboardType = 'default',
  secureTextEntry,
  textContentType,
  returnKeyType,
  onSubmitEditing,
}: AuthTextFieldProps) {
  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        className={cx('auth-input', error && 'auth-input-error')}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        textContentType={textContentType}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
      />

      {error ? <Text className="auth-error">{error}</Text> : null}
    </View>
  );
}
