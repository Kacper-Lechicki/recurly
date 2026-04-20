import cx from 'clsx';
import React from 'react';
import { Image, Text, View } from 'react-native';

type UserAvatarProps = {
  uri?: string | null;
  fallbackText?: string | null;
  className?: string;
};

export default function UserAvatar({
  uri,
  fallbackText,
  className,
}: UserAvatarProps) {
  const initial = (fallbackText?.trim()?.[0] ?? 'R').toUpperCase();

  if (uri) {
    return <Image source={{ uri }} className={className} />;
  }

  return (
    <View className={cx('items-center justify-center bg-muted', className)}>
      <Text className="text-lg font-sans-extrabold text-primary">
        {initial}
      </Text>
    </View>
  );
}
