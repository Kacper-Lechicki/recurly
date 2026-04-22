import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const ListHeading = ({ title, onViewAllPress }: ListHeadingProps) => {
  return (
    <View className="list-head">
      <Text className="list-title shrink pr-2">{title}</Text>

      {onViewAllPress ? (
        <TouchableOpacity
          className="list-action shrink-0"
          onPress={onViewAllPress}
          accessibilityRole="button"
          accessibilityLabel={`View all ${title}`}
        >
          <Text className="list-action-text">View All</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default ListHeading;
