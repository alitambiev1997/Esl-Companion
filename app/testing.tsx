import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ExerciseRendererProps } from '@/src/features/lesson/content';
import { FillBlankRenderer } from '@/src/features/lesson/renderers/fill-blank';
import { ListeningDictationRenderer } from '@/src/features/lesson/renderers/listening-dictation';
import { ListeningMultipleChoiceRenderer } from '@/src/features/lesson/renderers/listening-multiple-choice';
import { MatchingRenderer } from '@/src/features/lesson/renderers/matching';
import { MultipleChoiceRenderer } from '@/src/features/lesson/renderers/multiple-choice';
import { SpeakingRecordingRenderer } from '@/src/features/lesson/renderers/speaking-recording';
import { WordOrderRenderer } from '@/src/features/lesson/renderers/word-order';
import {
  buildSample,
  contentShapes,
  exerciseMeta,
  samplesByType,
} from '@/src/dev/sampleExercises';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { ExerciseType } from '@/src/types/content';

const GROUPS: { title: string; types: ExerciseType[] }[] = [
  { title: 'Choice', types: ['multiple_choice', 'listening_multiple_choice'] },
  { title: 'Production', types: ['fill_blank', 'word_order', 'matching', 'listening_dictation'] },
  { title: 'Communication', types: ['speaking_recording'] },
  { title: 'Other', types: ['reading_comprehension', 'flashcard'] },
];

function renderSandboxRenderer(type: ExerciseType, props: ExerciseRendererProps) {
  switch (type) {
    case 'multiple_choice':
      return <MultipleChoiceRenderer {...props} />;
    case 'fill_blank':
      return <FillBlankRenderer {...props} />;
    case 'word_order':
      return <WordOrderRenderer {...props} />;
    case 'matching':
      return <MatchingRenderer {...props} />;
    case 'listening_multiple_choice':
      return <ListeningMultipleChoiceRenderer {...props} />;
    case 'listening_dictation':
      return <ListeningDictationRenderer {...props} />;
    case 'speaking_recording':
      return <SpeakingRecordingRenderer {...props} />;
    default:
      return null;
  }
}

function SandboxExercise({ type, index }: { type: ExerciseType; index: number }) {
  const [run, setRun] = useState(0);
  const [checked, setChecked] = useState(false);

  const samples = samplesByType[type];
  const exercise = buildSample(type, samples[index], index);

  const onCheck = (userAnswer: Record<string, unknown>, isCorrect: boolean) => {
    console.log('[sandbox]', type, JSON.stringify(userAnswer), 'correct:', isCorrect);
    setChecked(true);
  };

  const onContinue = () => {
    setRun((n) => n + 1);
    setChecked(false);
  };

  const props: ExerciseRendererProps = {
    exercise,
    checked,
    busy: false,
    isLast: false,
    onCheck,
    onContinue,
  };

  return <View key={`${index}-${run}`}>{renderSandboxRenderer(type, props)}</View>;
}

export default function Testing() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Exercise catalog</Text>
      <Text style={styles.subtitle}>Dev-only sandbox. Answers are logged, nothing is saved.</Text>

      {GROUPS.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>

          {group.types.map((type) => (
            <View key={type} style={styles.typeCard}>
              <Text style={styles.typeName}>{type}</Text>
              <Text style={styles.typeDescription}>{exerciseMeta[type]}</Text>

              {samplesByType[type].length === 0 ? (
                <Text style={styles.noRenderer}>no renderer yet</Text>
              ) : (
                <>
                  <Text style={styles.shapeTitle}>content JSON shape</Text>
                  <Text style={styles.shape}>{contentShapes[type]}</Text>
                  <Text style={styles.shapeTitle}>samples</Text>
                  {samplesByType[type].map((_, i) => (
                    <View key={i} style={styles.sample}>
                      <SandboxExercise type={type} index={i} />
                    </View>
                  ))}
                </>
              )}
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    marginBottom: 24,
  },
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 12,
  },
  typeCard: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 12,
  },
  typeName: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
  },
  typeDescription: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 4,
    marginBottom: 12,
  },
  shapeTitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
    opacity: 0.7,
    marginTop: 8,
    marginBottom: 4,
  },
  shape: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: colors.ink,
    opacity: 0.8,
    backgroundColor: colors.paper,
    borderRadius: radius.bubble,
    padding: 8,
  },
  noRenderer: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.coral,
  },
  sample: {
    marginTop: 12,
  },
});