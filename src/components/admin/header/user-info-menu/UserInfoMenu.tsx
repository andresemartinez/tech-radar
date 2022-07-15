import { Button, Menu, MenuItem } from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
import React, { useCallback, useState } from 'react';

const UserInfoMenu = () => {
  const { data: session } = useSession();
  const [menuAnchorElement, setMenuAnchorElement] =
    useState<null | HTMLElement>(null);

  const handleMenuButtonClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (menuAnchorElement) {
        setMenuAnchorElement(null);
      } else {
        setMenuAnchorElement(event.currentTarget);
      }
    },
    [menuAnchorElement],
  );

  const handleMenuCloseClick = useCallback(() => {
    setMenuAnchorElement(null);
  }, []);

  return (
    <>
      <Button onClick={handleMenuButtonClick}>
        Hola, {session?.user?.name}!
      </Button>
      <Menu
        anchorEl={menuAnchorElement}
        open={!!menuAnchorElement}
        onClose={handleMenuCloseClick}
      >
        <MenuItem onClick={() => signOut()}>Cerrar sesión</MenuItem>
      </Menu>
    </>
  );
};

export default UserInfoMenu;
