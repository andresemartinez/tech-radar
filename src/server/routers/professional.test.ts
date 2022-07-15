import { createContextInner } from '../context';
import { appRouter } from './_app';

test('get professionals by id', async () => {
  const ctx = await createContextInner({});
  const caller = appRouter.createCaller(ctx);

  const actualMaxi = await caller.query('professional.byId', {
    id: 'ae466d2b-2936-4705-9f0e-972874d19c9a',
  });

  const expectedMaxi = {
    firstName: 'Maxi',
    lastName: 'Britez',
    email: 'maxi@redb.ee',
    techSkills: [
      {
        level: {
          name: 'Pro',
        },
        technology: {
          name: 'ReactJS',
        },
      },
    ],
  };

  expect(actualMaxi).toMatchObject(expectedMaxi);
});
