import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import { publicProcedure, router } from '~/server/trpc';

const defaultTechnologySelect = Prisma.validator<Prisma.TechnologySelect>()({
  id: true,
  name: true,
  description: true,
});

export const technologyRouter = router({
  all: publicProcedure.query(async () => {
    return prisma.technology.findMany({
      select: defaultTechnologySelect,
      where: {
        active: true,
      },
    });
  }),

  byId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { id } = input;
      const techSkillLevel = await prisma.technology.findUnique({
        where: { id },
        select: defaultTechnologySelect,
      });
      if (!techSkillLevel) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No technology with id '${id}'`,
        });
      }
      return techSkillLevel;
    }),

  edit: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: z.object({
          name: z.string().trim().min(1).optional(),
          description: z.string().trim().min(1).optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, data } = input;
      return await prisma.technology.update({
        where: { id },
        data,
        select: defaultTechnologySelect,
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        data: z.object({
          name: z.string().trim().min(1),
          description: z.string().trim().min(1),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { data } = input;
      return await prisma.technology.create({
        data,
        select: defaultTechnologySelect,
      });
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id } = input;
      return await prisma.technology.update({
        where: { id },
        data: {
          active: false,
        },
        select: defaultTechnologySelect,
      });
    }),
});
