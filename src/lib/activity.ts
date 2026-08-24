import { supabase } from '@/src/lib/supabase';

export interface DailyActivity {
  id: string;
  user_id: string;
  activity_date: string;
  xp: number;
  lessons_completed: number;
  reviews_completed: number;
  minutes_practiced: number;
}

export interface ActivityDeltas {
  lessonsCompleted?: number;
  reviewsCompleted?: number;
  minutesPracticed?: number;
}

export async function addDailyActivity(
  userId: string,
  deltas: ActivityDeltas
): Promise<{ previous: DailyActivity | null; row: DailyActivity | null }> {
  const today = new Date().toISOString().slice(0, 10);

  const { data: previous } = await supabase
    .from('daily_activity')
    .select('*')
    .eq('user_id', userId)
    .eq('activity_date', today)
    .maybeSingle();

  const row = {
    user_id: userId,
    activity_date: today,
    lessons_completed: (previous?.lessons_completed ?? 0) + (deltas.lessonsCompleted ?? 0),
    reviews_completed: (previous?.reviews_completed ?? 0) + (deltas.reviewsCompleted ?? 0),
    minutes_practiced: (previous?.minutes_practiced ?? 0) + (deltas.minutesPracticed ?? 0),
  };

  const { data, error } = await supabase
    .from('daily_activity')
    .upsert(row, { onConflict: 'user_id,activity_date' });

  if (error) {
    throw new Error(error.message);
  }

  return { previous, row: (data?.[0] as unknown as DailyActivity) ?? null };
}