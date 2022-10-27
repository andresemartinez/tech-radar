import { AdminLayout } from '~/components/admin/AdminLayout';
import { NextPageWithLayout } from '~/pages/_app';

const AdminLoginPage: NextPageWithLayout = () => {
  return (
    <main className="flex flex-row justify-center">
      <span>Welcome!</span>
    </main>
  );
};

AdminLoginPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLoginPage;
