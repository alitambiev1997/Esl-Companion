import type { ExerciseType } from '@/src/types/content';

export type Content = Record<string, unknown>;

export function strItems(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

export function strField(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function objList(value: unknown): Content[] {
  return Array.isArray(value)
    ? value.filter((item): item is Content => typeof item === 'object' && item !== null)
    : [];
}

export function defaultContent(type: ExerciseType): Content {
  switch (type) {
    case 'multiple_choice':
      return { options: ['', ''], correct_index: 0, explanation: null };
    case 'fill_blank':
      return { correct_answers: [''], explanation: null };
    case 'word_order':
      return { correct_sequence: [], explanation: null };
    case 'image_choice':
      return {
        image_url: null,
        text_to_speak: null,
        prompt: null,
        options: ['', ''],
        correct_index: 0,
        explanation: null,
      };
    case 'inline_choice':
      return { sentence: '', options: ['', ''], correct_index: 0, explanation: null, tip: null };
    case 'context_fill':
      return {
        dialogue: [{ speaker: '', side: 'left', text: '' }],
        options: ['', ''],
        correct_index: 0,
        explanation: null,
      };
    case 'listening_multiple_choice':
      return { text_to_speak: '', options: ['', ''], correct_index: 0, explanation: null };
    case 'listening_dictation':
      return { text_to_speak: '', accepted: [''], explanation: null };
    case 'listening_word_order':
      return { text_to_speak: '', correct_sequence: [], explanation: null };
    case 'sentence_order':
      return { correct_sequence: [], explanation: null };
    case 'reading_comprehension':
      return {
        bubbles: [''],
        dialogue: null,
        text_to_speak: null,
        question: '',
        options: ['', ''],
        correct_index: 0,
        explanation: null,
      };
    case 'speaking_recording':
      return { text_to_speak: '' };
    case 'flashcard_flip':
      return { front: '', back: '', example: null, text_to_speak: '' };
    case 'error_spot':
      return {
        words: ['', ''],
        wrong_index: 0,
        options: ['', ''],
        correct_index: 0,
        explanation: null,
      };
    case 'stress_tap':
      return { syllables: ['', ''], correct_index: 0, text_to_speak: '', explanation: null };
    case 'silent_letter':
      return { letters: ['', ''], correct_index: 0, explanation: null };
    case 'word_sort':
      return { categories: ['', ''], items: [], explanation: null };
    case 'form_fill':
      return {
        title: null,
        text_to_speak: null,
        fields: [{ prompt: '', options: ['', ''], correct_index: 0 }],
        explanation: null,
      };
    case 'document_reader':
      return {
        image_url: null,
        document_lines: [''],
        questions: [{ question: '', options: ['', ''], correct_index: 0, explanation: null }],
        explanation: null,
      };
    case 'best_reply':
      return {
        steps: [{ lines: [], options: ['', ''], correct_index: 0, explanation: null, reply: '' }],
      };
    default:
      return {};
  }
}

export function supportsExplanation(type: ExerciseType): boolean {
  return type !== 'speaking_recording' && type !== 'flashcard_flip';
}

export function storedPrompt(type: ExerciseType, prompt: string, content: Content): string {
  if (type === 'image_choice') return strField(content.prompt).trim();
  if (type === 'listening_word_order') return strField(content.text_to_speak).trim();
  return prompt.trim();
}

export function displayPrompt(
  type: ExerciseType,
  storedPromptValue: string,
  content: Content
): string {
  if (type === 'image_choice' && strField(content.prompt)) return strField(content.prompt);
  if (type === 'listening_word_order' && strField(content.text_to_speak)) {
    return strField(content.text_to_speak);
  }
  return storedPromptValue;
}

export function validateContent(
  type: ExerciseType,
  prompt: string,
  content: Content
): string[] {
  const errors: string[] = [];
  const options = strItems(content.options).filter((o) => o.trim());
  const optionCount = strItems(content.options).length;
  const correctIndex = typeof content.correct_index === 'number' ? content.correct_index : -1;
  const filledOptions = (label = 'option') => {
    if (options.length < 2) errors.push(`At least 2 ${label}s are required.`);
    else if (options.length !== optionCount) errors.push(`${label}s cannot be empty.`);
    else if (correctIndex < 0 || correctIndex >= optionCount) {
      errors.push(`Mark the correct ${label}.`);
    }
  };

  if (
    type !== 'image_choice' &&
    type !== 'listening_word_order' &&
    !prompt.trim()
  ) {
    errors.push('Prompt is required.');
  }

  switch (type) {
    case 'multiple_choice':
      filledOptions();
      break;
    case 'inline_choice': {
      if (!strField(content.sentence).trim()) errors.push('Sentence is required.');
      const blanks = strField(content.sentence).split('___').length - 1;
      if (blanks === 0) errors.push('Add ___ in the sentence where the blank goes.');
      else if (blanks > 1) errors.push('Use only one ___ blank.');
      filledOptions();
      break;
    }
    case 'context_fill': {
      const lines = objList(content.dialogue);
      if (lines.length === 0) errors.push('Add at least one dialogue line.');
      if (!lines.some((line) => strField(line.text).includes('___'))) {
        errors.push('One dialogue line must contain ___ for the blank.');
      }
      filledOptions();
      break;
    }
    case 'listening_multiple_choice': {
      if (!strField(content.text_to_speak).trim()) errors.push('Audio text is required.');
      filledOptions();
      break;
    }
    case 'listening_dictation': {
      if (!strField(content.text_to_speak).trim()) errors.push('Audio text is required.');
      if (strItems(content.accepted).filter((a) => a.trim()).length === 0) {
        errors.push('At least one accepted answer is required.');
      }
      break;
    }
    case 'listening_word_order': {
      if (!strField(content.text_to_speak).trim()) errors.push('Audio text is required.');
      if (strItems(content.correct_sequence).filter((w) => w.trim()).length < 2) {
        errors.push('At least 2 words are required.');
      }
      break;
    }
    case 'sentence_order':
    case 'word_order': {
      if (strItems(content.correct_sequence).filter((w) => w.trim()).length < 2) {
        errors.push('At least 2 parts are required.');
      }
      break;
    }
    case 'fill_blank': {
      if (strItems(content.correct_answers).filter((a) => a.trim()).length === 0) {
        errors.push('At least one accepted answer is required.');
      }
      const blanks = prompt.split('___').length - 1;
      if (blanks === 0) errors.push('Add ___ in the sentence where the blank goes.');
      else if (blanks > 1) errors.push('Use only one ___ blank.');
      break;
    }
    case 'image_choice': {
      if (!strField(content.prompt).trim()) errors.push('Question under the picture is required.');
      filledOptions();
      break;
    }
    case 'reading_comprehension': {
      const bubbles = strItems(content.bubbles).filter((b) => b.trim());
      const lines = objList(content.dialogue);
      if (bubbles.length === 0 && lines.length === 0) {
        errors.push('Add bubbles or dialogue lines to read.');
      }
      if (!strField(content.question).trim()) errors.push('Question is required.');
      filledOptions();
      break;
    }
    case 'speaking_recording': {
      if (!strField(content.text_to_speak).trim()) errors.push('Sentence to speak is required.');
      break;
    }
    case 'flashcard_flip': {
      if (!strField(content.front).trim()) errors.push('Front side is required.');
      if (!strField(content.back).trim()) errors.push('Back side is required.');
      if (!strField(content.text_to_speak).trim()) errors.push('Audio text is required.');
      break;
    }
    case 'error_spot': {
      const words = strItems(content.words);
      if (words.filter((w) => w.trim()).length < 2) errors.push('At least 2 sentence parts are required.');
      else if (words.some((w) => !w.trim())) errors.push('Sentence parts cannot be empty.');
      const wrongIndex = typeof content.wrong_index === 'number' ? content.wrong_index : -1;
      if (wrongIndex < 0 || wrongIndex >= words.length) errors.push('Mark the mistake.');
      filledOptions('fix');
      break;
    }
    case 'stress_tap': {
      const syllables = strItems(content.syllables);
      if (syllables.filter((s) => s.trim()).length < 2) errors.push('At least 2 syllables are required.');
      else if (syllables.some((s) => !s.trim())) errors.push('Syllables cannot be empty.');
      if (!strField(content.text_to_speak).trim()) errors.push('Audio text is required.');
      break;
    }
    case 'silent_letter': {
      const letters = strItems(content.letters);
      if (letters.filter((l) => l.trim()).length < 2) errors.push('At least 2 letters are required.');
      else if (letters.some((l) => !l.trim())) errors.push('Letters cannot be empty.');
      break;
    }
    case 'word_sort': {
      const categories = strItems(content.categories);
      if (categories.length !== 2 || !categories[0].trim() || !categories[1].trim()) {
        errors.push('Both category names are required.');
      }
      const items = objList(content.items);
      if (items.length < 2) errors.push('At least 2 words to sort are required.');
      else if (items.some((item) => !strField(item.word).trim())) {
        errors.push('Sorting words cannot be empty.');
      }
      break;
    }
    case 'form_fill': {
      const fields = objList(content.fields);
      if (fields.length === 0) errors.push('Add at least one form field.');
      fields.forEach((field, index) => {
        const fieldOptions = strItems(field.options).filter((o) => o.trim());
        if (!strField(field.prompt).trim()) {
          errors.push(`Field ${index + 1}: prompt is required.`);
        }
        if (fieldOptions.length < 2) {
          errors.push(`Field ${index + 1}: at least 2 options are required.`);
        }
      });
      break;
    }
    case 'document_reader': {
      const lines = strItems(content.document_lines).filter((l) => l.trim());
      const hasImage = Boolean(strField(content.image_url).trim());
      if (!hasImage && lines.length === 0) {
        errors.push('Add an image path or document lines.');
      }
      const questions = objList(content.questions);
      if (questions.length === 0) errors.push('Add at least one question.');
      questions.forEach((question, index) => {
        const questionOptions = strItems(question.options).filter((o) => o.trim());
        if (!strField(question.question).trim()) {
          errors.push(`Question ${index + 1}: text is required.`);
        }
        if (questionOptions.length < 2) {
          errors.push(`Question ${index + 1}: at least 2 options are required.`);
        }
      });
      break;
    }
    case 'best_reply': {
      const steps = objList(content.steps);
      if (steps.length === 0) errors.push('Add at least one step.');
      steps.forEach((step, index) => {
        if (!strField(step.reply).trim()) {
          errors.push(`Step ${index + 1}: the reply line is required.`);
        }
        const stepOptions = strItems(step.options).filter((o) => o.trim());
        if (stepOptions.length < 2) {
          errors.push(`Step ${index + 1}: at least 2 options are required.`);
        }
      });
      break;
    }
    default:
      break;
  }

  return errors;
}