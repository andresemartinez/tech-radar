import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '~/server/prisma';
import { privateProcedure, router } from '~/server/trpc';

export const OperationKey = z.enum(['gte', 'lte', 'eq']);
export type OperationKey = z.infer<typeof OperationKey>;

const operations: {
  [key in OperationKey]: (w1: number, w2: number) => boolean;
} = {
  gte: (w1: number, w2: number) => w1 >= w2,
  lte: (w1: number, w2: number) => w1 <= w2,
  eq: (w1: number, w2: number) => w1 === w2,
};

const operationFor = (operator: keyof typeof operations) => {
  return operations[operator];
};

const defaultProfessionalSelect = Prisma.validator<Prisma.ProfessionalSelect>()(
  {
    id: true,
    techSkills: {
      select: {
        id: true,
        creationDateTime: true,
        lastUpdateDateTime: true,
        level: {
          select: {
            id: true,
            name: true,
          },
        },
        technology: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        technology: {
          name: 'asc',
        },
      },
      where: {
        current: true,
      },
    },
  },
);

export const professionalRouter = router({
  byId: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
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
    }),

  byUserId: privateProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ input }) => {
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
    }),

  search: privateProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        techSkills: z.array(
          z.object({
            techId: z.string().uuid(),
            levelWeight: z.number().gte(0),
            levelOperator: OperationKey,
          }),
        ),
      }),
    )
    .query(async ({ input }) => {
      const { techSkills: techSkillsQuery } = input;

      const techSkillsIdsQuery = techSkillsQuery.map(
        (techSkill) => techSkill.techId,
      );

      const queryByTechId = techSkillsQuery.reduce<
        Map<string, { levelWeight: number; levelOperator: OperationKey }>
      >((acc, item) => {
        acc.set(item.techId, {
          levelWeight: item.levelWeight,
          levelOperator: item.levelOperator,
        });
        return acc;
      }, new Map());

      const techSkillsByIds = await prisma.techSkill.findMany({
        select: {
          id: true,
          technologyId: true,
          level: {
            select: {
              weight: true,
            },
          },
          professionalId: true,
        },
        where: {
          technologyId: {
            in: techSkillsIdsQuery,
          },
          current: true,
        },
      });

      const techSkillsByProfessional = techSkillsByIds.reduce<
        Map<string, { levelWeight: number; techId: string }[]>
      >((acc, item) => {
        const skills = acc.get(item.professionalId) ?? [];
        skills.push({
          levelWeight: item.level.weight,
          techId: item.technologyId,
        });

        acc.set(item.professionalId, skills);

        return acc;
      }, new Map());

      const professionalIds = Array.from(techSkillsByProfessional)
        .map<[string, { techId: string; levelWeight: number }[]]>(
          ([professionalId, techSkills]) => [
            professionalId,
            techSkills.filter((techSkill) => {
              const techSkillQuery = queryByTechId.get(techSkill.techId);

              let result;
              if (techSkillQuery) {
                const operation = operationFor(techSkillQuery.levelOperator);

                result = operation(
                  techSkill.levelWeight,
                  techSkillQuery?.levelWeight,
                );
              } else {
                result = false;
              }

              return result;
            }),
          ],
        )
        .filter(
          ([, techSkills]) => techSkills.length === techSkillsQuery.length,
        )
        .map(([professionalId]) => professionalId);

      const professionals = await prisma.professional.findMany({
        select: {
          id: true,
          userId: true,
        },
        where: {
          active: true,
          id: {
            in: professionalIds,
          },
        },
      });

      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
        where: {
          id: {
            in: professionals.map((professional) => professional.userId),
          },
        },
      });

      const usersById = users.reduce<
        Map<string, { name: string; email: string }>
      >((acc, item) => {
        acc.set(item.id, { name: item.name ?? '', email: item.email ?? '' });
        return acc;
      }, new Map());

      return professionals.map((professional) => {
        const user = usersById.get(professional.userId);
        return {
          id: professional.id,
          name: user?.name ?? '',
          email: user?.email ?? '',
        };
      });
    }),

  addTechSkills: privateProcedure
    .input(
      z.object({
        id: z.string(),
        skills: z.array(
          z.object({
            levelId: z.string(),
            technologyId: z.string(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, skills } = input;

      const professional = await prisma.professional.findUnique({
        select: {
          techSkills: {
            select: {
              levelId: true,
              technologyId: true,
            },
            where: {
              current: true,
            },
          },
        },
        where: { id },
      });

      const currentSkills = professional?.techSkills ?? [];

      await prisma.professional.update({
        where: { id },
        data: {
          techSkills: {
            createMany: {
              data: skills.filter((newSkill) =>
                currentSkills.every(
                  (currentSkill) =>
                    newSkill.technologyId !== currentSkill.technologyId,
                ),
              ),
            },
          },
        },
      });
    }),
});
