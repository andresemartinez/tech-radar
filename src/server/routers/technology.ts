import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import { privateProcedure, router } from '~/server/trpc';

const defaultTechnologySelect = Prisma.validator<Prisma.TechnologySelect>()({
  id: true,
  name: true,
  description: true,
  categories: {
    select: {
      id: true,
      name: true,
    },
  },
});

export const technologyRouter = router({
  all: privateProcedure.query(async () => {
    return prisma.technology.findMany({
      select: defaultTechnologySelect,
      where: {
        active: true,
      },
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

  edit: privateProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: z.object({
          name: z.string().trim().min(1).optional(),
          description: z.string().trim().min(1).optional(),
          categories: z.array(z.string().trim().uuid()),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, data } = input;

      const technology = await prisma.technology.findUnique({
        select: {
          categories: {
            select: {
              id: true,
            },
          },
        },
        where: { id },
      });

      const currentCategories =
        technology?.categories?.map((category) => category.id) ?? [];
      const newCategories = data.categories;

      const categoriesToAdd = newCategories.filter(
        (newCategory) => !currentCategories.includes(newCategory),
      );
      const categoriesToDelete = currentCategories.filter(
        (currentCategory) => !newCategories.includes(currentCategory),
      );

      return await prisma.technology.update({
        where: { id },
        data: {
          ...data,
          categories: {
            connect: categoriesToAdd.map((category) => ({ id: category })),
            disconnect: categoriesToDelete.map((category) => ({
              id: category,
            })),
          },
        },
        select: defaultTechnologySelect,
      });
    }),

  create: privateProcedure
    .input(
      z.object({
        data: z.object({
          name: z.string().trim().min(1),
          description: z.string().trim().min(1),
          categories: z.array(z.string().trim().uuid()),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { data } = input;
      return await prisma.technology.create({
        data: {
          ...data,
          categories: {
            connect: data.categories.map((category) => ({ id: category })),
          },
        },
        select: defaultTechnologySelect,
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
      return await prisma.technology.update({
        where: { id },
        data: {
          active: false,
        },
        select: defaultTechnologySelect,
      });
    }),
});
