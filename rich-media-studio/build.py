#!/usr/bin/env python3
"""Advance Rich Media Stüdyosu: şablon derleyici.

Kullanım:
  python3 build.py            # site demolarını üretir + yayına hazır zip paketlerini dist/ altına koyar
  python3 build.py --site     # sadece site demolarını üretir
  python3 build.py --zip      # sadece zip paketlerini üretir

templates/*.html içindeki /*HEAD*/ ve /*CONFIG*/ işaretleri aşağıdaki ortak bloklarla değiştirilir.
- Site demoları: ../src/assets/rich-media/<şablon>/index.html  (görseller ortak klasörden: _ortak/)
- Zip paketleri: dist/<şablon>.zip  (her biri kendi görselleriyle, tek başına yayına hazır)
Örnek görselleri değiştirmek için assets/ içindeki dosyaları aynı adla değiştirip bu betiği çalıştırın.
"""
import os, re, shutil, sys, zipfile

ROOT = os.path.dirname(os.path.abspath(__file__))
TEMPLATES = os.path.join(ROOT, "templates")
ASSETS = os.path.join(ROOT, "assets")
SITE_OUT = os.path.join(ROOT, "..", "src", "assets", "rich-media")
DIST = os.path.join(ROOT, "dist")
ASSET_RE = r"[\w\-]+\.(?:jpg|png|mp4|webm|woff2)"

HEAD = r"""
        /* ===== Marka ayarları: başka markaya uyarlarken sadece burayı değiştirin ===== */
        :root {
            --brand: #f15a22;      /* ana renk */
            --brand2: #e5262b;     /* koyu ton */
            --brand3: #ff8a1e;     /* açık ton */
            --ink: #3b1d12;        /* metin */
            --paper: #ffffff;      /* zemin */
            --soft: #fff4ec;       /* yumuşak zemin */
        }
        @font-face {
            font-family: 'BrandFont';
            src: url('nunito-900.woff2') format('woff2');
            font-weight: 900;
            unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
        }
        @font-face {
            font-family: 'BrandFont';
            src: url('nunito-900-ext.woff2') format('woff2');
            font-weight: 900;
            unicode-range: U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { margin: 0; overflow: hidden; background: transparent; }
        body {
            font-family: 'BrandFont', 'Arial Rounded MT Bold', Arial, sans-serif;
            font-weight: 900;
            -webkit-font-smoothing: antialiased;
            user-select: none;
            -webkit-user-select: none;
        }
        .btn {
            background: linear-gradient(135deg, var(--brand3) 0%, var(--brand) 55%, var(--brand2) 100%);
            color: #fff;
            border: 2px solid #fff;
            border-radius: 999px;
            font: inherit;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(180, 40, 0, 0.35);
            transition: transform 0.2s ease;
        }
        .btn:hover { transform: scale(1.05); }
"""

CONFIG = r"""
        /* ===== ClickTag tanımları: her ürün kendi clickTag'ine gider ===== */
        var clickTag  = "https://www.civilim.com";
        var clickTag1 = "https://www.civilim.com";
        var clickTag2 = "https://www.civilim.com";
        var clickTag3 = "https://www.civilim.com";
        var clickTag4 = "https://www.civilim.com";
        var clickTag5 = "https://www.civilim.com";
        var clickTag6 = "https://www.civilim.com";
        var clickTag7 = "https://www.civilim.com";
        var clickTag8 = "https://www.civilim.com";
        var clickTag9 = "https://www.civilim.com";

        /* ===== Ürün listesi: b = 300x250 banner, w = 970x250 banner ===== */
        var PRODUCTS = [
            { name: "Molfix Bebek Bezi",            short: "Bebek Bezi",  price: "250 TL",       b: "b1.jpg", w: "w1.jpg" },
            { name: "Konuşan Bebek & Araba",        short: "Oyuncak",     price: "550 TL'den",   b: "b2.jpg", w: "w2.jpg" },
            { name: "Panduf & Eşofman Takımı",      short: "Panduf",      price: "150 TL'den",   b: "b3.jpg", w: "w3.jpg" },
            { name: "Philips Avent Emzik & Biberon",short: "Emzik",       price: "400 TL'den",   b: "b4.jpg", w: "w4.jpg" },
            { name: "Eşofman & Spor Ayakkabı",      short: "Eşofman",     price: "650 TL'den",   b: "b5.jpg", w: "w5.jpg" },
            { name: "Oyun Parkı & Bebek Arabası",   short: "Oyun Parkı",  price: "4.900 TL'den", b: "b6.jpg", w: "w6.jpg" },
            { name: "Oto Koltuğu & Bebek Arabası",  short: "Oto Koltuğu", price: "9.990 TL'den", b: "b7.jpg", w: "w7.jpg" },
            { name: "Pijama & Panduf",              short: "Pijama",      price: "390 TL",       b: "b8.jpg", w: "w8.jpg" },
            { name: "Zıbın Seti & Bakım Çantası",   short: "Zıbın Seti",  price: "790 TL",       b: "b9.jpg", w: "w9.jpg" }
        ];

        function exitClick(e) {
            if (e) e.stopPropagation();
            window.open(clickTag, '_blank');
        }
        function productClick(i, e) {
            if (e) e.stopPropagation();
            window.open(window['clickTag' + (i + 1)] || clickTag, '_blank');
        }
"""


def render(name):
    src = open(os.path.join(TEMPLATES, name + ".html"), encoding="utf-8").read()
    html = src.replace("/*HEAD*/", HEAD).replace("/*CONFIG*/", CONFIG)
    used = set(re.findall(ASSET_RE, html))
    need = re.search(r"NEEDS:\s*([^\n]*?)\s*-->", src)
    if need:
        keep = set(need.group(1).split())
        used = {f for f in used if not re.fullmatch(r"[bw]\d+\.jpg", f) or f in keep}
    used = {f for f in used if os.path.exists(os.path.join(ASSETS, f))}
    return html, used


def build_site(names):
    shared = os.path.join(SITE_OUT, "_ortak")
    os.makedirs(shared, exist_ok=True)
    for n in names:
        html, used = render(n)
        for f in used:
            shutil.copy(os.path.join(ASSETS, f), shared)
            html = re.sub(r"(?<![\w/.\-])" + re.escape(f), "../_ortak/" + f, html)
        dest = os.path.join(SITE_OUT, n)
        os.makedirs(dest, exist_ok=True)
        open(os.path.join(dest, "index.html"), "w", encoding="utf-8").write(html)
        print("site ", n)


def build_zip(names):
    os.makedirs(DIST, exist_ok=True)
    for n in names:
        html, used = render(n)
        with zipfile.ZipFile(os.path.join(DIST, n + ".zip"), "w", zipfile.ZIP_DEFLATED) as z:
            z.writestr("index.html", html)
            for f in sorted(used):
                z.write(os.path.join(ASSETS, f), f)
        print("zip  ", n, round(os.path.getsize(os.path.join(DIST, n + ".zip")) / 1024), "KB")


if __name__ == "__main__":
    names = [f[:-5] for f in sorted(os.listdir(TEMPLATES)) if f.endswith(".html")]
    mode = sys.argv[1] if len(sys.argv) > 1 else "--all"
    if mode in ("--all", "--site"):
        build_site(names)
    if mode in ("--all", "--zip"):
        build_zip(names)
