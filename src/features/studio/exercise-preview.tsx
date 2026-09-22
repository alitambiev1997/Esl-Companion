import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FeedbackBanner } from '@/src/components/ui/feedback-banner';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  FeedbackBannerInfo,
} from '@/src/features/lesson/content';
import { BestReplyRenderer } from '@/src/features/lesson/renderers/best-reply';
import { ContextFillRenderer } from '@/src/features/lesson/renderers/context-fill';
import { DocumentReaderRenderer } from '@/src/features/lesson/renderers/document-reader';
import { ErrorSpotRenderer } from '@/src/features/lesson/renderers/error-spot';
import { FillBlankRenderer } from '@/src/features/lesson/renderers/fill-blank';
import { FlashcardFlipRenderer } from '@/src/features/lesson/renderers/flashcard-flip';
import { FormFillRenderer } from '@/src/features/lesson/renderers/form-fill';
import { ImageChoiceRenderer } from '@/src/features/lesson/renderers/image-choice';
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
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Exercise } from '@/src/types/content';

const noop = () => {};

const TAP_GRADED = [
  'image_choice',
  'matching',
  'error_spot',
  'stress_tap',
  'silent_letter',
  'best_reply',
];

const UNGRADED = ['speaking_recording', 'flashcard_flip'];

const HIDES_PROMPT = ['fill_blank', 'listening_word_order', 'image_choice'];

export function ExercisePreview({ exercise }: { exercise: Exercise }) {
  const rendererRef = useRef<ExerciseRendererHandle>(null);
  const [checked, setChecked] = useState(false);
  const [canCheck, setCanCheck] = useState(false);
  const [banner, setBanner] = useState<FeedbackBannerInfo | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const props: ExerciseRendererProps = {
    exercise,
    checked,
    busy: false,
    isLast: false,
    onCheck: (_answer, _isCorrect, info) => {
      setBanner(info);
      setChecked(true);
    },
    onCanCheckChange: setCanCheck,
    onContinue: noop,
    onUngradedContinue: noop,
  };

  const reset = () => {
    setResetKey((key) => key + 1);
    setChecked(false);
    setCanCheck(false);
    setBanner(null);
  };

  const tapGraded = TAP_GRADED.includes(exercise.type);
  const ungraded = UNGRADED.includes(exercise.type);
  const hidesPrompt = HIDES_PROMPT.includes(exercise.type);

  const renderer = () => {
    switch (exercise.type) {
      case 'multiple_choice':
        return <MultipleChoiceRenderer key={resetKey} ref={rendererRef} {...props} />;
      case 'fill_blank':
        return <FillBlankRenderer key={resetKey} ref={rendererRef} {...props} />;
      case 'word_order':
        return <WordOrderRenderer key={resetKey} ref={rendererRef} {...props} />;
      case 'image_choice':
        return <ImageChoiceRenderer key={resetKey} ref={rendererRef} {...props} />;
      case 'inline_choice':
        return <InlineChoiceRenderer key={resetKey} ref={rendererRef} {...props} />;
      case 'context_fill':
        return <ContextFillRenderer key={resetKey} ref={rendererRef} {...props} />;
      case 'listening_multiple_choice':
        return <ListeningMultipleChoiceRenderer key={resetKey} ref={rendererRef} {...props} />;
      case 'listening_dictation':
        return <ListeningDictationRenderer key={resetKey} ref={rendererRef} {...props} />;
      case 'listening_word_order':
        return <ListeningWordOrderRenderer key={resetKey} ref={rendererRef} {...props} />;
      case 'sentence_order':
        return <SentenceOrderRenderer key={resetKey} ref={rendererRef} {...props} />;
      case 'reading_comprehension':
        return <ReadingComprehensionRenderer key={resetKey} ref={rendererRef} {...props} />;
      case 'speaking_recording':
        return <SpeakingRecordingRenderer key={resetKey} {...props} />;
      case 'flashcard_flip':
        return <FlashcardFlipRenderer key={resetKey} {...props} />;
      case 'error_spot':
        return <ErrorSpotRenderer key={resetKey} ref={rendererRef} {...props} />;
      case 'stress_tap':
        return <StressTapRenderer key={resetKey} ref={rendererRef} {...props} />;
      case 'silent_letter':
        return <SilentLetterRenderer key={resetKey} ref={rendererRef} {...props} />;
      case 'matching':
        return <MatchingRenderer key={resetKey} ref={rendererRef} {...props} />;
      case 'word_sort':
        return <WordSortRenderer key={resetKey} ref={rendererRef} {...props} />;
      case 'form_fill':
        return <FormFillRenderer key={resetKey} ref={rendererRef} {...props} />;
      case 'document_reader':
        return <DocumentReaderRenderer key={resetKey} ref={rendererRef} {...props} />;
      case 'best_reply':
        return <BestReplyRenderer key={resetKey} ref={rendererRef} {...props} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.wrap}>
      {!hidesPrompt && exercise.prompt.trim() ? (
        <Text style={styles.prompt}>{exercise.prompt}</Text>
      ) : null}

      {renderer()}

      {banner ? (
        <FeedbackBanner
          correct={banner.correct}
          title={banner.title ?? undefined}
          explanation={banner.explanation}
          correctAnswer={banner.correctAnswer}
          chips={banner.chips ?? undefined}
          tip={banner.tip ?? undefined}
          continueLabel="Try again"
          onContinue={reset}
          inline
        />
      ) : ungraded ? (
        <Text style={styles.note}>Practice only - nothing to check.</Text>
      ) : !tapGraded ? (
        <Pressable
          style={[styles.checkButton, !canCheck && styles.checkDisabled]}
          onPress={() => rendererRef.current?.check()}
          disabled={!canCheck}
        >
          <Text style={styles.checkText}>Check</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  prompt: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
  },
  checkButton: {
    backgroundColor: colors.sun,
    borderRadius: radius.button,
    paddingVertical: 12,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDisabled: {
    opacity: 0.5,
  },
  checkText: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
  },
});