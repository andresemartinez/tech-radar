import { AdminLayout } from '~/components/admin/AdminLayout';
import { NextPageWithLayout } from '~/pages/_app';
import style from './AdminLoginPage.module.css';

const AdminLoginPage: NextPageWithLayout = () => {
  return (
    <main className={style.adminLoginPage}>
      <span>Bienvenido!</span>
    </main>
  );
};

AdminLoginPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLoginPage;
