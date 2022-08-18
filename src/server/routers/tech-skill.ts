import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createRouter } from '~/server/createRouter';
import { prisma } from '~/server/prisma';

const defaultTechSkillSelect = Prisma.validator<Prisma.TechSkillSelect>()({
  id: true,
  technology: {
    select: {
      id: true,
      name: true,
    },
  },
  level: {
    select: {
      id: true,
      name: true,
    },
  },
});

export const techSkillRouter = createRouter()
  .query('byId', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      const { id } = input;
      const techSkill = await prisma.techSkill.findUnique({
        where: { id },
        select: defaultTechSkillSelect,
      });
      if (!techSkill) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No tech skill with id '${id}'`,
        });
      }
      return techSkill;
    },
  })
  .mutation('delete', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      const { id } = input;

      await prisma.techSkill.delete({
        where: { id },
      });
    },
  })
  .mutation('edit', {
    input: z.object({
      id: z.string(),
      data: z.object({
        levelId: z.string(),
      }),
    }),
    async resolve({ input }) {
      const { id, data } = input;

      await prisma.techSkill.update({
        where: { id },
        data,
      });
    },
  });
