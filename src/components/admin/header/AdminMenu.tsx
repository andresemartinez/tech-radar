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
  People as PeopleIcon,
} from '@mui/icons-material';
import {
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SwipeableDrawer,
} from '@mui/material';
import { Role } from '@prisma/client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

type MenuItem = {
  name: string;
  icon: SvgIconComponent;
  url: string;
  onClick: () => void;
  roles?: Role[];
};

type MenuSection = MenuItem[];

type Menu = MenuSection[];

const AdminMenu = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { data: session } = useSession();

  const userRole = useMemo(() => session?.user?.role, [session]);

  const menu = useMemo(() => {
    const defaultOnClick = () => setDrawerOpen(false);

    return userRole
      ? (
          [
            [
              {
                name: 'Me',
                icon: PersonIcon,
                url: 'me',
                onClick: defaultOnClick,
              },
            ],
            [
              {
                name: 'Professionals Search',
                icon: SearchIcon,
                url: 'professional/search',
                onClick: defaultOnClick,
              },
              {
                name: 'Tech stats',
                icon: TimelineIcon,
                url: 'technology/stats',
                onClick: defaultOnClick,
              },
            ],
            [
              {
                name: 'Technologies',
                icon: ComputerIcon,
                url: 'technology',
                onClick: defaultOnClick,
              },
              {
                name: 'Categories',
                icon: CategoryIcon,
                url: 'technology/category',
                onClick: defaultOnClick,
              },
              {
                name: 'Skill Levels',
                icon: LeaderboardIcon,
                url: 'technology/skill/level',
                onClick: defaultOnClick,
              },
            ],
            [
              {
                name: 'Users',
                icon: PeopleIcon,
                url: 'user',
                roles: [Role.superadmin, Role.admin],
                onClick: defaultOnClick,
              },
            ],
          ] as Menu
        )
          .map((section) =>
            section.filter(
              (item) => !item.roles || item.roles.includes(userRole),
            ),
          )
          .filter((section) => section.length)
      : [];
  }, [userRole, setDrawerOpen]);

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
            {menu.map((items, index) => (
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

const AdminMenuSection = ({ section }: AdminMenuSectionProps) => (
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
}: AdminMenuItemProps) => (
  <Link key={name} href={`/admin/${url}`} passHref>
    <ListItemButton onClick={onClick}>
      <ListItemIcon>
        <Icon />
      </ListItemIcon>
      <ListItemText primary={name} />
    </ListItemButton>
  </Link>
);

const AdminMenuDivider = () => {
  return <div className="h-[2px] mx-[16px] my-5 bg-gray-400"></div>;
};

export default AdminMenu;
