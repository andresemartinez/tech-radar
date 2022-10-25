import { Prisma } from '@prisma/client';
import { prisma } from '~/server/prisma';
import { TRPCError } from '@trpc/server';
import { createRouter } from '~/server/createRouter';
import { z } from 'zod';

const defaultTechnologySelect = Prisma.validator<Prisma.TechnologySelect>()({
  id: true,
  name: true,
  description: true,
});

export const technologyRouter = createRouter()
  .query('all', {
    async resolve() {
      return prisma.technology.findMany({
        select: defaultTechnologySelect,
        where: {
          active: true,
        },
      });
    },
  })
  .query('byId', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
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
      return await prisma.technology.update({
        where: { id },
        data,
        select: defaultTechnologySelect,
      });
    },
  })
  .mutation('create', {
    input: z.object({
      data: z.object({
        name: z.string().trim().min(1),
        description: z.string().trim().min(1),
      }),
    }),
    async resolve({ input }) {
      const { data } = input;
      return await prisma.technology.create({
        data,
        select: defaultTechnologySelect,
      });
    },
  })
  .mutation('delete', {
    input: z.object({
      id: z.string().uuid(),
    }),
    async resolve({ input }) {
      const { id } = input;
      return await prisma.technology.update({
        where: { id },
        data: {
          active: false,
        },
        select: defaultTechnologySelect,
      });
    },
  });
