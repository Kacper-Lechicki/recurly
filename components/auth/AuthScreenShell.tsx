import { styled } from 'nativewind';
import type { PropsWithChildren } from 'react';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

type AuthScreenShellProps = PropsWithChildren<{
  header?: React.ReactNode;
}>;

export default function AuthScreenShell({
  header,
  children,
}: AuthScreenShellProps) {
  return (
    <SafeAreaView className="auth-safe-area">
      <View className="auth-screen">
        <ScrollView
          className="auth-scroll"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="auth-content">
            {header ? header : null}
            {children}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
