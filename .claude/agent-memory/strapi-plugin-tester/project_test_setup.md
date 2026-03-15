---
name: Test infrastructure setup
description: Jest + ts-jest test setup details for the redirect-manager plugin, including tsconfig exclusion pattern
type: project
---

Jest test infrastructure was added on 2026-03-15 with ts-jest preset.

**Why:** No tests existed previously. Full unit test coverage was needed for services, controllers, and bootstrap lifecycle hooks.

**How to apply:**
- `npm test` runs all tests via Jest with ts-jest preset
- Test files live in `__tests__/` directories co-located with source: `services/__tests__/`, `controllers/__tests__/`, `src/__tests__/`
- `server/tsconfig.json` excludes `src/**/__tests__` to prevent test files from being type-checked by the production `tsc` build (tests use Jest globals which aren't in the server tsconfig)
- ts-jest emits a warning about `esModuleInterop` — this is harmless since the base tsconfig has `esModuleInterop: true`
- Jest 30 suppresses verbose output in non-TTY mode; use `--json` piped through a script to see test names
