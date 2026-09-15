-- LESSONS
do $$
declare v_unit uuid;
begin
  select u.id into v_unit
  from public.units u
  join public.levels l on l.id = u.level_id
  where l.cefr_level = 'A1' and u.title = 'Greetings & introduction';

  insert into public.lessons
    (unit_id, title, description, estimated_minutes, is_published, sort_order)
  select v_unit, x.title, x.description, x.minutes, true, x.sort_order
  from (values
    ('Meet the People', 'Introductory - People vocabulary with pictures, plurals and word stress', 5, 1),
    ('Greetings & Farewells', 'Introductory - Greetings, farewells and polite replies', 5, 2),
    ('Subject Pronouns', 'Grammatical - Subject pronouns I, you, he, she, it, we, they', 6, 3),
    ('Possessive Adjectives', 'Grammatical - Possessive adjectives my, your, his, her, its, our, their', 6, 4),
    ('Unit 1 Review check', 'Revisionary - Mixed practice of greetings, spelling and pronouns', 5, 5),
    ('Introducing Yourself', 'Practical - Introduce yourself in real dialogues and forms', 6, 6),
    ('Asking Questions', 'Practical - Ask and answer what, how and where questions', 6, 7),
    ('Real People Introductions', 'Practical - Listen to and read authentic introductions', 7, 8),
    ('Pronouns Mastery', 'Revisionary - Subject vs possessive pronouns under pressure', 6, 9),
    ('Final Challenge', 'Revisionary - Full-unit challenge with a speaking finish', 8, 10)
  ) as x(title, description, minutes, sort_order)
  where not exists (
    select 1 from public.lessons z
    where z.unit_id = v_unit and z.title = x.title
  );
end $$;

-- LESSON 1: Meet the People
do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction' and l.title = 'Meet the People';

  insert into public.exercises (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values
    ('flashcard_flip', 'Flip the card and learn the Czech word.',
     '{"front": "boy", "back": "chlapec", "example": "This is a boy.", "text_to_speak": "This is a boy.", "image_key": "boy"}'::jsonb, false, 1),
    ('flashcard_flip', 'Flip the card and learn the Czech word.',
     '{"front": "girl", "back": "dívka, holka", "example": "She is a girl.", "text_to_speak": "She is a girl.", "image_key": "girl"}'::jsonb, false, 2),
    ('image_choice', 'Listen and choose the correct word.',
     '{"image_key": "boys", "text_to_speak": "boys", "prompt": "Listen and choose the correct word.", "options": ["men", "boys", "people"], "correct_index": 1, "explanation": "More than one boy is boys."}'::jsonb, true, 3),
    ('image_choice', 'Listen and choose the correct word.',
     '{"image_key": "woman", "text_to_speak": "woman", "prompt": "Listen and choose the correct word.", "options": ["girl", "man", "woman"], "correct_index": 2, "explanation": "An adult female is a woman."}'::jsonb, true, 4),
    ('matching', 'Match the singular with the plural:',
     '{"pairs": [{"left": "man", "right": "men"}, {"left": "woman", "right": "women"}, {"left": "person", "right": "people"}, {"left": "girl", "right": "girls"}], "explanation": "Man, woman and person are irregular plurals."}'::jsonb, true, 5),
    ('flashcard_flip', 'Flip the card and learn the Czech word.',
     '{"front": "people", "back": "lidé", "example": "The people are happy.", "text_to_speak": "The people are happy.", "image_key": "people"}'::jsonb, false, 6),
    ('listening_dictation', 'Listen and type what you hear:',
     '{"text_to_speak": "These are women.", "accepted": ["these are women"], "explanation": "Women is the plural of woman."}'::jsonb, true, 7),
    ('word_order', 'Put the words in the right order:',
     '{"correct_sequence": ["This", "is", "a", "man."], "explanation": "Subject, verb, then the noun."}'::jsonb, true, 8),
    ('stress_tap', 'Tap the stressed syllable:',
     '{"syllables": ["WO", "man"], "correct_index": 0, "text_to_speak": "woman", "explanation": "The stress is on the first syllable."}'::jsonb, true, 9),
    ('multiple_choice', 'Which word is the plural of person?',
     '{"options": ["persons", "person", "people"], "correct_index": 2, "explanation": "People is the plural of person."}'::jsonb, true, 10),
    ('fill_blank', 'There are many ___ in the city centre.',
     '{"correct_answers": ["people"], "explanation": "People is already a plural word."}'::jsonb, true, 11),
    ('speaking_recording', 'Listen and repeat:',
     '{"text_to_speak": "This is a boy and these are girls."}'::jsonb, false, 12)
  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1 from public.exercises z where z.lesson_id = v_lesson and z.sort_order = e.sort_order
  );
end $$;

