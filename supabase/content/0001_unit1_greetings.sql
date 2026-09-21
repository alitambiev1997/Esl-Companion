-- ============================================================
-- LESSON 1: Hello and Goodbye
-- 8 graded exercises
-- ============================================================

do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction'
    and l.title = 'Hello and Goodbye';

  insert into public.exercises
    (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values

    -- TEACH
    ('flashcard_flip',
     'Prohlédněte si frázi a její význam.',
     '{
       "front": "hello",
       "back": "ahoj, dobrý den",
       "example": "Hello!",
       "text_to_speak": "Hello!"
     }'::jsonb,
     false, 1),

    ('flashcard_flip',
     'Prohlédněte si frázi a její význam.',
     '{
       "front": "good morning",
       "back": "dobré ráno",
       "example": "Good morning!",
       "text_to_speak": "Good morning!"
     }'::jsonb,
     false, 2),

    ('flashcard_flip',
     'Prohlédněte si frázi a její význam.',
     '{
       "front": "goodbye",
       "back": "na shledanou",
       "example": "Goodbye!",
       "text_to_speak": "Goodbye!"
     }'::jsonb,
     false, 3),

    -- TEST THE NEW MATERIAL
    ('multiple_choice',
     'Je ráno a někoho potkáte. Co řeknete?',
     '{
       "options": ["Good morning!", "Goodbye!", "Thank you!"],
       "correct_index": 0,
       "explanation": "Good morning používáme jako pozdrav ráno."
     }'::jsonb,
     true, 4),

    ('multiple_choice',
     'Která fráze znamená „ahoj“?',
     '{
       "options": ["goodbye", "hello", "good morning"],
       "correct_index": 1,
       "explanation": "Hello znamená „ahoj“ nebo „dobrý den“."
     }'::jsonb,
     true, 5),

    ('fill_blank',
     'Při loučení, Doplňte: ___!',
     '{
       "correct_answers": ["Goodbye", "goodbye", "bye", "Bye"],
       "explanation": "Goodbye používáme při loučení."
     }'::jsonb,
     true, 6),

    -- ADD NEW MATERIAL
    ('flashcard_flip',
     'Prohlédněte si frázi a její význam.',
     '{
       "front": "see you",
       "back": "tak zatím, uvidíme se",
       "example": "See you!",
       "text_to_speak": "See you!"
     }'::jsonb,
     false, 7),

    ('flashcard_flip',
     'Prohlédněte si frázi a její význam.',
     '{
       "front": "good night",
       "back": "dobrou noc",
       "example": "Good night!",
       "text_to_speak": "Good night!"
     }'::jsonb,
     false, 8),

    -- IMMEDIATE RETRIEVAL
    ('multiple_choice',
     'Kterou frázi použijete, když jdete spát?',
     '{
       "options": ["Good morning!", "Good night!", "See you!"],
       "correct_index": 1,
       "explanation": "Good night používáme při loučení před spaním."
     }'::jsonb,
     true, 9),

    ('context_fill',
     'Vyberte správnou repliku.',
     '{
       "dialogue": [
         {"speaker": "Anna", "side": "left", "text": "Goodbye!"},
         {"speaker": "Tom", "side": "right", "text": "___"}
       ],
       "options": ["See you!", "Good morning!", "Thank you!"],
       "correct_index": 0,
       "explanation": "See you! je běžná fráze při loučení."
     }'::jsonb,
     true, 10),

    ('listening_multiple_choice',
     'Poslechněte si frázi a vyberte, co jste slyšeli.',
     '{
       "text_to_speak": "Good night!",
       "options": ["Good morning!", "Good night!", "Goodbye!"],
       "correct_index": 1,
       "explanation": "Uslyšeli jste Good night!"
     }'::jsonb,
     true, 11),

    ('best_reply',
     'Vyberte nejlepší odpověď.',
     '{
       "steps": [
         {
           "lines": [
             {"speaker": "Anna", "side": "left", "text": "Hello!"}
           ],
           "reply": "Hello!",
           "options": ["Hello!", "Goodbye!", "Good night!"],
           "correct_index": 0,
           "explanation": "Na pozdrav Hello! můžeme odpovědět také Hello!"
         }
       ]
     }'::jsonb,
     true, 12),

    ('speaking_recording',
     'Poslechněte si a zkuste fráze říct nahlas.',
     '{
       "text_to_speak": "Hello! Good morning! Goodbye! See you!"
     }'::jsonb,
     false, 13)

  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1
    from public.exercises z
    where z.lesson_id = v_lesson
      and z.sort_order = e.sort_order
  );
end $$;


-- ============================================================
-- LESSON 2: How Are You?
-- 8 graded exercises
-- ============================================================

