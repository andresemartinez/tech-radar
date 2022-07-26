import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';
import Link from 'next/link';

const TechnologyCategoriesAdminPage: NextPageWithLayout = () => {
  const { data: technologyCategories } = trpc.useQuery([
    'technology-category.all',
  ]);

  return (
    <div>
      {technologyCategories?.map((technologyCategory) => (
        <Link
          key={technologyCategory.id}
          href={{
            pathname: '/admin/technology/category/[id]',
            query: { id: technologyCategory.id },
          }}
        >
          <a>{technologyCategory.name}</a>
        </Link>
      ))}
    </div>
  );
};

export default TechnologyCategoriesAdminPage;
