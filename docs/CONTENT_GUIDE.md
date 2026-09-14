# Exercise Content Guide (for content AI)

How to generate exercises for the AQAP English app. The app reads lessons and exercises from
Supabase; the exercises table stores everything in a `content` JSON column. This document
defines exactly what each exercise type expects so generated tasks always work.

## Content hierarchy

```
levels (Book 1, Book 2, Intensive course for adult etc. )
└── units 
    └── lessons (8 exercises each; pass_score default 60)
        └── exercises (sort_order 1..n)
```
## DATABASE CONTRACT 

LESSONS TABLE - exact contract. Use ONLY these columns:

public.lessons
  id                uuid - auto, never insert
  unit_id           uuid - required, always looked up, never hardcoded
  title             text - student-facing lesson name
  description       text - begin with the category label:
                    "Introductory - ..." / "Grammatical - ..." /
                    "Practical - ..." / "Revisionary - ..."
  estimated_minutes integer - 3 to 8 for a revision set
  is_published      boolean
  sort_order        integer 1..10 within the unit
  created_at        auto, never insert

Unit lookup pattern (books = levels):
  select u.id from public.units u
  join public.levels l on l.id = u.level_id
  where l.cefr_level = 'A1'
    and u.title = 'Greetings & introduction';

PUBLIC.EXERCISES - exact contract:
  id          uuid - auto
  lesson_id   uuid - look up via unit title + lesson title
  type        text - ONLY one of the 21 implemented names:
    multiple_choice, fill_blank, word_order, matching,
    listening_multiple_choice, listening_dictation,
    speaking_recording, reading_comprehension, inline_choice,
    context_fill, listening_word_order, sentence_order,
    flashcard_flip, error_spot, stress_tap, silent_letter,
    word_sort, form_fill, image_choice, document_reader,
    best_reply
  prompt      text - the task line the student sees
  content     jsonb - EXACTLY the shape from the content guide
  points      integer - use 10
  sort_order  integer 1..n within the lesson

RULES
1. Insert only the listed columns; everything else defaults.
2. Never create tables or columns; never insert ids/timestamps.
3. Scripts must be re-runnable: do $$ ... $$ block with
   where not exists guards on (unit_id, title) / (lesson_id, sort_order).
4. Lessons may be is_published = true; staging is controlled by
   the UNIT's is_published flag, not the lesson's.
5. 8 exercises per lesson; mix types; every answer needs a
   source of truth (audio contains the fact, or grammar decides).
6. One script per unit (lessons + exercises together). Start with
   Unit 1 "Greetings & introduction", 10 lessons.
7. Before the SQL, print a planning table: lesson #, title,
   category, exercise types used - so I can sanity-check the mix.

TEMPLATE for the lessons part of the script:

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
    ('Lesson title 1', 'Introductory - ...', 5, 1),
    ('Lesson title 2', 'Grammatical - ...', 5, 2)
    -- ...10 rows
  ) as x(title, description, minutes, sort_order)
  where not exists (
    select 1 from public.lessons z
    where z.unit_id = v_unit and z.title = x.title
  );
end $$;
## The exercises table

| column       | meaning                                                              |
| ------------ | -------------------------------------------------------------------- |
| id           | uuid (let Supabase generate it, or supply one)                       |
| lesson_id    | uuid of the parent lesson                                            |
| type         | one of the 21 types below (exact string)                             |
| prompt       | text shown above the exercise (see conventions below)                |
| content      | JSON object, shape depends on the type (see reference)               |
| is_required  | `true` = counts toward the score. `false` = ungraded practice        |
| sort_order   | 1, 2, 3... within the lesson                                         |

`is_required` semantics:

- `true` (default): the answer is graded and counts toward the lesson score.
- `false`: the exercise never fails the learner — tapping Continue just moves on.
  Use it for speaking and flashcard practice.

## Shared conventions

- **The blank marker is `___`** (three underscores). It appears inside `prompt` or content
  strings where the learner fills/selects something.
- **Grading is exact after normalization.** Text answers are normalized: lowercase, stripped
  of punctuation, whitespace collapsed. Provide ALL acceptable spellings in
  `correct_answers` / `accepted`.
- **Every type has `explanation`** (shown after answering). Keep it one short sentence.
- **Audio**: types with `text_to_speak` are read aloud by the device's speech engine on
  native; on web the browser reads them. Write natural, complete sentences.
