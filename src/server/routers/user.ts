import { z } from 'zod';
import { prisma } from '~/server/prisma';
import { publicProcedure, router } from '~/server/trpc';

export const userRouter = router({
  edit: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          name: z.string(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, data } = input;

      await prisma.user.update({
        where: { id },
        data,
      });
    }),
});
