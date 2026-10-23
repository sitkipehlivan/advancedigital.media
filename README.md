# Advance Digital — Web Sitesi

Eleventy (11ty) ile üretilen statik site + Decap CMS blog paneli + Netlify barındırma.

```
src/
  _data/solutions.json     ← 23 ürün/çözüm (metinler, SSS, KPI'lar, görsel eşleşmeleri)
  _data/categories.json    ← çözüm kategorileri
  _data/site.json          ← iletişim, sosyal medya, GA4 (panelden de düzenlenebilir)
  blog/posts/*.md          ← blog yazıları (panelden eklenir)
  cozumler/solution.njk    ← her ürün için otomatik sayfa şablonu
  assets/                  ← css, js, font, logo, video, görseller
  admin/config.yml         ← blog paneli ayarları
  _redirects               ← eski site URL'lerinden 301 yönlendirmeler
```

## 1. GitHub'a yükleme

1. GitHub'da yeni bir repo açın: `advance-website` (private olabilir).
2. Bu klasörde:
   ```bash
   git init -b main && git add -A && git commit -m "İlk sürüm"
   git remote add origin https://github.com/KULLANICI/advance-website.git
   git push -u origin main
   ```
3. `src/admin/config.yml` içindeki `repo:` satırını kendi `KULLANICI/advance-website` adınızla güncelleyin.

## 2. Netlify'a bağlama

1. Netlify → **Add new site → Import an existing project → GitHub** → repoyu seçin.
2. Build ayarları `netlify.toml`'dan otomatik okunur (`npm run build`, yayın klasörü `_site`).
3. **Domain management** → `advancedigital.media` alan adını ekleyin, DNS'i Netlify'a yönlendirin. HTTPS otomatik gelir.
4. **Forms**: İletişim formu Netlify Forms ile çalışır. İlk deploy'dan sonra Netlify → *Forms* altında `teklif` formu görünür. *Form notifications* bölümünden gelen talepleri `sales@advancedigital.media`'ya e-posta ile yönlendirin.

## 3. Blog panelini açma (/admin)

Panel GitHub hesabıyla giriş yapar; yazı kaydedildiğinde GitHub'a commit atılır, Netlify siteyi 1–2 dakikada yeniden yayınlar.

1. GitHub → *Settings → Developer settings → OAuth Apps → New OAuth App*
   - Homepage URL: `https://advancedigital.media`
   - Authorization callback URL: `https://api.netlify.com/auth/done`
2. Oluşan **Client ID** ve **Client Secret**'ı Netlify → *Site configuration → Access & security → OAuth → Install provider → GitHub* alanına girin.
3. Yazı girecek her editörü GitHub reposuna **collaborator** olarak ekleyin.
4. `https://advancedigital.media/admin/` adresinden giriş yapın.

Panelde **Taslak → İncelemede → Yayına hazır** akışı açıktır; bir editör yazar, siz onaylarsınız. Her yazıda "İlgili çözümler" seçilirse yazı o ürün sayfalarının altında da listelenir (SEO için iç linkleme).

## 4. Yerelde çalıştırma

```bash
npm install
npm run dev          # http://localhost:8080
npm run cms          # (ayrı terminal) panel yerelde: http://localhost:8080/admin/
```

## İçerik güncelleme notları

- **Yeni ürün eklemek:** `src/_data/solutions.json`'a bir kayıt ekleyin; sayfası, menüsü, site haritası ve iletişim formu seçeneği otomatik oluşur.
- **Görseller:** Blog kapaklarını ~1600px genişlikte, sıkıştırılmış (WebP/JPG) yükleyin.
- **GA4:** Panel → Site Ayarları → GA4 kimliğini girin. KVKK metnine çerez bilgisini eklemeyi unutmayın.
- **KVKK metni** (`src/kvkk.njk`) genel bir taslaktır; yayın öncesi hukuk onayından geçirin.
- **Müşteri logoları:** Anasayfadaki marka şeridi şu an yazı ile. Logo dosyalarını gönderirseniz görsel şeride çevrilebilir.
