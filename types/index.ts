export type Language = 'zh-TW' | 'en';

export type RecordingStatus = 'recording' | 'processing' | 'completed' | 'failed';

export interface NoteLine {
  id: string;
  timestamp: number; // milliseconds from start
  speaker?: string;
  text: string;
}

export interface Recording {
  id: string;
  createdAt: string;
  duration: number; // milliseconds
  audioUri: string;
  status: RecordingStatus;
  notes?: NoteLine[];
  summary?: string[];
  language?: Language;
  title?: string;
}

export interface AppSettings {
  language: Language;
  textSize: 'normal' | 'large' | 'extraLarge';
  hasCompletedOnboarding: boolean;
  soundFeedback: boolean;
  hapticFeedback: boolean;
}

export interface ProcessingState {
  recordingId: string;
  step: 'notes' | 'summary';
  progress: number;
}
