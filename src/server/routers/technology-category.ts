import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import { privateProcedure, router } from '~/server/trpc';

const defaultTechnologyCategorySelect =
  Prisma.validator<Prisma.TechnologyCategorySelect>()({
    id: true,
    name: true,
  });

export const technologyCategoryRouter = router({
  all: privateProcedure.query(async () => {
    return prisma.technologyCategory.findMany({
      select: defaultTechnologyCategorySelect,
      where: { active: true },
    });
  }),

  byId: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { id } = input;
      const technologyCategory = await prisma.technologyCategory.findUnique({
        where: { id },
        select: defaultTechnologyCategorySelect,
      });
      if (!technologyCategory) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No technology category with id '${id}'`,
        });
      }
      return technologyCategory;
    }),

  edit: privateProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: z.object({
          name: z.string().trim().min(1),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, data } = input;
      return await prisma.technologyCategory.update({
        where: { id },
        data,
        select: defaultTechnologyCategorySelect,
      });
    }),

  create: privateProcedure
    .input(
      z.object({
        data: z.object({
          name: z.string().trim().min(1),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { data } = input;
      return await prisma.technologyCategory.create({
        data,
        select: defaultTechnologyCategorySelect,
      });
    }),

  delete: privateProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id } = input;
      return await prisma.technologyCategory.update({
        where: { id },
        data: {
          active: false,
        },
        select: defaultTechnologyCategorySelect,
      });
    }),
});
