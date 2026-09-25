import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { isUngradedType } from '@/src/features/studio/draft';
import {
  importExample,
  importSummary,
  parseImportJson,
  type ImportResult,
} from '@/src/features/studio/import-model';
import { supabase } from '@/src/lib/supabase';
import { colors, fonts, radius } from '@/src/theme/tokens';

export function LessonImport({
  unitId,
  unitTitle,
  nextLessonSortOrder,
  onCreated,
  onCancel,
}: {
  unitId: string;
  unitTitle: string;
  nextLessonSortOrder: number;
  onCreated: (lessonId: string | null) => void;
  onCancel: () => void;
}) {
  const [raw, setRaw] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const validate = () => {
    setCreateError(null);
    setResult(parseImportJson(raw));
  };

  const create = async () => {
    if (!result || result.error || result.problems.length > 0 || result.lessons.length === 0) {
      return;
    }
    setCreating(true);
    setCreateError(null);
    let sortOrder = nextLessonSortOrder;
    let lastLessonId: string | null = null;

    for (const lesson of result.lessons) {
      const { data: existing } = await supabase
        .from('lessons')
        .select('id')
        .eq('unit_id', unitId)
        .eq('title', lesson.title)
        .maybeSingle();
      let lessonId = existing?.id ?? null;

      if (!lessonId) {
        const { data, error } = await supabase
          .from('lessons')
          .insert({
            unit_id: unitId,
            title: lesson.title,
            description: lesson.description,
            estimated_minutes: lesson.estimated_minutes,
            is_published: false,
            sort_order: sortOrder,
          })
          .select('id')
          .single();
        if (error) {
          setCreateError(error.message);
          setCreating(false);
          return;
        }
        lessonId = data.id;
        sortOrder += 1;
      }

      const { data: last } = await supabase
        .from('exercises')
        .select('sort_order')
        .eq('lesson_id', lessonId)
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle();
      let exerciseOrder = (last?.sort_order ?? 0) + 1;

      const rows = lesson.exercises.map((exercise) => ({
        lesson_id: lessonId,
        type: exercise.type,
        prompt: exercise.prompt.trim(),
        content: exercise.content,
        points: 10,
        is_required: exercise.is_required ?? !isUngradedType(exercise.type),
        sort_order: exerciseOrder++,
      }));
      const { error } = await supabase.from('exercises').insert(rows);
      if (error) {
        setCreateError(error.message);
        setCreating(false);
        return;
      }
      lastLessonId = lessonId;
    }

    setCreating(false);
    onCreated(lastLessonId);
  };

  const ready =
    result !== null &&
    result.error === null &&
    result.problems.length === 0 &&
    result.lessons.length > 0;

  return (
    <View style={[styles.pane, styles.paneWide]}>
      <Pressable onPress={onCancel} hitSlop={8}>
        <Text style={styles.backLink}>‹ {unitTitle}</Text>
      </Pressable>
      <Text style={styles.title}>Import JSON</Text>
      <Text style={styles.hint}>
        Paste one lesson object or an array of lessons from the content AI. Target unit:{' '}
        {unitTitle}. Existing lessons with the same title get the exercises appended; new lessons
        are created as drafts.
      </Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <TextInput
          style={styles.textarea}
          value={raw}
          onChangeText={(text) => {
            setRaw(text);
            setResult(null);
            setCreateError(null);
          }}
          multiline
          placeholder={'{ "title": "...", "exercises": [ ... ] }'}
          placeholderTextColor={colors.greyDark}
        />

        <View style={styles.actions}>
          <Pressable
            style={[styles.secondaryButton, !raw.trim() && styles.buttonDisabled]}
            onPress={validate}
            disabled={!raw.trim()}
          >
            <Text style={styles.secondaryButtonText}>Validate</Text>
          </Pressable>
          <Pressable style={styles.ghostButton} onPress={() => setRaw(importExample())}>
            <Text style={styles.ghostButtonText}>Paste example</Text>
          </Pressable>
          {ready && (
            <Pressable
              style={[styles.primaryButton, creating && styles.buttonDisabled]}
              onPress={create}
              disabled={creating}
            >
              <Text style={styles.primaryButtonText}>
                {creating ? 'Creating...' : `Create ${result.lessons.length > 1 ? 'lessons' : 'lesson'}`}
              </Text>
            </Pressable>
          )}
        </View>

        {result?.error && <Text style={styles.errorText}>{result.error}</Text>}
        {result !== null && result.error === null && (
          <>
            {result.problems.length > 0 && (
              <View style={styles.problemCard}>
                <Text style={styles.problemTitle}>
                  {result.problems.length} problem{result.problems.length === 1 ? '' : 's'} — fix
                  them before creating
                </Text>
                {result.problems.map((problem, i) => (
                  <Text key={i} style={styles.problemText}>
                    • {problem}
                  </Text>
                ))}
              </View>
            )}
            {result.problems.length === 0 && result.lessons.length > 0 && (
              <View style={styles.okCard}>
                <Text style={styles.okTitle}>{importSummary(result.lessons)}</Text>
                {result.lessons.map((lesson, i) => (
                  <Text key={i} style={styles.okText}>
                    {lesson.title} — {lesson.exercises.length} exercises (
                    {Array.from(new Set(lesson.exercises.map((e) => e.type))).length} types)
                  </Text>
                ))}
              </View>
            )}
          </>
        )}
        {createError && <Text style={styles.errorText}>{createError}</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pane: {
    minWidth: 0,
    flexShrink: 1,
  },
  paneWide: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  backLink: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.sky,
    marginTop: 12,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
    marginTop: 8,
    marginBottom: 6,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
    marginBottom: 10,
  },
  scroll: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minHeight: 0,
  },
  content: {
    gap: 12,
    paddingBottom: 24,
    paddingRight: 10,
  },
  textarea: {
    minHeight: 220,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    fontFamily: fonts.body,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: colors.sun,
    borderRadius: radius.button,
    paddingVertical: 10,
    minHeight: 42,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  secondaryButton: {
    backgroundColor: colors.skyTint,
    borderRadius: radius.button,
    paddingVertical: 10,
    minHeight: 42,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.sky,
  },
  ghostButton: {
    borderRadius: radius.button,
    paddingVertical: 10,
    minHeight: 42,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    opacity: 0.55,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  problemCard: {
    backgroundColor: colors.coralTint,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  problemTitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.coral,
    marginBottom: 2,
  },
  problemText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
  },
  okCard: {
    backgroundColor: colors.leafTint,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  okTitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.leaf,
    marginBottom: 2,
  },
  okText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.8,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.coral,
  },
});