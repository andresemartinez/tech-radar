import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import NextError from 'next/error';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { AdminLayout } from '~/components/admin/AdminLayout';
import TechnologySkillLevelForm from '~/components/TechnologySkillLevelForm';
import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';

const TechnologySkillLevelAdminPage: NextPageWithLayout = () => {
  const router = useRouter();
  const id = useMemo(
    () => (typeof router.query.id === 'string' ? router.query.id : ''),
    [router.query.id],
  );
  const trpcUtils = trpc.useContext();
  const {
    data: skillLevel,
    status,
    error,
  } = trpc.techSkillLevel.byId.useQuery({ id });

  const editTechnologySkillLevel = trpc.techSkillLevel.edit.useMutation({
    async onSuccess() {
      await trpcUtils.techSkillLevel.byId.invalidate();
    },
  });

  if (status === 'success' && skillLevel) {
    return (
      <TechnologySkillLevelForm
        technologySkillLevel={skillLevel}
        onEdit={(editedSkillLevel) =>
          editTechnologySkillLevel.mutateAsync({
            id: editedSkillLevel.id,
            data: {
              name: editedSkillLevel.name,
              weight: editedSkillLevel.weight,
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

TechnologySkillLevelAdminPage.getLayout = (page) => (
  <AdminLayout>{page}</AdminLayout>
);

export default TechnologySkillLevelAdminPage;
