import { Role } from '@prisma/client';
import { TRPCError } from '@trpc/server';
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
        role: true,
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

  admin: router({
    edit: adminProcedure
      .input(
        z.object({
          id: z.string(),
          data: z.object({
            name: z.string().optional(),
            role: z.nativeEnum(Role),
          }),
        }),
      )
      .mutation(async ({ input, ctx }) => {
        const { id, data } = input;
        const { user: loggedUser } = ctx;

        const editedUser = await prisma.user.findUnique({
          select: {
            role: true,
          },
          where: {
            id,
          },
        });

        if (editedUser === null) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `No user with id ${id}`,
          });
        }

        if (
          loggedUser.role !== Role.superadmin &&
          editedUser.role === Role.superadmin
        ) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You are not authorized',
          });
        }

        await prisma.user.update({
          where: { id },
          data,
        });
      }),
  }),
});
