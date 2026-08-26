import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/src/theme/tokens';

export interface ChatLine {
  text: string;
  left: boolean;
  speaker?: string | null;
}

export function ChatBubbles({
  lines,
  renderLine,
}: {
  lines: ChatLine[];
  renderLine?: (line: ChatLine, index: number) => ReactNode;
}) {
  return (
    <>
      {lines.map((line, i) => (
        <View key={i} style={[styles.row, line.left ? styles.alignLeft : styles.alignRight]}>
          <View style={styles.column}>
            {line.speaker ? <Text style={styles.speaker}>{line.speaker}</Text> : null}
            <View style={[styles.bubble, line.left ? styles.bubbleLeft : styles.bubbleRight]}>
              {renderLine ? (
                renderLine(line, i)
              ) : (
                <Text style={styles.text}>{line.text}</Text>
              )}
            </View>
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    width: '100%',
    marginBottom: 4,
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  column: {
    maxWidth: '80%',
  },
  speaker: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.5,
    marginBottom: 2,
  },
  bubble: {
    borderRadius: 16,
    padding: 10,
  },
  bubbleLeft: {
    backgroundColor: colors.skyTint,
  },
  bubbleRight: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
});