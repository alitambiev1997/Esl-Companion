export type SrsGrade = 'again' | 'good' | 'easy';

export interface ReviewItemState {
  interval_days: number;
  ease_factor: number;
  state: string;
  repetition_count: number;
}

export interface GradedReviewItem extends ReviewItemState {
  due_at: string;
  last_reviewed_at: string;
}

export function applyGrade(
  card: ReviewItemState,
  grade: SrsGrade,
  now: Date
): GradedReviewItem {
  const last_reviewed_at = now.toISOString();

  if (grade === 'again') {
    return {
      interval_days: 0,
      ease_factor: Math.max(1.3, card.ease_factor - 0.2),
      state: 'learning',
      repetition_count: 0,
      due_at: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
      last_reviewed_at,
    };
  }

  if (grade === 'good') {
    const interval_days =
      card.interval_days === 0 ? 1 : Math.round(card.interval_days * card.ease_factor);
    return {
      interval_days,
      ease_factor: card.ease_factor,
      state: 'review',
      repetition_count: card.repetition_count + 1,
      due_at: addDays(now, interval_days).toISOString(),
      last_reviewed_at,
    };
  }

  const interval_days =
    card.interval_days === 0 ? 3 : Math.round(card.interval_days * card.ease_factor * 1.3);
  return {
    interval_days,
    ease_factor: card.ease_factor + 0.1,
    state: 'review',
    repetition_count: card.repetition_count + 1,
    due_at: addDays(now, interval_days).toISOString(),
    last_reviewed_at,
  };
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}