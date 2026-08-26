import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TopBar } from '@/src/components/ui/TopBar';
import { BottomBar } from '@/src/components/ui/bottom-bar';
import { FeedbackBanner } from '@/src/components/ui/feedback-banner';
import { Toast } from '@/src/components/ui/toast';
import { TopBar as GameTopBar } from '@/src/components/ui/top-bar';
import { renderSandboxRenderer } from '@/src/dev/sandboxRenderer';
import { buildSample, contentShapes, exerciseMeta, samplesByType } from '@/src/dev/sampleExercises';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  FeedbackBannerInfo,
} from '@/src/features/lesson/content';
import { PrimaryButton } from '@/src/features/lesson/flow-buttons';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { ExerciseType } from '@/src/types/content';

export default function TestingDetail() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();
  const exerciseType = type as ExerciseType;
  const samples = samplesByType[exerciseType] ?? [];
  const rendererRef = useRef<ExerciseRendererHandle>(null);
  const [index, setIndex] = useState(0);
  const [checked, setChecked] = useState(false);
  const [run, setRun] = useState(0);
  const [showJson, setShowJson] = useState(false);
  const [canCheck, setCanCheck] = useState(false);
  const [banner, setBanner] = useState<FeedbackBannerInfo | null>(null);
  const [pairsLeft, setPairsLeft] = useState(0);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  const advance = () => {
    if (index < samples.length - 1) {
      setIndex((n) => n + 1);
      setChecked(false);
      setBanner(null);
      setCanCheck(false);
      setPairsLeft(0);
      setRun((n) => n + 1);
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/testing');
    }
  };

  if (samples.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: exerciseType }} />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.typeName}>{exerciseType}</Text>
          <Text style={styles.typeDescription}>{exerciseMeta[exerciseType]}</Text>
          <Text style={styles.shapeTitle}>content JSON shape</Text>
          <Text style={styles.shape}>{contentShapes[exerciseType]}</Text>
          <Text style={styles.noRenderer}>no renderer yet</Text>
        </ScrollView>
      </View>
    );
  }

  const exercise = buildSample(exerciseType, samples[index], index);

  const props: ExerciseRendererProps = {
    exercise,
    checked,
    busy: false,
    isLast: index === samples.length - 1,
    onCheck: (userAnswer, isCorrect, info) => {
      console.log('[sandbox]', exerciseType, JSON.stringify(userAnswer), 'correct:', isCorrect);
      setBanner(info);
      setChecked(true);
    },
    onCanCheckChange: setCanCheck,
    onProgressChange: setPairsLeft,
    onHint: setHintMessage,
    onContinue: advance,
    onUngradedContinue: () => {
      console.log('[sandbox]', exerciseType, 'ungraded continue');
      advance();
    },
    continueLabel: index === samples.length - 1 ? 'Back to testing' : undefined,
  };

  return (
    <View style={styles.container}>
      <TopBar title={exerciseType} showBack />
      <GameTopBar progress={(index + 1) / samples.length} onClose={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{exerciseType}</Text>

        {exerciseType !== 'fill_blank' && exerciseType !== 'listening_word_order' && exerciseType !== 'image_choice' && (
          <Text style={styles.prompt}>{exercise.prompt}</Text>
        )}

        <View key={`${exerciseType}-${index}-${run}`}>
          {renderSandboxRenderer(exerciseType, props, rendererRef)}
        </View>

        <Pressable style={styles.jsonToggle} onPress={() => setShowJson((v) => !v)}>
          <Text style={styles.jsonToggleText}>{showJson ? 'hide content JSON' : 'show content JSON'}</Text>
        </Pressable>
        {showJson && (
          <Text style={styles.shape}>{JSON.stringify(exercise.content, null, 2)}</Text>
        )}
      </ScrollView>
      {checked && banner ? (
        <FeedbackBanner
          correct={banner.correct}
          title={banner.title ?? undefined}
          explanation={banner.explanation}
          correctAnswer={banner.correctAnswer}
          chips={banner.chips ?? undefined}
          tip={banner.tip ?? undefined}
          continueLabel={index === samples.length - 1 ? 'Back to testing' : undefined}
          onContinue={advance}
        />
      ) : exerciseType === 'matching' ? (
        <BottomBar>
          <Text style={styles.pairsLeft}>Pairs left: {pairsLeft}</Text>
        </BottomBar>
      ) : exerciseType === 'speaking_recording' || exerciseType === 'flashcard_flip' ? (
        <BottomBar>
          <PrimaryButton
            label={exerciseType === 'flashcard_flip' ? 'Got it' : 'I said it out loud'}
            onPress={advance}
          />
        </BottomBar>
      ) : ['matching', 'error_spot', 'stress_tap', 'silent_letter', 'image_choice', 'best_reply'].includes(exerciseType) ? (
        null
      ) : (
        <BottomBar>
          <PrimaryButton
            label="Check"
            onPress={() => rendererRef.current?.check()}
            disabled={!canCheck}
          />
        </BottomBar>
      )}
      <Toast message={hintMessage} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    padding: 24,
    paddingBottom: 160,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    marginBottom: 16,
  },
  typeName: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink,
    marginBottom: 4,
  },
  typeDescription: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    marginBottom: 12,
  },
  prompt: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 16,
  },
  jsonToggle: {
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  jsonToggleText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.sky,
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
    marginTop: 4,
  },
  noRenderer: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.coral,
    marginTop: 12,
  },
  pairsLeft: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    textAlign: 'center',
  },
});