---
name: Faza Status Tracker
description: Current completion status of each development Faza for the redirect-manager plugin
type: project
---

Faza 1 (scaffold + package.json cleanup): COMPLETE as of 2026-03-15. Initial git commit: `feat: initial plugin scaffold (faza 1)`.

**Why:** Establishes the base structure on which all subsequent Fazas build.

Faza 2 (redirect content-type + CRUD altyapı): COMPLETE as of 2026-03-15. Branch: `faza/2-redirect-crud`, commit: 7069fe2.
  - Schema: from/to/type(enumeration)/isActive model
  - New types file: `server/src/types/redirect.ts` (Redirect, CreateRedirectInput, UpdateRedirectInput)
  - Service: full CRUD + toggleActive + getSettings/saveSettings/getContentTypes
  - Controller: input validation, slash-prefix enforcement, no stack trace leakage
  - Routes: type: 'admin' — all routes require Strapi admin JWT authentication

Faza 3 (settings toggles + slug lifecycle): IN PROGRESS as of 2026-03-15. Branch: `faza/3-settings-lifecycle`, commit: 9dcf276.
  - PluginSettings extended: autoRedirectOnSlugChange, chainDetectionEnabled, orphanRedirectEnabled
  - ContentTypeSettings extended: urlPrefix? field
  - bootstrap.ts: beforeUpdate/afterUpdate lifecycle with draftAndPublish guard and cycle prevention
  - Settings.tsx: API URL fixed (/redirect-manager/... not /api/redirect-manager/...), Toggle rows added, Checkbox onChange -> onCheckedChange
  - admin/src/index.ts: Settings page registered via createSettingSection

**How to apply:** When starting Faza 4, branch as `faza/4-middleware`. Target is runtime redirect middleware in `middlewares/index.ts` with in-memory cache, registered via `strapi.server.use()` in `register.ts`.

Faza 4: NOT STARTED — Runtime middleware (cache dahil)
Faza 5: NOT STARTED — Admin UI: redirect listesi + ekleme/düzenleme formu
Faza 6: NOT STARTED — Chain detection (service + admin UI uyarısı)
Faza 7: NOT STARTED — Orphan redirect (content-type + UI)
