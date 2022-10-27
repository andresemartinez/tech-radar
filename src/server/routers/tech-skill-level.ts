import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import { publicProcedure, router } from '~/server/trpc';

const defaultTechSkillLevelSelect =
  Prisma.validator<Prisma.TechSkillLevelSelect>()({
    id: true,
    name: true,
    weight: true,
  });

export const techSkillLevelRouter = router({
  all: publicProcedure.query(async () =>
    prisma.techSkillLevel.findMany({
      select: defaultTechSkillLevelSelect,
      where: { active: true },
      orderBy: { weight: 'asc' },
    }),
  ),

  byId: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
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
    }),

  edit: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: z.object({
          name: z.string().trim().min(1).optional(),
          weight: z.number().gte(0).optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, data } = input;
      return await prisma.techSkillLevel.update({
        where: { id },
        data,
        select: defaultTechSkillLevelSelect,
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        data: z.object({
          name: z.string().trim().min(1),
          weight: z.number().gte(0),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { data } = input;
      return await prisma.techSkillLevel.create({
        data,
        select: defaultTechSkillLevelSelect,
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
      return await prisma.techSkillLevel.update({
        where: { id },
        data: {
          active: false,
        },
        select: defaultTechSkillLevelSelect,
      });
    }),
});
