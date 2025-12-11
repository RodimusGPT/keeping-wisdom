import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/Colors';
import { useTextSize } from '@/hooks/useTextSize';
import { useAppStore } from '@/store/useAppStore';

interface TabToggleProps {
  tabs: { key: string; label: string }[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function TabToggle({ tabs, activeTab, onTabChange }: TabToggleProps) {
  const textSizes = useTextSize();
  const hapticFeedback = useAppStore((state) => state.settings.hapticFeedback);

  const handlePress = (key: string) => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onTabChange(key);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => handlePress(tab.key)}
            activeOpacity={0.7}
            style={[
              styles.tab,
              isActive && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { fontSize: textSizes.button },
                isActive && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  activeTab: {
    backgroundColor: Colors.light.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.light.text,
    fontWeight: '700',
  },
});
