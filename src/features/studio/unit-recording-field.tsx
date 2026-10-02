import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { uploadContentAudio } from '@/src/features/studio/image-upload';
import type { UnitRow } from '@/src/features/studio/types';
import { publicStorageUrl } from '@/src/lib/storage';
import { supabase } from '@/src/lib/supabase';
import { colors, fonts, radius } from '@/src/theme/tokens';

export function UnitRecordingField({
  unit,
  onChanged,
}: {
  unit: UnitRow;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const path = unit.audio_path ?? '';
  const fileName = path.split('/').pop() ?? path;

  const errorHint = (message: string) =>
    message.includes('row-level security') || message.includes('permission')
      ? `${message} — run the Teacher Studio write policies in Supabase.`
      : message;

  const togglePreview = () => {
    const url = publicStorageUrl('content', path);
    if (!audioRef.current) {
      const audio = new Audio(url);
      audio.onended = () => setPlaying(false);
      audio.onpause = () => setPlaying(false);
      audio.onplay = () => setPlaying(true);
      audioRef.current = audio;
    }
    if (audioRef.current.paused) {
      void audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    const result = await uploadContentAudio(file, async (audioPath, blob, contentType) => {
      const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(audioPath, blob, { contentType, upsert: false });
      if (uploadError) {
        if (
          uploadError.message.includes('row-level security') ||
          uploadError.message.includes('policy')
        ) {
          return `${uploadError.message} — run the storage upload policy in Supabase.`;
        }
        return uploadError.message;
      }
      const { data, error: updateError } = await supabase
        .from('units')
        .update({ audio_path: audioPath })
        .eq('id', unit.id)
        .select('id');
      if (updateError) return errorHint(updateError.message);
      if (!data || data.length === 0) {
        return 'Nothing was saved - run the Teacher Studio write policies in Supabase.';
      }
      return null;
    });
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onChanged();
  };

  const openPicker = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) void handleFile(file);
    };
    input.click();
  };

  const remove = async () => {
    if (!path || busy) return;
    if (!window.confirm('Remove this unit recording?')) return;
    setBusy(true);
    setError(null);
    const { data, error: updateError } = await supabase
      .from('units')
      .update({ audio_path: null })
      .eq('id', unit.id)
      .select('id');
    setBusy(false);
    if (updateError) {
      setError(errorHint(updateError.message));
      return;
    }
    if (!data || data.length === 0) {
      setError('Nothing was saved - run the Teacher Studio write policies in Supabase.');
      return;
    }
    onChanged();
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Unit recording</Text>
        {path ? (
          <Text style={styles.fileName} numberOfLines={1}>
            {fileName}
          </Text>
        ) : (
          <Text style={styles.emptyText}>no recording yet</Text>
        )}
      </View>
      <View style={styles.actions}>
        {path ? (
          <Pressable
            style={[styles.button, styles.playButton]}
            onPress={togglePreview}
            disabled={busy}
          >
            <Text style={styles.buttonText}>{playing ? 'Pause' : 'Play'}</Text>
          </Pressable>
        ) : null}
        <Pressable
          style={[styles.button, styles.uploadButton, busy && styles.buttonDisabled]}
          onPress={openPicker}
          disabled={busy}
        >
          <Text style={styles.buttonText}>{busy ? 'Uploading...' : path ? 'Replace' : 'Upload audio'}</Text>
        </Pressable>
        {path ? (
          <Pressable style={styles.removeButton} onPress={remove} disabled={busy}>
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        ) : null}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    backgroundColor: colors.white,
    padding: 10,
    gap: 8,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  fileName: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.7,
  },
  emptyText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.45,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  button: {
    borderRadius: radius.button,
    paddingVertical: 7,
    paddingHorizontal: 14,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: colors.skyTint,
  },
  uploadButton: {
    backgroundColor: colors.sun,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
  },
  removeButton: {
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  removeText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: colors.coral,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.coral,
  },
});