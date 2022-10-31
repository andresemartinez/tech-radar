import { chartRouter } from '~/server/routers/chart';
import { professionalRouter } from '~/server/routers/professional';
import { techCategoryRouter } from '~/server/routers/tech-category';
import { publicProcedure, router } from '~/server/trpc';
import { techSkillRouter } from './tech-skill';
import { techSkillLevelRouter } from './tech-skill-level';
import { techStatsRouter } from './tech-stats';
import { technologyRouter } from './technology';
import { userRouter } from './user';

export const appRouter = router({
  healthz: publicProcedure.query(() => 'yay!'),

  user: userRouter,
  professional: professionalRouter,
  chart: chartRouter,
  technology: technologyRouter,
  techCategory: techCategoryRouter,
  techSkillLevel: techSkillLevelRouter,
  techSkill: techSkillRouter,
  techStats: techStatsRouter,
});

export type AppRouter = typeof appRouter;
