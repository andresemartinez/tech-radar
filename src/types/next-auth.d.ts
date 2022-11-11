import { Role } from '@prisma/client';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: {
      id?: string | null;
      role?: Role | null;
      enabled?: boolean | null;
    } & DefaultSession['user'];
  }

  interface User {
    role: Role;
    enabled: boolean;
  }
}
