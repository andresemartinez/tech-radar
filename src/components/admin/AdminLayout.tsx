import { ReactNode } from 'react';
import Head from 'next/head';
import AdminHeader from '~/components/admin/header/AdminHeader';

type AdminLayoutProps = { children: ReactNode };

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <>
      <Head>
        <title>Tech Radar! | Admin</title>
        <link rel="icon" href="../../public/favicon.ico" />
      </Head>

      <AdminHeader />

      {children}
    </>
  );
};
