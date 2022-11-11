import { z } from 'zod';
import { prisma } from '~/server/prisma';
import { adminProcedure, privateProcedure, router } from '~/server/trpc';

export const userRouter = router({
  all: adminProcedure.query(() =>
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        enabled: true,
      },
    }),
  ),
  disable: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id } = input;
      await prisma.user.update({
        data: {
          enabled: false,
        },
        where: {
          id,
        },
      });
    }),
  enable: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id } = input;
      await prisma.user.update({
        data: {
          enabled: true,
        },
        where: {
          id,
        },
      });
    }),
  edit: privateProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, data } = input;

      await prisma.user.update({
        where: { id },
        data,
      });
    }),
});
