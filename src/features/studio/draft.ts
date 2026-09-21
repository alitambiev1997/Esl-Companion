import type { ExerciseRow, StarterType } from '@/src/features/studio/types';

export interface Draft {
  type: StarterType;
  prompt: string;
  isRequired: boolean;
  sortOrder: number;
  options: string[];
  correctIndex: number;
  explanation: string;
  accepted: string[];
  sequence: string[];
  imageUrl: string;
  textToSpeak: string;
}

function strArr(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

export function draftFromExercise(exercise: ExerciseRow): Draft {
  const content = (exercise.content ?? {}) as Record<string, unknown>;
  const options = strArr(content.options);
  const accepted = strArr(content.correct_answers);
  const contentPrompt =
    exercise.type === 'image_choice' && typeof content.prompt === 'string' && content.prompt
      ? content.prompt
      : exercise.prompt;
  return {
    type: exercise.type as StarterType,
    prompt: contentPrompt,
    isRequired: exercise.is_required !== false,
    sortOrder: exercise.sort_order,
    options: options.length >= 2 ? options : [...options, '', ''].slice(0, 2),
    correctIndex: typeof content.correct_index === 'number' ? content.correct_index : 0,
    explanation: typeof content.explanation === 'string' ? content.explanation : '',
    accepted: accepted.length > 0 ? accepted : [''],
    sequence: strArr(content.correct_sequence),
    imageUrl: typeof content.image_url === 'string' ? content.image_url : '',
    textToSpeak: typeof content.text_to_speak === 'string' ? content.text_to_speak : '',
  };
}

export function newDraft(type: StarterType, sortOrder: number): Draft {
  return {
    type,
    prompt: '',
    isRequired: true,
    sortOrder,
    options: ['', ''],
    correctIndex: 0,
    explanation: '',
    accepted: [''],
    sequence: [],
    imageUrl: '',
    textToSpeak: '',
  };
}

export function buildContent(draft: Draft): Record<string, unknown> {
  const explanation = draft.explanation.trim() ? draft.explanation.trim() : null;
  switch (draft.type) {
    case 'multiple_choice':
      return {
        options: draft.options.map((o) => o.trim()),
        correct_index: draft.correctIndex,
        explanation,
      };
    case 'fill_blank':
      return {
        correct_answers: draft.accepted.map((a) => a.trim()).filter(Boolean),
        explanation,
      };
    case 'word_order':
      return {
        correct_sequence: draft.sequence.map((w) => w.trim()).filter(Boolean),
        explanation,
      };
    case 'image_choice':
      return {
        image_url: draft.imageUrl.trim() || null,
        text_to_speak: draft.textToSpeak.trim() || null,
        prompt: draft.prompt.trim() || null,
        options: draft.options.map((o) => o.trim()),
        correct_index: draft.correctIndex,
        explanation,
      };
  }
}

export function isDraftEmpty(draft: Draft): boolean {
  if (draft.prompt.trim()) return false;
  if (draft.explanation.trim()) return false;
  if (draft.options.some((o) => o.trim())) return false;
  if (draft.accepted.some((a) => a.trim())) return false;
  if (draft.sequence.some((w) => w.trim())) return false;
  if (draft.imageUrl.trim()) return false;
  if (draft.textToSpeak.trim()) return false;
  return true;
}