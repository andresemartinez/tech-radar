import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import { privateProcedure, router } from '~/server/trpc';

export const techStatsRouter = router({
  percentage: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { id } = input;

      const techSkillsQuery = prisma.techSkill.findMany({
        select: {
          professionalId: true,
          level: {
            select: {
              name: true,
              weight: true,
            },
          },
          technology: {
            select: {
              name: true,
            },
          },
        },
        where: {
          technologyId: id,
          current: true,
        },
      });

      const professionalsQuery = prisma.professional.aggregate({
        _count: {
          active: true,
        },
      });

      const [techSkills, professionals] = await Promise.all([
        techSkillsQuery,
        professionalsQuery,
      ]);

      const skilledProfessionals = techSkills
        .map((techSkill) => techSkill.professionalId)
        .reduce<string[]>((acc, item) => {
          if (!acc.includes(item)) {
            acc.push(item);
          }

          return acc;
        }, []).length;

      return {
        totalProfessionals: professionals._count.active,
        skilledProfessionals: skilledProfessionals,
        skillPercentage:
          (skilledProfessionals / professionals._count.active) * 100,
      };
    }),

  level: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { id } = input;

      const techSkills = await prisma.techSkill.findMany({
        select: {
          level: {
            select: {
              weight: true,
            },
          },
        },
        where: {
          technologyId: id,
          current: true,
        },
      });

      const weight =
        techSkills
          .map((techSkill) => techSkill.level.weight)
          .reduce((acc, item) => acc + item, 0) / techSkills.length;

      const techSkillLevels = await prisma.techSkillLevel.findMany({
        select: {
          name: true,
          weight: true,
        },
        where: {
          active: true,
        },
      });

      const name = techSkillLevels.reduce((acc, item) => {
        let techSkillLabel;

        const accDiff = Math.abs(acc.weight - weight);
        const itemDiff = Math.abs(item.weight - weight);

        if (accDiff === itemDiff) {
          if (acc.weight >= item.weight) {
            techSkillLabel = acc;
          } else {
            techSkillLabel = item;
          }
        } else if (accDiff > itemDiff) {
          techSkillLabel = item;
        } else {
          techSkillLabel = acc;
        }

        return techSkillLabel;
      }).name;

      const maxWeight = techSkillLevels
        .map((techSkillLevel) => techSkillLevel.weight)
        .reduce((acc, item) => (acc > item ? acc : item));

      return {
        weight,
        maxWeight,
        name,
      };
    }),

  chart: router({
    trend: privateProcedure
      .input(
        z.object({
          techId: z.string().uuid(),
        }),
      )
      .query(async ({ input }) => {
        const { techId } = input;

        const tech = await prisma.technology.findUnique({
          select: {
            name: true,
          },
          where: { id: techId },
        });

        if (!tech) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `No technology with id ${techId}`,
          });
        }

        const techSkills = await prisma.techSkill.findMany({
          select: {
            creationDateTime: true,
            level: {
              select: {
                weight: true,
              },
            },
          },
          where: {
            technologyId: techId,
          },
          orderBy: {
            creationDateTime: 'asc',
          },
        });

        const datasets = [
          {
            label: tech.name,
            data: techSkills.map((techSkill) => ({
              x: techSkill.creationDateTime,
              y: techSkill.level.weight,
            })),
            fill: false,
          },
        ];

        return {
          data: { datasets },
          options: {
            scales: {
              x: {
                type: 'time',
                ticks: {
                  source: 'auto',
                },
                time: {
                  minUnit: 'minute',

                  displayFormats: {
                    minute: 'HH:mm',
                    hour: 'dd/MM HH:mm',
                    day: 'dd/MM',
                    week: 'dd/MM',
                    month: 'MMMM yyyy',
                    quarter: 'MMMM yyyy',
                    year: 'yyyy',
                  },
                },
              },
            },
          },
        };
      }),
  }),
});
