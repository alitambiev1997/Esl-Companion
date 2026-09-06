const CODE_KEY = 'aqap_code';
const LEVEL_KEY = 'aqap_level';

type WebStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

function webStorage(): WebStorage | undefined {
  return (globalThis as { localStorage?: WebStorage }).localStorage;
}

export function getClassCode(): string | null {
  return webStorage()?.getItem(CODE_KEY) ?? null;
}

export function saveClassCode(code: string): void {
  webStorage()?.setItem(CODE_KEY, code);
}

export function clearClassCode(): void {
  webStorage()?.removeItem(CODE_KEY);
}

export function getClassLevelId(): string | null {
  return webStorage()?.getItem(LEVEL_KEY) ?? null;
}

export function saveClassLevelId(levelId: string): void {
  webStorage()?.setItem(LEVEL_KEY, levelId);
}

export function clearClassLevelId(): void {
  webStorage()?.removeItem(LEVEL_KEY);
}