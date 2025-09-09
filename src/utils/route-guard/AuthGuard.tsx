import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project import
import useAuth from 'hooks/useAuth';

// types
import { GuardProps } from 'types/auth';

// ==============================|| AUTH GUARD ||============================== //

const AuthGuard = ({ children }: GuardProps) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // For development/testing - allow access to admin panel without login
  const isDevelopment = process.env.NODE_ENV === 'development';
  const bypassAuth = isDevelopment && location.pathname.startsWith('/app');

  useEffect(() => {
    if (!isLoggedIn && !bypassAuth) {
      navigate('login', {
        state: {
          from: location.pathname
        },
        replace: true
      });
    }
  }, [isLoggedIn, navigate, location, bypassAuth]);

  return children;
};

export default AuthGuard;
