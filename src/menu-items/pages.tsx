import { FormattedMessage } from 'react-intl';
import { LoginOutlined, PhoneOutlined, RocketOutlined } from '@ant-design/icons';
import { NavItemType } from 'types/menu';

const icons = { LoginOutlined, PhoneOutlined, RocketOutlined };

const pages: NavItemType = {
  id: 'group-pages',
  title: <FormattedMessage id="pages" />,
  type: 'group',
  children: [
    {
      id: 'contact-us',
      title: <FormattedMessage id="contact-us" />,
      type: 'item',
      url: '/contact-us',
      icon: icons.PhoneOutlined,
      target: true
    }
  ]
};

export default pages;
