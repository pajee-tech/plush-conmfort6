# Plush Comfort UK — v6 fixes (20 Oct 2026)

## Why login and every /api call failed with 500 on Vercel
1. **Server crashed on start.** `api/index.ts` imported `../server` without a file extension. Because
   `package.json` has `"type": "module"`, Vercel runs it as an ES module and Node cannot find
   `/var/task/server` → every `/api/*` request returned "A server error has occurred" (500), and the
   login page showed "Unexpected token 'A'… is not valid JSON".
   **Fix:** the Express server is now bundled into one file (`dist-api/server.mjs`) by `npm run build`,
   and `api/index.js` imports that bundle.
2. **Neon was never used.** The data store only understood `mysql://` URLs. A Neon
   `postgresql://` URL was ignored and data went to `/tmp` (wiped on Vercel, different per instance).
   **Fix:** new PostgreSQL back-end (`pg`). MySQL (Hostinger) still works. Tables are created automatically.
3. **`.env` was never loaded** on Hostinger/VPS/local (dotenv was installed but not imported).
   **Fix:** `import 'dotenv/config'` at the top of `server.ts`.

## Other serverless fixes
- Every response now waits until database writes are saved (Vercel freezes the function after the response).
- Requests that change data read the latest copy from the database first; a login token made on one
  Vercel instance is found on another (forced refresh before returning 401).
- Uploaded images are also saved in the database (`pc_files` table) and served from `/uploads/...`,
  so they survive on Vercel. (Vercel limits request bodies to about 4.5 MB, so large videos must go on YouTube/Vimeo.)
- `/api/health` now shows which storage is active and any database error.
- `vercel.json`: `/uploads/*` that is not a built file is routed to the API.

## Files changed
`server.ts`, `serverlib/dataStore.ts`, `api/index.js` (replaces `api/index.ts`), `package.json`,
`package-lock.json`, `vercel.json`, `.env.example`, `.gitignore`.
