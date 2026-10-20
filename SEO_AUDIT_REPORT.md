# Plush Comfort UK — SEO, Page Speed & Core Web Vitals Audit

Prepared October 2026 from an SEO and digital marketing point of view. It covers:

- what was wrong;
- what has **already been fixed** in this version;
- what the business still needs to do outside the code to rank on Google.

---

## 1. Results after the fixes (Lighthouse lab tests)

| Page | Device | Performance | SEO | Accessibility | Best practices | LCP | CLS |
|---|---|---|---|---|---|---|---|
| Homepage | Desktop | **89** | **100** | 96 | 96 | 1.1 s | **0** |
| Category (Sofas) | Desktop | **99** | **100** | 94 | 96 | 0.9 s | **0** |
| Guide (pillar page) | Desktop | **99** | **100** | 94 | 96 | 0.7 s | **0** |
| Product page | Desktop | **100** | **100** | 94 | 96 | 0.7 s | 0.001 |
| Homepage | Mobile | ~70 | 100 | 96 | 96 | 3.7 s | **0** |
| Category (Sofas) | Mobile | ~70 | 100 | 94 | 96 | 3.2–4.0 s | **0** |
| Product page | Mobile | **86–90** | 100 | 94 | 96 | 2.9–3.1 s | **0** |

**Before the fixes**, mobile performance was 41–72, LCP was 4–8 s, and the guide pages had a layout shift (CLS) of 0.26, which fails Core Web Vitals.

About these numbers:
- Mobile Lighthouse simulates a slow 4G phone with a 4× slower CPU, and these tests ran on a shared test machine.
- On a real host with HTTP/2 and a CDN (Cloudflare, free), expect mobile scores of about 75–90.
- Google ranks on **real-user data** (the CrUX "Core Web Vitals" report in Search Console), not on the lab score. The thresholds that matter are **LCP < 2.5 s, INP < 200 ms and CLS < 0.1** for 75% of visits. CLS now passes everywhere. Section 4 says how to get mobile LCP under 2.5 s.

---

## 2. Problems found and fixed in this version

### 2.1 Technical SEO
| # | Problem | Fix |
|---|---|---|
| 1 | Pages were **blank HTML until JavaScript ran** (client-only React). Google had to render JS to see any content, which slowed indexing. | **Server-side rendering (SSR)**: every storefront URL is now delivered as full HTML (headings, text, prices, links). The browser then "hydrates" it. |
| 2 | Product URLs did a **301 redirect to a trailing-slash URL** (`/product/x` → `/product/x/`), wasting crawl budget and splitting signals. | Fixed. Product URLs now return 200 directly, matching the canonical. |
| 3 | Old `.jpg`/`.png` image URLs would 404 after the WebP conversion (losing Google Images traffic and backlinks). | Automatic **301 redirect** from every old image URL to its new `.webp`. |
| 4 | Schema showed a **physical shop address (Yorkshire)** although the store is online-only. This is a mismatch risk for Google Business and Merchant data. | Organization schema now uses **ContactPoint** (phone, email, hours), `sameAs` social profiles and `areaServed: GB`, with no street address. |
| 5 | Products with **no reviews still output a star rating** (a default value). This breaks Google's review-snippet policy and risks a manual action. | `aggregateRating` is only output when a product has a real `reviewCount > 0`. |
| 6 | Several guides **linked to products that do not exist** (broken internal links). | All 10 guides rewritten with links to real products and categories. |
| 7 | No default or per-page social image; OG and Twitter cards were often empty. | Each product, category, blog and page has a **Social share image** field, falling back to the feature image and then a global default. |
| 8 | Blog posts were not tied to their pillar (weak topical clusters). | Each cluster post is linked to a pillar; the pillar shows cluster cards and links; Article, Breadcrumb and FAQ schema are added. |
| 9 | Copy claimed a **10-year guarantee**, a "workshop" and a "showroom", which the business does not offer. Inaccurate claims hurt trust (E-E-A-T) and can cause disputes. | Changed site-wide to **1 Year Warranty**, 30-Day Exchange/Return and an online-store wording. |
| 10 | The product page showed "Includes UK VAT. Klarna Pay in 3…" although Klarna is not enabled. | Removed. Only the regular and sale price are shown. |

Already in place and kept: canonical URLs, XML sitemap (79 URLs), robots.txt that blocks admin, checkout, basket, account and the API, `noindex` on private pages, Product, Offer, Breadcrumb, MerchantReturnPolicy and shipping schema, and clean slugs.

### 2.2 Page speed & Core Web Vitals
| # | Problem | Fix |
|---|---|---|
| 1 | Images were JPG/PNG of 300 KB–2 MB each. | **All images converted to WebP, ≤200 KB each, max 1600 px**. Uploads are auto-converted the same way in the browser. |
| 2 | Phones downloaded full 1600 px images. | Every product and blog image has **480 px and 800 px versions** with `srcset`/`sizes`, so phones get small files. |
| 3 | The whole store, including the 300 KB staff dashboard, loaded on every page. | **Code-splitting**: the admin dashboard and most pages load only when needed. The main bundle is about 25% smaller. |
| 4 | Layout shift of 0.26 (the footer jumped) on guide pages and the homepage. | Fixed: body images reserve their size, and server HTML is delivered in order. **CLS = 0**. |
| 5 | The hero image was not prioritised. | The hero or cover image has `fetchpriority="high"`; images below the fold are `loading="lazy"`. |
| 6 | Fonts blocked the first paint. | Fonts load without blocking rendering (`display=swap` plus a preload pattern). |
| 7 | No compression. | **gzip/brotli compression** for HTML, CSS and JS; hashed assets cached for 1 year (`immutable`); uploads cached for 30 days. |

