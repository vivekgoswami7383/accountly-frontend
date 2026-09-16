import { createTheme, Theme } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

export const lightColors = {
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

export const darkColors = {
  red: '#F0645C',
  redDeep: '#F0847E',
  redSoft: '#3A1F22',
  green: '#3FCF8E',
  greenDeep: '#54D6A0',
  greenSoft: '#173229',
  ink: '#F2F3F5',
  inkSoft: '#D7DADD',
  grey: '#A7ADB4',
  greyLight: '#7C838B',
  greyIcon: '#565C64',
  line: '#26292E',
  border: '#31353B',
  slate: '#A9BACB',
  bg: '#101215',
  surface: '#1A1D21',
  chipGrey: '#24272C',
  onlineDot: '#34D399'
};

export type AccountlyColors = typeof lightColors;
export type AccountlyMode = 'light' | 'dark';

export const getAccountlyColors = (mode: AccountlyMode): AccountlyColors => (mode === 'dark' ? darkColors : lightColors);

export const shadow = {
  card: '0 1px 2px rgba(20, 23, 26, 0.04), 0 14px 34px rgba(20, 23, 26, 0.05)',
  soft: '0 1px 2px rgba(20, 23, 26, 0.04), 0 8px 20px rgba(20, 23, 26, 0.04)',
  nav: '0 10px 34px rgba(20, 23, 26, 0.12)',
  press: '0 8px 20px rgba(226, 55, 68, 0.18)'
};

export const FONT = `'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`;
export const DISPLAY = FONT;

export const AVATAR_TINTS_LIGHT = [
  { bg: '#E4E1F7', fg: '#6B5FB8' },
  { bg: '#D7E0F7', fg: '#4B6BC4' },
  { bg: '#FCE3E5', fg: '#C4485A' },
  { bg: '#DDF0E6', fg: '#2E8B65' },
  { bg: '#FBE8D6', fg: '#B4762E' },
  { bg: '#DCEEF7', fg: '#3A7FA6' }
];

export const AVATAR_TINTS_DARK = [
  { bg: '#332F55', fg: '#B8AEF0' },
  { bg: '#2A3355', fg: '#9DB4F5' },
  { bg: '#4A2A30', fg: '#F0A3AE' },
  { bg: '#243D30', fg: '#7FD9A8' },
  { bg: '#453322', fg: '#E8B473' },
  { bg: '#233D48', fg: '#82C7E8' }
];

export const AVATAR_TINTS = AVATAR_TINTS_LIGHT;

export const avatarTintFor = (name: string, mode: AccountlyMode) => {
  const tints = mode === 'dark' ? AVATAR_TINTS_DARK : AVATAR_TINTS_LIGHT;
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return tints[h % tints.length];
};

export const avatarTint = (name: string) => avatarTintFor(name, 'light');

export const initials = (name: string) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'C';

export const createAccountlyTheme = (mode: AccountlyMode): Theme => {
  const c = getAccountlyColors(mode);

  const theme = createTheme({
    palette: {
      mode,
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
      h1: { fontWeight: 500, letterSpacing: '-0.02em' },
      h2: { fontWeight: 500, letterSpacing: '-0.02em' },
      h3: { fontWeight: 500, letterSpacing: '-0.02em' },
      h4: { fontWeight: 500, letterSpacing: '-0.015em' },
      h5: { fontWeight: 500, letterSpacing: '-0.01em' },
      h6: { fontWeight: 500, letterSpacing: '-0.01em' },
      subtitle1: { fontWeight: 500 },
      subtitle2: { fontWeight: 500 },
      button: { textTransform: 'none', fontWeight: 500, letterSpacing: 0 }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { fontFamily: FONT },
          'input, textarea, select, button': { fontFamily: FONT },
          'a, button, [role="button"]': { WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }
        }
      },
      MuiInputBase: { styleOverrides: { root: { fontFamily: FONT } } },
      MuiButtonBase: {
        styleOverrides: {
          root: { WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }
        }
      },
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
            color: c.ink,
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
      MuiInputLabel: { styleOverrides: { root: { fontWeight: 500, color: c.grey } } },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 24, boxShadow: shadow.card, backgroundColor: c.surface } } },
      MuiDialogTitle: { styleOverrides: { root: { fontFamily: DISPLAY, fontWeight: 500, fontSize: '1.1rem', color: c.ink } } },
      MuiDialogContentText: { styleOverrides: { root: { color: c.grey } } },
      MuiMenu: { styleOverrides: { paper: { borderRadius: 16, boxShadow: shadow.card, marginTop: 8, backgroundColor: c.surface } } },
      MuiMenuItem: { styleOverrides: { root: { fontWeight: 500, fontSize: '0.9rem', paddingTop: 10, paddingBottom: 10, gap: 12 } } },
      MuiSwitch: {
        styleOverrides: {
          track: { backgroundColor: c.greyIcon, opacity: 1 }
        }
      }
    }
  });

  (theme as any).accountly = c;
  return theme;
};

export const useAccountlyColors = (): AccountlyColors => {
  const theme = useTheme() as Theme & { accountly?: AccountlyColors };
  return theme.accountly || lightColors;
};

export const useAccountlyMode = (): AccountlyMode => {
  const theme = useTheme();
  return theme.palette.mode;
};

export const c = lightColors;

const accountlyTheme = createAccountlyTheme('light');

export default accountlyTheme;