do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction'
    and l.title = 'How Are You?';

  insert into public.exercises
    (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values

    ('flashcard_flip',
     'Prohlédněte si otázku a její význam.',
     '{
       "front": "How are you?",
       "back": "Jak se máš? / Jak se máte?",
       "example": "How are you?",
       "text_to_speak": "How are you?"
     }'::jsonb,
     false, 1),

    ('flashcard_flip',
     'Prohlédněte si odpověď a její význam.',
     '{
       "front": "Fine, thanks.",
       "back": "Dobře, děkuji.",
       "example": "How are you? Fine, thanks.",
       "text_to_speak": "Fine, thanks."
     }'::jsonb,
     false, 2),

    ('multiple_choice',
     'Co znamená „How are you?“',
     '{
       "options": ["Jak se máš?", "Jak se jmenuješ?", "Dobrou noc."],
       "correct_index": 0,
       "explanation": "How are you? znamená „Jak se máš?“ nebo „Jak se máte?“."
     }'::jsonb,
     true, 3),

    ('context_fill',
     'Vyberte správnou odpověď.',
     '{
       "dialogue": [
         {"speaker": "Anna", "side": "left", "text": "How are you?"},
         {"speaker": "Tom", "side": "right", "text": "___"}
       ],
       "options": ["Fine, thanks.", "Goodbye!", "My name is Tom."],
       "correct_index": 0,
       "explanation": "Na How are you? odpovídáme například Fine, thanks."
     }'::jsonb,
     true, 4),

    ('flashcard_flip',
     'Prohlédněte si další odpověď.',
     '{
       "front": "Great, thanks.",
       "back": "Skvěle, děkuji.",
       "example": "How are you? Great, thanks.",
       "text_to_speak": "Great, thanks."
     }'::jsonb,
     false, 5),

    ('multiple_choice',
     'Vyberte správnou odpověď na „How are you?“',
     '{
       "options": ["Great, thanks.", "Goodbye!", "My name is Anna."],
       "correct_index": 0,
       "explanation": "Great, thanks. je běžná odpověď na otázku How are you?"
     }'::jsonb,
     true, 6),

    ('flashcard_flip',
     'Prohlédněte si krátkou frázi.',
     '{
       "front": "And you?",
       "back": "A ty? / A vy?",
       "example": "Fine, thanks. And you?",
       "text_to_speak": "Fine, thanks. And you?"
     }'::jsonb,
     false, 7),

    ('fill_blank',
     'Doplňte: Fine, thanks. ___ you?',
     '{
       "correct_answers": ["And", "and"],
       "explanation": "And you? znamená „A ty?“ nebo „A vy?“."
     }'::jsonb,
     true, 8),

    ('word_order',
     'Seřaďte slova do správného pořadí.',
     '{
       "correct_sequence": ["How", "are", "you?"],
       "explanation": "Správná otázka je How are you?"
     }'::jsonb,
     true, 9),

    ('listening_multiple_choice',
     'Poslechněte si odpověď a vyberte správnou možnost.',
     '{
       "text_to_speak": "Great, thanks.",
       "options": ["Fine, thanks.", "Great, thanks.", "And you?"],
       "correct_index": 1,
       "explanation": "Uslyšeli jste Great, thanks."
     }'::jsonb,
     true, 10),

    ('context_fill',
     'Vyberte správné pokračování rozhovoru.',
     '{
       "dialogue": [
         {"speaker": "Tom", "side": "left", "text": "How are you?"},
         {"speaker": "Anna", "side": "right", "text": "Fine, thanks. ___"}
       ],
       "options": ["And you?", "Goodbye!", "My name is Anna."],
       "correct_index": 0,
       "explanation": "And you? vrací stejnou otázku druhé osobě."
     }'::jsonb,
     true, 11),

    ('best_reply',
     'Vyberte nejlepší odpověď.',
     '{
       "steps": [
         {
           "lines": [
             {"speaker": "Tom", "side": "left", "text": "How are you?"}
           ],
           "reply": "Fine, thanks. And you?",
           "options": [
             "Fine, thanks. And you?",
             "Goodbye!",
             "My name is Tom."
           ],
           "correct_index": 0,
           "explanation": "Na How are you? odpovíme například Fine, thanks. And you?"
         }
       ]
     }'::jsonb,
     true, 12),

    ('speaking_recording',
     'Poslechněte si a zkuste krátkou výměnu říct nahlas.',
     '{
       "text_to_speak": "How are you? Fine, thanks. And you?"
     }'::jsonb,
     false, 13)

  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1
    from public.exercises z
    where z.lesson_id = v_lesson
      and z.sort_order = e.sort_order
  );
end $$;


-- ============================================================
-- LESSON 3: My Name Is...
-- 8 graded exercises
-- ============================================================

do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction'
    and l.title = 'My Name Is...';

  insert into public.exercises
    (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values

    ('flashcard_flip',
     'Prohlédněte si slovo a jeho význam.',
     '{
       "front": "name",
       "back": "jméno",
       "example": "My name is Anna.",
       "text_to_speak": "My name is Anna."
     }'::jsonb,
     false, 1),

    ('flashcard_flip',
     'Prohlédněte si frázi a její význam.',
     '{
       "front": "My name is...",
       "back": "Jmenuji se...",
       "example": "My name is Anna.",
       "text_to_speak": "My name is Anna."
     }'::jsonb,
     false, 2),

    ('multiple_choice',
     'Co znamená „My name is Anna.“?',
     '{
       "options": ["Jmenuji se Anna.", "Jak se jmenuješ?", "Jak se máš?"],
       "correct_index": 0,
       "explanation": "My name is Anna. znamená „Jmenuji se Anna.“."
     }'::jsonb,
     true, 3),

    ('fill_blank',
     'Doplňte: My ___ is Anna.',
     '{
       "correct_answers": ["name", "Name"],
       "explanation": "Ve vzoru My name is... používáme slovo name."
     }'::jsonb,
     true, 4),

    ('word_order',
     'Seřaďte slova do správného pořadí.',
     '{
       "correct_sequence": ["My", "name", "is", "Anna."],
       "explanation": "Správná věta je My name is Anna."
     }'::jsonb,
     true, 5),

    ('flashcard_flip',
     'Prohlédněte si další způsob představení.',
     '{
       "front": "I am...",
       "back": "Já jsem...",
       "example": "I am Anna.",
       "text_to_speak": "I am Anna."
     }'::jsonb,
     false, 6),

    ('multiple_choice',
     'Doplňte správné slovo: I ___ Anna.',
     '{
       "options": ["am", "is", "are"],
       "correct_index": 0,
       "explanation": "Po I používáme am: I am Anna."
     }'::jsonb,
     true, 7),

    ('fill_blank',
     'Doplňte: I ___ Tom.',
     '{
       "correct_answers": ["am"],
       "explanation": "Po I používáme am."
     }'::jsonb,
     true, 8),

    ('flashcard_flip',
     'Prohlédněte si užitečnou frázi.',
     '{
       "front": "I am...",
       "back": "Já jsem...",
       "example": "I am Tom.",
       "text_to_speak": "I am Tom."
     }'::jsonb,
     false, 9),

    ('inline_choice',
     'Vyberte správnou možnost: My ___ is Tom.',
     '{
       "sentence": "My ___ is Tom.",
       "options": ["name", "am", "you"],
       "correct_index": 0,
       "explanation": "Po My potřebujeme slovo name: My name is Tom."
     }'::jsonb,
     true, 10),

    ('listening_multiple_choice',
     'Poslechněte si větu a vyberte správnou možnost.',
     '{
       "text_to_speak": "I am Anna.",
       "options": ["I am Anna.", "My name is Anna.", "How are you?"],
       "correct_index": 0,
       "explanation": "Uslyšeli jste I am Anna."
     }'::jsonb,
     true, 11),

    ('context_fill',
     'Vyberte správnou repliku.',
     '{
       "dialogue": [
         {"speaker": "Tom", "side": "left", "text": "Hello!"},
         {"speaker": "Anna", "side": "right", "text": "Hello! ___ Anna."}
       ],
       "options": ["I am", "My name", "You are"],
       "correct_index": 0,
       "explanation": "Anna se představuje pomocí I am Anna."
     }'::jsonb,
     true, 12),

    ('speaking_recording',
     'Poslechněte si a zkuste se představit.',
     '{
       "text_to_speak": "Hello. My name is Anna. I am Anna."
     }'::jsonb,
     false, 13)

  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1
    from public.exercises z
    where z.lesson_id = v_lesson
      and z.sort_order = e.sort_order
  );
