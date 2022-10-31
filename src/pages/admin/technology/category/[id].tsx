import NextError from 'next/error';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { AdminLayout } from '~/components/admin/AdminLayout';
import TechnologyCategoryForm from '~/components/TechnologyCategoryForm';
import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';

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
  } = trpc.techCategory.byId.useQuery({ id });

  const editTechnologyCategory = trpc.techCategory.edit.useMutation({
    async onSuccess() {
      await trpcUtils.techCategory.byId.invalidate();
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

TechnologyCategoryAdminPage.getLayout = (page) => (
  <AdminLayout>{page}</AdminLayout>
);

export default TechnologyCategoryAdminPage;
