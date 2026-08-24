import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { z } from 'zod';
import { KeyboardFormWrapper } from '@/components/keyboard-form-wrapper';
import { supabase } from '@/src/lib/supabase';
import { colors, fonts, radius } from '@/src/theme/tokens';

const signupSchema = z
  .object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupInput = z.infer<typeof signupSchema>;

export default function Signup() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.fullName } },
    });
    if (error) {
      setFormError(error.message);
      return;
    }
    router.replace('/home');
  });

  return (
    <KeyboardFormWrapper>
      <Text style={styles.title}>Sign up</Text>

      <Text style={styles.label}>Full name</Text>
      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            autoComplete="name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.fullName && <Text style={styles.fieldError}>{errors.fullName.message}</Text>}

      <Text style={styles.label}>Email</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}

      <Text style={styles.label}>Password</Text>
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="At least 8 characters"
            secureTextEntry
            autoComplete="new-password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.password && <Text style={styles.fieldError}>{errors.password.message}</Text>}

      <Text style={styles.label}>Confirm password</Text>
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Repeat your password"
            secureTextEntry
            autoComplete="new-password"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.confirmPassword && (
        <Text style={styles.fieldError}>{errors.confirmPassword.message}</Text>
      )}

      {formError && <Text style={styles.formError}>{formError}</Text>}

      <Pressable
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>{isSubmitting ? 'Creating account...' : 'Sign up'}</Text>
      </Pressable>

      <Link href="/login" style={styles.link}>
        Already have an account? Log in
      </Link>
    </KeyboardFormWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
    marginBottom: 24,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.grey,
    borderRadius: 14,
    padding: 12,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.ink,
    marginBottom: 4,
  },
  fieldError: {
    fontFamily: fonts.body,
    color: colors.coral,
    fontSize: 12,
    marginBottom: 4,
  },
  formError: {
    fontFamily: fonts.body,
    color: colors.coral,
    fontSize: 14,
    marginTop: 8,
  },
  button: {
    backgroundColor: colors.sun,
    borderRadius: radius.button,
    paddingVertical: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  link: {
    marginTop: 16,
    fontFamily: fonts.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.sky,
    textAlign: 'center',
  },
});