- **Images**: `image_url` is a path inside the public `content` storage bucket
  (e.g. `images/travel/bus.png`), or a full public URL.
- Options arrays: put the correct option at `correct_index`; the app shuffles where it
  wants to. Never rely on array order being preserved.
- JSON must be valid; escape quotes inside strings (`\"`). No trailing commas, no comments.

## Type reference

### 1. multiple_choice — classic quiz

Learner picks one option. Prompt carries the question.

```json
{
  "options": ["At 7:00", "At 9:00", "At 11:00"],
  "correct_index": 1,
  "explanation": "The train to London leaves at 9:00."
}
```

Grading: selected index === correct_index.

### 2. inline_choice — sentence with an in-line blank

One sentence, one blank inside the sentence (mark it `___`), pick the word.

Prompt: `"The museum is ___ on Mondays."`

```json
{
  "sentence": "The museum is ___ on Mondays.",
  "options": ["closed", "close", "closing"],
  "correct_index": 0,
  "explanation": "We use the adjective 'closed' after 'is'.",
  "tip": "Adjectives describe the subject."
}
```

Grading: selected index === correct_index.

### 3. fill_blank — type the missing word

Prompt is the sentence with `___`. Learner types one answer.

Prompt: `"I ___ my teeth every morning."`

```json
{
  "correct_answers": ["brush", "brushes"],
  "explanation": "With 'I' we use 'brush'."
}
```

Grading: typed text, normalized, equals any entry of `correct_answers` (case- and
punctuation-insensitive). Include irregular/contracted variants if you accept them.

### 4. word_order — build the sentence from word chips

Learner taps words in order. Provide the exact correct sequence; the app builds the
shuffled chip bank from it (the old `words` field is ignored).

Prompt: `"Put the words in the right order:"`

```json
{
  "correct_sequence": ["She", "is", "reading", "a", "book"],
  "explanation": "Subject, verb, then the rest."
}
```

Grading: the full tapped sequence matches `correct_sequence` exactly.

### 5. sentence_order — order sentence parts

Like word_order but with whole sentence chunks (longer text).

Prompt: `"Order the sentence parts:"`

```json
{
  "correct_sequence": ["Every morning,", "I drink", "a cup of coffee."],
  "explanation": "Time phrase first, then subject + verb + object."
}
```

Grading: tapped order matches `correct_sequence` exactly.

### 6. matching — connect pairs

Two columns; learner taps a left item then its right partner. Tap-graded.

Prompt: `"Match the word with its meaning:"`

```json
{
  "pairs": [
    { "left": "journey", "right": "a trip from one place to another" },
    { "left": "destination", "right": "the place you are going to" },
    { "left": "luggage", "right": "bags you take when you travel" }
  ],
  "explanation": "These are all travel words."
}
```

Grading: all pairs matched correctly before Continue is offered. Keep 3-5 pairs.

### 7. context_fill — pick the line that completes the dialogue

A short dialogue where ONE line contains `___`; learner picks the missing reply.
Optionally also has a `tip`.

```json
{
  "dialogue": [
    { "speaker": "Anna", "side": "left", "text": "Hi! How was your trip?" },
    { "speaker": "Ben", "side": "right", "text": "It was great, thanks!" },
    { "speaker": "Anna", "side": "left", "text": "___" }
  ],
  "options": ["Did you go by plane?", "I went to the park.", "Do you like tea?"],
  "correct_index": 0,
  "explanation": "Asking about the trip fits the conversation."
}
```

Grading: selected index === correct_index. Speakers are `Anna`/`Ben`-style names;
`side` alternates left/right.

### 8. best_reply — choose the best reply, in steps

A mini conversation told in 2-3 steps. Each step shows its lines, options, and the
learner picks the reply that continues the chat. The chosen reply becomes the next line.

```json
{
  "steps": [
    {
      "lines": [
        { "speaker": "Sam", "side": "left", "text": "I'm looking for a job." }
      ],
      "reply": "What kind of work do you do?",
      "options": ["What kind of work do you do?", "That's a good movie.", "Where is the station?"],
      "correct_index": 0,
      "explanation": "Asking about the job keeps the conversation going."
    },
    {
      "lines": [
        { "speaker": "Sam", "side": "left", "text": "I'm looking for a job." },
        { "speaker": "Anna", "side": "right", "text": "What kind of work do you do?" }
      ],
      "reply": "I'm a cook, but I want to change careers.",
      "options": ["I'm a cook, but I want to change careers.", "I work at a bakery.", "No, thanks."],
      "correct_index": 0,
      "explanation": "Answering the question moves the dialogue forward."
    }
  ]
}
```

