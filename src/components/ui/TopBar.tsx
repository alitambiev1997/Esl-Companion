import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/src/theme/tokens';

export function TopBar({
  title,
  showBack,
  right,
}: {
  title?: string;
  showBack?: boolean;
  right?: ReactNode;
}) {
  const router = useRouter();
  return (
    <View style={styles.bar}>
      {showBack ? (
        <Pressable style={styles.side} onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={26} color={colors.sky} />
        </Pressable>
      ) : (
        <View style={styles.side} />
      )}
      {title ? (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      ) : null}
      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.paper,
  },
  side: {
    width: 28,
  },
  title: {
    flex: 1,
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
  },
});