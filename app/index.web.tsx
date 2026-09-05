import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getClassCode } from '@/src/lib/class-code';

export default function IndexWeb() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getClassCode() ? '/webcourse' : '/gate');
  }, [router]);

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