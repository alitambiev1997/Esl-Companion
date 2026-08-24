import { useRouter } from 'expo-router';
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
import { ensureReviewItems } from '@/src/lib/review';
import { supabase } from '@/src/lib/supabase';
import { applyGrade, type SrsGrade } from '@/src/lib/srs';
import { colors, fonts, radius } from '@/src/theme/tokens';

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

type SessionState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'ready'; cards: ReviewCard[] }
  | { status: 'end'; reviewed: number };

export default function Review() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [session, setSession] = useState<SessionState>({ status: 'loading' });
  const [retry, setRetry] = useState(0);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const [gradeError, setGradeError] = useState<string | null>(null);

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

        const { data, error } = await supabase
          .from('review_items')
          .select(
            'id,state,interval_days,ease_factor,repetition_count,due_at,vocabulary:vocabulary_items(word,definition,example_sentence)'
          )
          .eq('user_id', user.id)
          .lte('due_at', now)
          .order('due_at')
          .limit(10);
        if (error) throw new Error(error.message);

        if (!mounted) return;

        const rows = (data ?? []) as unknown as ReviewRow[];

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

        setSession(cards.length === 0 ? { status: 'empty' } : { status: 'ready', cards });
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

  const gradeCard = async (grade: SrsGrade) => {
    if (session.status !== 'ready') return;

    const card = session.cards[index];
    setBusy(true);
    setGradeError(null);

    try {
      const next = applyGrade(card, grade, new Date());

      const { error } = await supabase.from('review_items').update(next).eq('id', card.id);
      if (error) throw new Error(error.message);

      await addDailyActivity(user!.id, { reviewsCompleted: 1 });

      const reviewed = index + 1;
      if (reviewed >= session.cards.length) {
        setSession({ status: 'end', reviewed });
      } else {
        setIndex(reviewed);
        setFlipped(false);
      }
    } catch (error) {
      setGradeError(error instanceof Error ? error.message : 'Failed to save grade');
    } finally {
      setBusy(false);
    }
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
        <Text style={styles.stateText}>Reviewed: {session.reviewed}</Text>
        <Pressable style={styles.buttonPrimary} onPress={() => router.replace('/home')}>
          <Text style={styles.buttonPrimaryText}>Back to home</Text>
        </Pressable>
      </View>
    );
  }

  const card = session.cards[index];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Review</Text>
        <Text style={styles.progressText}>
          Card {index + 1} of {session.cards.length}
        </Text>

        <View style={styles.card}>
          <Text style={styles.word}>{card.word}</Text>

          {!flipped ? (
            <Pressable style={styles.buttonPrimary} onPress={() => setFlipped(true)} disabled={busy}>
              <Text style={styles.buttonPrimaryText}>Show answer</Text>
            </Pressable>
          ) : (
            <>
              <Text style={styles.definition}>{card.definition}</Text>
              {card.exampleSentence && (
                <Text style={styles.example}>&quot;{card.exampleSentence}&quot;</Text>
              )}

              <View style={styles.gradeRow}>
                <Pressable
                  style={[styles.gradeButton, styles.gradeAgain]}
                  onPress={() => gradeCard('again')}
                  disabled={busy}
                >
                  <Text style={styles.gradeAgainText}>Again</Text>
                </Pressable>
                <Pressable
                  style={[styles.gradeButton, styles.gradeGood]}
                  onPress={() => gradeCard('good')}
                  disabled={busy}
                >
                  <Text style={styles.gradeGoodText}>Good</Text>
                </Pressable>
                <Pressable
                  style={[styles.gradeButton, styles.gradeEasy]}
                  onPress={() => gradeCard('easy')}
                  disabled={busy}
                >
                  <Text style={styles.gradeEasyText}>Easy</Text>
                </Pressable>
              </View>
            </>
          )}

          {gradeError && <Text style={styles.errorText}>{gradeError}</Text>}
        </View>
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
  card: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 24,
  },
  word: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    marginBottom: 16,
  },
  definition: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 8,
  },
  example: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    marginBottom: 16,
  },
  gradeRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  gradeButton: {
    flex: 1,
    borderRadius: radius.button,
    paddingVertical: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  gradeAgain: {
    backgroundColor: colors.coral,
  },
  gradeGood: {
    backgroundColor: colors.sun,
  },
  gradeEasy: {
    backgroundColor: colors.leaf,
    marginRight: 0,
  },
  gradeAgainText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  gradeGoodText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  gradeEasyText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
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