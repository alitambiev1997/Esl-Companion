import { strField, type Content } from '@/src/features/studio/content-model';
import { TextField } from '@/src/features/studio/fields';

interface FormProps {
  content: Content;
  patch: (next: Content) => void;
}

export function SpeakingForm({ content, patch }: FormProps) {
  return (
    <TextField
      label="Sentence to speak"
      hint="The app plays this as the model; the student repeats it out loud"
      value={strField(content.text_to_speak)}
      onChangeText={(text) => patch({ text_to_speak: text })}
      placeholder="Could you open the window, please?"
    />
  );
}

export function FlashcardForm({ content, patch }: FormProps) {
  return (
    <>
      <TextField
        label="Front"
        hint="Shown before flipping"
        value={strField(content.front)}
        onChangeText={(text) => patch({ front: text })}
        placeholder="to book a ticket"
      />
      <TextField
        label="Back"
        hint="Revealed after flipping"
        value={strField(content.back)}
        onChangeText={(text) => patch({ back: text })}
        placeholder="rezervovat letenku"
      />
      <TextField
        label="Example (optional)"
        value={strField(content.example)}
        onChangeText={(text) => patch({ example: text })}
        placeholder="I booked a ticket online."
      />
      <TextField
        label="Audio text"
        hint="Read aloud when the student taps the speaker"
        value={strField(content.text_to_speak)}
        onChangeText={(text) => patch({ text_to_speak: text })}
        placeholder="I booked a ticket online."
      />
    </>
  );
}
