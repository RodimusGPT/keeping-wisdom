import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

import Colors from '@/constants/Colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useTextSize } from '@/hooks/useTextSize';
import { useRecording } from '@/hooks/useRecording';
import { useAppStore } from '@/store/useAppStore';
import { RecordButton, Timer, RecordingCard } from '@/components/ui';

export default function RecordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const textSizes = useTextSize();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    isRecording,
    recordingDuration,
    audioLevel,
    startRecording,
    stopRecording,
  } = useRecording();

  const recordings = useAppStore((state) => state.recordings);
  const recentRecordings = recordings.slice(0, 3);

  const handleRecordPress = async () => {
    // Prevent double-tap issues
    if (isProcessing) {
      console.log('Already processing, ignoring tap');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);

    try {
      if (isRecording) {
        console.log('Stopping recording...');
        const result = await stopRecording();
        console.log('Stop result:', result);
        if (result.success && result.recording) {
          router.push(`/recording/${result.recording.id}`);
        }
      } else {
        console.log('Starting recording...');
        const result = await startRecording();
        console.log('Start result:', result);
        if (!result.success) {
          setErrorMsg(result.error || t('recordingError'));
        }
      }
    } catch (error: any) {
      console.error('Recording error:', error);
      setErrorMsg(error?.message || String(error));
    } finally {
      // Add a small delay before allowing another press
      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    }
  };

  const handleRecordingPress = (id: string) => {
    router.push(`/recording/${id}`);
  };

  const handleViewAll = () => {
    router.push('/(tabs)/library');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.appName, { fontSize: textSizes.headerLarge }]}>
            {t('appName')}
          </Text>
        </View>

        {/* Error Message */}
        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Recording Section */}
        <View style={styles.recordingSection}>
          {isRecording && (
            <Timer duration={recordingDuration} isRecording={isRecording} />
          )}

          <RecordButton
            isRecording={isRecording}
            onPress={handleRecordPress}
            audioLevel={audioLevel}
            disabled={isProcessing}
          />
        </View>

        {/* Recent Recordings */}
        {!isRecording && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { fontSize: textSizes.bodyLarge }]}>
                {t('recentRecordings')}
              </Text>
              {recordings.length > 3 && (
                <TouchableOpacity onPress={handleViewAll}>
                  <Text
                    style={[styles.viewAllText, { fontSize: textSizes.body }]}
                  >
                    {t('viewAll')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {recentRecordings.length === 0 ? (
              <View style={styles.emptyState}>
                <Text
                  style={[styles.emptyTitle, { fontSize: textSizes.bodyLarge }]}
                >
                  {t('noRecordings')}
                </Text>
                <Text
                  style={[styles.emptySubtitle, { fontSize: textSizes.body }]}
                >
                  {t('startFirstRecording')}
                </Text>
              </View>
            ) : (
              recentRecordings.map((recording) => (
                <RecordingCard
                  key={recording.id}
                  recording={recording}
                  onPress={() => handleRecordingPress(recording.id)}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  appName: {
    fontWeight: '700',
    color: Colors.light.text,
  },
  recordingSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  recentSection: {
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    color: Colors.light.text,
  },
  viewAllText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
  },
  emptyTitle: {
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    fontWeight: '600',
  },
});
