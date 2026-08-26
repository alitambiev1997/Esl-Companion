import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/src/theme/tokens';

export function TapAnswerBank({
  items,
  answer,
  checked,
  stacked,
  emptyHint = 'Tap the words below',
  renderBankItem,
  renderAnswerItem,
  onTapBank,
  onTapAnswer,
}: {
  items: string[];
  answer: string[];
  checked: boolean;
  stacked?: boolean;
  emptyHint?: string;
  renderBankItem: (item: string, disabled: boolean, onPress: () => void) => ReactNode;
  renderAnswerItem: (item: string, onPress: () => void) => ReactNode;
  onTapBank: (item: string) => void;
  onTapAnswer: (item: string) => void;
}) {
  return (
    <>
      <View style={[styles.answerArea, stacked ? styles.answerStacked : styles.answerWrap]}>
        {answer.length === 0 && <Text style={styles.emptyHint}>{emptyHint}</Text>}
        {answer.map((word, i) => (
          <View key={`${word}-${i}`}>
            {renderAnswerItem(word, () => onTapAnswer(word))}
          </View>
        ))}
      </View>

      <View style={[styles.bank, stacked && styles.bankStacked]}>
        {items.map((word, i) => {
          const used = answer.includes(word);
          return (
            <View key={`${word}-${i}`} style={used && styles.hidden}>
              {renderBankItem(word, checked || used, () => onTapBank(word))}
            </View>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  answerArea: {
    minHeight: 64,
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.grey,
    paddingBottom: 8,
    marginBottom: 16,
  },
  answerWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  answerStacked: {
    borderBottomWidth: 0,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: colors.grey,
    borderRadius: 14,
    padding: 8,
    paddingBottom: 8,
  },
  emptyHint: {
    position: 'absolute',
    top: 4,
    left: 4,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.4,
  },
  bank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bankStacked: {
    flexDirection: 'column',
  },
  hidden: {
    opacity: 0,
  },
});