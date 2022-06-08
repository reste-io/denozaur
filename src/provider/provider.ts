export interface BaseProviderConfig {
  base: string;
  fetch?: (
    input: Request | string,
    init?: RequestInit,
  ) => Promise<Response>;
}

export class BaseProvider {
  protected config: Required<BaseProviderConfig>;
  private interceptors: Array<(request: Request) => Request> = [];

  constructor(config: BaseProviderConfig) {
    this.config = {
      ...config,
      fetch: config.fetch || fetch,
    };

    if (!this.config.fetch) throw new Error('Provider requires fetch function');
  }

  public intercept(callback: (request: Request) => Request): void {
    this.interceptors.push(callback);
  }

  protected async fetch(request: Request): Promise<Response> {
    for await (const interceptor of this.interceptors) {
      request = interceptor(request);
    }

    return await this.config.fetch(request);
  }
}
