import { Route, RouteConfig, RouteMethod } from '../route/route.ts';

/**
 * Router class for handling requests and responses to the server.
 */
export class Router {
  private routing: Route[];

  /**
   * Constructor.
   * @param routes - array of route config objects.
   */
  constructor(routes: RouteConfig[]) {
    this.routing = routes.map((route) => new Route(route));
  }

  /**
   * Method to match the path.
   *
   * @param path - string to match
   * @param method - method to match
   * @returns object with params if the path matches.
   */
  public match(
    path: string,
    method: RouteMethod,
  ): [Route | undefined, number | undefined] {
    const route = this.routing.find((route) => route.match(path));

    if (!route) return [undefined, 404];

    if (!route.matchMethod(method)) {
      return [undefined, 405];
    }

    return [route, undefined];
  }

  /**
   * Method to get the all paths from router as string array.
   *
   * @returns paths in array.
   */
  public getPaths(): string[] {
    return this.routing.map((route) => route.getPath());
  }
}
