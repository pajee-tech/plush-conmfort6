# Plush Comfort UK — Production Deployment & Operations Guide

> **Note (v5):** Parts of this older manual are out of date: the recovery key, the Vercel-only deployment and the workshop address. For current instructions see **STAFF_GUIDE.md**, **SETUP_DATABASE_AND_SERVICES.md**, **SEO_AUDIT_REPORT.md** and **CHANGES_V5.md**.


**Domain:** https://plushcomfort.uk/  
**Business Address:** Calder Road, Dewsbury, WF12 9EA, United Kingdom  
**Customer Helpline / WhatsApp:** +44 7923 119077  
**Official Email:** plushcomfort@gmail.com  
**Target Market:** United Kingdom (GBP £)

---

## 1. Technology Stack & Project Structure

- **Frontend Framework:** React 19 + TypeScript (ES2022) with Vite
- **Styling & Design System:** Tailwind CSS v4, custom British luxury typography (*Playfair Display* & *Plus Jakarta Sans*)
- **Icons & Motion:** Lucide React, CSS keyframes
- **State Management & Persistence:** Browser LocalStorage synchronization with full in-app database persistence and CSV import/export capabilities
- **Server / API:** Express + tsx server runtime ready for Cloud Run / Node hosting

### Project File Structure
```
/
├── index.html                 # SEO meta tags, Google Fonts, Schema.org JSON-LD
├── metadata.json              # Applet metadata & permissions
├── package.json               # Node.js dependencies & scripts
├── DEPLOYMENT.md              # Step-by-step deployment and operations handbook
├── src/
│   ├── App.tsx                # Central client-side route manager
│   ├── main.tsx               # React root entry point
│   ├── index.css              # Tailwind CSS imports & luxury theme variables
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces for Product, Category, Order, etc.
│   ├── data/
│   │   └── initialData.ts     # Realistic UK catalogue data, buying guides & settings
│   ├── context/
│   │   └── StoreContext.tsx   # Persistent state, inventory deduction & analytics tracking
│   ├── utils/
│   │   └── imageHelper.ts     # High-fidelity SVG vectors & resilient fallbacks
│   ├── components/
│   │   ├── Header.tsx         # Brand logo, responsive menu, search, wishlist & bag count
│   │   ├── Footer.tsx         # British trust badges, Dewsbury address, legal links
│   │   ├── ProductCard.tsx    # Card layout with rating stars, pricing, fast add-to-basket
│   │   ├── CartDrawer.tsx     # Slide-over cart with free delivery progress meter
│   │   ├── SearchModal.tsx    # Live autocomplete search with event tracking
│   │   └── CookieConsent.tsx  # UK GDPR & PECR cookie banner
│   └── pages/
│       ├── HomePage.tsx       # Pixel-faithful implementation of approved homepage design
│       ├── ShopPage.tsx       # Full catalogue with filters (price, category, materials)
│       ├── CategoryPage.tsx   # Sofas & Beds landing pages with subcategories & SEO FAQs
│       ├── ProductDetailPage.tsx # Image gallery zoom, variants, dimensions, reviews
│       ├── BasketPage.tsx     # Basket review, promo voucher, postcode delivery estimator
│       ├── CheckoutPage.tsx   # UK delivery address, 2-man vs white-glove, test card/Klarna
│       ├── OrderConfirmationPage.tsx # Receipt breakdown, tracking number, print option
│       ├── AccountPage.tsx    # Order history & live workshop timeline tracker
│       ├── WishlistPage.tsx   # Saved pieces with quick move-to-basket
│       ├── SearchResultsPage.tsx # Dedicated query results
│       ├── AboutPage.tsx      # Dewsbury Yorkshire craftsmanship story
│       ├── ContactPage.tsx    # Direct WhatsApp (+44 7923 119077), phone, contact form
│       ├── DeliveryPage.tsx   # 2-man room of choice logistics, doorway clearance
│       ├── ReturnsPage.tsx    # 30-day sleep & comfort trial, collection steps
│       ├── FaqPage.tsx        # Searchable and categorized UK furniture FAQs
│       ├── PolicyPages.tsx    # UK GDPR Privacy Policy, Terms of Sale, Cookie Policy
│       ├── BlogListPage.tsx   # Content marketing hub (Sofa & Bed Pillar Guides)
│       ├── BlogDetailPage.tsx # Editorial guide reader with internal product links
│       ├── AdminDashboard.tsx # Comprehensive admin (products, stock, orders, CSV, analytics)
│       └── NotFoundPage.tsx   # Custom 404 recovery page
```