Grading: each step graded on the selected index; Continue appears after the last step.
The `lines` array of each step = previous step's lines + its chosen reply.

### 9. listening_multiple_choice — hear, then pick

The app reads `text_to_speak` aloud; learner answers a question.

Prompt: `"Listen and choose the correct answer:"`

```json
{
  "text_to_speak": "The new office opens at nine o'clock on weekdays.",
  "options": ["9:00", "10:00", "8:30"],
  "correct_index": 0,
  "explanation": "The office opens at nine."
}
```

Grading: selected index === correct_index.

### 10. listening_dictation — type what you hear

The app reads a sentence; learner types it. Graded on any accepted spelling.

Prompt: `"Listen and type what you hear:"`

```json
{
  "text_to_speak": "She works in a hospital.",
  "accepted": ["She works in a hospital"],
  "explanation": "Full sentence, heard and typed."
}
```

Grading: normalized typed text equals any entry of `accepted` (lowercase, punctuation
stripped, spaces collapsed). Keep `text_to_speak` short (one sentence).

### 11. listening_word_order — hear, then order chips

Hear the sentence, rebuild it from word chips.

Prompt: `"Listen and put the words in order:"`

```json
{
  "text_to_speak": "The children are playing in the garden.",
  "correct_sequence": ["The", "children", "are", "playing", "in", "the", "garden."],
  "explanation": "Listen for the word order."
}
```

Grading: tapped order matches `correct_sequence` exactly. Keep the sentence short.

### 12. reading_comprehension — read, then answer

A dialogue or bubbles to read (also read aloud on request), then ONE multiple-choice
question. Use EITHER `bubbles` (simple text lines) OR `dialogue` (speaker/side lines).

```json
{
  "bubbles": [
    "Ben wants to buy a birthday gift for his sister.",
    "He sees a nice red scarf for twenty euros.",
    "He buys it and walks home happy."
  ],
  "question": "What does Ben buy?",
  "options": ["A red scarf", "A blue hat", "A birthday cake"],
  "correct_index": 0,
  "explanation": "Ben buys the red scarf.",
  "text_to_speak": "Ben wants to buy a birthday gift..."
}
```

or with `dialogue`:

```json
{
  "dialogue": [
    { "speaker": "Mia", "side": "left", "text": "Do you want to go for a walk?" },
    { "speaker": "Leo", "side": "right", "text": "Sure, but it looks rainy." }
  ],
  "question": "Why does Leo hesitate?",
  "options": ["It looks rainy", "He is tired", "He has no shoes"],
  "correct_index": 0,
  "explanation": "Leo mentions the rain."
}
```

Grading: selected index === correct_index. `text_to_speak` is optional (used for the
listen button).

### 13. document_reader — read a document, answer questions

A short document (image or text lines) plus 1-3 questions, all graded together.

```json
{
  "image_url": null,
  "document_lines": [
    "Summer Sale!",
    "All shoes -20% this week only.",
    "Open Monday to Saturday, 9:00-18:00."
  ],
  "questions": [
    {
      "question": "When is the sale?",
      "options": ["This week", "Next month", "In winter"],
      "correct_index": 0,
      "explanation": "The poster says 'this week only'."
    }
  ],
  "explanation": "Read the poster carefully."
}
```

Grading: ALL questions must be correct (one wrong answer = exercise wrong).
Use `image_url` for a photo document or `document_lines` for text.

### 14. error_spot — find the mistake, then fix it

Learner taps the wrong word in the sentence, then picks the correct one from options.

Prompt: `"Find the mistake and fix it:"`

```json
{
  "words": ["He", "go", "to school", "every day."],
  "wrong_index": 1,
  "options": ["goes", "went", "gone"],
  "correct_index": 0,
  "explanation": "He goes to school - third person 's'."
}
```

Grading: both the tapped mistake AND the chosen fix must be right. Split the sentence
into chunks in `words`; `wrong_index` points at the chunk containing the error.

### 15. stress_tap — tap the stressed syllable

Learner hears the word and taps which syllable carries the stress.

```json
{
  "syllables": ["COM", "put", "er"],
  "correct_index": 0,
  "text_to_speak": "computer",
  "explanation": "The stress is on the first syllable."
}
```

