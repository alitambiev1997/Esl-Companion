-- Content structure
create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  title text not null,
  cefr_level text not null,
  description text,
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references public.levels(id) on delete cascade,
  title text not null,
  description text,
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  title text not null,
  description text,
  estimated_minutes int not null default 5,
  pass_score numeric not null default 60,
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  type text not null,
  prompt text,
  content jsonb not null default '{}',
  audio_url text,
  image_url text,
  points int not null default 10,
  is_required boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.vocabulary_items (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references public.levels(id) on delete cascade,
  word text not null,
  definition text not null,
  example_sentence text,
  audio_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- Goal column for onboarding
alter table public.profiles add column if not exists goal text;

alter table public.profiles
add constraint profiles_current_level_fkey
foreign key (current_level_id) references public.levels(id) on delete set null;

-- Security: authenticated students can read published content
alter table public.programs enable row level security;
alter table public.levels enable row level security;
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.exercises enable row level security;
alter table public.vocabulary_items enable row level security;

create policy "Read published programs" on public.programs for select to authenticated using (is_published = true);
create policy "Read published levels" on public.levels for select to authenticated using (is_published = true);
create policy "Read published units" on public.units for select to authenticated using (is_published = true);
create policy "Read published lessons" on public.lessons for select to authenticated using (is_published = true);
create policy "Read exercises" on public.exercises for select to authenticated using (true);
create policy "Read published vocabulary" on public.vocabulary_items for select to authenticated using (is_published = true);

-- Seed: one program, two levels, one unit, one lesson, exercises, vocabulary
do $$
declare
  v_program uuid;
  v_level_a1 uuid;
  v_level_a2 uuid;
  v_unit uuid;
  v_lesson uuid;
begin
  insert into public.programs (title, description, is_published, sort_order)
  values ('General English', 'Everyday English for real life.', true, 1)
  returning id into v_program;

  insert into public.levels (program_id, title, cefr_level, description, is_published, sort_order)
  values (v_program, 'Beginner', 'A1', 'First words and simple sentences.', true, 1)
  returning id into v_level_a1;

  insert into public.levels (program_id, title, cefr_level, description, is_published, sort_order)
  values (v_program, 'Elementary', 'A2', 'Everyday situations and travel.', true, 2)
  returning id into v_level_a2;

  insert into public.units (level_id, title, description, is_published, sort_order)
  values (v_level_a2, 'At the Hotel', 'Check-in, problems, services, check-out.', true, 1)
  returning id into v_unit;

  insert into public.lessons (unit_id, title, description, estimated_minutes, is_published, sort_order)
  values (v_unit, 'Check-in', 'Reception phrases for arriving at a hotel.', 5, true, 1)
  returning id into v_lesson;

  insert into public.exercises (lesson_id, type, prompt, content, points, sort_order)
  values
    (v_lesson, 'multiple_choice', 'Choose the correct sentence.', jsonb_build_object(
      'options', jsonb_build_array(
        'I would like to check in, please.',
        'I would like check in, please.',
        'I would liking to check in.'
      ),
      'correct_index', 0,
      'explanation', 'Use "would like to" + verb for polite requests.'
    ), 10, 1),
    (v_lesson, 'fill_blank', 'I have a ___ for two nights.', jsonb_build_object(
      'correct_answers', jsonb_build_array('reservation', 'booking'),
      'explanation', 'Both "reservation" and "booking" are correct.'
    ), 10, 2),
    (v_lesson, 'word_order', 'Build the sentence.', jsonb_build_object(
      'words', jsonb_build_array('like', 'I', 'to', 'would', 'check', 'in'),
      'correct_sequence', jsonb_build_array('I', 'would', 'like', 'to', 'check', 'in'),
      'explanation', 'Subject + would like to + verb.'
    ), 10, 3),
    (v_lesson, 'matching', 'Match the words with their meanings.', jsonb_build_object(
      'pairs', jsonb_build_array(
        jsonb_build_object('left', 'reservation', 'right', 'a booking'),
        jsonb_build_object('left', 'luggage', 'right', 'bags and suitcases'),
        jsonb_build_object('left', 'reception', 'right', 'the front desk')
      )
    ), 10, 4);

  insert into public.vocabulary_items (level_id, word, definition, example_sentence, is_published)
  values
    (v_level_a2, 'reservation', 'a booking made in advance', 'I have a reservation for two nights.', true),
    (v_level_a2, 'luggage', 'bags and suitcases you travel with', 'My luggage is in the car.', true),
    (v_level_a2, 'reception', 'the front desk of a hotel', 'Ask at reception for your key.', true),
    (v_level_a2, 'check in', 'to arrive and register at a hotel', 'We can check in from 2 p.m.', true),
    (v_level_a2, 'complimentary', 'free of charge', 'Breakfast is complimentary for guests.', true);
end $$;