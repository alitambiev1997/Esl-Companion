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
    backgroundColor: colors.sky,
    borderRadius: radius.button,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});