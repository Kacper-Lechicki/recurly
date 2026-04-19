import {
    formatCurrency,
    formatStatusLabel,
    formatSubscriptionDateTime,
} from '@/lib/utils';
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
  expanded,
  onPress,
  paymentMethod,
  startDate,
  status,
}: SubscriptionCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={clsx('sub-card', expanded ? 'sub-card-expanded' : 'bg-card')}
      style={!expanded && color ? { backgroundColor: color } : undefined}
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

      {expanded && (
        <View className="sub-bdy">
          <View className="sub-details">
            {!!paymentMethod?.trim() && (
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Payment:</Text>

                  <Text
                    className="sub-value"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {paymentMethod.trim()}
                  </Text>
                </View>
              </View>
            )}

            {!!(category?.trim() || plan?.trim()) && (
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Category:</Text>

                  <Text
                    className="sub-value"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {category?.trim() || plan?.trim()}
                  </Text>
                </View>
              </View>
            )}

            {!!startDate && (
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Started:</Text>

                  <Text
                    className="sub-value"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {formatSubscriptionDateTime(startDate)}
                  </Text>
                </View>
              </View>
            )}

            {!!renewalDate && (
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Renewal date:</Text>

                  <Text
                    className="sub-value"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {formatSubscriptionDateTime(renewalDate)}
                  </Text>
                </View>
              </View>
            )}

            {!!status && (
              <View className="sub-row">
                <View className="sub-row-copy">
                  <Text className="sub-label">Status:</Text>

                  <Text
                    className="sub-value"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {formatStatusLabel(status)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default SubscriptionCard;
