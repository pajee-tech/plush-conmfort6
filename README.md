# Plush Comfort UK — Luxury Handcrafted Furniture Store

**Official Storefront & Operations Manual**  
**Workshop & Showroom:** Calder Road, Dewsbury, WF12 9EA, United Kingdom  
**Helpline & WhatsApp Support:** +44 7923 119077  
**Official Email:** plushcomfort@gmail.com  
**Primary Currency:** GBP (£)

---

## 📚 Documentation (v5)
| Document | For |
|---|---|
| [STAFF_GUIDE.md](./STAFF_GUIDE.md) | Staff & owner: how every admin feature works (variations, colours, categories, blogs and pillars, design, SEO images, logins) |
| [SETUP_DATABASE_AND_SERVICES.md](./SETUP_DATABASE_AND_SERVICES.md) | Going live: database (with or without Hostinger), reCAPTCHA, email, WhatsApp, video button, backups |
| [SEO_AUDIT_REPORT.md](./SEO_AUDIT_REPORT.md) | SEO, page speed and Core Web Vitals audit, plus the launch checklist |
| [CHANGES_V5.md](./CHANGES_V5.md) | Every requested change and where it lives |

## 1. Quick Start & Development Commands

```bash
# 1. Install dependencies
npm install

# 2. Start local development server with Express backend & Vite middleware
npm run dev

# 3. Type check & lint
npm run lint

# 4. Production build & static site SEO prerendering
npm run build

# 5. Start production server
npm run start
```

---

## 2. Layout Shift (CLS) Fix & Unstyled Text Resolution

### The Issue (What was happening before)
When loading the storefront or refreshing a page, an unstyled list of links and text was flashing on the screen for a brief moment before the React app loaded (as seen in `image.png`):
- Plain black Times New Roman text: *"Home, All Collections, Sofas, Chesterfield Sofas..."*
- Massive layout shift (CLS) and flashing unstyled content (FOUC).

### The Root Cause
During static site prerendering (`scripts/prerender.ts`) and SSR (`server.ts`), semantic crawler HTML was being injected directly into `<div id="root"></div>` without styling. When a browser requested the page, it rendered this raw text before the JavaScript bundle downloaded and mounted React.

### The Permanent Fix Applied
1. **Zero-CLS Luxury App Shell:** `<div id="root">` now contains a lightweight, zero-layout-shift luxury preloader styled with inline CSS matching the Plush Comfort UK brand palette (`#FAF8F5`, *Playfair Display*, warm cognac accent).
2. **Crawler-Safe Semantic Content:** The semantic headings, product links, and category hierarchy are now encapsulated inside `<noscript id="seo-noscript-content">` and a crawler-accessible container (`#seo-crawler-content`).
3. **100% SEO Preservation:** Search engine crawlers (Googlebot, Bingbot, etc.) still index every product, category link, meta tag, and JSON-LD structured data block without any visual flash or layout shift for real human shoppers.

---

## 3. Cash on Delivery (COD) Store Configuration

Per your operational requirements, **Cash on Delivery (Pay on Handover)** is now the **sole active payment method** on the storefront. All other payment methods (Cards, Klarna, Bank Transfer) have been safely hidden from customers while keeping the underlying code intact for future activation.

### How Cash on Delivery Operates:
- **Zero Upfront Charge:** Customers pay **£0** at online checkout.
- **2-Man Room of Choice Logistics:** The delivery team transports the sofa or bed into the customer's room of choice, unpacks it, and allows the customer to inspect the fabric seams, upholstery, and comfort before paying.
- **Payment Collection:** The customer settles payment (cash or card) directly with the delivery team on handover.
- **Order Status:** Orders are automatically placed in `fulfilmentStatus: "processing"` with `paymentStatus: "pending"` until collected upon delivery.
- **Clear Badges & Messaging:** The Checkout page, Order Confirmation receipt, Customer Account timeline, Footer, and FAQs all consistently reflect Cash on Delivery.

---

## 4. How to Re-Enable Other Payment Methods in the Future

When you are ready to accept online credit/debit cards, Klarna, or bank transfers, follow the step-by-step instructions below.

### Step 1: Turn On Alternative Methods in Code
Open `src/pages/CheckoutPage.tsx`:
Find line 39:
```tsx
// Change this flag from false to true:
const ENABLE_OTHER_PAYMENT_METHODS = true;
```
Setting this to `true` instantly re-renders the payment selection tabs (Credit/Debit Card, Klarna Pay in 3, and Bank Transfer BACS) alongside Cash on Delivery.

---

