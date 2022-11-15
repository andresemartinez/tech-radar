import { z } from 'zod';
import {
  defaultTechRadarDataset,
  professionalTechRadarDataset,
  techRadarDataset,
} from '~/server/services/tech-radar';
import { publicProcedure, router } from '~/server/trpc';

export const chartRouter = router({
  techRadar: router({
    default: publicProcedure.query(() => defaultTechRadarDataset()),
    byId: publicProcedure
      .input(
        z.object({
          id: z.string().uuid(),
        }),
      )
      .query(({ input }) => techRadarDataset(input.id)),
    byProfessional: publicProcedure
      .input(
        z.object({
          id: z.string(),
        }),
      )
      .query(({ input }) => {
        const { id } = input;
        return professionalTechRadarDataset(id);
      }),
  }),
});
