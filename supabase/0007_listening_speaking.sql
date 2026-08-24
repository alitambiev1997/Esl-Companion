do $$
declare
  v_lesson uuid;
begin
  select id into v_lesson from public.lessons where title = 'Check-in' limit 1;

  insert into public.exercises (lesson_id, type, prompt, content, points, sort_order)
  values
    (v_lesson, 'listening_multiple_choice', 'Listen and choose what you heard.', jsonb_build_object(
      'text_to_speak', 'I have a reservation for two nights.',
      'options', jsonb_build_array(
        'I have a reservation for two nights.',
        'I have a room for two nights.',
        'I have a reservation for tonight.'
      ),
      'correct_index', 0
    ), 10, 5),
    (v_lesson, 'listening_dictation', 'Listen and type what you hear.', jsonb_build_object(
      'text_to_speak', 'My luggage is in the car.',
      'accepted', jsonb_build_array('My luggage is in the car.')
    ), 10, 6),
    (v_lesson, 'speaking_recording', 'Say it out loud.', jsonb_build_object(
      'text_to_speak', 'I would like to check in, please.'
    ), 10, 7);

  update public.exercises set is_required = false where type = 'speaking_recording';
end $$;