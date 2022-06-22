export interface AtlasConfig {
  readonly ATLAS_DATABASE: string;
  readonly ATLAS_DATA_SOURCE: string;
  readonly ATLAS_URL: string;
  readonly ATLAS_KEY: string;
}

export type AtlasAction =
  | 'find'
  | 'findOne'
  | 'insertOne'
  | 'insertMany'
  | 'updateOne'
  | 'updateMany'
  | 'replaceOne'
  | 'deleteOne'
  | 'deleteMany'
  | 'aggregate';

interface AtlasActionUpdateBody<T> {
  filter: Record<string, unknown>;
  update: {
    $set: Partial<T>;
  };
}

export type AtlasResult<T> = {
  data: T;
  error: { code: number; message: string };
  hasError: () => boolean;
};

export class Atlas {
  private readonly config: AtlasConfig = {
    ATLAS_DATABASE: Deno.env.get('ATLAS_DATABASE')!,
    ATLAS_DATA_SOURCE: Deno.env.get('ATLAS_DATA_SOURCE')!,
    ATLAS_URL: Deno.env.get('ATLAS_URL')!,
    ATLAS_KEY: Deno.env.get('ATLAS_KEY')!,
  };

  private async fetch<T>(
    action: AtlasAction,
    collection: string,
    body?: Record<string, unknown> | AtlasActionUpdateBody<unknown>,
  ) {
    try {
      const response = await fetch(this.config.ATLAS_URL + action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.ATLAS_KEY,
        },
        body: JSON.stringify({
          collection,
          database: this.config.ATLAS_DATABASE,
          dataSource: this.config.ATLAS_DATA_SOURCE,
          ...body,
        }),
      });

      return { data: await response.json() };
    } catch (error) {
      return { error };
    }
  }

  /**
   * https://www.mongodb.com/docs/atlas/api/data-api-resources/#find-multiple-documents
   */
  protected async atlasFind<T>(
    collection: string,
    body?: Record<string, unknown>,
  ): Promise<AtlasResult<T[]>> {
    const { data, error } = await this.fetch('find', collection, body);

    if (error) return this.setResponse({ error });

    if (!data || !data.documents) {
      return this.setResponse({ error: { code: 404, message: 'Not found' } });
    }

    return this.setResponse({ data: data.documents });
  }

  /**
   * https://www.mongodb.com/docs/atlas/api/data-api-resources/#find-a-single-document
   */
  protected async atlasFindOne<T>(
    collection: string,
    body?: Record<string, unknown>,
  ): Promise<AtlasResult<T>> {
    const { data, error } = await this.fetch('findOne', collection, body);

    if (error) return this.setResponse({ error });

    if (!data || !data.document) {
      return this.setResponse({ error: { code: 404, message: 'Not found' } });
    }

    return this.setResponse({ data: data.document });
  }

  /**
   * https://www.mongodb.com/docs/atlas/api/data-api-resources/#insert-a-single-document
   */
  protected async atlasInsertOne<T>(
    collection: string,
    body?: T,
  ): Promise<AtlasResult<string>> {
    const { data, error } = await this.fetch('insertOne', collection, { document: body });

    if (error) return this.setResponse({ error });

    if (!data || data.insertedId === undefined) {
      return this.setResponse({ error: { code: 500, message: 'Unknown error' } });
    }

    if (data.insertedId === 0) {
      return this.setResponse({ error: { code: 404, message: 'Not inserted' } });
    }

    return this.setResponse({ data: data.insertedId });
  }

  protected async atlasInsertMany<T>() {}

  protected async atlasUpdateOne<T>(
    collection: string,
    body: AtlasActionUpdateBody<T>,
  ): Promise<AtlasResult<number>> {
    const { data, error } = await this.fetch('updateOne', collection, body);

    if (error) return this.setResponse({ error });
    if (!data) return this.setResponse({ error: { code: 500, message: 'Unknown error' } });

    return this.setResponse({ data: data.modifiedCount });
  }

  protected async atlasUpdateMany<T>() {}
  protected async atlasReplaceOne<T>() {}
  protected async atlasDeleteOne<T>() {}
  protected async atlasDeleteMany<T>() {}
  protected async atlasAggregate<T>() {}

  private setResponse<T>(
    params: { data?: T; error?: { code: number; message: string } },
  ): AtlasResult<T> {
    return { data: params.data!, error: params.error!, hasError: () => params.data === undefined };
  }
}