end $$;






-- ============================================================
-- LESSON 4: I, You, He, She
-- 8 graded exercises
-- New material is introduced before it is tested.
-- ============================================================

do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction'
    and l.title = 'I, You, He, She';

  insert into public.exercises
    (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values

    ('flashcard_flip',
     'Prohlédněte si zájmeno a jeho význam.',
     '{
       "front": "I",
       "back": "já",
       "example": "I am Tom.",
       "text_to_speak": "I am Tom."
     }'::jsonb,
     false, 1),

    ('flashcard_flip',
     'Prohlédněte si zájmeno a jeho význam.',
     '{
       "front": "you",
       "back": "ty / vy",
       "example": "You are Anna.",
       "text_to_speak": "You are Anna."
     }'::jsonb,
     false, 2),

    ('flashcard_flip',
     'Prohlédněte si zájmena a jejich význam.',
     '{
       "front": "he / she",
       "back": "on / ona",
       "example": "He is Tom. She is Anna.",
       "text_to_speak": "He is Tom. She is Anna."
     }'::jsonb,
     false, 3),

    ('multiple_choice',
     'Doplňte správné zájmeno: ___ am Tom.',
     '{
       "options": ["I", "He", "She"],
       "correct_index": 0,
       "explanation": "Tom mluví sám o sobě, proto použijeme I = já."
     }'::jsonb,
     true, 4),

    ('multiple_choice',
     'Tom is here. ___ is my friend.',
     '{
       "options": ["He", "She", "They"],
       "correct_index": 0,
       "explanation": "Tom je muž, proto použijeme he = on."
     }'::jsonb,
     true, 5),

    ('fill_blank',
     'Anna is here. ___ is my friend.',
     '{
       "correct_answers": ["She", "she"],
       "explanation": "Anna je žena, proto použijeme she = ona."
     }'::jsonb,
     true, 6),

    ('flashcard_flip',
     'Prohlédněte si další zájmena a jejich význam.',
     '{
       "front": "we / they",
       "back": "my / oni, ony, ona",
       "example": "We are friends. They are students.",
       "text_to_speak": "We are friends. They are students."
     }'::jsonb,
     false, 7),

    ('multiple_choice',
     'Anna and Tom are here. ___ are students.',
     '{
       "options": ["They", "He", "She"],
       "correct_index": 0,
       "explanation": "Mluvíme o dvou lidech, proto použijeme they."
     }'::jsonb,
     true, 8),

    ('word_order',
     'Seřaďte slova do správného pořadí.',
     '{
       "correct_sequence": ["She", "is", "Anna."],
       "explanation": "Správná věta je She is Anna."
     }'::jsonb,
     true, 9),

    ('inline_choice',
     'Tom and Anna are here. ___ are friends.',
     '{
       "sentence": "Tom and Anna are here. ___ are friends.",
       "options": ["They", "He", "She"],
       "correct_index": 0,
       "explanation": "Tom a Anna jsou dva lidé, proto použijeme they."
     }'::jsonb,
     true, 10),

    ('listening_multiple_choice',
     'Poslechněte si větu a vyberte zájmeno, které jste slyšeli.',
     '{
       "text_to_speak": "She is Anna.",
       "options": ["he", "she", "they"],
       "correct_index": 1,
       "explanation": "Uslyšeli jste she = ona."
     }'::jsonb,
     true, 11),

    ('context_fill',
     'Vyberte větu, která správně pokračuje v rozhovoru.',
     '{
       "dialogue": [
         {"speaker": "Tom", "side": "left", "text": "Hello. I am Tom."},
         {"speaker": "Anna", "side": "right", "text": "Hello. ___ am Anna."}
       ],
       "options": ["I", "He", "She"],
       "correct_index": 0,
       "explanation": "Anna mluví sama o sobě, proto použije I."
     }'::jsonb,
     true, 12),

    ('speaking_recording',
     'Poslechněte si a zkuste věty říct nahlas.',
     '{
       "text_to_speak": "I am Tom. She is Anna. He is Tom. They are friends."
     }'::jsonb,
     false, 13)

  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1
    from public.exercises z
    where z.lesson_id = v_lesson
      and z.sort_order = e.sort_order
  );
