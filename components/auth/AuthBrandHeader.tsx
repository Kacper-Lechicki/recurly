import React from 'react';
import { Text, View } from 'react-native';

type AuthBrandHeaderProps = {
  title: string;
  subtitle: string;
};

export default function AuthBrandHeader({
  title,
  subtitle,
}: AuthBrandHeaderProps) {
  return (
    <View className="auth-brand-block">
      <View className="auth-logo-wrap">
        <View className="auth-logo-mark">
          <Text className="auth-logo-mark-text">R</Text>
        </View>

        <View>
          <Text className="auth-wordmark">Recurly</Text>
          <Text className="auth-wordmark-sub">Smart Billing</Text>
        </View>
      </View>

      <Text className="auth-title">{title}</Text>
      <Text className="auth-subtitle">{subtitle}</Text>
    </View>
  );
}
