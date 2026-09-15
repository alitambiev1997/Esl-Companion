import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TopBar } from '@/src/components/ui/title-bar';
import { useIsDesktop } from '@/src/hooks/useIsDesktop';
import { clearClassCode, getClassCode, getClassLevelId } from '@/src/lib/class-code';
import { supabase } from '@/src/lib/supabase';
import { readWebProgress } from '@/src/lib/web-progress';
import { hoverStyle } from '@/src/lib/web-hover';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Lesson, Level, Unit } from '@/src/types/content';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty'; message: string }
  | {
      status: 'ready';
      level: Level;
      units: Unit[];
      lessons: Lesson[];
      progressMap: Record<string, boolean>;
    };

export default function CourseWeb() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const loadStateRef = useRef(loadState);
  loadStateRef.current = loadState;
  const storedCode = getClassCode();
  const levelId = getClassLevelId();

  const loadCourse = useCallback(() => {
    if (!storedCode || !levelId) {
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
        .select('*')
        .eq('id', levelId)
        .eq('is_published', true)
        .maybeSingle();
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

      const [levelRes, unitsRes, lessonsRes, progress] = await Promise.all([
        levelQuery,
        unitsQuery,
        lessonsQuery,
        Promise.resolve(readWebProgress(storedCode)),
      ]);

      if (!mounted) return;

      if (levelRes.error || unitsRes.error || lessonsRes.error) {
        setLoadState({
          status: 'error',
          message:
            levelRes.error?.message ??
            unitsRes.error?.message ??
            lessonsRes.error?.message ??
            'Failed to load course',
        });
        return;
      }
      if (!levelRes.data) {
        setLoadState({ status: 'empty', message: 'This code is not linked to a course yet.' });
        return;
      }

      const units = unitsRes.data as Unit[];
      if (units.length === 0) {
        setLoadState({ status: 'empty', message: 'No units available yet.' });
        return;
      }

      const progressMap: Record<string, boolean> = {};
      for (const [lessonId, entry] of Object.entries(progress)) {
        progressMap[lessonId] = entry.score >= 60;
      }

      setLoadState({
        status: 'ready',
        level: levelRes.data as Level,
        units,
        lessons: lessonsRes.data as Lesson[],
        progressMap,
      });
    })();

    return () => {
      mounted = false;
    };
  }, [storedCode, levelId, router]);

  useFocusEffect(
    useCallback(() => {
      loadCourse();
    }, [loadCourse])
  );

  const switchCode = () => {
    clearClassCode();
    router.replace('/gate');
  };

  const onUnitPress = (unit: Unit) => {
    router.push({ pathname: '/unit/[id]', params: { id: unit.id } });
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

  const { level, units, lessons, progressMap } = loadState;

  return (
    <View style={styles.screen}>
      <TopBar
        title={`${level.cefr_level ?? ''} ${level.title ?? ''}`.trim()}
        right={
          <Pressable onPress={switchCode} hitSlop={8}>
            <Text style={styles.switchText}>switch code</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
          {units.map((unit) => {
            const unitLessons = lessons.filter((lesson) => lesson.unit_id === unit.id);
            const done = unitLessons.filter((lesson) => progressMap[lesson.id]).length;
            const total = unitLessons.length;
            const complete = total > 0 && done === total;
            return (
              <Pressable
                key={unit.id}
                style={({ hovered }) => [
                  styles.unitCard,
                  isDesktop && styles.unitCardDesktop,
                  hoverStyle(hovered),
                ]}
                onPress={() => onUnitPress(unit)}
              >
                <View style={styles.unitTexts}>
                  <Text style={styles.unitTitle}>{unit.title}</Text>
                  {unit.description && (
                    <Text style={styles.unitDescription} numberOfLines={2}>
                      {unit.description}
                    </Text>
                  )}
                </View>
                <View style={styles.unitRight}>
                  <View style={[styles.chip, complete && styles.chipDone]}>
                    <Text style={[styles.chipText, complete && styles.chipTextDone]}>
                      {done}/{total}
                    </Text>
                  </View>
                  {complete && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.leaf} />
                  )}
                  <Ionicons name="chevron-forward" size={18} color={colors.greyDark} />
                </View>
              </Pressable>
            );
          })}
        </View>
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
    padding: 16,
    paddingBottom: 48,
  },
  grid: {
    gap: 12,
  },
  gridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  switchText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.sky,
    textDecorationLine: 'underline',
  },
  unitCard: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderBottomWidth: 4,
    borderBottomColor: colors.greyDark,
    borderRadius: radius.card,
    padding: 16,
    gap: 12,
  },
  unitCardDesktop: {
    width: '48%',
    flexGrow: 1,
  },
  unitTexts: {
    flex: 1,
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
    marginTop: 2,
  },
  unitRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.skyTint,
    borderRadius: radius.bubble,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  chipDone: {
    backgroundColor: colors.leafTint,
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.sky,
  },
  chipTextDone: {
    color: colors.leaf,
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