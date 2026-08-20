import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/src/features/auth/useAuth';

export default function Index() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? '/home' : '/login');
  }, [loading, user, router]);

  return (
    <View style={styles.container}>
      <Text>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
