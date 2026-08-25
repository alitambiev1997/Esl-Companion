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

## flashcard

No renderer yet. Shape TBD.