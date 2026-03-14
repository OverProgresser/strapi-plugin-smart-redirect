---
name: @strapi/icons Verified Export Names
description: Confirmed icon export names from @strapi/icons that differ from common guesses
type: project
---

The puzzle piece icon is exported as `PuzzlePiece`, NOT `Puzzle`.

```typescript
import { PuzzlePiece } from '@strapi/icons';
```

**Why:** The build fails with TS2305 if you use `Puzzle` — confirmed by checking `dist/icons/PuzzlePiece.d.ts` in the installed package.

**How to apply:** When using any @strapi/icons export, verify by checking `/node_modules/@strapi/icons/dist/icons/` for the exact filename — it matches the export name exactly.
