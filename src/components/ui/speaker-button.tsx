import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '@/src/theme/tokens';

export function SpeakerButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.speaker} onPress={onPress}>
      <Ionicons name="volume-high" size={32} color={colors.white} />
    </Pressable>
  );
}

export function SlowButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.slow} onPress={onPress}>
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
});