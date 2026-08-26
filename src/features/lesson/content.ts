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
  words: string[];
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

export interface ReadingComprehensionContent {
  bubbles: string[];
  text_to_speak: string;
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
  onContinue: () => void;
  onUngradedContinue?: (exercise: Exercise) => void;
  continueLabel?: string;
}