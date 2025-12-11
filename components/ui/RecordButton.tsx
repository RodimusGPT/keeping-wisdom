import React, { useEffect, useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useTextSize } from '@/hooks/useTextSize';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/store/useAppStore';

interface RecordButtonProps {
  isRecording: boolean;
  onPress: () => void;
  audioLevel?: number;
  disabled?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BUTTON_SIZE = Math.min(SCREEN_WIDTH * 0.45, 200);

export function RecordButton({
  isRecording,
  onPress,
  audioLevel = 0,
  disabled = false,
}: RecordButtonProps) {
  const { t } = useTranslation();
  const textSizes = useTextSize();
  const hapticFeedback = useAppStore((state) => state.settings.hapticFeedback);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  // Pulsing animation when recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Wave animation for audio level
      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
    }
  }, [isRecording, pulseAnim, waveAnim]);

  const handlePress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(
        isRecording
          ? Haptics.ImpactFeedbackStyle.Heavy
          : Haptics.ImpactFeedbackStyle.Medium
      );
    }
    onPress();
  };

  const waveScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const waveOpacity = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.9}
      style={styles.container}
    >
      {/* Wave effect when recording */}
      {isRecording && (
        <Animated.View
          style={[
            styles.wave,
            {
              width: BUTTON_SIZE,
              height: BUTTON_SIZE,
              transform: [{ scale: waveScale }],
              opacity: waveOpacity,
            },
          ]}
        />
      )}

      {/* Main button */}
      <Animated.View
        style={[
          styles.buttonOuter,
          {
            width: BUTTON_SIZE + 16,
            height: BUTTON_SIZE + 16,
            transform: [{ scale: isRecording ? pulseAnim : 1 }],
          },
        ]}
      >
        <View
          style={[
            styles.button,
            {
              width: BUTTON_SIZE,
              height: BUTTON_SIZE,
              backgroundColor: isRecording
                ? Colors.light.recording
                : Colors.light.buttonPrimary,
            },
          ]}
        >
          <FontAwesome
            name={isRecording ? 'stop' : 'microphone'}
            size={BUTTON_SIZE * 0.35}
            color="#FFFFFF"
          />
        </View>
      </Animated.View>

      {/* Audio level indicator */}
      {isRecording && (
        <View style={styles.audioLevelContainer}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.audioBar,
                {
                  height: 8 + (audioLevel > i * 0.2 ? 20 * Math.min(1, (audioLevel - i * 0.2) * 5) : 0),
                  backgroundColor:
                    audioLevel > i * 0.2
                      ? Colors.light.recording
                      : Colors.light.border,
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* Text label */}
      <Text
        style={[
          styles.label,
          {
            fontSize: textSizes.bodyLarge,
            color: isRecording
              ? Colors.light.recording
              : Colors.light.textSecondary,
          },
        ]}
      >
        {isRecording ? t('tapToStop') : t('tapToRecord')}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  wave: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: Colors.light.recordingPulse,
  },
  buttonOuter: {
    borderRadius: 9999,
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  audioLevelContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 24,
    height: 40,
    gap: 6,
  },
  audioBar: {
    width: 8,
    borderRadius: 4,
    minHeight: 8,
  },
  label: {
    marginTop: 16,
    fontWeight: '500',
  },
});