-- LESSON 2: Greetings & Farewells
do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction' and l.title = 'Greetings & Farewells';

  insert into public.exercises (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values
    ('flashcard_flip', 'Flip the card and learn the phrase.',
     '{"front": "hello", "back": "ahoj, dobrý den", "example": "Hello, my name is Jane.", "text_to_speak": "Hello, my name is Jane."}'::jsonb, false, 1),
    ('flashcard_flip', 'Flip the card and learn the phrase.',
     '{"front": "good morning", "back": "dobré ráno", "example": "Good morning, class!", "text_to_speak": "Good morning, class!"}'::jsonb, false, 2),
    ('listening_multiple_choice', 'Listen and choose: When do people say this?',
     '{"text_to_speak": "Good evening, ladies and gentlemen.", "options": ["in the morning at 8:00", "at noon", "in the evening at 19:00"], "correct_index": 2, "explanation": "Good evening is used from about 5 p.m."}'::jsonb, true, 3),
    ('inline_choice', '___ night! Sleep tight.',
     '{"sentence": "___ night! Sleep tight.", "options": ["Good", "Nice", "Happy"], "correct_index": 0, "explanation": "We say Good night before sleeping.", "tip": "Good night is for bedtime."}'::jsonb, true, 4),
    ('flashcard_flip', 'Flip the card and learn the phrase.',
     '{"front": "good night", "back": "dobrou noc", "example": "Good night, sleep tight!", "text_to_speak": "Good night, sleep tight!"}'::jsonb, false, 5),
    ('context_fill', 'Choose the line that completes the dialogue:',
     '{"dialogue": [{"speaker": "Anna", "side": "left", "text": "Hi! How are you?"}, {"speaker": "Ben", "side": "right", "text": "___"}], "options": ["I am ten years old.", "Fine, thanks. And you?", "Good bye!"], "correct_index": 1, "explanation": "The question asks how you are."}'::jsonb, true, 6),
    ('best_reply', 'Choose the best reply:',
     '{"steps": [{"lines": [{"speaker": "Mark", "side": "left", "text": "Hello! I am Mark."}], "reply": "Hi Mark, I am Anna. Nice to meet you.", "options": ["Hi Mark, I am Anna. Nice to meet you.", "Good night, Mark.", "I don''t understand."], "correct_index": 0, "explanation": "Answer with your own name and a greeting."}, {"lines": [{"speaker": "Mark", "side": "left", "text": "Hello! I am Mark."}, {"speaker": "Anna", "side": "right", "text": "Hi Mark, I am Anna. Nice to meet you."}], "reply": "See you!", "options": ["What?", "I am sorry.", "See you!"], "correct_index": 2, "explanation": "See you is a friendly goodbye."}]}'::jsonb, true, 7),
    ('word_order', 'Put the words in the right order:',
     '{"correct_sequence": ["Nice", "to", "meet", "you", "too."], "explanation": "Too comes at the end of the reply."}'::jsonb, true, 8),
    ('flashcard_flip', 'Flip the card and learn the phrase.',
     '{"front": "good bye", "back": "nashledanou", "example": "Good bye! See you tomorrow.", "text_to_speak": "Good bye! See you tomorrow."}'::jsonb, false, 9),
    ('multiple_choice', 'When do you say Good night?',
     '{"options": ["When you meet someone in the morning", "When you go to bed", "When someone says thank you"], "correct_index": 1, "explanation": "Good night is for bedtime."}'::jsonb, true, 10),
    ('listening_dictation', 'Listen and type what you hear:',
     '{"text_to_speak": "See you later!", "accepted": ["see you later"], "explanation": "See you is a friendly goodbye."}'::jsonb, true, 11),
    ('fill_blank', 'Good ___! It is twelve o''clock and the sun is high.',
     '{"correct_answers": ["afternoon"], "explanation": "After 12:00 we say good afternoon."}'::jsonb, true, 12),
    ('speaking_recording', 'Listen and repeat:',
     '{"text_to_speak": "Hello! How are you? Fine, thanks. And you?"}'::jsonb, false, 13)
  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1 from public.exercises z where z.lesson_id = v_lesson and z.sort_order = e.sort_order
  );
end $$;

