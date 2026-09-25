import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ExerciseEditor } from '@/src/features/studio/exercise-editor';
import { LessonImport } from '@/src/features/studio/lesson-import';
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
  | { mode: 'edit'; exercise: ExerciseRow | null; type: StarterType }
  | { mode: 'unsupported'; exercise: ExerciseRow };

const STARTER_TYPE_NAMES = STARTER_TYPES.map((t) => t.type);

function bySortOrder(a: { sort_order: number }, b: { sort_order: number }) {
  return a.sort_order - b.sort_order;
}

export function StudioBrowser() {
  const isDesktop = useIsDesktop();
  const [state, setState] = useState<ContentState>({ status: 'loading' });
  const [unitId, setUnitId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>({ mode: 'closed' });
  const [newUnitOpen, setNewUnitOpen] = useState(false);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [newUnitLevelId, setNewUnitLevelId] = useState<string | null>(null);
  const [newLessonOpen, setNewLessonOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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

  const errorHint = (message: string) =>
    message.includes('row-level security') || message.includes('permission')
      ? `${message} — run the Teacher Studio write policies in Supabase.`
      : message;

  const openNewUnit = () => {
    setNewUnitOpen(true);
    setNewUnitTitle('');
    setActionError(null);
    setNewUnitLevelId(activeUnit?.level_id ?? levels[0]?.id ?? null);
  };

  const createUnit = async () => {
    const title = newUnitTitle.trim();
    const levelId = newUnitLevelId ?? activeUnit?.level_id ?? levels[0]?.id ?? null;
    if (!title || !levelId || busy) return;
    setBusy(true);
    setActionError(null);
    const sortOrder =
      units
        .filter((u) => u.level_id === levelId)
        .reduce((max, u) => Math.max(max, u.sort_order), 0) + 1;
    const { data, error } = await supabase
      .from('units')
      .insert({ level_id: levelId, title, is_published: false, sort_order: sortOrder })
      .select('id')
      .single();
    setBusy(false);
    if (error) {
      setActionError(errorHint(error.message));
      return;
    }
    setNewUnitOpen(false);
    setNewUnitTitle('');
    await loadContent(false);
    if (data?.id) {
      setUnitId(data.id);
      setLessonId(null);
    }
  };

  const toggleUnitPublished = async (unit: UnitRow) => {
    if (busy) return;
    const next = !unit.is_published;
    let publishLessons = false;
    if (next) {
      const draftCount = lessons.filter((l) => l.unit_id === unit.id && !l.is_published).length;
      if (draftCount > 0) {
        publishLessons = window.confirm(
          `Publish this unit and its ${draftCount} draft lesson(s)? Students will see them immediately.`
        );
      }
    }
    setBusy(true);
    setActionError(null);
    const { error } = await supabase
      .from('units')
      .update({ is_published: next })
      .eq('id', unit.id);
    if (!error && next && publishLessons) {
      const draftIds = lessons
        .filter((l) => l.unit_id === unit.id && !l.is_published)
        .map((l) => l.id);
      if (draftIds.length > 0) {
        await supabase.from('lessons').update({ is_published: true }).in('id', draftIds);
      }
    }
    setBusy(false);
    if (error) {
      setActionError(errorHint(error.message));
      return;
    }
    loadContent(false);
  };

  const toggleLessonPublished = async (lesson: LessonRow) => {
    if (busy) return;
    const next = !lesson.is_published;
    let publishUnit = false;
    if (next && activeUnit && !activeUnit.is_published) {
      publishUnit = window.confirm(
        'This lesson belongs to a draft unit, so students cannot see it yet. Publish the unit too?'
      );
    }
    setBusy(true);
    setActionError(null);
    const { error } = await supabase
      .from('lessons')
      .update({ is_published: next })
      .eq('id', lesson.id);
    if (!error && publishUnit && activeUnit) {
      await supabase.from('units').update({ is_published: true }).eq('id', activeUnit.id);
    }
    setBusy(false);
    if (error) {
      setActionError(errorHint(error.message));
      return;
    }
    loadContent(false);
  };

  const deleteUnit = async (unit: UnitRow) => {
    if (busy) return;
    const lessonCount = lessons.filter((l) => l.unit_id === unit.id).length;
    if (
      !window.confirm(
        `Delete "${unit.title}" and its ${lessonCount} lesson(s)? Their exercises and student progress for them are removed too. This cannot be undone.`
      )
    ) {
      return;
    }
    setBusy(true);
    setActionError(null);
    const { error } = await supabase.from('units').delete().eq('id', unit.id);
    setBusy(false);
    if (error) {
      setActionError(errorHint(error.message));
      return;
    }
    if (unitId === unit.id) {
      setUnitId(null);
      setLessonId(null);
      setEditor({ mode: 'closed' });
    }
    loadContent(false);
  };

  const openNewLesson = () => {
    setNewLessonOpen(true);
    setNewLessonTitle('');
    setActionError(null);
  };

  const createLesson = async () => {
    if (!activeUnit || busy) return;
    const title = newLessonTitle.trim();
    if (!title) return;
    setBusy(true);
    setActionError(null);
    const sortOrder =
      lessons
        .filter((l) => l.unit_id === activeUnit.id)
        .reduce((max, l) => Math.max(max, l.sort_order), 0) + 1;
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        unit_id: activeUnit.id,
        title,
        is_published: false,
        sort_order: sortOrder,
      })
      .select('id')
      .single();
    setBusy(false);
    if (error) {
      setActionError(errorHint(error.message));
      return;
    }
    setNewLessonOpen(false);
    setNewLessonTitle('');
    await loadContent(false);
    if (data?.id) {
      setLessonId(data.id);
      setEditor({ mode: 'closed' });
    }
  };

  const deleteLesson = async (lesson: LessonRow) => {
    if (busy) return;
    const exerciseCount = exercises.filter((e) => e.lesson_id === lesson.id).length;
    if (
      !window.confirm(
        `Delete "${lesson.title}" and its ${exerciseCount} exercise(s)? This cannot be undone.`
      )
    ) {
      return;
    }
    setBusy(true);
    setActionError(null);
    const { error } = await supabase.from('lessons').delete().eq('id', lesson.id);
    setBusy(false);
    if (error) {
      setActionError(errorHint(error.message));
      return;
    }
    if (lessonId === lesson.id) {
      setLessonId(null);
      setEditor({ mode: 'closed' });
    }
    loadContent(false);
  };

  const unitsPane = (
    <View style={[styles.pane, isDesktop ? styles.paneFixed : styles.paneWide]}>
      <View style={styles.paneHeaderRow}>
        <Text style={styles.paneTitle}>Units</Text>
        <Pressable
          style={({ hovered }) => [styles.newButton, hoverStyle(hovered)]}
          onPress={openNewUnit}
        >
          <Text style={styles.newButtonText}>+ New unit</Text>
        </Pressable>
      </View>
      {newUnitOpen && (
        <View style={styles.newCard}>
          <TextInput
            style={styles.newInput}
            value={newUnitTitle}
            onChangeText={setNewUnitTitle}
            placeholder="Unit title"
            placeholderTextColor={colors.greyDark}
            autoFocus
          />
          <View style={styles.levelChipRow}>
            {levels.map((level) => {
              const on = newUnitLevelId === level.id;
              return (
                <Pressable
                  key={level.id}
                  style={[styles.levelPickChip, on && styles.levelPickChipOn]}
                  onPress={() => setNewUnitLevelId(level.id)}
                >
                  <Text style={[styles.levelPickText, on && styles.levelPickTextOn]}>
                    {level.cefr_level ?? level.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.newActions}>
            <Pressable
              style={[styles.createButton, (busy || !newUnitTitle.trim()) && styles.buttonDisabled]}
              onPress={createUnit}
              disabled={busy || !newUnitTitle.trim()}
            >
              <Text style={styles.createButtonText}>{busy ? 'Creating...' : 'Create unit'}</Text>
            </Pressable>
            <Pressable onPress={() => setNewUnitOpen(false)} hitSlop={8}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}
      {actionError && <Text style={styles.errorText}>{actionError}</Text>}
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
                  <View key={unit.id} style={styles.rowWrap}>
                    <Pressable
                      style={({ hovered }) => [
                        styles.rowCard,
                        styles.rowCardFlex,
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
                      <Pressable
                        style={[
                          styles.publishChip,
                          unit.is_published ? styles.publishChipLive : styles.publishChipDraft,
                        ]}
                        onPress={() => toggleUnitPublished(unit)}
                      >
                        <Text
                          style={[
                            styles.publishChipText,
                            unit.is_published && styles.publishChipTextLive,
                          ]}
                        >
                          {unit.is_published ? 'live' : 'draft'}
                        </Text>
                      </Pressable>
                    </Pressable>
                    <Pressable
                      style={styles.rowDelete}
                      onPress={() => deleteUnit(unit)}
                      hitSlop={6}
                    >
                      <Text style={styles.rowDeleteText}>×</Text>
                    </Pressable>
                  </View>
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
      <View style={styles.paneHeaderRow}>
        <Text style={styles.paneTitle} numberOfLines={1}>
          {activeUnit.title}
        </Text>
        <Pressable
          style={({ hovered }) => [styles.newButton, hoverStyle(hovered)]}
          onPress={openNewLesson}
        >
          <Text style={styles.newButtonText}>+ New lesson</Text>
        </Pressable>
        <Pressable
          style={({ hovered }) => [styles.importButton, hoverStyle(hovered)]}
          onPress={() => {
            setImportOpen(true);
            setEditor({ mode: 'closed' });
          }}
        >
          <Text style={styles.importButtonText}>JSON</Text>
        </Pressable>
      </View>
      {newLessonOpen && (
        <View style={styles.newCard}>
          <TextInput
            style={styles.newInput}
            value={newLessonTitle}
            onChangeText={setNewLessonTitle}
            placeholder="Lesson title"
            placeholderTextColor={colors.greyDark}
            autoFocus
          />
          <View style={styles.newActions}>
            <Pressable
              style={[
                styles.createButton,
                (busy || !newLessonTitle.trim()) && styles.buttonDisabled,
              ]}
              onPress={createLesson}
              disabled={busy || !newLessonTitle.trim()}
            >
              <Text style={styles.createButtonText}>
                {busy ? 'Creating...' : 'Create lesson'}
              </Text>
            </Pressable>
            <Pressable onPress={() => setNewLessonOpen(false)} hitSlop={8}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}
      <ScrollView style={styles.paneScroll} contentContainerStyle={styles.paneContent}>
        {unitLessons.map((lesson) => {
          const count = exercises.filter((e) => e.lesson_id === lesson.id).length;
          const selected = lesson.id === activeLesson?.id;
          return (
            <View key={lesson.id} style={styles.rowWrap}>
              <Pressable
                style={({ hovered }) => [
                  styles.rowCard,
                  styles.rowCardFlex,
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
                <Pressable
                  style={[
                    styles.publishChip,
                    lesson.is_published ? styles.publishChipLive : styles.publishChipDraft,
                  ]}
                  onPress={() => toggleLessonPublished(lesson)}
                >
                  <Text
                    style={[
                      styles.publishChipText,
                      lesson.is_published && styles.publishChipTextLive,
                    ]}
                  >
                    {lesson.is_published ? 'live' : 'draft'}
                  </Text>
                </Pressable>
              </Pressable>
              <Pressable
                style={styles.rowDelete}
                onPress={() => deleteLesson(lesson)}
                hitSlop={6}
              >
                <Text style={styles.rowDeleteText}>×</Text>
              </Pressable>
            </View>
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
            {lessonExercises.map((exercise) => {
              const editable = STARTER_TYPE_NAMES.includes(exercise.type as StarterType);
              return (
                <Pressable
                  key={exercise.id}
                  style={({ hovered }) => [styles.exerciseRow, hoverStyle(hovered)]}
                  onPress={() =>
                    editable
                      ? setEditor({ mode: 'edit', exercise, type: exercise.type as StarterType })
                      : setEditor({ mode: 'unsupported', exercise })
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
                  {editable ? (
                    <Text style={styles.chevron}>›</Text>
                  ) : (
                    <Text style={styles.soonText}>view</Text>
                  )}
                </Pressable>
              );
            })}
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
              All 21 exercise types are ready to use.
            </Text>
          </ScrollView>
        </>
      )}

      {editor.mode === 'unsupported' && (
        <>
          <Pressable onPress={() => setEditor({ mode: 'closed' })} hitSlop={8}>
            <Text style={styles.backLink}>‹ Exercises</Text>
          </Pressable>
          <View style={styles.headerRow}>
            <Text style={styles.paneTitle}>Exercise preview</Text>
            <Text style={styles.typeChip}>{typeLabel(editor.exercise.type)}</Text>
          </View>
          <ScrollView style={styles.paneScroll} contentContainerStyle={styles.paneContent}>
            <Text style={styles.previewNote}>
              Editing {typeLabel(editor.exercise.type)} exercises arrives in the next studio
              update. Here is the saved content for now:
            </Text>
            <View style={styles.jsonCard}>
              <Text style={styles.jsonText}>
                {JSON.stringify(editor.exercise.content ?? {}, null, 2)}
              </Text>
            </View>
          </ScrollView>
        </>
      )}

      {editor.mode === 'edit' && (
        <ExerciseEditor
          lessonId={activeLesson.id}
          lessonTitle={activeLesson.title}
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
      {editor.mode !== 'edit' && unitsPane}
      {editor.mode !== 'edit' && lessonsPane}
      {importOpen && activeUnit ? (
        <LessonImport
          unitId={activeUnit.id}
          unitTitle={activeUnit.title}
          nextLessonSortOrder={
            lessons
              .filter((l) => l.unit_id === activeUnit.id)
              .reduce((max, l) => Math.max(max, l.sort_order), 0) + 1
          }
          onCreated={(createdLessonId) => {
            setImportOpen(false);
            loadContent(false);
            if (createdLessonId) {
              setLessonId(createdLessonId);
              setEditor({ mode: 'closed' });
            }
          }}
          onCancel={() => setImportOpen(false)}
        />
      ) : (
        exercisesPane ?? (
          <View style={[styles.pane, styles.paneWide]}>
            <Text style={styles.emptyText}>
              {!activeUnit
                ? 'Select a unit to see its lessons.'
                : unitLessons.length === 0
                  ? 'This unit has no lessons yet.'
                  : 'Select a lesson to see its exercises.'}
            </Text>
          </View>
        )
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
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowCardFlex: {
    flex: 1,
    minWidth: 0,
  },
  rowDelete: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowDeleteText: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.greyDark,
  },
  newCard: {
    borderWidth: 2,
    borderColor: colors.sky,
    borderRadius: 14,
    backgroundColor: colors.white,
    padding: 10,
    gap: 8,
    marginBottom: 8,
  },
  newInput: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: 10,
    minHeight: 38,
    paddingHorizontal: 10,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.ink,
  },
  levelChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  levelPickChip: {
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
  },
  levelPickChipOn: {
    borderColor: colors.sky,
    backgroundColor: colors.skyTint,
  },
  levelPickText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
    opacity: 0.6,
  },
  levelPickTextOn: {
    color: colors.sky,
    opacity: 1,
  },
  newActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  createButton: {
    backgroundColor: colors.sun,
    borderRadius: radius.button,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  cancelText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    opacity: 0.6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.coral,
    marginBottom: 6,
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
  importButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.sky,
    borderRadius: radius.button,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  importButtonText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: colors.sky,
  },
  chevron: {
    fontFamily: fonts.body,
    fontSize: 20,
    color: colors.greyDark,
    paddingHorizontal: 4,
  },
  soonText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.greyDark,
    paddingHorizontal: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  previewNote: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
  },
  jsonCard: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: 12,
    padding: 12,
  },
  jsonText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
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
  publishChip: {
    borderRadius: 10,
    borderWidth: 2,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  publishChipDraft: {
    borderColor: colors.greyDark,
    backgroundColor: colors.white,
  },
  publishChipLive: {
    borderColor: colors.leaf,
    backgroundColor: colors.leafTint,
  },
  publishChipText: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    color: colors.greyDark,
  },
  publishChipTextLive: {
    color: colors.leaf,
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