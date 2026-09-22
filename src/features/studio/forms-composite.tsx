import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  objList,
  strField,
  strItems,
  type Content,
} from '@/src/features/studio/content-model';
import {
  Field,
  LineListEditor,
  OptionListEditor,
  PairListEditor,
  StringListField,
  TextField,
  styles as fieldBase,
  type StudioPair,
} from '@/src/features/studio/fields';
import { ImagePathField } from '@/src/features/studio/image-field';
import { colors, fonts, radius } from '@/src/theme/tokens';

interface FormProps {
  content: Content;
  patch: (next: Content) => void;
}

function Block({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.block}>
      <View style={styles.blockHeader}>
        <Text style={styles.blockTitle}>{title}</Text>
        <Pressable onPress={onRemove} hitSlop={6}>
          <Text style={styles.blockRemove}>×</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

export function MatchingForm({ content, patch }: FormProps) {
  const pairs: StudioPair[] = objList(content.pairs).map((pair) => ({
    left: strField(pair.left),
    right: strField(pair.right),
  }));
  return (
    <PairListEditor
      label="Pairs"
      hint="The student connects each word with its match"
      pairs={pairs}
      onChange={(next) => patch({ pairs: next })}
    />
  );
}

export function WordSortForm({ content, patch }: FormProps) {
  const categories = strItems(content.categories);
  const items = objList(content.items);
  return (
    <>
      <View style={styles.twoCols}>
        <View style={styles.col}>
          <TextField
            label="Category 1"
            value={categories[0] ?? ''}
            onChangeText={(text) =>
              patch({ categories: [text, categories[1] ?? ''] })
            }
            placeholder="Countable"
          />
        </View>
        <View style={styles.col}>
          <TextField
            label="Category 2"
            value={categories[1] ?? ''}
            onChangeText={(text) =>
              patch({ categories: [categories[0] ?? '', text] })
            }
            placeholder="Uncountable"
          />
        </View>
      </View>
      <Field label="Words" hint="Type each word and tap a side to choose its category">
        {items.map((item, i) => {
          const category = item.category === 1 ? 1 : 0;
          return (
            <View key={i} style={styles.sortRow}>
              <TextInput
                style={[fieldBase.input, styles.sortInput]}
                value={strField(item.word)}
                onChangeText={(text) =>
                  patch({
                    items: items.map((entry, index) =>
                      index === i ? { ...entry, word: text } : entry
                    ),
                  })
                }
                placeholder="apple"
                placeholderTextColor={colors.greyDark}
              />
              <Pressable
                style={[styles.sortSide, category === 0 && styles.sortSideOn]}
                onPress={() =>
                  patch({
                    items: items.map((entry, index) =>
                      index === i ? { ...entry, category: 0 } : entry
                    ),
                  })
                }
              >
                <Text style={[styles.sortSideText, category === 0 && styles.sortSideTextOn]}>
                  {categories[0]?.trim() || 'Category 1'}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.sortSide, category === 1 && styles.sortSideOn]}
                onPress={() =>
                  patch({
                    items: items.map((entry, index) =>
                      index === i ? { ...entry, category: 1 } : entry
                    ),
                  })
                }
              >
                <Text style={[styles.sortSideText, category === 1 && styles.sortSideTextOn]}>
                  {categories[1]?.trim() || 'Category 2'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => patch({ items: items.filter((_, index) => index !== i) })}
                hitSlop={6}
              >
                <Text style={styles.blockRemove}>×</Text>
              </Pressable>
            </View>
          );
        })}
        <Pressable
          style={styles.addButton}
          onPress={() => patch({ items: [...items, { word: '', category: 0 }] })}
        >
          <Text style={styles.addText}>+ Add word</Text>
        </Pressable>
      </Field>
    </>
  );
}

export function FormFillForm({ content, patch }: FormProps) {
  const fields = objList(content.fields);
  return (
    <>
      <TextField
        label="Form title (optional)"
        value={strField(content.title)}
        onChangeText={(text) => patch({ title: text })}
        placeholder="Hotel booking"
      />
      {fields.map((field, i) => (
        <Block
          key={i}
          title={`Field ${i + 1}`}
          onRemove={() => patch({ fields: fields.filter((_, index) => index !== i) })}
        >
          <TextField
            label="Label (with a gap)"
            hint="Put ___ where the student fills in"
            value={strField(field.prompt)}
            onChangeText={(text) =>
              patch({
                fields: fields.map((entry, index) =>
                  index === i ? { ...entry, prompt: text } : entry
                ),
              })
            }
            placeholder="Name: ___"
          />
          <OptionListEditor
            label="Options"
            hint="Tap the circle to mark the correct one"
            items={strItems(field.options)}
            correctIndex={typeof field.correct_index === 'number' ? field.correct_index : 0}
            onItemsChange={(items) =>
              patch({
                fields: fields.map((entry, index) =>
                  index === i ? { ...entry, options: items } : entry
                ),
              })
            }
            onCorrectChange={(index) =>
              patch({
                fields: fields.map((entry, fieldIndex) =>
                  fieldIndex === i ? { ...entry, correct_index: index } : entry
                ),
              })
            }
          />
        </Block>
      ))}
      <Pressable
        style={styles.addButton}
        onPress={() =>
          patch({ fields: [...fields, { prompt: '', options: ['', ''], correct_index: 0 }] })
        }
      >
        <Text style={styles.addText}>+ Add field</Text>
      </Pressable>
      <TextField
        label="Audio text (optional)"
        value={strField(content.text_to_speak)}
        onChangeText={(text) => patch({ text_to_speak: text })}
        placeholder=""
      />
    </>
  );
}