-- LESSON 3: Subject Pronouns
do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction' and l.title = 'Subject Pronouns';

  insert into public.exercises (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values
    ('flashcard_flip', 'Flip the card and learn the pronouns.',
     '{"front": "I / you / he / she", "back": "já / ty, vy / on / ona", "example": "He is from Prague and she is from Brno.", "text_to_speak": "He is from Prague and she is from Brno."}'::jsonb, false, 1),
    ('inline_choice', '___ am a student.',
     '{"sentence": "___ am a student.", "options": ["I", "He", "She"], "correct_index": 0, "explanation": "Only I goes with am."}'::jsonb, true, 2),
    ('image_choice', 'Listen and choose the correct word.',
     '{"image_key": "women", "text_to_speak": "women", "prompt": "Listen and choose the correct word.", "options": ["she", "they", "he"], "correct_index": 1, "explanation": "More than one person is they."}'::jsonb, true, 3),
    ('flashcard_flip', 'Flip the card and learn the pronouns.',
     '{"front": "it / we / they", "back": "ono / my / oni, ony, ona", "example": "We are boys and girls from France.", "text_to_speak": "We are boys and girls from France."}'::jsonb, false, 4),
    ('matching', 'Match the pronoun with the Czech word:',
     '{"pairs": [{"left": "he", "right": "on"}, {"left": "she", "right": "ona"}, {"left": "we", "right": "my"}, {"left": "they", "right": "oni"}], "explanation": "Each pronoun has a Czech equivalent."}'::jsonb, true, 5),
    ('word_order', 'Put the words in the right order:',
     '{"correct_sequence": ["She", "is", "from", "Brno."], "explanation": "Subject, verb, then place."}'::jsonb, true, 6),
    ('flashcard_flip', 'Flip the card and learn the question.',
     '{"front": "Are you Jane?", "back": "Jsi ty Jane?", "example": "Are you Jane? No, I am not.", "text_to_speak": "Are you Jane? No, I am not."}'::jsonb, false, 7),
    ('error_spot', 'Find the mistake and fix it:',
     '{"words": ["He", "are", "my", "friend."], "wrong_index": 1, "options": ["is", "am", "be"], "correct_index": 0, "explanation": "He is my friend, third person singular."}'::jsonb, true, 8),
    ('fill_blank', 'Anna and I are students. ___ are from Pilsen.',
     '{"correct_answers": ["We", "we"], "explanation": "Anna and I together are we."}'::jsonb, true, 9),
    ('multiple_choice', 'Which pronoun replaces Tom and Sarah?',
     '{"options": ["he", "she", "they"], "correct_index": 2, "explanation": "Two or more people are they."}'::jsonb, true, 10),
    ('listening_multiple_choice', 'Listen and choose: Which pronoun did you hear?',
     '{"text_to_speak": "It is my hometown.", "options": ["He", "It", "They"], "correct_index": 1, "explanation": "You heard It is my hometown."}'::jsonb, true, 11),
    ('speaking_recording', 'Listen and repeat:',
     '{"text_to_speak": "I am from Prague. He is from Brno. They are from Pilsen."}'::jsonb, false, 12)
  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1 from public.exercises z where z.lesson_id = v_lesson and z.sort_order = e.sort_order
  );
end $$;

-- LESSON 4: Possessive Adjectives
do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction' and l.title = 'Possessive Adjectives';

  insert into public.exercises (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values
    ('flashcard_flip', 'Flip the card and learn the possessives.',
     '{"front": "my / your", "back": "můj / tvůj, váš", "example": "This is my book.", "text_to_speak": "This is my book."}'::jsonb, false, 1),
    ('inline_choice', 'This is ___ book.',
     '{"sentence": "This is ___ book.", "options": ["I", "my", "me"], "correct_index": 1, "explanation": "The possessive my comes before the noun."}'::jsonb, true, 2),
    ('matching', 'Match the pronoun with its possessive:',
     '{"pairs": [{"left": "he", "right": "his"}, {"left": "she", "right": "her"}, {"left": "I", "right": "my"}, {"left": "they", "right": "their"}], "explanation": "Every pronoun has its own possessive."}'::jsonb, true, 3),
    ('flashcard_flip', 'Flip the card and learn the possessives.',
     '{"front": "his / her", "back": "jeho / její", "example": "His name is Tom. Her name is Sarah.", "text_to_speak": "His name is Tom. Her name is Sarah."}'::jsonb, false, 4),
    ('word_order', 'Put the words in the right order:',
     '{"correct_sequence": ["This", "is", "her", "surname."], "explanation": "The possessive stands before the noun."}'::jsonb, true, 5),
    ('error_spot', 'Find the mistake and fix it:',
     '{"words": ["This", "is", "he", "book."], "wrong_index": 2, "options": ["his", "him", "her"], "correct_index": 0, "explanation": "Use the possessive his before a noun."}'::jsonb, true, 6),
    ('flashcard_flip', 'Flip the card and learn the possessives.',
     '{"front": "its / our / their", "back": "jeho / náš / jejich", "example": "Our school is in Pilsen.", "text_to_speak": "Our school is in Pilsen."}'::jsonb, false, 7),
    ('listening_multiple_choice', 'Listen and choose: Which possessive did you hear?',
     '{"text_to_speak": "His name is Tom Hanks.", "options": ["her", "his", "our"], "correct_index": 1, "explanation": "You heard his, a man''s name."}'::jsonb, true, 8),
    ('fill_blank', 'Sarah is a doctor. ___ job is in a hospital.',
     '{"correct_answers": ["Her", "her"], "explanation": "Sarah is she, so the possessive is her."}'::jsonb, true, 9),
    ('form_fill', 'Fill in the name card:',
     '{"title": "Name card", "text_to_speak": null, "fields": [{"prompt": "My name is Anna. ___ surname is Novak.", "options": ["My", "I", "Me"], "correct_index": 0, "explanation": "The possessive comes before the surname."}, {"prompt": "Tom and Sara are here. ___ car is outside.", "options": ["They", "Their", "Them"], "correct_index": 1, "explanation": "Two people own the car: their."}], "explanation": "Name cards use possessive adjectives."}'::jsonb, true, 10),
    ('multiple_choice', 'Choose the correct sentence:',
     '{"options": ["This is his book.", "This is he book.", "This is him book."], "correct_index": 0, "explanation": "Only his is a possessive adjective."}'::jsonb, true, 11),
    ('speaking_recording', 'Listen and repeat:',
     '{"text_to_speak": "This is my friend. Her name is Sarah. His name is John."}'::jsonb, false, 12)
  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1 from public.exercises z where z.lesson_id = v_lesson and z.sort_order = e.sort_order
  );
