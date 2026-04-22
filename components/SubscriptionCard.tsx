import { formatCurrency, formatSubscriptionDateTime } from '@/lib/utils';
import { clsx } from 'clsx';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

const SubscriptionCard = ({
  name,
  price,
  currency,
  icon,
  billing,
  color,
  category,
  plan,
  renewalDate,
  onPress,
}: SubscriptionCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={clsx('sub-card', 'bg-card')}
      style={color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image source={icon} className="sub-icon" />

          <View className="sub-copy">
            <Text numberOfLines={1} className="sub-title">
              {name}
            </Text>

            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {category?.trim() || plan?.trim() || renewalDate
                ? formatSubscriptionDateTime(renewalDate)
                : ''}
            </Text>
          </View>
        </View>

        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export default SubscriptionCard;
