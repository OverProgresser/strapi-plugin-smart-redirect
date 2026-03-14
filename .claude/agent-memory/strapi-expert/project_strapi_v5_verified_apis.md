---
name: Strapi v5 Verified API Patterns
description: MCP-verified Strapi v5 API patterns that differ from v4 training data — admin routes, lifecycle hooks, Design System v2 components
type: project
---

## Admin Route URL Prefix

Admin-type plugin routes (`type: 'admin'`) are served at `/${pluginId}/...` — NOT `/api/${pluginId}/...`.

Correct useFetchClient call: `get(`/${PLUGIN_ID}/settings`)` not `get(`/api/${PLUGIN_ID}/settings`)`.

MCP source: documentation llms-full.txt — the example uses `/my-plugin/pass-data` as the URL without `/api/` prefix.

**Why:** The existing Settings.tsx had `/api/${PLUGIN_ID}/...` which would have returned 404 in production. Fixed in Faza 3.

**How to apply:** Any admin-side fetch to plugin routes must use `/${PLUGIN_ID}/...` prefix.

## Settings Page Registration

`app.createSettingSection()` is called in `register()` (not `bootstrap()`). Shape:

```typescript
app.createSettingSection(
  { id: string, intlLabel: { id: string, defaultMessage: string } },
  [{ intlLabel, id, to: '/settings/<plugin-id>', Component: async () => import(...), permissions: [] }]
);
```

Settings page appears under the Strapi admin Settings panel in the left sidebar.

## Lifecycle Hooks (strapi.db.lifecycles.subscribe)

- Bootstrap parameter: `{ strapi }` (destructured)
- Subscribe call is in `bootstrap.ts`, not inline in model schema files
- `event.state` cross-hook sharing: confirmed supported, assign an object
- `event.params.where.id`: correct access pattern for beforeUpdate
- `event.result`: available in afterUpdate, contains the updated entity
- `event.model.uid`: the content-type UID string

## Design System v2 Component APIs

### Toggle
Props: `onLabel: string` (required), `offLabel: string` (required), `checked?: boolean | null`, `onChange` (native input event from ComponentPropsWithoutRef<'input'>).
NOT `onCheckedChange` — that is Switch/Checkbox API.

### Checkbox
Extends `@radix-ui/react-checkbox` — uses `onCheckedChange(checked: CheckedState): void`, NOT `onChange`.
Old `onChange` prop will TypeScript-error in strict mode.

### Switch
`checked` + `onCheckedChange` props. Typically wrapped in `Field.Root`.
