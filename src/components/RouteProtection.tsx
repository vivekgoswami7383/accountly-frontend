import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import JWTContext from 'contexts/JWTContext';

interface RouteProtectionProps {
  children: ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

const RouteProtection = ({ children, allowedRoles, fallbackPath = '/dashboard' }: RouteProtectionProps) => {
  const context = useContext(JWTContext);
  const user = context?.user;

  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default RouteProtection;
