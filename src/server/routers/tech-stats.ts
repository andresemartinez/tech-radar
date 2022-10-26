import { z } from 'zod';
import { createRouter } from '~/server/createRouter';
import { prisma } from '~/server/prisma';

export const techStatsRouter = createRouter()
  .query('percentage', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
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
    },
  })
  .query('level', {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input }) {
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
    },
  });
