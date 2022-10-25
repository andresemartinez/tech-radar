import Link from 'next/link';
import { AdminLayout } from '~/components/admin/AdminLayout';
import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';

const TechnologyAdminPage: NextPageWithLayout = () => {
  const { data: technologies } = trpc.useQuery(['technology.all']);

  return (
    <div className="flex flex-col">
      {technologies?.map((technology) => (
        <Link
          key={technology.id}
          href={{
            pathname: '/admin/technology/[id]',
            query: { id: technology.id },
          }}
        >
          <a>{technology.name}</a>
        </Link>
      ))}
    </div>
  );
};

TechnologyAdminPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default TechnologyAdminPage;
