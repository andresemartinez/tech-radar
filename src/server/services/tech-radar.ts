import {
  Prisma,
  TechRadarAngularAxisType,
  TechRadarRadialAxisType,
} from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { prisma } from '~/server/prisma';
import { RouterInput, RouterOutput } from '~/utils/trpc';

const skillSelect = Prisma.validator<Prisma.TechSkillSelect>()({
  technology: {
    select: {
      name: true,
    },
  },
  level: {
    select: {
      id: true,
      name: true,
      weight: true,
    },
  },
});

export async function defaultTechRadarDataset() {
  const skills = await prisma.techSkill.findMany({
    select: skillSelect,
    where: { current: true },
  });

  return buildTechRadarDataset(skills);
}

export async function professionalTechRadarDataset(professionalId: string) {
  const skills = await prisma.techSkill.findMany({
    select: skillSelect,
    where: { professionalId, current: true },
  });

  return buildTechRadarDataset(skills);
}

const techRadarSelect = Prisma.validator<Prisma.TechRadarSelect>()({
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
      user: {
        select: {
          name: true,
        },
      },
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
});

type TechRadar = Prisma.TechRadarGetPayload<{
  select: typeof techRadarSelect;
}>;

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

export async function techRadarDatasetById(id: string) {
  const techRadar = await prisma.techRadar.findUnique({
    select: techRadarSelect,
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

  const labels = techRadarLabels(techRadar);

  const data = await techRadarData(techRadar);

  return {
    labels,
    datasets: [
      {
        label: 'tech-radar',
        data,
      },
    ],
  };
}

function techRadarLabels(techRadar: TechRadar) {
  let labels: string[];

  switch (techRadar.angularAxis) {
    case TechRadarAngularAxisType.category:
      labels = techRadar.techCategories.map(
        (techCategory) => techCategory.name,
      );
      break;
    case TechRadarAngularAxisType.technology:
      labels = techRadar.technologies.map((technology) => technology.name);
      break;
    default:
      labels = [];
  }

  return labels;
}

async function techRadarData(techRadar: TechRadar) {
  let groupBy: (ts: TechSkill) => string[];

  switch (techRadar.angularAxis) {
    case TechRadarAngularAxisType.technology:
      groupBy = (ts: TechSkill) => [ts.technology.id];
      break;
    case TechRadarAngularAxisType.category:
      groupBy = (ts: TechSkill) =>
        ts.technology.categories.map((category) => category.id);
      break;
  }

  let techSkills;

  switch (techRadar.radialAxis) {
    case TechRadarRadialAxisType.professional:
      techSkills = await prisma.techSkill.findMany({
        select: techSkillSelect,
        where: {
          professionalId: {
            in: techRadar.professionals.map((professional) => professional.id),
          },
          current: true,
        },
      });
      break;
    case TechRadarRadialAxisType.company:
    default:
      techSkills = await prisma.techSkill.findMany({
        select: techSkillSelect,
        where: {
          current: true,
        },
      });
  }

  return Array.from(
    techSkills
      .reduce((acc, techSkill) => {
        groupBy(techSkill).forEach((id) => {
          let techSkills = acc.get(id);

          if (techSkills === undefined) {
            techSkills = [];
            acc.set(id, techSkills);
          }

          techSkills.push(techSkill);
        });

        return acc;
      }, new Map<TechSkill['id'], TechSkill[]>())
      .values(),
  ).map(
    (techGroup) =>
      techGroup.reduce((acc, techSkill) => acc + techSkill.level.weight, 0) /
      techGroup.length,
  );
}

async function buildTechRadarDataset(
  skills: {
    technology: { name: string };
    level: { id: string; name: string; weight: number };
  }[],
) {
  const skillsLabels = skills
    .map((skill) => skill.technology.name)
    .reduce((pv, cv) => (pv.includes(cv) ? pv : [...pv, cv]), [] as string[]);

  const skillWeightsByTech = skills.reduce(
    (pv, cv) => ({
      ...pv,
      [cv.technology.name]: [
        ...(pv[cv.technology.name] || []),
        cv.level.weight,
      ],
    }),
    {} as { [key: string]: number[] },
  );

  const skillsDataset = {
    label: 'Professionals',
    data: Object.keys(skillWeightsByTech).reduce((weights, technology) => {
      const techWeights = skillWeightsByTech[technology] || [];
      const techWeightAverage =
        techWeights.reduce((pv, cv) => pv + cv, 0) / techWeights.length;
      return [...weights, techWeightAverage];
    }, [] as number[]),
  };

  return {
    labels: skillsLabels,
    datasets: [skillsDataset],
  };
}
