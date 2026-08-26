import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ContentImage } from '@/src/components/ui/content-image';
import { OptionCard } from '@/src/components/ui/option-card';
import { SlowButton, SpeakerButton } from '@/src/components/ui/speaker-button';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  ImageChoiceContent,
} from '@/src/features/lesson/content';
import { contentImageUrl } from '@/src/lib/storage';
import { speak, stopSpeech } from '@/src/lib/tts';
import { colors, fonts } from '@/src/theme/tokens';

export const ImageChoiceRenderer = forwardRef<ExerciseRendererHandle, ExerciseRendererProps>(
  function ImageChoiceRenderer({ exercise, checked, onCheck }, ref) {
    const content = exercise.content as unknown as ImageChoiceContent;

    useEffect(() => {
      if (!content.text_to_speak) return;
      speak(content.text_to_speak);
      return () => stopSpeech();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({ check: () => {} }));

    const grade = (i: number) => {
      if (checked) return;
      const isCorrect = i === content.correct_index;
      onCheck(
        { selected_index: i },
        isCorrect,
        {
          correct: isCorrect,
          explanation: content.explanation,
          correctAnswer: content.options[content.correct_index] ?? null,
        }
      );
    };

    return (
      <>
        <ContentImage url={contentImageUrl(content.image_url)} />

        {content.text_to_speak ? (
          <View style={styles.audioRow}>
            <SpeakerButton onPress={() => speak(content.text_to_speak as string)} />
            <SlowButton onPress={() => speak(content.text_to_speak as string, 0.6)} />
          </View>
        ) : null}

        {content.prompt ? <Text style={styles.prompt}>{content.prompt}</Text> : null}

        {content.options.map((option, i) => (
          <View key={i} style={styles.spacing}>
            <OptionCard label={option} disabled={checked} onPress={() => grade(i)} />
          </View>
        ))}
      </>
    );
  }
);

const styles = StyleSheet.create({
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  prompt: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 16,
  },
  spacing: {
    marginBottom: 12,
  },
});