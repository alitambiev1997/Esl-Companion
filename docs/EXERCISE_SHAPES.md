# Exercise content shapes

Contract for `exercises.content` (JSONB) per `exercises.type`.
This is the source of truth for future AI-generated SQL content.
All fields are required unless marked optional.

## multiple_choice

```json
{
  "options": ["string", "..."],
  "correct_index": 0,
  "explanation": "string"
}
```

Example:

```json
{
  "options": ["Registering at the hotel", "Leaving the hotel", "Paying the bill", "Cleaning the room"],
  "correct_index": 0,
  "explanation": "Check-in is the process of registering when you arrive at the hotel."
}
```

## fill_blank

```json
{
  "correct_answers": ["string", "..."],
  "explanation": "string"
}
```

The answer is normalized (lowercase, punctuation stripped, spaces collapsed) before comparing.
`correct_answers` should include common variants.

Example:

```json
{
  "correct_answers": ["wi-fi", "wifi", "Wi-Fi"],
  "explanation": "Most hotels provide free Wi-Fi for guests."
}
```

## word_order

```json
{
  "words": ["string", "..."],
  "correct_sequence": ["string", "..."],
  "explanation": "string"
}
```

`words` is the word bank (the renderer shuffles it once on mount for display); `correct_sequence` is the exact order that scores a correct answer.

Example:

```json
{
  "words": ["I", "need", "a", "wake-up", "call."],
  "correct_sequence": ["I", "need", "a", "wake-up", "call."],
  "explanation": "You ask reception for a wake-up call."
}
```

## matching

```json
{
  "pairs": [{ "left": "string", "right": "string" }, "..."],
  "explanation": "string"
}
```

The right column is shuffled for display. All pairs must match to be correct; feedback lists wrong pairs.

Example:

```json
{
  "pairs": [
    { "left": "reception", "right": "the front desk" },
    { "left": "lobby", "right": "the big hall at the entrance" },
    { "left": "mini bar", "right": "drinks in your room" },
    { "left": "doorman", "right": "helps you with your bags" }
  ],
  "explanation": "These are common hotel words you will see and hear."
}
```

## listening_multiple_choice

```json
{
  "text_to_speak": "string",
  "options": ["string", "..."],
  "correct_index": 0,
  "explanation": "string"
}
```

Audio is spoken with device TTS (auto-play on mount; Play / Slow buttons).

Example:

```json
{
  "text_to_speak": "Breakfast is served from seven to ten.",
  "options": ["7 to 10", "6 to 9", "8 to 11", "9 to 12"],
  "correct_index": 0,
  "explanation": "Breakfast is served from 7 to 10."
}
```

## listening_dictation

```json
{
  "text_to_speak": "string",
  "accepted": ["string", "..."],
  "explanation": "string"
}
```

Both sides are normalized before comparing; `accepted` may contain spelling variants.

Example:

```json
{
  "text_to_speak": "The elevator is out of order.",
  "accepted": ["The elevator is out of order"],
  "explanation": "Out of order means it is not working."
}
```

## speaking_recording

```json
{
  "text_to_speak": "string"
}
```

Ungraded practice: the user compares their voice with the model. Attempts are stored with `is_correct = true` and the exercise must be marked `is_required = false` so it never affects the score.

Example:

```json
{
  "text_to_speak": "Good evening, I have a reservation under the name Smith."
}
```

## reading_comprehension

```json
{
  "bubbles": ["string", "..."],
  "text_to_speak": "string",
  "question": "string",
  "options": ["string", "..."],
  "correct_index": 0,
  "explanation": "string"
}
```

The passage is shown as alternating chat bubbles (left sky-tinted / right white); `text_to_speak` is the TTS version (auto-played; a small Listen control replays it). The question renders bold below the bubbles.

Example:

```json
{
  "bubbles": [
    "Good evening. Welcome to the Grand Hotel.",
    "I have a reservation under the name Novak.",
    "Certainly, Mrs. Novak. Room 412, third floor. Here is your key."
  ],
  "text_to_speak": "Good evening. Welcome to the Grand Hotel. I have a reservation under the name Novak. Certainly, Mrs. Novak. Room 412, third floor. Here is your key.",
  "question": "What room is Mrs. Novak staying in?",
  "options": ["412", "421", "214", "312"],
  "correct_index": 0,
  "explanation": "Her room is 412 on the third floor."
}
```

## inline_choice

```json
{
  "sentence": "string with ___ blank",
  "options": ["string", "..."],
  "correct_index": 0,
  "explanation": "string",
  "tip": "string (optional, shown as a second hint line)"
}
```

The sentence contains exactly one `___`. The blank renders as an underlined slot that fills with the selected option; tapping an option replaces the previous selection.

Example:

```json
{
  "sentence": "I would like to ___ a room for two nights.",
  "options": ["book", "leave", "clean", "pay"],
  "correct_index": 0,
  "explanation": "You book a room before you arrive.",
  "tip": "book = rezervovat"
}
```

## context_fill

```json
{
  "dialogue": [{ "speaker": "string", "side": "left | right", "text": "string" }, "..."],
  "options": ["string", "..."],
  "correct_index": 0,
  "explanation": "string"
}
```

