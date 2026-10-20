# Plush Comfort UK — Going Live: Database, Hosting & Services Setup

This document explains, step by step, how to:

- connect a database so every change made in the admin goes live permanently, with or without Hostinger;
- connect Google reCAPTCHA, email (SMTP) and WhatsApp for login codes;
- set up the homepage video button.

---

## 0. How saving works (read this first)

The website is a **Node.js app** (`server.ts`). It serves the storefront and the `/api` that the admin uses. Every change in the admin is sent to the server, which stores it in one of two places:

| Storage | When it is used | Good for |
|---|---|---|
| **JSON files** in `data/` | `DATABASE_URL` is **not** set | A VPS or server with a permanent disk, i.e. a single server |
| **MySQL / MariaDB** | `DATABASE_URL` **is** set | Any host, multiple servers, serverless (Vercel), and safest backups |

On the first start with MySQL, the app **creates its own table** (`pc_store`) and **copies any existing `data/*.json` into the database automatically**. You do not need to run any SQL yourself.

Uploaded images and videos are saved in `public/uploads/` (or `UPLOADS_DIR`). The host must have a **permanent disk** for uploads. A VPS or Hostinger Node.js hosting has one. Vercel and other serverless hosts do not, so see section 4.

> ⚠️ A static-only host (uploading just the `dist/` folder to `public_html`) **cannot save changes**. The admin needs the Node server running.

---

## 1. Environment variables (`.env`)

Copy `.env.example` to `.env` and fill it in. Every variable is optional except `SITE_URL` and `NODE_ENV` in production.

```env
NODE_ENV=production
PORT=3000
SITE_URL=https://plushcomfort.uk

# Database (leave empty to use JSON files in ./data)
DATABASE_URL=mysql://DB_USER:DB_PASSWORD@DB_HOST:3306/DB_NAME
DATABASE_SSL=false

# Email (OTP codes for the owner)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=no-reply@plushcomfort.uk
SMTP_PASS=your-mailbox-password
SMTP_FROM="Plush Comfort UK <no-reply@plushcomfort.uk>"

# Google reCAPTCHA v2 ("I'm not a robot")
RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=

# WhatsApp Cloud API (OTP codes by WhatsApp)
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_OTP_TEMPLATE=
WHATSAPP_TEMPLATE_LANG=en_GB
```

Optional variables:

| Variable | Default | Meaning |
|---|---|---|
| `DATA_DIR` | `./data` | Folder for JSON storage |
| `UPLOADS_DIR` | `./public/uploads` | Folder for uploaded images and videos |
| `DB_REFRESH_MS` | `3000` | How often each server re-reads the database (keeps several servers in sync) |
| `DISABLE_SSR` | `false` | `true` turns off server rendering (not recommended; it is used for SEO and speed) |

### 1.1 Build and start commands (all hosts)

```bash
npm install
npm run build        # builds the site, the server renderer and prerendered pages
npm start            # starts the production server (NODE_ENV=production tsx server.ts)
```

Check it is working at `https://your-domain/api/health`, which returns `{"ok":true,"storage":"mysql",…}` (or `"file"` when using JSON files).

The **first visit to `/admin`** shows "Create owner account". Do this straight away after going live.

---

## 2. With Hostinger

Hostinger offers two suitable options. Shared "Web hosting" (PHP only) is **not** enough on its own.

### Option A: Hostinger VPS (recommended, full control)

1. **Buy a VPS** (KVM 1 or 2 is enough) and choose **Ubuntu 24.04**. Note the server IP.
2. **Create the database:**
   - Simplest: install MySQL on the VPS itself:
     ```bash
     ssh root@YOUR_VPS_IP
     apt update && apt install -y mysql-server
     mysql -e "CREATE DATABASE plushcomfort CHARACTER SET utf8mb4;
               CREATE USER 'plush'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD';
               GRANT ALL ON plushcomfort.* TO 'plush'@'localhost'; FLUSH PRIVILEGES;"
     ```
     Your URL is then `DATABASE_URL=mysql://plush:STRONG_PASSWORD@localhost:3306/plushcomfort`.
   - Or use a Hostinger shared-hosting database (hPanel → **Databases → MySQL Databases**, then **Remote MySQL** to allow your VPS IP). The host is shown in hPanel (e.g. `srv123.hstgr.io`).
