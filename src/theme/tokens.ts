export const colors = {
  sky: '#1CA9E0',
  sun: '#FFC93C',
  coral: '#F2653C',
  leaf: '#7DC242',
  ink: '#16324F',
  paper: '#FFFDF7',
  grey: '#E8E8E8',
  greyDark: '#C8CDD2',
  pathGrey: '#B9C1CA',
  white: '#FFFFFF',
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#1CA9E0',
  skyTint: '#EAF6FC',
  leafTint: '#F0F9E8',
  coralTint: '#FDEFEA',
  sunTint: '#FFF3C4',
} as const;

export const radius = {
  card: 20,
  button: 999,
  bubble: 18,
} as const;

export const fonts = {
  display: 'Baloo2_700Bold',
  body: 'Nunito_400Regular',
} as const;

export const typography = {
  h1: { fontFamily: fonts.display, fontSize: 28 },
  h2: { fontFamily: fonts.display, fontSize: 22 },
  body: { fontFamily: fonts.body, fontSize: 16 },
  caption: { fontFamily: fonts.body, fontSize: 13 },
} as const;
