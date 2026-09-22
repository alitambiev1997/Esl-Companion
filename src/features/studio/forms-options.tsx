import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ContentImage } from '@/src/components/ui/content-image';
import {
  objList,
  strField,
  strItems,
  type Content,
} from '@/src/features/studio/content-model';
import {
  LineListEditor,
  OptionListEditor,
  StringListField,
  TextField,
} from '@/src/features/studio/fields';
import { contentImageUrl } from '@/src/lib/storage';
import { colors, fonts } from '@/src/theme/tokens';

interface FormProps {
  content: Content;
  patch: (next: Content) => void;
}

export function MultipleChoiceForm({ content, patch }: FormProps) {
  return (
    <OptionListEditor
      label="Options"
      hint="Tap the circle to mark the correct one"
      items={strItems(content.options)}
      correctIndex={typeof content.correct_index === 'number' ? content.correct_index : 0}
      onItemsChange={(items) => patch({ options: items })}
      onCorrectChange={(index) => patch({ correct_index: index })}
    />
  );
}

export function InlineChoiceForm({ content, patch }: FormProps) {
  return (
    <>
      <TextField
        label="Sentence (with a gap)"
        hint="Put ___ exactly where the blank goes, e.g. The museum is ___ on Mondays."
        value={strField(content.sentence)}
        onChangeText={(text) => patch({ sentence: text })}
        placeholder="The museum is ___ on Mondays."
      />
      <OptionListEditor
        label="Options"
        hint="Tap the circle to mark the correct one"
        items={strItems(content.options)}
        correctIndex={typeof content.correct_index === 'number' ? content.correct_index : 0}
        onItemsChange={(items) => patch({ options: items })}
        onCorrectChange={(index) => patch({ correct_index: index })}
      />
      <TextField
        label="Tip (optional)"
        hint="A short hint shown under the sentence"
        value={strField(content.tip)}
        onChangeText={(text) => patch({ tip: text })}
        placeholder="Adjectives describe the subject."
      />
    </>
  );
}

export function ContextFillForm({ content, patch }: FormProps) {
  return (
    <>
      <LineListEditor
        label="Dialogue"
        hint="One line must contain ___ for the blank"
        lines={objList(content.dialogue).map((line) => ({
          speaker: strField(line.speaker),
          side: strField(line.side) === 'right' ? 'right' : 'left',
          text: strField(line.text),
        }))}
        onChange={(lines) => patch({ dialogue: lines })}
      />
      <OptionListEditor
        label="Options"
        hint="Replies the student can pick — tap the circle to mark the right one"
        items={strItems(content.options)}
        correctIndex={typeof content.correct_index === 'number' ? content.correct_index : 0}
        onItemsChange={(items) => patch({ options: items })}
        onCorrectChange={(index) => patch({ correct_index: index })}
      />
    </>
  );
}

export function ListeningMultipleChoiceForm({ content, patch }: FormProps) {
  return (
    <>
      <TextField
        label="Audio text"
        hint="Read aloud to the student"
        value={strField(content.text_to_speak)}
        onChangeText={(text) => patch({ text_to_speak: text })}
        placeholder="The train leaves at nine."
      />
      <OptionListEditor
        label="Options"
        hint="Tap the circle to mark the correct one"
        items={strItems(content.options)}
        correctIndex={typeof content.correct_index === 'number' ? content.correct_index : 0}
        onItemsChange={(items) => patch({ options: items })}
        onCorrectChange={(index) => patch({ correct_index: index })}
      />
    </>
  );
}

export function ReadingComprehensionForm({ content, patch }: FormProps) {
  const usingDialogue = Array.isArray(content.dialogue) && objList(content.dialogue).length > 0;
  return (
    <>
      <View style={styles.modeRow}>
        <Pressable
          style={[styles.modeButton, !usingDialogue && styles.modeButtonOn]}
          onPress={() => patch({ bubbles: strItems(content.bubbles).length ? content.bubbles : [''], dialogue: null })}
        >
          <Text style={[styles.modeText, !usingDialogue && styles.modeTextOn]}>Bubbles</Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, usingDialogue && styles.modeButtonOn]}
          onPress={() =>
            patch({
              dialogue: objList(content.dialogue).length
                ? content.dialogue
                : [{ speaker: '', side: 'left', text: '' }],
              bubbles: null,
            })
          }
        >
          <Text style={[styles.modeText, usingDialogue && styles.modeTextOn]}>Dialogue</Text>
        </Pressable>
      </View>
      {usingDialogue ? (
        <LineListEditor
          label="Dialogue"
          lines={objList(content.dialogue).map((line) => ({
            speaker: strField(line.speaker),
            side: strField(line.side) === 'right' ? 'right' : 'left',
            text: strField(line.text),
          }))}
          onChange={(lines) => patch({ dialogue: lines })}
        />
      ) : (
        <StringListField
          label="Text bubbles"
          hint="Short lines of text the student reads"
          items={strItems(content.bubbles)}
          onChange={(items) => patch({ bubbles: items })}
          placeholder="Ben sees a nice red scarf."
          addLabel="Add bubble"
        />
      )}
      <TextField
        label="Question"
        value={strField(content.question)}
        onChangeText={(text) => patch({ question: text })}
        placeholder="What does Ben buy?"
      />
      <OptionListEditor
        label="Options"
        hint="Tap the circle to mark the correct one"
        items={strItems(content.options)}
        correctIndex={typeof content.correct_index === 'number' ? content.correct_index : 0}
        onItemsChange={(items) => patch({ options: items })}
        onCorrectChange={(index) => patch({ correct_index: index })}
      />
      <TextField
        label="Audio text (optional)"
        hint="Read the passage aloud when the student taps the speaker"
        value={strField(content.text_to_speak)}
        onChangeText={(text) => patch({ text_to_speak: text })}
        placeholder="Ben wants to buy a birthday gift…"
      />
    </>
  );
}

