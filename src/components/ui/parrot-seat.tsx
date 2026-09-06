import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ParrotBadge } from '@/src/components/ParrotBadge';
import { correctLine, wrongLine } from '@/src/lib/voice';
import { colors, fonts, radius } from '@/src/theme/tokens';

export function ParrotSeat({
  checked,
  correct,
  bubbleMaxWidth,
}: {
  checked: boolean;
  correct: boolean;
  bubbleMaxWidth?: number;
}) {
  const [line, setLine] = useState<string | null>(null);
  const [bounceKey, setBounceKey] = useState(0);
  const prevChecked = useRef(false);

  useEffect(() => {
    if (checked && !prevChecked.current) {
      setLine(correct ? correctLine() : wrongLine());
      setBounceKey((n) => n + 1);
    }
    prevChecked.current = checked;
  }, [checked, correct]);

  return (
    <View style={styles.row}>
      {checked && line && (
        <View style={[styles.bubble, bubbleMaxWidth ? { maxWidth: bubbleMaxWidth } : null]}>
          <Text style={styles.text}>{line}</Text>
        </View>
      )}
      <ParrotBadge size={56} bob bounceKey={bounceKey} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    paddingLeft: 16,
  },
  bubble: {
    flexShrink: 1,
    maxWidth: '70%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.bubble,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
  },
});