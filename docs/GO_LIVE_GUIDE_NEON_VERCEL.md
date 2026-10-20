---
title: "Plush Comfort UK — Go-Live Guide"
subtitle: "Neon + Vercel fix, Hostinger option, domain/subdomain, Google indexing"
---

# 1. Problem kya thi (root cause)

Screenshot ka error `Unexpected token 'A', "A server e"... is not valid JSON` ka matlab hai: Vercel ne JSON ki jagah plain text **"A server error has occurred"** bheja. Yani `/api/*` ka serverless function **crash** ho raha tha (sab API routes 500). Code mein 3 asal masle mile:

1. **Function load hi nahi hota.** `api/index.ts` `../server` ko bina `.js` extension ke import karta hai, aur `package.json` mein `"type": "module"` hai. Node ESM mein ye `ERR_MODULE_NOT_FOUND` deta hai (local test mein reproduce hua). Fix: API ko ek single bundled file `api/index.js` mein build kiya.
2. **Code sirf MySQL support karta tha, Neon PostgreSQL hai.** `DATABASE_URL=postgresql://...` ko code chup-chaap ignore karke `/tmp` ki JSON files use karta tha. Vercel par `/tmp` har instance ka alag aur temporary hota hai, to data/login session ghayab. Fix: `serverlib/dataStore.ts` mein PostgreSQL (Neon) backend add kiya.
3. **DB writes response ke baad hoti thi.** Vercel response bhejte hi function freeze kar deta hai, is liye login session save hone se pehle kat jata tha. Fix: response se pehle saari pending writes complete hone ka wait.

Note: mujhe aap ke Vercel logs nahi dikhte. Deploy ke baad **Vercel → Project → Logs** mein confirm kar lein. Upar wali wajohat code check aur local tests (real PostgreSQL ke saath) par based hain.

# 2. Kaun si files badli

- `serverlib/dataStore.ts` — PostgreSQL/Neon backend + write flush
- `server.ts` — response se pehle pending writes ka wait
- `serverless/vercel-entry.ts` — Vercel function ka source (naya)
- `api/index.js` — bundled function (generated; `api/index.ts` hata diya)
- `package.json` — `pg`, `esbuild` add; `build:api` script; `build` pehle `build:api` chalata hai
- `vercel.json` — `*.vercel.app` par `noindex` header (taake Google sirf asli domain index kare)
- `.env.example` — Neon connection string ka example

Agar server code (`server.ts`, `serverlib/`, `src/`) badlein to `npm run build:api` chala kar `api/index.js` dobara banayein.

# 3. Method A — Neon + Vercel (recommended for abhi launch)

## 3.1 Neon
- Neon project banayein. Region UK customers ke liye London (`aws-eu-west-2`) behtar hai.
- **Connect** mein **Pooled connection** string copy karein (host mein `-pooler` hota hai). Format: `postgresql://USER:PASSWORD@ep-xxxx-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require`
- Table haath se banane ki zaroorat nahi. Pehli request par `pc_store` table khud ban jati hai.

## 3.2 Vercel environment variables
Project → Settings → Environment Variables (Production + Preview):

| Name | Value |
|---|---|
| `DATABASE_URL` | Neon pooled string (upar wali) |
| `SITE_URL` | `https://plushcomfort.uk` (aap ka final domain) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Email (owner login codes, password reset) |
| `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY` | Google reCAPTCHA v2 checkbox keys |
| `WHATSAPP_*` | Sirf agar WhatsApp codes chahiye |

- Variable ka naam bilkul `DATABASE_URL` ho (spelling/space check karein).
- `.env` file ko zip ya GitHub mein **na** daalein. Keys sirf Vercel panel mein.
- Env vars badalne ke baad **Redeploy** zaroori hai.

## 3.3 Deploy (GitHub ke bagair)
```
npm i -g vercel
vercel login
vercel link
vercel --prod
```
Ya fixed code GitHub par push karein agar wo chal jaye.

## 3.4 Check karne ke 4 steps
1. `https://YOUR-SITE/api/auth/config` kholein. Jawab mein `"storage":"postgres"` hona chahiye. Agar `"file"` hai to `DATABASE_URL` nahi parha ya redeploy nahi hua.
2. `https://YOUR-SITE/api/store/categories` — status 200 aana chahiye (500 nahi).
3. Neon → Tables mein `pc_store` dikhni chahiye.
4. `/admin` kholein. Pehli dafa **Owner (Master) setup** screen aayegi. Ye foran khud karein: pehla banda owner ban jata hai aur setup phir hamesha ke liye lock ho jata hai.

## 3.5 Vercel ki hadein (zaroor parhein)
- **Uploads:** admin se upload ki hui images/videos `/tmp` mein jati hain aur **ghayab** ho jati hain. Images ko project ke `public/uploads` mein code ke saath daalein, ya baad mein Vercel Blob/Cloudinary jaisa storage jorna paray ga (abhi code mein nahi).
- **Upload size:** Vercel function ki request body limit lagbhag 4.5 MB hai. Bari images fail hongi. Pehle compress karein.
- **SEO pages:** Vercel par server-side rendering band hai. Static pages aur `sitemap.xml` **deploy ke waqt** bante hain. Admin se naye products/blogs sitemap mein tab aayenge jab dobara build/deploy karein.

