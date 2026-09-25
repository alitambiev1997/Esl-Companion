import { EDITOR_TYPE_NAMES } from '@/src/features/studio/types';
import { strField, validateContent, type Content } from '@/src/features/studio/content-model';
import type { ExerciseType } from '@/src/types/content';

export interface ImportExercise {
  type: ExerciseType;
  prompt: string;
  is_required?: boolean;
  content: Content;
}

export interface ImportLesson {
  title: string;
  description: string | null;
  estimated_minutes: number | null;
  exercises: ImportExercise[];
}

export interface ImportResult {
  lessons: ImportLesson[];
  problems: string[];
  error: string | null;
}

export function parseImportJson(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (parseError) {
    return {
      lessons: [],
      problems: [],
      error: `Not valid JSON: ${parseError instanceof Error ? parseError.message : 'parse failed'}`,
    };
  }

  const items = Array.isArray(parsed) ? parsed : [parsed];
  const lessons: ImportLesson[] = [];
  const problems: string[] = [];

  items.forEach((item, lessonIndex) => {
    const lessonLabel = `Lesson ${lessonIndex + 1}`;
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      problems.push(`${lessonLabel}: must be an object.`);
      return;
    }
    const record = item as Record<string, unknown>;
    const title = strField(record.title).trim();
    if (!title) problems.push(`${lessonLabel}: "title" is required.`);

    const rawExercises = Array.isArray(record.exercises) ? record.exercises : [];
    if (rawExercises.length === 0) {
      problems.push(`${lessonLabel}: "exercises" array is required and cannot be empty.`);
    }

    const exercises: ImportExercise[] = [];
    rawExercises.forEach((rawExercise, exerciseIndex) => {
      const exerciseLabel = `${lessonLabel} · exercise ${exerciseIndex + 1}`;
      if (!rawExercise || typeof rawExercise !== 'object') {
        problems.push(`${exerciseLabel}: must be an object.`);
        return;
      }
      const exerciseRecord = rawExercise as Record<string, unknown>;
      const type = strField(exerciseRecord.type) as ExerciseType;
      if (!EDITOR_TYPE_NAMES.includes(type)) {
        problems.push(
          `${exerciseLabel}: unknown type "${strField(exerciseRecord.type)}". Use one of the 21 implemented types.`
        );
        return;
      }
      const prompt = strField(exerciseRecord.prompt);
      const content =
        exerciseRecord.content && typeof exerciseRecord.content === 'object'
          ? (exerciseRecord.content as Content)
          : {};
      validateContent(type, prompt, content).forEach((problem) => {
        problems.push(`${exerciseLabel} (${type}): ${problem}`);
      });
      exercises.push({
        type,
        prompt,
        is_required:
          typeof exerciseRecord.is_required === 'boolean' ? exerciseRecord.is_required : undefined,
        content,
      });
    });

    if (title && exercises.length > 0) {
      lessons.push({
        title,
        description: strField(record.description).trim() || null,
        estimated_minutes:
          typeof record.estimated_minutes === 'number' ? record.estimated_minutes : null,
        exercises,
      });
    }
  });

  return { lessons, problems, error: null };
}

export function importSummary(lessons: ImportLesson[]): string {
  const exerciseCount = lessons.reduce((sum, lesson) => sum + lesson.exercises.length, 0);
  const lessonWord = lessons.length === 1 ? 'lesson' : 'lessons';
  const exerciseWord = exerciseCount === 1 ? 'exercise' : 'exercises';
  return `${lessons.length} ${lessonWord}, ${exerciseCount} ${exerciseWord} ready to create.`;
}

export function importExample(): string {
  return JSON.stringify(
    {
      title: 'Meet the People',
      description: 'Introductory - People vocabulary with pictures, plurals and word stress',
      estimated_minutes: 5,
      exercises: [
        {
          type: 'multiple_choice',
          prompt: 'Choose the correct sentence.',
          content: {
            options: ['She is a teacher.', 'She are a teacher.', 'She am a teacher.'],
            correct_index: 0,
            explanation: 'Se "she" pouzivame "is".',
          },
        },
        {
          type: 'fill_blank',
          prompt: 'Doplnte: I ___ a student.',
          content: { correct_answers: ['am'], explanation: 'S "I" pouzivame "am".' },
        },
      ],
    },
    null,
    2
  );
}