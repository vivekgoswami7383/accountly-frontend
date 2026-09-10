import { alpha, createTheme } from '@mui/material/styles';
import { presetDarkPalettes, presetPalettes, PalettesProps } from '@ant-design/colors';
import { PresetColor, ThemeMode } from 'types/config';

const Palette = (mode: ThemeMode, presetColor: PresetColor) => {
  const colors: PalettesProps = mode === ThemeMode.DARK ? presetDarkPalettes : presetPalettes;

  let greyPrimary = [
    '#ffffff',
    '#fafafa',
    '#f5f5f5',
    '#f0f0f0',
    '#d9d9d9',
    '#bfbfbf',
    '#8c8c8c',
    '#595959',
    '#262626',
    '#141414',
    '#000000'
  ];
  let greyAscent = ['#fafafa', '#bfbfbf', '#434343', '#1f1f1f'];
  let greyConstant = ['#fafafb', '#e6ebf1'];

  if (mode === ThemeMode.DARK) {
    greyPrimary = ['#000000', '#141414', '#1e1e1e', '#595959', '#8c8c8c', '#bfbfbf', '#d9d9d9', '#f0f0f0', '#f5f5f5', '#fafafa', '#ffffff'];
    greyAscent = ['#fafafa', '#bfbfbf', '#434343', '#1f1f1f'];
    greyConstant = ['#121212', '#d3d8db'];
  }
  colors.grey = [...greyPrimary, ...greyAscent, ...greyConstant];

  return createTheme({
    palette: {
      mode,
      common: {
        black: '#000',
        white: '#fff'
      },
      primary: {
        50: '#e6f2ff',
        100: '#cce4ff',
        200: '#99c9ff',
        300: '#66adff',
        400: '#3392ff',
        500: '#007AFF',
        600: '#0062cc',
        700: '#004999',
        800: '#003166',
        900: '#001833',
        main: '#007AFF',
        light: '#3392ff',
        dark: '#0062cc',
        contrastText: '#ffffff'
      },
      secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        main: '#64748b',
        light: '#94a3b8',
        dark: '#334155',
        contrastText: '#ffffff'
      },
      success: {
        50: '#eafaef',
        100: '#d5f5df',
        200: '#abecbe',
        300: '#81e29e',
        400: '#57d97d',
        500: '#34C759',
        600: '#2aa049',
        700: '#1f7837',
        800: '#155025',
        900: '#0a2812',
        main: '#34C759',
        light: '#57d97d',
        dark: '#2aa049',
        contrastText: '#ffffff'
      },
      error: {
        50: '#ffebea',
        100: '#ffd7d5',
        200: '#ffafab',
        300: '#ff8781',
        400: '#ff5f57',
        500: '#FF3B30',
        600: '#cc2f26',
        700: '#99231d',
        800: '#661813',
        900: '#330c0a',
        main: '#FF3B30',
        light: '#ff5f57',
        dark: '#cc2f26',
        contrastText: '#ffffff'
      },
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
        contrastText: '#ffffff'
      },
      grey: {
        50: colors.grey[1] || '#fafafa',
        100: colors.grey[2] || '#f5f5f5',
        200: colors.grey[3] || '#f0f0f0',
        300: colors.grey[4] || '#d9d9d9',
        400: colors.grey[5] || '#bfbfbf',
        500: colors.grey[6] || '#8c8c8c',
        600: colors.grey[7] || '#595959',
        700: colors.grey[8] || '#262626',
        800: colors.grey[9] || '#141414',
        900: colors.grey[10] || '#000000'
      } as any,
      text: {
        primary: mode === ThemeMode.DARK ? '#FFFFFF' : colors.grey[7] || '#262626',
        secondary: mode === ThemeMode.DARK ? '#8E8E93' : colors.grey[6] || '#595959',
        disabled: mode === ThemeMode.DARK ? alpha('#FFFFFF', 0.3) : colors.grey[5] || '#bfbfbf'
      },
      action: {
        disabled: colors.grey[4] || '#d9d9d9'
      },
      divider: mode === ThemeMode.DARK ? '#3A3A3A' : colors.grey[3] || '#f0f0f0',
      background: {
        paper: mode === ThemeMode.DARK ? '#2D2D2D' : colors.grey[0] || '#ffffff',
        default: mode === ThemeMode.DARK ? '#1A1A1A' : colors.grey[1] || '#fafafa'
      }
    }
  });
};

export default Palette;
