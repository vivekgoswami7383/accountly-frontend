import { ReactNode, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import JWTContext from 'contexts/JWTContext';

interface RoleBasedLayoutProps {
  children: ReactNode;
  superAdminRoles?: string[];
  fallbackPath?: string;
}

const RoleBasedLayout = ({ children, superAdminRoles = ['super_admin'], fallbackPath = '/mobile/dashboard' }: RoleBasedLayoutProps) => {
  const context = useContext(JWTContext);
  const user = context?.user;

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  // Super admin gets full dashboard access - render children directly
  if (superAdminRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // Other users get mobile view
  return <Navigate to={fallbackPath} replace />;
};

export default RoleBasedLayout;
