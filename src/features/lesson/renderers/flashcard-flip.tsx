import { forwardRef, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { SpeakerButton } from '@/src/components/ui/speaker-button';
import type {
  ExerciseRendererHandle,
  ExerciseRendererProps,
  FlashcardFlipContent,
} from '@/src/features/lesson/content';
import { speak } from '@/src/lib/tts';
import { colors, fonts, radius } from '@/src/theme/tokens';

export const FlashcardFlipRenderer = forwardRef<ExerciseRendererHandle, ExerciseRendererProps>(
  function FlashcardFlipRenderer({ exercise }, ref) {
    const content = exercise.content as unknown as FlashcardFlipContent;
    const [flipped, setFlipped] = useState(false);
    const flip = useRef(new Animated.Value(0)).current;

    const onFlip = () => {
      if (flipped) return;
      Animated.timing(flip, { toValue: 1, duration: 300, useNativeDriver: true }).start(() =>
        setFlipped(true)
      );
    };

    return (
      <>
        <View style={styles.cardWrap}>
          <Animated.View
            style={[
              styles.card,
              {
                opacity: flip.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                transform: [
                  { scaleX: flip.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) },
                ],
              },
            ]}
          >
            <Text style={styles.faceText}>{content.front}</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              {
                opacity: flip.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
                transform: [
                  { scaleX: flip.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) },
                ],
              },
            ]}
          >
            <Text style={styles.faceText}>{content.back}</Text>
            {content.example ? (
              <Text style={styles.example}>&quot;{content.example}&quot;</Text>
            ) : null}
            <View style={styles.audioRow}>
              <SpeakerButton onPress={() => speak(content.text_to_speak)} />
            </View>
          </Animated.View>
        </View>

        <Pressable style={[styles.flipButton, flipped && styles.flipButtonHidden]} onPress={onFlip} disabled={flipped}>
          <Text style={styles.flipButtonText}>Flip</Text>
        </Pressable>

        <Text style={styles.disclaimer}>Study card - no grading.</Text>
      </>
    );
  }
);

const styles = StyleSheet.create({
  cardWrap: {
    height: 320,
    width: '100%',
    alignItems: 'center',
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBack: {
    justifyContent: 'flex-start',
    paddingTop: 32,
  },
  faceText: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    textAlign: 'center',
  },
  example: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 12,
  },
  audioRow: {
    marginTop: 16,
  },
  flipButton: {
    marginTop: 16,
    backgroundColor: colors.sky,
    borderRadius: radius.button,
    paddingVertical: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  flipButtonHidden: {
    opacity: 0,
  },
  flipButtonText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 16,
    textAlign: 'center',
  },
});