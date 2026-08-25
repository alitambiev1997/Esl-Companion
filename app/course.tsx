import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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

const OFFSET_ALIGN = ['flex-start', 'center', 'flex-end'] as const;

function CourseNode({
  lesson,
  offset,
  isFirst,
  isCurrent,
  onPress,
  onRowLayout,
}: {
  lesson: LessonRow;
  offset: number;
  isFirst: boolean;
  isCurrent: boolean;
  onPress: () => void;
  onRowLayout: (y: number) => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;
  const locked = lesson.status === 'locked';
  const completed = lesson.status === 'completed';
  const ringColor = completed ? (lesson.medalColor ?? colors.leaf) : colors.sky;

  useEffect(() => {
    if (!isCurrent) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [isCurrent, pulse]);

  return (
    <View onLayout={(e) => onRowLayout(e.nativeEvent.layout.y)}>
      {!isFirst && <View style={styles.rowSpacer} />}
      <View style={[styles.nodeRow, { justifyContent: OFFSET_ALIGN[offset] }]}>
        <Pressable onPress={onPress} disabled={locked} style={styles.nodeBlock}>
          <Animated.View
            style={[
              styles.nodeCircle,
              completed && { borderColor: ringColor },
              lesson.status === 'unlocked' && styles.nodeCircleUnlocked,
              isCurrent && styles.nodeCircleCurrent,
              isCurrent && { transform: [{ scale: pulse }] },
              locked && styles.nodeCircleLocked,
            ]}
          >
            {completed && <View style={[styles.medalDot, { backgroundColor: ringColor }]} />}
            {locked && <Ionicons name="lock-closed" size={22} color={colors.white} />}
          </Animated.View>
          <Text style={styles.nodeTitle} numberOfLines={2}>
            {lesson.title}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function dotsBetween(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const count = Math.max(1, Math.floor(dist / 12));
  const dots: { x: number; y: number }[] = [];
  for (let i = 1; i < count; i++) {
    const t = i / count;
    dots.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return dots;
}

export default function Course() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [retry, setRetry] = useState(0);
  const [colWidth, setColWidth] = useState(0);
  const [centersByUnit, setCentersByUnit] = useState<Record<string, { x: number; y: number }[]>>(
    {}
  );

  useEffect(() => {
    setColWidth(0);
    setCentersByUnit({});
  }, [loadState]);

  const recordCenter = (unitId: string, rowY: number, offset: number, isCurrent: boolean) => {
    if (colWidth === 0) return;
    const x = offset === 0 ? 44 : offset === 1 ? colWidth / 2 : colWidth - 44;
    const y = rowY + 28 + (isCurrent ? 32 : 28);
    setCentersByUnit((prev) => {
      const list = prev[unitId] ?? [];
      return { ...prev, [unitId]: [...list, { x, y }] };
    });
  };

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
            unitsRes.error?.message ??
            lessonsRes.error?.message ??
            progressRes.error?.message ??
            'Failed to load course',
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
          .map((lesson) => ({ ...lesson, status: 'locked' as LessonStatus, medalColor: null }));

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
        <Pressable style={styles.buttonSecondary} onPress={() => setRetry((n) => n + 1)}>
          <Text style={styles.buttonSecondaryText}>Try again</Text>
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
          <View style={styles.unitCard}>
            <Text style={styles.unitTitle}>{unit.title}</Text>
            {unit.description && (
              <Text style={styles.unitDescription}>{unit.description}</Text>
            )}
          </View>

          <View style={styles.pathColumn} onLayout={(e) => setColWidth(e.nativeEvent.layout.width)}>
            {unit.lessons.map((lesson, i) => {
              const offset = i % 3;
              return (
                <CourseNode
                  key={lesson.id}
                  lesson={lesson}
                  offset={offset}
                  isFirst={i === 0}
                  isCurrent={lesson.status === 'current'}
                  onPress={() => onLessonPress(lesson)}
                  onRowLayout={(y) => recordCenter(unit.id, y, offset, lesson.status === 'current')}
                />
              );
            })}
            <View style={styles.dotsLayer} pointerEvents="none">
              {((centersByUnit[unit.id] ?? []) as { x: number; y: number }[])
                .flatMap((center, i, all) =>
                  i === 0 ? [] : dotsBetween(all[i - 1], center)
                )
                .map((dot, i) => (
                  <View key={i} style={[styles.pathDot, { left: dot.x - 2, top: dot.y - 2 }]} />
                ))}
            </View>
          </View>
        </View>
      ))}

      <Pressable
        style={styles.buttonPrimary}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
      >
        <Text style={styles.buttonPrimaryText}>Back to home</Text>
      </Pressable>
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
  unitCard: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 16,
  },
  unitTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
  },
  unitDescription: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 4,
  },
  pathColumn: {
    width: '100%',
  },
  rowSpacer: {
    height: 28,
  },
  dotsLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  pathDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.grey,
  },
  nodeRow: {
    flexDirection: 'row',
  },
  nodeBlock: {
    width: 88,
    alignItems: 'center',
  },
  nodeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.grey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCircleUnlocked: {
    borderColor: colors.sky,
  },
  nodeCircleCurrent: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.sun,
    borderColor: colors.sun,
  },
  nodeCircleLocked: {
    backgroundColor: colors.grey,
    borderColor: colors.grey,
  },
  medalDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  nodeTitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 6,
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
    marginTop: 12,
  },
  buttonPrimaryText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
});