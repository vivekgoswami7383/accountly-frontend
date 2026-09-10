import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import useAuth from 'hooks/useAuth';

import { GuardProps } from 'types/auth';

const AuthGuard = ({ children }: GuardProps) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', {
        state: {
          from: location.pathname
        },
        replace: true
      });
    }
  }, [isLoggedIn, navigate, location]);

  return children;
};

export default AuthGuard;
