import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { ParrotBadge } from '@/src/components/ParrotBadge';
import { supabase } from '@/src/lib/supabase';
import { colors, fonts, radius } from '@/src/theme/tokens';

export default function Editor() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setChecking(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = async () => {
    setBusy(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) {
      setError('Wrong email or password.');
    }
    setBusy(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setPassword('');
  };

  if (checking) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator size="large" color={colors.sky} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.screen}>
        <View style={styles.card}>
          <ParrotBadge size={72} />
          <Text style={styles.title}>Teacher studio</Text>
          <Text style={styles.caption}>Sign in to edit course content.</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(null);
            }}
            placeholder="Email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholderTextColor={colors.greyDark}
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError(null);
            }}
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={colors.greyDark}
          />
          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            style={[styles.button, busy && styles.buttonDisabled]}
            onPress={signIn}
            disabled={busy || !email.trim() || !password}
          >
            <Text style={styles.buttonText}>Sign in</Text>
          </Pressable>

          <Pressable onPress={() => router.replace('/gate')} hitSlop={8}>
            <Text style={styles.linkText}>Back to site</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <ParrotBadge size={72} />
        <Text style={styles.title}>Teacher studio</Text>
        <Text style={styles.caption}>Signed in as {session.user.email}</Text>
        <Text style={styles.placeholder}>
          The content editor lands here next: lesson picker, exercise forms, live preview,
          validation, and save-to-database.
        </Text>
        <Pressable style={styles.button} onPress={signOut}>
          <Text style={styles.buttonText}>Sign out</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/gate')} hitSlop={8}>
          <Text style={styles.linkText}>Back to site</Text>
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
    gap: 12,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.ink,
    marginTop: 4,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.ink,
    textAlign: 'center',
  },
  placeholder: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.7,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.coral,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
    backgroundColor: colors.sun,
    borderRadius: radius.button,
    paddingVertical: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  linkText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.sky,
    textDecorationLine: 'underline',
  },
});