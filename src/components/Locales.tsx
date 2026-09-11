import { ReactNode, useEffect, useState } from 'react';
import { IntlProvider, MessageFormatElement } from 'react-intl';
import useConfig from 'hooks/useConfig';
import { I18n } from 'types/config';

const loadLocaleData = (locale: I18n) => {
  switch (locale) {
    case 'hi':
      return import('utils/locales/hi.json');
    case 'gu':
      return import('utils/locales/gu.json');
    case 'en':
    default:
      return import('utils/locales/en.json');
  }
};

interface Props {
  children: ReactNode;
}

const Locales = ({ children }: Props) => {
  const { language } = useConfig();

  const [messages, setMessages] = useState<Record<string, string> | Record<string, MessageFormatElement[]> | undefined>();

  useEffect(() => {
    loadLocaleData(language).then((d: { default: Record<string, string> | Record<string, MessageFormatElement[]> | undefined }) => {
      setMessages(d.default);
    });
  }, [language]);

  return (
    <>
      {messages && (
        <IntlProvider locale={language} defaultLocale="en" messages={messages}>
          {children}
        </IntlProvider>
      )}
    </>
  );
};

export default Locales;
