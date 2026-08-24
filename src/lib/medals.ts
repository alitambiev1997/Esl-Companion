import { colors } from '@/src/theme/tokens';

export type Medal = 'bronze' | 'silver' | 'gold' | 'platinum';

export function medalForScore(score: number): Medal | null {
  if (score >= 100) return 'platinum';
  if (score >= 90) return 'gold';
  if (score >= 80) return 'silver';
  if (score >= 60) return 'bronze';
  return null;
}

export function medalColor(medal: Medal | null): string | null {
  if (medal === 'bronze') return colors.bronze;
  if (medal === 'silver') return colors.silver;
  if (medal === 'gold') return colors.gold;
  if (medal === 'platinum') return colors.platinum;
  return null;
}