3. **Install Node.js 20+:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs git
   npm i -g pm2
   ```
4. **Upload the code.** Either `git clone` your repository into `/var/www/plushcomfort`, or upload the zip with the hPanel File Manager or SFTP and unzip it there.
5. **Create `.env`** in that folder (section 1), with `PORT=3000` and your `DATABASE_URL`.
6. **Build and run with PM2** (restarts automatically, survives reboots):
   ```bash
   cd /var/www/plushcomfort
   npm install && npm run build
   pm2 start "npm start" --name plushcomfort
   pm2 save && pm2 startup
   ```
7. **Nginx and SSL** (so the domain serves the app over HTTPS):
   ```bash
   apt install -y nginx certbot python3-certbot-nginx
   cat > /etc/nginx/sites-available/plushcomfort <<'NGINX'
   server {
     server_name plushcomfort.uk www.plushcomfort.uk;
     client_max_body_size 60M;
     location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
     }
   }
   NGINX
   ln -s /etc/nginx/sites-available/plushcomfort /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx
   certbot --nginx -d plushcomfort.uk -d www.plushcomfort.uk
   ```
8. **DNS.** In hPanel → Domains → DNS, point the `A` records for `@` and `www` to the VPS IP.
9. **Updating later:**
   ```bash
   cd /var/www/plushcomfort && git pull && npm install && npm run build && pm2 restart plushcomfort
   ```
   Data in MySQL and files in `public/uploads/` are kept. Back up `public/uploads/` before replacing the folder if you upload by zip.

### Option B: Hostinger "Node.js Web App" hosting (hPanel, no server admin)

On Business or Cloud plans that include Node.js apps:

1. hPanel → **Databases → MySQL Databases** → create a database and user, and note the name, user, password and host (`localhost` if it is on the same plan).
2. hPanel → **Websites → Add website → Node.js app** (or "Deploy Node.js app"). Upload the zip or connect GitHub.
3. Settings:
   - Node version: **20 or 22**
   - Build command: `npm run build`
   - Start command: `npm start`
   - Entry file (if asked): `server.ts`
4. Add the **environment variables** from section 1 in the app's settings, especially `DATABASE_URL` and `SITE_URL`.
5. Deploy, then open `/api/health` to check, and `/admin` to create the owner account.

> If the plan's Node app storage is reset on every deploy, keep `DATABASE_URL` set (so the data is in MySQL), and back up `public/uploads/` before redeploying. Alternatively, set `UPLOADS_DIR` to a folder outside the app directory that persists.

---

## 3. Without Hostinger

Any host that runs Node.js 20+ works. The steps are always the same: **set the env vars → `npm run build` → `npm start`**.

| Host | Database | Notes |
|---|---|---|
| **Any VPS** (DigitalOcean, Linode, AWS Lightsail, Hetzner) | MySQL on the VPS, or managed MySQL | Follow Option A above exactly |
| **Railway** | Add the "MySQL" plugin, then copy its `MYSQL_URL` into `DATABASE_URL` | Add a **Volume** mounted at `/app/public/uploads` |
| **Render** | Any external MySQL (PlanetScale-compatible, Aiven, Hostinger DB with Remote MySQL) | Web Service with build `npm install && npm run build` and start `npm start`; add a **Disk** at `/opt/render/project/src/public/uploads` |
| **Google Cloud Run** | Cloud SQL for MySQL | Uploads need a mounted bucket (Cloud Storage FUSE) for `UPLOADS_DIR` |
| **Vercel** | **Required**: external MySQL (`DATABASE_URL`, usually `DATABASE_SSL=true`) | See section 4 for uploads |

Managed MySQL services that need SSL: set `DATABASE_SSL=true`.

---

## 4. Vercel / serverless notes

The included `vercel.json` and `api/index.ts` run the API as a serverless function. Serverless functions **cannot keep files**, so:

- `DATABASE_URL` **must** be set, or nothing you save will stay.
- Image and video uploads are written to a temporary folder and **disappear**. For a store with frequent uploads, a VPS, Hostinger Node or Railway/Render with a disk is strongly recommended over Vercel.

---

## 5. Google reCAPTCHA (staff login)

1. Go to <https://www.google.com/recaptcha/admin/create>.
2. Label: "Plush Comfort admin". Type: **reCAPTCHA v2 → "I'm not a robot" Checkbox**.
3. Domains: `plushcomfort.uk` (and `localhost` if you test locally).
4. Copy the **Site key** to `RECAPTCHA_SITE_KEY` and the **Secret key** to `RECAPTCHA_SECRET_KEY`, then restart the app.

When both keys are set, the real Google checkbox appears on the Staff login and the server verifies every login with Google. When the keys are empty, a simple built-in check is shown instead (fine for testing, not for production).

---

## 6. Email codes (SMTP)

Used for owner "Sign in with a code" and "Forgot password" by email.

**Hostinger email**
1. hPanel → **Emails** → create a mailbox, e.g. `no-reply@plushcomfort.uk`.
2. Use these settings:
   ```env
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=no-reply@plushcomfort.uk
   SMTP_PASS=mailbox password
   ```

**Gmail / Google Workspace**
1. Turn on 2-Step Verification on the Google account, then create an **App password** at <https://myaccount.google.com/apppasswords>.
2. Use these settings:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=you@gmail.com
   SMTP_PASS=the 16-character app password
   ```

