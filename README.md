# DCC Data Source

Data source bulanan untuk interaksi Digital Contact Center — per Channel (Email/Voice/WhatsApp) dan per Produk (Perisai/E-Meterai). Frontend Vite (vanilla JS) + Chart.js, backend Cloudflare Worker (format "Workers with static assets") + D1.

## 1. Push ke GitHub

```bash
cd dcc-data-source
git add .
git commit -m "fix: pindah ke format Workers static assets"
git push
```

## 2. Buat database D1 (kalau belum)

```bash
npx wrangler login
npx wrangler d1 create dcc-data-source-db
```

Copy `database_id` yang muncul, tempel ke `wrangler.toml` (ganti `REPLACE_AFTER_CREATE_D1`). Commit & push lagi.

Jalankan schema ke database:

```bash
npx wrangler d1 execute dcc-data-source-db --remote --file=./schema.sql
```

## 3. Setting project di Cloudflare dashboard

Project sudah otomatis dibuat sebagai Worker lewat Git integration. Yang perlu dipastikan di **Settings → Build**:
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy` (default Cloudflare, jangan diubah ke `wrangler pages deploy`)

## 4. Bind D1 ke Worker ini (wajib, sekali saja)

Dashboard → project ini → **Bindings** → Add → D1 database:
- Variable name: `DB`
- D1 database: `dcc-data-source-db`

Save, lalu retry deployment terakhir supaya binding aktif.

## Struktur

- `src/main.js` — frontend (Vite, vanilla JS, Chart.js dari npm)
- `src/worker.js` — satu Worker entry point: route `/api/channel*` dan `/api/produk*` ke D1, sisanya serve static assets dari `dist/`
- `schema.sql` — schema tabel D1

## Local dev

```bash
npm install
npm run build
npx wrangler dev
```