end $$;


-- ============================================================
-- LESSON 5: My, Your, His, Her
-- 8 graded exercises
-- ============================================================

do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction'
    and l.title = 'My, Your, His, Her';

  insert into public.exercises
    (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values

    ('flashcard_flip',
     'Prohlédněte si přivlastňovací zájmeno.',
     '{
       "front": "my",
       "back": "můj / moje",
       "example": "My name is Tom.",
       "text_to_speak": "My name is Tom."
     }'::jsonb,
     false, 1),

    ('flashcard_flip',
     'Prohlédněte si přivlastňovací zájmeno.',
     '{
       "front": "your",
       "back": "tvůj / váš",
       "example": "What is your name?",
       "text_to_speak": "What is your name?"
     }'::jsonb,
     false, 2),

    ('multiple_choice',
     'Doplňte správné slovo: ___ name is Tom.',
     '{
       "options": ["My", "I", "He"],
       "correct_index": 0,
       "explanation": "Před slovem name použijeme přivlastňovací tvar my."
     }'::jsonb,
     true, 3),

    ('fill_blank',
     'Doplňte: What is ___ name?',
     '{
       "correct_answers": ["your", "Your"],
       "explanation": "Ptáme se na jméno druhé osoby, proto použijeme your."
     }'::jsonb,
     true, 4),

    ('flashcard_flip',
     'Prohlédněte si další přivlastňovací tvary.',
     '{
       "front": "his / her",
       "back": "jeho / její",
       "example": "His name is Tom. Her name is Anna.",
       "text_to_speak": "His name is Tom. Her name is Anna."
     }'::jsonb,
     false, 5),

    ('inline_choice',
     'Tom is here. ___ name is Tom.',
     '{
       "sentence": "Tom is here. ___ name is Tom.",
       "options": ["His", "Her", "Your"],
       "correct_index": 0,
       "explanation": "Tom je muž, proto použijeme his = jeho."
     }'::jsonb,
     true, 6),

    ('inline_choice',
     'Anna is here. ___ name is Anna.',
     '{
       "sentence": "Anna is here. ___ name is Anna.",
       "options": ["His", "Her", "Your"],
       "correct_index": 1,
       "explanation": "Anna je žena, proto použijeme her = její."
     }'::jsonb,
     true, 7),

    ('matching',
     'Spojte zájmeno se správným přivlastňovacím tvarem.',
     '{
       "pairs": [
         {"left": "I", "right": "my"},
         {"left": "you", "right": "your"},
         {"left": "he", "right": "his"},
         {"left": "she", "right": "her"}
       ],
       "explanation": "Každé podmětné zájmeno má svůj přivlastňovací tvar."
     }'::jsonb,
     true, 8),

    ('word_order',
     'Seřaďte slova do správného pořadí.',
     '{
       "correct_sequence": ["Her", "name", "is", "Anna."],
       "explanation": "Přivlastňovací tvar stojí před podstatným jménem: Her name."
     }'::jsonb,
     true, 9),

    ('listening_multiple_choice',
     'Poslechněte si větu a vyberte správný přivlastňovací tvar.',
     '{
       "text_to_speak": "His name is David.",
       "options": ["my", "his", "her"],
       "correct_index": 1,
       "explanation": "Uslyšeli jste his = jeho."
     }'::jsonb,
     true, 10),

    ('context_fill',
     'Vyberte repliku, která správně pokračuje v rozhovoru.',
     '{
       "dialogue": [
         {"speaker": "Anna", "side": "left", "text": "What is your name?"},
         {"speaker": "Tom", "side": "right", "text": "My name is Tom. What is ___ name?"}
       ],
       "options": ["your", "his", "her"],
       "correct_index": 0,
       "explanation": "Tom se ptá Anny na její jméno, proto použije your."
     }'::jsonb,
     true, 11),

    ('multiple_choice',
     'Vyberte správnou větu.',
     '{
       "options": [
         "She name is Anna.",
         "Her name is Anna.",
         "Her is Anna."
       ],
       "correct_index": 1,
       "explanation": "Správně je Her name is Anna."
     }'::jsonb,
     true, 12),

    ('speaking_recording',
     'Poslechněte si a zkuste věty říct nahlas.',
     '{
       "text_to_speak": "My name is Tom. Your name is Anna. His name is David. Her name is Sarah."
     }'::jsonb,
     false, 13)

  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1
    from public.exercises z
    where z.lesson_id = v_lesson
      and z.sort_order = e.sort_order
  );
end $$;


-- ============================================================
-- LESSON 6: What Is Your Name?
-- 8 graded exercises
-- ============================================================

