import { lazy } from 'react';
import AppLayout from 'layout/AppLayout';
import Loadable from 'components/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';

const Dashboard = Loadable(lazy(() => import('pages/accountly/Dashboard')));
const Contacts = Loadable(lazy(() => import('pages/accountly/Contacts')));
const AddContact = Loadable(lazy(() => import('pages/accountly/AddContact')));
const ContactDetail = Loadable(lazy(() => import('pages/accountly/ContactDetail')));
const EditContact = Loadable(lazy(() => import('pages/accountly/EditContact')));
const ContactSettings = Loadable(lazy(() => import('pages/accountly/ContactSettings')));
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
    { path: 'contact', element: <Contacts /> },
    { path: 'contact/add', element: <AddContact /> },
    { path: 'contact/:id', element: <ContactDetail /> },
    { path: 'contact/:id/edit', element: <EditContact /> },
    { path: 'contact/:id/settings', element: <ContactSettings /> },
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
