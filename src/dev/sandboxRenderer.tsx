import type { Ref } from 'react';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
} from '@/src/features/lesson/content';
import { ContextFillRenderer } from '@/src/features/lesson/renderers/context-fill';
import { FillBlankRenderer } from '@/src/features/lesson/renderers/fill-blank';
import { InlineChoiceRenderer } from '@/src/features/lesson/renderers/inline-choice';
import { ListeningDictationRenderer } from '@/src/features/lesson/renderers/listening-dictation';
import { ListeningMultipleChoiceRenderer } from '@/src/features/lesson/renderers/listening-multiple-choice';
import { MatchingRenderer } from '@/src/features/lesson/renderers/matching';
import { MultipleChoiceRenderer } from '@/src/features/lesson/renderers/multiple-choice';
import { ReadingComprehensionRenderer } from '@/src/features/lesson/renderers/reading-comprehension';
import { SpeakingRecordingRenderer } from '@/src/features/lesson/renderers/speaking-recording';
import { WordOrderRenderer } from '@/src/features/lesson/renderers/word-order';
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
    case 'reading_comprehension':
      return <ReadingComprehensionRenderer ref={ref} {...props} />;
    case 'speaking_recording':
      return <SpeakingRecordingRenderer {...props} />;
    default:
      return null;
  }
}