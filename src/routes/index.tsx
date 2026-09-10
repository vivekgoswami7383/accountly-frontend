import { useRoutes, Navigate } from 'react-router-dom';
import LoginRoutes from './LoginRoutes';
import MainRoutes from './MainRoutes';

const CatchAllRoute = { path: '*', element: <Navigate to="/" replace /> };

export default function ThemeRoutes() {
  return useRoutes([LoginRoutes, MainRoutes, CatchAllRoute]);
}
