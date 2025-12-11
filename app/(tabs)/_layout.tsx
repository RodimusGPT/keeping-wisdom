import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useTextSize } from '@/hooks/useTextSize';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  size?: number;
}) {
  return <FontAwesome size={props.size || 28} style={{ marginBottom: -3 }} {...props} />;
}

function TabBarLabel({ focused, label }: { focused: boolean; label: string }) {
  const textSizes = useTextSize();

  return (
    <Text
      style={[
        styles.tabLabel,
        {
          fontSize: Math.max(textSizes.caption - 2, 12),
          color: focused ? Colors.light.tint : Colors.light.tabIconDefault,
        },
      ]}
    >
      {label}
    </Text>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('record'),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="microphone" color={color} size={focused ? 32 : 28} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabBarLabel focused={focused} label={t('record')} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: t('recordings'),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="list" color={color} size={focused ? 32 : 28} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabBarLabel focused={focused} label={t('recordings')} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="cog" color={color} size={focused ? 32 : 28} />
          ),
          tabBarLabel: ({ focused }) => (
            <TabBarLabel focused={focused} label={t('settings')} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 90,
    paddingTop: 8,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  tabLabel: {
    fontWeight: '600',
    marginTop: 4,
  },
});
