import { lazy } from 'react';
import AppLayout from 'layout/AppLayout';
import Loadable from 'components/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';

const Dashboard = Loadable(lazy(() => import('pages/accountly/Dashboard')));
const Customers = Loadable(lazy(() => import('pages/accountly/Customers')));
const AddCustomer = Loadable(lazy(() => import('pages/accountly/AddCustomer')));
const CustomerDetail = Loadable(lazy(() => import('pages/accountly/CustomerDetail')));
const EditCustomer = Loadable(lazy(() => import('pages/accountly/EditCustomer')));
const CustomerSettings = Loadable(lazy(() => import('pages/accountly/CustomerSettings')));
const Transactions = Loadable(lazy(() => import('pages/accountly/Transactions')));
const TransactionDetail = Loadable(lazy(() => import('pages/accountly/TransactionDetail')));
const Payment = Loadable(lazy(() => import('pages/accountly/Payment')));
const More = Loadable(lazy(() => import('pages/accountly/More')));
const Profile = Loadable(lazy(() => import('pages/accountly/Profile')));
const Settings = Loadable(lazy(() => import('pages/accountly/Settings')));
const Reports = Loadable(lazy(() => import('pages/accountly/Reports')));
const Expenses = Loadable(lazy(() => import('pages/accountly/Expenses')));
const AddExpense = Loadable(lazy(() => import('pages/accountly/AddExpense')));
const ExpenseDetail = Loadable(lazy(() => import('pages/accountly/ExpenseDetail')));
const Notes = Loadable(lazy(() => import('pages/accountly/Notes')));
const NoteEditor = Loadable(lazy(() => import('pages/accountly/NoteEditor')));

const MainRoutes = {
  path: '/',
  element: (
    <AuthGuard>
      <AppLayout />
    </AuthGuard>
  ),
  children: [
    { index: true, element: <Dashboard /> },
    { path: 'customer', element: <Customers /> },
    { path: 'customer/add', element: <AddCustomer /> },
    { path: 'customer/:id', element: <CustomerDetail /> },
    { path: 'customer/:id/edit', element: <EditCustomer /> },
    { path: 'customer/:id/settings', element: <CustomerSettings /> },
    { path: 'transaction', element: <Transactions /> },
    { path: 'transaction/new', element: <Payment /> },
    { path: 'transaction/:id', element: <TransactionDetail /> },
    { path: 'transaction/:id/edit', element: <Payment /> },
    { path: 'more', element: <More /> },
    { path: 'profile', element: <Profile /> },
    { path: 'settings', element: <Settings /> },
    { path: 'reports', element: <Reports /> },
    { path: 'expense', element: <Expenses /> },
    { path: 'expense/new', element: <AddExpense /> },
    { path: 'expense/:id', element: <ExpenseDetail /> },
    { path: 'expense/:id/edit', element: <AddExpense /> },
    { path: 'note', element: <Notes /> },
    { path: 'note/new', element: <NoteEditor /> },
    { path: 'note/:id', element: <NoteEditor /> }
  ]
};

export default MainRoutes;
