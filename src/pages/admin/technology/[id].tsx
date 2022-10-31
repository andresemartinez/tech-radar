import NextError from 'next/error';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { AdminLayout } from '~/components/admin/AdminLayout';
import TechnologyForm from '~/components/TechnologyForm';
import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';

const TechnologyAdminPage: NextPageWithLayout = () => {
  const router = useRouter();
  const id = useMemo(
    () => (typeof router.query.id === 'string' ? router.query.id : ''),
    [router.query.id],
  );
  const trpcUtils = trpc.useContext();
  const {
    data: technology,
    status,
    error,
  } = trpc.technology.byId.useQuery({ id });

  const { data: categories } = trpc.technologyCategory.all.useQuery();

  const editTechnology = trpc.technology.edit.useMutation({
    async onSuccess() {
      await trpcUtils.technology.byId.invalidate();
    },
  });

  if (status === 'success' && technology) {
    return (
      <TechnologyForm
        technology={technology}
        categories={categories ?? []}
        onEdit={(editedTech) =>
          editTechnology.mutateAsync({
            id: editedTech.id,
            data: {
              name: editedTech.name,
              description: editedTech.description,
              categories: editedTech.categories,
            },
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

TechnologyAdminPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default TechnologyAdminPage;