do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction'
    and l.title = 'What Is Your Name?';

  insert into public.exercises
    (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values

    ('flashcard_flip',
     'Prohlédněte si otázku.',
     '{
       "front": "What is your name?",
       "back": "Jak se jmenuješ? / Jak se jmenujete?",
       "example": "What is your name?",
       "text_to_speak": "What is your name?"
     }'::jsonb,
     false, 1),

    ('flashcard_flip',
     'Prohlédněte si odpověď.',
     '{
       "front": "My name is...",
       "back": "Jmenuji se...",
       "example": "My name is Tom.",
       "text_to_speak": "My name is Tom."
     }'::jsonb,
     false, 2),

    ('multiple_choice',
     'Co znamená „What is your name?“',
     '{
       "options": ["Jak se jmenuješ?", "Jak se máš?", "Odkud jsi?"],
       "correct_index": 0,
       "explanation": "What is your name? se ptá na jméno."
     }'::jsonb,
     true, 3),

    ('word_order',
     'Seřaďte slova do správného pořadí.',
     '{
       "correct_sequence": ["What", "is", "your", "name?"],
       "explanation": "Správná otázka je What is your name?"
     }'::jsonb,
     true, 4),

    ('context_fill',
     'Vyberte správnou odpověď.',
     '{
       "dialogue": [
         {"speaker": "Anna", "side": "left", "text": "What is your name?"},
         {"speaker": "Tom", "side": "right", "text": "___"}
       ],
       "options": ["My name is Tom.", "Fine, thanks.", "Goodbye!"],
       "correct_index": 0,
       "explanation": "Na otázku What is your name? odpovídáme My name is..."
     }'::jsonb,
     true, 5),

    ('flashcard_flip',
     'Prohlédněte si další otázku.',
     '{
       "front": "How old are you?",
       "back": "Kolik ti je let? / Kolik je vám let?",
       "example": "How old are you? I am twenty.",
       "text_to_speak": "How old are you? I am twenty."
     }'::jsonb,
     false, 6),

    ('multiple_choice',
     'Vyberte správnou odpověď na „How old are you?“',
     '{
       "options": ["I am twenty.", "My name is Tom.", "Goodbye!"],
       "correct_index": 0,
       "explanation": "How old are you? se ptá na věk, proto odpovíme například I am twenty."
     }'::jsonb,
     true, 7),

    ('fill_blank',
     'Doplňte: What is ___ name?',
     '{
       "correct_answers": ["your", "Your"],
       "explanation": "Your používáme, když mluvíme o druhé osobě."
     }'::jsonb,
     true, 8),

    ('listening_multiple_choice',
     'Poslechněte si otázku a vyberte její význam.',
     '{
       "text_to_speak": "What is your name?",
       "options": ["Jak se jmenuješ?", "Jak se máš?", "Kolik ti je let?"],
       "correct_index": 0,
       "explanation": "Uslyšeli jste otázku na jméno."
     }'::jsonb,
     true, 9),

    ('best_reply',
     'Vyberte nejlepší odpověď.',
     '{
       "steps": [
         {
           "lines": [
             {"speaker": "Anna", "side": "left", "text": "Hello! What is your name?"}
           ],
           "reply": "My name is Tom.",
           "options": ["My name is Tom.", "Fine, thanks.", "See you!"],
           "correct_index": 0,
           "explanation": "Otázka se ptá na jméno."
         }
       ]
     }'::jsonb,
     true, 10),

    ('listening_dictation',
     'Poslechněte si větu a napište ji.',
     '{
       "text_to_speak": "My name is Anna.",
       "accepted": ["my name is anna"],
       "explanation": "Správný vzor je My name is + jméno."
     }'::jsonb,
     true, 11),

    ('speaking_recording',
     'Poslechněte si a zkuste krátký rozhovor říct nahlas.',
     '{
       "text_to_speak": "Hello! What is your name? My name is Anna."
     }'::jsonb,
     false, 12)

  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1
    from public.exercises z
    where z.lesson_id = v_lesson
      and z.sort_order = e.sort_order
  );
end $$;


-- ============================================================
-- LESSON 7: Can You Spell...?
-- 8 graded exercises
-- ============================================================

do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction'
    and l.title = 'Can You Spell...?';

  insert into public.exercises
    (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values

    ('flashcard_flip',
     'Prohlédněte si nové slovo.',
     '{
       "front": "surname",
       "back": "příjmení",
       "example": "My surname is Brown.",
       "text_to_speak": "My surname is Brown."
     }'::jsonb,
     false, 1),

    ('flashcard_flip',
     'Prohlédněte si nové slovo.',
     '{
       "front": "spell",
       "back": "hláskovat",
       "example": "Can you spell your name?",
       "text_to_speak": "Can you spell your name?"
     }'::jsonb,
     false, 2),

    ('multiple_choice',
     'Co znamená „surname“?',
     '{
       "options": ["příjmení", "jméno", "pozdrav"],
       "correct_index": 0,
       "explanation": "Surname znamená příjmení."
     }'::jsonb,
     true, 3),

    ('multiple_choice',
     'Co znamená „spell“?',
     '{
       "options": ["hláskovat", "pozdravit", "rozloučit se"],
       "correct_index": 0,
       "explanation": "Spell znamená hláskovat."
     }'::jsonb,
     true, 4),

    ('flashcard_flip',
     'Prohlédněte si užitečnou otázku.',
     '{
       "front": "Can you spell your surname, please?",
       "back": "Můžete prosím vyhláskovat své příjmení?",
       "example": "Can you spell your surname, please?",
       "text_to_speak": "Can you spell your surname, please?"
     }'::jsonb,
     false, 5),

    ('context_fill',
     'Vyberte repliku, která správně odpovídá situaci.',
     '{
       "dialogue": [
         {"speaker": "Receptionist", "side": "left", "text": "Can you spell your surname, please?"},
         {"speaker": "Tom", "side": "right", "text": "___"}
       ],
       "options": ["It is B-R-O-W-N.", "Fine, thanks.", "Goodbye."],
       "correct_index": 0,
       "explanation": "Otázka se ptá na hláskování příjmení, proto odpovíme jednotlivými písmeny."
     }'::jsonb,
     true, 6),

    ('listening_multiple_choice',
     'Poslechněte si hláskování a vyberte správné jméno.',
     '{
       "text_to_speak": "B-O-B",
       "options": ["Bob", "Ben", "Bill"],
       "correct_index": 0,
       "explanation": "B-O-B tvoří jméno Bob."
     }'::jsonb,
     true, 7),

    ('listening_dictation',
     'Poslechněte si hláskování a napište jméno.',
     '{
       "text_to_speak": "A-N-N-A",
       "accepted": ["anna"],
       "explanation": "Poslouchali jste jednotlivá písmena A-N-N-A."
     }'::jsonb,
     true, 8),

    ('word_order',
     'Seřaďte slova do správného pořadí.',
     '{
       "correct_sequence": ["Can", "you", "spell", "your", "name?"],
       "explanation": "Správná otázka je Can you spell your name?"
     }'::jsonb,
     true, 9),

    ('fill_blank',
     'Doplňte: My ___ is Brown.',
     '{
       "correct_answers": ["surname", "Surname"],
       "explanation": "Surname znamená příjmení."
     }'::jsonb,
     true, 10),

    ('best_reply',
     'Vyberte nejlepší odpověď.',
     '{
       "steps": [
         {
           "lines": [
             {"speaker": "Receptionist", "side": "left", "text": "Can you spell your surname, please?"}
           ],
           "reply": "It is B-R-O-W-N.",
           "options": ["It is B-R-O-W-N.", "Fine, thanks.", "Good night."],
           "correct_index": 0,
           "explanation": "Otázka se ptá na hláskování příjmení."
         }
       ]
     }'::jsonb,
     true, 11),

    ('speaking_recording',
     'Poslechněte si a zkuste nahlas vyhláskovat své jméno nebo příjmení.',
     '{
       "text_to_speak": "Can you spell your surname, please?"
     }'::jsonb,
     false, 12)

  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1
    from public.exercises z
    where z.lesson_id = v_lesson
      and z.sort_order = e.sort_order
  );
