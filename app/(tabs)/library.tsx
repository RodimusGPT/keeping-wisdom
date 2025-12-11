import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import Colors from '@/constants/Colors';
import { useTranslation } from '@/hooks/useTranslation';
import { useTextSize } from '@/hooks/useTextSize';
import { useAppStore } from '@/store/useAppStore';
import { RecordingCard } from '@/components/ui';
import { Recording } from '@/types';

export default function LibraryScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const textSizes = useTextSize();
  const [searchQuery, setSearchQuery] = useState('');

  const recordings = useAppStore((state) => state.recordings);

  const filteredRecordings = useMemo(() => {
    if (!searchQuery.trim()) return recordings;

    const query = searchQuery.toLowerCase();
    return recordings.filter((recording) => {
      // Search in notes
      if (recording.notes) {
        const notesMatch = recording.notes.some((note) =>
          note.text.toLowerCase().includes(query)
        );
        if (notesMatch) return true;
      }

      // Search in summary
      if (recording.summary) {
        const summaryMatch = recording.summary.some((point) =>
          point.toLowerCase().includes(query)
        );
        if (summaryMatch) return true;
      }

      // Search by date
      const dateStr = new Date(recording.createdAt).toLocaleDateString();
      if (dateStr.includes(query)) return true;

      return false;
    });
  }, [recordings, searchQuery]);

  const handleRecordingPress = (id: string) => {
    router.push(`/recording/${id}`);
  };

  const renderItem = ({ item }: { item: Recording }) => (
    <RecordingCard
      recording={item}
      onPress={() => handleRecordingPress(item.id)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <FontAwesome
        name="folder-open-o"
        size={64}
        color={Colors.light.textSecondary}
      />
      <Text style={[styles.emptyTitle, { fontSize: textSizes.bodyLarge }]}>
        {t('noRecordings')}
      </Text>
      <Text style={[styles.emptySubtitle, { fontSize: textSizes.body }]}>
        {t('startFirstRecording')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: textSizes.headerLarge }]}>
          {t('recordings')}
        </Text>
      </View>

      {/* Search Bar */}
      {recordings.length > 0 && (
        <View style={styles.searchContainer}>
          <FontAwesome
            name="search"
            size={20}
            color={Colors.light.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { fontSize: textSizes.body }]}
            placeholder={
              t('language') === '語言' ? '搜尋錄音...' : 'Search recordings...'
            }
            placeholderTextColor={Colors.light.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      )}

      {/* Recordings List */}
      <FlatList
        data={filteredRecordings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: '700',
    color: Colors.light.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    marginHorizontal: 24,
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 56,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: Colors.light.text,
    height: '100%',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