Set `SMTP_FROM="Plush Comfort UK <no-reply@plushcomfort.uk>"`.

> If SMTP is not configured, codes are only printed in the server log as `[DEV OTP]`. That is useful for testing, but the owner will not receive emails.

---

## 7. WhatsApp codes (WhatsApp Cloud API)

1. Create a Meta developer app at <https://developers.facebook.com/apps> (type **Business**) and add **WhatsApp**.
2. In **WhatsApp → API Setup**, add and verify your business phone number and copy the **Phone number ID**. That goes in `WHATSAPP_PHONE_NUMBER_ID`.
3. Create a **permanent access token**:
   - Business Settings → System users → add a user.
   - Generate a token with `whatsapp_business_messaging` permission.
   - That goes in `WHATSAPP_TOKEN`.
4. Create a message template in **WhatsApp Manager → Message templates**:
   - Category **Authentication**, name e.g. `login_code`, language English (UK).
   - The body uses one variable for the code, plus a copy-code button.
   - After approval, set `WHATSAPP_OTP_TEMPLATE=login_code` and `WHATSAPP_TEMPLATE_LANG=en_GB`.
5. Restart the app. Add the owner's phone number (international format, e.g. `+447…`) in **My Account**. The **WhatsApp** option on the Owner login then sends the code.

If no template is set, the app sends a plain text message instead. Meta only delivers plain text if the person messaged your business number in the last 24 hours, so use a template for reliable delivery.

---

## 8. Homepage video button (previously "Workshop Tour")

No code needed. Go to Admin → **Store Design → Homepage → Video button**:

- paste a YouTube or Vimeo link, **or**
- upload an MP4 or WebM file, max 20 MB (stored in `public/uploads/`).

Then set the button text, turn on **Show video button** and Save. With no video link the button is hidden.

To place a video manually, put the file at `public/uploads/story.mp4` and paste `/uploads/story.mp4` as the link. For long videos, YouTube is better: it loads faster and costs nothing in bandwidth.

---

## 9. Backups

- **MySQL**: `mysqldump -u plush -p plushcomfort > backup-$(date +%F).sql`. Hostinger hPanel also has automatic database backups.
- **JSON mode**: copy the `data/` folder.
- **Always**: back up `public/uploads/` (all uploaded images and videos).

## 10. Image optimisation command

All current images are WebP and under 200 KB. New uploads are converted automatically in the browser. If you ever add images directly into `public/` by FTP, run:

```bash
pip install pillow
npm run images
```

This converts the images to WebP (≤200 KB) and creates the 480/800 px sizes used for fast mobile loading.
