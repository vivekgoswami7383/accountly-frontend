import { FormattedMessage } from 'react-intl';
import { NavItemType } from 'types/menu';
import { NavigationItems } from './navigationItems';

const mainMenuItems: NavItemType = {
  id: 'main-menu',
  title: <FormattedMessage id="main-menu" />,
  type: 'group',
  children: NavigationItems
};

export default mainMenuItems;