# 4. Method B — Hostinger (database + hosting)

Code MySQL ko pehle se support karta hai, to Hostinger ka MySQL seedha chal sakta hai.

- **Shared hosting par ye app nahi chalti.** Isay Node.js app chahiye: Hostinger ka Node.js web app wala plan ya VPS.
- hPanel → Databases → MySQL: database + user banayein. `DATABASE_URL=mysql://USER:PASS@HOST:3306/DBNAME`. HOST wohi likhein jo hPanel dikhaye (same server par aksar `localhost`).
- Build: `npm run build`, start command `npm start`, Node 20+. Env vars hPanel ke Node.js app settings mein.
- Is par uploads permanent disk par rehte hain, aur server-side SEO rendering kaam karti hai.
- **Hostinger database + Vercel app mat milayein.** Hostinger remote MySQL IP whitelist maangta hai aur Vercel ke IP badalte rehte hain. Shayad aap ki pehli koshishen isi wajah se fail hui hon.
- hPanel ke menu naam thore badal sakte hain; Hostinger support se Node.js app ka path confirm kar lein.

## Konsa chunein?

| | Neon + Vercel | Hostinger Node.js + MySQL |
|---|---|---|
| Aaj live hona | Aasan, 30 min | Setup zyada |
| Admin uploads | Nahi tikte | Tikte hain |
| SEO (naye products sitemap mein) | Redeploy par | Automatic |
| Kharcha | Free tier se shuru | Plan chahiye |

Mashwara: aaj Method A se live karein. Agar store mein roz upload/products add karne hain, to Method B (ya VPS) par shift karein.

# 5. Domain aur subdomain Vercel se connect karna

1. Vercel → Project → Settings → **Domains** → `plushcomfort.uk` add karein. `www.plushcomfort.uk` bhi add karein (Vercel khud alag add nahi karta).
2. Vercel jo records dikhaye wohi use karein. Aam tor par:
   - Apex (`plushcomfort.uk`): **A** record, name `@`, value `76.76.21.21`
   - `www` ya koi subdomain: **CNAME**, name sirf `www` (poora domain nahi), value wo jo Vercel dikhaye (jaise `cname.vercel-dns.com` ya project-specific)
3. Ye records wahan add hon jahan aap ke nameservers hain (Hostinger DNS Zone, Cloudflare, ya registrar). Purane A/AAAA/CNAME records jo parking ya Hostinger ko point karte hain, delete karein.
4. Vercel par status **Valid Configuration** hone tak wait (minutes se kuch ghantay). SSL khud lag jata hai.
5. Ek ko primary rakhein (apex ya www) aur doosre ko redirect karein.
6. Subdomain (jaise `staff.plushcomfort.uk`) isi project mein Domains se add hota hai aur wohi site dikhata hai. Admin `/admin` par hi rahta hai. Alag admin app chahiye to wo alag project hoga.
7. `SITE_URL` ko final domain par set karke redeploy karein.

**Ahem:** `scripts/prerender.ts` aur `src/utils/seoEngine.ts` mein default domain `https://plushcomfort.uk` likha hai (canonical, sitemap, robots). Agar aap ka domain alag hai to wahan badal kar dobara build karein.

# 6. Google par index karwana

1. Pehle domain live + HTTPS ho. `https://DOMAIN/robots.txt` aur `/sitemap.xml` browser mein khulein.
2. Google Search Console → **Add property** → **Domain** → DNS TXT record (DNS zone mein add karein) → Verify.
3. **Sitemaps** mein `sitemap.xml` submit karein.
4. **URL Inspection** mein home, `/shop`, main categories aur 2-3 blogs ke liye **Request indexing** karein.
5. `*.vercel.app` par ab `noindex` hai, to duplicate masla nahi hoga. Index sirf asli domain ka karwayen.
6. Index hone mein din se hafte lagte hain. Search Console → Pages report se progress dekhein.
7. Staff/admin, basket, checkout, account pages robots.txt mein block hain. Ye theek hai.

# 7. Aaj ka checklist

1. Neon pooled string copy
2. Vercel env vars set (`DATABASE_URL`, `SITE_URL`, SMTP, reCAPTCHA)
3. Fixed code deploy (`vercel --prod`)
4. `/api/auth/config` → `"storage":"postgres"`
5. `/admin` par Owner setup
6. Domain add + DNS records
7. `SITE_URL` + redeploy
8. Search Console + sitemap submit

# 8. Troubleshooting

| Alamat | Wajah / hal |
|---|---|
| `/api/*` 500, "A server error..." | Vercel Logs dekhein; `api/index.js` deploy mein hai? Env var theek? |
| `"storage":"file"` | `DATABASE_URL` missing/ghalat ya redeploy nahi hua |
| Login ke baad phir logout | Purana code (writes flush nahi) ya DB connect nahi |
| Neon connection error logs mein | Pooled string aur `sslmode=require` check karein |
| Domain par 404 | `www` aur apex dono add karein |
| Uploaded image gayab | Vercel `/tmp` ki had, section 3.5 |
