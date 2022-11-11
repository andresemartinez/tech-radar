/**
 * This is your entry point to setup the root configuration for tRPC on the server.
 * - `initTRPC` should only be used once per app.
 * - We export only the functionality that we use so we can enforce which base procedures should be used
 *
 * Learn how to create protected base procedures and other things below:
 * @see https://trpc.io/docs/v10/router
 * @see https://trpc.io/docs/v10/procedures
 */

import { Context } from './context';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { Role } from '@prisma/client';

const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/v10/data-transformers
   */
  transformer: superjson,
  /**
   * @see https://trpc.io/docs/v10/error-formatting
   */
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * Create a router
 * @see https://trpc.io/docs/v10/router
 */
export const router = t.router;

/**
 * Create an unprotected procedure
 * @see https://trpc.io/docs/v10/procedures
 **/
export const publicProcedure = t.procedure;

/**
 * @see https://trpc.io/docs/v10/middlewares
 */
export const middleware = t.middleware;

/**
 * @see https://trpc.io/docs/v10/merging-routers
 */
export const mergeRouters = t.mergeRouters;

// Custom stuff

const authedMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You are not authorized',
    });
  }

  return next({ ctx: { user: ctx.user } });
});

export const privateProcedure = t.procedure.use(authedMiddleware);

const adminAllowedRoles: Role[] = [Role.admin, Role.superadmin];
export const adminProcedure = t.procedure
  .use(authedMiddleware)
  .use(({ ctx, next }) => {
    const { user } = ctx;

    if (user.role && !adminAllowedRoles.includes(user.role)) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You are not authorized',
      });
    }

    return next({ ctx: {} });
  });
