import { Box, Typography } from '@mui/material';

import NavGroup from './NavGroup';
import menuItem from 'menu-items';

import { NavItemType } from 'types/menu';

const Navigation = ({ searchValue }: { searchValue?: string }) => {
  let filteredMenuItems: NavItemType[] = [];

  if (searchValue === null || searchValue === undefined || searchValue === '') {
    filteredMenuItems = menuItem.items;
  } else {
    menuItem.items.forEach((parentMenu) => {
      const matchedChildren: any[] = [];

      parentMenu.children?.forEach((child) => {
        if (child.search?.trim().toLowerCase().includes(searchValue!)) {
          matchedChildren.push(child);
        }
      });

      const parent = filteredMenuItems.filter((xx) => xx === parentMenu);
      if (parent.length === 0 && matchedChildren.length > 0) {
        const clonedParent = { ...parentMenu };
        clonedParent.children = matchedChildren;
        filteredMenuItems.push(clonedParent);
      }
    });
  }

  const navGroups = filteredMenuItems.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return <Box sx={{ pt: 1 }}>{navGroups}</Box>;
};

export default Navigation;
