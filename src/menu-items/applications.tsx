import { FormattedMessage } from 'react-intl';
import {
  BuildOutlined,
  CalendarOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  AppstoreAddOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { NavItemType } from 'types/menu';

const icons = {
  BuildOutlined,
  CalendarOutlined,
  CustomerServiceOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  AppstoreAddOutlined,
  FileTextOutlined,
  DashboardOutlined
};

const applications: NavItemType = {
  id: 'main-menu',
  title: <FormattedMessage id="applications" />,
  type: 'group',
  children: [
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
  ]
};

export default applications;
