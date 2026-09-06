import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { isSpeechAvailable } from '@/src/lib/tts';
import { hoverStyle } from '@/src/lib/web-hover';
import { colors, fonts } from '@/src/theme/tokens';

export function SpeakerButton({ onPress }: { onPress: () => void }) {
  if (!isSpeechAvailable()) {
    return <Text style={styles.caption}>Audio isn&apos;t supported in this browser.</Text>;
  }
  return (
    <Pressable style={({ hovered }) => [styles.speaker, hoverStyle(hovered)]} onPress={onPress}>
      <Ionicons name="volume-high" size={32} color={colors.white} />
    </Pressable>
  );
}

export function SlowButton({ onPress }: { onPress: () => void }) {
  if (!isSpeechAvailable()) return null;
  return (
    <Pressable style={({ hovered }) => [styles.slow, hoverStyle(hovered)]} onPress={onPress}>
      <MaterialCommunityIcons name="turtle" size={24} color={colors.sky} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  speaker: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  slow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.7,
  },
});