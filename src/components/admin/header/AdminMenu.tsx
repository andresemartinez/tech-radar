import {
  Category as CategoryIcon,
  Leaderboard as LeaderboardIcon,
  Menu as MenuIcon,
  Computer as ComputerIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  SvgIconComponent,
} from '@mui/icons-material';
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  SwipeableDrawer,
} from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';

const AdminMenu = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
        <MenuIcon />
      </IconButton>
      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
      >
        <div className="w-drawer">
          <div className="flex flex-row justify-end items-center h-header px-2">
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </div>
          <List>
            {[
              {
                name: 'Me',
                icon: PersonIcon,
                url: 'me',
              },
              {
                name: 'Technologies',
                icon: ComputerIcon,
                url: 'technology',
              },
              {
                name: 'Categories',
                icon: CategoryIcon,
                url: 'technology/category',
              },
              {
                name: 'Skill Levels',
                icon: LeaderboardIcon,
                url: 'technology/skill/level',
              },
            ].map(({ name, icon, url }) => (
              <AdminMenuItem
                key={name}
                name={name}
                icon={icon}
                url={url}
                onClick={() => setDrawerOpen(false)}
              />
            ))}
          </List>
        </div>
      </SwipeableDrawer>
    </>
  );
};

type AdminMenuItemProps = {
  name: string;
  icon: SvgIconComponent;
  url: string;
  onClick: () => void;
};

const AdminMenuItem = ({
  name,
  icon: Icon,
  url,
  onClick,
}: AdminMenuItemProps) => {
  return (
    <Link key={name} href={`/admin/${url}`} passHref>
      <ListItem button component="a" onClick={onClick}>
        <ListItemIcon>
          <Icon />
        </ListItemIcon>
        <ListItemText primary={name} />
      </ListItem>
    </Link>
  );
};

export default AdminMenu;
