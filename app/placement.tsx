import { ParrotBadge } from '@/src/components/ParrotBadge';
import { colors, fonts, radius } from '@/src/theme/tokens';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Placement() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <ParrotBadge size={96} />
        <Text style={styles.title}>Coming soon</Text>
        <Text style={styles.caption}>The level test is on the way.</Text>
        <Pressable style={styles.button} onPress={() => router.replace('/gate')}>
          <Text style={styles.buttonText}>Back to Home</Text>
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
    fontSize: 28,
    color: colors.ink,
    marginTop: 16,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 4,
    marginBottom: 20,
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
  },
  buttonText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});