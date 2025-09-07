import { useRoutes } from 'react-router-dom';
import CommonLayout from 'layout/CommonLayout';
import LoginRoutes from './LoginRoutes';
import MainRoutes from './MainRoutes';

export default function ThemeRoutes() {
  return useRoutes([
    {
      path: '/',
      element: <CommonLayout layout="landing" />,
      children: [
        {
          path: '/',
          element: <div>Welcome to Accountly</div>
        }
      ]
    },
    LoginRoutes,
    MainRoutes
  ]);
}
