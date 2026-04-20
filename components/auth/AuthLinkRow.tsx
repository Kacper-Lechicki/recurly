import { Link, type Href } from 'expo-router';
import type { PropsWithChildren } from 'react';
import React from 'react';
import { Text, View } from 'react-native';

type AuthLinkRowProps = PropsWithChildren<{
  copy: string;
  href: Href;
}>;

export default function AuthLinkRow({
  copy,
  href,
  children,
}: AuthLinkRowProps) {
  return (
    <View className="auth-link-row">
      <Text className="auth-link-copy">{copy}</Text>

      <Link href={href} asChild>
        <Text className="auth-link">{children}</Text>
      </Link>
    </View>
  );
}
