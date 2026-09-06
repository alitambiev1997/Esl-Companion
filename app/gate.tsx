import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ParrotBadge } from '@/src/components/ParrotBadge';
import { getClassCode, saveClassCode, saveClassLevelId } from '@/src/lib/class-code';
import { supabase } from '@/src/lib/supabase';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Level } from '@/src/types/content';

type LevelsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; levels: Level[] };

function Reveal({ children }: { children: React.ReactNode }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [progress]);

  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [
          { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}

export default function Gate() {
  const router = useRouter();
  const storedCode = getClassCode();
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [levelsState, setLevelsState] = useState<LevelsState>({ status: 'idle' });
  const [openLevelId, setOpenLevelId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const shake = useRef(new Animated.Value(0)).current;
  const chevron = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(chevron, {
      toValue: coursesOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [coursesOpen, chevron]);

  const loadLevels = async () => {
    setLevelsState({ status: 'loading' });
    const { data, error } = await supabase
      .from('levels')
      .select('id,title,cefr_level,description')
      .eq('is_published', true)
      .order('cefr_level');
    if (error) {
      setLevelsState({ status: 'error', message: error.message });
      return;
    }
    setLevelsState({ status: 'ready', levels: (data as Level[]) ?? [] });
  };

  const toggleCourses = () => {
    const next = !coursesOpen;
    setCoursesOpen(next);
    if (next && levelsState.status === 'idle') {
      loadLevels();
    }
  };

  const toggleLevel = (levelId: string) => {
    setOpenLevelId((current) => (current === levelId ? null : levelId));
    setCode('');
    setHint(null);
  };

  const submitCode = (level: Level) => {
    const normalized = code.trim().toUpperCase();
    const expected = `AQAP-${(level.cefr_level ?? '').toUpperCase()}`;
    if (!normalized || normalized !== expected) {
      setHint("That code doesn't match this course. Try again.");
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
    saveClassLevelId(level.id);
    router.replace('/webcourse');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <ParrotBadge size={96} />
        <Text style={styles.appName}>AQAP English</Text>

        <View style={styles.choices}>
          <Pressable style={styles.choice} onPress={() => router.replace('/placement')}>
            <Text style={styles.choiceTitle}>Test your level</Text>
            <Text style={styles.choiceCaption}>Find out where to start</Text>
          </Pressable>

          <Pressable style={[styles.choice, coursesOpen && styles.choiceOpen]} onPress={toggleCourses}>
            <View style={styles.choiceRow}>
              <View style={styles.choiceTexts}>
                <Text style={styles.choiceTitle}>Choose your course</Text>
                <Text style={styles.choiceCaption}>Enter your class code</Text>
              </View>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: chevron.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                      }),
                    },
                  ],
                }}
              >
                <Ionicons name="chevron-down" size={24} color={colors.sky} />
              </Animated.View>
            </View>
          </Pressable>
        </View>

        {coursesOpen && (
          <Reveal>
            <View style={styles.levelsList}>
              {levelsState.status === 'loading' && (
                <View style={styles.panel}>
                  <ActivityIndicator size="small" color={colors.sky} />
                </View>
              )}
              {levelsState.status === 'error' && (
                <View style={styles.panel}>
                  <Text style={styles.hintText}>{levelsState.message}</Text>
                  <Pressable onPress={loadLevels}>
                    <Text style={styles.linkText}>Try again</Text>
                  </Pressable>
                </View>
              )}
              {levelsState.status === 'ready' && levelsState.levels.length === 0 && (
                <View style={styles.panel}>
                  <Text style={styles.hintText}>No courses available yet.</Text>
                </View>
              )}
              {levelsState.status === 'ready' &&
                levelsState.levels.map((level) => {
                  const open = openLevelId === level.id;
                  return (
                    <View key={level.id}>
                      <Pressable
                        style={[styles.levelCard, open && styles.levelCardOpen]}
                        onPress={() => toggleLevel(level.id)}
                      >
                        <Text style={styles.levelTitle}>
                          {level.cefr_level ?? level.title ?? ''}
                        </Text>
                        {level.description && (
                          <Text style={styles.levelCaption}>{level.description}</Text>
                        )}
                      </Pressable>
                      {open && (
                        <Reveal>
                          <View style={styles.codePanel}>
                            <TextInput
                              style={styles.input}
                              value={code}
                              onChangeText={(text) => {
                                setCode(text);
                                setHint(null);
                              }}
                              placeholder="Enter code"
                              autoCapitalize="characters"
                              autoCorrect={false}
                              placeholderTextColor={colors.greyDark}
                            />
                            {hint && <Text style={styles.hintText}>{hint}</Text>}
                            <Animated.View
                              style={{
                                transform: [
                                  {
                                    translateX: shake.interpolate({
                                      inputRange: [-1, 0, 1],
                                      outputRange: [-10, 0, 10],
                                    }),
                                  },
                                ],
                              }}
                            >
                              <Pressable
                                style={styles.enterButton}
                                onPress={() => submitCode(level)}
                              >
                                <Text style={styles.enterButtonText}>Enter</Text>
                              </Pressable>
                            </Animated.View>
                          </View>
                        </Reveal>
                      )}
                    </View>
                  );
                })}
            </View>
          </Reveal>
        )}

        {storedCode && (
          <Pressable style={styles.continueRow} onPress={() => router.replace('/webcourse')}>
            <Text style={styles.linkText}>Continue as {storedCode}</Text>
          </Pressable>
        )}
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
  appName: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    marginTop: 16,
    marginBottom: 20,
  },
  choices: {
    alignSelf: 'stretch',
    gap: 12,
  },
  choice: {
    minHeight: 64,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderBottomWidth: 4,
    borderBottomColor: colors.greyDark,
    padding: 14,
    justifyContent: 'center',
  },
  choiceOpen: {
    borderColor: colors.sky,
    borderBottomColor: colors.sky,
    backgroundColor: colors.skyTint,
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  choiceTexts: {
    flex: 1,
  },
  choiceTitle: {
    fontFamily: fonts.body,
    fontSize: 17,
    fontWeight: '600',
    color: colors.ink,
  },
  choiceCaption: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 2,
  },
  levelsList: {
    alignSelf: 'stretch',
    marginTop: 12,
    gap: 12,
  },
  panel: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  levelCard: {
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderBottomWidth: 4,
    borderBottomColor: colors.greyDark,
    padding: 14,
  },
  levelCardOpen: {
    borderColor: colors.sun,
    borderBottomColor: colors.sun,
    backgroundColor: colors.sunTint,
  },
  levelTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
  },
  levelCaption: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 2,
  },
  codePanel: {
    gap: 8,
    paddingTop: 12,
  },
  input: {
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
  hintText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.coral,
    textAlign: 'center',
  },
  enterButton: {
    backgroundColor: colors.sun,
    borderRadius: radius.button,
    paddingVertical: 13,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterButtonText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  continueRow: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.sky,
    textDecorationLine: 'underline',
  },
});