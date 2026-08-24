import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius } from '@/src/theme/tokens';

interface FlowButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function PrimaryButton({ label, onPress, disabled }: FlowButtonProps) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export function ContinueButton({
  isLast,
  onPress,
  disabled,
}: {
  isLast: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return <PrimaryButton label={isLast ? 'Finish' : 'Continue'} onPress={onPress} disabled={disabled} />;
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