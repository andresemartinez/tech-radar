import {
  Person as PersonIcon,
  PersonOff as PersonOffIcon,
} from '@mui/icons-material';
import { Button, IconButton, Tooltip } from '@mui/material';
import { Role } from '@prisma/client';
import { GetStaticProps } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AdminLayout } from '~/components/admin/AdminLayout';
import Autocomplete from '~/components/form/Autocomplete';
import TextInput from '~/components/form/TextInput';
import Modal from '~/components/Modal';
import { NextPageWithLayout } from '~/pages/_app';
import { RouterOutput, trpc } from '~/utils/trpc';

type User = RouterOutput['user']['all'][number];

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
    <>
      <div className="flex flex-col">
        <div className="flex flex-row">
          <UserTableCell>
            <span>Name</span>
          </UserTableCell>
          <UserTableCell>
            <span>E-Mail</span>
          </UserTableCell>
          <UserTableCell>
            <span>Rol</span>
          </UserTableCell>
          <UserTableCell>
            <span>State</span>
          </UserTableCell>
        </div>
        {users?.map((user) => (
          <UserTableRow
            key={user.id}
            user={user}
            onEnableClick={() => enableUser.mutateAsync({ id: user.id })}
            onDisableClick={() => disableUser.mutateAsync({ id: user.id })}
          />
        ))}
      </div>
    </>
  );
};

type UserTableRowProps = {
  user: User;
  onEnableClick: () => void;
  onDisableClick: () => void;
};

const UserTableRow = ({
  user,
  onEnableClick,
  onDisableClick,
}: UserTableRowProps) => {
  const trpcUtils = trpc.useContext();
  const [modalOpen, setModalOpen] = useState(false);

  const editUserInfo = trpc.user.admin.edit.useMutation({
    async onSuccess() {
      trpcUtils.user.all.invalidate();
    },
  });

  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: user.name,
      role: user.role,
    },
  });

  return (
    <>
      <div className="flex flex-row" onClick={() => setModalOpen(true)}>
        <UserTableCell>
          <span>{user.name}</span>
        </UserTableCell>
        <UserTableCell>
          <span>{user.email}</span>
        </UserTableCell>
        <UserTableCell>
          <span>{user.role}</span>
        </UserTableCell>
        <UserTableCell>
          {user.enabled ? (
            <Tooltip title="Disable user" placement="top">
              <IconButton onClick={onDisableClick}>
                <PersonOffIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Enable user" placement="top">
              <IconButton onClick={onEnableClick}>
                <PersonIcon />
              </IconButton>
            </Tooltip>
          )}
        </UserTableCell>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="w-[600px] px-[20px] py-[40px]">
          <form
            onSubmit={handleSubmit((data) => {
              editUserInfo.mutateAsync({
                id: user.id,
                data: { name: data.name, role: data.role },
              });
            })}
          >
            <div className="flex flex-row flex-grow">
              <div className="pr-2">
                <TextInput name="name" control={control} required />
              </div>

              <div className="pl-2 flex-grow">
                <Autocomplete
                  name="role"
                  label="Role"
                  control={control}
                  required
                  options={Object.values(Role)}
                  getOptionLabel={(option) =>
                    `${option.substring(0, 1).toUpperCase()}${option.substring(
                      1,
                    )}`
                  }
                  isOptionEqualToValue={(option, value) => option === value}
                />
              </div>
            </div>

            <div className="flex justify-between pt-5">
              <div>
                {user.enabled ? (
                  <Button color="error" onClick={onDisableClick}>
                    Disable
                  </Button>
                ) : (
                  <Button color="success" onClick={onEnableClick}>
                    Enable
                  </Button>
                )}
              </div>

              <div className="flex justify-end">
                <Button className="pr-3" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

type UserTableCellProps = {
  children: React.ReactNode;
};

const UserTableCell = ({ children }: UserTableCellProps) => {
  return <div className="px-3 flex flex-row items-center">{children}</div>;
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
