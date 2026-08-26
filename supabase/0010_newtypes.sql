do $$
declare
  v_problems uuid; v_services uuid; v_checkout uuid; v_dir uuid; v_rest uuid;
begin
  select id into v_problems from public.lessons where title = 'Problems';
  select id into v_services from public.lessons where title = 'Services';
  select id into v_checkout from public.lessons where title = 'Check-out';
  select id into v_dir from public.lessons where title = 'Asking for directions';
  select id into v_rest from public.lessons where title = 'At the restaurant';

  insert into public.exercises (lesson_id, type, prompt, content, points, sort_order)
  values
    (v_problems, 'inline_choice', 'Tap the correct word.', jsonb_build_object(
      'sentence', 'The shower ___ not work.',
      'options', jsonb_build_array('do', 'does', 'is'),
      'correct_index', 1,
      'explanation', 'Singular subject -> does.',
      'tip', 'Jednotné číslo -> does.'
    ), 10, 4),

    (v_services, 'context_fill', 'Complete the conversation.', jsonb_build_object(
      'dialogue', jsonb_build_array(
        jsonb_build_object('speaker', 'Receptionist', 'side', 'left', 'text', 'Good afternoon, how can I help you?'),
        jsonb_build_object('speaker', 'You', 'side', 'right', 'text', 'I ___ like a wake-up call, please.'),
        jsonb_build_object('speaker', 'Receptionist', 'side', 'left', 'text', 'Of course. What time?')
      ),
      'options', jsonb_build_array('would', 'will', 'am'),
      'correct_index', 0,
      'explanation', 'Polite requests use "would like".'
    ), 10, 4),

    (v_checkout, 'sentence_order', 'Put the conversation in order.', jsonb_build_object(
      'correct_sequence', jsonb_build_array(
        'I would like to check out.',
        'Here is your bill.',
        'Thank you, have a nice day!'
      ),
      'explanation', 'Request -> response -> goodbye.'
    ), 10, 4),

    (v_dir, 'listening_word_order', 'Listen and build what you hear.', jsonb_build_object(
      'text_to_speak', 'Go straight on this street.',
      'correct_sequence', jsonb_build_array('Go', 'straight', 'on', 'this', 'street'),
      'explanation', 'Imperative + direction + place.'
    ), 10, 3),

    (v_rest, 'flashcard_flip', 'Study card.', jsonb_build_object(
      'front', 'jídelní lístek',
      'back', 'menu',
      'example', 'Could we have the menu, please?',
      'text_to_speak', 'menu'
    ), 10, 3);
end $$;