Exactly one dialogue line contains `___`. The dialogue renders as chat bubbles (speaker label above each bubble); after Check the blank fills with the correct word — leaf if the user was correct, coral if not. The correct answer also appears in the feedback banner.

Example:

```json
{
  "dialogue": [
    { "speaker": "Guest", "side": "left", "text": "Good evening. I have a reservation." },
    { "speaker": "Receptionist", "side": "right", "text": "Welcome! What is your name?" },
    { "speaker": "Guest", "side": "left", "text": "Novak. I would like to ___ in early." },
    { "speaker": "Receptionist", "side": "right", "text": "Of course, room 412 is ready now." }
  ],
  "options": ["check", "pay", "sleep", "leave"],
  "correct_index": 0,
  "explanation": "To check in means to arrive and register at the hotel."
}
```

## listening_word_order

```json
{
  "text_to_speak": "string",
  "correct_sequence": ["string", "..."],
  "explanation": "string"
}
```

Listening only — no text prompt. Audio auto-plays once (Play / Slow buttons). The bank is `correct_sequence` shuffled once on mount (if the shuffle matches the answer order, the first two items are swapped).

Example:

```json
{
  "text_to_speak": "I need a wake-up call at seven in the morning.",
  "correct_sequence": ["I", "need", "a", "wake-up", "call", "at", "seven", "in", "the", "morning."],
  "explanation": "You ask reception for a wake-up call."
}
```

## sentence_order

```json
{
  "correct_sequence": ["full sentence or line", "..."],
  "explanation": "string"
}
```

Entries are full sentences shown as full-width multiline cards (left-aligned), stacked in the bank and answer line. The bank is shuffled once on mount.

Example:

```json
{
  "correct_sequence": [
    "Good evening, welcome to the Grand Hotel.",
    "I have a reservation under the name Novak.",
    "Your room is 412 on the third floor."
  ],
  "explanation": "The receptionist greets you, then checks your reservation."
}
```

## flashcard_flip

```json
{
  "front": "string",
  "back": "string",
  "example": "string or null",
  "text_to_speak": "string"
}
```

Ungraded study card: front text large with a Flip button; after a 300 ms flip animation the back shows the meaning, an example sentence (in quotes) and a speaker button that speaks `text_to_speak`. The Continue button reads "Got it" and the exercise must be marked `is_required = false` so it never affects the score.

Example:

```json
{
  "front": "wake-up call",
  "back": "A phone call from the hotel to wake you up.",
  "example": "I need a wake-up call at 7 in the morning.",
  "text_to_speak": "wake-up call"
}
```

## error_spot

```json
{
  "words": ["string", "..."],
  "wrong_index": 2,
  "options": ["string", "..."],
  "correct_index": 0,
  "explanation": "string"
}
```

The sentence is `words` joined with spaces; the word at `wrong_index` is incorrect. Tapping a word selects it (sky), then "Fix it:" options appear. Tapping an option grades immediately (no Check button): correct only if the tapped word is `wrong_index` AND the option is `correct_index`. On wrong, the banner shows `Mistake: "…" → Fix: "…"`.

Example:

```json
{
  "words": ["The", "breakfast", "are", "served", "from", "7", "to", "10."],
  "wrong_index": 2,
  "options": ["is", "are", "be", "am"],
  "correct_index": 0,
  "explanation": "Breakfast is singular, so the verb is \"is\"."
}
```

## stress_tap

```json
{
  "syllables": ["string", "..."],
  "correct_index": 0,
  "text_to_speak": "string",
  "explanation": "string"
}
```

Audio auto-plays once (Play / Slow buttons). Syllables render as large chips; one tap grades immediately (no Check button).

Example:

```json
{
  "syllables": ["HO", "tel"],
  "correct_index": 0,
  "text_to_speak": "hotel",
  "explanation": "Hotel is stressed on the first syllable."
}
```

## silent_letter

```json
{
  "letters": ["string", "..."],
  "correct_index": 0,
  "explanation": "string"
}
```

Letter chips; one tap grades immediately (no Check button).

Example:

```json
{
  "letters": ["h", "o", "u", "r"],
  "correct_index": 0,
  "explanation": "The h in hour is silent."
}
```

## word_sort

```json
{
  "categories": ["string", "string"],
  "items": [{ "word": "string", "category": 0 }, "..."],
  "explanation": "string"
}
```

Two bin cards on top; a word pool below. Tap a pool word (selected), tap a bin to assign it; tap an assigned chip to return it to the pool. All items assigned enables Check. On wrong, misplaced chips show coral in their bin and the banner lists the correct bins. `is_correct` = every item in its correct bin.

Example:

```json
{
  "categories": ["Hotel room", "At the front desk"],
  "items": [
    { "word": "pillow", "category": 0 },
    { "word": "towel", "category": 0 },
    { "word": "blanket", "category": 0 },
    { "word": "bill", "category": 1 },
    { "word": "receipt", "category": 1 },
    { "word": "deposit", "category": 1 }
  ],
  "explanation": "Things in your room vs things at the front desk."
}
```

## flashcard

No renderer yet. Shape TBD.