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
  const trackRef = useRef<View>(null);
  const lastSave = useRef(0);
  const pendingSeek = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);

  const ensureAudio = () => {
    if (!audioRef.current) {
      const audio = new Audio(url);
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => {
        setDuration(audio.duration || 0);
        if (pendingSeek.current !== null) {
          try {
            audio.currentTime = pendingSeek.current;
          } catch {
            // seek will apply once ready
          }
          pendingSeek.current = null;
        }
      };
      audio.ontimeupdate = () => {
        setCurrent(audio.currentTime);
        const now = Date.now();
        if (now - lastSave.current > 3000) {
          localStorage.setItem(resumeKey, String(audio.currentTime));
          lastSave.current = now;
        }
        if ('mediaSession' in navigator && audio.duration) {
          try {
            navigator.mediaSession.setPositionState({
              duration: audio.duration,
              playbackRate: audio.playbackRate,
              position: audio.currentTime,
            });
          } catch {
            // position state unsupported
          }
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
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime != null) audio.currentTime = details.seekTime;
        });
        navigator.mediaSession.setActionHandler('seekbackward', () => {
          audio.currentTime = Math.max(0, audio.currentTime - 15);
        });
        navigator.mediaSession.setActionHandler('seekforward', () => {
          audio.currentTime = Math.min(audio.duration || audio.currentTime + 15, audio.currentTime + 15);
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
    const audio = ensureAudio();
    const index = SPEEDS.indexOf(rate);
    const nextRate = SPEEDS[(index + 1) % SPEEDS.length];
    setRate(nextRate);
    audio.playbackRate = nextRate;
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setPositionState({
          duration: audio.duration || 0,
          playbackRate: nextRate,
          position: audio.currentTime,
        });
      } catch {
        // position state unsupported
      }
    }
  };

  const seekToRef = useRef<(seconds: number) => void>(() => {});
  seekToRef.current = (seconds: number) => {
    const audio = ensureAudio();
    if (audio.duration) {
      audio.currentTime = Math.max(0, Math.min(audio.duration, seconds));
    } else {
      pendingSeek.current = Math.max(0, seconds);
    }
  };

  useEffect(() => {
    const node = trackRef.current as unknown as HTMLElement | null;
    if (!node) return;
    const onClick = (event: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      if (rect.width <= 0) return;
      const fraction = (event.clientX - rect.left) / rect.width;
      const audio = ensureAudio();
      seekToRef.current(fraction * (audio.duration || 0));
    };
    node.addEventListener('click', onClick);
    return () => node.removeEventListener('click', onClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    ensureAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <View ref={trackRef} style={styles.trackWrap}>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress}%` }]} />
        </View>
        <Pressable
          style={styles.trackHit}
          onPress={(event) => {
            const node = trackRef.current as unknown as HTMLElement | null;
            const rect = node?.getBoundingClientRect();
            const pageX = event.nativeEvent.pageX ?? 0;
            if (rect && rect.width > 0) {
              const fraction = (pageX - rect.left) / rect.width;
              seekToRef.current(fraction * duration);
            }
          }}
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
    height: 24,
    justifyContent: 'center',
    cursor: 'pointer',
  },
  trackHit: {
    ...StyleSheet.absoluteFillObject,
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