---

## 2. Required Accounts & Third-Party Services

Before launching to live UK shoppers, you will need active accounts with:

1. **Domain Registrar / DNS:** Cloudflare, Namecheap, or GoDaddy for `plushcomfort.uk`.
2. **Hosting Platform:** Google Cloud Run, Vercel, or AWS Amplify for full-stack hosting.
3. **Payment Processor (Stripe UK):**
   - Sign up at https://stripe.com/gb
   - Complete UK business entity verification (Companies House / Sole Trader).
   - Activate UK Payment Methods: Visa, Mastercard, Apple Pay, Google Pay, and Klarna.
4. **Transactional Email Service:** Resend (https://resend.com) or SendGrid for dispatch and receipt emails.
5. **Two-Man Logistics Integration:** DX Freight, Panther Logistics, or ArrowXL for two-man room-of-choice tracking numbers.
6. **Google Services:**
   - Google Search Console (submit `https://plushcomfort.uk/sitemap.xml`).
   - Google Analytics 4 (GA4).
   - Google Merchant Center (for Google Shopping organic product listings).

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env` on your production server:

```bash
# Public App URL for canonical URLs & sitemaps
APP_URL="https://plushcomfort.uk"

# Stripe UK Configuration
VITE_STRIPE_PUBLIC_KEY="pk_live_your_live_stripe_key"
STRIPE_SECRET_KEY="sk_live_your_live_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Transactional Email (Resend)
RESEND_API_KEY="re_your_api_key_here"

# Google Tag Manager / Analytics (Optional)
VITE_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

---

## 4. Payment Gateway Configuration (Test vs Live)

The website currently runs in **Safe Test Simulator Mode** so that testing checkout flows will never charge a real credit card.

### Transitioning to Live Payments:
1. In Stripe Dashboard, switch from "Test mode" to "Live mode".
2. Under **Developers > API Keys**, copy your Live Publishable and Secret keys.
3. Replace the keys in your hosting environment variables.
4. Under **Settings > Payment methods**, turn on **Klarna** to offer *Pay in 3* for orders over £250.
5. Test a £1.00 live transaction and verify the refund button functions in your dashboard before promoting publicly.

---

## 5. Domain Connection for plushcomfort.uk

1. In your domain DNS manager (e.g., Cloudflare), create the following DNS records:
   - **Type:** `CNAME` | **Name:** `@` (or `www`) | **Target:** your hosting endpoint
   - **Type:** `TXT` | **Name:** `@` | **Value:** Google Search Console verification string
2. Enable automatic SSL / TLS certificate generation (Full / Strict mode).
3. Set up an automatic 301 redirect from `http://` to `https://` and from `www.plushcomfort.uk` to `plushcomfort.uk`.

---

## 6. Pre-Launch Verification Checklist

- [x] Homepage layout, colors, typography, and badges match approved design.
- [x] Initial categories (Sofas and Beds) active and populated with verified British furniture items.
- [x] Future categories (Dining Furniture and Wardrobes) ready in database and hidden until activated in Admin.
- [x] Product variants (colours, sizes, materials) change dynamic images and prices.
- [x] Basket slide-over drawer updates quantity, calculates free UK delivery progress over £150.
- [x] Postcode coverage calculator validates UK delivery addresses.
- [x] Checkout deducts stock from inventory and records purchase analytics events.
- [x] Customer account displays live order tracking numbers and status timelines.
- [x] Buying guides and cluster articles contain working internal links to relevant furniture pieces.
- [x] Category pages feature editable bottom descriptions and FAQs.
- [x] Admin dashboard supports CSV export/import, order status updates, and setting adjustments.
- [x] Dewsbury address (`Calder Road, Dewsbury, WF12 9EA`) and phone/WhatsApp (`+44 7923 119077`) functional throughout.
- [ ] Add production Stripe API live keys to environment variables.
- [ ] Connect custom domain DNS for `plushcomfort.uk`.
