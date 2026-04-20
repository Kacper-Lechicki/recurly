import { useAuth } from '@clerk/expo';
import { Redirect } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

const Onboarding = () => {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/sign-in" />;

  return (
    <View>
      <Text>onboarding</Text>
    </View>
  );
};

export default Onboarding;
