# PRD — Strapi Redirect Manager Plugin

**Versiyon:** 1.0  
**Tarih:** 2026-03-15  
**Yazar:** OverProgresser  
**Durum:** Aktif geliştirme

---

## 1. Problem Tanımı

Strapi CMS'de native redirect yönetimi yoktur. İçerik ekipleri URL değişikliklerini yönetmek için her seferinde developer müdahalesine ihtiyaç duyar:

| Mevcut Yöntem | Sorumlu | Sorun |
|---|---|---|
| `next.config.js` hardcode | Developer | Her değişiklik deploy gerektirir |
| Nginx/Apache config | DevOps | İçerik ekibi erişemez |
| Custom middleware | Developer | Kod bilgisi şart |
| Manuel JSON dosyası | Developer | Audit trail yok, hata riski yüksek |

Bu bağımlılık zinciri SEO değer kayıplarına, gecikmiş düzeltmelere ve ekipler arası gereksiz sürtüşmeye yol açar.

---

## 2. Hedef Kullanıcı

**Birincil:** Strapi tabanlı bir projede 301/302 redirect yönetiminden sorumlu kişi.

**Profil çeşitliliği:**
- SEO uzmanı — redirect stratejisini yönetir, kod yazmaz
- İçerik editörü — sayfa URL'lerini değiştirir, sonuçlarından haberdar olmak ister
- Frontend developer — redirect'leri hızlıca eklemek ister, deployment döngüsüne girmeden

**Temel ihtiyaç:** Deployment gerektirmeden, developer bağımlılığı olmadan redirect yönetmek.

---

## 3. Ürün Hedefi

Strapi v5 için, Strapi Marketplace'te genel kullanıma açık, MIT lisanslı bir plugin.

**Başarı kriterleri:**
- Bir SEO uzmanı, developer yardımı olmadan 5 dakika içinde redirect ekleyebilmeli
- Slug değiştiğinde redirect otomatik oluşturulabilmeli (toggle ile açılıp kapatılabilir)
- Yanlış konfigürasyonlar (zincir, döngü) kullanıcıya gösterilmeli ve düzeltilebilmeli
- Silinen içeriklerin bıraktığı 404'ler takip altında olmalı

---

## 4. Kapsam — v1 Özellikleri

### Özellik 1 — Manuel Redirect Yönetimi ✅ (Faza 2)
**Ne:** Admin panel'den 301/302 redirect ekleme, düzenleme, silme, aktif/pasif etme.

**Alanlar:** `from` (kaynak URL), `to` (hedef URL), `type` (301|302), `isActive`, `comment`

**Kabul kriterleri:**
- `from` ve `to` `/` ile başlamalı
- `type` yalnızca `301` veya `302` kabul eder
- Aynı `from` URL'e ikinci kayıt eklenemez (duplicate guard)
- `isActive: false` olan redirect'ler runtime'da atlanır
- Tüm CRUD işlemleri admin JWT ile korumalı

---

### Özellik 2 — Runtime Redirect Middleware (Faza 4)
**Ne:** Gelen her HTTP isteğinde `from` URL'i eşleştirip 301/302 ile yönlendiren Strapi middleware.

**Kabul kriterleri:**
- Middleware `register.ts` içinde `strapi.server.use()` ile global olarak kayıtlı
- Redirect listesi in-memory cache'de tutulur — her request'te DB sorgusu atılmaz
- Cache, redirect eklendiğinde / güncellendiğinde / silindiğinde otomatik invalidate edilir
- `isActive: false` redirect'ler cache'e alınmaz
- Eşleşme yoksa `next()` çağrılır, response üretilmez
- `Location` header'ına stack trace veya internal bilgi sızdırılmaz

---

### Özellik 3 — Slug Değişiminde Otomatik Redirect (Faza 3)
**Ne:** Strapi content-type'ında slug alanı değiştiğinde otomatik 301 redirect kaydı oluşturulur.

**Kabul kriterleri:**
- Hangi content-type'ların izleneceği plugin settings'ten yönetilir — hardcode yok
- Her content-type için URL prefix (`/blog`, `/products` vb.) settings'ten alınır
- `draftAndPublish` aktif modellerde yalnızca publish edilmiş içerik için redirect oluşturulur
- Eski slug'a yönelik ters redirect varsa silinir (döngü önleme)
- Settings'te `autoRedirectOnSlugChange: false` yapılırsa özellik devre dışı kalır
- `event.state` ile slug taşınır — module-level variable kullanılmaz

---

### Özellik 4 — Plugin Settings Sayfası (Faza 3)
**Ne:** Kullanıcının plugin davranışını konfigüre ettiği admin panel sayfası.

**Alanlar:**
- İzlenecek content-type listesi (kullanıcı kendi Strapi projesindeki modellerden seçer)
- Her content-type için URL prefix mapping
- `autoRedirectOnSlugChange` toggle
- `chainDetectionEnabled` toggle
- `orphanRedirectEnabled` toggle

