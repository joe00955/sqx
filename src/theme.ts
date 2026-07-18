export const colors = {
  background: '#14100D',
  backgroundGlow: '#241708',
  surface: '#1F1815',
  surfaceAlt: '#2A211C',
  surfaceRaised: '#342821',
  border: '#3A2C24',
  accent: '#FF5A1F',
  accentLight: '#FFA65C',
  accentMuted: '#3A2414',
  accentText: '#150C06',
  text: '#F8F3EE',
  textMuted: '#B7A89C',
  textFaint: '#8A7A6D',
  danger: '#FF5C4D',
  success: '#8BCB5C',
};

export const gradients = {
  accent: [colors.accentLight, colors.accent] as const,
  glow: [colors.backgroundGlow, colors.background] as const,
};

export const fonts = {
  display: 'Anton_400Regular',
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};

export const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.4,
  shadowRadius: 12,
  elevation: 6,
};
