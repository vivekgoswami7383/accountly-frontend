import { useEffect, ReactNode } from 'react';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import useConfig from 'hooks/useConfig';

interface Props {
  children: ReactNode;
}

const RTLLayout = ({ children }: Props) => {
  const { themeDirection } = useConfig();

  useEffect(() => {
    // Force LTR direction for Accountly
    document.dir = 'ltr';
    // Clear any cached RTL settings
    if (themeDirection === 'rtl') {
      localStorage.removeItem('mantis-react-ts-config');
      window.location.reload();
    }
  }, [themeDirection]);

  const cacheRtl = createCache({
    key: 'css', // Always use LTR cache
    prepend: true
  });

  return <CacheProvider value={cacheRtl}>{children}</CacheProvider>;
};

export default RTLLayout;