**Kabul kriterleri:**
- Settings `strapi.store()` ile saklanır
- Sayfa Strapi admin "Settings" bölümünde görünür
- Content-type ve content-type-builder panel'lerinden gizlidir (`pluginOptions`)
- Kaydedilmemiş değişiklik varken sayfadan çıkılmak istenirse uyarı gösterilir (nice-to-have)

---

### Özellik 5 — Redirect Zinciri (Chain) Uyarısı (Faza 6)
**Ne:** Yeni redirect kaydedilirken A→B→C zinciri oluşacaksa kullanıcı uyarılır ve A→C'ye kısaltma önerilir.

**Kabul kriterleri:**
- Zincir kontrolü `create` ve `update` öncesinde yapılır
- Çözümleme maksimum 10 hop derinliğe kadar yapılır
- Döngüsel redirect (A→B→A) tespit edilir ve hata döndürülür
- Kullanıcıya gösterilen mesaj: hangi zincirin oluştuğu + önerilen kısa yol
- `chainDetectionEnabled: false` ise bu kontrol atlanır

---

### Özellik 6 — Orphan Redirect Listesi (Faza 7)
**Ne:** Strapi'den içerik silindiğinde URL'i kaybolur ve 404 olur. Silinme anında bir "bekleyen yönlendirme" kaydı oluşturulur, editör bunu daha sonra çözümler.

**UX akışı:**
```
İçerik silinir
  → afterDelete lifecycle tetiklenir
  → orphan_redirects tablosuna { from, status: 'pending' } kaydı düşer
  → Admin panel'de "Bekleyen Yönlendirmeler" listesinde görünür
  → Editör hedef URL girer → onaylar (status: 'resolved')
      veya "Gerek yok" der → reddeder (status: 'dismissed')
```

**Kabul kriterleri:**
- `orphan-redirect` ayrı bir content-type (`plugin::redirect-manager.orphan-redirect`)
- `status` enum: `pending | resolved | dismissed`
- Onaylama işlemi otomatik olarak aktif bir `redirect` kaydı da oluşturur
- `orphanRedirectEnabled: false` ise `afterDelete` hook atlanır
- Bekleyen kayıt sayısı admin menüsünde badge ile gösterilir (nice-to-have)

---

## 5. Kapsam Dışı — v1

Bunlar gelecek versiyon adayı olarak not edilmiştir, v1'de implement edilmez:

- CSV / bulk import
- Locale-aware redirect (Strapi i18n entegrasyonu)
- A/B test redirect (trafiği iki hedefe bölme)
- Analytics / redirect ROI tracking
- Regex / wildcard redirect
- Import/export

---

## 6. Teknik Kısıtlar

- **Strapi versiyonu:** `>=5.0.0 <6.0.0` — v4 desteklenmez
- **Node.js:** `>=18.0.0`
- **Lisans:** MIT
- **Route koruması:** Tüm plugin route'ları `type: 'admin'`
- **DB erişimi:** `strapi.db.query()` (Query Engine) — `entityService` kullanılmaz
- **Lifecycle state:** `event.state` — module-level state yasak
- **Admin hook import'ları:** `@strapi/strapi/admin` — `@strapi/helper-plugin` kullanılmaz
- **Notification type'ları:** `success`, `danger`, `info` — `warning` yok
- **DS import:** `@strapi/design-system` root'undan
- **Enum şema:** `type: 'enumeration'` + `enum: [...]` — `type: 'string'` değil
- **Open redirect:** Dış domain'e yönlendirme kabul edilmez (`to` alanı `/` ile başlamalı)

---

## 7. Güvenlik Gereksinimleri

- Tüm admin CRUD endpoint'leri Strapi admin JWT ile korumalı
- `from` ve `to` alanları `/` ile başlamalı — dış URL'e open redirect yasak
- Controller'da input validation: boş string, yanlış tip, bilinmeyen alan kabul edilmez
- Hata response'larında stack trace veya internal path sızdırılmaz
- Redirect middleware `Location` header'ına ham kullanıcı girdisi yazılmaz (sanitize edilmiş değer yazılır)

---

## 8. Geliştirme Sırası

| Faza | İçerik | Durum |
|---|---|---|
| 1 | Scaffold, package.json, LICENSE | ✅ Tamamlandı |
| 2 | `redirect` content-type, CRUD service/controller/route | ✅ Tamamlandı |
| 3 | Plugin Settings sayfası + slug auto-redirect lifecycle | 🔄 Devam ediyor |
| 4 | Runtime middleware (cache dahil) | — |
| 5 | Admin UI: redirect listesi + ekleme/düzenleme formu | — |
| 6 | Chain detection | — |
| 7 | Orphan redirect | — |

---

## 9. Marketplace Gereksinimleri

- `package.json`: `strapi.kind: "plugin"`, `name`, `displayName`, `description`, `keywords`, `repository`, `bugs`, `homepage`
- `LICENSE`: MIT
- `README.md`: kurulum, konfigürasyon, özellik açıklamaları
- `CHANGELOG.md`: keep-a-changelog formatında
- Plugin logosu: 128×128 PNG (yayın öncesi)
- `npm run verify` sıfır hata ile geçmeli