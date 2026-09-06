import { Pressable, StyleSheet, Text } from 'react-native';
import { lightHaptic } from '@/src/lib/haptics';
import { hoverStyle } from '@/src/lib/web-hover';
import { colors, fonts, radius } from '@/src/theme/tokens';

interface FlowButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  haptic?: boolean;
}

export function PrimaryButton({ label, onPress, disabled, haptic }: FlowButtonProps) {
  return (
    <Pressable
      style={({ hovered }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        hoverStyle(hovered),
      ]}
      onPress={() => {
        if (haptic) lightHaptic();
        onPress();
      }}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.sun,
    borderRadius: radius.button,
    paddingVertical: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
});