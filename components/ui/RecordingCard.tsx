import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useTextSize } from '@/hooks/useTextSize';
import { useTranslation } from '@/hooks/useTranslation';
import { Recording } from '@/types';

interface RecordingCardProps {
  recording: Recording;
  onPress: () => void;
}

export function RecordingCard({ recording, onPress }: RecordingCardProps) {
  const { t } = useTranslation();
  const textSizes = useTextSize();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return t('today');
    if (diffDays === 1) return t('yesterday');
    if (diffDays < 7) return t('daysAgo', { days: diffDays });

    return date.toLocaleDateString();
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPreviewText = () => {
    if (recording.summary && recording.summary.length > 0) {
      return recording.summary[0];
    }
    if (recording.notes && recording.notes.length > 0) {
      return recording.notes[0].text;
    }
    return null;
  };

  const getStatusIcon = () => {
    switch (recording.status) {
      case 'completed':
        return <FontAwesome name="check-circle" size={18} color={Colors.light.success} />;
      case 'processing':
        return <FontAwesome name="clock-o" size={18} color={Colors.light.buttonSecondary} />;
      case 'failed':
        return <FontAwesome name="exclamation-circle" size={18} color={Colors.light.error} />;
      default:
        return null;
    }
  };

  const preview = getPreviewText();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={[styles.date, { fontSize: textSizes.bodyLarge }]}>
          {formatDate(recording.createdAt)}
        </Text>
        <View style={styles.statusContainer}>
          {getStatusIcon()}
          <Text style={[styles.duration, { fontSize: textSizes.body }]}>
            {formatDuration(recording.duration)}
          </Text>
        </View>
      </View>

      {preview && (
        <Text
          style={[styles.preview, { fontSize: textSizes.body }]}
          numberOfLines={2}
        >
          {preview}
        </Text>
      )}

      {recording.status === 'completed' && (
        <View style={styles.badges}>
          {recording.notes && recording.notes.length > 0 && (
            <View style={styles.badge}>
              <FontAwesome name="check" size={12} color={Colors.light.success} />
              <Text style={[styles.badgeText, { fontSize: textSizes.caption }]}>
                {t('notes')}
              </Text>
            </View>
          )}
          {recording.summary && recording.summary.length > 0 && (
            <View style={styles.badge}>
              <FontAwesome name="check" size={12} color={Colors.light.success} />
              <Text style={[styles.badgeText, { fontSize: textSizes.caption }]}>
                {t('summary')}
              </Text>
            </View>
          )}
        </View>
      )}

      {recording.status === 'processing' && (
        <Text style={[styles.processingText, { fontSize: textSizes.caption }]}>
          {t('processing')}...
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontWeight: '700',
    color: Colors.light.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  duration: {
    color: Colors.light.textSecondary,
  },
  preview: {
    color: Colors.light.textSecondary,
    lineHeight: 24,
    marginTop: 4,
  },
  badges: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    color: Colors.light.success,
  },
  processingText: {
    color: Colors.light.buttonSecondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
