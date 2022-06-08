import { build, BuildOptions, emptyDir } from 'https://deno.land/x/dnt@0.23.0/mod.ts';

interface BuildProviderConfig {
  emptyDir: string;
  build: BuildOptions;
}

/**
 * Wrapper for emptyDir and build from dnt library module.
 * https://deno.land/x/dnt@0.23.0/
 */
export const buildProvider = async (config: BuildProviderConfig): Promise<void> => {
  await emptyDir(config.emptyDir);

  await build(config.build);
};
