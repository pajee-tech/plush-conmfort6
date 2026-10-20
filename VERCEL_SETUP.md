# Vercel setup — subdomain + Neon PostgreSQL

1. Push this code to GitHub (`api/index.js` must exist; there must be NO `api/index.ts`).
2. Vercel → Project → Settings:
   - Framework preset: Vite · Build command: `npm run build` · Output directory: `dist` · Node 20/22
3. Settings → Environment Variables: copy from `.env.example` (DATABASE_URL = Neon pooled string,
   SITE_URL = your subdomain, NOINDEX = true). Then Deployments → Redeploy.
4. Settings → Domains → add `shop.plushcomfort.uk` → in Hostinger DNS add
   CNAME `shop` → the value Vercel shows. Do not touch the `@`, `www` or MX records (main site + email).
5. Open https://shop.plushcomfort.uk/api/health → `"storage":"postgres"`.
6. Open /admin → create the Owner account straight away.
7. Open /robots.txt → with NOINDEX=true it must show `Disallow: /`.

robots.txt is generated from `src/utils/seoEngine.ts` → `generateRobotsTxt()`; NOINDEX switches it.
After changing NOINDEX or SITE_URL you must Redeploy (robots.txt and sitemap are made during the build).