end $$;

-- LESSON 5: Unit 1 Review - Part A
do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction' and l.title = 'Unit 1 Review - Part A';

  insert into public.exercises (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values
    ('multiple_choice', 'What is the plural of woman?',
     '{"options": ["women", "womans", "woman"], "correct_index": 0, "explanation": "Woman changes to women."}'::jsonb, true, 1),
    ('best_reply', 'Choose the best reply:',
     '{"steps": [{"lines": [{"speaker": "Receptionist", "side": "left", "text": "Good morning. Can you spell your surname, please?"}], "reply": "It is H-A-N-K-S.", "options": ["I am fine, thanks.", "It is H-A-N-K-S.", "Good night."], "correct_index": 1, "explanation": "The question asks for spelling."}, {"lines": [{"speaker": "Receptionist", "side": "left", "text": "Good morning. Can you spell your surname, please?"}, {"speaker": "You", "side": "right", "text": "It is H-A-N-K-S."}], "reply": "You''re welcome.", "options": ["I am sorry.", "Good night.", "You''re welcome."], "correct_index": 2, "explanation": "You''re welcome answers thank you."}]}'::jsonb, true, 2),
    ('fill_blank', 'She is my friend. ___ name is Sarah.',
     '{"correct_answers": ["Her", "her"], "explanation": "She becomes her before a noun."}'::jsonb, true, 3),
    ('flashcard_flip', 'Flip the card and review the phrase.',
     '{"front": "How are you doing?", "back": "Jak se máš?", "example": "How are you doing? Great, thanks.", "text_to_speak": "How are you doing? Great, thanks."}'::jsonb, false, 4),
    ('image_choice', 'Listen and choose the correct word.',
     '{"image_key": "men", "text_to_speak": "men", "prompt": "Listen and choose the correct word.", "options": ["men", "women", "boys"], "correct_index": 0, "explanation": "Adult males are men."}'::jsonb, true, 5),
    ('word_order', 'Put the words in the right order:',
     '{"correct_sequence": ["What", "is", "your", "name?"], "explanation": "The question word comes first."}'::jsonb, true, 6),
    ('matching', 'Match the English phrase with the Czech one:',
     '{"pairs": [{"left": "Good night", "right": "dobrou noc"}, {"left": "See you", "right": "tak zatím"}, {"left": "Thank you", "right": "děkuji"}, {"left": "Excuse me", "right": "promiňte"}], "explanation": "Everyday polite phrases."}'::jsonb, true, 7),
    ('inline_choice', '___ is from London.',
     '{"sentence": "___ is from London.", "options": ["Her", "Hers", "She"], "correct_index": 2, "explanation": "The subject pronoun she stands before the verb."}'::jsonb, true, 8),
    ('flashcard_flip', 'Flip the card and review the phrase.',
     '{"front": "You''re welcome. / No problem.", "back": "Není zač.", "example": "Thank you. You''re welcome.", "text_to_speak": "Thank you. You''re welcome."}'::jsonb, false, 9),
    ('listening_dictation', 'Listen and type what you hear:',
     '{"text_to_speak": "Nice to meet you, too.", "accepted": ["nice to meet you too"], "explanation": "Too means also."}'::jsonb, true, 10),
    ('speaking_recording', 'Listen and repeat:',
     '{"text_to_speak": "Hello! My name is Tom. Nice to meet you."}'::jsonb, false, 11)
  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1 from public.exercises z where z.lesson_id = v_lesson and z.sort_order = e.sort_order
  );
end $$;

