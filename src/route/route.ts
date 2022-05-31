import UrlPattern from 'https://cdn.skypack.dev/url-pattern';

/**
 * Route configuration object.
 */
export interface RouteConfig {
  /**
   * The path of the route.
   */
  path: string;

  /**
   * The method of the route.
   */
  method?: RouteMethod;

  /**
   * The function handler of the route.
   */
  handler: (params: HandlerParams) => Response | Promise<Response>;
}

/**
 * Allowed methods for the route.
 */
export type RouteMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * The params of the handler.
 */
export interface HandlerParams {
  request: Request;
  params: {
    [key: string]: unknown;
  };
}

/**
 * Route class for handling requests and responses to the server.
 * Used in Router class.
 */
export class Route {
  private pattern: typeof UrlPattern;

  constructor(private config: RouteConfig) {
    this.pattern = new UrlPattern(config.path);

    if (!this.config.method) this.config.method = 'GET';
  }

  /**
   * Method to match the path.
   *
   * @param path - string to match
   * @returns object with params if the path matches
   */
  public match(path: string) {
    return this.pattern.match(path);
  }

  /**
   * Method to match the http method.
   * @param method - http method to match
   * @returns true if the method matches
   */
  public matchMethod(method: RouteMethod) {
    return this.config.method === method;
  }

  /**
   * Method to handle the request.
   *
   * @param path - string to match
   * @param request - request object
   * @returns handler function.
   */
  public handle(path: string, request: Request) {
    return this.config.handler(
      { request, params: this.match(path) } as HandlerParams,
    );
  }
}
