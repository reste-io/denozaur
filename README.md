# Denozaur

Library with utilities for Deno.

This library can be imported into a Deno project in a number of ways.

As a whole:

```ts
import { Route, Router } from 'https://github.com/reste-io/denozaur/raw/main/mod.ts';
```

Or each utility individually:

```ts
import { Route } from 'https://github.com/reste-io/denozaur/raw/main/src/route/mod.ts';
// or
import { Router } from 'https://github.com/reste-io/denozaur/raw/main/src/router/mod.ts';
```

## Utilities

### Route

Description of the `route` module.

### Router

Description of the `router` module.

### Server

Work in progress.

Description of the `server` module.

## Commits

```bash
git commit -m "feat: some global changes"
git commit -m "feat(route): some route changes"
```

### Type

Must be one of the following:

- **build**: Changes that affect the build system or external dependencies (example scopes: npm)
- **ci**: Changes to our CI configuration files and scripts
- **docs**: Documentation only changes
- **feat**: A new feature
- **fix**: A bug fix
- **perf**: A code change that improves performance
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **test**: Adding missing tests or correcting existing tests
