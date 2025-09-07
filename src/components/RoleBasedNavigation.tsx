import { ReactNode } from 'react';
import { useContext } from 'react';
import JWTContext from 'contexts/JWTContext';

interface RoleBasedNavigationProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

const RoleBasedNavigation = ({ children, allowedRoles, fallback = null }: RoleBasedNavigationProps) => {
  const context = useContext(JWTContext);
  const user = context?.user;

  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleBasedNavigation;
