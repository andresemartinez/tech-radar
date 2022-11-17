import {
  Prisma,
  TechRadarAngularAxisType,
  TechRadarRadialAxisType,
} from '@prisma/client';
import { ChartDataset } from 'chart.js';
import { z } from 'zod';
import { prisma } from '~/server/prisma';

const techSkillSelect = Prisma.validator<Prisma.TechSkillSelect>()({
  id: true,
  technology: {
    select: {
      id: true,
      name: true,
      categories: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  level: {
    select: {
      weight: true,
    },
  },
});

type TechSkill = Prisma.TechSkillGetPayload<{ select: typeof techSkillSelect }>;

export const techRadarPreviewInput = z.object({
  angularAxisType: z.nativeEnum(TechRadarAngularAxisType),
  technologies: z.array(z.string().uuid()),
  techCategories: z.array(z.string().uuid()),
  radialAxes: z.array(
    z.object({
      name: z.string().min(1),
      radialAxisType: z.nativeEnum(TechRadarRadialAxisType),
      professionals: z.array(z.string().uuid()),
    }),
  ),
});

type TechRadarPreviewQuery = z.infer<typeof techRadarPreviewInput>;

const techCategoriesByIds = (ids: string[]) => {
  return prisma.technologyCategory.findMany({
    select: {
      id: true,
      name: true,
    },
    where: {
      id: {
        in: ids,
      },
      active: true,
    },
  });
};

const technologiesByIds = (ids: string[]) => {
  return prisma.technology.findMany({
    select: {
      id: true,
      name: true,
    },
    where: {
      id: {
        in: ids,
      },
      active: true,
    },
  });
};

const findAllTechSkills = () => {
  return prisma.techSkill.findMany({
    select: techSkillSelect,
    where: {
      current: true,
    },
  });
};

const findProfessionalsTechSkills = (professionalIds: string[]) => {
  return prisma.techSkill.findMany({
    select: techSkillSelect,
    where: {
      professionalId: {
        in: professionalIds,
      },
      current: true,
    },
  });
};

export const techRadarDatasetPreview = async (
  techRadar: TechRadarPreviewQuery,
) => {
  let angularAxes: { id: string; name: string }[] = [];
  let datasets: ChartDataset<'radar', number[]>[] = [];
  let groupBy: (ts: TechSkill) => string[];

  if (techRadar !== null) {
    switch (techRadar.angularAxisType) {
      case TechRadarAngularAxisType.category:
        angularAxes = await techCategoriesByIds(techRadar.techCategories);
        groupBy = (ts: TechSkill) =>
          ts.technology.categories.map((category) => category.id);
        break;
      case TechRadarAngularAxisType.technology:
        angularAxes = await technologiesByIds(techRadar.technologies);
        groupBy = (ts: TechSkill) => [ts.technology.id];
        break;
    }

    datasets = await Promise.all(
      techRadar.radialAxes.map(async (radialAxis) => {
        const { name, radialAxisType } = radialAxis;
        let techSkills: TechSkill[] = [];

        switch (radialAxisType) {
          case TechRadarRadialAxisType.company:
            techSkills = await findAllTechSkills();
            break;
          case TechRadarRadialAxisType.professional:
            techSkills = await findProfessionalsTechSkills(
              radialAxis.professionals,
            );
            break;
        }

        const techSkillsByAngularAxesId = techSkills.reduce(
          (acc: Map<TechSkill['id'], TechSkill[]>, techSkill) => {
            groupBy(techSkill).forEach((id) => {
              let techSkills = acc.get(id);

              if (techSkills === undefined) {
                techSkills = [];
                acc.set(id, techSkills);
              }

              techSkills.push(techSkill);
            });

            return acc;
          },
          new Map<TechSkill['id'], TechSkill[]>(),
        );

        const data = angularAxes.map((label) => {
          const techGroup = techSkillsByAngularAxesId.get(label.id);
          let averageWeight = 0;

          if (techGroup !== undefined) {
            const totalWeight = techGroup.reduce(
              (acc, techSkill) => acc + techSkill.level.weight,
              0,
            );
            averageWeight = totalWeight / techGroup.length;
          }

          return averageWeight;
        });

        return {
          name,
          data,
        };
      }),
    );
  }

  return {
    labels: angularAxes.map((label) => label.name),
    datasets,
  };
};
