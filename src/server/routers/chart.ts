import { createRouter } from '~/server/createRouter';
import { techRadarDataset } from '~/server/services/tech-radar.service';

export const chartRouter = createRouter().query('tech-radar', {
  resolve() {
    return techRadarDataset();
  },
});
