import type { Exercise, ExerciseType } from '@/src/types/content';

export const exerciseMeta: Record<ExerciseType, string> = {
  multiple_choice: 'Pick the correct option.',
  fill_blank: 'Type the missing word or phrase.',
  word_order: 'Arrange the chips into the correct sentence.',
  matching: 'Pair items on the left with items on the right.',
  listening_multiple_choice: 'Listen, then pick the correct option.',
  listening_dictation: 'Listen and type what you hear.',
  reading_comprehension: 'Read a text and answer questions.',
  speaking_recording: 'Say the sentence and compare with the model.',
  flashcard: 'Flip a card to check the meaning.',
  inline_choice: 'Pick the word that fits in the sentence.',
  context_fill: 'Complete the dialogue with the right word.',
  listening_word_order: 'Listen, then order the words you hear.',
  sentence_order: 'Put the sentences in the correct order.',
  flashcard_flip: 'Study a card - flip it to check the meaning.',
};

export const contentShapes: Record<ExerciseType, string> = {
  multiple_choice: `{
  options: string[],
  correct_index: number,
  explanation: string
}`,
  fill_blank: `{
  correct_answers: string[],
  explanation: string
}`,
  word_order: `{
  words: string[],
  correct_sequence: string[],
  explanation: string
}`,
  matching: `{
  pairs: { left: string, right: string }[],
  explanation: string
}`,
  listening_multiple_choice: `{
  text_to_speak: string,
  options: string[],
  correct_index: number,
  explanation: string
}`,
  listening_dictation: `{
  text_to_speak: string,
  accepted: string[],
  explanation: string
}`,
  speaking_recording: `{
  text_to_speak: string
}`,
  reading_comprehension: `{
  bubbles: string[],
  text_to_speak: string,
  question: string,
  options: string[],
  correct_index: number,
  explanation: string
}`,
  inline_choice: `{
  sentence: string,
  options: string[],
  correct_index: number,
  explanation: string,
  tip?: string
}`,
  context_fill: `{
  dialogue: { speaker: string, side: 'left' | 'right', text: string }[],
  options: string[],
  correct_index: number,
  explanation: string
}`,
  listening_word_order: `{
  text_to_speak: string,
  correct_sequence: string[],
  explanation: string
}`,
  sentence_order: `{
  correct_sequence: string[],
  explanation: string
}`,
  flashcard_flip: `{
  front: string,
  back: string,
  example: string | null,
  text_to_speak: string
}`,
  flashcard: 'no renderer yet',
};

interface SampleSpec {
  prompt: string;
  content: Record<string, unknown>;
}

