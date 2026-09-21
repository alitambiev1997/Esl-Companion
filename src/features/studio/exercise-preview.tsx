import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FeedbackBanner } from '@/src/components/ui/feedback-banner';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  FeedbackBannerInfo,
} from '@/src/features/lesson/content';
import { FillBlankRenderer } from '@/src/features/lesson/renderers/fill-blank';
import { ImageChoiceRenderer } from '@/src/features/lesson/renderers/image-choice';
import { MultipleChoiceRenderer } from '@/src/features/lesson/renderers/multiple-choice';
import { WordOrderRenderer } from '@/src/features/lesson/renderers/word-order';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Exercise } from '@/src/types/content';

const noop = () => {};

const TAP_GRADED = ['image_choice'];

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
  const hidesPrompt = exercise.type === 'fill_blank' || exercise.type === 'image_choice';

  return (
    <View style={styles.wrap}>
      {!hidesPrompt && exercise.prompt.trim() ? (
        <Text style={styles.prompt}>{exercise.prompt}</Text>
      ) : null}

      {exercise.type === 'multiple_choice' && (
        <MultipleChoiceRenderer key={resetKey} ref={rendererRef} {...props} />
      )}
      {exercise.type === 'fill_blank' && (
        <FillBlankRenderer key={resetKey} ref={rendererRef} {...props} />
      )}
      {exercise.type === 'word_order' && (
        <WordOrderRenderer key={resetKey} ref={rendererRef} {...props} />
      )}
      {exercise.type === 'image_choice' && (
        <ImageChoiceRenderer key={resetKey} ref={rendererRef} {...props} />
      )}

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
        />
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
});