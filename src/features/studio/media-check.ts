import { contentImageUrl } from '@/src/lib/storage';

const cache = new Map<string, 'ok' | 'missing'>();

export async function findMissingImages(paths: string[]): Promise<Set<string>> {
  const missing = new Set<string>();
  const unique = Array.from(new Set(paths.map((path) => path.trim()).filter(Boolean)));
  await Promise.all(
    unique.map(async (path) => {
      const cached = cache.get(path);
      if (cached === 'missing') {
        missing.add(path);
        return;
      }
      if (cached === 'ok') return;
      const url = contentImageUrl(path);
      if (!url) return;
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          cache.set(path, 'ok');
          return;
        }
        if (response.status === 404) {
          cache.set(path, 'missing');
          missing.add(path);
        }
      } catch {
        // network issue - treat as unknown, never flag
      }
    })
  );
  return missing;
}
