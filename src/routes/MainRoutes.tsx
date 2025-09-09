import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from 'layout/MainLayout';
import MobileLayout from 'layout/MobileLayout';
import Loadable from 'components/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';
import RouteProtection from 'components/RouteProtection';
import RoleBasedLayout from 'components/RoleBasedLayout';

const Landing = Loadable(lazy(() => import('pages/Landing')));
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
const MobileDashboard = Loadable(lazy(() => import('pages/dashboard/mobile-dashboard')));
const AppCustomerList = Loadable(lazy(() => import('pages/apps/customer/simple-list')));
const MobileCustomerList = Loadable(lazy(() => import('pages/apps/customer/mobile-customer-list')));
const AppBusinessList = Loadable(lazy(() => import('pages/apps/business/list')));
const AppTransactionList = Loadable(lazy(() => import('pages/apps/transaction/list')));
const MobileTransactionList = Loadable(lazy(() => import('pages/apps/transaction/mobile-transaction-list')));
const MobileMore = Loadable(lazy(() => import('pages/apps/more/mobile-more')));
const ProfilePage = Loadable(lazy(() => import('pages/apps/profile')));
const SettingsPage = Loadable(lazy(() => import('pages/apps/settings')));

const MainRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <Landing />
    },
    {
      path: '/business',
      element: <Navigate to="/app/business" replace />
    },
    {
      path: '/customer',
      element: <Navigate to="/app/customer" replace />
    },
    {
      path: '/transaction',
      element: <Navigate to="/app/transaction" replace />
    },
    {
      path: '/dashboard',
      element: (
        <AuthGuard>
          <MainLayout />
        </AuthGuard>
      ),
      children: [
        {
          index: true,
          element: (
            <RoleBasedLayout superAdminRoles={['super_admin']}>
              <DashboardDefault />
            </RoleBasedLayout>
          )
        }
      ]
    },
    {
      path: '/app',
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
    },
    {
      path: '/mobile',
      element: (
        <AuthGuard>
          <MobileLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: 'dashboard',
          element: <MobileDashboard />
        },
        {
          path: 'customer',
          element: <MobileCustomerList />
        },
        {
          path: 'transaction',
          element: <MobileTransactionList />
        },
        {
          path: 'more',
          element: <MobileMore />
        },
        {
          path: 'profile',
          element: (
            <RouteProtection allowedRoles={['super_admin', 'owner', 'admin', 'staff']}>
              <ProfilePage />
            </RouteProtection>
          )
        },
        {
          path: 'settings',
          element: (
            <RouteProtection allowedRoles={['super_admin', 'owner', 'admin', 'staff']}>
              <SettingsPage />
            </RouteProtection>
          )
        }
      ]
    }
  ]
};

export default MainRoutes;
