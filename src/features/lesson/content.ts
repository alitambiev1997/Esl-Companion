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

export interface ExerciseRendererProps {
  exercise: Exercise;
  checked: boolean;
  busy: boolean;
  isLast: boolean;
  onCheck: (userAnswer: Record<string, unknown>, isCorrect: boolean) => void;
  onContinue: () => void;
}