-- LESSON 6: Introducing Yourself
do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction' and l.title = 'Introducing Yourself';

  insert into public.exercises (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values
    ('flashcard_flip', 'Flip the card and learn the phrase.',
     '{"front": "My name is ...", "back": "Jmenuji se ...", "example": "My name is Jane.", "text_to_speak": "My name is Jane."}'::jsonb, false, 1),
    ('best_reply', 'Choose the best reply:',
     '{"steps": [{"lines": [{"speaker": "Anna", "side": "left", "text": "Hello! I am Anna."}], "reply": "Hi Anna, I am Ben. Nice to meet you.", "options": ["Hi Anna, I am Ben. Nice to meet you.", "Good bye, Anna.", "I am ten."], "correct_index": 0, "explanation": "Introduce yourself back."}, {"lines": [{"speaker": "Anna", "side": "left", "text": "Hello! I am Anna."}, {"speaker": "Ben", "side": "right", "text": "Hi Anna, I am Ben. Nice to meet you."}], "reply": "I am from Pilsen. And you?", "options": ["I am ten.", "Yes, please.", "I am from Pilsen. And you?"], "correct_index": 2, "explanation": "Answer the where-question and ask back."}]}'::jsonb, true, 2),
    ('context_fill', 'Choose the line that completes the dialogue:',
     '{"dialogue": [{"speaker": "Tom", "side": "left", "text": "Good morning. My name is Tom Hanks."}, {"speaker": "Receptionist", "side": "right", "text": "Good morning. Can you spell your surname, please?"}, {"speaker": "Tom", "side": "left", "text": "___"}], "options": ["Yes, I am.", "Nice to meet you.", "It is H-A-N-K-S."], "correct_index": 2, "explanation": "Spell the surname letter by letter."}'::jsonb, true, 3),
    ('listening_multiple_choice', 'Listen and choose: Where is Jane from?',
     '{"text_to_speak": "Hello, my name is Jane and I am from London.", "options": ["London", "Pilsen", "Prague"], "correct_index": 0, "explanation": "Jane says she is from London."}'::jsonb, true, 4),
    ('flashcard_flip', 'Flip the card and learn the phrase.',
     '{"front": "Can you spell ..., please?", "back": "Můžete prosím vyhláskovat ...?", "example": "Can you spell your name, please?", "text_to_speak": "Can you spell your name, please?"}'::jsonb, false, 5),
    ('document_reader', 'Read the name badge and answer:',
     '{"document_lines": ["NAME BADGE", "Sarah Johnson", "Marketing Manager", "Welcome to AQAP!"], "questions": [{"question": "What is Sarah''s job?", "options": ["Teacher", "Marketing Manager", "Doctor"], "correct_index": 1, "explanation": "The badge says Marketing Manager."}], "explanation": "Read the badge carefully."}'::jsonb, true, 6),
    ('form_fill', 'Fill in the registration form:',
     '{"title": "Course registration", "text_to_speak": null, "fields": [{"prompt": "First name: ___", "options": ["William", "Brown"], "correct_index": 0, "explanation": "The first name comes before the surname."}, {"prompt": "Surname: ___", "options": ["William", "Brown"], "correct_index": 1, "explanation": "Brown is the family name."}], "explanation": "Forms ask for first name then surname."}'::jsonb, true, 7),
    ('listening_dictation', 'Listen and type the spelled name:',
     '{"text_to_speak": "M-A-R-Y", "accepted": ["mary", "MARY"], "explanation": "Listen for the four letters."}'::jsonb, true, 8),
    ('word_order', 'Put the words in the right order:',
     '{"correct_sequence": ["My", "name", "is", "Kate."], "explanation": "Standard introduction order."}'::jsonb, true, 9),
    ('reading_comprehension', 'Read the dialogue and answer:',
     '{"dialogue": [{"speaker": "Ben", "side": "left", "text": "Hi! I am Ben. What is your name?"}, {"speaker": "Mia", "side": "right", "text": "I am Mia. Nice to meet you."}, {"speaker": "Ben", "side": "left", "text": "Nice to meet you, too. Where are you from?"}, {"speaker": "Mia", "side": "right", "text": "I am from Brno."}], "question": "Where is Mia from?", "options": ["Prague", "London", "Brno"], "correct_index": 2, "explanation": "Mia says she is from Brno."}'::jsonb, true, 10),
    ('speaking_recording', 'Listen and repeat:',
     '{"text_to_speak": "Hello! My name is Sarah and I am from London."}'::jsonb, false, 11)
  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1 from public.exercises z where z.lesson_id = v_lesson and z.sort_order = e.sort_order
  );
end $$;

