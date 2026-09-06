export type WebProgressEntry = {
  score: number;
  medal: string;
  at: number;
};

type WebStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

function webStorage(): WebStorage | undefined {
  return (globalThis as { localStorage?: WebStorage }).localStorage;
}

function progressKey(code: string): string {
  return `aqap_progress_${code}`;
}

export function readWebProgress(code: string): Record<string, WebProgressEntry> {
  const raw = webStorage()?.getItem(progressKey(code));
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, WebProgressEntry>;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function writeWebProgress(
  code: string,
  entries: Record<string, WebProgressEntry>
): void {
  webStorage()?.setItem(progressKey(code), JSON.stringify(entries));
}