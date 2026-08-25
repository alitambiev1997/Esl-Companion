import { setAudioModeAsync } from 'expo-audio';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ExerciseRendererProps } from '@/src/features/lesson/content';
import { ContinueButton } from '@/src/features/lesson/flow-buttons';
import { speak, stopSpeech } from '@/src/lib/tts';
import { colors, fonts, radius } from '@/src/theme/tokens';

interface SpeakingContent {
  text_to_speak: string;
}

export function SpeakingRecordingRenderer({
  exercise,
  busy,
  isLast,
  onCheck,
  onUngradedContinue,
}: ExerciseRendererProps) {
  const content = exercise.content as unknown as SpeakingContent;

  const onModel = () => {
    setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch((error) =>
      console.error('setAudioModeAsync failed', error)
    );
    speak(content.text_to_speak);
  };

  const onContinue = () => {
    try {
      stopSpeech();
    } catch (error) {
      console.error('stopSpeech failed', error);
    }
    if (onUngradedContinue) {
      onUngradedContinue(exercise);
    } else {
      onCheck({}, true);
    }
  };

  return (
    <>
      <Text style={styles.sentence}>{content.text_to_speak}</Text>

      <View style={styles.buttonRow}>
        <Pressable style={styles.audioButton} onPress={onModel}>
          <Text style={styles.audioButtonText}>Model</Text>
        </Pressable>
      </View>

      <ContinueButton isLast={isLast} onPress={onContinue} disabled={busy} />

      <Text style={styles.disclaimer}>
        Pronunciation scoring comes later. For now, compare yourself with the model.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  sentence: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  audioButton: {
    backgroundColor: colors.sky,
    borderRadius: radius.button,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  audioButtonText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 16,
  },
});