-- LESSON 7: Asking Questions
do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction' and l.title = 'Asking Questions';

  insert into public.exercises (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values
    ('flashcard_flip', 'Flip the card and learn the question.',
     '{"front": "What is your name?", "back": "Jak se jmenuješ?", "example": "What is your name? My name is Kate.", "text_to_speak": "What is your name? My name is Kate."}'::jsonb, false, 1),
    ('inline_choice', '___ is your name?',
     '{"sentence": "___ is your name?", "options": ["Where", "What", "How"], "correct_index": 1, "explanation": "What asks for a name."}'::jsonb, true, 2),
    ('matching', 'Match each question with its answer:',
     '{"pairs": [{"left": "What is your name?", "right": "My name is Tom."}, {"left": "How are you?", "right": "Fine, thanks."}, {"left": "Where are you from?", "right": "I am from Pilsen."}], "explanation": "Questions match their answers."}'::jsonb, true, 3),
    ('flashcard_flip', 'Flip the card and learn the question.',
     '{"front": "How are you?", "back": "Jak se máš?", "example": "How are you? Fine, thanks.", "text_to_speak": "How are you? Fine, thanks."}'::jsonb, false, 4),
    ('word_order', 'Put the words in the right order:',
     '{"correct_sequence": ["Where", "are", "you", "from?"], "explanation": "Question word, verb, subject."}'::jsonb, true, 5),
    ('best_reply', 'Choose the best reply:',
     '{"steps": [{"lines": [{"speaker": "Tom", "side": "left", "text": "Excuse me, are you Mr Black?"}], "reply": "Yes, I am.", "options": ["Yes, I am.", "I am ten.", "Good night."], "correct_index": 0, "explanation": "A yes-no question needs a yes-no answer."}, {"lines": [{"speaker": "Tom", "side": "left", "text": "Excuse me, are you Mr Black?"}, {"speaker": "You", "side": "right", "text": "Yes, I am."}], "reply": "I am a teacher.", "options": ["I am fine.", "I am a teacher.", "From Pilsen."], "correct_index": 1, "explanation": "The question asks about the job."}]}'::jsonb, true, 6),
    ('listening_multiple_choice', 'Listen and choose: Which question did you hear?',
     '{"text_to_speak": "What is your phone number?", "options": ["Where is your phone?", "How old are you?", "What is your phone number?"], "correct_index": 2, "explanation": "You heard What is your phone number."}'::jsonb, true, 7),
    ('flashcard_flip', 'Flip the card and learn the question.',
     '{"front": "Where are you from?", "back": "Odkud jsi?", "example": "Where are you from? I am from Czechia.", "text_to_speak": "Where are you from? I am from Czechia."}'::jsonb, false, 8),
    ('fill_blank', '___ old are you? I am twenty.',
     '{"correct_answers": ["How", "how"], "explanation": "How old asks about age."}'::jsonb, true, 9),
    ('context_fill', 'Choose the line that completes the dialogue:',
     '{"dialogue": [{"speaker": "Anna", "side": "left", "text": "Hello! ___"}, {"speaker": "Ben", "side": "right", "text": "My name is John Smith."}], "options": ["How are you?", "What is your name?", "Where are you from?"], "correct_index": 1, "explanation": "The answer gives a name."}'::jsonb, true, 10),
    ('multiple_choice', 'Which question asks about a place?',
     '{"options": ["What is this?", "Who is this?", "Where are you from?"], "correct_index": 2, "explanation": "Where asks about places."}'::jsonb, true, 11),
    ('speaking_recording', 'Listen and repeat:',
     '{"text_to_speak": "What is your name? Where are you from? How are you?"}'::jsonb, false, 12)
  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1 from public.exercises z where z.lesson_id = v_lesson and z.sort_order = e.sort_order
  );
end $$;

-- LESSON 8: Real People Introductions
do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction' and l.title = 'Real People Introductions';

  insert into public.exercises (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values
    ('reading_comprehension', 'Read the dialogue and answer:',
     '{"dialogue": [{"speaker": "William", "side": "left", "text": "Hi! I am William and this is my friend Sarah."}, {"speaker": "Ben", "side": "right", "text": "Nice to meet you. Where are you from?"}, {"speaker": "Sarah", "side": "left", "text": "I am from London and William is from Prague."}], "question": "Where is William from?", "options": ["London", "Prague", "Pilsen"], "correct_index": 1, "explanation": "William is from Prague."}'::jsonb, true, 1),
    ('listening_multiple_choice', 'Listen and choose: What is Tom''s job?',
     '{"text_to_speak": "Hello! My name is Tom Hanks and I am an actor.", "options": ["A teacher", "A doctor", "An actor"], "correct_index": 2, "explanation": "Tom says he is an actor."}'::jsonb, true, 2),
    ('flashcard_flip', 'Flip the card and learn the phrase.',
     '{"front": "This is ... and his friend ...", "back": "Tohle je ... a jeho kamarád ...", "example": "This is William and his friend Sarah.", "text_to_speak": "This is William and his friend Sarah."}'::jsonb, false, 3),
    ('listening_dictation', 'Listen and type what you hear:',
     '{"text_to_speak": "Nice to meet you.", "accepted": ["nice to meet you"], "explanation": "A standard introduction phrase."}'::jsonb, true, 4),
    ('document_reader', 'Read the business card and answer:',
     '{"document_lines": ["BUSINESS CARD", "Dr Jane Smith", "Doctor", "Prague General Hospital", "Phone: +420 123 456 789"], "questions": [{"question": "Where does Jane work?", "options": ["Prague General Hospital", "A school", "A hotel"], "correct_index": 0, "explanation": "The card says Prague General Hospital."}], "explanation": "Business cards show job and place."}'::jsonb, true, 5),
    ('listening_word_order', 'Listen and put the words in order:',
     '{"text_to_speak": "My name is William.", "correct_sequence": ["My", "name", "is", "William."], "explanation": "Listen for the word order."}'::jsonb, true, 6),
    ('flashcard_flip', 'Flip the card and learn the reply.',
     '{"front": "Nice to meet you, too.", "back": "Rád vás poznávám také.", "example": "Nice to meet you. Nice to meet you, too.", "text_to_speak": "Nice to meet you. Nice to meet you, too."}'::jsonb, false, 7),
    ('multiple_choice', 'What does too mean in Nice to meet you, too.?',
     '{"options": ["also", "very", "not"], "correct_index": 0, "explanation": "Too means also."}'::jsonb, true, 8),
    ('fill_blank', 'Sarah is from London. She is ___.',
     '{"correct_answers": ["English", "english"], "explanation": "People from London are English."}'::jsonb, true, 9),
    ('context_fill', 'Choose the line that completes the dialogue:',
     '{"dialogue": [{"speaker": "Anna", "side": "left", "text": "Hello! Are you Mr Black?"}, {"speaker": "Ben", "side": "right", "text": "___"}, {"speaker": "Anna", "side": "left", "text": "Nice to meet you, Mr Black."}], "options": ["No, I am not.", "Yes, I am.", "I am fine."], "correct_index": 1, "explanation": "Anna greets Mr Black next, so the answer is yes."}'::jsonb, true, 10),
    ('speaking_recording', 'Listen and repeat:',
     '{"text_to_speak": "This is William and his friend Sarah. Nice to meet you."}'::jsonb, false, 11)
  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1 from public.exercises z where z.lesson_id = v_lesson and z.sort_order = e.sort_order
  );
