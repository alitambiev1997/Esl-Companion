import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type {
  ExerciseRendererProps,
  ListeningDictationContent,
} from '@/src/features/lesson/content';
import { FeedbackPanel } from '@/src/features/lesson/feedback-panel';
import { ContinueButton, PrimaryButton } from '@/src/features/lesson/flow-buttons';
import { speak, stopSpeech } from '@/src/lib/tts';
import { colors, fonts, radius } from '@/src/theme/tokens';

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function ListeningDictationRenderer({
  exercise,
  checked,
  busy,
  isLast,
  onCheck,
  onContinue,
}: ExerciseRendererProps) {
  const content = exercise.content as unknown as ListeningDictationContent;
  const [text, setText] = useState('');
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    speak(content.text_to_speak);
    return () => stopSpeech();
  }, [content.text_to_speak]);

  const check = () => {
    const answer = normalize(text);
    const isCorrect = content.accepted.some((candidate) => normalize(candidate) === answer);
    setLastCorrect(isCorrect);
    onCheck({ text }, isCorrect);
  };

  return (
    <>
      <View style={styles.audioRow}>
        <Pressable style={styles.audioButton} onPress={() => speak(content.text_to_speak)}>
          <Text style={styles.audioButtonText}>Play</Text>
        </Pressable>
        <Pressable style={styles.audioButton} onPress={() => speak(content.text_to_speak, 0.6)}>
          <Text style={styles.audioButtonText}>Slow</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Type what you hear"
        autoCapitalize="none"
        autoCorrect={false}
        value={text}
        onChangeText={setText}
        editable={!checked}
      />

      {!checked && (
        <PrimaryButton label="Check" onPress={check} disabled={text.trim().length === 0 || busy} />
      )}

      {checked && (
        <>
          <FeedbackPanel isCorrect={lastCorrect === true} explanation={content.text_to_speak} />
          <ContinueButton isLast={isLast} onPress={onContinue} disabled={busy} />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  audioRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  audioButton: {
    backgroundColor: colors.sky,
    borderRadius: radius.button,
    paddingHorizontal: 24,
    paddingVertical: 10,
    marginRight: 8,
  },
  audioButtonText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: 14,
    padding: 12,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.ink,
  },
});