import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/Colors';
import { useTextSize } from '@/hooks/useTextSize';
import { useAppStore } from '@/store/useAppStore';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'normal' | 'large' | 'extraLarge';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const textSizes = useTextSize();
  const hapticFeedback = useAppStore((state) => state.settings.hapticFeedback);

  const handlePress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const getBackgroundColor = () => {
    if (disabled) return Colors.light.buttonSecondary;
    switch (variant) {
      case 'primary':
        return Colors.light.buttonPrimary;
      case 'secondary':
        return Colors.light.buttonSecondary;
      case 'danger':
        return Colors.light.error;
      case 'outline':
        return 'transparent';
      default:
        return Colors.light.buttonPrimary;
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') {
      return disabled ? Colors.light.buttonSecondary : Colors.light.buttonPrimary;
    }
    return '#FFFFFF';
  };

  const getPadding = () => {
    switch (size) {
      case 'extraLarge':
        return { paddingVertical: 24, paddingHorizontal: 48 };
      case 'large':
        return { paddingVertical: 18, paddingHorizontal: 36 };
      default:
        return { paddingVertical: 14, paddingHorizontal: 28 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'extraLarge':
        return textSizes.button + 4;
      case 'large':
        return textSizes.button;
      default:
        return textSizes.body;
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          ...getPadding(),
          borderWidth: variant === 'outline' ? 2 : 0,
          borderColor: variant === 'outline' ? Colors.light.buttonPrimary : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
                marginLeft: icon ? 12 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    minHeight: 56,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
