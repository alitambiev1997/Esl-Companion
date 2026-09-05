import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PathMap, type ProgressMap } from '@/src/components/PathMap';
import { TopBar } from '@/src/components/ui/TopBar';
import { CLASS_CODES, clearClassCode, getClassCode } from '@/src/lib/class-code';
import { supabase } from '@/src/lib/supabase';
import { clearWebProgress, readWebProgress } from '@/src/lib/web-progress';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Lesson, Unit } from '@/src/types/content';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty'; message: string }
  | { status: 'ready'; units: Unit[]; lessons: Lesson[]; progressMap: ProgressMap };

export default function WebCourse() {
  const router = useRouter();
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const loadStateRef = useRef(loadState);
  loadStateRef.current = loadState;

  const storedCode = getClassCode();
  const cefr = storedCode ? (CLASS_CODES[storedCode] ?? null) : null;

  const loadCourse = useCallback(() => {
    if (!cefr) {
      router.replace('/gate');
      return;
    }

    let mounted = true;
    if (loadStateRef.current.status !== 'ready') {
      setLoadState({ status: 'loading' });
    }

    (async () => {
      const levelQuery = supabase
        .from('levels')
        .select('id')
        .eq('cefr_level', cefr)
        .eq('is_published', true)
        .maybeSingle();

      const [levelRes, progressMap] = await Promise.all([
        levelQuery,
        Promise.resolve(readWebProgress()),
      ]);

      if (!mounted) return;

      if (levelRes.error) {
        setLoadState({ status: 'error', message: levelRes.error.message });
        return;
      }
      if (!levelRes.data) {
        setLoadState({ status: 'empty', message: 'This code is not linked to a course yet.' });
        return;
      }

      const unitsQuery = supabase
        .from('units')
        .select('*')
        .eq('level_id', levelRes.data.id)
        .eq('is_published', true)
        .order('sort_order');
      const lessonsQuery = supabase
        .from('lessons')
        .select('*')
        .eq('is_published', true)
        .order('sort_order');

      const [unitsRes, lessonsRes] = await Promise.all([unitsQuery, lessonsQuery]);

      if (!mounted) return;

      if (unitsRes.error || lessonsRes.error) {
        setLoadState({
          status: 'error',
          message: unitsRes.error?.message ?? lessonsRes.error?.message ?? 'Failed to load course',
        });
        return;
      }

      const units = unitsRes.data as Unit[];
      const lessons = lessonsRes.data as Lesson[];
      if (units.length === 0) {
        setLoadState({ status: 'empty', message: 'No units available yet.' });
        return;
      }

      const webProgress: ProgressMap = {};
      for (const [lessonId, entry] of Object.entries(progressMap)) {
        webProgress[lessonId] = { completed: entry.score >= 60, score: entry.score };
      }

      setLoadState({ status: 'ready', units, lessons, progressMap: webProgress });
    })();

    return () => {
      mounted = false;
    };
  }, [cefr, router]);

  useFocusEffect(
    useCallback(() => {
      loadCourse();
    }, [loadCourse])
  );

  const switchCode = () => {
    clearClassCode();
    clearWebProgress();
    router.replace('/gate');
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
        <Pressable style={styles.buttonSecondary} onPress={switchCode}>
          <Text style={styles.buttonSecondaryText}>Switch code</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <TopBar title="Your course" />
      <View style={styles.codeRow}>
        <Text style={styles.codeText}>code: {storedCode}</Text>
        <Pressable onPress={switchCode} hitSlop={8}>
          <Text style={styles.switchText}>switch code</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <PathMap
          units={loadState.units}
          lessons={loadState.lessons}
          progressMap={loadState.progressMap}
          onLessonPress={() => {}}
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
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 8,
  },
  codeText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.greyDark,
  },
  switchText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.sky,
    textDecorationLine: 'underline',
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