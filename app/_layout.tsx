import { Baloo2_700Bold } from '@expo-google-fonts/baloo-2';
import { Nunito_400Regular } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useHapticsStore } from '@/src/store/haptics';
import { useIsDesktop } from '@/src/hooks/useIsDesktop';
import { colors } from '@/src/theme/tokens';

const isWeb = Platform.OS === 'web';

export default function RootLayout() {
  const isDesktop = useIsDesktop();
  const [fontsLoaded] = useFonts({
    Baloo2_700Bold,
    Nunito_400Regular,
  });
  const loadHaptics = useHapticsStore((state) => state.load);

  useEffect(() => {
    loadHaptics();
  }, [loadHaptics]);

  useEffect(() => {
    if (!isWeb) return;
    document.title = 'AQAP English';
    document.body.style.background = colors.shell;
  }, []);

  if (!fontsLoaded) {
    return <View style={styles.loading} />;
  }

  const app = (
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
        <Stack.Screen name="placement" />
        <Stack.Screen name="editor" />
        <Stack.Screen name="unit/[id]" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );

  if (!isWeb) return app;

  return (
    <View style={styles.webShell}>
      <View style={[styles.webColumn, { maxWidth: isDesktop ? 1120 : 480 }]}>{app}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
  },
  webShell: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.shell,
  },
  webColumn: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.paper,
    boxShadow: '0 0 0 1px rgba(18, 40, 60, 0.06), 0 16px 48px rgba(18, 40, 60, 0.12)',
  },
});