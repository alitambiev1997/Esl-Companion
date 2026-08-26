do $$
declare
  v_dir uuid; v_rest uuid;
  sign_url text := 'PASTE_SIGN_URL';
  photo_url text := 'PASTE_PHOTO_URL';
begin
  select id into v_dir from public.lessons where title = 'Asking for directions';
  select id into v_rest from public.lessons where title = 'At the restaurant';

  insert into public.exercises (lesson_id, type, prompt, content, points, sort_order) values
  (v_dir, 'image_choice', 'Look at the sign, then answer.', jsonb_build_object(
    'image_url', sign_url,
    'prompt', 'You can enter here at midnight.',
    'options', jsonb_build_array('True', 'False'),
    'correct_index', 1,
    'explanation', 'Adjust to what your sign actually says.'
  ), 10, 4),
  (v_rest, 'image_choice', 'Tap the correct word.', jsonb_build_object(
    'image_url', photo_url,
    'options', jsonb_build_array('coffee', 'soup', 'bread'),
    'correct_index', 0,
    'explanation', 'Match to your photo.'
  ), 10, 4);
end $$;