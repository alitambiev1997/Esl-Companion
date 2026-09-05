export type WebProgressEntry = {
  score: number;
  medal: string;
  at: number;
};

const WEB_PROGRESS_KEY = 'aqap_progress';

type WebStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function webStorage(): WebStorage | undefined {
  return (globalThis as { localStorage?: WebStorage }).localStorage;
}

export function readWebProgress(): Record<string, WebProgressEntry> {
  const raw = webStorage()?.getItem(WEB_PROGRESS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, WebProgressEntry>;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function writeWebProgress(entries: Record<string, WebProgressEntry>): void {
  webStorage()?.setItem(WEB_PROGRESS_KEY, JSON.stringify(entries));
}

export function clearWebProgress(): void {
  webStorage()?.removeItem(WEB_PROGRESS_KEY);
}