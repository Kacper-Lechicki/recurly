import { colors } from '@/constants/theme';
import { router } from 'expo-router';
import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = { children: ReactNode };

type State = { error: Error | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (__DEV__) {
      console.warn('[AppErrorBoundary]', error.message, info.componentStack);
    }
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
            backgroundColor: colors.background,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: colors.primary,
              textAlign: 'center',
            }}
          >
            Something went wrong
          </Text>
          <Text
            style={{
              marginTop: 12,
              fontSize: 14,
              color: colors.mutedForeground,
              textAlign: 'center',
            }}
          >
            {this.state.error.message}
          </Text>
          <Pressable
            onPress={() => {
              this.reset();
              router.replace('/');
            }}
            style={{
              marginTop: 24,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 999,
              backgroundColor: colors.accent,
            }}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
              Try again
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
