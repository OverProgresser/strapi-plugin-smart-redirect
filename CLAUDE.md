# Strapi Redirect Manager Plugin

## Proje Bağlamı
Sıfırdan geliştirilen, bağımsız bir Strapi v5 redirect yönetim plugin'i.
Hedef: Strapi Marketplace'te genel kullanıma açık yayın.
Lisans: MIT

## Strapi MCP — ZORUNLU KULLANIM
Bu projede Strapi MCP server bağlı. Strapi v5 API'sine dair herhangi bir şey
yazmadan önce MCP'ye sor. Training data'daki v4 pattern'leri v5'te bozulmuş
olabilir. MCP'yi atlamak yasak.

## Tech Stack
- **Plugin scaffold:** `@strapi/sdk-plugin`
- **Runtime:** Node.js 20+, TypeScript strict
- **Admin UI:** Strapi Design System v2 (`@strapi/design-system`)
- **Build:** `strapi-plugin build` / `strapi-plugin watch`
- **Type check:** `tsc --noEmit` (ayrı front + back tsconfig)

## Hedef Özellikler

### Özellik 1 — Manuel Redirect Yönetimi (çekirdek)
Admin panel'den 301/302 redirect ekleme, düzenleme, silme.
`from` ve `to` alanları. Runtime'da middleware ile devreye girer.

### Özellik 2 — Runtime Middleware
Her HTTP isteğinde `from` URL'leri eşleştirip 301/302 ile yönlendiren
Strapi middleware. Redirect listesi performans için cache'lenir.

### Özellik 3 — Slug Değişiminde Otomatik Redirect
`beforeUpdate` / `afterUpdate` lifecycle hook'larıyla slug değişimi algılanır,
otomatik 301 kaydı oluşturulur. Hangi content-type'ların izleneceği ve
URL prefix'leri settings'ten alınır — hardcode yok.

### Özellik 4 — Redirect Zinciri (Chain) Uyarısı
Yeni redirect kaydedilirken A→B→C zinciri tespit edilirse admin UI'da uyarı
gösterilir, A→C'ye kısaltma önerilir. Döngüsel redirect (A→B→A) de kontrol edilir.

### Özellik 5 — Orphan Redirect Listesi
İçerik silindiğinde `afterDelete` ile "bekleyen yönlendirmeler" kaydı oluşturulur.
Admin panel'de editör hedef URL'yi girerek onaylar veya reddeder.

### Plugin Settings Sayfası
- İzlenecek content-type'lar (kullanıcı kendi modellerinden seçer)
- Her content-type için URL prefix (ör. `api::post.post` → `/blog/`)
- `autoRedirectOnSlugChange` toggle
- `chainDetectionEnabled` toggle
- `orphanRedirectEnabled` toggle

## Content Type Tasarımı

### `redirect` (koleksiyon)
```
from:         string, required   — kaynak URL (ör. /eski-sayfa)
to:           string, required   — hedef URL (ör. /yeni-sayfa)
type:         enumeration, enum: ['301','302'], default '301'
isActive:     boolean, default true
comment:      text, optional
```

### `orphan-redirect` (koleksiyon)
```
from:         string, required   — silinen içeriğin URL'si
status:       enumeration, enum: ['pending','resolved','dismissed'], default 'pending'
resolvedTo:   string, optional   — editörün girdiği hedef URL
```

## Geliştirme Sırası (Fazalar)
1. ✅ **Faza 1** — Scaffold + package.json + proje iskelet
2. ✅ **Faza 2** — `redirect` content-type + CRUD service/controller/route
3. ✅ **Faza 3** — Plugin Settings sayfası + slug auto-redirect (lifecycle hooks)
4. 🔄 **Faza 4** — Runtime middleware (cache dahil)
5. **Faza 5** — Admin UI: redirect listesi + ekleme/düzenleme formu
6. **Faza 6** — Chain detection
7. **Faza 7** — Orphan redirect

## Kodlama Standartları
- TypeScript strict — `any` yasak
- `strapi.db.query(uid)` kullan — `entityService` deprecated
- Lifecycle state: `event.state` üzerinden taşı (module-level variable yasak)
- Content-type UID: `plugin::redirect-manager.<type>`
- `strapi.store()` ile settings sakla, namespace: `plugin_redirect-manager`
- 2-space indent, single quotes, trailing commas

## Build & Test Komutları
```bash
npm run build          # strapi-plugin build
npm run watch          # dev watch
npm run watch:link     # linked dev
npm run verify         # plugin verify
npm run test:ts:front  # tsc admin tsconfig
npm run test:ts:back   # tsc server tsconfig
```

## Git Workflow
- Branch per Faza: `faza/1-scaffold`, `faza/2-redirect-crud`, vb.
- Commit style: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`
- Her commit öncesi `test:ts:front` + `test:ts:back` geçmeli

## Teknik Kısıtlar (PRD Bölüm 6-7)
- Tüm route'lar `type: 'admin'` — asla `content-api` + `auth: false` değil
- `type: 'admin'` route'lar `/${pluginId}/...` path'i altında serve edilir
- `@strapi/helper-plugin` kullanılmaz — import'lar `@strapi/strapi/admin`'den
- Notification type: `success`, `danger`, `info` — `warning` yok
- DS v2: Checkbox → `onCheckedChange`, Toggle → `onLabel` + `offLabel` zorunlu
- `from` ve `to` alanları `/` ile başlamalı — open redirect yasak
- `to` alanı dış domain kabul etmez (`http://`, `https://` ile başlayamaz)
- Controller hata response'larında stack trace veya internal path sızdırılmaz
- `Location` header'ına ham kullanıcı girdisi yazılmaz
- Middleware `register.ts`'te `strapi.server.use()` ile global kayıtlı
- Cache: redirect eklenince / güncellenince / silinince invalidate edilir
- Chain detection max derinlik: 10 hop

## Faza 3'ten Öğrenilenler (tekrar etme)
- Admin route URL'leri: `type: 'admin'` route'lar `/${pluginId}/settings` altında
  serve edilir — `/api/${pluginId}/settings` değil
- DS v2 Checkbox: `onChange` değil `onCheckedChange` kullanılır
- DS v2 Toggle: `onLabel` + `offLabel` prop'ları zorunlu; `onChange` native input event alır
- Settings sayfası `createSettingSection` ile register edilir:
  Settings > Redirect Manager > Configuration
- PluginSettings interface: `autoRedirectOnSlugChange`, `chainDetectionEnabled`,
  `orphanRedirectEnabled` toggle'ları + `enabledContentTypes` map'i

## Kapsam Dışı (Bu Versiyon)
CSV bulk import, locale-aware redirect, A/B redirect, analytics tracking,
regex/wildcard redirect, import/export.