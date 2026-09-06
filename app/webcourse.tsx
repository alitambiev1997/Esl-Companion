import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PathMap, type ProgressMap } from '@/src/components/PathMap';
import { TopBar } from '@/src/components/ui/TopBar';
import { useIsDesktop } from '@/src/hooks/useIsDesktop';
import { clearClassCode, clearClassLevelId, getClassCode, getClassLevelId } from '@/src/lib/class-code';
import { supabase } from '@/src/lib/supabase';
import { readWebProgress } from '@/src/lib/web-progress';
import { hoverStyle } from '@/src/lib/web-hover';
import { colors, fonts, radius } from '@/src/theme/tokens';
import type { Lesson, Unit } from '@/src/types/content';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty'; message: string }
  | { status: 'ready'; units: Unit[]; lessons: Lesson[]; progressMap: ProgressMap };

export default function WebCourse() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [levelTitle, setLevelTitle] = useState<string | null>(null);
  const loadStateRef = useRef(loadState);
  loadStateRef.current = loadState;

  const storedCode = getClassCode();
  const levelId = getClassLevelId();

  const loadCourse = useCallback(() => {
    if (!storedCode || !levelId) {
      router.replace('/gate');
      return;
    }

    let mounted = true;
    if (loadStateRef.current.status !== 'ready') {
      setLoadState({ status: 'loading' });
    }

    (async () => {
      const levelQuery = supabase
        .from('levels')
        .select('id,title')
        .eq('id', levelId)
        .eq('is_published', true)
        .maybeSingle();

      const [levelRes, progressMap] = await Promise.all([
        levelQuery,
        Promise.resolve(readWebProgress(storedCode)),
      ]);

      if (!mounted) return;

      if (levelRes.error) {
        setLoadState({ status: 'error', message: levelRes.error.message });
        return;
      }
      if (!levelRes.data) {
        setLoadState({ status: 'empty', message: 'This code is not linked to a course yet.' });
        return;
      }
      setLevelTitle(levelRes.data.title);

      const unitsQuery = supabase
        .from('units')
        .select('*')
        .eq('level_id', levelRes.data.id)
        .eq('is_published', true)
        .order('sort_order');
      const lessonsQuery = supabase
        .from('lessons')
        .select('*')
        .eq('is_published', true)
        .order('sort_order');

      const [unitsRes, lessonsRes] = await Promise.all([unitsQuery, lessonsQuery]);

      if (!mounted) return;

      if (unitsRes.error || lessonsRes.error) {
        setLoadState({
          status: 'error',
          message: unitsRes.error?.message ?? lessonsRes.error?.message ?? 'Failed to load course',
        });
        return;
      }

      const units = unitsRes.data as Unit[];
      const lessons = lessonsRes.data as Lesson[];
      if (units.length === 0) {
        setLoadState({ status: 'empty', message: 'No units available yet.' });
        return;
      }

      const webProgress: ProgressMap = {};
      for (const [lessonId, entry] of Object.entries(progressMap)) {
        webProgress[lessonId] = { completed: entry.score >= 60, score: entry.score };
      }

      setLoadState({ status: 'ready', units, lessons, progressMap: webProgress });
    })();

    return () => {
      mounted = false;
    };
  }, [storedCode, levelId, router]);

  useFocusEffect(
    useCallback(() => {
      loadCourse();
    }, [loadCourse])
  );

  const switchCode = () => {
    clearClassCode();
    clearClassLevelId();
    router.replace('/gate');
  };

  const onLessonPress = (lesson: Lesson) => {
    router.push({
      pathname: '/lesson/[id]',
      params: { id: lesson.id, from: 'webcourse' },
    });
  };

  if (loadState.status === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.sky} />
      </View>
    );
  }

  if (loadState.status === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{loadState.message}</Text>
        <Pressable style={styles.buttonSecondary} onPress={() => loadCourse()}>
          <Text style={styles.buttonSecondaryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (loadState.status === 'empty') {
    return (
      <View style={styles.container}>
        <Text style={styles.stateText}>{loadState.message}</Text>
        <Pressable style={styles.buttonSecondary} onPress={switchCode}>
          <Text style={styles.buttonSecondaryText}>Switch code</Text>
        </Pressable>
      </View>
    );
  }

  const completedCount = Object.values(loadState.progressMap).filter((p) => p.completed).length;

  return (
    <View style={styles.screen}>
      <TopBar title="Your course" />
      {isDesktop ? (
        <View style={styles.desktopRow}>
          <ScrollView style={styles.mapColumn} contentContainerStyle={styles.content}>
            <PathMap
              units={loadState.units}
              lessons={loadState.lessons}
              progressMap={loadState.progressMap}
              onLessonPress={onLessonPress}
            />
          </ScrollView>
          <View style={styles.sidePanel}>
            {levelTitle && <Text style={styles.panelTitle}>{levelTitle}</Text>}
            <Text style={styles.panelCaption}>
              {completedCount} of {loadState.lessons.length} lessons done
            </Text>
            <View style={styles.legend}>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: colors.bronze }]} />
                <Text style={styles.legendLabel}>Bronze</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: colors.silver }]} />
                <Text style={styles.legendLabel}>Silver</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: colors.gold }]} />
                <Text style={styles.legendLabel}>Gold</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: colors.platinum }]} />
                <Text style={styles.legendLabel}>Platinum</Text>
              </View>
            </View>
            <View style={styles.panelButtons}>
              <Pressable
                style={({ hovered }) => [styles.panelButton, styles.panelButtonSky, hoverStyle(hovered)]}
                onPress={switchCode}
              >
                <Text style={styles.panelButtonSkyText}>Switch code</Text>
              </Pressable>
              <Pressable
                style={({ hovered }) => [styles.panelButton, styles.panelButtonSun, hoverStyle(hovered)]}
                onPress={() => router.replace('/placement')}
              >
                <Text style={styles.panelButtonSunText}>Test your level</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>code: {storedCode}</Text>
            <Pressable onPress={switchCode} hitSlop={8}>
              <Text style={styles.switchText}>switch code</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            <PathMap
              units={loadState.units}
              lessons={loadState.lessons}
              progressMap={loadState.progressMap}
              onLessonPress={onLessonPress}
            />
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.paper,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 48,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 8,
  },
  codeText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.greyDark,
  },
  switchText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.sky,
    textDecorationLine: 'underline',
  },
  desktopRow: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 24,
  },
  mapColumn: {
    flex: 1,
    maxWidth: 560,
  },
  sidePanel: {
    width: 320,
    paddingTop: 24,
  },
  panelTitle: {
    fontFamily: fonts.display,
    fontSize: 26,
    color: colors.ink,
  },
  panelCaption: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 4,
    marginBottom: 20,
  },
  legend: {
    gap: 10,
    marginBottom: 24,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendLabel: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  panelButtons: {
    gap: 12,
  },
  panelButton: {
    borderRadius: radius.button,
    paddingVertical: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelButtonSky: {
    backgroundColor: colors.sky,
  },
  panelButtonSkyText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  panelButtonSun: {
    backgroundColor: colors.sun,
  },
  panelButtonSunText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  stateText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.coral,
    textAlign: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.sky,
    borderRadius: radius.button,
    paddingVertical: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonSecondaryText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});