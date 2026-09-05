import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StaggerIn } from '@/src/components/ui/stagger-in';
import { TopBar } from '@/src/components/ui/TopBar';
import { lightHaptic } from '@/src/lib/haptics';
import { useAuth } from '@/src/features/auth/useAuth';
import { medalColor, medalForScore } from '@/src/lib/medals';
import { supabase } from '@/src/lib/supabase';
import { colors, fonts, radius } from '@/src/theme/tokens';
import Svg, { Path } from 'react-native-svg';
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

const NODE = 64;
const ROW_H = 110;
const X_CYCLE = [0.18, 0.5, 0.82];
const NODE_SLOT_W = 100;
const LABEL_SPACE = 34;

function CourseNode({
  lesson,
  isCurrent,
  onPress,
}: {
  lesson: LessonRow;
  isCurrent: boolean;
  onPress: () => void;
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
    <Pressable onPress={onPress} disabled={locked} style={styles.nodeSlot}>
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
  );
}

export default function Course() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [retry, setRetry] = useState(0);
  const [pathWidth, setPathWidth] = useState(0);
  const [levelTitle, setLevelTitle] = useState<string | null>(null);

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
      const levelQuery = supabase
        .from('levels')
        .select('title')
        .eq('id', levelId)
        .maybeSingle();

      const [unitsRes, lessonsRes, progressRes, levelRes] = await Promise.all([
        unitsQuery,
        lessonsQuery,
        progressQuery,
        levelQuery,
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
      if (!levelRes.error && levelRes.data) {
        setLevelTitle(levelRes.data.title);
      }

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
    router.push({
      pathname: '/lesson/[id]',
      params: { id: lesson.id, from: 'course' },
    });
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

  const W = pathWidth > 0 ? pathWidth : Dimensions.get('window').width - 32;
  const centerAt = (i: number) => ({ x: X_CYCLE[i % 3] * W, y: i * ROW_H + NODE / 2 });

  return (
    <View style={styles.screen}>
      <TopBar
        title="Your course"
        right={
          levelTitle ? (
            <View style={styles.levelChip}>
              <Text style={styles.levelChipText}>{levelTitle}</Text>
            </View>
          ) : undefined
        }
      />
      <ScrollView contentContainerStyle={styles.content}>

      {loadState.units.map((unit, unitIndex) => {
        const n = unit.lessons.length;
        const pathHeight = (n - 1) * ROW_H + NODE + LABEL_SPACE;

        return (
          <View key={unit.id} style={styles.unitSection}>
            <View style={styles.unitCard}>
              <View style={styles.unitChip}>
                <Text style={styles.unitChipText}>UNIT {unitIndex + 1}</Text>
              </View>
              <Text style={styles.unitTitle}>{unit.title}</Text>
              {unit.description && (
                <Text style={styles.unitDescription}>{unit.description}</Text>
              )}
            </View>

            <View
              style={[styles.pathColumn, { height: pathHeight }]}
              onLayout={(e) => setPathWidth(e.nativeEvent.layout.width)}
            >
              <Svg
                width={W}
                height={pathHeight}
                style={styles.pathSvg}
                pointerEvents="none"
              >
                {Array.from({ length: Math.max(0, n - 1) }, (_, i) => {
                  const a = centerAt(i);
                  const b = centerAt(i + 1);
                  const d =
                    `M ${a.x} ${a.y + NODE / 2} ` +
                    `C ${a.x} ${a.y + ROW_H * 0.55}, ${b.x} ${a.y + ROW_H * 0.45}, ` +
                    `${b.x} ${b.y - NODE / 2}`;
                  return (
                    <Path
                      key={i}
                      d={d}
                      stroke={colors.pathGrey}
                      strokeWidth={4}
                      fill="none"
                      strokeDasharray="0.1 14"
                      strokeLinecap="round"
                    />
                  );
                })}
              </Svg>
              {unit.lessons.map((lesson, i) => {
                const c = centerAt(i);
                return (
                  <View
                    key={lesson.id}
                    style={[styles.nodePosition, { left: c.x - NODE_SLOT_W / 2, top: c.y - NODE / 2 }]}
                  >
                    <StaggerIn delay={i * 40}>
                    <CourseNode
                      lesson={lesson}
                      isCurrent={lesson.status === 'current'}
                      onPress={() => onLessonPress(lesson)}
                    />
                    </StaggerIn>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}

        <Pressable
          style={styles.buttonPrimary}
          onPress={() => {
            lightHaptic();
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/home');
            }
          }}
        >
          <Text style={styles.buttonPrimaryText}>Back to home</Text>
        </Pressable>
      </ScrollView>
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 24,
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
  levelChip: {
    backgroundColor: colors.skyTint,
    borderRadius: radius.bubble,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  levelChipText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.sky,
  },
  unitCard: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 16,
  },
  unitChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.skyTint,
    borderRadius: radius.bubble,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginBottom: 8,
  },
  unitChipText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: colors.sky,
  },
  unitTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
  },
  unitDescription: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 4,
  },
  pathColumn: {
    width: '100%',
  },
  pathSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  nodePosition: {
    position: 'absolute',
    width: NODE_SLOT_W,
  },
  nodeSlot: {
    alignItems: 'center',
  },
  nodeCircle: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
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
    fontSize: 13,
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