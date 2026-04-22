import { icons } from '@/constants/icons';
import { theme } from '@/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

type SubscriptionScreenHeaderProps = {
  title: string;
};

export default function SubscriptionScreenHeader({
  title,
}: SubscriptionScreenHeaderProps) {
  return (
    <View
      className="flex-row items-center gap-3 border-b border-border bg-background px-5 py-4"
      style={{ paddingTop: theme.spacing[4] }}
    >
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Image source={icons.back} className="size-6" resizeMode="contain" />
      </Pressable>
      <Text
        className="flex-1 font-sans-bold text-lg text-primary"
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>
  );
}
