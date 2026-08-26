import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '@/src/features/auth/useAuth';
import { MascotBadge } from '@/components/mascot-badge';
import { BottomBar } from '@/src/components/ui/bottom-bar';
import { FeedbackBanner } from '@/src/components/ui/feedback-banner';
import { TopBar } from '@/src/components/ui/top-bar';
import { addDailyActivity } from '@/src/lib/activity';
import { PrimaryButton } from '@/src/features/lesson/flow-buttons';
import { Confetti, MedalStamp } from '@/src/features/lesson/celebration';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  FeedbackBannerInfo,
} from '@/src/features/lesson/content';
import { medalColor, medalForScore, type Medal } from '@/src/lib/medals';
import { ContextFillRenderer } from '@/src/features/lesson/renderers/context-fill';
import { FillBlankRenderer } from '@/src/features/lesson/renderers/fill-blank';
import { InlineChoiceRenderer } from '@/src/features/lesson/renderers/inline-choice';
import { ListeningDictationRenderer } from '@/src/features/lesson/renderers/listening-dictation';
import { ListeningMultipleChoiceRenderer } from '@/src/features/lesson/renderers/listening-multiple-choice';
import { MatchingRenderer } from '@/src/features/lesson/renderers/matching';
import { SpeakingRecordingRenderer } from '@/src/features/lesson/renderers/speaking-recording';
import { MultipleChoiceRenderer } from '@/src/features/lesson/renderers/multiple-choice';
import { ReadingComprehensionRenderer } from '@/src/features/lesson/renderers/reading-comprehension';
import { WordOrderRenderer } from '@/src/features/lesson/renderers/word-order';
import { supabase } from '@/src/lib/supabase';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Exercise, Lesson } from '@/src/types/content';

interface Result {
  score: number;
  passed: boolean;
  medal: Medal | null;
}

type Phase = 'answering' | 'checked';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; lesson: Lesson; exercises: Exercise[] };

