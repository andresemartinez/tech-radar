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
  } = trpc.useQuery(['technology.byId', { id }]);

  const editTechnology = trpc.useMutation('technology.edit', {
    async onSuccess() {
      await trpcUtils.invalidateQueries(['technology.byId']);
    },
  });

  if (status === 'success' && technology) {
    return (
      <TechnologyForm
        technology={technology}
        onEdit={(editedTech) =>
          editTechnology.mutateAsync({
            id: editedTech.id,
            data: { name: editedTech.name },
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
