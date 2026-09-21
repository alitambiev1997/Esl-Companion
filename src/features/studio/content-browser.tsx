import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExerciseEditor } from '@/src/features/studio/exercise-editor';
import {
  STARTER_TYPES,
  typeLabel,
  type ExerciseRow,
  type LessonRow,
  type LevelRow,
  type StarterType,
  type UnitRow,
} from '@/src/features/studio/types';
import { useIsDesktop } from '@/src/hooks/useIsDesktop';
import { supabase } from '@/src/lib/supabase';
import { hoverStyle } from '@/src/lib/web-hover';
import { colors, fonts, radius } from '@/src/theme/tokens';

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

type EditorState =
  | { mode: 'closed' }
  | { mode: 'picker' }
  | { mode: 'edit'; exercise: ExerciseRow | null; type: StarterType };

function bySortOrder(a: { sort_order: number }, b: { sort_order: number }) {
  return a.sort_order - b.sort_order;
}

export function StudioBrowser() {
  const isDesktop = useIsDesktop();
  const [state, setState] = useState<ContentState>({ status: 'loading' });
  const [unitId, setUnitId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>({ mode: 'closed' });

  const loadContent = useCallback(async (showLoading: boolean) => {
    if (showLoading) setState({ status: 'loading' });
    const [levelsRes, unitsRes, lessonsRes, exercisesRes] = await Promise.all([
      supabase.from('levels').select('id,title,cefr_level,is_published,sort_order').order('sort_order'),
      supabase.from('units').select('id,level_id,title,is_published,sort_order').order('sort_order'),
      supabase.from('lessons').select('id,unit_id,title,is_published,sort_order').order('sort_order'),
      supabase
        .from('exercises')
        .select('id,lesson_id,type,prompt,is_required,sort_order,content')
        .order('sort_order'),
    ]);
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
  }, []);

  useEffect(() => {
    loadContent(true);
  }, [loadContent]);

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
  const nextSortOrder = lessonExercises.length
    ? Math.max(...lessonExercises.map((e) => e.sort_order)) + 1
    : 1;

  const unitsPane = (
    <View style={[styles.pane, isDesktop ? styles.paneFixed : styles.paneWide]}>
      <Text style={styles.paneTitle}>Units</Text>
      <ScrollView style={styles.paneScroll} contentContainerStyle={styles.paneContent}>
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
                    onPress={() => {
                      setUnitId(unit.id);
                      setEditor({ mode: 'closed' });
                    }}
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
    <View style={[styles.pane, isDesktop ? styles.paneFixed : styles.paneWide]}>
      {!isDesktop && (
        <Pressable onPress={() => setUnitId(null)} hitSlop={8}>
          <Text style={styles.backLink}>‹ Units</Text>
        </Pressable>
      )}
      <Text style={styles.paneTitle} numberOfLines={1}>
        {activeUnit.title}
      </Text>
      <ScrollView style={styles.paneScroll} contentContainerStyle={styles.paneContent}>
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
              onPress={() => {
                setLessonId(lesson.id);
                setEditor({ mode: 'closed' });
              }}
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
      {editor.mode === 'closed' && (
        <>
          {!isDesktop && (
            <Pressable onPress={() => setLessonId(null)} hitSlop={8}>
              <Text style={styles.backLink}>‹ Lessons</Text>
            </Pressable>
          )}
          <View style={styles.paneHeaderRow}>
            <Text style={styles.paneTitle} numberOfLines={1}>
              {activeLesson.title}
            </Text>
            <Pressable
              style={({ hovered }) => [styles.newButton, hoverStyle(hovered)]}
              onPress={() => setEditor({ mode: 'picker' })}
            >
              <Text style={styles.newButtonText}>+ New exercise</Text>
            </Pressable>
          </View>
          <ScrollView style={styles.paneScroll} contentContainerStyle={styles.paneContent}>
            {lessonExercises.map((exercise) => (
              <Pressable
                key={exercise.id}
                style={({ hovered }) => [styles.exerciseRow, hoverStyle(hovered)]}
                onPress={() =>
                  setEditor({ mode: 'edit', exercise, type: exercise.type as StarterType })
                }
              >
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
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
            {lessonExercises.length === 0 && (
              <Text style={styles.emptyText}>No exercises yet.</Text>
            )}
          </ScrollView>
        </>
      )}

      {editor.mode === 'picker' && (
        <>
          <Pressable onPress={() => setEditor({ mode: 'closed' })} hitSlop={8}>
            <Text style={styles.backLink}>‹ Exercises</Text>
          </Pressable>
          <Text style={styles.paneTitle}>New exercise</Text>
          <ScrollView style={styles.paneScroll} contentContainerStyle={styles.paneContent}>
            <Text style={styles.emptyText}>Choose the exercise type</Text>
            {STARTER_TYPES.map((starter) => (
              <Pressable
                key={starter.type}
                style={({ hovered }) => [styles.rowCard, hoverStyle(hovered)]}
                onPress={() =>
                  setEditor({ mode: 'edit', exercise: null, type: starter.type })
                }
              >
                <View style={styles.rowMain}>
                  <Text style={styles.rowTitle}>{starter.label}</Text>
                  <Text style={styles.rowMeta}>{starter.hint}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
            <Text style={styles.pickerNote}>
              More types coming as the editor grows — the rest of the 21 land in the next
              ticket.
            </Text>
          </ScrollView>
        </>
      )}

      {editor.mode === 'edit' && (
        <ExerciseEditor
          lessonId={activeLesson.id}
          exercise={editor.exercise}
          type={editor.type}
          nextSortOrder={nextSortOrder}
          onSaved={() => {
            setEditor({ mode: 'closed' });
            loadContent(false);
          }}
          onCancel={() => setEditor({ mode: 'closed' })}
        />
      )}
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
          <Text style={styles.emptyText}>
            {!activeUnit
              ? 'Select a unit to see its lessons.'
              : unitLessons.length === 0
                ? 'This unit has no lessons yet.'
                : 'Select a lesson to see its exercises.'}
          </Text>
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
    minWidth: 0,
    flexShrink: 1,
  },
  paneFixed: {
    width: 300,
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
  },
  paneWide: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  paneScroll: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minHeight: 0,
  },
  paneTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 8,
    marginTop: 8,
    flexShrink: 1,
  },
  paneHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  newButton: {
    backgroundColor: colors.sun,
    borderRadius: radius.button,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  newButtonText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  chevron: {
    fontFamily: fonts.body,
    fontSize: 20,
    color: colors.greyDark,
    paddingHorizontal: 4,
  },
  pickerNote: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.5,
    marginTop: 8,
  },
  paneContent: {
    gap: 8,
    paddingBottom: 24,
    paddingRight: 10,
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