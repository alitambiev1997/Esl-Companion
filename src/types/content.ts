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
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface Level {
  id: string;
  program_id: string;
  title: string;
  cefr_level: string | null;
  description: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export interface Unit {
  id: string;
  level_id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  unit_id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  pass_score: number | null;
  estimated_minutes: number | null;
  sort_order: number;
  created_at: string;
}

export interface ExerciseAttempt {
  id: string;
  user_id: string;
  lesson_id: string;
  exercise_id: string;
  user_answer: Record<string, unknown> | null;
  is_correct: boolean;
  time_spent_seconds: number | null;
  created_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: string;
  score: number | null;
  completed_at: string | null;
}

export interface Exercise {
  id: string;
  lesson_id: string;
  type: ExerciseType;
  prompt: string;
  content: Record<string, unknown> | null;
  sort_order: number;
  created_at: string;
}

export interface VocabularyItem {
  id: string;
  level_id: string;
  word: string;
  definition: string;
  example_sentence: string | null;
  audio_url: string | null;
  created_at: string;
}