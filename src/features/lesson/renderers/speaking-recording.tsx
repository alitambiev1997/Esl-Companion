import { setAudioModeAsync } from 'expo-audio';
import { StyleSheet, Text, View } from 'react-native';
import { SpeakerButton } from '@/src/components/ui/speaker-button';
import type { ExerciseRendererProps } from '@/src/features/lesson/content';
import { speak } from '@/src/lib/tts';
import { colors, fonts } from '@/src/theme/tokens';

interface SpeakingContent {
  text_to_speak: string;
}

export function SpeakingRecordingRenderer({ exercise }: ExerciseRendererProps) {
  const content = exercise.content as unknown as SpeakingContent;

  const onModel = () => {
    setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch((error) =>
      console.error('setAudioModeAsync failed', error)
    );
    speak(content.text_to_speak);
  };

  return (
    <>
      <Text style={styles.sentence}>&quot;{content.text_to_speak}&quot;</Text>

      <View style={styles.buttonRow}>
        <SpeakerButton onPress={onModel} />
      </View>

      <Text style={styles.disclaimer}>
        Pronunciation scoring comes later. For now, compare yourself with the model.
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  sentence: {
    fontFamily: fonts.body,
    fontSize: 20,
    lineHeight: 28,
    color: colors.ink,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 16,
  },
});