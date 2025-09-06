import { FormattedMessage } from 'react-intl';
import { UserOutlined, DashboardOutlined, CustomerServiceOutlined } from '@ant-design/icons';

const icons = {
  UserOutlined,
  DashboardOutlined,
  CustomerServiceOutlined
};

export const NavigationItems = [
  {
    id: 'dashboard',
    title: <FormattedMessage id="dashboard" />,
    type: 'item',
    url: '/dashboard',
    icon: icons.DashboardOutlined
  },
  {
    id: 'customer',
    title: <FormattedMessage id="customer" />,
    type: 'item',
    url: '/customer',
    icon: icons.CustomerServiceOutlined
  }
];
