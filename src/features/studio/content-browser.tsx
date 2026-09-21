import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useIsDesktop } from '@/src/hooks/useIsDesktop';
import { supabase } from '@/src/lib/supabase';
import { hoverStyle } from '@/src/lib/web-hover';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Exercise, Lesson, Level, Unit } from '@/src/types/content';

type LevelRow = Pick<Level, 'id' | 'title' | 'cefr_level' | 'is_published' | 'sort_order'>;
type UnitRow = Pick<Unit, 'id' | 'level_id' | 'title' | 'is_published' | 'sort_order'>;
type LessonRow = Pick<Lesson, 'id' | 'unit_id' | 'title' | 'is_published' | 'sort_order'>;
type ExerciseRow = Pick<
  Exercise,
  'id' | 'lesson_id' | 'type' | 'prompt' | 'is_required' | 'sort_order'
>;

type ContentState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      levels: LevelRow[];
      units: UnitRow[];
      lessons: LessonRow[];
      exercises: ExerciseRow[];
    };

function typeLabel(type: string): string {
  const words = type.split('_');
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function bySortOrder(a: { sort_order: number; title?: string | null }, b: { sort_order: number }) {
  return a.sort_order - b.sort_order;
}

export function StudioBrowser() {
  const isDesktop = useIsDesktop();
  const [state, setState] = useState<ContentState>({ status: 'loading' });
  const [unitId, setUnitId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [levelsRes, unitsRes, lessonsRes, exercisesRes] = await Promise.all([
        supabase.from('levels').select('id,title,cefr_level,is_published,sort_order').order('sort_order'),
        supabase.from('units').select('id,level_id,title,is_published,sort_order').order('sort_order'),
        supabase.from('lessons').select('id,unit_id,title,is_published,sort_order').order('sort_order'),
        supabase
          .from('exercises')
          .select('id,lesson_id,type,prompt,is_required,sort_order')
          .order('sort_order'),
      ]);
      if (!mounted) return;
      const error =
        levelsRes.error ?? unitsRes.error ?? lessonsRes.error ?? exercisesRes.error ?? null;
      if (error) {
        setState({ status: 'error', message: error.message });
        return;
      }
      setState({
        status: 'ready',
        levels: ((levelsRes.data ?? []) as LevelRow[]).slice().sort(bySortOrder),
        units: ((unitsRes.data ?? []) as UnitRow[]).slice().sort(bySortOrder),
        lessons: ((lessonsRes.data ?? []) as LessonRow[]).slice().sort(bySortOrder),
        exercises: ((exercisesRes.data ?? []) as ExerciseRow[]).slice().sort(bySortOrder),
      });
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (state.status !== 'ready' || !isDesktop) return;
    if (state.units.length === 0) return;
    const currentUnit =
      unitId && state.units.some((u) => u.id === unitId) ? unitId : state.units[0].id;
    if (currentUnit !== unitId) setUnitId(currentUnit);
    const unitLessons = state.lessons.filter((l) => l.unit_id === currentUnit);
    if (unitLessons.length === 0) {
      if (lessonId) setLessonId(null);
      return;
    }
    if (!lessonId || !unitLessons.some((l) => l.id === lessonId)) {
      setLessonId(unitLessons[0].id);
    }
  }, [state, unitId, lessonId, isDesktop]);

  if (state.status === 'loading') {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={colors.sky} />
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={styles.centerBox}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Could not load content</Text>
          <Text style={styles.errorMessage}>{state.message}</Text>
          <Text style={styles.errorHint}>
            If this looks like a permissions problem, run the Teacher Studio policies in
            Supabase (content_editors + the editor read/write policies).
          </Text>
        </View>
      </View>
    );
  }

  const { levels, units, lessons, exercises } = state;
  const activeUnit = units.find((u) => u.id === unitId) ?? null;
  const unitLessons = lessons.filter((l) => l.unit_id === activeUnit?.id);
  const activeLesson = unitLessons.find((l) => l.id === lessonId) ?? null;
  const lessonExercises = exercises.filter((e) => e.lesson_id === activeLesson?.id);

  const unitsPane = (
    <View style={[styles.pane, isDesktop && styles.paneFixed]}>
      <Text style={styles.paneTitle}>Units</Text>
      <ScrollView contentContainerStyle={styles.paneContent}>
        {levels.map((level) => {
          const levelUnits = units.filter((u) => u.level_id === level.id);
          if (levelUnits.length === 0) return null;
          return (
            <View key={level.id} style={styles.levelGroup}>
              <View style={styles.levelHeader}>
                <Text style={styles.levelTitle}>
                  {level.cefr_level ?? ''} {level.title}
                </Text>
                {!level.is_published && <Text style={styles.draftChip}>draft</Text>}
              </View>
              {levelUnits.map((unit) => {
                const count = lessons.filter((l) => l.unit_id === unit.id).length;
                const selected = unit.id === activeUnit?.id;
                return (
                  <Pressable
                    key={unit.id}
                    style={({ hovered }) => [
                      styles.rowCard,
                      selected && styles.rowCardSelected,
                      hoverStyle(hovered),
                    ]}
                    onPress={() => setUnitId(unit.id)}
                  >
                    <View style={styles.rowMain}>
                      <Text style={[styles.rowTitle, selected && styles.rowTitleSelected]}>
                        {unit.title}
                      </Text>
                      <Text style={styles.rowMeta}>{count} lessons</Text>
                    </View>
                    {!unit.is_published && <Text style={styles.draftChip}>draft</Text>}
                  </Pressable>
                );
              })}
            </View>
          );
        })}
        {units.length === 0 && <Text style={styles.emptyText}>No units yet.</Text>}
      </ScrollView>
    </View>
  );

  const lessonsPane = activeUnit ? (
    <View style={[styles.pane, isDesktop && styles.paneFixed]}>
      {!isDesktop && (
        <Pressable onPress={() => setUnitId(null)} hitSlop={8}>
          <Text style={styles.backLink}>‹ Units</Text>
        </Pressable>
      )}
      <Text style={styles.paneTitle} numberOfLines={1}>
        {activeUnit.title}
      </Text>
      <ScrollView contentContainerStyle={styles.paneContent}>
        {unitLessons.map((lesson) => {
          const count = exercises.filter((e) => e.lesson_id === lesson.id).length;
          const selected = lesson.id === activeLesson?.id;
          return (
            <Pressable
              key={lesson.id}
              style={({ hovered }) => [
                styles.rowCard,
                selected && styles.rowCardSelected,
                hoverStyle(hovered),
              ]}
              onPress={() => setLessonId(lesson.id)}
            >
              <View style={styles.rowMain}>
                <Text style={[styles.rowTitle, selected && styles.rowTitleSelected]}>
                  {lesson.title}
                </Text>
                <Text style={styles.rowMeta}>{count} exercises</Text>
              </View>
              {!lesson.is_published && <Text style={styles.draftChip}>draft</Text>}
            </Pressable>
          );
        })}
        {unitLessons.length === 0 && <Text style={styles.emptyText}>No lessons yet.</Text>}
      </ScrollView>
    </View>
  ) : null;

  const exercisesPane = activeLesson ? (
    <View style={[styles.pane, styles.paneWide]}>
      {!isDesktop && (
        <Pressable onPress={() => setLessonId(null)} hitSlop={8}>
          <Text style={styles.backLink}>‹ Lessons</Text>
        </Pressable>
      )}
      <Text style={styles.paneTitle} numberOfLines={1}>
        {activeLesson.title}
      </Text>
      <ScrollView contentContainerStyle={styles.paneContent}>
        {lessonExercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseRow}>
            <Text style={styles.exerciseIndex}>{exercise.sort_order}</Text>
            <View style={styles.rowMain}>
              <View style={styles.exerciseChips}>
                <Text style={styles.typeChip}>{typeLabel(exercise.type)}</Text>
                {exercise.is_required === false && (
                  <Text style={styles.optionalChip}>optional</Text>
                )}
              </View>
              <Text style={styles.exercisePrompt} numberOfLines={2}>
                {exercise.prompt}
              </Text>
            </View>
          </View>
        ))}
        {lessonExercises.length === 0 && <Text style={styles.emptyText}>No exercises yet.</Text>}
      </ScrollView>
    </View>
  ) : null;

  if (!isDesktop) {
    return (
      <View style={styles.browser}>
        {activeLesson ? exercisesPane : activeUnit ? lessonsPane : unitsPane}
      </View>
    );
  }

  return (
    <View style={styles.browserDesktop}>
      {unitsPane}
      {lessonsPane}
      {exercisesPane ?? (
        <View style={[styles.pane, styles.paneWide]}>
          <Text style={styles.emptyText}>Select a unit to see its lessons.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.coral,
    borderRadius: radius.card,
    padding: 20,
    gap: 8,
  },
  errorTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.coral,
  },
  errorMessage: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
  },
  errorHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
  },
  browser: {
    flex: 1,
  },
  browserDesktop: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  pane: {
    flex: 1,
    minWidth: 0,
  },
  paneFixed: {
    width: 300,
    flex: 0,
  },
  paneWide: {
    flex: 1,
  },
  paneTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 8,
    marginTop: 8,
  },
  paneContent: {
    gap: 8,
    paddingBottom: 24,
  },
  levelGroup: {
    gap: 8,
    marginBottom: 8,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  levelTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.ink,
    opacity: 0.8,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderBottomWidth: 3,
    borderBottomColor: colors.greyDark,
    borderRadius: 14,
    padding: 10,
  },
  rowCardSelected: {
    borderColor: colors.sky,
    borderBottomColor: colors.sky,
    backgroundColor: colors.skyTint,
  },
  rowMain: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  rowTitleSelected: {
    color: colors.sky,
  },
  rowMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
    marginTop: 2,
  },
  draftChip: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    color: colors.greyDark,
    borderWidth: 1,
    borderColor: colors.greyDark,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  backLink: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.sky,
    marginTop: 12,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderBottomWidth: 3,
    borderBottomColor: colors.greyDark,
    borderRadius: 14,
    padding: 10,
  },
  exerciseIndex: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.ink,
    opacity: 0.5,
    width: 24,
  },
  exerciseChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeChip: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    color: colors.sky,
    backgroundColor: colors.skyTint,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  optionalChip: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    color: colors.greyDark,
    borderWidth: 1,
    borderColor: colors.greyDark,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  exercisePrompt: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    marginTop: 4,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.6,
    paddingVertical: 12,
  },
});