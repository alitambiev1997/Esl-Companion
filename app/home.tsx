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
import { supabase } from '@/src/lib/supabase';
import { ensureReviewItems } from '@/src/lib/review';
import { colors, fonts, radius } from '@/src/theme/tokens';
import { useAuth } from '@/src/features/auth/useAuth';
import type { Lesson, LessonProgress, Unit } from '@/src/types/content';

interface NextLesson {
  id: string;
  title: string;
}

type DashState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      streak: number;
      medalCount: number;
      reviewDue: number;
      nextLesson: NextLesson | null;
    };

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function computeStreak(dates: string[]): number {
  const set = new Set(dates);
  const DAY = 24 * 60 * 60 * 1000;
  let cursor = new Date();

  if (!set.has(toDateKey(cursor))) {
    cursor = new Date(cursor.getTime() - DAY);
    if (!set.has(toDateKey(cursor))) return 0;
  }

  let streak = 0;
  while (set.has(toDateKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY);
  }
  return streak;
}

export default function Home() {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const [levelTitle, setLevelTitle] = useState<string | null>(null);
  const [dash, setDash] = useState<DashState>({ status: 'loading' });
  const [retry, setRetry] = useState(0);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (!profile?.onboarding_completed) {
      router.replace('/onboarding');
    }
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (!profile?.current_level_id) return;

    let mounted = true;

    (async () => {
      const { data, error } = await supabase
        .from('levels')
        .select('title')
        .eq('id', profile.current_level_id as string)
        .maybeSingle();
      if (!mounted) return;
      if (!error && data) {
        setLevelTitle(data.title);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [profile?.current_level_id]);

  useEffect(() => {
    if (!user) return;

    if (!profile?.current_level_id) {
      setDash({
        status: 'ready',
        streak: 0,
        medalCount: 0,
        reviewDue: 0,
        nextLesson: null,
      });
      return;
    }

    let mounted = true;
    setDash({ status: 'loading' });

    (async () => {
      const now = new Date();
      const levelId = profile.current_level_id as string;

      try {
        await ensureReviewItems(user.id, levelId);
      } catch (error) {
        if (!mounted) return;
        setDash({
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to load dashboard',
        });
        return;
      }

      const [activityRes, progressRes, reviewRes, unitsRes, lessonsRes] = await Promise.all([
        supabase
          .from('daily_activity')
          .select('activity_date')
          .eq('user_id', user.id),
        supabase
          .from('lesson_progress')
          .select('lesson_id,status')
          .eq('user_id', user.id),
        supabase
          .from('review_items')
          .select('id')
          .eq('user_id', user.id)
          .lte('due_at', now.toISOString()),
        supabase
          .from('units')
          .select('*')
          .eq('level_id', levelId)
          .eq('is_published', true)
          .order('sort_order'),
        supabase
          .from('lessons')
          .select('*')
          .eq('is_published', true)
          .order('sort_order'),
      ]);

      if (!mounted) return;

      const firstError =
        activityRes.error ??
        progressRes.error ??
        reviewRes.error ??
        unitsRes.error ??
        lessonsRes.error;

      if (firstError) {
        setDash({ status: 'error', message: firstError.message });
        return;
      }

      const activity = (activityRes.data ?? []) as { activity_date: string }[];
      const streak = computeStreak(activity.map((a) => a.activity_date));
      const reviewDue = (reviewRes.data ?? []).length;

      const units = unitsRes.data as Unit[];
      const lessons = lessonsRes.data as Lesson[];
      const progress = progressRes.data as Pick<LessonProgress, 'lesson_id' | 'status'>[];
      const medalCount = progress.filter((p) => p.status === 'completed').length;
      const completed = new Set(
        progress.filter((p) => p.status === 'completed').map((p) => p.lesson_id)
      );

      let nextLesson: NextLesson | null = null;
      for (const unit of units) {
        const unitLessons = lessons.filter((l) => l.unit_id === unit.id);
        let prevCompleted = true;
        for (const lesson of unitLessons) {
          const isCompleted = completed.has(lesson.id);
          const unlocked = prevCompleted;
          if (isCompleted) {
            prevCompleted = true;
          } else {
            prevCompleted = false;
          }
          if (unlocked && !isCompleted) {
            nextLesson = { id: lesson.id, title: lesson.title };
            break;
          }
        }
        if (nextLesson) break;
      }

      setDash({ status: 'ready', streak, medalCount, reviewDue, nextLesson });
    })();

    return () => {
      mounted = false;
    };
  }, [user, profile?.current_level_id, retry]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.sky} />
      </View>
    );
  }

  if (!user || !profile?.onboarding_completed) {
    return null;
  }

  const onSignOut = async () => {
    setSigningOut(true);
    setSignOutError(null);
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Sign out failed');
      setSigningOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.email}>{user.email ?? 'No email on file'}</Text>
        {levelTitle && <Text style={styles.level}>Level: {levelTitle}</Text>}

        {dash.status === 'loading' && (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color={colors.sky} />
          </View>
        )}

        {dash.status === 'error' && (
          <View style={styles.stateBox}>
            <Text style={styles.errorText}>{dash.message}</Text>
            <Pressable style={styles.buttonSecondary} onPress={() => setRetry((n) => n + 1)}>
              <Text style={styles.buttonSecondaryText}>Try again</Text>
            </Pressable>
          </View>
        )}

        {dash.status === 'ready' && (
          <>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, styles.statCardMargin]}>
                <Text style={styles.statValue}>{dash.streak}</Text>
                <Text style={styles.statLabel}>Day streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{dash.medalCount}</Text>
                <Text style={styles.statLabel}>Medals</Text>
              </View>
            </View>

            {dash.reviewDue > 0 && (
              <Pressable style={styles.card} onPress={() => router.push('/review')}>
                <Text style={styles.cardTitle}>Review due: {dash.reviewDue} words</Text>
              </Pressable>
            )}

            {dash.nextLesson && (
              <Pressable
                style={styles.card}
                onPress={() => router.push(`/lesson/${dash.nextLesson!.id}`)}
              >
                <Text style={styles.cardTitle}>Continue learning</Text>
                <Text style={styles.cardSubtitle}>{dash.nextLesson.title}</Text>
              </Pressable>
            )}
          </>
        )}

        {signOutError && <Text style={styles.errorText}>{signOutError}</Text>}

        <Pressable style={styles.buttonSecondary} onPress={() => router.push('/course')}>
          <Text style={styles.buttonSecondaryText}>Your course</Text>
        </Pressable>

        <Pressable
          style={[styles.buttonPrimary, signingOut && styles.buttonDisabled]}
          onPress={onSignOut}
          disabled={signingOut}
        >
          <Text style={styles.buttonPrimaryText}>
            {signingOut ? 'Signing out...' : 'Sign out'}
          </Text>
        </Pressable>
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
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    marginTop: 4,
  },
  level: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    opacity: 0.7,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 16,
    alignItems: 'center',
  },
  statCardMargin: {
    marginRight: 12,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.sky,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
  },
  cardSubtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 4,
  },
  stateBox: {
    alignItems: 'center',
    paddingVertical: 24,
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
    marginTop: 12,
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
    marginTop: 12,
  },
  buttonPrimaryText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});