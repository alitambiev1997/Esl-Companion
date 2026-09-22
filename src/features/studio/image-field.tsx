import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ContentImage } from '@/src/components/ui/content-image';
import { Field } from '@/src/features/studio/fields';
import { uploadContentImage } from '@/src/features/studio/image-upload';
import { contentImageUrl } from '@/src/lib/storage';
import { supabase } from '@/src/lib/supabase';
import { colors, fonts, radius } from '@/src/theme/tokens';

export function ImagePathField({
  value,
  onChange,
  label,
  hint,
}: {
  value: string;
  onChange: (path: string) => void;
  label?: string;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compress, setCompress] = useState(true);
  const zoneRef = useRef<View>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      const result = await uploadContentImage(file, compress, async (path, blob, contentType) => {
        const { error: uploadError } = await supabase.storage
          .from('content')
          .upload(path, blob, { contentType, upsert: false });
        if (!uploadError) return null;
        if (
          uploadError.message.includes('row-level security') ||
          uploadError.message.includes('policy')
        ) {
          return `${uploadError.message} — run the storage upload policy in Supabase.`;
        }
        return uploadError.message;
      });
      setUploading(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.path) onChange(result.path);
    },
    [compress, onChange]
  );

  const openPicker = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) void handleFile(file);
    };
    input.click();
  };

  useEffect(() => {
    const node = zoneRef.current as unknown as HTMLElement | null;
    if (!node) return;
    const onDragOver = (event: DragEvent) => {
      event.preventDefault();
    };
    const onDrop = (event: DragEvent) => {
      event.preventDefault();
      const file = event.dataTransfer?.files?.[0];
      if (file) void handleFile(file);
    };
    node.addEventListener('dragover', onDragOver);
    node.addEventListener('drop', onDrop);
    return () => {
      node.removeEventListener('dragover', onDragOver);
      node.removeEventListener('drop', onDrop);
    };
  }, [handleFile]);

  return (
    <Field label={label ?? 'Image'} hint={hint ?? 'Path inside the content bucket, or upload a new picture'}>
      <View ref={zoneRef} style={styles.zone}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => {
            setError(null);
            onChange(text);
          }}
          placeholder="uploads/my-picture.jpg"
          placeholderTextColor={colors.greyDark}
        />
        <View style={styles.row}>
          <Pressable
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={openPicker}
            disabled={uploading}
          >
            <Text style={styles.uploadText}>
              {uploading ? 'Uploading...' : value.trim() ? 'Replace image' : 'Upload image'}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.compressChip, compress && styles.compressChipOn]}
            onPress={() => setCompress((current) => !current)}
          >
            <Text style={[styles.compressText, compress && styles.compressTextOn]}>
              {compress ? '✓ Shrink big images' : 'Shrink big images'}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.dropHint}>or drag and drop a picture here</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
      {value.trim() ? <ContentImage url={contentImageUrl(value.trim())} /> : null}
    </Field>
  );
}

const styles = StyleSheet.create({
  zone: {
    gap: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: 10,
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.ink,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  uploadButton: {
    backgroundColor: colors.sky,
    borderRadius: radius.button,
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  compressChip: {
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.button,
    paddingVertical: 8,
    paddingHorizontal: 14,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  compressChipOn: {
    borderColor: colors.leaf,
    backgroundColor: colors.leafTint,
  },
  compressText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
    opacity: 0.6,
  },
  compressTextOn: {
    color: colors.ink,
    opacity: 1,
  },
  dropHint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.45,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.coral,
  },
});