export function DocumentReaderForm({ content, patch }: FormProps) {
  const questions = objList(content.questions);
  return (
    <>
      <ImagePathField
        label="Document image (optional)"
        hint="Upload a picture of the document, or paste its path"
        value={strField(content.image_url)}
        onChange={(path) => patch({ image_url: path })}
      />
      <StringListField
        label="Document lines (optional)"
        hint="Text version of the document — use this if there is no picture"
        items={strItems(content.document_lines)}
        onChange={(items) => patch({ document_lines: items })}
        placeholder="Summer Sale!"
        addLabel="Add line"
      />
      {questions.map((question, i) => (
        <Block
          key={i}
          title={`Question ${i + 1}`}
          onRemove={() =>
            patch({ questions: questions.filter((_, index) => index !== i) })
          }
        >
          <TextField
            label="Question"
            value={strField(question.question)}
            onChangeText={(text) =>
              patch({
                questions: questions.map((entry, index) =>
                  index === i ? { ...entry, question: text } : entry
                ),
              })
            }
            placeholder="When is the sale?"
          />
          <OptionListEditor
            label="Options"
            hint="Tap the circle to mark the correct one"
            items={strItems(question.options)}
            correctIndex={
              typeof question.correct_index === 'number' ? question.correct_index : 0
            }
            onItemsChange={(items) =>
              patch({
                questions: questions.map((entry, index) =>
                  index === i ? { ...entry, options: items } : entry
                ),
              })
            }
            onCorrectChange={(index) =>
              patch({
                questions: questions.map((entry, questionIndex) =>
                  questionIndex === i ? { ...entry, correct_index: index } : entry
                ),
              })
            }
          />
        </Block>
      ))}
      <Pressable
        style={styles.addButton}
        onPress={() =>
          patch({
            questions: [
              ...questions,
              { question: '', options: ['', ''], correct_index: 0, explanation: null },
            ],
          })
        }
      >
        <Text style={styles.addText}>+ Add question</Text>
      </Pressable>
    </>
  );
}

export function BestReplyForm({ content, patch }: FormProps) {
  const steps = objList(content.steps);
  return (
    <>
      {steps.map((step, i) => (
        <Block
          key={i}
          title={`Step ${i + 1}`}
          onRemove={() => patch({ steps: steps.filter((_, index) => index !== i) })}
        >
          <LineListEditor
            label="Conversation so far (optional)"
            hint="Lines shown before this choice"
            lines={objList(step.lines).map((line) => ({
              speaker: strField(line.speaker),
              side: strField(line.side) === 'right' ? 'right' : 'left',
              text: strField(line.text),
            }))}
            onChange={(lines) =>
              patch({
                steps: steps.map((entry, index) =>
                  index === i ? { ...entry, lines } : entry
                ),
              })
            }
            addLabel="Add line"
          />
          <OptionListEditor
            label="Options"
            hint="Tap the circle to mark the best reply — the chosen reply becomes the student's line"
            items={strItems(step.options)}
            correctIndex={typeof step.correct_index === 'number' ? step.correct_index : 0}
            onItemsChange={(items) =>
              patch({
                steps: steps.map((entry, index) =>
                  index === i ? { ...entry, options: items } : entry
                ),
              })
            }
            onCorrectChange={(index) =>
              patch({
                steps: steps.map((entry, stepIndex) =>
                  stepIndex === i ? { ...entry, correct_index: index } : entry
                ),
              })
            }
          />
        </Block>
      ))}
      <Pressable
        style={styles.addButton}
        onPress={() =>
          patch({
            steps: [
              ...steps,
              { lines: [], options: ['', ''], correct_index: 0, explanation: null, reply: '' },
            ],
          })
        }
      >
        <Text style={styles.addText}>+ Add step</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  block: {
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: radius.card,
    padding: 12,
    gap: 12,
    backgroundColor: colors.paper,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blockTitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
    opacity: 0.8,
  },
  blockRemove: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.coral,
  },
  twoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortInput: {
    flex: 1,
  },
  sortSide: {
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.white,
  },
  sortSideOn: {
    borderColor: colors.leaf,
    backgroundColor: colors.leafTint,
  },
  sortSideText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.ink,
    opacity: 0.6,
  },
  sortSideTextOn: {
    color: colors.ink,
    opacity: 1,
    fontWeight: '600',
  },
  addButton: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  addText: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.sky,
  },
});