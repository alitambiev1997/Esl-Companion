import { StyleSheet, Text, View } from 'react-native';
import { FillBlankRenderer } from '@/src/features/lesson/renderers/fill-blank';
import { ImageChoiceRenderer } from '@/src/features/lesson/renderers/image-choice';
import { MultipleChoiceRenderer } from '@/src/features/lesson/renderers/multiple-choice';
import { WordOrderRenderer } from '@/src/features/lesson/renderers/word-order';
import type { ExerciseRendererProps } from '@/src/features/lesson/content';
import type { Exercise } from '@/src/types/content';
import { colors, fonts } from '@/src/theme/tokens';

const noop = () => {};

export function ExercisePreview({ exercise }: { exercise: Exercise }) {
  const props: ExerciseRendererProps = {
    exercise,
    checked: false,
    busy: false,
    isLast: false,
    onCheck: noop,
    onCanCheckChange: noop,
    onContinue: noop,
    onUngradedContinue: noop,
  };

  const content = (exercise.content ?? {}) as Record<string, unknown>;
  const options = Array.isArray(content.options) ? content.options : [];
  const sequence = Array.isArray(content.correct_sequence) ? content.correct_sequence : [];
  const previewKey = `${exercise.type}:${options.length}:${sequence.length}`;
  const hidesPrompt = exercise.type === 'fill_blank' || exercise.type === 'image_choice';

  return (
    <View style={styles.wrap}>
      {!hidesPrompt && exercise.prompt.trim() ? (
        <Text style={styles.prompt}>{exercise.prompt}</Text>
      ) : null}

      {exercise.type === 'multiple_choice' && (
        <MultipleChoiceRenderer key={previewKey} {...props} />
      )}
      {exercise.type === 'fill_blank' && <FillBlankRenderer key={previewKey} {...props} />}
      {exercise.type === 'word_order' && <WordOrderRenderer key={previewKey} {...props} />}
      {exercise.type === 'image_choice' && <ImageChoiceRenderer key={previewKey} {...props} />}
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
});