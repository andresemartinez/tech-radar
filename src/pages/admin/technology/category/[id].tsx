import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import TechnologyCategoryForm from '~/components/TechnologyCategoryForm';
import NextError from 'next/error';

const TechnologyCategoryAdminPage: NextPageWithLayout = () => {
  const router = useRouter();
  const id = useMemo(
    () => (typeof router.query.id === 'string' ? router.query.id : ''),
    [router.query.id],
  );
  const trpcUtils = trpc.useContext();
  const {
    data: technologyCategory,
    status,
    error,
  } = trpc.useQuery(['technology-category.byId', { id }]);

  const editTechnologyCategory = trpc.useMutation('technology-category.edit', {
    async onSuccess() {
      await trpcUtils.invalidateQueries(['technology-category.byId']);
    },
  });

  if (status === 'success' && technologyCategory) {
    return (
      <TechnologyCategoryForm
        technologyCategory={technologyCategory}
        onEdit={(editedTechCat) =>
          editTechnologyCategory.mutateAsync({
            id: editedTechCat.id,
            data: { name: editedTechCat.name },
          })
        }
      />
    );
  } else if (status === 'error' && error) {
    return (
      <NextError
        title={error.message}
        statusCode={error.data?.httpStatus ?? 500}
      />
    );
  } else {
    return null;
  }
};

export default TechnologyCategoryAdminPage;
