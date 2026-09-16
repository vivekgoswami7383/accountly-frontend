import { ReactElement, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollTop = ({ children }: { children: ReactElement | null }) => {
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return children || null;
};

export default ScrollTop;
