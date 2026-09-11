import { createTheme } from '@mui/material/styles';

export const c = {
  red: '#E23744',
  redDeep: '#C4303B',
  redSoft: '#FCECEC',
  green: '#1FA971',
  greenDeep: '#178A5C',
  greenSoft: '#E9F7F0',
  ink: '#1A1D1F',
  inkSoft: '#33383D',
  grey: '#6F767E',
  greyLight: '#9AA0A6',
  greyIcon: '#C4C7CC',
  line: '#F0F1F3',
  border: '#E6E8EC',
  slate: '#33475B',
  bg: '#EEF1F5',
  surface: '#FFFFFF',
  chipGrey: '#EEF0F3',
  onlineDot: '#22C55E'
};

export const shadow = {
  card: '0 1px 2px rgba(20, 23, 26, 0.04), 0 14px 34px rgba(20, 23, 26, 0.05)',
  soft: '0 1px 2px rgba(20, 23, 26, 0.04), 0 8px 20px rgba(20, 23, 26, 0.04)',
  nav: '0 10px 34px rgba(20, 23, 26, 0.12)',
  press: '0 8px 20px rgba(226, 55, 68, 0.18)'
};

export const FONT = `'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;
export const DISPLAY = FONT;

export const AVATAR_TINTS = [
  { bg: '#E4E1F7', fg: '#6B5FB8' },
  { bg: '#D7E0F7', fg: '#4B6BC4' },
  { bg: '#FCE3E5', fg: '#C4485A' },
  { bg: '#DDF0E6', fg: '#2E8B65' },
  { bg: '#FBE8D6', fg: '#B4762E' },
  { bg: '#DCEEF7', fg: '#3A7FA6' }
];
export const avatarTint = (name: string) => {
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[h % AVATAR_TINTS.length];
};
export const initials = (name: string) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'C';

const accountlyTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: c.red, dark: c.redDeep, contrastText: '#fff' },
    success: { main: c.green, dark: c.greenDeep, contrastText: '#fff' },
    error: { main: c.red, dark: c.redDeep, contrastText: '#fff' },
    background: { default: c.bg, paper: c.surface },
    text: { primary: c.ink, secondary: c.grey, disabled: c.greyLight },
    divider: c.line
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: FONT,
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.015em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: 0 }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { fontFamily: FONT },
        'input, textarea, select, button': { fontFamily: FONT }
      }
    },
    MuiInputBase: { styleOverrides: { root: { fontFamily: FONT } } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 14, paddingTop: 13, paddingBottom: 13, fontSize: '0.95rem' },
        sizeLarge: { paddingTop: 15, paddingBottom: 15, fontSize: '1rem' },
        containedPrimary: { boxShadow: shadow.press, '&:hover': { backgroundColor: c.redDeep, boxShadow: shadow.press } },
        outlined: {
          borderColor: c.border,
          color: c.ink,
          backgroundColor: c.surface,
          '&:hover': { borderColor: c.greyLight, backgroundColor: c.surface }
        }
      }
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: c.surface,
          fontSize: '0.95rem',
          '& fieldset': { borderColor: c.border },
          '&:hover fieldset': { borderColor: c.greyLight },
          '&.Mui-focused fieldset': { borderColor: c.red, borderWidth: 1.5 },
          '& .MuiInputAdornment-positionEnd': { marginRight: 12 }
        },
        input: {
          padding: '15px 16px',
          '&:-webkit-autofill': {
            WebkitBoxShadow: `0 0 0 1000px ${c.surface} inset`,
            WebkitTextFillColor: c.ink,
            caretColor: c.ink
          },
          '&:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
            WebkitBoxShadow: `0 0 0 1000px ${c.surface} inset`
          }
        }
      }
    },
    MuiInputLabel: { styleOverrides: { root: { fontWeight: 600, color: c.grey } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 24, boxShadow: shadow.card } } },
    MuiDialogTitle: { styleOverrides: { root: { fontFamily: DISPLAY, fontWeight: 700, fontSize: '1.1rem' } } },
    MuiMenu: { styleOverrides: { paper: { borderRadius: 16, boxShadow: shadow.card, marginTop: 8 } } },
    MuiMenuItem: { styleOverrides: { root: { fontWeight: 600, fontSize: '0.9rem', paddingTop: 10, paddingBottom: 10, gap: 12 } } }
  }
});

export default accountlyTheme;
