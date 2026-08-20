import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { supabase } from '@/src/lib/supabase';

type LoadState = 'loading' | 'error' | 'ready';

export default function Home() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>('loading');
  const [email, setEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!mounted) return;
      if (error || !data.user) {
        setState('error');
        setErrorMessage(error?.message ?? 'Not signed in');
        return;
      }
      setEmail(data.user.email ?? null);
      setState('ready');
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const onSignOut = async () => {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMessage(error.message);
      setSigningOut(false);
      return;
    }
    router.replace('/login');
  };

  if (state === 'loading') {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (state === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{errorMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.email}>{email}</Text>
      <Pressable
        style={[styles.button, signingOut && styles.buttonDisabled]}
        onPress={onSignOut}
        disabled={signingOut}
      >
        <Text style={styles.buttonText}>{signingOut ? 'Signing out...' : 'Sign out'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  error: {
    color: '#d32f2f',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2196f3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
