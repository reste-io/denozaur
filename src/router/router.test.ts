import { assert, assertEquals } from 'https://deno.land/std@0.74.0/testing/asserts.ts';
import { HandlerParams } from '../route/route.ts';
import { Router } from './router.ts';

Deno.test('The router', async (t: Deno.TestContext) => {
  const router = new Router([
    {
      path: '/',
      handler: () => new Response('response'),
    },
    {
      path: '/:id/test/:name',
      method: 'POST',
      handler: (config: HandlerParams) =>
        new Response(`${config.params.id}-${config.request.method}`),
    },
  ]);

  await t.step('should match request', () => {
    assert(router.match('/', 'GET')[0], 'The route should match the path');
    assertEquals(
      router.match('/', 'POST'),
      [undefined, 405],
      'The route should\'t match the path and return 405 error for bad method',
    );
    assertEquals(
      router.match('/unknown/unknown', 'POST'),
      [undefined, 404],
      'The route should\'t match the path and return 404 error for bad path',
    );
    assert(
      router.match('/1/test/adam', 'POST'),
      'The route should match the path and method',
    );
  });

  await t.step('should get all router paths', () => {
    assertEquals(router.getPaths(), ['/', '/:id/test/:name'], 'The paths should match');
  });
});
