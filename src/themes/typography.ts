import { Theme, TypographyVariantsOptions } from '@mui/material/styles';

import { FontFamily, ThemeMode } from 'types/config';

const Typography = (mode: ThemeMode, fontFamily: FontFamily, theme: Theme): TypographyVariantsOptions => ({
  htmlFontSize: 16,
  fontFamily:
    fontFamily === `'Roboto', sans-serif`
      ? '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      : fontFamily,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 600,
  h1: {
    fontWeight: 700,
    fontSize: '2.5rem',
    lineHeight: 1.2,
    letterSpacing: '-0.02em'
  },
  h2: {
    fontWeight: 700,
    fontSize: '2rem',
    lineHeight: 1.25,
    letterSpacing: '-0.01em'
  },
  h3: {
    fontWeight: 600,
    fontSize: '1.75rem',
    lineHeight: 1.3,
    letterSpacing: '-0.01em'
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.5rem',
    lineHeight: 1.35,
    letterSpacing: '0em'
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.25rem',
    lineHeight: 1.4,
    letterSpacing: '0em'
  },
  h6: {
    fontWeight: 600,
    fontSize: '1.125rem',
    lineHeight: 1.45,
    letterSpacing: '0em'
  },
  subtitle1: {
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: 1.5,
    letterSpacing: '0em'
  },
  subtitle2: {
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: 1.57,
    letterSpacing: '0.01em'
  },
  body1: {
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: 1.6,
    letterSpacing: '0em'
  },
  body2: {
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: 1.6,
    letterSpacing: '0em'
  },
  button: {
    fontWeight: 500,
    fontSize: '0.875rem',
    lineHeight: 1.43,
    letterSpacing: '0.02em',
    textTransform: 'none'
  },
  caption: {
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: 1.66,
    letterSpacing: '0.03em'
  },
  overline: {
    fontWeight: 500,
    fontSize: '0.75rem',
    lineHeight: 1.66,
    letterSpacing: '0.08em',
    textTransform: 'uppercase'
  }
});

export default Typography;
