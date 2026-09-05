import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PathMap, type ProgressMap } from '@/src/components/PathMap';
import { TopBar } from '@/src/components/ui/TopBar';
import { lightHaptic } from '@/src/lib/haptics';
import { useAuth } from '@/src/features/auth/useAuth';
import { supabase } from '@/src/lib/supabase';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Lesson, LessonProgress, Unit } from '@/src/types/content';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty'; message: string }
  | { status: 'ready'; units: Unit[]; lessons: Lesson[]; progressMap: ProgressMap };

export default function Course() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [levelTitle, setLevelTitle] = useState<string | null>(null);
  const loadStateRef = useRef(loadState);
  loadStateRef.current = loadState;

  const loadCourse = useCallback(() => {
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
    if (loadStateRef.current.status !== 'ready') {
      setLoadState({ status: 'loading' });
    }

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

      const progressMap: ProgressMap = {};
      for (const p of progress) {
        progressMap[p.lesson_id] = { completed: p.status === 'completed', score: p.score };
      }

      setLoadState({ status: 'ready', units, lessons, progressMap });
    })();

    return () => {
      mounted = false;
    };
  }, [authLoading, user, profile, router]);

  useFocusEffect(
    useCallback(() => {
      loadCourse();
    }, [loadCourse])
  );

  const onLessonPress = (lesson: Lesson) => {
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
        <Pressable style={styles.buttonSecondary} onPress={() => loadCourse()}>
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
        <PathMap
          units={loadState.units}
          lessons={loadState.lessons}
          progressMap={loadState.progressMap}
          onLessonPress={onLessonPress}
        />

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