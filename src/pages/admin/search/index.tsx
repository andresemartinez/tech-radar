import { AdminLayout } from '~/components/admin/AdminLayout';
import { NextPageWithLayout } from '~/pages/_app';

const SearchAdminPage: NextPageWithLayout = () => {
  return <span>Hola</span>;
};

SearchAdminPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default SearchAdminPage;
