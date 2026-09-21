import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ContentImage } from '@/src/components/ui/content-image';
import {
  buildContent,
  draftFromExercise,
  isDraftEmpty,
  newDraft,
  type Draft,
} from '@/src/features/studio/draft';
import { ExercisePreview } from '@/src/features/studio/exercise-preview';
import { Field, styles as fieldBase, StringListField, TextField } from '@/src/features/studio/fields';
import type { ExerciseRow, StarterType } from '@/src/features/studio/types';
import { typeLabel } from '@/src/features/studio/types';
import { contentImageUrl } from '@/src/lib/storage';
import { supabase } from '@/src/lib/supabase';
import { hoverStyle } from '@/src/lib/web-hover';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Exercise } from '@/src/types/content';

function validate(draft: Draft): string[] {
  const errors: string[] = [];
  if (!draft.prompt.trim()) errors.push('Prompt is required.');
  if (draft.type === 'multiple_choice' || draft.type === 'image_choice') {
    const filled = draft.options.filter((o) => o.trim());
    if (filled.length < 2) errors.push('At least 2 options are required.');
    else if (filled.length !== draft.options.length) errors.push('Options cannot be empty.');
    else if (draft.correctIndex < 0 || draft.correctIndex >= draft.options.length) {
      errors.push('Mark the correct option.');
    }
  }
  if (draft.type === 'fill_blank' && draft.accepted.filter((a) => a.trim()).length === 0) {
    errors.push('At least one accepted answer is required.');
  }
  if (draft.type === 'word_order' && draft.sequence.filter((w) => w.trim()).length < 2) {
    errors.push('At least 2 words are required.');
  }
  if (!Number.isFinite(draft.sortOrder) || draft.sortOrder < 0) {
    errors.push('Sort order must be a number.');
  }
  return errors;
}

function buildSql(draft: Draft, lessonId: string, exerciseId: string | null): string {
  const escape = (text: string) => text.replace(/'/g, "''");
  const content = escape(JSON.stringify(buildContent(draft)));
  const prompt = escape(draft.prompt.trim());
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
  const hasOptions = draft.type === 'multiple_choice' || draft.type === 'image_choice';

  const save = async () => {
    const problems = validate(draft);
    setErrors(problems);
    if (problems.length > 0) return;
    setSaving(true);
    setSaveError(null);
    const payload = {
      lesson_id: lessonId,
      type: draft.type,
      prompt: draft.prompt.trim(),
      content: buildContent(draft),
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
    prompt: draft.prompt,
    content: buildContent(draft),
    is_required: draft.isRequired,
    sort_order: draft.sortOrder,
    created_at: '',
  };
  const previewEmpty = isDraftEmpty(draft);

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
        {draft.type === 'image_choice' ? (
          <TextField
            label="Question under the picture"
            hint="Shown beneath the image, e.g. What is this?"
            value={draft.prompt}
            onChangeText={(text) => update({ prompt: text })}
            placeholder="What is this?"
          />
        ) : (
          <TextField
            label="Prompt"
            hint="The task line shown above the exercise"
            value={draft.prompt}
            onChangeText={(text) => update({ prompt: text })}
            placeholder="Choose the correct sentence."
          />
        )}

        {hasOptions && (
          <Field label="Options" hint="Tap the circle to mark the correct one">
            {draft.options.map((option, i) => (
              <View key={i} style={styles.optionRow}>
                <Pressable
                  style={[styles.radio, draft.correctIndex === i && styles.radioOn]}
                  onPress={() => update({ correctIndex: i })}
                />
                <TextInput
                  style={[fieldBase.input, styles.optionInput]}
                  value={option}
                  onChangeText={(text) => {
                    const next = [...draft.options];
                    next[i] = text;
                    update({ options: next });
                  }}
                  placeholder={`Option ${i + 1}`}
                  placeholderTextColor={colors.greyDark}
                />
                <Pressable
                  style={styles.removeButton}
                  onPress={() =>
                    update({
                      options: draft.options.filter((_, index) => index !== i),
                      correctIndex: Math.min(
                        draft.correctIndex,
                        Math.max(0, draft.options.length - 2)
                      ),
                    })
                  }
                  hitSlop={6}
                >
                  <Text style={styles.removeText}>×</Text>
                </Pressable>
              </View>
            ))}
            <Pressable
              style={styles.addButton}
              onPress={() => update({ options: [...draft.options, ''] })}
            >
              <Text style={styles.addText}>+ Add option</Text>
            </Pressable>
          </Field>
        )}

        {draft.type === 'fill_blank' && (
          <StringListField
            label="Accepted answers"
            hint="Every spelling you accept (compared ignoring case and punctuation)"
            items={draft.accepted}
            onChange={(items) => update({ accepted: items })}
            placeholder="reservation"
            addLabel="Add answer"
          />
        )}

        {draft.type === 'word_order' && (
          <StringListField
            label="Words in the correct order"
            hint="The app shuffles them into a chip bank for the student"
            items={draft.sequence}
            onChange={(items) => update({ sequence: items })}
            placeholder="word"
            addLabel="Add word"
          />
        )}

        {draft.type === 'image_choice' && (
          <>
            <TextField
              label="Image path"
              hint="Path inside the content bucket, e.g. images/unit2/boy.png"
              value={draft.imageUrl}
              onChangeText={(text) => update({ imageUrl: text })}
              placeholder="images/unit2/boy.png"
            />
            {draft.imageUrl.trim() ? (
              <ContentImage url={contentImageUrl(draft.imageUrl.trim())} />
            ) : null}
            <TextField
              label="Audio text (optional)"
              hint="Read aloud when the student taps the speaker"
              value={draft.textToSpeak}
              onChangeText={(text) => update({ textToSpeak: text })}
              placeholder="boy"
            />
          </>
        )}

        <TextField
          label="Explanation"
          hint="Shown after answering (optional)"
          value={draft.explanation}
          onChangeText={(text) => update({ explanation: text })}
          placeholder="Use 'would like to' + verb for polite requests."
          multiline
        />

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
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.greyDark,
    backgroundColor: colors.white,
  },
  radioOn: {
    borderColor: colors.leaf,
    backgroundColor: colors.leaf,
  },
  optionInput: {
    flex: 1,
  },
  removeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.coral,
  },
  addButton: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  addText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.sky,
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