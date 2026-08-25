do $$
declare
  v_lesson uuid;
begin
  select id into v_lesson from public.lessons where title = 'Check-in' limit 1;

  insert into public.exercises (lesson_id, type, prompt, content, points, sort_order)
  values
    (v_lesson, 'reading_comprehension', 'Read the conversation, then answer.', jsonb_build_object(
      'dialogue', jsonb_build_array(
        jsonb_build_object('speaker', 'Receptionist', 'side', 'left', 'text', 'Good afternoon! How can I help you?'),
        jsonb_build_object('speaker', 'You', 'side', 'right', 'text', 'Hi! I would like to check in. I have a reservation.'),
        jsonb_build_object('speaker', 'Receptionist', 'side', 'left', 'text', 'Of course. Could I have your name, please?'),
        jsonb_build_object('speaker', 'You', 'side', 'right', 'text', 'Sure - it is Anna Novak.'),
        jsonb_build_object('speaker', 'Receptionist', 'side', 'left', 'text', 'Perfect. Here is your key - room 204.')
      ),
      'question', 'Which room is the guest getting?',
      'options', jsonb_build_array('Room 204', 'Room 240', 'Room 402', 'Room 202'),
      'correct_index', 0,
      'explanation', 'The receptionist says: room 204.'
    ), 10, 8);
end $$;