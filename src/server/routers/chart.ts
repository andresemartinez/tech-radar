import { z } from 'zod';
import {
  professionalTechRadarDataset as professionalTechRadar,
  techRadarDataset as techRadar,
} from '~/server/services/tech-radar';
import { publicProcedure, router } from '~/server/trpc';

export const chartRouter = router({
  techRadar: publicProcedure.query(() => techRadar()),
  techRadarByProfessional: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(({ input }) => {
      const { id } = input;
      return professionalTechRadar(id);
    }),
});
