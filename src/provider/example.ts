import { BaseProvider, BaseProviderConfig, buildProvider } from './mod.ts';

// - usage on backend -
export class Provider extends BaseProvider {
  constructor(config?: BaseProviderConfig) {
    super({ ...config, base: 'http://localhost:3000' });
  }

  public async getData(): Promise<string> {
    const response = await this.fetch(new Request('/data'));

    return await response.text();
  }
}

// build_file.ts - usage on backend (scripts.ts or something like this) -
await buildProvider({
  emptyDir: '../../dist/backend',
  build: {
    entryPoints: ['mod.ts'], // file with Provider class
    outDir: '../dist/backend',
    shims: {
      deno: true,
    },
    test: false,
    package: {
      name: 'backend',
      version: Deno.args[0],
    },
  },
});

// -> deno run build_file.ts 1.0.0

// - usage on frontend -
// import { Provider } from 'backend';

const provider = new Provider();

provider.intercept((request) => {
  const r = new Request(request);

  r.headers.set('Authorization', '1');

  return r;
});

const _a = await provider.getData();
