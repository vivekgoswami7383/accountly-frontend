import { DefaultConfigProps, MenuOrientation, ThemeDirection, ThemeMode } from 'types/config';

export const twitterColor = '#1DA1F2';
export const facebookColor = '#3b5998';
export const linkedInColor = '#0e76a8';

export const APP_DEFAULT_PATH = '/';
export const HORIZONTAL_MAX_ITEM = 6;
export const DRAWER_WIDTH = 260;

const config: DefaultConfigProps = {
  fontFamily: `'Poppins', sans-serif`,
  language: 'en',
  currency: 'INR',
  menuOrientation: MenuOrientation.VERTICAL,
  miniDrawer: false,
  container: false,
  mode: ThemeMode.DARK,
  presetColor: 'default',
  themeDirection: ThemeDirection.LTR
};

export default config;
