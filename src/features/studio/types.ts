import type { Exercise, ExerciseType, Lesson, Level, Unit } from '@/src/types/content';

export type LevelRow = Pick<Level, 'id' | 'title' | 'cefr_level' | 'is_published' | 'sort_order'>;
export type UnitRow = Pick<Unit, 'id' | 'level_id' | 'title' | 'is_published' | 'sort_order'>;
export type LessonRow = Pick<Lesson, 'id' | 'unit_id' | 'title' | 'is_published' | 'sort_order'>;
export type ExerciseRow = Pick<
  Exercise,
  'id' | 'lesson_id' | 'type' | 'prompt' | 'is_required' | 'sort_order' | 'content'
>;

export type StarterType = ExerciseType;

export const STARTER_TYPES: { type: ExerciseType; label: string; hint: string }[] = [
  { type: 'multiple_choice', label: 'Multiple choice', hint: 'Pick one correct option' },
  { type: 'fill_blank', label: 'Fill blank', hint: 'Type the missing word' },
  { type: 'word_order', label: 'Word order', hint: 'Build the sentence from word chips' },
  { type: 'image_choice', label: 'Image choice', hint: 'Pick the word for the picture' },
  { type: 'inline_choice', label: 'Inline choice', hint: 'Choose the word for a gap in a sentence' },
  { type: 'context_fill', label: 'Context fill', hint: 'Complete a dialogue' },
  { type: 'listening_multiple_choice', label: 'Listening multiple choice', hint: 'Hear it, pick the answer' },
  { type: 'listening_dictation', label: 'Listening dictation', hint: 'Hear it, type it' },
  { type: 'listening_word_order', label: 'Listening word order', hint: 'Hear it, rebuild it' },
  { type: 'sentence_order', label: 'Sentence order', hint: 'Order sentence chunks' },
  { type: 'reading_comprehension', label: 'Reading comprehension', hint: 'Read, then answer' },
  { type: 'speaking_recording', label: 'Speaking recording', hint: 'Repeat after the model (ungraded)' },
  { type: 'flashcard_flip', label: 'Flashcard flip', hint: 'Study card (ungraded)' },
  { type: 'error_spot', label: 'Error spot', hint: 'Find the mistake and fix it' },
  { type: 'stress_tap', label: 'Stress tap', hint: 'Tap the stressed syllable' },
  { type: 'silent_letter', label: 'Silent letter', hint: 'Tap the silent letter' },
  { type: 'matching', label: 'Matching', hint: 'Connect words with meanings' },
  { type: 'word_sort', label: 'Word sort', hint: 'Sort words into two categories' },
  { type: 'form_fill', label: 'Form fill', hint: 'Complete a form with several blanks' },
  { type: 'document_reader', label: 'Document reader', hint: 'Read a document, answer questions' },
  { type: 'best_reply', label: 'Best reply', hint: 'Choose the best reply, in steps' },
];

export const EDITOR_TYPE_NAMES = STARTER_TYPES.map((entry) => entry.type);

export function typeLabel(type: string): string {
  const words = type.split('_');
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}