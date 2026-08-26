import type { Ref } from 'react';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
} from '@/src/features/lesson/content';
import { ContextFillRenderer } from '@/src/features/lesson/renderers/context-fill';
import { ErrorSpotRenderer } from '@/src/features/lesson/renderers/error-spot';
import { FillBlankRenderer } from '@/src/features/lesson/renderers/fill-blank';
import { FlashcardFlipRenderer } from '@/src/features/lesson/renderers/flashcard-flip';
import { FormFillRenderer } from '@/src/features/lesson/renderers/form-fill';
import { InlineChoiceRenderer } from '@/src/features/lesson/renderers/inline-choice';
import { ListeningDictationRenderer } from '@/src/features/lesson/renderers/listening-dictation';
import { ListeningMultipleChoiceRenderer } from '@/src/features/lesson/renderers/listening-multiple-choice';
import { ListeningWordOrderRenderer } from '@/src/features/lesson/renderers/listening-word-order';
import { MatchingRenderer } from '@/src/features/lesson/renderers/matching';
import { MultipleChoiceRenderer } from '@/src/features/lesson/renderers/multiple-choice';
import { ReadingComprehensionRenderer } from '@/src/features/lesson/renderers/reading-comprehension';
import { SentenceOrderRenderer } from '@/src/features/lesson/renderers/sentence-order';
import { SilentLetterRenderer } from '@/src/features/lesson/renderers/silent-letter';
import { SpeakingRecordingRenderer } from '@/src/features/lesson/renderers/speaking-recording';
import { StressTapRenderer } from '@/src/features/lesson/renderers/stress-tap';
import { WordOrderRenderer } from '@/src/features/lesson/renderers/word-order';
import { WordSortRenderer } from '@/src/features/lesson/renderers/word-sort';
import type { ExerciseType } from '@/src/types/content';

export function renderSandboxRenderer(
  type: ExerciseType,
  props: ExerciseRendererProps,
  ref?: Ref<ExerciseRendererHandle>
) {
  switch (type) {
    case 'multiple_choice':
      return <MultipleChoiceRenderer ref={ref} {...props} />;
    case 'inline_choice':
      return <InlineChoiceRenderer ref={ref} {...props} />;
    case 'context_fill':
      return <ContextFillRenderer ref={ref} {...props} />;
    case 'error_spot':
      return <ErrorSpotRenderer ref={ref} {...props} />;
    case 'stress_tap':
      return <StressTapRenderer ref={ref} {...props} />;
    case 'silent_letter':
      return <SilentLetterRenderer ref={ref} {...props} />;
    case 'word_sort':
      return <WordSortRenderer ref={ref} {...props} />;
    case 'form_fill':
      return <FormFillRenderer ref={ref} {...props} />;
    case 'fill_blank':
      return <FillBlankRenderer ref={ref} {...props} />;
    case 'word_order':
      return <WordOrderRenderer ref={ref} {...props} />;
    case 'matching':
      return <MatchingRenderer ref={ref} {...props} />;
    case 'listening_multiple_choice':
      return <ListeningMultipleChoiceRenderer ref={ref} {...props} />;
    case 'listening_dictation':
      return <ListeningDictationRenderer ref={ref} {...props} />;
    case 'listening_word_order':
      return <ListeningWordOrderRenderer ref={ref} {...props} />;
    case 'sentence_order':
      return <SentenceOrderRenderer ref={ref} {...props} />;
    case 'reading_comprehension':
      return <ReadingComprehensionRenderer ref={ref} {...props} />;
    case 'speaking_recording':
      return <SpeakingRecordingRenderer {...props} />;
    case 'flashcard_flip':
      return <FlashcardFlipRenderer {...props} />;
    default:
      return null;
  }
}