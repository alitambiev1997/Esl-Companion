import { strField, strItems, type Content } from '@/src/features/studio/content-model';
import { StringListField, TextField } from '@/src/features/studio/fields';

interface FormProps {
  content: Content;
  patch: (next: Content) => void;
}

export function FillBlankForm({ content, patch }: FormProps) {
  return (
    <StringListField
      label="Accepted answers"
      hint="Every spelling you accept (compared ignoring case and punctuation)"
      items={strItems(content.correct_answers)}
      onChange={(items) => patch({ correct_answers: items })}
      placeholder="reservation"
      addLabel="Add answer"
    />
  );
}

export function WordOrderForm({ content, patch }: FormProps) {
  return (
    <StringListField
      label="Words in the correct order"
      hint="The app shuffles them into a chip bank for the student"
      items={strItems(content.correct_sequence)}
      onChange={(items) => patch({ correct_sequence: items })}
      placeholder="word"
      addLabel="Add word"
    />
  );
}

export function SentenceOrderForm({ content, patch }: FormProps) {
  return (
    <StringListField
      label="Sentence parts in the correct order"
      hint="Whole chunks, e.g. Every morning, / I drink / a cup of coffee."
      items={strItems(content.correct_sequence)}
      onChange={(items) => patch({ correct_sequence: items })}
      placeholder="Every morning,"
      addLabel="Add part"
    />
  );
}

export function ListeningWordOrderForm({ content, patch }: FormProps) {
  return (
    <>
      <TextField
        label="Audio text"
        hint="Read aloud to the student"
        value={strField(content.text_to_speak)}
        onChangeText={(text) => patch({ text_to_speak: text })}
        placeholder="The children are playing in the garden."
      />
      <StringListField
        label="Words in the correct order"
        hint="The app shuffles them into a chip bank for the student"
        items={strItems(content.correct_sequence)}
        onChange={(items) => patch({ correct_sequence: items })}
        placeholder="word"
        addLabel="Add word"
      />
    </>
  );
}

export function ListeningDictationForm({ content, patch }: FormProps) {
  return (
    <>
      <TextField
        label="Audio text"
        hint="What the student hears and types"
        value={strField(content.text_to_speak)}
        onChangeText={(text) => patch({ text_to_speak: text })}
        placeholder="She works in a hospital."
      />
      <StringListField
        label="Accepted answers"
        hint="Every spelling you accept (compared ignoring case and punctuation)"
        items={strItems(content.accepted)}
        onChange={(items) => patch({ accepted: items })}
        placeholder="She works in a hospital."
        addLabel="Add answer"
      />
    </>
  );
}
