import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { exerciseMeta, samplesByType } from '@/src/dev/sampleExercises';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { ExerciseType } from '@/src/types/content';

const GROUPS: { title: string; types: ExerciseType[] }[] = [
  { title: 'Choice', types: ['multiple_choice', 'listening_multiple_choice', 'inline_choice', 'error_spot', 'stress_tap', 'silent_letter', 'image_choice'] },
  { title: 'Production', types: ['fill_blank', 'word_order', 'matching', 'listening_dictation', 'listening_word_order', 'sentence_order', 'word_sort', 'form_fill'] },
  { title: 'Communication', types: ['speaking_recording', 'context_fill', 'document_reader'] },
  { title: 'Other', types: ['reading_comprehension', 'flashcard_flip', 'flashcard'] },
];

export default function Testing() {
  const router = useRouter();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Exercise catalog</Text>
      <Text style={styles.subtitle}>Dev-only sandbox. Answers are logged, nothing is saved.</Text>

      {GROUPS.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text style={styles.groupTitle}>{group.title}</Text>

          {group.types.map((type) => {
            const ready = samplesByType[type].length > 0;
            return (
              <Pressable
                key={type}
                style={styles.tile}
                onPress={() =>
                  router.push({
                    pathname: '/testing/[type]',
                    params: { type },
                  })
                }
              >
                <View style={styles.tileHeader}>
                  <Text style={styles.tileName}>{type}</Text>
                  <View style={[styles.chip, ready ? styles.chipReady : styles.chipNo]}>
                    <Text style={styles.chipText}>{ready ? 'ready' : 'no renderer'}</Text>
                  </View>
                </View>
                <Text style={styles.tileDescription}>{exerciseMeta[type]}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
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
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    marginBottom: 24,
  },
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 12,
  },
  tile: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 16,
    marginBottom: 12,
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tileName: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
  },
  tileDescription: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 4,
  },
  chip: {
    borderRadius: radius.bubble,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  chipReady: {
    backgroundColor: colors.leaf,
  },
  chipNo: {
    backgroundColor: colors.grey,
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
});