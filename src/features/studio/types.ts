import type { Exercise, Lesson, Level, Unit } from '@/src/types/content';

export type LevelRow = Pick<Level, 'id' | 'title' | 'cefr_level' | 'is_published' | 'sort_order'>;
export type UnitRow = Pick<Unit, 'id' | 'level_id' | 'title' | 'is_published' | 'sort_order'>;
export type LessonRow = Pick<Lesson, 'id' | 'unit_id' | 'title' | 'is_published' | 'sort_order'>;
export type ExerciseRow = Pick<
  Exercise,
  'id' | 'lesson_id' | 'type' | 'prompt' | 'is_required' | 'sort_order' | 'content'
>;

export type StarterType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'word_order'
  | 'image_choice';

export const STARTER_TYPES: { type: StarterType; label: string; hint: string }[] = [
  { type: 'multiple_choice', label: 'Multiple choice', hint: 'Pick one correct option' },
  { type: 'fill_blank', label: 'Fill blank', hint: 'Type the missing word' },
  { type: 'word_order', label: 'Word order', hint: 'Build the sentence from word chips' },
  { type: 'image_choice', label: 'Image choice', hint: 'Pick the word for the picture' },
];

export function typeLabel(type: string): string {
  const words = type.split('_');
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}