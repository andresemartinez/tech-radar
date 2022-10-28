import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import { privateProcedure, router } from '~/server/trpc';

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

export const techSkillRouter = router({
  byId: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
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
    }),

  delete: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id } = input;

      await prisma.techSkill.update({
        where: { id },
        data: { current: false },
      });
    }),

  edit: privateProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          levelId: z.string(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, data } = input;

      const newLevelId = data.levelId;

      const techSkill = await prisma.techSkill.findUnique({
        select: {
          id: true,
          levelId: true,
          technologyId: true,
          professionalId: true,
          current: true,
        },
        where: { id },
      });

      if (!techSkill) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No tech skill with id '${id}'`,
        });
      }

      if (!techSkill.current) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot edit a tech skill that is not current '${id}'`,
        });
      }

      await prisma.techSkill.update({
        where: { id },
        data: { current: false },
      });

      await prisma.techSkill.create({
        data: {
          levelId: newLevelId,
          technologyId: techSkill.technologyId,
          professionalId: techSkill.professionalId,
        },
      });
    }),
});
