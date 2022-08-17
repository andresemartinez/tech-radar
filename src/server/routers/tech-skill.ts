import { z } from 'zod';
import { createRouter } from '~/server/createRouter';
import { prisma } from '~/server/prisma';

export const techSkillRouter = createRouter().mutation('removeTechSkills', {
  input: z.object({
    id: z.string(),
  }),
  async resolve({ input }) {
    const { id } = input;

    await prisma.techSkill.delete({
      where: { id },
    });
  },
});
