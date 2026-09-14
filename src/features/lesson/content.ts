import type { Exercise } from '@/src/types/content';

export interface MultipleChoiceContent {
  options: string[];
  correct_index: number;
  explanation: string | null;
}

export interface FillBlankContent {
  correct_answers: string[];
  explanation: string | null;
}

export interface WordOrderContent {
  words?: string[];
  correct_sequence: string[];
  explanation: string | null;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface MatchingContent {
  pairs: MatchingPair[];
  explanation: string | null;
}

export interface ListeningMultipleChoiceContent {
  text_to_speak: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
}

export interface ListeningDictationContent {
  text_to_speak: string;
  accepted: string[];
  explanation: string | null;
}

export interface ReadingComprehensionLine {
  speaker: string;
  side: 'left' | 'right';
  text: string;
}

export interface ReadingComprehensionContent {
  bubbles?: string[] | null;
  dialogue?: ReadingComprehensionLine[] | null;
  text_to_speak?: string | null;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
}

export interface InlineChoiceContent {
  sentence: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  tip?: string | null;
}

export interface DialogueLine {
  speaker: string;
  side: 'left' | 'right';
  text: string;
}

export interface ContextFillContent {
  dialogue: DialogueLine[];
  options: string[];
  correct_index: number;
  explanation: string | null;
}

export interface ListeningWordOrderContent {
  text_to_speak: string;
  correct_sequence: string[];
  explanation: string | null;
}

export interface SentenceOrderContent {
  correct_sequence: string[];
  explanation: string | null;
}

export interface FlashcardFlipContent {
  front: string;
  back: string;
  example: string | null;
  text_to_speak: string;
}

export interface ErrorSpotContent {
  words: string[];
  wrong_index: number;
  options: string[];
  correct_index: number;
  explanation: string | null;
}

export interface StressTapContent {
  syllables: string[];
  correct_index: number;
  text_to_speak: string;
  explanation: string | null;
}

export interface SilentLetterContent {
  letters: string[];
  correct_index: number;
  explanation: string | null;
}

export interface WordSortItem {
  word: string;
  category: 0 | 1;
}

export interface WordSortContent {
  categories: [string, string];
  items: WordSortItem[];
  explanation: string | null;
}

export interface FormField {
  prompt: string;
  options: string[];
  correct_index: number;
  explanation?: string | null;
}

export interface FormFillContent {
  title: string | null;
  text_to_speak: string | null;
  fields: FormField[];
  explanation: string | null;
}

export interface ImageChoiceContent {
  image_url: string | null;
  text_to_speak: string | null;
  prompt: string | null;
  options: string[];
  correct_index: number;
  explanation: string | null;
}

export interface DocumentQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
}

export interface DocumentReaderContent {
  image_url: string | null;
  document_lines: string[] | null;
  questions: DocumentQuestion[];
  explanation: string | null;
}

export interface BestReplyLine {
  speaker: string;
  side: 'left' | 'right';
  text: string;
}

export interface BestReplyStep {
  lines: BestReplyLine[];
  options: string[];
  correct_index: number;
  explanation: string | null;
  reply: string;
}

export interface BestReplyContent {
  steps: BestReplyStep[];
}

export interface FeedbackBannerInfo {
  correct: boolean;
  title?: string | null;
  explanation: string | null;
  correctAnswer: string | null;
  chips?: string[] | null;
  tip?: string | null;
}

export interface ExerciseRendererHandle {
  check: () => void;
}

export interface ExerciseRendererProps {
  exercise: Exercise;
  checked: boolean;
  busy: boolean;
  isLast: boolean;
  onCheck: (
    userAnswer: Record<string, unknown>,
    isCorrect: boolean,
    banner: FeedbackBannerInfo
  ) => void;
  onCanCheckChange: (canCheck: boolean) => void;
  onProgressChange?: (remaining: number) => void;
  onHint?: (message: string | null) => void;
  onContinue: () => void;
  onUngradedContinue?: (exercise: Exercise) => void;
  continueLabel?: string;
}