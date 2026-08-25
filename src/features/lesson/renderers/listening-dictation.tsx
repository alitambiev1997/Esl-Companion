import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { SlowButton, SpeakerButton } from '@/src/components/ui/speaker-button';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  ListeningDictationContent,
} from '@/src/features/lesson/content';
import { speak, stopSpeech } from '@/src/lib/tts';
import { colors, fonts } from '@/src/theme/tokens';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const ListeningDictationRenderer = forwardRef<
  ExerciseRendererHandle,
  ExerciseRendererProps
>(function ListeningDictationRenderer({ exercise, checked, onCheck, onCanCheckChange }, ref) {
  const content = exercise.content as unknown as ListeningDictationContent;
  const [text, setText] = useState('');

  useEffect(() => {
    speak(content.text_to_speak);
    return () => stopSpeech();
  }, [content.text_to_speak]);

  useImperativeHandle(ref, () => ({
    check: () => {
      const answer = normalize(text);
      const isCorrect = content.accepted.some((candidate) => normalize(candidate) === answer);
      onCheck(
        { text },
        isCorrect,
        {
          correct: isCorrect,
          explanation: content.explanation ?? content.text_to_speak,
          correctAnswer: content.text_to_speak,
        }
      );
    },
  }));

  useEffect(() => {
    onCanCheckChange(text.trim().length > 0);
  }, [text, onCanCheckChange]);

  return (
    <>
      <View style={styles.audioRow}>
        <SpeakerButton onPress={() => speak(content.text_to_speak)} />
        <SlowButton onPress={() => speak(content.text_to_speak, 0.6)} />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Type what you hear"
        placeholderTextColor={colors.greyDark}
        autoCapitalize="none"
        autoCorrect={false}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        value={text}
        onChangeText={setText}
        editable={!checked}
      />
    </>
  );
});

const styles = StyleSheet.create({
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: 14,
    padding: 12,
    minHeight: 96,
    fontSize: 18,
    fontFamily: fonts.body,
    color: colors.ink,
  },
});