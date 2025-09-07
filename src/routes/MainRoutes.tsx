import { lazy } from 'react';
import MainLayout from 'layout/MainLayout';
import Loadable from 'components/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';
import RouteProtection from 'components/RouteProtection';

const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
const AppCustomerList = Loadable(lazy(() => import('pages/apps/customer/simple-list')));
const AppBusinessList = Loadable(lazy(() => import('pages/apps/business/list')));
const AppTransactionList = Loadable(lazy(() => import('pages/apps/transaction/list')));

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: 'dashboard',
          element: (
            <RouteProtection allowedRoles={['super_admin', 'owner', 'admin', 'staff']}>
              <DashboardDefault />
            </RouteProtection>
          )
        },
        {
          path: 'business',
          element: (
            <RouteProtection allowedRoles={['super_admin']}>
              <AppBusinessList />
            </RouteProtection>
          )
        },
        {
          path: 'customer',
          element: (
            <RouteProtection allowedRoles={['owner', 'admin', 'staff']}>
              <AppCustomerList />
            </RouteProtection>
          )
        },
        {
          path: 'transaction',
          element: (
            <RouteProtection allowedRoles={['owner', 'admin', 'staff']}>
              <AppTransactionList />
            </RouteProtection>
          )
        }
      ]
    }
  ]
};

export default MainRoutes;
