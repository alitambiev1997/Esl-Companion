import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PathMap, type ProgressMap } from '@/src/components/PathMap';
import { TopBar } from '@/src/components/ui/TopBar';
import { getClassCode, getClassLevelId } from '@/src/lib/class-code';
import { supabase } from '@/src/lib/supabase';
import { readWebProgress } from '@/src/lib/web-progress';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Lesson, Unit } from '@/src/types/content';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty'; message: string }
  | { status: 'ready'; unit: Unit; lessons: Lesson[]; progressMap: ProgressMap };

export default function UnitMap() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const unitId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const loadStateRef = useRef(loadState);
  loadStateRef.current = loadState;
  const storedCode = getClassCode();
  const levelId = getClassLevelId();

  const loadUnit = useCallback(() => {
    if (!storedCode || !levelId || !unitId) {
      router.replace('/gate');
      return;
    }

    let mounted = true;
    if (loadStateRef.current.status !== 'ready') {
      setLoadState({ status: 'loading' });
    }

    (async () => {
      const unitQuery = supabase
        .from('units')
        .select('*')
        .eq('id', unitId)
        .eq('is_published', true)
        .maybeSingle();
      const lessonsQuery = supabase
        .from('lessons')
        .select('*')
        .eq('is_published', true)
        .order('sort_order');

      const [unitRes, lessonsRes, progress] = await Promise.all([
        unitQuery,
        lessonsQuery,
        Promise.resolve(readWebProgress(storedCode)),
      ]);

      if (!mounted) return;

      if (unitRes.error || lessonsRes.error) {
        setLoadState({
          status: 'error',
          message:
            unitRes.error?.message ?? lessonsRes.error?.message ?? 'Failed to load unit',
        });
        return;
      }
      if (!unitRes.data) {
        setLoadState({ status: 'empty', message: 'Unit not found.' });
        return;
      }

      const unit = unitRes.data as Unit;
      if (unit.level_id !== levelId) {
        router.replace('/course');
        return;
      }

      const lessons = (lessonsRes.data as Lesson[]).filter(
        (lesson) => lesson.unit_id === unit.id
      );
      if (lessons.length === 0) {
        setLoadState({ status: 'empty', message: 'No lessons in this unit yet.' });
        return;
      }

      const progressMap: ProgressMap = {};
      for (const [lessonId, entry] of Object.entries(progress)) {
        progressMap[lessonId] = { completed: entry.score >= 60, score: entry.score };
      }

      setLoadState({ status: 'ready', unit, lessons, progressMap });
    })();

    return () => {
      mounted = false;
    };
  }, [storedCode, levelId, unitId, router]);

  useFocusEffect(
    useCallback(() => {
      loadUnit();
    }, [loadUnit])
  );

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/course');
    }
  };

  const onLessonPress = (lesson: Lesson) => {
    router.push({
      pathname: '/lesson/[id]',
      params: { id: lesson.id, from: 'unit', unitId },
    });
  };

  if (loadState.status === 'loading') {
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
        <Pressable style={styles.buttonSecondary} onPress={() => loadUnit()}>
          <Text style={styles.buttonSecondaryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (loadState.status === 'empty') {
    return (
      <View style={styles.container}>
        <Text style={styles.stateText}>{loadState.message}</Text>
        <Pressable style={styles.buttonSecondary} onPress={goBack}>
          <Text style={styles.buttonSecondaryText}>Back to units</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <TopBar title={loadState.unit.title} showBack onBack={goBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <PathMap
          units={[loadState.unit]}
          lessons={loadState.lessons}
          progressMap={loadState.progressMap}
          onLessonPress={onLessonPress}
        />
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
});