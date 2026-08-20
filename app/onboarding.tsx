import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '@/src/features/auth/useAuth';
import { supabase } from '@/src/lib/supabase';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Level } from '@/src/types/content';

const GOALS = [
  {
    label: 'General English',
    description: 'Improve everyday English for conversations and daily life.',
  },
  {
    label: 'Work',
    description: 'English for your job, interviews, and professional communication.',
  },
  {
    label: 'Travel',
    description: 'English for trips, directions, and travel situations.',
  },
  {
    label: 'Exam preparation',
    description: 'Prepare for exams such as IELTS, TOEFL, or Cambridge.',
  },
];

type Step = 'goal' | 'level';

type LevelsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; levels: Level[] };

export default function Onboarding() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [step, setStep] = useState<Step>('goal');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [levelsState, setLevelsState] = useState<LevelsState>({ status: 'idle' });
  const [levelsRetry, setLevelsRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (step !== 'level') return;

    let mounted = true;
    setLevelsState({ status: 'loading' });

    (async () => {
      const { data, error } = await supabase
        .from('levels')
        .select('id,title,cefr_level,description,sort_order')
        .eq('is_published', true)
        .order('sort_order');
      if (!mounted) return;
      if (error) {
        setLevelsState({ status: 'error', message: error.message });
        return;
      }
      setLevelsState({ status: 'success', levels: data as Level[] });
    })();

    return () => {
      mounted = false;
    };
  }, [step, levelsRetry]);

  const goToLevels = () => {
    if (!selectedGoal) return;
    setStep('level');
  };

  const finish = async () => {
    if (!user || !selectedGoal || !selectedLevelId) return;

    setSaving(true);
    setSaveError(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        goal: selectedGoal,
        current_level_id: selectedLevelId,
        onboarding_completed: true,
      })
      .eq('id', user.id);

    if (error) {
      setSaveError(error.message);
      setSaving(false);
      return;
    }

    router.replace('/home');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.sky} />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Let&apos;s get you set up</Text>

        <View style={styles.progressRow}>
          <Text style={styles.progressText}>Step {step === 'goal' ? '1' : '2'} of 2</Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: step === 'goal' ? '50%' : '100%' },
              ]}
            />
          </View>
        </View>

        {step === 'goal' ? (
          <>
            <Text style={styles.sectionTitle}>What is your main goal?</Text>
            {GOALS.map((goal) => (
              <Pressable
                key={goal.label}
                style={[styles.card, selectedGoal === goal.label && styles.cardSelected]}
                onPress={() => setSelectedGoal(goal.label)}
              >
                <Text style={styles.cardTitle}>{goal.label}</Text>
                <Text style={styles.cardDescription}>{goal.description}</Text>
              </Pressable>
            ))}
            <Pressable
              style={[styles.button, !selectedGoal && styles.buttonDisabled]}
              onPress={goToLevels}
              disabled={!selectedGoal}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>What level are you at?</Text>

            {levelsState.status === 'loading' && (
              <View style={styles.stateBox}>
                <ActivityIndicator size="large" color={colors.sky} />
                <Text style={styles.stateText}>Loading levels...</Text>
              </View>
            )}

            {levelsState.status === 'error' && (
              <View style={styles.stateBox}>
                <Text style={styles.errorText}>{levelsState.message}</Text>
                <Pressable style={styles.button} onPress={() => setLevelsRetry((n) => n + 1)}>
                  <Text style={styles.buttonText}>Try again</Text>
                </Pressable>
              </View>
            )}

            {levelsState.status === 'success' && levelsState.levels.length === 0 && (
              <View style={styles.stateBox}>
                <Text style={styles.stateText}>No levels available yet.</Text>
              </View>
            )}

            {levelsState.status === 'success' &&
              levelsState.levels.map((level) => (
                <Pressable
                  key={level.id}
                  style={[styles.card, selectedLevelId === level.id && styles.cardSelected]}
                  onPress={() => setSelectedLevelId(level.id)}
                >
                  <View style={styles.levelHeader}>
                    <Text style={styles.cardTitle}>{level.title}</Text>
                    {level.cefr_level && (
                      <View style={styles.cefrChip}>
                        <Text style={styles.cefrText}>{level.cefr_level}</Text>
                      </View>
                    )}
                  </View>
                  {level.description && (
                    <Text style={styles.cardDescription}>{level.description}</Text>
                  )}
                </Pressable>
              ))}

            {saveError && <Text style={styles.errorText}>{saveError}</Text>}

            {levelsState.status === 'success' && (
              <Pressable
                style={[styles.button, !selectedLevelId && styles.buttonDisabled]}
                onPress={finish}
                disabled={!selectedLevelId || saving}
              >
                <Text style={styles.buttonText}>
                  {saving ? 'Saving...' : 'Finish'}
                </Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    marginRight: 12,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: radius.button,
    backgroundColor: colors.grey,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.button,
    backgroundColor: colors.sun,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.paper,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: colors.sky,
    backgroundColor: '#EAF6FC',
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
  },
  cardDescription: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 4,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cefrChip: {
    backgroundColor: colors.sky,
    borderRadius: radius.bubble,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  cefrText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  stateBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  stateText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 12,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.coral,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.sky,
    borderRadius: radius.button,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});