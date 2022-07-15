import { signIn } from 'next-auth/react';
import { Button } from '@mui/material';
import React from 'react';

const LoginButton = () => {
  return <Button onClick={() => signIn('google')}>Iniciar sesión</Button>;
};

export default LoginButton;
