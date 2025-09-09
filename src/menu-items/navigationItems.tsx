import { FormattedMessage } from 'react-intl';
import { DashboardOutlined, CustomerServiceOutlined, ShopOutlined, TransactionOutlined } from '@ant-design/icons';

const icons = {
  DashboardOutlined,
  CustomerServiceOutlined,
  ShopOutlined,
  TransactionOutlined
};

export const NavigationItems = [
  {
    id: 'dashboard',
    title: <FormattedMessage id="dashboard" />,
    type: 'item',
    url: '/dashboard',
    icon: icons.DashboardOutlined,
    allowedRoles: ['super_admin', 'owner', 'admin', 'staff']
  },
  {
    id: 'business',
    title: <FormattedMessage id="business" />,
    type: 'item',
    url: '/app/business',
    icon: icons.ShopOutlined,
    allowedRoles: ['super_admin'] // Only super admin can manage businesses
  },
  {
    id: 'customer',
    title: <FormattedMessage id="customer" />,
    type: 'item',
    url: '/app/customer',
    icon: icons.CustomerServiceOutlined,
    allowedRoles: ['owner', 'admin', 'staff'] // Owner, admin, staff can manage customers
  },
  {
    id: 'transaction',
    title: <FormattedMessage id="transaction" />,
    type: 'item',
    url: '/app/transaction',
    icon: icons.TransactionOutlined,
    allowedRoles: ['owner', 'admin', 'staff'] // Owner, admin, staff can manage transactions
  }
];