export const samplesByType: Record<ExerciseType, SampleSpec[]> = {
  multiple_choice: [
    {
      prompt: 'What does "check-in" mean?',
      content: {
        options: ['Registering at the hotel', 'Leaving the hotel', 'Paying the bill', 'Cleaning the room'],
        correct_index: 0,
        explanation: 'Check-in is the process of registering when you arrive at the hotel.',
      },
    },
    {
      prompt: 'Which of these is usually a hotel amenity?',
      content: {
        options: ['Swimming pool', 'Passport', 'Luggage tag', 'Boarding pass'],
        correct_index: 0,
        explanation: 'Amenities are extra services like a swimming pool, gym, or free Wi-Fi.',
      },
    },
  ],
  fill_blank: [
    {
      prompt: 'Complete: I would like to ___ a room for two nights.',
      content: {
        correct_answers: ['book', 'reserve'],
        explanation: 'You book or reserve a room before you arrive.',
      },
    },
    {
      prompt: 'Complete: The hotel offers free ___ in all rooms.',
      content: {
        correct_answers: ['wi-fi', 'wifi', 'Wi-Fi'],
        explanation: 'Most hotels provide free Wi-Fi for guests.',
      },
    },
  ],
  word_order: [
    {
      prompt: 'Order the words to ask for a wake-up call.',
      content: {
        words: ['I', 'need', 'a', 'wake-up', 'call.'],
        correct_sequence: ['I', 'need', 'a', 'wake-up', 'call.'],
        explanation: 'You ask reception for a wake-up call.',
      },
    },
    {
      prompt: 'Order the words to ask where the gym is.',
      content: {
        words: ['Where', 'is', 'the', 'gym', '?'],
        correct_sequence: ['Where', 'is', 'the', 'gym', '?'],
        explanation: 'Ask the receptionist if you cannot find the gym.',
      },
    },
  ],
  matching: [
    {
      prompt: 'Match the hotel words with their meanings.',
      content: {
        pairs: [
          { left: 'reception', right: 'the front desk' },
          { left: 'lobby', right: 'the big hall at the entrance' },
          { left: 'mini bar', right: 'drinks in your room' },
          { left: 'doorman', right: 'helps you with your bags' },
        ],
        explanation: 'These are common hotel words you will see and hear.',
      },
    },
    {
      prompt: 'Match the words with what they mean at check-out.',
      content: {
        pairs: [
          { left: 'bill', right: 'what you must pay' },
          { left: 'receipt', right: 'proof of payment' },
          { left: 'deposit', right: 'money paid in advance' },
          { left: 'check-out', right: 'leaving the hotel' },
        ],
        explanation: 'At check-out you pay the bill and get a receipt.',
      },
    },
  ],
  listening_multiple_choice: [
    {
      prompt: 'Listen and choose the correct breakfast time.',
      content: {
        text_to_speak: 'Breakfast is served from seven to ten.',
        options: ['7 to 10', '6 to 9', '8 to 11', '9 to 12'],
        correct_index: 0,
        explanation: 'Breakfast is served from 7 to 10.',
      },
    },
    {
      prompt: 'Listen and choose the correct room number and floor.',
      content: {
        text_to_speak: 'Your room number is four-oh-two on the third floor.',
        options: ['402, third floor', '302, second floor', '502, fifth floor', '204, second floor'],
        correct_index: 0,
        explanation: 'Your room is 402 on the third floor.',
      },
    },
  ],
  listening_dictation: [
    {
      prompt: 'Listen and type the sentence.',
      content: {
        text_to_speak: 'I need an extra pillow.',
        accepted: ['I need an extra pillow'],
        explanation: 'You can ask reception for an extra pillow.',
      },
    },
    {
      prompt: 'Listen and type the sentence.',
      content: {
        text_to_speak: 'The elevator is out of order.',
        accepted: ['The elevator is out of order'],
        explanation: 'Out of order means it is not working.',
      },
    },
  ],
  speaking_recording: [
    {
      prompt: 'Say this to the receptionist.',
      content: {
        text_to_speak: 'Good evening, I have a reservation under the name Smith.',
      },
    },
    {
      prompt: 'Say this to ask for a taxi.',
      content: {
        text_to_speak: 'Could you call me a taxi to the airport, please?',
      },
    },
  ],
  reading_comprehension: [
    {
      prompt: 'Read the conversation and answer the question.',
      content: {
        bubbles: [
          'Good evening. Welcome to the Grand Hotel.',
          'I have a reservation under the name Novak.',
          'Certainly, Mrs. Novak. Room 412, third floor. Here is your key.',
        ],
        text_to_speak:
          'Good evening. Welcome to the Grand Hotel. I have a reservation under the name Novak. Certainly, Mrs. Novak. Room 412, third floor. Here is your key.',
        question: 'What room is Mrs. Novak staying in?',
        options: ['412', '421', '214', '312'],
        correct_index: 0,
        explanation: 'Her room is 412 on the third floor.',
      },
    },
    {
      prompt: 'Read the hotel information and answer the question.',
      content: {
        bubbles: [
          'Breakfast is served from 7 to 10 in the lobby.',
          'The pool is open from 8 am to 9 pm.',
          'Wi-Fi is free, and the password is on your card.',
        ],
        text_to_speak:
          'Breakfast is served from 7 to 10 in the lobby. The pool is open from 8 am to 9 pm. Wi-Fi is free, and the password is on your card.',
        question: 'When is breakfast served?',
        options: ['7 to 10', '8 to 9', '7 to 9', '8 to 10'],
        correct_index: 0,
        explanation: 'Breakfast is from 7 to 10 in the lobby.',
      },
    },
  ],
  inline_choice: [
    {
      prompt: 'Choose the word that fits.',
      content: {
        sentence: 'I would like to ___ a room for two nights.',
        options: ['book', 'leave', 'clean', 'pay'],
        correct_index: 0,
        explanation: 'You book a room before you arrive.',
        tip: 'book = rezervovat',
      },
    },
    {
      prompt: 'Choose the word that fits.',
      content: {
        sentence: 'The hotel ___ is open until 10 pm.',
        options: ['gym', 'train', 'kitchen', 'market'],
        correct_index: 0,
        explanation: 'Many hotels have a gym for guests.',
        tip: 'gym = posilovna',
      },
    },
  ],
  context_fill: [
    {
      prompt: 'Complete the dialogue.',
      content: {
        dialogue: [
          { speaker: 'Guest', side: 'left', text: 'Good evening. I have a reservation.' },
          { speaker: 'Receptionist', side: 'right', text: 'Welcome! What is your name?' },
          { speaker: 'Guest', side: 'left', text: 'Novak. I would like to ___ in early.' },
          { speaker: 'Receptionist', side: 'right', text: 'Of course, room 412 is ready now.' },
        ],
        options: ['check', 'pay', 'sleep', 'leave'],
        correct_index: 0,
        explanation: 'To check in means to arrive and register at the hotel.',
      },
    },
    {
      prompt: 'Complete the dialogue.',
      content: {
        dialogue: [
          { speaker: 'Guest', side: 'left', text: 'The shower is broken.' },
          { speaker: 'Receptionist', side: 'right', text: 'I am sorry. We can change your ___ right now.' },
          { speaker: 'Guest', side: 'left', text: 'Thank you, that helps a lot.' },
        ],
        options: ['room', 'towel', 'key', 'bill'],
        correct_index: 0,
        explanation: 'The hotel can give you a different room.',
      },
    },
  ],
  listening_word_order: [
    {
      prompt: 'Listen and order the words.',
      content: {
        text_to_speak: 'I need a wake-up call at seven in the morning.',
        correct_sequence: ['I', 'need', 'a', 'wake-up', 'call', 'at', 'seven', 'in', 'the', 'morning.'],
        explanation: 'You ask reception for a wake-up call.',
      },
    },
    {
      prompt: 'Listen and order the words.',
      content: {
        text_to_speak: 'Could you call me a taxi to the airport?',
        correct_sequence: ['Could', 'you', 'call', 'me', 'a', 'taxi', 'to', 'the', 'airport', '?'],
        explanation: 'A polite way to ask the receptionist for a taxi.',
      },
    },
  ],
  sentence_order: [
    {
      prompt: 'Put the sentences in the correct order.',
      content: {
        correct_sequence: [
          'Good evening, welcome to the Grand Hotel.',
          'I have a reservation under the name Novak.',
          'Your room is 412 on the third floor.',
        ],
        explanation: 'The receptionist greets you, then checks your reservation.',
      },
    },
    {
      prompt: 'Put the sentences in the correct order.',
      content: {
        correct_sequence: [
          'Breakfast is served from 7 to 10.',
          'The pool is open until 9 pm.',
          'Wi-Fi is free in all rooms.',
        ],
        explanation: 'Hotel information in the order the receptionist gives it.',
      },
    },
  ],
  flashcard_flip: [
    {
      prompt: 'Study the card.',
      content: {
        front: 'wake-up call',
        back: 'A phone call from the hotel to wake you up.',
        example: 'I need a wake-up call at 7 in the morning.',
        text_to_speak: 'wake-up call',
      },
    },
    {
      prompt: 'Study the card.',
      content: {
        front: 'check-in',
        back: 'The process of registering when you arrive at the hotel.',
        example: 'Check-in is at 2 pm.',
        text_to_speak: 'check-in',
      },
    },
  ],
  flashcard: [],
};

export function buildSample(type: ExerciseType, spec: SampleSpec, index: number): Exercise {
  return {
    id: `sample-${type}-${index}`,
    lesson_id: 'sandbox',
    type,
    prompt: spec.prompt,
    content: spec.content,
    is_required: true,
    sort_order: index,
    created_at: '',
  };
}