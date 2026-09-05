import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ParrotBadge } from '@/src/components/ParrotBadge';
import { CLASS_CODES, saveClassCode } from '@/src/lib/class-code';
import { colors, fonts, radius } from '@/src/theme/tokens';

export default function Gate() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const shake = useRef(new Animated.Value(0)).current;

  const submit = () => {
    const normalized = code.trim().toUpperCase();
    const cefr = CLASS_CODES[normalized];
    if (!cefr) {
      setHint('That code is not valid. Try again.');
      shake.setValue(0);
      Animated.sequence([
        Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 120, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
      return;
    }
    saveClassCode(normalized);
    router.replace('/webcourse');
  };

  return (
    <View style={styles.screen}>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { translateX: shake.interpolate({ inputRange: [-1, 0, 1], outputRange: [-10, 0, 10] }) },
            ],
          },
        ]}
      >
        <ParrotBadge size={96} />
        <Text style={styles.title}>Enter your class code</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={(text) => {
            setCode(text);
            setHint(null);
          }}
          placeholder="e.g. AQAP-A2"
          autoCapitalize="characters"
          autoCorrect={false}
          placeholderTextColor={colors.greyDark}
        />
        {hint && <Text style={styles.hint}>{hint}</Text>}
        <Pressable style={styles.button} onPress={submit}>
          <Text style={styles.buttonText}>Enter</Text>
        </Pressable>
      </Animated.View>
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
    marginBottom: 16,
  },
  input: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.ink,
    textAlign: 'center',
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.coral,
    marginTop: 8,
  },
  button: {
    alignSelf: 'stretch',
    backgroundColor: colors.sun,
    borderRadius: radius.button,
    paddingVertical: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
});