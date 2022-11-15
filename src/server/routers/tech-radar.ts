import {
  TechRadarAngularAxisType,
  TechRadarRadialAxisType,
} from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import { privateProcedure, router } from '~/server/trpc';

export const techRadarRouter = router({
  all: privateProcedure.query(async () => {
    const techRadars = await prisma.techRadar.findMany({
      select: {
        id: true,
        name: true,
        owner: {
          select: {
            id: true,
            userId: true,
          },
        },
      },
      where: {
        active: true,
      },
    });

    return Promise.all(
      techRadars.map(async (techRadar) => {
        const user = await prisma.user.findUnique({
          select: { name: true },
          where: { id: techRadar.owner.userId },
        });

        if (user === null) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong',
          });
        }

        return {
          ...techRadar,
          owner: user.name,
        };
      }),
    );
  }),
  byId: privateProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .query(async ({ input }) => {
      const { id } = input;

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

      return techRadar;
    }),
  create: privateProcedure
    .input(
      z.object({
        data: z.object({
          name: z.string().min(1),
          owner: z.string().uuid(),
          angularAxis: z.nativeEnum(TechRadarAngularAxisType),
          radialAxis: z.nativeEnum(TechRadarRadialAxisType),
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
  delete: privateProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id } = input;
      await prisma.techRadar.update({
        data: {
          active: false,
        },
        where: {
          id,
        },
      });
    }),
});
