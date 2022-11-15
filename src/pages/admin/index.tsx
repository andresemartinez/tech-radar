import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AdminLayout } from '~/components/admin/AdminLayout';
import { NextPageWithLayout } from '~/pages/_app';

const AdminLoginPage: NextPageWithLayout = () => {
  return (
    <main className="flex flex-row justify-center">
      <span>Welcome!</span>
    </main>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const serverSideTranslation = locale
    ? await serverSideTranslations(locale, [
        ...AdminLayout.namespacesRequired,
        'button',
      ])
    : {};

  return {
    props: {
      ...serverSideTranslation,
    },
  };
};

AdminLoginPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default AdminLoginPage;
