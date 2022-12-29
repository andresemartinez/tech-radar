import { privateProcedure, router } from '~/server/trpc';
import { prisma } from '~/server/prisma';
import { z } from 'zod';

export const techInterest = router({
  allsarasa: privateProcedure.query(async () => {
    const techInterests = await prisma.techInterest.findMany({
      select: { id: true },
    });

    return techInterests;
  }),
  byId: privateProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const { id } = input;
      const techInterest = await prisma.techInterest.findUnique({
        select: { id: true },
        where: { id },
      });

      return techInterest;
    }),
});
