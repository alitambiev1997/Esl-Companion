import { Baloo2_700Bold } from '@expo-google-fonts/baloo-2';
import { Nunito_400Regular } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useHapticsStore } from '@/src/store/haptics';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Baloo2_700Bold,
    Nunito_400Regular,
  });
  const loadHaptics = useHapticsStore((state) => state.load);

  useEffect(() => {
    loadHaptics();
  }, [loadHaptics]);

  if (!fontsLoaded) {
    return <View style={styles.loading} />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" />
        <Stack.Screen name="(auth)/signup" />
        <Stack.Screen name="home" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="course" />
        <Stack.Screen name="lesson/[id]" />
        <Stack.Screen name="review" />
        <Stack.Screen name="testing" />
        <Stack.Screen name="testing/[type]" />
        <Stack.Screen name="gate" />
        <Stack.Screen name="webcourse" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
  },
});