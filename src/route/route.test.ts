import { assert, assertEquals } from 'https://deno.land/std@0.74.0/testing/asserts.ts';
import { HandlerParams, Route, RouteMethod } from './route.ts';

Deno.test('The route', async (t: Deno.TestContext) => {
  await t.step('should check basic path and GET method', () => {
    const notAllowedMethods = ['POST', 'PUT', 'DELETE'];
    const route = new Route({
      path: '/',
      handler: () => new Response('response'),
    });

    assert(route, 'The route should be defined');
    assert(route.match('/'), 'The route should match the path');
    assert(
      route.matchMethod('GET'),
      'The route should match the default method - GET',
    );

    notAllowedMethods.forEach((method) => {
      assert(
        !route.matchMethod(method as RouteMethod),
        `The route should\'t match the method ${method}`,
      );
    });
  });

  await t.step('should check basic path and POST method', () => {
    const notAllowedMethods = ['GET', 'PUT', 'DELETE'];
    const route = new Route({
      path: '/',
      method: 'POST',
      handler: () => new Response('response'),
    });

    assert(route.match('/'), 'The route should match the path');
    assert(route.matchMethod('POST'), 'The route should match the method POST');

    notAllowedMethods.forEach((method) => {
      assert(
        !route.matchMethod(method as RouteMethod),
        `The route should\'t match the method ${method}`,
      );
    });
  });

  await t.step('should check passing params', () => {
    const route = new Route({
      path: 'pl/:id/test/:name',
      handler: () => new Response('response'),
    });

    assertEquals(
      route.match('pl/123/test/adam'),
      { id: '123', name: 'adam' },
      'The route should match the path params',
    );
  });

  await t.step('should check handle method', () => {
    const route = new Route({
      path: '/:id',
      handler: (config: HandlerParams) =>
        new Response(`${config.params.id}-${config.request.method}`),
    });

    assertEquals(
      route.handle('/1', { method: 'GET' } as Request),
      new Response('1-GET'),
    );
  });
});
