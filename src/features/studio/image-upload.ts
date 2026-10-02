const MB = 1024 * 1024;
const MAX_WIDTH = 1600;
const JPEG_QUALITY = 0.85;

export function fileSizeMB(file: Blob): number {
  return file.size / MB;
}

export function sanitizeName(name: string): string {
  return (
    name
      .replace(/\.[^.]+$/, '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'image'
  );
}

async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not available');
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
  );
  if (!blob) throw new Error('Compression failed');
  return blob;
}

export interface UploadResult {
  path?: string;
  error?: string;
}

export async function uploadContentImage(
  file: File,
  compress: boolean,
  upload: (path: string, blob: Blob, contentType: string) => Promise<string | null>
): Promise<UploadResult> {
  let blob: Blob = file;
  let extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() ?? 'jpg' : 'jpg';
  if (compress && file.type.startsWith('image/')) {
    try {
      blob = await compressImage(file);
      extension = 'jpg';
    } catch {
      blob = file;
    }
  }
  if (blob.size > 5 * MB) {
    const size = fileSizeMB(blob).toFixed(1);
    const proceed = window.confirm(
      `This image is ${size} MB. Large images load slowly for students and use up the free bandwidth quickly. Upload anyway?`
    );
    if (!proceed) return { error: 'Upload cancelled - the image is larger than 5 MB.' };
  }
  const path = `uploads/${Date.now()}-${sanitizeName(file.name)}.${extension}`;
  const error = await upload(path, blob, blob.type || 'image/jpeg');
  if (error) return { error };
  return { path };
}

export async function uploadContentAudio(
  file: File,
  upload: (path: string, blob: Blob, contentType: string) => Promise<string | null>
): Promise<UploadResult> {
  if (fileSizeMB(file) > 10) {
    const size = fileSizeMB(file).toFixed(1);
    const proceed = window.confirm(
      `This audio is ${size} MB. Large files use up the free bandwidth quickly. Upload anyway?`
    );
    if (!proceed) return { error: 'Upload cancelled - the audio is larger than 10 MB.' };
  }
  const extension =
    file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() ?? 'mp3' : 'mp3';
  const path = `audio/${sanitizeName(file.name)}-${Date.now()}.${extension}`;
  const error = await upload(path, file, file.type || 'audio/mpeg');
  if (error) return { error };
  return { path };
}