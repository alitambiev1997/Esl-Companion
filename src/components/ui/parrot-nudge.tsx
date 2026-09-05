import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MascotBadge } from '@/components/mascot-badge';
import { correctLine, wrongLine } from '@/src/lib/voice';
import { colors, fonts, radius } from '@/src/theme/tokens';

export function ParrotNudge({
  correct,
  bounceKey,
}: {
  correct: boolean;
  bounceKey?: number;
}) {
  const [line] = useState(() => (correct ? correctLine() : wrongLine()));

  return (
    <View style={styles.row}>
      <MascotBadge size={48} bounceKey={bounceKey} />
      <View style={styles.bubble}>
        <Text style={styles.text}>{line}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  bubble: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.bubble,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 10,
    marginBottom: 4,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
});