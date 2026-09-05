export const CLASS_CODES: Record<string, string> = {
  'AQAP-A2': 'A2',
};

const WEB_STORAGE_KEY = 'aqap_code';

type WebStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function webStorage(): WebStorage | undefined {
  return (globalThis as { localStorage?: WebStorage }).localStorage;
}

export function getClassCode(): string | null {
  return webStorage()?.getItem(WEB_STORAGE_KEY) ?? null;
}

export function saveClassCode(code: string): void {
  webStorage()?.setItem(WEB_STORAGE_KEY, code);
}

export function clearClassCode(): void {
  webStorage()?.removeItem(WEB_STORAGE_KEY);
}