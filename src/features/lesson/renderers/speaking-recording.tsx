import {
  requestRecordingPermissionsAsync,
  RecordingPresets,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ExerciseRendererProps } from '@/src/features/lesson/content';
import { ContinueButton } from '@/src/features/lesson/flow-buttons';
import { speak } from '@/src/lib/tts';
import { colors, fonts, radius } from '@/src/theme/tokens';

interface SpeakingContent {
  text_to_speak: string;
}

export function SpeakingRecordingRenderer({
  exercise,
  busy,
  isLast,
  onCheck,
  onContinue,
}: ExerciseRendererProps) {
  const content = exercise.content as unknown as SpeakingContent;
  const [recording, setRecording] = useState<{ uri: string } | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (status) => {
    if (status.isFinished && status.url) {
      setRecording({ uri: status.url });
    }
  });
  const recorderState = useAudioRecorderState(recorder);
  const player = useAudioPlayer(recording ? { uri: recording.uri } : null);

  const onRecordToggle = async () => {
    if (recorderState.isRecording) {
      await recorder.stop();
      return;
    }
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);
    recorder.record();
  };

  const onTryAgain = () => {
    setRecording(null);
    setPermissionDenied(false);
  };

  return (
    <>
      <Text style={styles.sentence}>{content.text_to_speak}</Text>

      <View style={styles.buttonRow}>
        <Pressable style={styles.audioButton} onPress={() => speak(content.text_to_speak)}>
          <Text style={styles.audioButtonText}>Model</Text>
        </Pressable>
        <Pressable
          style={[styles.audioButton, recorderState.isRecording && styles.recordButtonActive]}
          onPress={onRecordToggle}
        >
          <Text style={styles.audioButtonText}>
            {recorderState.isRecording ? 'Stop' : 'Record'}
          </Text>
        </Pressable>
      </View>

      {recording && (
        <>
          <View style={styles.buttonRow}>
            <Pressable
              style={styles.audioButton}
              onPress={() => {
                player.seekTo(0);
                player.play();
              }}
            >
              <Text style={styles.audioButtonText}>Your try</Text>
            </Pressable>
            <Pressable style={styles.audioButton} onPress={onTryAgain}>
              <Text style={styles.audioButtonText}>Try again</Text>
            </Pressable>
          </View>
          <ContinueButton isLast={isLast} onPress={() => onCheck({}, true)} disabled={busy} />
        </>
      )}

      {permissionDenied && (
        <>
          <Text style={styles.permissionText}>
            Microphone access is needed to record your voice. Please enable it in your device
            settings.
          </Text>
          <ContinueButton isLast={isLast} onPress={() => onCheck({}, true)} disabled={busy} />
        </>
      )}

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
    marginRight: 8,
  },
  recordButtonActive: {
    backgroundColor: colors.coral,
  },
  audioButtonText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  permissionText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.coral,
    marginVertical: 8,
  },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 16,
  },
});