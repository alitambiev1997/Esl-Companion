import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '@/src/theme/tokens';

interface FeedbackPanelProps {
  isCorrect: boolean;
  explanation: string | null;
  extra?: React.ReactNode;
}

export function FeedbackPanel({ isCorrect, explanation, extra }: FeedbackPanelProps) {
  return (
    <View style={[styles.feedback, isCorrect ? styles.correct : styles.wrong]}>
      <Text style={styles.title}>{isCorrect ? 'Correct!' : 'Not quite'}</Text>
      {extra}
      {explanation && <Text style={styles.text}>{explanation}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  feedback: {
    borderRadius: radius.card,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  correct: {
    backgroundColor: '#F0F9E8',
  },
  wrong: {
    backgroundColor: '#FDEFEA',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 4,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
});