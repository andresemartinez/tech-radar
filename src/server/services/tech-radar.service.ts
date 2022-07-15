import { prisma } from '~/server/prisma';
import { Prisma } from '@prisma/client';

export async function techRadarDataset() {
  const skills = await prisma.techSkill.findMany({
    select: Prisma.validator<Prisma.TechSkillSelect>()({
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
    }),
  });

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