export default function LessonPlayer() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [retry, setRetry] = useState(0);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('answering');
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptError, setAttemptError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [containerLayout, setContainerLayout] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [blockLayout, setBlockLayout] = useState<{ y: number; height: number } | null>(null);
  const [stampLayout, setStampLayout] = useState<{ y: number; height: number } | null>(null);
  const rendererRef = useRef<ExerciseRendererHandle>(null);
  const [canCheck, setCanCheck] = useState(false);
  const [banner, setBanner] = useState<FeedbackBannerInfo | null>(null);
  const [pairsLeft, setPairsLeft] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    let mounted = true;
    setLoadState({ status: 'loading' });

    (async () => {
      const [lessonRes, exercisesRes] = await Promise.all([
        supabase
          .from('lessons')
          .select('id,title,pass_score,estimated_minutes')
          .eq('id', id)
          .maybeSingle(),
        supabase
          .from('exercises')
          .select('*')
          .eq('lesson_id', id)
          .order('sort_order'),
      ]);

      if (!mounted) return;

      if (lessonRes.error || exercisesRes.error) {
        setLoadState({
          status: 'error',
          message:
            lessonRes.error?.message ??
            exercisesRes.error?.message ??
            'Failed to load lesson',
        });
        return;
      }

      if (!lessonRes.data) {
        setLoadState({ status: 'error', message: 'Lesson not found.' });
        return;
      }

      setLoadState({
        status: 'ready',
        lesson: lessonRes.data as Lesson,
        exercises: (exercisesRes.data as Exercise[]) ?? [],
      });
    })();

    return () => {
      mounted = false;
    };
  }, [authLoading, user, id, router, retry]);

  const handleCheck = async (
    exercise: Exercise,
    userAnswer: Record<string, unknown>,
    isCorrect: boolean,
    info: FeedbackBannerInfo
  ) => {
    if (!user) return;

    setBusy(true);
    setAttemptError(null);

    try {
      const { error } = await supabase.from('exercise_attempts').insert({
        user_id: user.id,
        lesson_id: exercise.lesson_id,
        exercise_id: exercise.id,
        user_answer: userAnswer,
        is_correct: isCorrect,
      });

      if (error) {
        setAttemptError(error.message);
        return;
      }

      if (isCorrect && exercise.is_required !== false) {
        setCorrectCount((n) => n + 1);
      }
      setBanner(info);
      setPhase('checked');
    } catch (error) {
      setAttemptError(error instanceof Error ? error.message : 'Failed to save answer');
    } finally {
      setBusy(false);
    }
  };

  const handleUngradedContinue = async (exercise: Exercise) => {
    if (!user) return;

    setBusy(true);
    setAttemptError(null);

    try {
      const { error } = await supabase.from('exercise_attempts').insert({
        user_id: user.id,
        lesson_id: exercise.lesson_id,
        exercise_id: exercise.id,
        user_answer: {},
        is_correct: true,
      });

      if (error) {
        setAttemptError(error.message);
        return;
      }

      await handleContinue();
    } catch (error) {
      setAttemptError(error instanceof Error ? error.message : 'Failed to save answer');
    } finally {
      setBusy(false);
    }
  };

  const handleContinue = async () => {
    if (loadState.status !== 'ready') return;

    const next = index + 1;

    if (next < loadState.exercises.length) {
      setIndex(next);
      setPhase('answering');
      setAttemptError(null);
      setBanner(null);
      setCanCheck(false);
      setPairsLeft(0);
      return;
    }

    await finishLesson(loadState.exercises);
  };

  const finishLesson = async (exercises: Exercise[]) => {
    if (!user || loadState.status !== 'ready') return;

    const passScore = loadState.lesson.pass_score ?? 60;
    const total = exercises.filter((e) => e.is_required !== false).length;
    const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);
    const passed = score >= passScore;
    const medal = medalForScore(score);

    setBusy(true);
    setSaveError(null);

    try {
      const { data: existing } = await supabase
        .from('lesson_progress')
        .select('score,completed_at')
        .eq('user_id', user.id)
        .eq('lesson_id', id)
        .maybeSingle();

      const bestScore = Math.max(existing?.score ?? 0, score);
      const status = bestScore >= passScore ? 'completed' : 'attempted';
      const completedAt =
        existing?.completed_at ?? (status === 'completed' ? new Date().toISOString() : null);

      const { error } = await supabase.from('lesson_progress').upsert(
        {
          user_id: user.id,
          lesson_id: id,
          score: bestScore,
          status,
          completed_at: completedAt,
        },
        { onConflict: 'user_id,lesson_id' }
      );

      if (error) {
        setSaveError(error.message);
        return;
      }

      if (passed) {
        try {
          await addDailyActivity(user.id, {
            lessonsCompleted: 1,
            minutesPracticed: loadState.lesson.estimated_minutes ?? 0,
          });
        } catch {
          // no-op
        }
      }

      setResult({ score, passed, medal });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to finish lesson');
    } finally {
      setBusy(false);
    }
  };

  if (authLoading || loadState.status === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.sky} />
      </View>
    );
  }

  if (loadState.status === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{loadState.message}</Text>
        <Pressable style={styles.buttonSecondary} onPress={() => setRetry((n) => n + 1)}>
          <Text style={styles.buttonSecondaryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (result) {
    const passScore = loadState.status === 'ready' ? (loadState.lesson.pass_score ?? 60) : 60;
    const origin =
      containerLayout && blockLayout && stampLayout
        ? {
            x: containerLayout.width / 2,
            y: blockLayout.y + stampLayout.y + stampLayout.height / 2,
          }
        : null;

    const onTryAgain = () => {
      setIndex(0);
      setPhase('answering');
      setCorrectCount(0);
      setResult(null);
      setAttemptError(null);
    };

    return (
      <View
        style={styles.resultContainer}
        onLayout={(e) => setContainerLayout(e.nativeEvent.layout)}
      >
        <Stack.Screen
          options={{
            title: loadState.status === 'ready' ? loadState.lesson.title : 'Lesson',
          }}
        />
        {result.passed && result.medal ? (
          <>
            <Confetti origin={origin} />
            <View style={styles.mascotCorner} pointerEvents="none">
              <MascotBadge size={56} />
            </View>
            <View
              style={styles.ceremonyBlock}
              onLayout={(e) => setBlockLayout(e.nativeEvent.layout)}
            >
              <Text style={styles.celebrationTitle}>Lesson complete!</Text>
              <View onLayout={(e) => setStampLayout(e.nativeEvent.layout)}>
                <MedalStamp medal={result.medal} />
              </View>
            </View>
            <Text style={styles.scoreText}>Score: {result.score}%</Text>
            <Text style={[styles.medalName, { color: medalColor(result.medal) ?? colors.sky }]}>
              {result.medal.charAt(0).toUpperCase() + result.medal.slice(1)}
            </Text>
            <Pressable
              style={styles.buttonPrimary}
              onPress={() => (from === 'course' ? router.back() : router.replace('/course'))}
            >
              <Text style={styles.buttonPrimaryText}>Continue</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.encouragementText}>
              Not yet - you need {passScore}%.
              {'\n'}Try again!
            </Text>
            <Text style={styles.scoreText}>Score: {result.score}%</Text>
            <Pressable style={styles.buttonPrimary} onPress={onTryAgain}>
              <Text style={styles.buttonPrimaryText}>Try again</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  const { lesson, exercises } = loadState;
  const exercise = exercises[index];
  const isPlaceholder =
    exercise &&
    !['multiple_choice', 'inline_choice', 'context_fill', 'fill_blank', 'word_order', 'matching', 'listening_multiple_choice', 'listening_dictation', 'reading_comprehension', 'speaking_recording'].includes(
      exercise.type
    );
  const isUngraded = exercise?.type === 'speaking_recording';
  const isMatching = exercise?.type === 'matching';

  const rendererProps = (current: Exercise): ExerciseRendererProps => ({
    exercise: current,
    checked: phase === 'checked',
    busy,
    isLast: index === exercises.length - 1,
    onCheck: (userAnswer, isCorrect, info) => handleCheck(current, userAnswer, isCorrect, info),
    onCanCheckChange: setCanCheck,
    onProgressChange: setPairsLeft,
    onContinue: handleContinue,
    onUngradedContinue: handleUngradedContinue,
  });

  const bottomArea = () => {
    if (isPlaceholder || isUngraded) {
      return (
        <BottomBar>
          <PrimaryButton
            label={isUngraded ? 'I said it out loud' : index === exercises.length - 1 ? 'Finish' : 'Continue'}
            onPress={() => (isUngraded ? handleUngradedContinue(exercise) : handleContinue())}
            disabled={busy}
          />
        </BottomBar>
      );
    }
    if (isMatching) {
      if (phase === 'checked' && banner) {
        return (
          <FeedbackBanner
            correct={banner.correct}
            title={banner.title ?? undefined}
            explanation={banner.explanation}
            correctAnswer={banner.correctAnswer}
            onContinue={handleContinue}
          />
        );
      }
      return (
        <BottomBar>
          <Text style={styles.pairsLeft}>Pairs left: {pairsLeft}</Text>
        </BottomBar>
      );
    }
    if (phase === 'checked' && banner) {
      return (
        <FeedbackBanner
          correct={banner.correct}
          title={banner.title ?? undefined}
          explanation={banner.explanation}
          correctAnswer={banner.correctAnswer}
          chips={banner.chips ?? undefined}
          onContinue={handleContinue}
        />
      );
    }
    return (
      <BottomBar>
        <PrimaryButton
          label="Check"
          onPress={() => rendererRef.current?.check()}
          disabled={!canCheck || busy}
        />
      </BottomBar>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: lesson.title }} />
      <TopBar
        progress={exercises.length === 0 ? 0 : (index + 1) / exercises.length}
        onClose={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{lesson.title}</Text>

        {exercises.length === 0 && (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>No exercises in this lesson yet.</Text>
          </View>
        )}

        {exercise && (
          <>
            {exercise.type !== 'fill_blank' && (
              <Text style={styles.prompt}>{exercise.prompt}</Text>
            )}

            {exercise.type === 'multiple_choice' && (
              <MultipleChoiceRenderer key={exercise.id} ref={rendererRef} {...rendererProps(exercise)} />
            )}
            {exercise.type === 'inline_choice' && (
              <InlineChoiceRenderer key={exercise.id} ref={rendererRef} {...rendererProps(exercise)} />
            )}
            {exercise.type === 'context_fill' && (
              <ContextFillRenderer key={exercise.id} ref={rendererRef} {...rendererProps(exercise)} />
            )}
            {exercise.type === 'fill_blank' && (
              <FillBlankRenderer key={exercise.id} ref={rendererRef} {...rendererProps(exercise)} />
            )}
            {exercise.type === 'word_order' && (
              <WordOrderRenderer key={exercise.id} ref={rendererRef} {...rendererProps(exercise)} />
            )}
            {exercise.type === 'matching' && (
              <MatchingRenderer key={exercise.id} ref={rendererRef} {...rendererProps(exercise)} />
            )}
            {exercise.type === 'listening_multiple_choice' && (
              <ListeningMultipleChoiceRenderer key={exercise.id} ref={rendererRef} {...rendererProps(exercise)} />
            )}
            {exercise.type === 'reading_comprehension' && (
              <ReadingComprehensionRenderer key={exercise.id} ref={rendererRef} {...rendererProps(exercise)} />
            )}
            {exercise.type === 'listening_dictation' && (
              <ListeningDictationRenderer key={exercise.id} ref={rendererRef} {...rendererProps(exercise)} />
            )}
            {exercise.type === 'speaking_recording' && (
              <SpeakingRecordingRenderer key={exercise.id} {...rendererProps(exercise)} />
            )}
            {isPlaceholder && (
              <View style={styles.placeholderCard}>
                <Text style={styles.placeholderText}>Exercise type coming next</Text>
              </View>
            )}

            {attemptError && <Text style={styles.errorText}>{attemptError}</Text>}
            {saveError && <Text style={styles.errorText}>{saveError}</Text>}
          </>
        )}
      </ScrollView>
      {exercise && bottomArea()}
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
  prompt: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 16,
  },
  placeholderCard: {
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 24,
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    opacity: 0.7,
  },
  pairsLeft: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    textAlign: 'center',
  },
  stateBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  stateText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.coral,
    marginTop: 8,
    textAlign: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.sky,
    borderRadius: radius.button,
    paddingVertical: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonSecondaryText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  buttonPrimary: {
    backgroundColor: colors.sun,
    borderRadius: radius.button,
    paddingVertical: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonPrimaryText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  scoreText: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.ink,
    marginVertical: 16,
  },
  medalName: {
    fontFamily: fonts.display,
    fontSize: 28,
    marginTop: 8,
    marginBottom: 16,
  },
  celebrationTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '20%',
    backgroundColor: colors.paper,
  },
  ceremonyBlock: {
    width: '100%',
    alignItems: 'center',
  },
  mascotCorner: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
  encouragementText: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.coral,
    textAlign: 'center',
  },
});