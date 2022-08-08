import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { AdminLayout } from '~/components/admin/AdminLayout';
import { NextPageWithLayout } from '~/pages/_app';

const ProfessionalAdminPage: NextPageWithLayout = () => {
  // const router = useRouter();
  // const id = useMemo(
  //   () => (typeof router.query.id === 'string' ? router.query.id : ''),
  //   [router.query.id],
  // );
  const { data: session } = useSession();
  // const { data: professional } = trpc.useQuery([
  //   'professional.byUserId',
  //   { id },
  // ]);

  const user = useMemo(() => session?.user, [session?.user]);

  return <>{user && <UserInfo name={user.name} email={user.email} />}</>;
};

type UserInfoProps = {
  name?: string | null;
  email?: string | null;
};

const UserInfo = ({ name, email }: UserInfoProps) => {
  return (
    <div className="flex flex-col">
      <div className="pb-3">
        <span className="font-bold">Name: </span>
        <span>{name}</span>
      </div>
      <div className="pb-3">
        <span className="font-bold">E-mail: </span>
        <span>{email}</span>
      </div>
    </div>
  );
};

ProfessionalAdminPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default ProfessionalAdminPage;
