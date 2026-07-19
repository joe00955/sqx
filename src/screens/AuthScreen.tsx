import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import PressScale from '../components/PressScale';
import { colors, fonts, radius, spacing } from '../theme';

type Mode = 'signIn' | 'signUp';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = email.trim().length > 3 && password.length >= 6 && !submitting;

  const switchMode = () => {
    setMode((prev) => (prev === 'signIn' ? 'signUp' : 'signIn'));
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setNotice(null);
    setSubmitting(true);
    const result = mode === 'signIn' ? await signIn(email.trim(), password) : await signUp(email.trim(), password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (mode === 'signUp') {
      setNotice('Account created — check your email to confirm, then sign in below.');
      setMode('signIn');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Logo size="lg" />
      </View>

      <Text style={styles.headline}>{mode === 'signIn' ? 'WELCOME BACK' : 'CREATE YOUR ACCOUNT'}</Text>
      <Text style={styles.subtitle}>
        {mode === 'signIn'
          ? 'Sign in to find your next game.'
          : 'One quick account, then we set up your player profile.'}
      </Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={colors.textFaint}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password (min. 6 characters)"
        placeholderTextColor={colors.textFaint}
        secureTextEntry
        style={styles.input}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!notice && <Text style={styles.notice}>{notice}</Text>}

      <PressScale
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        {submitting ? (
          <ActivityIndicator color={colors.accentText} />
        ) : (
          <Text style={styles.submitText}>{mode === 'signIn' ? 'Sign in' : 'Create account'}</Text>
        )}
      </PressScale>

      <Pressable onPress={switchMode} hitSlop={8} style={styles.switchRow}>
        <Text style={styles.switchText}>
          {mode === 'signIn' ? "Don't have an account? " : 'Already have an account? '}
          <Text style={styles.switchTextAccent}>{mode === 'signIn' ? 'Create one' : 'Sign in'}</Text>
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headline: {
    color: colors.text,
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: 0.4,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  notice: {
    color: colors.success,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitText: {
    color: colors.accentText,
    fontFamily: fonts.bold,
    fontSize: 14.5,
  },
  switchRow: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: 8,
  },
  switchText: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  switchTextAccent: {
    color: colors.accent,
    fontFamily: fonts.bold,
  },
});
