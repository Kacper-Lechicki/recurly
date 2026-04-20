import { tabs } from '@/constants/data';
import { colors, components, spacing } from '@/constants/theme';
import { useAuth } from '@clerk/expo';
import { Redirect, Tabs } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabBar = components.tabBar;

const tabIconStyles = StyleSheet.create({
  slot: {
    width: tabBar.iconFrame,
    height: tabBar.iconFrame,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    width: tabBar.iconFrame,
    height: tabBar.iconFrame,
    borderRadius: tabBar.iconFrame / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  pillActive: {
    backgroundColor: colors.accent,
  },
  glyph: {
    width: spacing[6],
    height: spacing[6],
  },
});

const TabIcon = ({ focused, icon }: TabIconProps) => {
  return (
    <View style={tabIconStyles.slot}>
      <View style={[tabIconStyles.pill, focused && tabIconStyles.pillActive]}>
        <Image source={icon} resizeMode="contain" style={tabIconStyles.glyph} />
      </View>
    </View>
  );
};

const TabLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();
  const gutter = tabBar.horizontalInset;
  const tabBarLeft = insets.left + gutter;
  const tabBarRight = insets.right + gutter;

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          start: tabBarLeft,
          end: tabBarRight,
          bottom: Math.max(insets.bottom, gutter),
          height: tabBar.height,
          borderRadius: tabBar.radius,
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          elevation: 0,
          paddingHorizontal: 0,
          paddingBottom: 0,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
        },
        tabBarIconStyle: {
          width: tabBar.iconFrame,
          height: tabBar.iconFrame,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} icon={tab.icon} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default TabLayout;