end $$;

-- LESSON 9: Pronouns Mastery
do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction' and l.title = 'Pronouns Mastery';

  insert into public.exercises (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values
    ('flashcard_flip', 'Flip the card and review the pairs.',
     '{"front": "I - my, he - his", "back": "já - můj, on - jeho", "example": "I have my book. He has his book.", "text_to_speak": "I have my book. He has his book."}'::jsonb, false, 1),
    ('error_spot', 'Find the mistake and fix it:',
     '{"words": ["She", "are", "my", "sister."], "wrong_index": 1, "options": ["is", "am", "be"], "correct_index": 0, "explanation": "She is my sister, third person singular."}'::jsonb, true, 2),
    ('word_sort', 'Sort the words:',
     '{"categories": ["Subject pronouns", "Possessive adjectives"], "items": [{"word": "I", "category": 0}, {"word": "my", "category": 1}, {"word": "he", "category": 0}, {"word": "his", "category": 1}, {"word": "they", "category": 0}, {"word": "their", "category": 1}], "explanation": "Subject pronouns act, possessives own."}'::jsonb, true, 3),
    ('inline_choice', '___ names are Tom and Sarah.',
     '{"sentence": "___ names are Tom and Sarah.", "options": ["They", "Their", "Them"], "correct_index": 1, "explanation": "The possessive their comes before the noun."}'::jsonb, true, 4),
    ('flashcard_flip', 'Flip the card and review the pairs.',
     '{"front": "we - our, you - your", "back": "my - náš, ty/vy - tvůj/váš", "example": "We love our school.", "text_to_speak": "We love our school."}'::jsonb, false, 5),
    ('matching', 'Match each pronoun with its possessive:',
     '{"pairs": [{"left": "I", "right": "my"}, {"left": "you", "right": "your"}, {"left": "she", "right": "her"}, {"left": "we", "right": "our"}], "explanation": "Match pronouns with possessives."}'::jsonb, true, 6),
    ('fill_blank', 'Tom and Sarah are students. ___ are from Prague.',
     '{"correct_answers": ["They", "they"], "explanation": "Two people together are they."}'::jsonb, true, 7),
    ('word_order', 'Put the words in the right order:',
     '{"correct_sequence": ["Their", "names", "are", "Tom", "and", "Sarah."], "explanation": "The possessive starts the sentence."}'::jsonb, true, 8),
    ('multiple_choice', 'Choose the correct sentence:',
     '{"options": ["This is her book.", "This is she book.", "This is hers book."], "correct_index": 0, "explanation": "Her is the possessive adjective."}'::jsonb, true, 9),
    ('listening_multiple_choice', 'Listen and choose: Which possessive did you hear?',
     '{"text_to_speak": "It is our classroom.", "options": ["their", "your", "our"], "correct_index": 2, "explanation": "You heard our classroom."}'::jsonb, true, 10),
    ('speaking_recording', 'Listen and repeat:',
     '{"text_to_speak": "I am here. She is my friend. His name is Tom. They are from Prague."}'::jsonb, false, 11)
  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1 from public.exercises z where z.lesson_id = v_lesson and z.sort_order = e.sort_order
  );
end $$;

