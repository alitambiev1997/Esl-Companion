import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ParrotBadge } from '@/src/components/ParrotBadge';
import { clearClassCode, getClassCode } from '@/src/lib/class-code';
import { colors, fonts, radius } from '@/src/theme/tokens';

export default function WebCourse() {
  const router = useRouter();
  const cefr = getClassCode();

  const leave = () => {
    clearClassCode();
    router.replace('/gate');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <ParrotBadge size={96} />
        <Text style={styles.title}>Class {cefr ?? ''}</Text>
        <Text style={styles.caption}>Course content is coming in the next update.</Text>
        <Pressable style={styles.button} onPress={leave}>
          <Text style={styles.buttonText}>Leave class</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    marginTop: 16,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.greyDark,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
    backgroundColor: colors.sky,
    borderRadius: radius.button,
    paddingVertical: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});