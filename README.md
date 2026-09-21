# DCC Data Source

Data source bulanan untuk interaksi Digital Contact Center — per Channel (Email/Voice/WhatsApp) dan per Produk (Perisai/E-Meterai). Frontend Vite (vanilla JS) + Chart.js, backend Cloudflare Pages Functions + D1.

## 1. Push ke GitHub

```bash
cd dcc-data-source
git init
git add .
git commit -m "init: dcc data source"
git branch -M main
git remote add origin https://github.com/<username>/dcc-data-source.git
git push -u origin main
```

## 2. Buat database D1 (sekali saja, lewat dashboard atau CLI)

Lewat CLI (butuh `npx wrangler login` sekali):

```bash
npx wrangler d1 create dcc-data-source-db
```

Copy `database_id` yang muncul, tempel ke `wrangler.toml` (ganti `REPLACE_AFTER_CREATE_D1`). Commit & push perubahan ini juga.

Jalankan schema ke database yang baru dibuat:

```bash
npx wrangler d1 execute dcc-data-source-db --remote --file=./schema.sql
```

## 3. Connect ke Cloudflare Pages via Git integration

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. Pilih repo `dcc-data-source`.
3. Build settings:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy pertama akan jalan otomatis. Setelah itu, tiap push ke `main` auto build+deploy.

## 4. Bind D1 ke project Pages (wajib, sekali saja)

Cloudflare dashboard → project ini → Settings → Functions → D1 database bindings → Add binding:
- Variable name: `DB`
- D1 database: `dcc-data-source-db`

Redeploy sekali (klik "Retry deployment" di deployment terakhir) supaya binding aktif.

## Struktur

- `src/` — frontend (Vite, vanilla JS, Chart.js dari npm — tidak bergantung CDN eksternal)
- `functions/api/channel/` — CRUD data per channel
- `functions/api/produk/` — CRUD data per produk
- `schema.sql` — schema tabel D1

## Local dev

```bash
npm install
npm run build
npx wrangler pages dev dist --d1=DB
```
