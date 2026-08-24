import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '@/src/features/auth/useAuth';
import { MultipleChoiceRenderer } from '@/src/features/lesson/renderers/multiple-choice';
import { addDailyActivity } from '@/src/lib/activity';
import { ensureReviewItems } from '@/src/lib/review';
import { supabase } from '@/src/lib/supabase';
import { applyGrade } from '@/src/lib/srs';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Exercise } from '@/src/types/content';

interface ReviewCard {
  id: string;
  interval_days: number;
  ease_factor: number;
  state: string;
  repetition_count: number;
  due_at: string;
  word: string;
  definition: string;
  exampleSentence: string | null;
}

interface ReviewRow {
  id: string;
  state: string;
  interval_days: number;
  ease_factor: number;
  repetition_count: number;
  due_at: string;
  vocabulary: {
    word: string;
    definition: string;
    example_sentence: string | null;
  } | null;
}

interface PoolItem {
  id: string;
  word: string;
  definition: string;
  example_sentence: string | null;
}

interface ObjectiveExercise {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

type Phase = 'answering' | 'checked';

type SessionState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'ready'; cards: ReviewCard[]; pool: PoolItem[] }
  | { status: 'end'; reviewed: number; correct: number };

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function pickFormat(sessionIndex: number, card: ReviewCard): number {
  const rotated = sessionIndex % 3;
  for (let offset = 0; offset < 3; offset++) {
    const format = (rotated + offset) % 3;
    if (format === 0 && card.definition) return 0;
    if (format === 1 && card.definition) return 1;
    if (format === 2 && card.exampleSentence && card.exampleSentence.includes(card.word)) {
      return 2;
    }
  }
  return 0;
}

function buildExercise(card: ReviewCard, sessionIndex: number, pool: PoolItem[]): ObjectiveExercise {
  const format = pickFormat(sessionIndex, card);
  const target = format === 0 ? card.definition : card.word;
  const candidates = shuffle(pool.filter((p) => p.id !== card.id));
  const distractors: string[] = [];
  for (const item of candidates) {
    if (distractors.length === 3) break;
    const value = (format === 0 ? item.definition : item.word) ?? '';
    if (value && value !== target && !distractors.includes(value)) {
      distractors.push(value);
    }
  }

  if (format === 1) {
    const options = shuffle(unique([card.word, ...distractors]));
    return {
      prompt: `Which word means: "${card.definition}"`,
      options,
      correctIndex: options.indexOf(card.word),
      explanation: card.definition,
    };
  }

  if (format === 2) {
    const blanked = card.exampleSentence!.split(card.word).join('___');
    const options = shuffle(unique([card.word, ...distractors]));
    return {
      prompt: `Complete: "${blanked}"`,
      options,
      correctIndex: options.indexOf(card.word),
      explanation: card.definition,
    };
  }

  const options = shuffle(unique([card.definition, ...distractors]));
  return {
    prompt: `What does "${card.word}" mean?`,
    options,
    correctIndex: options.indexOf(card.definition),
    explanation: card.definition,
  };
}

function toExercise(card: ReviewCard, exercise: ObjectiveExercise): Exercise {
  return {
    id: card.id,
    lesson_id: '',
    type: 'multiple_choice',
    prompt: exercise.prompt,
    content: {
      options: exercise.options,
      correct_index: exercise.correctIndex,
      explanation: exercise.explanation,
    },
    sort_order: 0,
    created_at: '',
  };
}

