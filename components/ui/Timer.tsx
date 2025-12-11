import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { useTextSize } from '@/hooks/useTextSize';
import { useTranslation } from '@/hooks/useTranslation';

interface TimerProps {
  duration: number; // in milliseconds
  isRecording?: boolean;
}

export function Timer({ duration, isRecording = false }: TimerProps) {
  const { t } = useTranslation();
  const textSizes = useTextSize();

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={[styles.recordingText, { fontSize: textSizes.bodyLarge }]}>
            {t('recording')}
          </Text>
        </View>
      )}
      <Text
        style={[
          styles.timer,
          {
            fontSize: textSizes.timer,
            color: isRecording ? Colors.light.recording : Colors.light.text,
          },
        ]}
      >
        {formatTime(duration)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.recording,
    marginRight: 8,
  },
  recordingText: {
    color: Colors.light.recording,
    fontWeight: '600',
  },
  timer: {
    fontWeight: '300',
    fontVariant: ['tabular-nums'],
  },
});