Grading: tapped index === correct_index. Syllables should be uppercase for the stressed
one.

### 16. silent_letter — tap the silent letter

Learner taps which letter is silent in the shown word.

```json
{
  "letters": ["k", "n", "i"],
  "correct_index": 0,
  "explanation": "The 'k' is silent in 'knife'."
}
```

Grading: tapped index === correct_index. The letters are shown separately; put the word
itself in the prompt.

### 17. word_sort — sort words into two categories

Drag/tap each word into one of two categories.

Prompt: `"Sort the words:"`

```json
{
  "categories": ["Countable", "Uncountable"],
  "items": [
    { "word": "apple", "category": 0 },
    { "word": "milk", "category": 1 },
    { "word": "chair", "category": 0 },
    { "word": "water", "category": 1 }
  ],
  "explanation": "Countable things can be counted: two apples."
}
```

Grading: every item placed in the right category (category 0 or 1). Use 4-6 items.

### 18. form_fill — fill a form (multiple blanks)

A form-like card with 2-4 fields; each field has a prompt with `___` and its own options.

Prompt: `"Fill in the booking form:"`

```json
{
  "title": "Hotel booking",
  "text_to_speak": null,
  "fields": [
    {
      "prompt": "Name: ___",
      "options": ["Anna Smith", "Smith Anna"],
      "correct_index": 0,
      "explanation": "First name then last name."
    },
    {
      "prompt": "Room: ___",
      "options": ["single", "double"],
      "correct_index": 1,
      "explanation": "A double room has two beds."
    }
  ],
  "explanation": "Standard hotel form fields."
}
```

Grading: ALL fields must be correct.

### 19. image_choice — pick the picture

Learner sees an image (or a prompt) and picks the matching option. Tap-graded.

Prompt: `"What is this?"`

```json
{
  "image_url": "images/kitchen/oven.png",
  "text_to_speak": "oven",
  "prompt": null,
  "options": ["an oven", "a fridge", "a sink"],
  "correct_index": 0,
  "explanation": "This is an oven."
}
```

Grading: tapped index === correct_index. The image comes from the `content` bucket.

### 20. speaking_recording — speak after the model (ungraded)

The app plays the model sentence; learner repeats it out loud and taps
"I said it out loud". No recording, no scoring yet.

Prompt: `"Listen and repeat:"`

```json
{
  "text_to_speak": "Could you open the window, please?"
}
```

Grading: ungraded. Set `is_required: false`.

### 21. flashcard_flip — self-study card (ungraded)

A two-sided card; learner flips it and taps "Got it". No question to answer.

```json
{
  "front": "to book a ticket",
  "back": "rezervovat letenku / lístek",
  "example": "I booked a ticket online.",
  "text_to_speak": "I booked a ticket online."
}
```

Grading: ungraded. Set `is_required: false`.

### Placeholder: flashcard (legacy)

The type string `flashcard` exists but has no renderer yet. Do NOT generate it.

## SQL insert template

```sql
INSERT INTO exercises (lesson_id, type, prompt, content, is_required, sort_order)
VALUES
  (
    '<lesson-uuid>',
    'multiple_choice',
    'What time does the train leave?',
    '{"options": ["7:00", "9:00", "11:00"], "correct_index": 1, "explanation": "The train leaves at nine."}'::jsonb,
    true,
    1
  ),
  (
    '<lesson-uuid>',
    'fill_blank',
    'I ___ my teeth every morning.',
    '{"correct_answers": ["brush", "brushes"], "explanation": "With ''I'' we use ''brush''."}'::jsonb,
    true,
    2
  );
```

## Checklist for every generated exercise

1. `type` is one of the 21 strings above (not `flashcard`).
2. `content` is valid JSON with exactly the fields listed for the type.
3. `correct_index` is a valid index into `options` (or `letters`/`syllables`/`words`).
4. `correct_sequence`/`correct_answers`/`accepted` match the source text exactly.
5. `explanation` present and one short sentence.
6. Every `___` in prompts/sentences corresponds to exactly one blank in the UI.
7. `is_required: false` only for speaking_recording and flashcard_flip.
8. `sort_order` starts at 1 with no gaps within a lesson.
9. Speaking and listening text is complete, natural English, one sentence where possible.
10. A lesson mixes at least 3 different types (recommended 5-8 exercises total).