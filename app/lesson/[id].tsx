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
import { supabase } from '@/src/lib/supabase';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Exercise, Lesson } from '@/src/types/content';

interface MultipleChoiceContent {
  options: string[];
  correct_index: number;
  explanation: string;
}

interface Result {
  score: number;
  passed: boolean;
  xp: number;
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
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('answering');
  const [correctCount, setCorrectCount] = useState(0);
  const [attemptError, setAttemptError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
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
        supabase.from('lessons').select('id,title,pass_score').eq('id', id).maybeSingle(),
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

  const mcContent = (exercise: Exercise): MultipleChoiceContent | null => {
    if (exercise.type !== 'multiple_choice' || !exercise.content) return null;
    return exercise.content as unknown as MultipleChoiceContent;
  };

  const onCheck = async (exercise: Exercise, content: MultipleChoiceContent) => {
    if (selected === null || !user) return;

    const isCorrect = selected === content.correct_index;
    setAttemptError(null);

    const { error } = await supabase.from('exercise_attempts').insert({
      user_id: user.id,
      lesson_id: exercise.lesson_id,
      exercise_id: exercise.id,
      user_answer: { selected_index: selected },
      is_correct: isCorrect,
    });

    if (error) {
      setAttemptError(error.message);
      return;
    }

    if (isCorrect) {
      setCorrectCount((n) => n + 1);
    }
    setPhase('checked');
  };

  const onContinue = async () => {
    if (loadState.status !== 'ready') return;

    const exercises = loadState.exercises;
    const next = index + 1;

    if (next < exercises.length) {
      setIndex(next);
      setSelected(null);
      setPhase('answering');
      setAttemptError(null);
      return;
    }

    await finishLesson(exercises);
  };

  const finishLesson = async (exercises: Exercise[]) => {
    if (!user || loadState.status !== 'ready') return;

    const passScore = loadState.lesson.pass_score ?? 70;
    const total = exercises.length;
    const score = total === 0 ? 0 : Math.round((correctCount / total) * 100);
    const passed = score >= passScore;
    const xp = correctCount * 10 + (passed ? 20 : 0);

    setSaving(true);
    setSaveError(null);

    const { data: existing } = await supabase
      .from('lesson_progress')
      .select('score,xp_earned,completed_at')
      .eq('user_id', user.id)
      .eq('lesson_id', id)
      .maybeSingle();

    const bestScore = Math.max(existing?.score ?? 0, score);
    const bestXp = Math.max(existing?.xp_earned ?? 0, xp);
    const status = bestScore >= passScore ? 'completed' : 'attempted';
    const completedAt =
      existing?.completed_at ?? (status === 'completed' ? new Date().toISOString() : null);

    const { error } = await supabase.from('lesson_progress').upsert(
      {
        user_id: user.id,
        lesson_id: id,
        score: bestScore,
        xp_earned: bestXp,
        status,
        completed_at: completedAt,
      },
      { onConflict: 'user_id,lesson_id' }
    );

    if (error) {
      setSaveError(error.message);
      setSaving(false);
      return;
    }

    setResult({ score: bestScore, passed: status === 'completed', xp: bestXp });
    setSaving(false);
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
        <Pressable style={styles.button} onPress={() => setRetry((n) => n + 1)}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (result) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{result.passed ? 'Passed!' : 'Not passed yet'}</Text>
        <Text style={styles.scoreText}>Score: {result.score}%</Text>
        <Text style={styles.resultText}>XP earned: {result.xp}</Text>
        <Pressable style={styles.button} onPress={() => router.replace('/course')}>
          <Text style={styles.buttonText}>Back to course</Text>
        </Pressable>
      </View>
    );
  }

  const { lesson, exercises } = loadState;
  const exercise = exercises[index];
  const content = exercise ? mcContent(exercise) : null;
  const isCorrect =
    content !== null && phase === 'checked' && selected === content.correct_index;

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

        {exercise && !content && (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>Exercise type coming next</Text>
            <Pressable style={styles.button} onPress={onContinue}>
              <Text style={styles.buttonText}>Continue</Text>
            </Pressable>
          </View>
        )}

        {exercise && content && (
          <>
            <Text style={styles.prompt}>{exercise.prompt}</Text>

            {content.options.map((option, i) => {
              const isSelected = selected === i;
              const showResult = phase === 'checked';
              const isThisCorrect = i === content.correct_index;
              const isThisWrongPick = isSelected && !isThisCorrect;

              return (
                <Pressable
                  key={i}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                    showResult && isThisCorrect && styles.optionCorrect,
                    showResult && isThisWrongPick && styles.optionWrong,
                  ]}
                  onPress={() => {
                    if (phase === 'answering') setSelected(i);
                  }}
                  disabled={phase !== 'answering'}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </Pressable>
              );
            })}

            {phase === 'answering' && (
              <Pressable
                style={[styles.button, selected === null && styles.buttonDisabled]}
                onPress={() => onCheck(exercise, content)}
                disabled={selected === null}
              >
                <Text style={styles.buttonText}>Check</Text>
              </Pressable>
            )}

            {phase === 'checked' && (
              <>
                <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
                  <Text style={styles.feedbackTitle}>
                    {isCorrect ? 'Correct!' : 'Not quite'}
                  </Text>
                  <Text style={styles.feedbackText}>{content.explanation}</Text>
                </View>
                {attemptError && <Text style={styles.errorText}>{attemptError}</Text>}
                <Pressable
                  style={styles.button}
                  onPress={onContinue}
                  disabled={saving}
                >
                  <Text style={styles.buttonText}>
                    {index === exercises.length - 1 ? 'Finish' : 'Continue'}
                  </Text>
                </Pressable>
              </>
            )}
          </>
        )}

        {saveError && <Text style={styles.errorText}>{saveError}</Text>}
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
  option: {
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 14,
    marginBottom: 8,
    backgroundColor: colors.paper,
  },
  optionSelected: {
    borderColor: colors.sky,
  },
  optionCorrect: {
    borderColor: colors.leaf,
    backgroundColor: '#F0F9E8',
  },
  optionWrong: {
    borderColor: colors.coral,
    backgroundColor: '#FDEFEA',
  },
  optionText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
  },
  feedback: {
    borderRadius: radius.card,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  feedbackCorrect: {
    backgroundColor: '#F0F9E8',
  },
  feedbackWrong: {
    backgroundColor: '#FDEFEA',
  },
  feedbackTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 4,
  },
  feedbackText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
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
  button: {
    backgroundColor: colors.sky,
    borderRadius: radius.button,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  scoreText: {
    fontFamily: fonts.display,
    fontSize: 40,
    color: colors.ink,
    marginVertical: 16,
  },
  resultText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 8,
  },
});