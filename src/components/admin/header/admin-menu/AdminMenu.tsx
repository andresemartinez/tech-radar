import { Category, Leaderboard, Menu as MenuIcon } from '@mui/icons-material';
import {
  Box,
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
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {[
              {
                name: 'Categories',
                icon: <Category />,
                url: 'technology/category',
              },
              {
                name: 'Skill Levels',
                icon: <Leaderboard />,
                url: 'technology/skill/level',
              },
            ].map(({ name, icon, url }) => (
              <Link key={name} href={`/admin/${url}`} passHref>
                <ListItem
                  button
                  component="a"
                  onClick={() => setDrawerOpen(false)}
                >
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={name} />
                </ListItem>
              </Link>
            ))}
          </List>
        </Box>
      </SwipeableDrawer>
    </>
  );
};

export default AdminMenu;
