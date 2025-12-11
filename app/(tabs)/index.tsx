import React from 'react';
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
    if (isRecording) {
      const result = await stopRecording();
      if (result.success && result.recording) {
        // Navigate to the new recording
        router.push(`/recording/${result.recording.id}`);
      }
    } else {
      await startRecording();
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

        {/* Recording Section */}
        <View style={styles.recordingSection}>
          {isRecording && (
            <Timer duration={recordingDuration} isRecording={isRecording} />
          )}

          <RecordButton
            isRecording={isRecording}
            onPress={handleRecordPress}
            audioLevel={audioLevel}
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
});
