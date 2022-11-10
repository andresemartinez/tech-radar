import dynamic from 'next/dynamic';
import { AdminLayout } from '~/components/admin/AdminLayout';
import { NextPageWithLayout } from '~/pages/_app';

const Greeting = dynamic(() => import('app1/greetingComponent'), {
  ssr: false,
});

const AdminLoginPage: NextPageWithLayout = () => {
  return (
    <main className="flex flex-row justify-center">
      <span>Welcome!</span>
      <Greeting />
    </main>
  );
};

AdminLoginPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLoginPage;
