create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'not_started',
  score numeric,
  xp_earned int not null default 0,
  completed_at timestamptz,
  last_accessed_at timestamptz,
  unique (user_id, lesson_id)
);

create table if not exists public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  user_answer jsonb,
  is_correct boolean not null,
  time_spent_seconds int,
  created_at timestamptz not null default now()
);

alter table public.lesson_progress enable row level security;
alter table public.exercise_attempts enable row level security;

create policy "Users manage own lesson progress"
on public.lesson_progress for all to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own attempts"
on public.exercise_attempts for all to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);