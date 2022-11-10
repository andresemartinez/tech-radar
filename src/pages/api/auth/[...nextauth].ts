import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '~/server/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    session: ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  events: {
    createUser: async ({ user }) => {
      console.info(
        `Creating professional based on user ${JSON.stringify(user)}`,
      );

      const professional = await prisma.professional.create({
        data: {
          userId: user.id,
        },
      });

      console.info(
        `Successfully created professional ${JSON.stringify(
          professional,
        )} based on user ${JSON.stringify(user)}`,
      );
    },
  },
};

export default NextAuth(authOptions);
