import { Prisma } from '@prisma/client';
import { createRouter } from '~/server/createRouter';
import { prisma } from '~/server/prisma';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

const defaultProfessionalSelect = Prisma.validator<Prisma.ProfessionalSelect>()(
  {
    id: true,
    techSkills: {
      select: {
        id: true,
        creationDateTime: true,
        lastUpdateDateTime: true,
        level: true,
        levelId: true,
        technology: true,
        professional: true,
      },
    },
  },
);

export const professionalRouter = createRouter()
  .query('all', {
    async resolve() {
      return prisma.professional.findMany({
        select: defaultProfessionalSelect,
      });
    },
  })
  .query('byId', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
      const { id } = input;
      const professional = await prisma.professional.findUnique({
        where: { id },
        select: defaultProfessionalSelect,
      });

      if (!professional) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No professional with id '${id}'`,
        });
      }
      return professional;
    },
  })
  .query('byUserId', {
    input: z.object({
      userId: z.string(),
    }),
    async resolve({ input }) {
      const { userId } = input;
      const professional = await prisma.professional.findUnique({
        where: { userId },
        select: defaultProfessionalSelect,
      });

      if (!professional) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No professional for user '${userId}'`,
        });
      }
      return professional;
    },
  });
