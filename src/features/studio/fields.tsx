import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radius } from '@/src/theme/tokens';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      {children}
    </View>
  );
}

export function TextField({
  label,
  hint,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  hint?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <Field label={label} hint={hint}>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.greyDark}
        multiline={multiline}
      />
    </Field>
  );
}

export function StringListField({
  label,
  hint,
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel: string;
}) {
  return (
    <Field label={label} hint={hint}>
      {items.map((item, i) => (
        <View key={i} style={styles.row}>
          <TextInput
            style={[styles.input, styles.rowInput]}
            value={item}
            onChangeText={(text) => {
              const next = [...items];
              next[i] = text;
              onChange(next);
            }}
            placeholder={placeholder}
            placeholderTextColor={colors.greyDark}
          />
          <Pressable
            style={styles.removeButton}
            onPress={() => onChange(items.filter((_, index) => index !== i))}
            hitSlop={6}
          >
            <Text style={styles.removeText}>×</Text>
          </Pressable>
        </View>
      ))}
      <Pressable style={styles.addButton} onPress={() => onChange([...items, ''])}>
        <Text style={styles.addText}>+ {addLabel}</Text>
      </Pressable>
    </Field>
  );
}

export function OptionListEditor({
  label,
  hint,
  items,
  correctIndex,
  onItemsChange,
  onCorrectChange,
  addLabel = 'Add option',
  placeholder = 'Option',
}: {
  label: string;
  hint?: string;
  items: string[];
  correctIndex: number;
  onItemsChange: (items: string[]) => void;
  onCorrectChange: (index: number) => void;
  addLabel?: string;
  placeholder?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      {items.map((item, i) => (
        <View key={i} style={styles.row}>
          <Pressable
            style={[styles.radio, correctIndex === i && styles.radioOn]}
            onPress={() => onCorrectChange(i)}
          />
          <TextInput
            style={[styles.input, styles.rowInput]}
            value={item}
            onChangeText={(text) => {
              const next = [...items];
              next[i] = text;
              onItemsChange(next);
            }}
            placeholder={`${placeholder} ${i + 1}`}
            placeholderTextColor={colors.greyDark}
          />
          <Pressable
            style={styles.removeButton}
            onPress={() => {
              const next = items.filter((_, index) => index !== i);
              onItemsChange(next);
              if (correctIndex >= next.length) onCorrectChange(Math.max(0, next.length - 1));
            }}
            hitSlop={6}
          >
            <Text style={styles.removeText}>×</Text>
          </Pressable>
        </View>
      ))}
      <Pressable style={styles.addButton} onPress={() => onItemsChange([...items, ''])}>
        <Text style={styles.addText}>+ {addLabel}</Text>
      </Pressable>
    </Field>
  );
}

export interface StudioPair {
  left: string;
  right: string;
}

export function PairListEditor({
  label,
  hint,
  pairs,
  onChange,
}: {
  label: string;
  hint?: string;
  pairs: StudioPair[];
  onChange: (pairs: StudioPair[]) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      {pairs.map((pair, i) => (
        <View key={i} style={styles.row}>
          <TextInput
            style={[styles.input, styles.rowInput]}
            value={pair.left}
            onChangeText={(text) => {
              const next = [...pairs];
              next[i] = { ...pair, left: text };
              onChange(next);
            }}
            placeholder="Word"
            placeholderTextColor={colors.greyDark}
          />
          <Text style={styles.arrowText}>-</Text>
          <TextInput
            style={[styles.input, styles.rowInput]}
            value={pair.right}
            onChangeText={(text) => {
              const next = [...pairs];
              next[i] = { ...pair, right: text };
              onChange(next);
            }}
            placeholder="Meaning"
            placeholderTextColor={colors.greyDark}
          />
          <Pressable
            style={styles.removeButton}
            onPress={() => onChange(pairs.filter((_, index) => index !== i))}
            hitSlop={6}
          >
            <Text style={styles.removeText}>×</Text>
          </Pressable>
        </View>
      ))}
      <Pressable style={styles.addButton} onPress={() => onChange([...pairs, { left: '', right: '' }])}>
        <Text style={styles.addText}>+ Add pair</Text>
      </Pressable>
    </Field>
  );
}

export interface StudioLine {
  speaker: string;
  side: 'left' | 'right';
  text: string;
}

export function LineListEditor({
  label,
  hint,
  lines,
  onChange,
  addLabel = 'Add line',
}: {
  label: string;
  hint?: string;
  lines: StudioLine[];
  onChange: (lines: StudioLine[]) => void;
  addLabel?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      {lines.map((line, i) => (
        <View key={i} style={styles.row}>
          <TextInput
            style={[styles.input, styles.speakerInput]}
            value={line.speaker}
            onChangeText={(text) => {
              const next = [...lines];
              next[i] = { ...line, speaker: text };
              onChange(next);
            }}
            placeholder="Speaker"
            placeholderTextColor={colors.greyDark}
          />
          <TextInput
            style={[styles.input, styles.rowInput]}
            value={line.text}
            onChangeText={(text) => {
              const next = [...lines];
              next[i] = { ...line, text };
              onChange(next);
            }}
            placeholder="Line (use ___ for the blank)"
            placeholderTextColor={colors.greyDark}
          />
          <Pressable
            style={[styles.sideButton, line.side === 'right' && styles.sideButtonRight]}
            onPress={() => {
              const next = [...lines];
              next[i] = { ...line, side: line.side === 'left' ? 'right' : 'left' };
              onChange(next);
            }}
          >
            <Text style={styles.sideButtonText}>{line.side === 'left' ? 'L' : 'R'}</Text>
          </Pressable>
          <Pressable
            style={styles.removeButton}
            onPress={() => onChange(lines.filter((_, index) => index !== i))}
            hitSlop={6}
          >
            <Text style={styles.removeText}>×</Text>
          </Pressable>
        </View>
      ))}
      <Pressable
        style={styles.addButton}
        onPress={() => onChange([...lines, { speaker: '', side: lines.length % 2 === 0 ? 'left' : 'right', text: '' }])}
      >
        <Text style={styles.addText}>+ {addLabel}</Text>
      </Pressable>
    </Field>
  );
}

export const fieldStyles = StyleSheet.create({
  error: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.coral,
  },
});

export const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.ink,
    opacity: 0.55,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: 10,
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.ink,
  },
  inputMultiline: {
    minHeight: 64,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowInput: {
    flex: 1,
  },
  removeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.coral,
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
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.greyDark,
    backgroundColor: colors.white,
  },
  radioOn: {
    borderColor: colors.leaf,
    backgroundColor: colors.leaf,
  },
  speakerInput: {
    width: 96,
  },
  arrowText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.greyDark,
  },
  sideButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideButtonRight: {
    backgroundColor: colors.skyTint,
  },
  sideButtonText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '600',
    color: colors.sky,
  },
  button: {
    borderRadius: radius.button,
    paddingVertical: 10,
    minHeight: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});