import { ParrotBadge } from '@/src/components/ParrotBadge';
import { useIsDesktop } from '@/src/hooks/useIsDesktop';
import { useUiScale } from '@/src/hooks/useUiScale';
import { getClassCode, saveClassCode, saveClassLevelId } from '@/src/lib/class-code';
import { supabase } from '@/src/lib/supabase';
import { hoverStyle } from '@/src/lib/web-hover';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Level } from '@/src/types/content';
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
  const isDesktop = useIsDesktop();
  const uiScale = useUiScale();
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
    router.replace('/course');
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.card, isDesktop && styles.cardDesktop]}>
        {isDesktop && (
          <View style={styles.brandPanel}>
            <ParrotBadge size={uiScale.parrot} />
            <Text style={[styles.appName, styles.appNameDesktop]}>AQAP English</Text>
            <Text style={styles.tagline}>Revise and practice your special AQAP course.</Text>
            <View style={styles.captionList}>
              <Text style={styles.captionLine}>Practical English</Text>
              <Text style={styles.captionLine}>Fun activities</Text>
              <Text style={styles.captionLine}>Practice speaking, reading and spelling </Text>
            </View>
          </View>
        )}

        <View style={styles.rightPanel}>
          {!isDesktop && (
            <>
              <ParrotBadge size={uiScale.parrot} />
              <Text style={styles.appName}>AQAP English</Text>
            </>
          )}

          <View style={styles.choices}>
            <Pressable
              style={({ hovered }) => [styles.choice, hoverStyle(hovered)]}
              onPress={() => router.replace('/placement')}
            >
              <Text style={styles.choiceTitle}>Test your level</Text>
              <Text style={styles.choiceCaption}>Find out which course is best for you </Text>
            </Pressable>

            <Pressable
              style={({ hovered }) => [
                styles.choice,
                coursesOpen && styles.choiceOpen,
                hoverStyle(hovered),
              ]}
              onPress={toggleCourses}
            >
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
              <View style={[styles.levelsList, isDesktop && styles.levelsGrid]}>
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
                      <View key={level.id} style={isDesktop && styles.gridCell}>
                        <Pressable
                          style={({ hovered }) => [
                            styles.levelCard,
                            open && styles.levelCardOpen,
                            hoverStyle(hovered),
                          ]}
                          onPress={() => toggleLevel(level.id)}
                        >
                          <Text style={[styles.levelTitle, isDesktop && styles.levelTitleDesktop]}>
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
                                  style={({ hovered }) => [
                                    styles.enterButton,
                                    hoverStyle(hovered),
                                  ]}
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
            <Pressable style={styles.continueRow} onPress={() => router.replace('/course')}>
              <Text style={styles.linkText}>Continue as {storedCode}</Text>
            </Pressable>
          )}
        </View>
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
  cardDesktop: {
    flexDirection: 'row',
    maxWidth: 960,
    padding: 0,
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  brandPanel: {
    flex: 0.95,
    backgroundColor: colors.skyTint,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightPanel: {
    flex: 1.25,
    padding: 28,
    justifyContent: 'center',
  },
  appName: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    marginTop: 16,
    marginBottom: 20,
  },
  appNameDesktop: {
    fontSize: 36,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
    opacity: 0.8,
    textAlign: 'center',
  },
  captionList: {
    marginTop: 16,
    alignItems: 'center',
    gap: 6,
  },
  captionLine: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.sky,
    fontWeight: '600',
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
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: '48%',
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
  levelTitleDesktop: {
    fontSize: 26,
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