-- LESSON 10: Final Challenge
do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction' and l.title = 'Final Challenge';

  insert into public.exercises (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values
    ('best_reply', 'Choose the best reply:',
     '{"steps": [{"lines": [{"speaker": "Mark", "side": "left", "text": "Good morning! My name is Mark."}], "reply": "Good morning! I am Lisa. Nice to meet you.", "options": ["Good morning! I am Lisa. Nice to meet you.", "Good night!", "I am sorry."], "correct_index": 0, "explanation": "Greet back and introduce yourself."}, {"lines": [{"speaker": "Mark", "side": "left", "text": "Good morning! My name is Mark."}, {"speaker": "Lisa", "side": "right", "text": "Good morning! I am Lisa. Nice to meet you."}], "reply": "I am from Prague. And you?", "options": ["I am fine.", "I am from Prague. And you?", "Yes, please."], "correct_index": 1, "explanation": "Answer the where-question and ask back."}, {"lines": [{"speaker": "Mark", "side": "left", "text": "Good morning! My name is Mark."}, {"speaker": "Lisa", "side": "right", "text": "Good morning! I am Lisa. Nice to meet you."}, {"speaker": "Mark", "side": "left", "text": "Nice to meet you, too. Where are you from?"}, {"speaker": "Lisa", "side": "right", "text": "I am from Prague. And you?"}, {"speaker": "Mark", "side": "left", "text": "I am from Brno. See you later!"}], "reply": "See you!", "options": ["What?", "Good night!", "See you!"], "correct_index": 2, "explanation": "See you answers a goodbye."}]}'::jsonb, true, 1),
    ('multiple_choice', 'What is the plural of person?',
     '{"options": ["people", "persons", "person"], "correct_index": 0, "explanation": "People is the plural of person."}'::jsonb, true, 2),
    ('listening_multiple_choice', 'Listen and choose: Where is Sarah from?',
     '{"text_to_speak": "Hello! My name is William and this is my friend Sarah from London.", "options": ["Prague", "London", "Brno"], "correct_index": 1, "explanation": "Sarah is from London."}'::jsonb, true, 3),
    ('flashcard_flip', 'Flip the card and review the phrase.',
     '{"front": "Congratulations!", "back": "Gratuluji! Blahopřeji!", "example": "Congratulations! You finished Unit 1.", "text_to_speak": "Congratulations! You finished Unit 1."}'::jsonb, false, 4),
    ('fill_blank', '___ to meet you! Welcome to our school.',
     '{"correct_answers": ["Nice", "nice"], "explanation": "Nice to meet you is the standard phrase."}'::jsonb, true, 5),
    ('image_choice', 'Listen and choose the correct word.',
     '{"image_key": "girls", "text_to_speak": "girls", "prompt": "Listen and choose the correct word.", "options": ["girls", "men", "women"], "correct_index": 0, "explanation": "Young females are girls."}'::jsonb, true, 6),
    ('context_fill', 'Choose the line that completes the dialogue:',
     '{"dialogue": [{"speaker": "Anna", "side": "left", "text": "It was nice meeting you!"}, {"speaker": "Ben", "side": "right", "text": "___"}], "options": ["How are you?", "Nice to meet you, too. Good bye!", "What is your name?"], "correct_index": 1, "explanation": "A farewell reply fits the situation."}'::jsonb, true, 7),
    ('flashcard_flip', 'Flip the card and review the unit.',
     '{"front": "Unit 1 word list", "back": "pozdravy, zájmena, představení", "example": "hello, name, surname, my, your, his, her", "text_to_speak": "You learned greetings, pronouns and introductions."}'::jsonb, false, 8),
    ('word_sort', 'Sort the phrases:',
     '{"categories": ["Greetings", "Farewells"], "items": [{"word": "hello", "category": 0}, {"word": "good morning", "category": 0}, {"word": "good bye", "category": 1}, {"word": "see you", "category": 1}, {"word": "good evening", "category": 0}, {"word": "good night", "category": 1}], "explanation": "Good night is usually a farewell."}'::jsonb, true, 9),
    ('reading_comprehension', 'Read the dialogue and answer:',
     '{"dialogue": [{"speaker": "Tom", "side": "left", "text": "Good morning. My name is Tom Hanks."}, {"speaker": "Receptionist", "side": "right", "text": "Good morning. Can you spell your surname, please?"}, {"speaker": "Tom", "side": "left", "text": "Yes. It is H-A-N-K-S."}, {"speaker": "Receptionist", "side": "right", "text": "Thank you. Here is your key."}], "question": "What does Tom spell?", "options": ["His surname", "His first name", "His phone number"], "correct_index": 0, "explanation": "Hanks is his surname."}'::jsonb, true, 10),
    ('speaking_recording', 'Listen and repeat:',
     '{"text_to_speak": "Hello! My name is Tom and I am from Prague. Nice to meet you!"}'::jsonb, false, 11)
  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1 from public.exercises z where z.lesson_id = v_lesson and z.sort_order = e.sort_order
  );
end $$;