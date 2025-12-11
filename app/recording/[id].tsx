import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as Sharing from 'expo-sharing';

import Colors from '@/constants/Colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useTextSize } from '@/hooks/useTextSize';
import { usePlayback } from '@/hooks/usePlayback';
import { useAppStore } from '@/store/useAppStore';
import { Button, TabToggle, ConfirmDialog } from '@/components/ui';
import { processRecording } from '@/lib/transcription';
import { NoteLine } from '@/types';

export default function RecordingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const textSizes = useTextSize();

  const [activeTab, setActiveTab] = useState<'summary' | 'notes'>('summary');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const recording = useAppStore((state) => state.getRecording(id || ''));
  const updateRecording = useAppStore((state) => state.updateRecording);
  const deleteRecording = useAppStore((state) => state.deleteRecording);

  const {
    isPlaying,
    isLoaded,
    position,
    duration,
    speed,
    loadAudio,
    togglePlayPause,
    toggleSpeed,
    seekTo,
    unload,
  } = usePlayback();

  // Load audio when screen mounts
  useEffect(() => {
    if (recording?.audioUri) {
      loadAudio(recording.audioUri);
    }
    return () => {
      unload();
    };
  }, [recording?.audioUri, loadAudio, unload]);

  // Process recording if needed
  useEffect(() => {
    const process = async () => {
      if (recording && recording.status === 'processing' && !isProcessing) {
        setIsProcessing(true);
        try {
          const result = await processRecording(recording);
          updateRecording(recording.id, {
            notes: result.notes,
            summary: result.summary,
            status: 'completed',
          });
        } catch (error) {
          console.error('Processing failed:', error);
          updateRecording(recording.id, { status: 'failed' });
        } finally {
          setIsProcessing(false);
        }
      }
    };
    process();
  }, [recording, isProcessing, updateRecording]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleNoteLinePress = useCallback(
    (noteLine: NoteLine) => {
      seekTo(noteLine.timestamp);
    },
    [seekTo]
  );

  const handleDelete = () => {
    if (recording) {
      deleteRecording(recording.id);
      router.back();
    }
    setShowDeleteDialog(false);
  };

  const handleShare = async () => {
    if (!recording) return;

    let content = '';

    if (activeTab === 'summary' && recording.summary) {
      content = `${t('summary')}\n\n${recording.summary.map((point) => `• ${point}`).join('\n')}`;
    } else if (recording.notes) {
      content = `${t('notes')}\n\n${recording.notes.map((note) => `[${formatTime(note.timestamp)}] ${note.speaker ? `${note.speaker}: ` : ''}${note.text}`).join('\n')}`;
    }

    if (content) {
      try {
        await Share.share({
          message: content,
          title: `${t('appName')} - ${formatDate(recording.createdAt)}`,
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    }
  };

  const handleRegenerate = async () => {
    if (!recording) return;

    setIsProcessing(true);
    try {
      const result = await processRecording(recording);
      updateRecording(recording.id, {
        notes: result.notes,
        summary: result.summary,
        status: 'completed',
      });
    } catch (error) {
      console.error('Regenerate failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!recording) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { fontSize: textSizes.bodyLarge }]}>
            {t('errorOccurred')}
          </Text>
          <Button title={t('tryAgain')} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const tabs = [
    { key: 'summary', label: t('summary') },
    { key: 'notes', label: t('notes') },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: formatDate(recording.createdAt),
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Info */}
          <View style={styles.header}>
            <Text style={[styles.date, { fontSize: textSizes.header }]}>
              {formatDate(recording.createdAt)}
            </Text>
            <Text style={[styles.duration, { fontSize: textSizes.body }]}>
              {formatTime(recording.duration)}
            </Text>
          </View>

          {/* Playback Controls */}
          <View style={styles.playbackSection}>
            <TouchableOpacity
              onPress={togglePlayPause}
              activeOpacity={0.7}
              style={styles.playButton}
              disabled={!isLoaded}
            >
              <FontAwesome
                name={isPlaying ? 'pause' : 'play'}
                size={32}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <View style={styles.playbackInfo}>
              <Text style={[styles.playbackTime, { fontSize: textSizes.body }]}>
                {formatTime(position)} / {formatTime(duration)}
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${duration > 0 ? (position / duration) * 100 : 0}%` },
                  ]}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={toggleSpeed}
              activeOpacity={0.7}
              style={styles.speedButton}
            >
              <Text style={[styles.speedText, { fontSize: textSizes.caption }]}>
                {speed === 'normal' ? t('normal') : t('slower')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Toggle */}
          <View style={styles.tabSection}>
            <TabToggle
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(key) => setActiveTab(key as 'summary' | 'notes')}
            />
          </View>

          {/* Content */}
          <View style={styles.contentSection}>
            {recording.status === 'processing' || isProcessing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
                <Text
                  style={[styles.processingText, { fontSize: textSizes.bodyLarge }]}
                >
                  {activeTab === 'notes' ? t('takingNotes') : t('findingKeyPoints')}
                </Text>
                <Text style={[styles.processingHint, { fontSize: textSizes.body }]}>
                  {t('mayTakeFewMinutes')}
                </Text>
              </View>
            ) : activeTab === 'summary' ? (
              <View style={styles.summaryContainer}>
                {recording.summary && recording.summary.length > 0 ? (
                  <>
                    {recording.summary.map((point, index) => (
                      <View key={index} style={styles.summaryItem}>
                        <FontAwesome
                          name="circle"
                          size={10}
                          color={Colors.light.tint}
                          style={styles.bullet}
                        />
                        <Text
                          style={[styles.summaryText, { fontSize: textSizes.bodyLarge }]}
                        >
                          {point}
                        </Text>
                      </View>
                    ))}
                    <Text style={[styles.hint, { fontSize: textSizes.caption }]}>
                      {t('tapNotesForMore')}
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.emptyText, { fontSize: textSizes.body }]}>
                    {recording.status === 'failed'
                      ? t('processingFailed')
                      : t('processing')}
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.notesContainer}>
                {recording.notes && recording.notes.length > 0 ? (
                  <>
                    {recording.notes.map((note) => (
                      <TouchableOpacity
                        key={note.id}
                        onPress={() => handleNoteLinePress(note)}
                        activeOpacity={0.7}
                        style={styles.noteLine}
                      >
                        <Text
                          style={[styles.noteTimestamp, { fontSize: textSizes.caption }]}
                        >
                          {formatTime(note.timestamp)}
                        </Text>
                        {note.speaker && (
                          <Text
                            style={[styles.noteSpeaker, { fontSize: textSizes.caption }]}
                          >
                            {t('speaker')} {note.speaker}
                          </Text>
                        )}
                        <Text style={[styles.noteText, { fontSize: textSizes.body }]}>
                          {note.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <Text style={[styles.hint, { fontSize: textSizes.caption }]}>
                      {t('tapLineToPlay')}
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.emptyText, { fontSize: textSizes.body }]}>
                    {recording.status === 'failed'
                      ? t('processingFailed')
                      : t('processing')}
                  </Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          {recording.status === 'failed' && (
            <Button
              title={t('regenerate')}
              onPress={handleRegenerate}
              variant="secondary"
              style={styles.actionButton}
              loading={isProcessing}
            />
          )}
          <Button
            title={t('share')}
            onPress={handleShare}
            variant="primary"
            style={styles.actionButton}
            icon={
              <FontAwesome name="share" size={20} color="#FFFFFF" />
            }
          />
          <Button
            title={t('delete')}
            onPress={() => setShowDeleteDialog(true)}
            variant="outline"
            style={styles.actionButton}
            icon={
              <FontAwesome name="trash" size={20} color={Colors.light.tint} />
            }
          />
        </View>

        {/* Delete Confirmation */}
        <ConfirmDialog
          visible={showDeleteDialog}
          title={t('confirmDelete')}
          message={t('deleteWarning')}
          confirmText={t('delete')}
          cancelText={t('cancel')}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          destructive
        />
      </SafeAreaView>
    </>
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  errorText: {
    color: Colors.light.text,
    textAlign: 'center',
  },
  header: {
    paddingVertical: 16,
  },
  date: {
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  duration: {
    color: Colors.light.textSecondary,
  },
  playbackSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playbackInfo: {
    flex: 1,
    marginHorizontal: 16,
  },
  playbackTime: {
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.tint,
    borderRadius: 3,
  },
  speedButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  speedText: {
    color: Colors.light.text,
    fontWeight: '600',
  },
  tabSection: {
    marginBottom: 24,
  },
  contentSection: {
    flex: 1,
    minHeight: 200,
  },
  processingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  processingText: {
    color: Colors.light.text,
    fontWeight: '600',
    marginTop: 16,
  },
  processingHint: {
    color: Colors.light.textSecondary,
    marginTop: 8,
  },
  summaryContainer: {
    gap: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  bullet: {
    marginTop: 8,
  },
  summaryText: {
    flex: 1,
    color: Colors.light.text,
    lineHeight: 28,
  },
  notesContainer: {
    gap: 8,
  },
  noteLine: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  noteTimestamp: {
    color: Colors.light.tint,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteSpeaker: {
    color: Colors.light.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  noteText: {
    color: Colors.light.text,
    lineHeight: 26,
  },
  hint: {
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  emptyText: {
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingVertical: 48,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  actionButton: {
    flex: 1,
  },
});
