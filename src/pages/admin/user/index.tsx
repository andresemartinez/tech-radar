import {
  Person as PersonIcon,
  PersonOff as PersonOffIcon,
} from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AdminLayout } from '~/components/admin/AdminLayout';
import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';

const UsersAdminPage: NextPageWithLayout = () => {
  const trpcUtils = trpc.useContext();

  const { data: users } = trpc.user.all.useQuery();

  const disableUser = trpc.user.disable.useMutation({
    async onSuccess() {
      trpcUtils.user.all.invalidate();
    },
  });

  const enableUser = trpc.user.enable.useMutation({
    async onSuccess() {
      trpcUtils.user.all.invalidate();
    },
  });

  return (
    <div className="flex flex-column">
      {users?.map((user) => (
        <div key={user.id} className="flex flex-row">
          <div className="px-3 flex flex-row items-center">
            <span>{user.name}</span>
          </div>
          <div className="px-3 flex flex-row items-center">
            <span>{user.email}</span>
          </div>
          <div className="px-3 flex flex-row items-center">
            <Tooltip
              title={user.enabled ? 'Disable' : 'Enable'}
              placement="top"
            >
              <IconButton
                onClick={() => {
                  user.enabled
                    ? disableUser.mutateAsync({ id: user.id })
                    : enableUser.mutateAsync({ id: user.id });
                }}
              >
                {user.enabled ? <PersonOffIcon /> : <PersonIcon />}
              </IconButton>
            </Tooltip>
          </div>
        </div>
      ))}
    </div>
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

UsersAdminPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default UsersAdminPage;
