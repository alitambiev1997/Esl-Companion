import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/features/auth/useAuth';

export default function Home() {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const [levelTitle, setLevelTitle] = useState<string | null>(null);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
    } else if (!profile?.onboarding_completed) {
      router.replace('/onboarding');
    }
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (!profile?.current_level_id) return;

    let mounted = true;

    (async () => {
      const { data, error } = await supabase
        .from('levels')
        .select('title')
        .eq('id', profile.current_level_id as string)
        .maybeSingle();
      if (!mounted) return;
      if (!error && data) {
        setLevelTitle(data.title);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [profile?.current_level_id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user || !profile?.onboarding_completed) {
    return null;
  }

  const onSignOut = async () => {
    setSigningOut(true);
    setSignOutError(null);
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Sign out failed');
      setSigningOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.email}>{user.email ?? 'No email on file'}</Text>
      {levelTitle && <Text style={styles.level}>Level: {levelTitle}</Text>}
      {signOutError && <Text style={styles.error}>{signOutError}</Text>}
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
  },
  level: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 24,
  },
  error: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 8,
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