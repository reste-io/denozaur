import { Server as DenoServer } from 'https://deno.land/std@0.137.0/http/server.ts';
import { RouteMethod, Router } from '../../mod.ts';

export interface ServerConfig {
  router: Router;
  port?: number;
  hostname?: string;
  publicDir?: {
    path: string;
    allowedExtensions: '*' | string[];
  };
}

export type Callback<T, A = Response> = (options: T) => A | Promise<A>;
export interface MiddlewareOptions {
  request: Request;
  router: Router;
}

/**
 * If middleware functions are passed, they should return a promise with undefined.
 * If they return a undefined, it will be passed to the next middleware function.
 * If they return a value, it will block next middleware functions from being called and finish the request.
 */
export type Middleware = Callback<
  MiddlewareOptions,
  Response | null
>;

export interface InterceptorOptions extends MiddlewareOptions {
  response: Response;
}

/**
 * A function that returns a middleware function used after the router has been called.
 */
export type Interceptor = Callback<InterceptorOptions>;

export class Server {
  #denoServer: DenoServer;
  #middleware: Middleware[] = [];
  #interceptors: Interceptor[] = [];

  constructor(private readonly config: ServerConfig) {
    this.#denoServer = new DenoServer({
      port: config.port ?? 8000,
      hostname: config.hostname ?? '0.0.0.0',
      handler: async (request: Request) => await this.handlerManager(request),
    });
  }

  public async start(): Promise<void> {
    console.log(
      `Server is running on http://${this.config.hostname ?? 'localhost'}:${this.config.port}`,
    );

    await this.#denoServer.listenAndServe();

    return;
  }

  public stop(): void {
    return this.#denoServer.close();
  }

  public use(...middleware: Middleware[]): void {
    this.#middleware.push(...middleware);
  }

  public intercept(...interceptors: Interceptor[]): void {
    this.#interceptors.push(...interceptors);
  }

  private async handlerManager(request: Request): Promise<Response> {
    const middleware = await this.handleMiddleware(request);

    if (middleware) return middleware;

    if (this.isExtension(request)) {
      const response = await this.handleFile(request);

      return this.handleInterceptors(request, response);
    }

    const response = await this.handleRoute(request);

    return this.handleInterceptors(request, response);
  }

  private async handleMiddleware(request: Request): Promise<Response | undefined> {
    for await (const middleware of this.#middleware) {
      const response = await middleware({ request, router: this.config.router });

      if (response) return response;
    }

    return undefined;
  }

  private async handleInterceptors(request: Request, _response: Response): Promise<Response> {
    let response: Response = _response;

    for await (const interceptor of this.#interceptors) {
      response = await interceptor({ request, response, router: this.config.router });
    }

    return response;
  }

  private async handleRoute(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);

    const [route, error] = this.config.router.match(pathname, request.method as RouteMethod);

    if (!route || error) return this.getErrorResponse(error, 404);

    return await route.handle(pathname, request);
  }

  private handleFile(request: Request): Response | Promise<Response> {
    const extension = this.isExtension(request);
    const { pathname } = new URL(request.url);
    const { publicDir } = this.config;

    if (!extension) return this.getErrorResponse('extension not found', 404);
    if (!publicDir) return this.getErrorResponse('public folder is not defined', 404);

    if (publicDir.allowedExtensions !== '*' && !publicDir.allowedExtensions.includes(extension)) {
      return this.getErrorResponse('file extension is not allowed', 404);
    }

    return this.getFileResponse(publicDir.path, pathname);
  }

  private isExtension(request: Request): string | undefined {
    const { pathname } = new URL(request.url);

    if (!pathname.includes('.')) return;

    return pathname.split('.').pop();
  }

  private getErrorResponse(
    message: string | number | undefined,
    status: number | undefined,
  ): Response {
    return new Response(`Error: ${message}`, { status: status ?? 500 });
  }

  private async getFileResponse(source: string, path: string): Promise<Response> {
    try {
      const file = await this.getFileFromPublic(source, path);

      return new Response(file);
    } catch {
      return this.getErrorResponse('file not found', 404);
    }
  }

  private async getFileFromPublic(source: string, path: string): Promise<Uint8Array> {
    return await Deno.readFile(Deno.cwd() + source + path);
  }
}
