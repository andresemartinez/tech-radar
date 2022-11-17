import { z } from 'zod';
import {
  defaultTechRadarDataset,
  professionalTechRadarDataset,
  techRadarDatasetById,
} from '~/server/services/tech-radar';
import { publicProcedure, router } from '~/server/trpc';
import {
  techRadarDatasetPreview,
  techRadarPreviewInput,
} from '../services/tech-radar/preview';

export const chartRouter = router({
  techRadar: router({
    default: publicProcedure.query(() => defaultTechRadarDataset()),
    byId: publicProcedure
      .input(
        z.object({
          id: z.string().uuid(),
        }),
      )
      .query(({ input }) => techRadarDatasetById(input.id)),
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
    preview: publicProcedure
      .input(techRadarPreviewInput)
      .query(({ input }) => techRadarDatasetPreview(input)),
  }),
});
