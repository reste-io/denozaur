export interface BaseProviderConfig {
  environment: ProviderEnvironment;
  fetch?: (
    input: Request | string,
    init?: RequestInit,
  ) => Promise<Response>;
}

export interface ProviderEnvironment {
  name: string;
  base: string;
}

export class BaseProvider {
  protected config: Required<BaseProviderConfig>;
  private interceptors: Array<(input: Request | string, init?: RequestInit) => Request> = [];

  constructor(config: BaseProviderConfig) {
    this.config = {
      ...config,
      fetch: config.fetch || fetch,
    };

    if (!this.config.fetch) throw new Error('Provider requires fetch function');
  }

  public intercept(callback: (input: Request | string, init?: RequestInit) => Request): void {
    this.interceptors.push(callback);
  }

  protected async fetch(input: string, init?: RequestInit): Promise<Response> {
    let request = new Request(this.config.environment.base + input);

    for await (const interceptor of this.interceptors) {
      request = interceptor(request, init);
    }

    return await this.config.fetch(request, init);
  }

  protected getEnvironment(): ProviderEnvironment {
    return this.config.environment;
  }
}
