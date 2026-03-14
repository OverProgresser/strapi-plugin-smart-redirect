---
name: sdk-plugin Build Tool Verified Patterns
description: MCP-verified facts about @strapi/sdk-plugin build behavior for tsconfig and dist generation
type: project
---

The `@strapi/sdk-plugin` build tool requires TWO tsconfig files per side (admin/server):
- `admin/tsconfig.json` — base config, used by `npm run test:ts:front`
- `admin/tsconfig.build.json` — build config, extends `./tsconfig`, sets `rootDir: "../"`, used by `strapi-plugin build` to emit `.d.ts` files
- Same pattern applies for `server/tsconfig.json` + `server/tsconfig.build.json`

**Why:** The build tool hardcodes lookup paths `./admin/tsconfig.build.json` and `./server/tsconfig.build.json` (confirmed by reading sdk-plugin dist source). Without `tsconfig.build.json`, the `.d.ts` files in `dist/admin/src/` and `dist/server/src/` are not generated, causing `strapi-plugin verify` to fail.

**How to apply:** Always create both tsconfig files when setting up a new plugin scaffold. The `tsconfig.build.json` content should be:
```json
{
  "extends": "./tsconfig",
  "include": ["./src"],
  "compilerOptions": { "rootDir": "../", "baseUrl": ".", "outDir": "./dist" }
}
```

Also: interfaces used by service functions must be `export`ed in TypeScript — the build's `.d.ts` emission fails with TS4082 if they are private/local and referenced in the public API.

The `@strapi/typescript-utils` tsconfigs base paths:
- admin: `tsconfigs/admin.json` — targets ESNext, moduleResolution Bundler, jsx react-jsx, noEmit true
- server: `tsconfigs/server.json` — targets ES2019, CommonJS, no strict (strict: false at base level)