### Step 2: Setting Up Stripe (Credit & Debit Cards, Apple Pay, Google Pay)
1. **Create / Log In to Stripe UK:**
   - Go to [https://stripe.com/gb](https://stripe.com/gb).
   - Complete your UK business verification (Companies House registration or Sole Trader details).
2. **Get Your API Keys:**
   - In Stripe Dashboard, navigate to **Developers > API Keys**.
   - Copy **Publishable key** (`pk_live_...` or `pk_test_...`).
   - Copy **Secret key** (`sk_live_...` or `sk_test_...`).
3. **Configure Environment Variables:**
   - In your `.env` file (or Vercel / Cloud Run environment settings):
   ```env
   VITE_STRIPE_PUBLIC_KEY="pk_live_your_actual_key"
   STRIPE_SECRET_KEY="sk_live_your_actual_key"
   STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
   ```
4. **Enable Apple Pay & Google Pay:**
   - In Stripe Dashboard, go to **Settings > Payment methods**.
   - Turn on **Apple Pay** (register your domain `plushcomfort.uk`) and **Google Pay**.

---

### Step 3: Setting Up Klarna Pay in 3 (Spread the Cost)
1. **Activate Klarna inside Stripe:**
   - In Stripe Dashboard, go to **Settings > Payment methods**.
   - Find **Klarna** and click **Activate**.
   - Stripe will automatically enable Klarna for UK shoppers (Pay in 3 interest-free installments).
2. **Klarna Direct (Alternative):**
   - If using Klarna Merchant Portal directly: sign up at [https://www.klarna.com/uk/business/](https://www.klarna.com/uk/business/) and obtain your Klarna API credentials.
3. The checkout already has the installment calculator built in:
   `Pay in 3 interest-free payments of £{(finalTotal / 3).toFixed(2)}`.

---

### Step 4: Setting Up Bank Transfer (BACS Wire)
To update your official bank transfer details for direct customer wires:
1. Open `src/pages/CheckoutPage.tsx`.
2. Locate the `bank_transfer` section:
```tsx
<p>Account Name: Plush Comfort Ltd</p>
<p>Sort Code: 20-45-77 · Account Number: 88192033</p>
```
3. Replace the placeholder Sort Code and Account Number with your real business bank account details.

---

## 5. Deployment Guide & Preventing Deployment Warnings

### Vercel Deployment
1. Connect your GitHub repository to Vercel.
2. Build Settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. Environment Variables to add in Vercel Dashboard:
   - `APP_URL`: `https://plushcomfort.uk` (or your Vercel deployment URL)
   - `NODE_ENV`: `production`
4. The repository includes:
   - `vercel.json` with rewrites for clean URLs, `/api` serverless handler, `/sitemap.xml`, and `/robots.txt`.
   - `api/index.ts` connecting the Express backend API for serverless operation on Vercel.

### Preventing Common Build / Deployment Warnings:
1. **`tsx: command not found` warning:** `tsx` is included in `"dependencies"` in `package.json` so production builds where `devDependencies` are omitted will still run `tsx scripts/prerender.ts` without error.
2. **Chunk Size Warnings:** `vite.config.ts` has `chunkSizeWarningLimit: 1600` configured so large luxury assets and rich components build cleanly without warnings.
3. **Schema Warnings in Google Search Console:** All products have valid `offers` schema including `priceCurrency`, `priceValidUntil`, `hasMerchantReturnPolicy` (30 days finite return window), and `shippingDetails` (free UK mainland delivery).

---

## 6. Staff & Owner Portal (`/admin`)

### Clear Navigation & Staff Branding:
- **Button in Header & Mobile Menu:** The ambiguous "Admin" button has been replaced with **"Staff & Owner"** (with a lock icon and tooltip *"Restricted — Staff & Owner Portal Only"*, plus a *"Staff Only"* badge on mobile). Customers and visitors immediately understand that this portal is strictly for authorized store personnel and not for shoppers.
- **Discreet Footer Link:** A discreet *"Staff & Owner Portal"* link with `rel="nofollow"` is placed in the bottom legal row.

### Login, accounts & security (v5)
- **Staff accounts are created only by the Owner** (Staff & Roles tab). There is no public sign-up.
- **Staff tab**: email, password and Google reCAPTCHA v2. "Forgot password?" sends a request to the Owner, who sets a new password.
- **Owner tab**: password login, **sign in with a 6-digit code** (email or WhatsApp), and **forgot password by email/WhatsApp code**. The old recovery key has been removed.
- Every login, logout, failed attempt, password creation or change, code sent and session revoke is written to the security log. Store changes are written to the store log.
- Full staff instructions: **[STAFF_GUIDE.md](./STAFF_GUIDE.md)**. Setup of reCAPTCHA, SMTP, WhatsApp, the database and hosting: **[SETUP_DATABASE_AND_SERVICES.md](./SETUP_DATABASE_AND_SERVICES.md)**.

### Google Search Engine No-Index Protection:
To ensure Google and other search engines **never index or rank administrative or checkout pages**:
- `<meta name="robots" content="noindex, nofollow, noarchive" />` is dynamically enforced in document `<head>` on all `/admin`, `/checkout`, `/basket`, and `/account` views.
- `<meta name="googlebot" content="noindex, nofollow, noarchive" />` is explicitly set to prevent Googlebot crawling or caching snippets.
- `robots.txt` explicitly disallows `/admin` and `/admin/`.
- `sitemap.xml` strictly excludes `/admin` and all internal portal routes.
- Prerendering skips `/admin` so no sensitive administrative HTML is pre-baked into public static assets.
