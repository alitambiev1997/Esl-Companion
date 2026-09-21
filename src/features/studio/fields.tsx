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
  button: {
    borderRadius: radius.button,
    paddingVertical: 10,
    minHeight: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});