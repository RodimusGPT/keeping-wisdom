import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recording, AppSettings, Language, ProcessingState } from '@/types';

interface AppState {
  // Settings
  settings: AppSettings;
  setLanguage: (language: Language) => void;
  setTextSize: (size: AppSettings['textSize']) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setSoundFeedback: (enabled: boolean) => void;
  setHapticFeedback: (enabled: boolean) => void;

  // Recordings
  recordings: Recording[];
  addRecording: (recording: Recording) => void;
  updateRecording: (id: string, updates: Partial<Recording>) => void;
  deleteRecording: (id: string) => void;
  getRecording: (id: string) => Recording | undefined;

  // Recording state
  isRecording: boolean;
  currentRecordingId: string | null;
  recordingDuration: number;
  setIsRecording: (isRecording: boolean) => void;
  setCurrentRecordingId: (id: string | null) => void;
  setRecordingDuration: (duration: number) => void;

  // Processing state
  processingState: ProcessingState | null;
  setProcessingState: (state: ProcessingState | null) => void;

  // First recording flag
  hasShownFirstRecordingExplanation: boolean;
  setHasShownFirstRecordingExplanation: (shown: boolean) => void;
}

export const useAppStore = create<AppState>()(persist(
    (set, get) => ({
      // Default settings
      settings: {
        language: 'zh-TW',
        textSize: 'large',
        hasCompletedOnboarding: false,
        soundFeedback: true,
        hapticFeedback: true,
      },

      setLanguage: (language) =>
        set((state) => ({
          settings: { ...state.settings, language },
        })),

      setTextSize: (textSize) =>
        set((state) => ({
          settings: { ...state.settings, textSize },
        })),

      setHasCompletedOnboarding: (hasCompletedOnboarding) =>
        set((state) => ({
          settings: { ...state.settings, hasCompletedOnboarding },
        })),

      setSoundFeedback: (soundFeedback) =>
        set((state) => ({
          settings: { ...state.settings, soundFeedback },
        })),

      setHapticFeedback: (hapticFeedback) =>
        set((state) => ({
          settings: { ...state.settings, hapticFeedback },
        })),

      // Recordings
      recordings: [],

      addRecording: (recording) =>
        set((state) => ({
          recordings: [recording, ...state.recordings],
        })),

      updateRecording: (id, updates) =>
        set((state) => ({
          recordings: state.recordings.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      deleteRecording: (id) =>
        set((state) => ({
          recordings: state.recordings.filter((r) => r.id !== id),
        })),

      getRecording: (id) => get().recordings.find((r) => r.id === id),

      // Recording state
      isRecording: false,
      currentRecordingId: null,
      recordingDuration: 0,

      setIsRecording: (isRecording) => set({ isRecording }),
      setCurrentRecordingId: (currentRecordingId) => set({ currentRecordingId }),
      setRecordingDuration: (recordingDuration) => set({ recordingDuration }),

      // Processing state
      processingState: null,
      setProcessingState: (processingState) => set({ processingState }),

      // First recording explanation
      hasShownFirstRecordingExplanation: false,
      setHasShownFirstRecordingExplanation: (hasShownFirstRecordingExplanation) =>
        set({ hasShownFirstRecordingExplanation }),
    }),
    {
      name: 'keeping-wisdom-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        recordings: state.recordings,
        hasShownFirstRecordingExplanation: state.hasShownFirstRecordingExplanation,
      }),
    }
  )
);
