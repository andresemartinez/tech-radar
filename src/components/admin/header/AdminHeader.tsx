import style from './AdminHeader.module.css';
import { useSession } from 'next-auth/react';
import React from 'react';
import AdminMenu from '~/components/admin/header/admin-menu/AdminMenu';
import UserInfoMenu from '~/components/admin/header/user-info-menu/UserInfoMenu';
import LoginButton from '~/components/login-button/LoginButton';

const AdminHeader = () => {
  const { status } = useSession();

  return (
    <header className={style.headerContainer}>
      <div>{status === 'authenticated' && <AdminMenu />}</div>
      <div>
        {status === 'authenticated' ? <UserInfoMenu /> : <LoginButton />}
      </div>
    </header>
  );
};

export default AdminHeader;
