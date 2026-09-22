import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  strField,
  storedPrompt,
  supportsExplanation,
  type Content,
} from '@/src/features/studio/content-model';
import { draftFromExercise, finalizeContent, isDraftEmpty, newDraft, validateDraft, type Draft } from '@/src/features/studio/draft';
import { ExercisePreview } from '@/src/features/studio/exercise-preview';
import { TextField } from '@/src/features/studio/fields';
import { TypeForm } from '@/src/features/studio/forms';
import type { ExerciseRow, StarterType } from '@/src/features/studio/types';
import { typeLabel } from '@/src/features/studio/types';
import { supabase } from '@/src/lib/supabase';
import { hoverStyle } from '@/src/lib/web-hover';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Exercise } from '@/src/types/content';

function buildSql(draft: Draft, lessonId: string, exerciseId: string | null): string {
  const escape = (text: string) => text.replace(/'/g, "''");
  const content = escape(JSON.stringify(finalizeContent(draft)));
  const prompt = escape(storedPrompt(draft.type, draft.prompt, draft.content));
  if (exerciseId) {
    return [
      'update public.exercises',
      `set type = '${draft.type}',`,
      `    prompt = '${prompt}',`,
      `    content = '${content}'::jsonb,`,
      `    is_required = ${draft.isRequired},`,
      `    sort_order = ${draft.sortOrder}`,
      `where id = '${exerciseId}';`,
    ].join('\n');
  }
  return [
    'insert into public.exercises (lesson_id, type, prompt, content, is_required, sort_order)',
    'values (',
    `  '${lessonId}',`,
    `  '${draft.type}',`,
    `  '${prompt}',`,
    `  '${content}'::jsonb,`,
    `  ${draft.isRequired},`,
    `  ${draft.sortOrder}`,
    ');',
  ].join('\n');
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy copy
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export function ExerciseEditor({
  lessonId,
  lessonTitle,
  exercise,
  type,
  nextSortOrder,
  onSaved,
  onCancel,
}: {
  lessonId: string;
  lessonTitle: string;
  exercise: ExerciseRow | null;
  type: StarterType;
  nextSortOrder: number;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(() =>
    exercise ? draftFromExercise(exercise) : newDraft(type, nextSortOrder)
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const update = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }));
  const patchContent = (next: Content) =>
    setDraft((current) => ({ ...current, content: { ...current.content, ...next } }));

  const save = async () => {
    const problems = validateDraft(draft);
    setErrors(problems);
    if (problems.length > 0) return;
    setSaving(true);
    setSaveError(null);
    const payload = {
      lesson_id: lessonId,
      type: draft.type,
      prompt: storedPrompt(draft.type, draft.prompt, draft.content),
      content: finalizeContent(draft),
      is_required: draft.isRequired,
      sort_order: draft.sortOrder,
    };
    const { error } = exercise
      ? await supabase.from('exercises').update(payload).eq('id', exercise.id)
      : await supabase.from('exercises').insert(payload);
    setSaving(false);
    if (error) {
      const hint =
        error.message.includes('row-level security') || error.message.includes('permission')
          ? ' — run the Teacher Studio write policies in Supabase.'
          : '';
      setSaveError(error.message + hint);
      return;
    }
    onSaved();
  };

  const remove = async () => {
    if (!exercise) return;
    if (!window.confirm('Delete this exercise?')) return;
    setSaving(true);
    setSaveError(null);
    const { error } = await supabase.from('exercises').delete().eq('id', exercise.id);
    setSaving(false);
    if (error) {
      setSaveError(error.message);
      return;
    }
    onSaved();
  };

  const copySql = async () => {
    const sql = buildSql(draft, lessonId, exercise?.id ?? null);
    const ok = await writeClipboard(sql);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setSaveError('Could not copy to clipboard.');
    }
  };

  const previewExercise: Exercise = {
    id: exercise?.id ?? 'preview',
    lesson_id: lessonId,
    type: draft.type,
    prompt: storedPrompt(draft.type, draft.prompt, draft.content),
    content: finalizeContent(draft),
    is_required: draft.isRequired,
    sort_order: draft.sortOrder,
    created_at: '',
  };
  const previewEmpty = isDraftEmpty(draft);

  const promptField = () => {
    if (draft.type === 'listening_word_order') return null;
    if (draft.type === 'image_choice') {
      return (
        <TextField
          label="Question under the picture"
          hint="Shown beneath the image, e.g. What is this?"
          value={draft.prompt}
          onChangeText={(text) => update({ prompt: text })}
          placeholder="What is this?"
        />
      );
    }
    if (draft.type === 'fill_blank') {
      return (
        <TextField
          label="Sentence (with a gap)"
          hint="Put ___ exactly where the blank goes, e.g. I like to eat ___ and bananas."
          value={draft.prompt}
          onChangeText={(text) => update({ prompt: text })}
          placeholder="I like to eat ___ and bananas."
        />
      );
    }
    return (
      <TextField
        label="Prompt"
        hint="The task line shown above the exercise"
        value={draft.prompt}
        onChangeText={(text) => update({ prompt: text })}
        placeholder="Choose the correct sentence."
      />
    );
  };

  return (
    <View style={styles.editor}>
      <Pressable onPress={onCancel} hitSlop={8}>
        <Text style={styles.backLink}>‹ {lessonTitle}</Text>
      </Pressable>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{exercise ? 'Edit exercise' : 'New exercise'}</Text>
        <Text style={styles.typeChip}>{typeLabel(draft.type)}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.formColumn}>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.form}>
            {promptField()}

            <TypeForm type={draft.type} content={draft.content} patch={patchContent} />

            {supportsExplanation(draft.type) && (
              <TextField
                label="Explanation"
                hint="Shown after answering (optional)"
                value={strField(draft.content.explanation)}
                onChangeText={(text) => patchContent({ explanation: text })}
                placeholder="Use 'would like to' + verb for polite requests."
                multiline
              />
            )}

            <View style={styles.metaRow}>
              <Pressable
                style={[styles.toggle, draft.isRequired && styles.toggleOn]}
                onPress={() => update({ isRequired: !draft.isRequired })}
              >
                <Text style={[styles.toggleText, draft.isRequired && styles.toggleTextOn]}>
                  {draft.isRequired ? 'Counts toward score' : 'Practice only (ungraded)'}
                </Text>
              </Pressable>
              <View style={styles.sortRow}>
                <Text style={styles.sortLabel}>Order</Text>
                <TextInput
                  style={styles.sortInput}
                  value={String(draft.sortOrder)}
                  onChangeText={(text) => {
                    const parsed = parseInt(text.replace(/[^0-9]/g, ''), 10);
                    update({ sortOrder: Number.isNaN(parsed) ? 0 : parsed });
                  }}
                />
              </View>
            </View>

            {errors.map((message, i) => (
              <Text key={i} style={styles.errorText}>
                {message}
              </Text>
            ))}
            {saveError && <Text style={styles.errorText}>{saveError}</Text>}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={({ hovered }) => [
                styles.primaryButton,
                saving && styles.buttonDisabled,
                hoverStyle(hovered),
              ]}
              onPress={save}
              disabled={saving}
            >
              <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
            </Pressable>
            <Pressable
              style={({ hovered }) => [styles.secondaryButton, hoverStyle(hovered)]}
              onPress={copySql}
            >
              <Text style={styles.secondaryButtonText}>{copied ? 'Copied!' : 'Copy SQL'}</Text>
            </Pressable>
            {exercise && (
              <Pressable
                style={({ hovered }) => [styles.dangerButton, hoverStyle(hovered)]}
                onPress={remove}
                disabled={saving}
              >
                <Text style={styles.dangerButtonText}>Delete</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.previewColumn}>
          <Text style={styles.previewTitle}>Student preview</Text>
          <ScrollView style={styles.previewScroll} contentContainerStyle={styles.previewContent}>
            {previewEmpty ? (
              <Text style={styles.previewHint}>
                Start filling the form - the preview updates live.
              </Text>
            ) : (
              <ExercisePreview exercise={previewExercise} />
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  editor: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minHeight: 0,
  },
  backLink: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.sky,
    marginTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
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
  body: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minHeight: 0,
    flexDirection: 'row',
    gap: 16,
  },
  formColumn: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    minHeight: 0,
  },
  scroll: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minHeight: 0,
  },
  form: {
    gap: 14,
    paddingBottom: 16,
    paddingRight: 10,
  },
  previewColumn: {
    width: 380,
    borderLeftWidth: 2,
    borderLeftColor: colors.grey,
    paddingLeft: 16,
  },
  previewTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 8,
  },
  previewScroll: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minHeight: 0,
  },
  previewContent: {
    paddingBottom: 24,
    paddingRight: 8,
  },
  previewHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggle: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  toggleOn: {
    borderColor: colors.leaf,
    backgroundColor: colors.leafTint,
  },
  toggleText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    opacity: 0.6,
  },
  toggleTextOn: {
    color: colors.ink,
    opacity: 1,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
  },
  sortInput: {
    width: 56,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: 10,
    minHeight: 36,
    paddingHorizontal: 8,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.ink,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.coral,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 2,
    borderTopColor: colors.grey,
  },
  primaryButton: {
    backgroundColor: colors.sun,
    borderRadius: radius.button,
    paddingVertical: 10,
    minHeight: 42,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontFamily: fonts.body,
    fontSize: 15,
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
  dangerButton: {
    borderRadius: radius.button,
    paddingVertical: 10,
    minHeight: 42,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.coral,
  },
});