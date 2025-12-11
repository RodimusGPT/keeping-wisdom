import { Recording, NoteLine } from '@/types';

// Mock transcription service
// In production, this would integrate with:
// - OpenAI Whisper API
// - Google Speech-to-Text
// - Azure Speech Services
// - AssemblyAI

interface ProcessingResult {
  notes: NoteLine[];
  summary: string[];
}

// Simulate processing delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Generate mock notes based on duration
function generateMockNotes(duration: number, language: string = 'zh-TW'): NoteLine[] {
  const notes: NoteLine[] = [];
  const noteCount = Math.max(3, Math.floor(duration / 10000)); // One note per ~10 seconds

  const zhPhrases = [
    '今天我們來討論一下這個重要的議題。',
    '這是一個非常關鍵的觀點。',
    '讓我詳細解釋一下這個部分。',
    '根據最新的資料顯示，情況有所改變。',
    '我們需要特別注意這幾個方面。',
    '這個問題需要進一步的研究。',
    '總結來說，這是我們的主要發現。',
    '下一步我們應該採取以下行動。',
    '請記住這些重要的日期和數字。',
    '如果有任何問題，請隨時提出。',
  ];

  const enPhrases = [
    'Today we will discuss this important topic.',
    'This is a very crucial point to consider.',
    'Let me explain this part in more detail.',
    'According to the latest data, the situation has changed.',
    'We need to pay special attention to these aspects.',
    'This issue requires further investigation.',
    'In summary, these are our main findings.',
    'Next, we should take the following actions.',
    'Please remember these important dates and numbers.',
    'If you have any questions, please feel free to ask.',
  ];

  const phrases = language === 'zh-TW' ? zhPhrases : enPhrases;

  for (let i = 0; i < noteCount; i++) {
    const timestamp = Math.floor((i / noteCount) * duration);
    const phraseIndex = i % phrases.length;
    const speaker = i % 3 === 0 ? '1' : i % 3 === 1 ? '2' : undefined;

    notes.push({
      id: `note_${i}_${Date.now()}`,
      timestamp,
      speaker,
      text: phrases[phraseIndex],
    });
  }

  return notes;
}

// Generate mock summary based on notes
function generateMockSummary(notes: NoteLine[], language: string = 'zh-TW'): string[] {
  const zhSummary = [
    '討論了當前情況的主要發展和變化',
    '確定了需要關注的關鍵領域',
    '提出了後續行動的建議方案',
    '安排了下次會議的時間和議程',
  ];

  const enSummary = [
    'Discussed the main developments and changes in the current situation',
    'Identified key areas that require attention',
    'Proposed recommendations for follow-up actions',
    'Scheduled the next meeting time and agenda',
  ];

  // Return 3-5 summary points based on content length
  const summaryPool = language === 'zh-TW' ? zhSummary : enSummary;
  const pointCount = Math.min(summaryPool.length, Math.max(3, Math.floor(notes.length / 2)));

  return summaryPool.slice(0, pointCount);
}

export async function processRecording(recording: Recording): Promise<ProcessingResult> {
  // Simulate processing time based on duration
  // In reality, this would be much faster with cloud APIs
  const processingTime = Math.min(3000, Math.max(1000, recording.duration / 10));

  // Step 1: Transcription (notes)
  await delay(processingTime * 0.6);

  const notes = generateMockNotes(
    recording.duration,
    recording.language || 'zh-TW'
  );

  // Step 2: Summarization
  await delay(processingTime * 0.4);

  const summary = generateMockSummary(notes, recording.language || 'zh-TW');

  return {
    notes,
    summary,
  };
}
