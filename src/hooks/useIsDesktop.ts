import { useUiScale } from '@/src/hooks/useUiScale';

export function useIsDesktop(): boolean {
  return useUiScale().isDesktop;
}