---

## 3. On-page SEO — content & keyword plan

The main UK search demand for this catalogue:

| Topic cluster | Example target keywords | Page to rank |
|---|---|---|
| Corner sofas | corner sofa, grey corner sofa, U shape sofa, crushed velvet corner sofa | `/category/sofas` (plus a corner-sofa sub-category) |
| Sofa suites | 3+2 sofa set, 3 seater sofa, sofa set deals UK | Sofas sub-categories |
| Beds | ottoman bed double, divan bed king size, upholstered bed frame, chesterfield bed | `/category/beds` and sub-categories |
| Buying guides | how to choose a sofa, sofa sizes UK, ottoman vs divan, bed sizes UK | Pillar pages and clusters (already written) |
| Commercial modifiers | cash on delivery furniture UK, free delivery sofa UK | Homepage, Delivery page |

Recommendations:
1. **One unique H1 per page**, with the main keyword near the start. Category H1s such as "Luxury Handcrafted Sofas" can be edited in Categories → SEO; consider "Sofas & Corner Sofas".
2. **Category intro text** of 150–300 words above or below the grid, each with 2–3 internal links to guides. The current descriptions are short.
3. **Unique product descriptions.** Many products share very similar supplier text. Rewrite the top 20 sellers first and include dimensions, fabric, firmness, delivery and assembly.
4. **Alt text** for every image, saying what the photo shows (e.g. "Lilly grey corner sofa with bolster cushions"). Edit it in the product or blog image fields.
5. **Publish two cluster articles per month** under the existing pillars, and link every new post to 2–3 products and its pillar.
6. Add **sub-category landing pages** for high-volume terms such as Corner Sofas, U-Shape Sofas, Ottoman Beds and Divan Beds, each with its own text and FAQ.

---

## 4. Getting mobile Core Web Vitals fully green

1. **Put the site behind Cloudflare (free plan).**
   - Proxy DNS, turn on Brotli, HTTP/3 and "Cache Everything" for `/assets/*` and `/uploads/*`.
   - This usually cuts mobile LCP by 0.5–1.5 s for UK visitors.
2. **Host close to the UK.** Choose a London, Frankfurt or Amsterdam region for the VPS or Node app.
3. **Keep hero images light.** Upload hero and cover photos about 1600×1000 and let the system compress them. Do not upload images with text baked in.
4. **Limit third-party scripts.** Add Google Analytics 4 or Tag Manager **once**, with no extra chat widgets or heat-map tools on every page. Each one adds 100–500 ms of blocking time.
5. **Monitor real users.** Search Console → *Core Web Vitals* and <https://pagespeed.web.dev> (the "field data" section) 28 days after launch.

---

## 5. Off-page, local & trust signals (business actions — not code)

| Priority | Action | Why |
|---|---|---|
| 🔴 High | **Google Search Console**: verify the domain (paste the code in Settings & SEO), submit `https://plushcomfort.uk/sitemap.xml`, and request indexing of the homepage, categories and pillars. | Faster indexing; see errors and Core Web Vitals |
| 🔴 High | **Google Merchant Center** (free listings): submit products, using the existing price, availability and returns schema or a feed. | Free product listings in Google Shopping; a big traffic source for furniture |
| 🔴 High | **Real customer reviews**: Trustpilot, Google Customer Reviews or Reviews.io. Show only real ratings. | Star ratings in results and trust. Never invent reviews; Google penalises it. |
| 🟠 Medium | **Google Business Profile** as a *service-area business* (no public address) covering the UK. | Brand searches, map visibility and reviews |
| 🟠 Medium | **Backlinks**: UK home-interior blogs, "best corner sofas UK" round-ups, local news and supplier pages; offer product photos or guides. | Authority; the biggest ranking factor after content |
| 🟠 Medium | **Social profiles**: fill all 6 social links in Store Design → Footer and post product photos and Reels weekly. | `sameAs` brand signals and referral traffic |
| 🟢 Later | GA4 e-commerce events (view_item, add_to_cart, purchase) | Measure which pages sell |

---

## 6. Data clean-up before launch

- **Sample orders**: the demo orders in `src/data/initialData.ts` (`INITIAL_ORDERS`) use made-up customers. They are only shown in the admin, but delete or ignore them once real orders arrive.
- **Review counts**: some imported products carry `rating`/`reviewCount` values from the original import. Keep them only if they match real reviews. The stars and rating schema are now shown **only when `reviewCount` is above 0**, and new products start with 0 reviews. Once a reviews service (Trustpilot, Reviews.io) is connected, use its real numbers.
- **"Handcrafted" wording** remains in some product and category names. It is fine if accurate. Otherwise edit it in Products and Categories.
- **Policy pages** still describe Stripe and Klarna as future options. Update the wording if those will not be used.

---

## 7. Launch checklist

- [ ] `SITE_URL=https://plushcomfort.uk` set (canonical, sitemap and OG URLs depend on it)
- [ ] Owner account created at `/admin`; reCAPTCHA keys added
- [ ] Database connected (`/api/health` shows `"storage":"mysql"`) or a VPS disk confirmed
- [ ] Cloudflare in front, HTTPS forced, `www` → non-www redirect (or the reverse; pick one)
- [ ] Search Console verified, sitemap submitted
- [ ] Merchant Center feed live
- [ ] Social links and default social share image set
- [ ] PageSpeed Insights checked on homepage, one category, one product and one guide
