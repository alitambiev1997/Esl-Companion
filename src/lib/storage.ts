const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

/**
 * Public storage URL pattern.
 * Content rows store paths inside a public bucket (e.g. "content");
 * the app resolves them to full URLs with this helper.
 */
export function publicStorageUrl(bucket: string, path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const encoded = path
    .split('/')
    .map((segment) => {
      let raw = segment;
      try {
        raw = decodeURIComponent(segment);
      } catch {
        raw = segment;
      }
      return encodeURIComponent(raw);
    })
    .join('/');
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encoded}`;
}

export function contentImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return publicStorageUrl('content', path);
}