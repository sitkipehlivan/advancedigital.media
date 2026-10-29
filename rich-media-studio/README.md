# Rich Media Stüdyosu

`/richmedia/` sayfasındaki canlı örneklerin kaynağı.

```
rich-media-studio/
  templates/   ← şablonlar (her biri bir reklam formatı)
  assets/      ← örnek görseller: b1–b9 = 300×250, w1–w9 = 970×250, video.mp4, poster.jpg
  cgi/         ← 2.5D CGI masthead sahnesi ve render betiği
  build.py     ← şablonları siteye ve yayına hazır zip'lere derler
```

## Örnekleri değiştirmek
1. `assets/` içindeki görselleri **aynı adla** değiştirin (300×250 → `b1.jpg`…`b9.jpg`, 970×250 → `w1.jpg`…`w9.jpg`, video → `video.mp4`).
2. Ürün adları, fiyatlar ve linkler `build.py` içindeki `PRODUCTS` ve `clickTag` bloklarındadır.
3. `python3 build.py` → site demoları `src/assets/rich-media/` altına, yayına hazır paketler `dist/` altına yazılır.

## Yeni format eklemek
1. `templates/` altına yeni bir `NN-ad.html` ekleyin (`/*HEAD*/` ve `/*CONFIG*/` işaretlerini koruyun, kullandığı görselleri `<!-- NEEDS: ... -->` satırına yazın).
2. `python3 build.py` çalıştırın.
3. `src/_data/richMedia.json` dosyasına bir kayıt ekleyin (`demo.src` = şablon klasörünün adı). Sayfa, filtre ve sayaçlar otomatik güncellenir.

## Sayfa metinleri
Format açıklamaları, "Deneyin" notları ve materyal spec'leri `src/_data/richMedia.json` içindedir.
