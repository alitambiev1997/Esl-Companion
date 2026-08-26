do $$
declare
  v_checkin uuid; v_problems uuid; v_services uuid; v_checkout uuid; v_rest uuid;
begin
  select id into v_checkin from public.lessons where title = 'Check-in';
  select id into v_problems from public.lessons where title = 'Problems';
  select id into v_services from public.lessons where title = 'Services';
  select id into v_checkout from public.lessons where title = 'Check-out';
  select id into v_rest from public.lessons where title = 'At the restaurant';

  insert into public.exercises (lesson_id, type, prompt, content, points, sort_order) values
  (v_problems, 'error_spot', 'Tap the mistake, then fix it.', jsonb_build_object(
    'words', jsonb_build_array('I', 'have', '40', 'years.'),
    'wrong_index', 1,
    'options', jsonb_build_array('am', 'has', 'have got'),
    'correct_index', 0,
    'explanation', 'Age: I am 40 years old.'
  ), 10, 5),
  (v_services, 'stress_tap', 'Tap the stressed syllable.', jsonb_build_object(
    'syllables', jsonb_build_array('re', 'cep', 'tion'),
    'correct_index', 1,
    'text_to_speak', 'reception',
    'explanation', 're-CEP-tion.'
  ), 10, 5),
  (v_checkout, 'silent_letter', 'Tap the silent letter.', jsonb_build_object(
    'letters', jsonb_build_array('r', 'e', 'c', 'e', 'i', 'p', 't'),
    'correct_index', 5,
    'explanation', 'The p in receipt is silent.'
  ), 10, 5),
  (v_rest, 'word_sort', 'Sort the words.', jsonb_build_object(
    'categories', jsonb_build_array('Things you eat', 'Things you drink'),
    'items', jsonb_build_array(
      jsonb_build_object('word', 'soup', 'category', 0),
      jsonb_build_object('word', 'lemonade', 'category', 1),
      jsonb_build_object('word', 'bread', 'category', 0),
      jsonb_build_object('word', 'coffee', 'category', 1),
      jsonb_build_object('word', 'salad', 'category', 0),
      jsonb_build_object('word', 'tea', 'category', 1)
    )
  ), 10, 4),
  (v_checkin, 'form_fill', 'Complete the check-in form.', jsonb_build_object(
    'title', 'Check-in form',
    'fields', jsonb_build_array(
      jsonb_build_object('prompt', 'I would like to ___ a double room.',
        'options', jsonb_build_array('book', 'booking', 'books'), 'correct_index', 0),
      jsonb_build_object('prompt', 'My name ___ Anna Novak.',
        'options', jsonb_build_array('is', 'are', 'am'), 'correct_index', 0),
      jsonb_build_object('prompt', 'I will pay ___ card.',
        'options', jsonb_build_array('by', 'with', 'on'), 'correct_index', 0)
    )
  ), 10, 9),
  (v_checkout, 'document_reader', 'Read the board, then answer.', jsonb_build_object(
    'document_lines', jsonb_build_array('HOTEL ALFA', 'Check-out: 10:00', 'Breakfast: 7:00-10:00', 'Wi-Fi: ALFA2024'),
    'questions', jsonb_build_array(
      jsonb_build_object('question', 'What time is check-out?',
        'options', jsonb_build_array('10:00', '12:00', '7:00'), 'correct_index', 0,
        'explanation', 'The board says 10:00.'),
      jsonb_build_object('question', 'When is breakfast served?',
        'options', jsonb_build_array('7:00-10:00', 'All day', 'After 10:00'), 'correct_index', 0,
        'explanation', '7:00-10:00 on the board.')
    )
  ), 10, 6),
  (v_rest, 'best_reply', 'Choose the best reply.', jsonb_build_object(
    'steps', jsonb_build_array(
      jsonb_build_object(
        'lines', jsonb_build_array(jsonb_build_object('speaker', 'Waiter', 'side', 'left', 'text', 'Good evening. Table for two?')),
        'options', jsonb_build_array('Yes, a table for two, please.', 'Yes, we are.', 'It is two o''clock.'),
        'correct_index', 0,
        'explanation', 'Polite and clear.',
        'reply', 'Yes, a table for two, please.'
      ),
      jsonb_build_object(
        'lines', jsonb_build_array(jsonb_build_object('speaker', 'Waiter', 'side', 'left', 'text', 'Of course. Would you like the menu?')),
        'options', jsonb_build_array('Yes, please.', 'Yes, we would like you.', 'The menu is us.'),
        'correct_index', 0,
        'explanation', 'Short and polite: Yes, please.',
        'reply', 'Yes, please.'
      )
    )
  ), 10, 5);
end $$;