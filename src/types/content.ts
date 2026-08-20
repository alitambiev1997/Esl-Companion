export type ExerciseType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'word_order'
  | 'matching'
  | 'listening_multiple_choice'
  | 'listening_dictation'
  | 'reading_comprehension'
  | 'speaking_recording'
  | 'flashcard';

export interface Program {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface Level {
  id: string;
  program_id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface Unit {
  id: string;
  level_id: string;
  title: string;
  display_order: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  unit_id: string;
  title: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

export interface Exercise {
  id: string;
  lesson_id: string;
  type: ExerciseType;
  prompt: string;
  content: Record<string, unknown> | null;
  display_order: number;
  created_at: string;
}

export interface VocabularyItem {
  id: string;
  lesson_id: string;
  term: string;
  definition: string;
  example_sentence: string | null;
  audio_url: string | null;
  display_order: number;
  created_at: string;
}
