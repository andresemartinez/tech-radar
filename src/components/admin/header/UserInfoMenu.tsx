import { Button, Menu, MenuItem } from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useRef, useState } from 'react';

const UserInfoMenu = () => {
  const { data: session } = useSession();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation('admin-header');

  return (
    <>
      <Button ref={buttonRef} onClick={() => setMenuOpen(!menuOpen)}>
        {t('userGreeting', { userName: session?.user?.name })}
      </Button>
      <Menu
        anchorEl={buttonRef.current}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        PaperProps={{ style: { width: buttonRef?.current?.offsetWidth } }}
      >
        <MenuItem onClick={() => signOut()}>Log out</MenuItem>
      </Menu>
    </>
  );
};

export default UserInfoMenu;
