import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { publicStorageUrl } from '@/src/lib/storage';
import { colors, fonts, radius } from '@/src/theme/tokens';

const SPEEDS = [1, 1.25, 0.75];

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}

export function UnitRecording({
  unitId,
  title,
  path,
}: {
  unitId: string;
  title: string;
  path: string;
}) {
  const url = publicStorageUrl('content', path);
  const resumeKey = `aqap_rec_${unitId}`;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSave = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [trackWidth, setTrackWidth] = useState(0);

  const ensureAudio = () => {
    if (!audioRef.current) {
      const audio = new Audio(url);
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => setDuration(audio.duration || 0);
      audio.ontimeupdate = () => {
        setCurrent(audio.currentTime);
        const now = Date.now();
        if (now - lastSave.current > 3000) {
          localStorage.setItem(resumeKey, String(audio.currentTime));
          lastSave.current = now;
        }
      };
      audio.onplay = () => setPlaying(true);
      audio.onpause = () => setPlaying(false);
      audio.onended = () => {
        setPlaying(false);
        localStorage.removeItem(resumeKey);
      };
      audioRef.current = audio;

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title,
          artist: 'AQAP English',
        });
        navigator.mediaSession.setActionHandler('play', () => {
          void audio.play();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          audio.pause();
        });
      }
    }
    return audioRef.current;
  };

  const toggle = async () => {
    const audio = ensureAudio();
    if (audio.paused) {
      const saved = Number(localStorage.getItem(resumeKey) ?? '0');
      if (saved > 2 && audio.currentTime < 1 && saved < (duration || saved + 1) - 10) {
        try {
          audio.currentTime = saved;
        } catch {
          // seek not ready yet - ignore
        }
      }
      await audio.play();
    } else {
      audio.pause();
    }
  };

  const cycleRate = () => {
    const next = ensureAudio();
    const index = SPEEDS.indexOf(rate);
    const nextRate = SPEEDS[(index + 1) % SPEEDS.length];
    setRate(nextRate);
    next.playbackRate = nextRate;
  };

  const seek = (fraction: number) => {
    const audio = ensureAudio();
    const target = Math.max(0, Math.min(duration || 0, fraction * (duration || 0)));
    if (duration > 0) audio.currentTime = target;
  };

  const download = () => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = path.split('/').pop() ?? 'recording.mp3';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  useEffect(
    () => () => {
      audioRef.current?.pause();
      audioRef.current = null;
    },
    []
  );

  const progress = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Pressable style={styles.playButton} onPress={toggle}>
          <Text style={styles.playText}>{playing ? '❚❚' : '▶'}</Text>
        </Pressable>
        <View style={styles.info}>
          <Text style={styles.caption}>Unit recording</Text>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.time}>
            {formatTime(current)} / {formatTime(duration)}
          </Text>
        </View>
        <Pressable style={styles.speedButton} onPress={cycleRate}>
          <Text style={styles.speedText}>{rate}×</Text>
        </Pressable>
      </View>
      <View style={styles.trackWrap} onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress}%` }]} />
        </View>
        <Pressable
          style={styles.trackHit}
          onPress={(e) => seek(e.nativeEvent.locationX / Math.max(trackWidth, 1))}
        />
      </View>
      <Pressable style={styles.downloadButton} onPress={download} hitSlop={8}>
        <Text style={styles.downloadText}>Download</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 16,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.sun,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playText: {
    fontFamily: fonts.body,
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '600',
    color: colors.sky,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
  },
  time: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
  },
  speedButton: {
    borderWidth: 2,
    borderColor: colors.sky,
    borderRadius: radius.button,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.skyTint,
  },
  speedText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.sky,
  },
  trackWrap: {
    height: 14,
    justifyContent: 'center',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.grey,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.sky,
  },
  trackHit: {
    ...StyleSheet.absoluteFillObject,
  },
  downloadButton: {
    alignSelf: 'flex-start',
  },
  downloadText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: colors.sky,
    textDecorationLine: 'underline',
  },
});