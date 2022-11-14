import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import { privateProcedure, router } from '~/server/trpc';
import { TechRadarAxisType } from '@prisma/client';

export const techRadarRouter = router({
  byId: privateProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const { user } = ctx;

      const techRadar = await prisma.techRadar.findUnique({
        select: {
          name: true,
          owner: {
            select: {
              id: true,
              userId: true,
            },
          },
          angularAxis: true,
          radialAxis: true,
          professionals: {
            select: {
              id: true,
              userId: true,
            },
            where: {
              active: true,
            },
          },
          technologies: {
            select: {
              id: true,
              name: true,
            },
            where: {
              active: true,
            },
          },
          techCategories: {
            select: {
              id: true,
              name: true,
            },
            where: {
              active: true,
            },
          },
        },
        where: {
          id,
        },
      });

      if (techRadar === null) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `No tech radar with id ${id}`,
        });
      }

      if (techRadar.owner.userId !== user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not authorized',
        });
      }

      return techRadar;
    }),
  create: privateProcedure
    .input(
      z.object({
        data: z.object({
          name: z.string().min(1),
          owner: z.string().uuid(),
          angularAxis: z.nativeEnum(TechRadarAxisType),
          radialAxis: z.nativeEnum(TechRadarAxisType),
          professionals: z.array(z.string().uuid()),
          technologies: z.array(z.string().uuid()),
          techCategories: z.array(z.string().uuid()),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { data } = input;
      await prisma.techRadar.create({
        data: {
          ...data,
          owner: {
            connect: {
              id: data.owner,
            },
          },
          professionals: {
            connect: data.professionals.map((professional) => ({
              id: professional,
            })),
          },
          technologies: {
            connect: data.technologies.map((technology) => ({
              id: technology,
            })),
          },
          techCategories: {
            connect: data.techCategories.map((techCategory) => ({
              id: techCategory,
            })),
          },
        },
      });
    }),
});
