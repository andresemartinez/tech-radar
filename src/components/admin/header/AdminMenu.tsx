import {
  Category as CategoryIcon,
  Close as CloseIcon,
  Computer as ComputerIcon,
  Leaderboard as LeaderboardIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  SvgIconComponent,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import {
  IconButton,
  List,
  ListItemButton,
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
              [
                {
                  name: 'Me',
                  icon: PersonIcon,
                  url: 'me',
                  onClick: () => setDrawerOpen(false),
                },
              ],
              [
                {
                  name: 'Professionals Search',
                  icon: SearchIcon,
                  url: 'professional/search',
                  onClick: () => setDrawerOpen(false),
                },
                {
                  name: 'Tech stats',
                  icon: TimelineIcon,
                  url: 'technology/stats',
                  onClick: () => setDrawerOpen(false),
                },
              ],
              [
                {
                  name: 'Technologies',
                  icon: ComputerIcon,
                  url: 'technology',
                  onClick: () => setDrawerOpen(false),
                },
                {
                  name: 'Categories',
                  icon: CategoryIcon,
                  url: 'technology/category',
                  onClick: () => setDrawerOpen(false),
                },
                {
                  name: 'Skill Levels',
                  icon: LeaderboardIcon,
                  url: 'technology/skill/level',
                  onClick: () => setDrawerOpen(false),
                },
              ],
            ].map((items, index) => (
              <AdminMenuSection
                key={index}
                section={{ items, id: index, index }}
              />
            ))}
          </List>
        </div>
      </SwipeableDrawer>
    </>
  );
};

type AdminMenuSectionProps = {
  section: {
    id: number;
    index: number;
    items: {
      name: string;
      icon: SvgIconComponent;
      url: string;
      onClick: () => void;
    }[];
  };
};

const AdminMenuSection = ({ section }: AdminMenuSectionProps) => {
  return (
    <>
      {section.index !== 0 && <AdminMenuDivider />}
      {section.items.map(({ name, icon, url, onClick }) => (
        <AdminMenuItem
          key={name}
          name={name}
          icon={icon}
          url={url}
          onClick={onClick}
        />
      ))}
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
      <ListItemButton onClick={onClick}>
        <ListItemIcon>
          <Icon />
        </ListItemIcon>
        <ListItemText primary={name} />
      </ListItemButton>
    </Link>
  );
};

const AdminMenuDivider = () => {
  return <div className="h-[2px] mx-[16px] my-5 bg-gray-400"></div>;
};

export default AdminMenu;
