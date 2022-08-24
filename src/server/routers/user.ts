import { z } from 'zod';
import { createRouter } from '~/server/createRouter';
import { prisma } from '~/server/prisma';

export const userRouter = createRouter().mutation('edit', {
  input: z.object({
    id: z.string(),
    data: z.object({
      name: z.string(),
    }),
  }),
  async resolve({ input }) {
    const { id, data } = input;

    await prisma.user.update({
      where: { id },
      data,
    });
  },
});
