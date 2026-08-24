import { Ionicons } from '@expo/vector-icons';
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
import { medalColor, medalForScore } from '@/src/lib/medals';
import { supabase } from '@/src/lib/supabase';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Lesson, LessonProgress, Unit } from '@/src/types/content';

type LessonStatus = 'completed' | 'current' | 'unlocked' | 'locked';

interface LessonRow extends Lesson {
  status: LessonStatus;
  medalColor: string | null;
}

interface UnitRow extends Unit {
  lessons: LessonRow[];
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty'; message: string }
  | { status: 'ready'; units: UnitRow[] };

const STATUS_ICON: Record<LessonStatus, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  completed: { name: 'checkmark-circle', color: colors.leaf },
  current: { name: 'play-circle', color: colors.sun },
  unlocked: { name: 'play-circle', color: colors.sky },
  locked: { name: 'lock-closed', color: colors.grey },
};

export default function Course() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!profile?.current_level_id) {
      setLoadState({ status: 'empty', message: 'No level assigned yet. Complete onboarding first.' });
      return;
    }

    let mounted = true;
    setLoadState({ status: 'loading' });

    (async () => {
      const levelId = profile.current_level_id as string;

      const unitsQuery = supabase
        .from('units')
        .select('*')
        .eq('level_id', levelId)
        .eq('is_published', true)
        .order('sort_order');
      const lessonsQuery = supabase
        .from('lessons')
        .select('*')
        .eq('is_published', true)
        .order('sort_order');
      const progressQuery = supabase
        .from('lesson_progress')
        .select('lesson_id,status,score')
        .eq('user_id', user.id);

      const [unitsRes, lessonsRes, progressRes] = await Promise.all([
        unitsQuery,
        lessonsQuery,
        progressQuery,
      ]);

      if (!mounted) return;

      if (unitsRes.error || lessonsRes.error || progressRes.error) {
        setLoadState({
          status: 'error',
          message:
            unitsRes.error?.message ?? lessonsRes.error?.message ?? progressRes.error?.message ?? 'Failed to load course',
        });
        return;
      }

      const units = unitsRes.data as Unit[];
      const lessons = lessonsRes.data as Lesson[];
      const progress = progressRes.data as Pick<
        LessonProgress,
        'lesson_id' | 'status' | 'score'
      >[];

      if (units.length === 0) {
        setLoadState({ status: 'empty', message: 'No units available yet.' });
        return;
      }

      const completed = new Set(
        progress.filter((p) => p.status === 'completed').map((p) => p.lesson_id)
      );
      const scoreByLesson = new Map(
        progress.filter((p) => p.score !== null).map((p) => [p.lesson_id, p.score as number])
      );

      let currentAssigned = false;

      const unitRows: UnitRow[] = units.map((unit) => {
        const unitLessons = lessons
          .filter((lesson) => lesson.unit_id === unit.id)
          .map((lesson) => ({ ...lesson, status: 'locked' as LessonStatus }));

        let prevCompleted = true;
        const rows = unitLessons.map((lesson) => {
          const isCompleted = completed.has(lesson.id);
          const unlocked = prevCompleted;
          if (isCompleted) {
            prevCompleted = true;
          } else {
            prevCompleted = false;
          }

          let status: LessonStatus;
          let medal: string | null = null;
          if (isCompleted) {
            status = 'completed';
            medal = medalColor(medalForScore(scoreByLesson.get(lesson.id) ?? 0)) ?? colors.leaf;
          } else if (unlocked && !currentAssigned) {
            status = 'current';
            currentAssigned = true;
          } else if (unlocked) {
            status = 'unlocked';
          } else {
            status = 'locked';
          }

          return { ...lesson, status, medalColor: medal };
        });

        return { ...unit, lessons: rows };
      });

      setLoadState({ status: 'ready', units: unitRows });
    })();

    return () => {
      mounted = false;
    };
  }, [authLoading, user, profile, router, retry]);

  const onLessonPress = (lesson: LessonRow) => {
    if (lesson.status === 'locked') return;
    router.push(`/lesson/${lesson.id}`);
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

  if (loadState.status === 'empty') {
    return (
      <View style={styles.container}>
        <Text style={styles.stateText}>{loadState.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your course</Text>

      {loadState.units.map((unit) => (
        <View key={unit.id} style={styles.unitSection}>
          <Text style={styles.unitTitle}>{unit.title}</Text>
          {unit.lessons.map((lesson) => {
            const icon =
              lesson.status === 'completed'
                ? {
                    name: 'checkmark-circle' as const,
                    color: lesson.medalColor ?? colors.leaf,
                  }
                : STATUS_ICON[lesson.status];
            return (
              <Pressable
                key={lesson.id}
                style={[
                  styles.lessonRow,
                  lesson.status === 'current' && styles.lessonRowCurrent,
                  lesson.status === 'locked' && styles.lessonRowLocked,
                ]}
                onPress={() => onLessonPress(lesson)}
                disabled={lesson.status === 'locked'}
              >
                <Ionicons name={icon.name} size={28} color={icon.color} />
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.paper,
  },
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
    marginBottom: 24,
  },
  unitSection: {
    marginBottom: 24,
  },
  unitTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 12,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 14,
    marginBottom: 8,
  },
  lessonRowCurrent: {
    borderColor: colors.sun,
  },
  lessonRowLocked: {
    opacity: 0.7,
  },
  lessonTitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    marginLeft: 12,
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
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.sky,
    borderRadius: radius.button,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});