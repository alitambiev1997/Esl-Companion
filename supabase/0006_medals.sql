alter table public.lessons alter column pass_score set default 60;
update public.lessons set pass_score = 60 where pass_score = 70;