end $$;


-- ============================================================
-- LESSON 8: Nice to Meet You
-- 8 graded exercises
-- ============================================================

do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction'
    and l.title = 'Nice to Meet You';

  insert into public.exercises
    (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values

    ('flashcard_flip',
     'Prohlédněte si užitečnou frázi.',
     '{
       "front": "Nice to meet you.",
       "back": "Rád vás poznávám. / Těší mě.",
       "example": "Nice to meet you.",
       "text_to_speak": "Nice to meet you."
     }'::jsonb,
     false, 1),

    ('flashcard_flip',
     'Prohlédněte si odpověď.',
     '{
       "front": "Nice to meet you, too.",
       "back": "Mě také těší.",
       "example": "Nice to meet you, too.",
       "text_to_speak": "Nice to meet you, too."
     }'::jsonb,
     false, 2),

    ('multiple_choice',
     'Kdy použijete „Nice to meet you“?',
     '{
       "options": [
         "Když se s někým poprvé seznamujete.",
         "Když jdete spát.",
         "Když se ptáte na příjmení."
       ],
       "correct_index": 0,
       "explanation": "Nice to meet you používáme při prvním setkání."
     }'::jsonb,
     true, 3),

    ('context_fill',
     'Vyberte správnou odpověď.',
     '{
       "dialogue": [
         {"speaker": "Tom", "side": "left", "text": "Nice to meet you."},
         {"speaker": "Anna", "side": "right", "text": "___"}
       ],
       "options": ["Nice to meet you, too.", "Good morning.", "I am twenty."],
       "correct_index": 0,
       "explanation": "Na Nice to meet you odpovídáme Nice to meet you, too."
     }'::jsonb,
     true, 4),

    ('flashcard_flip',
     'Prohlédněte si frázi pro poděkování.',
     '{
       "front": "Thank you.",
       "back": "Děkuji.",
       "example": "Thank you.",
       "text_to_speak": "Thank you."
     }'::jsonb,
     false, 5),

    ('flashcard_flip',
     'Prohlédněte si odpověď na poděkování.',
     '{
       "front": "You are welcome.",
       "back": "Není zač.",
       "example": "Thank you. You are welcome.",
       "text_to_speak": "You are welcome."
     }'::jsonb,
     false, 6),

    ('best_reply',
     'Vyberte nejlepší odpověď.',
     '{
       "steps": [
         {
           "lines": [
             {"speaker": "Anna", "side": "left", "text": "Thank you."}
           ],
           "reply": "You are welcome.",
           "options": ["You are welcome.", "Nice to meet you.", "Good morning."],
           "correct_index": 0,
           "explanation": "You are welcome používáme jako odpověď na Thank you."
         }
       ]
     }'::jsonb,
     true, 7),

    ('multiple_choice',
     'Co znamená „too“ ve frázi „Nice to meet you, too.“?',
     '{
       "options": ["také", "zítra", "prosím"],
       "correct_index": 0,
       "explanation": "Too zde znamená také."
     }'::jsonb,
     true, 8),

    ('word_order',
     'Seřaďte slova do správného pořadí.',
     '{
       "correct_sequence": ["Nice", "to", "meet", "you,", "too."],
       "explanation": "Správná fráze je Nice to meet you, too."
     }'::jsonb,
     true, 9),

    ('listening_multiple_choice',
     'Poslechněte si krátký rozhovor a vyberte, co se děje.',
     '{
       "text_to_speak": "Nice to meet you. Nice to meet you, too.",
       "options": [
         "Dva lidé se seznamují.",
         "Dva lidé se loučí.",
         "Jeden člověk se ptá na věk."
       ],
       "correct_index": 0,
       "explanation": "Fráze Nice to meet you se používá při seznamování."
     }'::jsonb,
     true, 10),

    ('context_fill',
     'Vyberte správné pokračování.',
     '{
       "dialogue": [
         {"speaker": "Tom", "side": "left", "text": "Thank you."},
         {"speaker": "Anna", "side": "right", "text": "___"}
       ],
       "options": ["You are welcome.", "Nice to meet you.", "Goodbye."],
       "correct_index": 0,
       "explanation": "Na Thank you odpovídáme You are welcome."
     }'::jsonb,
     true, 11),

    ('reading_comprehension',
     'Přečtěte si rozhovor a odpovězte na otázku.',
     '{
       "dialogue": [
         {"speaker": "Tom", "side": "left", "text": "Hello. My name is Tom."},
         {"speaker": "Anna", "side": "right", "text": "Hello. My name is Anna."},
         {"speaker": "Tom", "side": "left", "text": "Nice to meet you."},
         {"speaker": "Anna", "side": "right", "text": "Nice to meet you, too."}
       ],
       "question": "Co Anna říká po větě Nice to meet you?",
       "options": ["Nice to meet you, too.", "Thank you.", "Goodbye."],
       "correct_index": 0,
       "explanation": "Anna odpovídá Nice to meet you, too."
     }'::jsonb,
     true, 12),

    ('speaking_recording',
     'Poslechněte si a zkuste rozhovor říct nahlas.',
     '{
       "text_to_speak": "Hello. My name is Tom. Nice to meet you. Nice to meet you, too."
     }'::jsonb,
     false, 13)

  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1
    from public.exercises z
    where z.lesson_id = v_lesson
      and z.sort_order = e.sort_order
  );
