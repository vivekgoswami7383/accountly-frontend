import { ReactNode } from 'react';
import { HomeOutlined, TeamOutlined, SwapOutlined, MoreOutlined } from '@ant-design/icons';

export interface NavDestination {
  label: string;
  icon: ReactNode;
  path: string;
}

export const primaryNav: NavDestination[] = [
  { label: 'Home', icon: <HomeOutlined />, path: '/' },
  { label: 'Customers', icon: <TeamOutlined />, path: '/customer' },
  { label: 'Transactions', icon: <SwapOutlined />, path: '/transaction' },
  { label: 'More', icon: <MoreOutlined />, path: '/more' }
];

export const isRootTab = (pathname: string) => primaryNav.some((n) => n.path === pathname);

export const activeTabIndex = (pathname: string) => {
  let best = 0;
  primaryNav.forEach((n, i) => {
    if (n.path === '/' ? pathname === '/' : pathname.startsWith(n.path)) best = i;
  });
  return best;
};
