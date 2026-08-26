import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '@/src/theme/tokens';

export function ContentImage({ url }: { url: string | null }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!url) return null;

  if (failed) {
    return (
      <View style={styles.fallback}>
        <Ionicons name="image-outline" size={32} color={colors.greyDark} />
        <Text style={styles.fallbackText}>Image unavailable</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {!loaded && <View style={styles.placeholder} />}
      <Image
        source={{ uri: url }}
        style={styles.image}
        resizeMode="cover"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxHeight: 220,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.grey,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    maxHeight: 220,
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