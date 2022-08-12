import { Prisma } from '@prisma/client';
import { prisma } from '~/server/prisma';
import { TRPCError } from '@trpc/server';
import { createRouter } from '~/server/createRouter';
import { z } from 'zod';

const defaultTechnologySelect = Prisma.validator<Prisma.TechnologySelect>()({
  id: true,
  name: true,
});

export const technologyRouter = createRouter()
  .query('all', {
    async resolve() {
      return prisma.technology.findMany({
        select: defaultTechnologySelect,
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
  });