export function ImageChoiceForm({ content, patch }: FormProps) {
  const imageUrl = strField(content.image_url);
  return (
    <>
      <TextField
        label="Image path"
        hint="Path inside the content bucket, e.g. Book1/Unit 2_To be/003.jpg"
        value={imageUrl}
        onChangeText={(text) => patch({ image_url: text })}
        placeholder="Book1/Unit 2_To be/003.jpg"
      />
      {imageUrl.trim() ? <ContentImage url={contentImageUrl(imageUrl.trim())} /> : null}
      <OptionListEditor
        label="Options"
        hint="Tap the circle to mark the correct one"
        items={strItems(content.options)}
        correctIndex={typeof content.correct_index === 'number' ? content.correct_index : 0}
        onItemsChange={(items) => patch({ options: items })}
        onCorrectChange={(index) => patch({ correct_index: index })}
      />
      <TextField
        label="Audio text (optional)"
        hint="Read aloud when the student taps the speaker"
        value={strField(content.text_to_speak)}
        onChangeText={(text) => patch({ text_to_speak: text })}
        placeholder="boy"
      />
    </>
  );
}

export function ErrorSpotForm({ content, patch }: FormProps) {
  return (
    <>
      <OptionListEditor
        label="Sentence parts"
        hint="Split the sentence into chunks — tap the circle on the chunk with the mistake"
        items={strItems(content.words)}
        correctIndex={typeof content.wrong_index === 'number' ? content.wrong_index : 0}
        onItemsChange={(items) => patch({ words: items })}
        onCorrectChange={(index) => patch({ wrong_index: index })}
        addLabel="Add part"
        placeholder="Part"
      />
      <OptionListEditor
        label="Fix options"
        hint="Tap the circle to mark the correct fix"
        items={strItems(content.options)}
        correctIndex={typeof content.correct_index === 'number' ? content.correct_index : 0}
        onItemsChange={(items) => patch({ options: items })}
        onCorrectChange={(index) => patch({ correct_index: index })}
        addLabel="Add fix"
        placeholder="Fix"
      />
    </>
  );
}

export function StressTapForm({ content, patch }: FormProps) {
  return (
    <>
      <TextField
        label="Word (audio text)"
        hint="Read aloud; the student taps the stressed syllable"
        value={strField(content.text_to_speak)}
        onChangeText={(text) => patch({ text_to_speak: text })}
        placeholder="computer"
      />
      <OptionListEditor
        label="Syllables"
        hint="Tap the circle on the stressed syllable"
        items={strItems(content.syllables)}
        correctIndex={typeof content.correct_index === 'number' ? content.correct_index : 0}
        onItemsChange={(items) => patch({ syllables: items })}
        onCorrectChange={(index) => patch({ correct_index: index })}
        addLabel="Add syllable"
        placeholder="Syllable"
      />
    </>
  );
}

export function SilentLetterForm({ content, patch }: FormProps) {
  return (
    <OptionListEditor
      label="Letters"
      hint="Tap the circle on the silent letter"
      items={strItems(content.letters)}
      correctIndex={typeof content.correct_index === 'number' ? content.correct_index : 0}
      onItemsChange={(items) => patch({ letters: items })}
      onCorrectChange={(index) => patch({ correct_index: index })}
      addLabel="Add letter"
      placeholder="Letter"
    />
  );
}

const styles = StyleSheet.create({
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  modeButtonOn: {
    borderColor: colors.sky,
    backgroundColor: colors.skyTint,
  },
  modeText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    opacity: 0.6,
  },
  modeTextOn: {
    color: colors.sky,
    opacity: 1,
  },
});