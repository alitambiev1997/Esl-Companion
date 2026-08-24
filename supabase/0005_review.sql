create table if not exists public.review_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vocabulary_item_id uuid not null references public.vocabulary_items(id) on delete cascade,
  ease_factor numeric not null default 2.5,
  interval_days int not null default 0,
  repetition_count int not null default 0,
  state text not null default 'new',
  due_at timestamptz not null default now(),
  last_reviewed_at timestamptz,
  unique (user_id, vocabulary_item_id)
);

create table if not exists public.daily_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_date date not null,
  xp int not null default 0,
  minutes_practiced int not null default 0,
  lessons_completed int not null default 0,
  reviews_completed int not null default 0,
  unique (user_id, activity_date)
);

alter table public.review_items enable row level security;
alter table public.daily_activity enable row level security;

drop policy if exists "Users manage own review items" on public.review_items;
create policy "Users manage own review items"
on public.review_items for all to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users manage own daily activity" on public.daily_activity;
create policy "Users manage own daily activity"
on public.daily_activity for all to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);