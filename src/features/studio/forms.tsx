import type { Content } from '@/src/features/studio/content-model';
import {
  ContextFillForm,
  ErrorSpotForm,
  ImageChoiceForm,
  InlineChoiceForm,
  ListeningMultipleChoiceForm,
  MultipleChoiceForm,
  ReadingComprehensionForm,
  SilentLetterForm,
  StressTapForm,
} from '@/src/features/studio/forms-options';
import {
  FillBlankForm,
  ListeningDictationForm,
  ListeningWordOrderForm,
  SentenceOrderForm,
  WordOrderForm,
} from '@/src/features/studio/forms-lists';
import { FlashcardForm, SpeakingForm } from '@/src/features/studio/forms-simple';
import {
  BestReplyForm,
  DocumentReaderForm,
  FormFillForm,
  MatchingForm,
  WordSortForm,
} from '@/src/features/studio/forms-composite';
import type { ExerciseType } from '@/src/types/content';

export function TypeForm({
  type,
  content,
  patch,
}: {
  type: ExerciseType;
  content: Content;
  patch: (next: Content) => void;
}) {
  switch (type) {
    case 'multiple_choice':
      return <MultipleChoiceForm content={content} patch={patch} />;
    case 'inline_choice':
      return <InlineChoiceForm content={content} patch={patch} />;
    case 'context_fill':
      return <ContextFillForm content={content} patch={patch} />;
    case 'listening_multiple_choice':
      return <ListeningMultipleChoiceForm content={content} patch={patch} />;
    case 'reading_comprehension':
      return <ReadingComprehensionForm content={content} patch={patch} />;
    case 'image_choice':
      return <ImageChoiceForm content={content} patch={patch} />;
    case 'error_spot':
      return <ErrorSpotForm content={content} patch={patch} />;
    case 'stress_tap':
      return <StressTapForm content={content} patch={patch} />;
    case 'silent_letter':
      return <SilentLetterForm content={content} patch={patch} />;
    case 'fill_blank':
      return <FillBlankForm content={content} patch={patch} />;
    case 'word_order':
      return <WordOrderForm content={content} patch={patch} />;
    case 'sentence_order':
      return <SentenceOrderForm content={content} patch={patch} />;
    case 'listening_word_order':
      return <ListeningWordOrderForm content={content} patch={patch} />;
    case 'listening_dictation':
      return <ListeningDictationForm content={content} patch={patch} />;
    case 'speaking_recording':
      return <SpeakingForm content={content} patch={patch} />;
    case 'flashcard_flip':
      return <FlashcardForm content={content} patch={patch} />;
    case 'matching':
      return <MatchingForm content={content} patch={patch} />;
    case 'word_sort':
      return <WordSortForm content={content} patch={patch} />;
    case 'form_fill':
      return <FormFillForm content={content} patch={patch} />;
    case 'document_reader':
      return <DocumentReaderForm content={content} patch={patch} />;
    case 'best_reply':
      return <BestReplyForm content={content} patch={patch} />;
    default:
      return null;
  }
}