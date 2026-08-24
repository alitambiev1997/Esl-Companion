import { supabase } from '@/src/lib/supabase';

export async function ensureReviewItems(userId: string, levelId: string): Promise<void> {
  const { data: vocabRows, error: vocabError } = await supabase
    .from('vocabulary_items')
    .select('id')
    .eq('level_id', levelId)
    .eq('is_published', true);
  if (vocabError) throw new Error(vocabError.message);
  if (!vocabRows || vocabRows.length === 0) return;

  const now = new Date().toISOString();

  const { error: insertError } = await supabase.from('review_items').upsert(
    vocabRows.map((row) => ({
      user_id: userId,
      vocabulary_item_id: row.id,
      state: 'new',
      interval_days: 0,
      ease_factor: 2.5,
      due_at: now,
      repetition_count: 0,
    })),
    { onConflict: 'user_id,vocabulary_item_id', ignoreDuplicates: true }
  );
  if (insertError) throw new Error(insertError.message);
}