end $$;


-- ============================================================
-- LESSON 9: A Complete Introduction
-- 8 graded exercises
-- ============================================================

do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction'
    and l.title = 'A Complete Introduction';

  insert into public.exercises
    (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values

    ('flashcard_flip',
     'Prohlédněte si celý vzor představení.',
     '{
       "front": "Hello! My name is Tom.",
       "back": "Ahoj! Jmenuji se Tom.",
       "example": "Hello! My name is Tom.",
       "text_to_speak": "Hello! My name is Tom."
     }'::jsonb,
     false, 1),

    ('multiple_choice',
     'Která věta představuje člověka?',
     '{
       "options": ["My name is Tom.", "Goodbye!", "Fine, thanks."],
       "correct_index": 0,
       "explanation": "My name is Tom. používáme při představování."
     }'::jsonb,
     true, 2),

    ('flashcard_flip',
     'Prohlédněte si otázku a odpověď.',
     '{
       "front": "What is your name? - My name is...",
       "back": "Jak se jmenuješ? - Jmenuji se...",
       "example": "What is your name? My name is Anna.",
       "text_to_speak": "What is your name? My name is Anna."
     }'::jsonb,
     false, 3),

    ('context_fill',
     'Vyberte správnou odpověď.',
     '{
       "dialogue": [
         {"speaker": "Anna", "side": "left", "text": "Hello! What is your name?"},
         {"speaker": "Tom", "side": "right", "text": "___"}
       ],
       "options": ["My name is Tom.", "Fine, thanks.", "Goodbye!"],
       "correct_index": 0,
       "explanation": "Na otázku What is your name? odpovídáme My name is..."
     }'::jsonb,
     true, 4),

    ('word_order',
     'Seřaďte slova do správného pořadí.',
     '{
       "correct_sequence": ["My", "name", "is", "Tom."],
       "explanation": "Správný vzor je My name is + jméno."
     }'::jsonb,
     true, 5),

    ('flashcard_flip',
     'Prohlédněte si frázi pro první setkání.',
     '{
       "front": "Nice to meet you.",
       "back": "Rád vás poznávám. / Těší mě.",
       "example": "Nice to meet you.",
       "text_to_speak": "Nice to meet you."
     }'::jsonb,
     false, 6),

    ('listening_multiple_choice',
     'Poslechněte si krátké představení a vyberte jméno.',
     '{
       "text_to_speak": "Hello! My name is Sarah.",
       "options": ["Anna", "Sarah", "Tom"],
       "correct_index": 1,
       "explanation": "Mluvčí říká My name is Sarah."
     }'::jsonb,
     true, 7),

    ('flashcard_flip',
     'Prohlédněte si otázku na příjmení.',
     '{
       "front": "Can you spell your surname, please?",
       "back": "Můžete prosím vyhláskovat své příjmení?",
       "example": "Can you spell your surname, please?",
       "text_to_speak": "Can you spell your surname, please?"
     }'::jsonb,
     false, 8),

    ('best_reply',
     'Vyberte nejlepší odpověď.',
     '{
       "steps": [
         {
           "lines": [
             {"speaker": "Receptionist", "side": "left", "text": "Can you spell your surname, please?"}
           ],
           "reply": "It is B-R-O-W-N.",
           "options": ["It is B-R-O-W-N.", "Fine, thanks.", "Nice to meet you."],
           "correct_index": 0,
           "explanation": "Otázka se ptá na hláskování příjmení."
         }
       ]
     }'::jsonb,
     true, 9),

    ('listening_dictation',
     'Poslechněte si a napište větu.',
     '{
       "text_to_speak": "My name is Tom.",
       "accepted": ["my name is tom"],
       "explanation": "Používáme vzor My name is + jméno."
     }'::jsonb,
     true, 10),

    ('reading_comprehension',
     'Přečtěte si rozhovor a odpovězte na otázku.',
     '{
       "dialogue": [
         {"speaker": "Receptionist", "side": "left", "text": "Good morning. What is your name?"},
         {"speaker": "Tom", "side": "right", "text": "My name is Tom Brown."},
         {"speaker": "Receptionist", "side": "left", "text": "Can you spell your surname, please?"},
         {"speaker": "Tom", "side": "right", "text": "B-R-O-W-N."},
         {"speaker": "Receptionist", "side": "left", "text": "Nice to meet you."},
         {"speaker": "Tom", "side": "right", "text": "Nice to meet you, too."}
       ],
       "question": "Jaké je Tomovo příjmení?",
       "options": ["Tom", "Brown", "Anna"],
       "correct_index": 1,
       "explanation": "Tomovo příjmení je Brown."
     }'::jsonb,
     true, 11),

    ('context_fill',
     'Vyberte správné zakončení rozhovoru.',
     '{
       "dialogue": [
         {"speaker": "Anna", "side": "left", "text": "Nice to meet you."},
         {"speaker": "Tom", "side": "right", "text": "___"}
       ],
       "options": ["Nice to meet you, too.", "What is your name?", "Good morning."],
       "correct_index": 0,
       "explanation": "Na Nice to meet you odpovídáme Nice to meet you, too."
     }'::jsonb,
     true, 12),

    ('speaking_recording',
     'Poslechněte si a zkuste celé krátké představení říct nahlas.',
     '{
       "text_to_speak": "Hello. My name is Tom Brown. Nice to meet you."
     }'::jsonb,
     false, 13)

  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1
    from public.exercises z
    where z.lesson_id = v_lesson
      and z.sort_order = e.sort_order
  );
