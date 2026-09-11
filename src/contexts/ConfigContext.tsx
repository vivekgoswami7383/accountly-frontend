import { createContext, ReactNode } from 'react';

import config from 'config';
import useLocalStorage from 'hooks/useLocalStorage';

import { CustomizationProps, FontFamily, I18n, MenuOrientation, PresetColor, ThemeDirection, ThemeMode } from 'types/config';

const initialState: CustomizationProps = {
  ...config,
  onChangeContainer: () => {},
  onChangeLocalization: (lang: I18n) => {},
  onChangeCurrency: (currency: string) => {},
  onChangeMode: (mode: ThemeMode) => {},
  onChangePresetColor: (theme: PresetColor) => {},
  onChangeDirection: (direction: ThemeDirection) => {},
  onChangeMiniDrawer: (miniDrawer: boolean) => {},
  onChangeMenuOrientation: (menuOrientation: MenuOrientation) => {},
  onChangeFontFamily: (fontFamily: FontFamily) => {}
};

const ConfigContext = createContext(initialState);

type ConfigProviderProps = {
  children: ReactNode;
};

function ConfigProvider({ children }: ConfigProviderProps) {
  const [config, setConfig] = useLocalStorage('accountly-config', {
    ...initialState,
    themeDirection: 'ltr'
  });

  const onChangeContainer = () => {
    setConfig((prev: typeof config) => ({
      ...prev,
      container: !prev.container
    }));
  };

  const onChangeLocalization = (lang: I18n) => {
    setConfig((prev: typeof config) => ({
      ...prev,
      language: lang
    }));
  };

  const onChangeCurrency = (currency: string) => {
    setConfig((prev: typeof config) => ({
      ...prev,
      currency
    }));
  };

  const onChangeMode = (mode: ThemeMode) => {
    setConfig((prev: typeof config) => ({
      ...prev,
      mode
    }));
  };

  const onChangePresetColor = (theme: PresetColor) => {
    setConfig((prev: typeof config) => ({
      ...prev,
      presetColor: theme
    }));
  };

  const onChangeDirection = (direction: ThemeDirection) => {
    setConfig((prev: typeof config) => ({
      ...prev,
      themeDirection: direction
    }));
  };

  const onChangeMiniDrawer = (miniDrawer: boolean) => {
    setConfig((prev: typeof config) => ({
      ...prev,
      miniDrawer
    }));
  };

  const onChangeMenuOrientation = (layout: MenuOrientation) => {
    setConfig((prev: typeof config) => ({
      ...prev,
      menuOrientation: layout
    }));
  };

  const onChangeFontFamily = (fontFamily: FontFamily) => {
    setConfig((prev: typeof config) => ({
      ...prev,
      fontFamily
    }));
  };

  return (
    <ConfigContext.Provider
      value={{
        ...config,
        onChangeContainer,
        onChangeLocalization,
        onChangeCurrency,
        onChangeMode,
        onChangePresetColor,
        onChangeDirection,
        onChangeMiniDrawer,
        onChangeMenuOrientation,
        onChangeFontFamily
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export { ConfigProvider, ConfigContext };
