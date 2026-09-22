import {
  defaultContent,
  displayPrompt,
  objList,
  strField,
  strItems,
  supportsExplanation,
  validateContent,
  type Content,
} from '@/src/features/studio/content-model';
import type { ExerciseRow } from '@/src/features/studio/types';
import type { ExerciseType } from '@/src/types/content';

export interface Draft {
  type: ExerciseType;
  prompt: string;
  isRequired: boolean;
  sortOrder: number;
  content: Content;
}

export function isUngradedType(type: ExerciseType): boolean {
  return type === 'speaking_recording' || type === 'flashcard_flip';
}

export function draftFromExercise(exercise: ExerciseRow): Draft {
  const content = exercise.content ?? {};
  const normalized: Content = { ...defaultContent(exercise.type), ...content };
  return {
    type: exercise.type,
    prompt: displayPrompt(exercise.type, exercise.prompt, normalized),
    isRequired: exercise.is_required !== false,
    sortOrder: exercise.sort_order,
    content: normalized,
  };
}

export function newDraft(type: ExerciseType, sortOrder: number): Draft {
  return {
    type,
    prompt: '',
    isRequired: !isUngradedType(type),
    sortOrder,
    content: defaultContent(type),
  };
}

export function finalizeContent(draft: Draft): Content {
  const content: Content = { ...draft.content };
  if (supportsExplanation(draft.type)) {
    content.explanation = strField(content.explanation).trim() || null;
  }
  if (draft.type === 'best_reply') {
    content.steps = objList(content.steps).map((step) => {
      const options = strItems(step.options);
      const index = typeof step.correct_index === 'number' ? step.correct_index : 0;
      return { ...step, reply: options[index] ?? strField(step.reply) };
    });
  }
  return content;
}

function contentHasText(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(contentHasText);
  if (value && typeof value === 'object') {
    return Object.values(value as Content).some(contentHasText);
  }
  return false;
}

export function isDraftEmpty(draft: Draft): boolean {
  if (draft.prompt.trim()) return false;
  return !contentHasText(draft.content);
}

export function validateDraft(draft: Draft): string[] {
  return validateContent(draft.type, draft.prompt, draft.content);
}