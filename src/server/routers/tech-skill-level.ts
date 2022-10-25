import { Prisma } from '@prisma/client';
import { prisma } from '~/server/prisma';
import { TRPCError } from '@trpc/server';
import { createRouter } from '~/server/createRouter';
import { z } from 'zod';

const defaultTechSkillLevelSelect =
  Prisma.validator<Prisma.TechSkillLevelSelect>()({
    id: true,
    name: true,
    weight: true,
  });

export const techSkillLevelRouter = createRouter()
  .query('all', {
    async resolve() {
      return prisma.techSkillLevel.findMany({
        select: defaultTechSkillLevelSelect,
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
      const techSkillLevel = await prisma.techSkillLevel.findUnique({
        where: { id },
        select: defaultTechSkillLevelSelect,
      });
      if (!techSkillLevel) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No tech skill level with id '${id}'`,
        });
      }
      return techSkillLevel;
    },
  })
  .mutation('edit', {
    input: z.object({
      id: z.string().uuid(),
      data: z.object({
        name: z.string().trim().min(1).optional(),
        weight: z.number().min(0).optional(),
      }),
    }),
    async resolve({ input }) {
      const { id, data } = input;
      return await prisma.techSkillLevel.update({
        where: { id },
        data,
        select: defaultTechSkillLevelSelect,
      });
    },
  })
  .mutation('create', {
    input: z.object({
      data: z.object({
        name: z.string().trim().min(1),
        weight: z.number().min(0),
      }),
    }),
    async resolve({ input }) {
      const { data } = input;
      return await prisma.techSkillLevel.create({
        data,
        select: defaultTechSkillLevelSelect,
      });
    },
  })
  .mutation('delete', {
    input: z.object({
      id: z.string().uuid(),
    }),
    async resolve({ input }) {
      const { id } = input;
      return await prisma.techSkillLevel.update({
        where: { id },
        data: {
          active: false,
        },
        select: defaultTechSkillLevelSelect,
      });
    },
  });
