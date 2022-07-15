import { NextPageWithLayout } from '~/pages/_app';
import { trpc } from '~/utils/trpc';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { TextField } from '@mui/material';

const ProfessionalAdminPage: NextPageWithLayout = () => {
  const router = useRouter();
  const id = useMemo(
    () => (typeof router.query.id === 'string' ? router.query.id : ''),
    [router.query.id],
  );
  const { data: professional } = trpc.useQuery(['professional.byId', { id }]);

  // return professional.isSuccess ? (
  //   <span>{JSON.stringify(professional.data)}</span>
  // ) : (
  //   <span>{JSON.stringify(professional.error?.message)}</span>
  // );

  return (
    <form>
      <TextField
        id="first-name"
        name="firstName"
        label="Nombre"
        variant="outlined"
        required
        value={professional?.firstName}
      ></TextField>
      <TextField
        id="last-name"
        name="lastName"
        label="Apellido"
        variant="outlined"
        required
        value={professional?.lastName}
      ></TextField>
      <TextField
        id="email"
        name="email"
        label="Email"
        variant="outlined"
        type="email"
        required
        value={professional?.email}
      ></TextField>
    </form>
  );
};

export default ProfessionalAdminPage;
