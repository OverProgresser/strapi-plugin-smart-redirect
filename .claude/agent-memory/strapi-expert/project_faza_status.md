---
name: Faza Status Tracker
description: Current completion status of each development Faza for the redirect-manager plugin
type: project
---

Faza 1 (scaffold + package.json cleanup): COMPLETE as of 2026-03-15. Initial git commit: `feat: initial plugin scaffold (faza 1)`.

**Why:** Establishes the base structure on which all subsequent Fazas build. Clears out the original Make.Digital fork metadata and sets OverProgresser as owner.

Faza 2 (redirect content-type + CRUD altyapı): COMPLETE as of 2026-03-15. Branch: `faza/2-redirect-crud`, commit: 7069fe2.
  - Schema rewritten: old slug-based model replaced with from/to/type/isActive model
  - New types file: `server/src/types/redirect.ts` (Redirect, CreateRedirectInput, UpdateRedirectInput)
  - Service: full CRUD + toggleActive + getSettings/saveSettings/getContentTypes
  - Controller: input validation, slash-prefix enforcement, no stack trace leakage
  - Routes: type: 'admin' — all routes require Strapi admin JWT authentication

Faza 3 (settings toggles + slug lifecycle): COMPLETE as of 2026-03-15. Branch: `faza/3-settings-lifecycle`, commit: 9dcf276.
  - PluginSettings extended: autoRedirectOnSlugChange, showChainWarning, showOrphanNotification
  - ContentTypeSettings extended: urlPrefix? field
  - bootstrap.ts: beforeUpdate/afterUpdate lifecycle with draftAndPublish guard and cycle prevention
  - Settings.tsx: API URL fixed (/redirect-manager/... not /api/redirect-manager/...), Toggle rows added, Checkbox onChange -> onCheckedChange
  - admin/src/index.ts: Settings page registered via createSettingSection (appears under Strapi Settings panel)

**How to apply:** When starting Faza 4, branch as `faza/4-chain-detection`. Target is chain detection logic in `services/redirect.ts` and chain warning display in admin UI, gated by `showChainWarning` setting.

Faza 4: NOT STARTED — Chain detection warnings in `services/redirect.ts`
Faza 5: NOT STARTED — Orphan redirect content-type + admin UI