end $$;


-- ============================================================
-- LESSON 10: Meet Someone
-- 8 graded exercises
-- Final integrated retrieval
-- ============================================================

do $$
declare v_lesson uuid;
begin
  select l.id into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where u.title = 'Greetings & introduction'
    and l.title = 'Meet Someone';

  insert into public.exercises
    (lesson_id, type, prompt, content, points, is_required, sort_order)
  select v_lesson, e.type, e.prompt, e.content, 10, e.req, e.sort_order
  from (values

    ('multiple_choice',
     'Vyberte správný začátek rozhovoru.',
     '{
       "options": ["Hello!", "Thank you.", "Goodbye!"],
       "correct_index": 0,
       "explanation": "Hello! je běžný pozdrav při setkání."
     }'::jsonb,
     true, 1),

    ('best_reply',
     'Vyberte nejlepší odpověď.',
     '{
       "steps": [
         {
           "lines": [
             {"speaker": "Anna", "side": "left", "text": "Hello! What is your name?"}
           ],
           "reply": "My name is Tom.",
           "options": ["My name is Tom.", "Fine, thanks.", "Goodbye!"],
           "correct_index": 0,
           "explanation": "Otázka se ptá na jméno."
         },
         {
           "lines": [
             {"speaker": "Anna", "side": "left", "text": "Hello! What is your name?"},
             {"speaker": "Tom", "side": "right", "text": "My name is Tom."}
           ],
           "reply": "Nice to meet you.",
           "options": ["Nice to meet you.", "Good night.", "I am twenty."],
           "correct_index": 0,
           "explanation": "Po představení můžeme říct Nice to meet you."
         }
       ]
     }'::jsonb,
     true, 2),

    ('flashcard_flip',
     'Prohlédněte si frázi pro loučení.',
     '{
       "front": "See you!",
       "back": "Tak zatím! / Uvidíme se!",
       "example": "See you!",
       "text_to_speak": "See you!"
     }'::jsonb,
     false, 3),

    ('context_fill',
     'Vyberte správné zakončení rozhovoru.',
     '{
       "dialogue": [
         {"speaker": "Tom", "side": "left", "text": "Nice to meet you."},
         {"speaker": "Anna", "side": "right", "text": "Nice to meet you, too."},
         {"speaker": "Tom", "side": "left", "text": "___"}
       ],
       "options": ["See you!", "What is your name?", "Fine, thanks."],
       "correct_index": 0,
       "explanation": "See you! používáme při loučení."
     }'::jsonb,
     true, 4),

    ('listening_multiple_choice',
     'Poslechněte si představení a vyberte jméno.',
     '{
       "text_to_speak": "Hello! My name is Anna. Nice to meet you.",
       "options": ["Anna", "Tom", "Brown"],
       "correct_index": 0,
       "explanation": "Mluvčí říká My name is Anna."
     }'::jsonb,
     true, 5),

    ('flashcard_flip',
     'Prohlédněte si frázi pro poděkování.',
     '{
       "front": "Thank you. - You are welcome.",
       "back": "Děkuji. - Není zač.",
       "example": "Thank you. You are welcome.",
       "text_to_speak": "Thank you. You are welcome."
     }'::jsonb,
     false, 6),

    ('inline_choice',
     'Tom is here. ___ name is Tom.',
     '{
       "sentence": "Tom is here. ___ name is Tom.",
       "options": ["His", "Her", "Your"],
       "correct_index": 0,
       "explanation": "Tom je muž, proto použijeme his."
     }'::jsonb,
     true, 7),

    ('word_order',
     'Seřaďte slova do správného pořadí.',
     '{
       "correct_sequence": ["Can", "you", "spell", "your", "surname?"],
       "explanation": "Správná otázka je Can you spell your surname?"
     }'::jsonb,
     true, 8),

    ('reading_comprehension',
     'Přečtěte si rozhovor a odpovězte na otázku.',
     '{
       "dialogue": [
         {"speaker": "Anna", "side": "left", "text": "Good morning! My name is Anna."},
         {"speaker": "Tom", "side": "right", "text": "Good morning. My name is Tom Brown."},
         {"speaker": "Anna", "side": "left", "text": "Nice to meet you."},
         {"speaker": "Tom", "side": "right", "text": "Nice to meet you, too."},
         {"speaker": "Anna", "side": "left", "text": "Can you spell your surname, please?"},
         {"speaker": "Tom", "side": "right", "text": "B-R-O-W-N."}
       ],
       "question": "Jaké je Tomovo příjmení?",
       "options": ["Anna", "Tom", "Brown"],
       "correct_index": 2,
       "explanation": "Tomovo příjmení je Brown."
     }'::jsonb,
     true, 9),

    ('listening_dictation',
     'Poslechněte si a napište frázi.',
     '{
       "text_to_speak": "Nice to meet you.",
       "accepted": ["nice to meet you"],
       "explanation": "Nice to meet you je běžná fráze při prvním setkání."
     }'::jsonb,
     true, 10),

    ('speaking_recording',
     'Zkuste sami říct krátké představení.',
     '{
       "text_to_speak": "Hello! My name is Anna. Nice to meet you."
     }'::jsonb,
     false, 11)

  ) as e(type, prompt, content, req, sort_order)
  where not exists (
    select 1
    from public.exercises z
    where z.lesson_id = v_lesson
      and z.sort_order = e.sort_order
  );
end $$;