export default function Review() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [session, setSession] = useState<SessionState>({ status: 'loading' });
  const [retry, setRetry] = useState(0);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('answering');
  const [correctCount, setCorrectCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);

  const readySession = session.status === 'ready' ? session : null;
  const card = readySession?.cards[index] ?? null;
  const exercise = useMemo(
    () => (card ? buildExercise(card, index, readySession?.pool ?? []) : null),
    [card, index, readySession]
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!profile?.current_level_id) {
      setSession({ status: 'error', message: 'No level assigned yet. Complete onboarding first.' });
      return;
    }

    let mounted = true;
    setSession({ status: 'loading' });

    (async () => {
      const now = new Date().toISOString();
      const levelId = profile.current_level_id as string;

      try {
        await ensureReviewItems(user.id, levelId);
        if (!mounted) return;

        const [poolRes, queueRes] = await Promise.all([
          supabase
            .from('vocabulary_items')
            .select('id,word,definition,example_sentence')
            .eq('level_id', levelId)
            .eq('is_published', true),
          supabase
            .from('review_items')
            .select(
              'id,state,interval_days,ease_factor,repetition_count,due_at,vocabulary:vocabulary_items(word,definition,example_sentence)'
            )
            .eq('user_id', user.id)
            .lte('due_at', now)
            .order('due_at')
            .limit(10),
        ]);
        if (poolRes.error) throw new Error(poolRes.error.message);
        if (queueRes.error) throw new Error(queueRes.error.message);

        if (!mounted) return;

        const rows = (queueRes.data ?? []) as unknown as ReviewRow[];
        const cards: ReviewCard[] = rows
          .filter((row) => row.vocabulary)
          .map((row) => ({
            id: row.id,
            interval_days: row.interval_days,
            ease_factor: row.ease_factor,
            state: row.state,
            repetition_count: row.repetition_count,
            due_at: row.due_at,
            word: row.vocabulary!.word,
            definition: row.vocabulary!.definition,
            exampleSentence: row.vocabulary!.example_sentence ?? null,
          }));
        const pool = (poolRes.data ?? []) as PoolItem[];

        setSession(cards.length === 0 ? { status: 'empty' } : { status: 'ready', cards, pool });
      } catch (error) {
        if (!mounted) return;
        setSession({
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to load reviews',
        });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authLoading, user, profile, router, retry]);

  const handleCheck = async (isCorrect: boolean) => {
    if (session.status !== 'ready') return;

    const card = session.cards[index];
    setBusy(true);
    setGradeError(null);

    try {
      const next = applyGrade(card, isCorrect ? 'good' : 'again', new Date());

      const { error } = await supabase.from('review_items').update(next).eq('id', card.id);
      if (error) throw new Error(error.message);

      await addDailyActivity(user!.id, { reviewsCompleted: 1 });

      if (isCorrect) {
        setCorrectCount((n) => n + 1);
      }
      setPhase('checked');
    } catch (error) {
      setGradeError(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  const handleContinue = () => {
    if (session.status !== 'ready') return;

    const next = index + 1;
    if (next < session.cards.length) {
      setIndex(next);
      setPhase('answering');
      setGradeError(null);
      return;
    }

    setSession({ status: 'end', reviewed: session.cards.length, correct: correctCount });
  };

  if (authLoading || session.status === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.sky} />
      </View>
    );
  }

  if (session.status === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{session.message}</Text>
        <Pressable style={styles.buttonSecondary} onPress={() => setRetry((n) => n + 1)}>
          <Text style={styles.buttonSecondaryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (session.status === 'empty') {
    return (
      <View style={styles.container}>
        <Text style={styles.stateText}>No reviews due. Come back later.</Text>
      </View>
    );
  }

  if (session.status === 'end') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Session complete</Text>
        <Text style={styles.stateText}>
          {session.correct} of {session.reviewed} correct
        </Text>
        <Pressable style={styles.buttonPrimary} onPress={() => router.replace('/home')}>
          <Text style={styles.buttonPrimaryText}>Back to home</Text>
        </Pressable>
      </View>
    );
  }

  if (!card || !exercise) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Review</Text>
        <Text style={styles.progressText}>
          Card {index + 1} of {session.cards.length}
        </Text>

        <Text style={styles.prompt}>{exercise.prompt}</Text>

        <MultipleChoiceRenderer
          key={card.id}
          exercise={toExercise(card, exercise)}
          checked={phase === 'checked'}
          busy={busy}
          isLast={index === session.cards.length - 1}
          onCheck={(_, isCorrect) => handleCheck(isCorrect)}
          onContinue={handleContinue}
        />

        {gradeError && <Text style={styles.errorText}>{gradeError}</Text>}
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
    marginBottom: 8,
  },
  progressText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    marginBottom: 16,
  },
  prompt: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 16,
  },
  stateText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.coral,
    marginTop: 8,
    textAlign: 'center',
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
});