import { Prisma } from '@prisma/client';
import { createRouter } from '~/server/createRouter';
import { prisma } from '~/server/prisma';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

const defaultTechnologyCategorySelect =
  Prisma.validator<Prisma.TechnologyCategorySelect>()({
    id: true,
    name: true,
  });

export const technologyCategoryRouter = createRouter()
  .query('all', {
    async resolve() {
      return prisma.technologyCategory.findMany({
        select: defaultTechnologyCategorySelect,
        where: { active: true },
      });
    },
  })
  .query('byId', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
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
    },
  })
  .mutation('edit', {
    input: z.object({
      id: z.string().uuid(),
      data: z.object({
        name: z.string().trim().min(1),
      }),
    }),
    async resolve({ input }) {
      const { id, data } = input;
      return await prisma.technologyCategory.update({
        where: { id },
        data,
        select: defaultTechnologyCategorySelect,
      });
    },
  })
  .mutation('create', {
    input: z.object({
      data: z.object({
        name: z.string().trim().min(1),
      }),
    }),
    async resolve({ input }) {
      const { data } = input;
      return await prisma.technologyCategory.create({
        data,
        select: defaultTechnologyCategorySelect,
      });
    },
  })
  .mutation('delete', {
    input: z.object({
      id: z.string().uuid(),
    }),
    async resolve({ input }) {
      const { id } = input;
      return await prisma.technologyCategory.update({
        where: { id },
        data: {
          active: false,
        },
        select: defaultTechnologyCategorySelect,
      });
    },
  });
