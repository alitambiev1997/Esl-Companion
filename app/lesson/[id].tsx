import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '@/src/features/auth/useAuth';
import { addDailyActivity } from '@/src/lib/activity';
import { ContinueButton } from '@/src/features/lesson/flow-buttons';
import type { ExerciseRendererProps } from '@/src/features/lesson/content';
import { FillBlankRenderer } from '@/src/features/lesson/renderers/fill-blank';
import { MatchingRenderer } from '@/src/features/lesson/renderers/matching';
import { MultipleChoiceRenderer } from '@/src/features/lesson/renderers/multiple-choice';
import { WordOrderRenderer } from '@/src/features/lesson/renderers/word-order';
import { supabase } from '@/src/lib/supabase';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Exercise, Lesson } from '@/src/types/content';

interface Result {
  score: number;
  passed: boolean;
  xpGained: number;
  xpMax: number;
}

type Phase = 'answering' | 'checked';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; lesson: Lesson; exercises: Exercise[] };

export default function LessonPlayer() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
    isCorrect: boolean
  ) => {
    if (!user) return;

    setBusy(true);
    setAttemptError(null);

    const { error } = await supabase.from('exercise_attempts').insert({
      user_id: user.id,
      lesson_id: exercise.lesson_id,
      exercise_id: exercise.id,
      user_answer: userAnswer,
      is_correct: isCorrect,
    });

    setBusy(false);

    if (error) {
      setAttemptError(error.message);
      return;
    }

    if (isCorrect) {
      setCorrectCount((n) => n + 1);
    }
    setPhase('checked');
  };

  const handleContinue = async () => {
    if (loadState.status !== 'ready') return;

    const next = index + 1;

    if (next < loadState.exercises.length) {
      setIndex(next);
      setPhase('answering');
      setAttemptError(null);
      return;
    }

    await finishLesson(loadState.exercises);
  };

  const finishLesson = async (exercises: Exercise[]) => {
    if (!user || loadState.status !== 'ready') return;

    const passScore = loadState.lesson.pass_score ?? 70;
    const total = exercises.length;
    const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);
    const passed = score >= passScore;
    const runXp = passed ? correctCount * 10 + 20 : 0;

    setBusy(true);
    setSaveError(null);

    const { data: existing } = await supabase
      .from('lesson_progress')
      .select('score,xp_earned,completed_at')
      .eq('user_id', user.id)
      .eq('lesson_id', id)
      .maybeSingle();

    const bestScore = Math.max(existing?.score ?? 0, score);
    const oldBestXp = existing?.xp_earned ?? 0;
    const newBestXp = Math.max(oldBestXp, runXp);
    const xpGained = Math.max(newBestXp - oldBestXp, 0);
    const status = bestScore >= passScore ? 'completed' : 'attempted';
    const completedAt =
      existing?.completed_at ?? (status === 'completed' ? new Date().toISOString() : null);

    const { error } = await supabase.from('lesson_progress').upsert(
      {
        user_id: user.id,
        lesson_id: id,
        score: bestScore,
        xp_earned: newBestXp,
        status,
        completed_at: completedAt,
      },
      { onConflict: 'user_id,lesson_id' }
    );

    if (error) {
      setSaveError(error.message);
      setBusy(false);
      return;
    }

    if (passed) {
      try {
        await addDailyActivity(user.id, {
          xp: xpGained,
          lessonsCompleted: 1,
          minutesPracticed: loadState.lesson.estimated_minutes ?? 0,
        });
      } catch {
        // no-op
      }
    }

    setResult({ score, passed, xpGained, xpMax: newBestXp });
    setBusy(false);
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
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{result.passed ? 'Passed!' : 'Not passed yet'}</Text>
        <Text style={styles.scoreText}>Score: {result.score}%</Text>
        <Text style={styles.resultText}>+{result.xpGained} XP</Text>
        <Text style={styles.resultSubtext}>Lesson max: {result.xpMax}</Text>
        <Pressable style={styles.buttonPrimary} onPress={() => router.replace('/course')}>
          <Text style={styles.buttonPrimaryText}>Back to course</Text>
        </Pressable>
      </View>
    );
  }

  const { lesson, exercises } = loadState;
  const exercise = exercises[index];

  const rendererProps = (current: Exercise): ExerciseRendererProps => ({
    exercise: current,
    checked: phase === 'checked',
    busy,
    isLast: index === exercises.length - 1,
    onCheck: (userAnswer, isCorrect) => handleCheck(current, userAnswer, isCorrect),
    onContinue: handleContinue,
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{lesson.title}</Text>

        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            Exercise {Math.min(index + 1, exercises.length)} of {exercises.length}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${exercises.length === 0 ? 0 : ((index + 1) / exercises.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {exercises.length === 0 && (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>No exercises in this lesson yet.</Text>
          </View>
        )}

        {exercise && (
          <>
            <Text style={styles.prompt}>{exercise.prompt}</Text>

            {exercise.type === 'multiple_choice' && (
              <MultipleChoiceRenderer key={exercise.id} {...rendererProps(exercise)} />
            )}
            {exercise.type === 'fill_blank' && (
              <FillBlankRenderer key={exercise.id} {...rendererProps(exercise)} />
            )}
            {exercise.type === 'word_order' && (
              <WordOrderRenderer key={exercise.id} {...rendererProps(exercise)} />
            )}
            {exercise.type === 'matching' && (
              <MatchingRenderer key={exercise.id} {...rendererProps(exercise)} />
            )}
            {!['multiple_choice', 'fill_blank', 'word_order', 'matching'].includes(
              exercise.type
            ) && (
              <View style={styles.placeholderCard}>
                <Text style={styles.placeholderText}>Exercise type coming next</Text>
                <ContinueButton
                  isLast={index === exercises.length - 1}
                  onPress={handleContinue}
                  disabled={busy}
                />
              </View>
            )}

            {attemptError && <Text style={styles.errorText}>{attemptError}</Text>}
            {saveError && <Text style={styles.errorText}>{saveError}</Text>}
          </>
        )}
      </ScrollView>
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
    paddingBottom: 48,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    marginRight: 12,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: radius.button,
    backgroundColor: colors.grey,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.button,
    backgroundColor: colors.sky,
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
    fontSize: 40,
    color: colors.ink,
    marginVertical: 16,
  },
  resultText: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.leaf,
    marginBottom: 4,
  },
  resultSubtext: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    marginBottom: 8,
  },
});