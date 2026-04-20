import React from 'react';
import { Text, View } from 'react-native';

export default function AuthDivider({ text = 'or' }: { text?: string }) {
  return (
    <View className="auth-divider-row">
      <View className="auth-divider-line" />
      <Text className="auth-divider-text">{text}</Text>
      <View className="auth-divider-line" />
    </View>
  );
}
