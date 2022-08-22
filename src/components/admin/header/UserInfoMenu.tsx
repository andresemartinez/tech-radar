import { Button, Menu, MenuItem } from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
import { useRef, useState } from 'react';

const UserInfoMenu = () => {
  const { data: session } = useSession();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Button ref={buttonRef} onClick={() => setMenuOpen(!menuOpen)}>
        Hello, {session?.user?.name}!
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
