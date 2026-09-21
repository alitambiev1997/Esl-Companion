import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '@/src/theme/tokens';

export function ContentImage({ url }: { url: string | null }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [aspect, setAspect] = useState<number | null>(null);
  const [boxWidth, setBoxWidth] = useState(0);

  if (!url) return null;

  if (failed) {
    return (
      <View style={styles.fallback}>
        <Ionicons name="image-outline" size={32} color={colors.greyDark} />
        <Text style={styles.fallbackText}>Image unavailable</Text>
      </View>
    );
  }

  const ratio = aspect && aspect > 0 ? aspect : 1.5;
  const height =
    boxWidth > 0 ? Math.round(Math.min(380, Math.max(140, boxWidth / ratio))) : 220;

  return (
    <View
      style={[styles.wrap, { height }]}
      onLayout={(e) => setBoxWidth(e.nativeEvent.layout.width)}
    >
      {!loaded && <View style={styles.placeholder} />}
      <Image
        source={{ uri: url }}
        style={styles.image}
        resizeMode="contain"
        onLoad={(e) => {
          setLoaded(true);
          const source = e.nativeEvent?.source;
          if (source?.width && source?.height) {
            setAspect(source.width / source.height);
          }
        }}
        onError={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.grey,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.grey,
  },
  fallback: {
    width: '100%',
    height: 120,
    borderRadius: radius.card,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.grey,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fallbackText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    opacity: 0.7,
    marginTop: 4,
  },
});