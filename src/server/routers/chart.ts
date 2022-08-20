import { createRouter } from '~/server/createRouter';
import {
  professionalTechRadarDataset as professionalTechRadar,
  techRadarDataset as techRadar,
} from '~/server/services/tech-radar.service';
import { z } from 'zod';

export const chartRouter = createRouter()
  .query('tech-radar', {
    resolve() {
      return techRadar();
    },
  })
  .query('tech-radar.byProfessional', {
    input: z.object({
      id: z.string(),
    }),
    resolve({ input }) {
      const { id } = input;
      return professionalTechRadar(id);
    },
  });
