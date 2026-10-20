# Plush Comfort UK — Store Website, Admin Dashboard & Technical Operations Manual

> **Note (v5):** Parts of this older manual are out of date: the recovery key, the Vercel-only deployment and the workshop address. For current instructions see **STAFF_GUIDE.md**, **SETUP_DATABASE_AND_SERVICES.md**, **SEO_AUDIT_REPORT.md** and **CHANGES_V5.md**.


**Document Version:** 1.0.0  
**Effective Date:** October 2026  
**Website URL:** https://plushcomfort.uk/  
**Company:** Plush Comfort UK  
**Support Helpline / WhatsApp:** +44 7923 119077  
**Official Email:** plushcomfort@gmail.com  

---

## Executive Summary

This manual serves as the single source of truth for managing, editing, configuring, troubleshooting, and extending the **Plush Comfort UK** luxury e-commerce web platform. 

This store is a custom, high-performance Single-Page Application (SPA) engineered with React 19, Vite 8, TypeScript 7, and Tailwind CSS 4. It comes pre-loaded with the verified catalogue of 19 handcrafted British sofas, ottoman beds, and living room furniture pieces, 9 SEO-optimised categories, 10 pillar and cluster buying guides, a built-in Client-Side CMS, a WooCommerce CSV migration engine, and an internal Administrator Operations Portal.

---

## Table of Contents

1. [Project Overview and Technology Stack](#1-project-overview-and-technology-stack)
2. [Complete Project Folder and File Structure](#2-complete-project-folder-and-file-structure)
3. [Frontend Website Editing Manual](#3-frontend-website-editing-manual)
4. [Hero Section and Image Management Guide](#4-hero-section-and-image-management-guide)
5. [Admin Dashboard: Access and Complete User Operations](#5-admin-dashboard-access-and-complete-user-operations)
6. [Product Management Guide](#6-product-management-guide)
7. [Product Category Management](#7-product-category-management)
8. [Complete SEO Management Manual](#8-complete-seo-management-manual)
9. [Content Management and Copywriting Guide](#9-content-management-and-copywriting-guide)
10. [Database Architecture and Data Persistence](#10-database-architecture-and-data-persistence)
11. [Backend, APIs, and Business Logic](#11-backend-apis-and-business-logic)
12. [Code Editing and Customisation Guide](#12-code-editing-and-customisation-guide)
13. [Environment Variables, Secrets, and Integrations](#13-environment-variables-secrets-and-integrations)
14. [Deployment and Hosting Operations Manual](#14-deployment-and-hosting-operations-manual)
15. [Security and Access Management](#15-security-and-access-management)
16. [Troubleshooting Guide](#16-troubleshooting-guide)
17. [Master Change Impact and Dependency Map](#17-master-change-impact-and-dependency-map)
18. [Testing and Quality Assurance Protocols](#18-testing-and-quality-assurance-protocols)
19. [Maintenance and Operations Schedule](#19-maintenance-and-operations-schedule)
20. [Glossary of Technical Terms](#20-glossary-of-technical-terms)
21. [Audit Summary and Unimplemented Features Matrix](#21-audit-summary-and-unimplemented-features-matrix)

---

## 1. Project Overview and Technology Stack

### 1.1 Technology Architecture

The Plush Comfort UK store is built using modern, lightweight frontend engineering practices to deliver rapid loading speeds and resilient client-side execution.

| Layer | Technology | Version | Purpose in Project |
|---|---|---|---|
| **Frontend Framework** | React | `^19.0.1` | Component-based UI and dynamic DOM rendering |
| **DOM Engine** | React DOM | `^19.0.1` | Web browser mounting and reconciliation |
| **Language** | TypeScript | `^7.0.2` | Strong static typing across products, orders, categories, and settings |
| **Build Tool & Bundler** | Vite | `^8.3.0` (8.3.4) | Lightning-fast dev server and optimised production asset rollups |
| **Styling Framework** | Tailwind CSS | `^4.3.3` | Modern utility-first CSS via `@tailwindcss/vite` |
| **Iconography** | Lucide React | `^0.546.0` | Crisp vector icons (trucks, stars, search, shopping bag, etc.) |
| **UI Motion** | Motion | `^12.23.24` | Animation and transition acceleration |
| **State Management** | React Context (`StoreContext`) | React 19 Native | Global store state, cart, wishlist, orders, and catalogue |
| **Data Persistence** | Browser `localStorage` | HTML5 Standard | Client-side persistent cache for catalogue, orders, and settings |
| **Seed Data Layer** | Static TypeScript Objects | `src/data/initialData.ts` | 19 authentic products, 9 categories, 10 articles, and settings |
| **Deployment Server** | Static SPA / Vercel | Vercel Edge / Static | Single-Page Application with client-side rewrite rules (`vercel.json`) |

### 1.2 System Architecture Diagram

```
+-------------------------------------------------------------------------------------------------+
|                                    CLIENT BROWSER (User & Admin)                                 |
+-------------------------------------------------------------------------------------------------+
                                                |
                                    HTTP/HTTPS Requests (Port 80/443)
                                                v
+-------------------------------------------------------------------------------------------------+
|                                    VERCEL / CDN STATIC EDGE                                     |
|  - vercel.json (Rewrites all paths /(.*) to index.html for SPA routing)                        |
|  - dist/assets/ (Minified JavaScript, Tailwind CSS, chunk assets)                               |
|  - public/ (Logo, downloaded high-res product photos, icons)                                    |
+-------------------------------------------------------------------------------------------------+
                                                |
                                      Loads Application Bundle
                                                v
+-------------------------------------------------------------------------------------------------+
|                               REACT 19 APPLICATION (src/App.tsx)                                |
|                                                                                                 |
|   +-----------------------------------------------------------------------------------------+   |
|   |                       StoreProvider (src/context/StoreContext.tsx)                      |   |
|   |  Initializes from:                                                                      |   |
|   |    1. localStorage keys ('plush_comfort_products_v4', etc.)                             |   |
|   |    2. Default Seed Fallback: src/data/initialData.ts (19 real products, 9 categories)   |   |
|   |  Provides:                                                                              |   |
|   |    - Catalogue & Stock Operations (Add, Edit, Delete, Duplicate)                        |   |
|   |    - Cart & Checkout Calculations (Discounts, Delivery Tiers, Total)                    |   |
|   |    - Order State & Tracking (Statuses: Pending, Processing, Dispatched)                 |   |
|   |    - CMS & Buying Guides (Pillar pages, Cluster articles)                               |   |
|   |    - Store Settings (Logo, Delivery Fees, Contact Info, Banner)                         |   |
|   +-----------------------------------------------------------------------------------------+   |
|                                                |                                                |
|             +----------------------------------+----------------------------------+             |
|             |                                                                     |             |
|             v                                                                     v             |
|    CUSTOMER STOREFRONT PAGES                                           ADMIN CMS PORTAL         |
|    - HomePage (/): Interactive 5-Piece Hero                            - Passkey Gate: 'plush2026'
|    - ShopPage (/shop): Catalogue Filters                               - Overview & Metrics     |
|    - CategoryPage (/category/:slug): 9 Categories                      - Products Management    |
|    - ProductDetailPage (/product/:slug): 19 Products                    - Category Management    |
|    - Basket & Checkout (/basket, /checkout)                            - Order Management       |
|    - Account & Tracking (/account)                                     - Content CMS & Silos    |
|    - Blog & Guides (/blog, /blog/:slug)                                - Store Settings & Logo  |
|    - Legal & Trust (/delivery, /returns, /about)                       - WooCommerce CSV Tool   |
+-------------------------------------------------------------------------------------------------+
```

### 1.3 Key Architectural Distinctions: Database & Backend Realities

* **Database Reality**: The application currently uses **Browser `localStorage`** combined with **Static Seed Data** (`src/data/initialData.ts`). There is **no live remote SQL (PostgreSQL/MySQL) or NoSQL (MongoDB/Firestore)** active in production. Changes made in the Admin Dashboard persist in the administrator's local browser storage.
* **Backend Reality**: The application currently runs as a **pure client-side SPA**. While `express` and `@types/express` are present in `package.json`, there is no active `server.ts` process handling server-side API requests. All routing is performed client-side inside `App.tsx` and `StoreContext.tsx`.

---

## 2. Complete Project Folder and File Structure

### 2.1 File Tree Layout

```
.
├── .env.example                     # Environment variable reference template
├── .gitignore                       # Git ignore rules for node_modules, dist, etc.
├── DEPLOYMENT.md                    # Standard deployment instructions
├── SEO_CONTENT_MAP.md               # Pillar/cluster content blueprint
├── STORE_WEBSITE_ADMIN_AND_TECHNICAL_MANUAL.md  # THIS COMPREHENSIVE MANUAL
├── index.html                       # HTML5 entry point with fonts & Schema.org JSON-LD
├── metadata.json                    # Project metadata & permissions
├── package.json                     # NPM dependencies, scripts, and build tasks
├── tsconfig.json                    # TypeScript compiler options
├── vercel.json                      # Vercel SPA URL routing rewrites
├── vite.config.ts                   # Vite bundler, Tailwind plugin, and path aliases
├── public/                          # Static public web assets
│   ├── logo.png                     # Official Plush Comfort brand logo (root copy)
│   ├── assets/
│   │   └── brand/
│   │       └── plush-comfort-official-logo.png  # Primary official transparent PNG logo
│   └── uploads/
│       └── products/                # 70+ downloaded high-resolution product photos
├── scripts/                         # Build and migration tools
│   ├── build_initial_data.js        # Script compiling initialData.ts
│   ├── fetch_data.js                # Product and logo scraping utility
│   ├── generate_products.js         # Transformer script mapping products
│   ├── prepared_19_products.json    # Intermediary JSON data
│   └── scraped_products.json        # Raw scraped WooCommerce items
└── src/                             # Source code root
    ├── App.tsx                      # Primary client-side view switch & layout wrapper
    ├── index.css                    # Tailwind CSS v4 directives & font declarations
    ├── main.tsx                     # React 19 root bootstrap mounting to #root
    ├── components/                  # Reusable UI widgets
    │   ├── BrandLogo.tsx            # Official logo renderer with multi-tier fallback
    │   ├── CartDrawer.tsx           # Slide-over mini basket with delivery meter
    │   ├── CookieConsent.tsx        # UK GDPR & PECR cookie compliance banner
    │   ├── Footer.tsx               # Store footer with Dewsbury address & legal links
    │   ├── Header.tsx               # Main top bar, announcement banner, and nav triggers
    │   ├── MegaMenu.tsx             # Interactive mega menu with real product spotlights
    │   ├── ProductCard.tsx          # Grid product card with price, tags, and wishlist
    │   ├── SearchModal.tsx          # Real-time search popup with auto-suggestions
    │   ├── admin/                   # Dedicated admin tools
    │   │   ├── OfficialBrandLogoManager.tsx     # In-browser logo upload & URL updater
    │   │   └── WooCommerceProductImporter.tsx   # RFC 4180 CSV parser & migration wizard
    │   └── cms/                     # Built-in CMS components
    │       ├── CmsDashboard.tsx     # CMS table, silo view, and SEO audit panel
    │       ├── ContentEditor.tsx    # Markdown editor with internal linking assistant
    │       ├── PillarClusterTree.tsx# Visual hierarchy tree of guide topics
    │       └── SitemapModal.tsx     # Dynamic XML sitemap generator
    ├── context/
    │   └── StoreContext.tsx         # Central state manager, cart, stock, and storage sync
    ├── data/
    │   └── initialData.ts           # 19 real products, 9 categories, 10 articles, default settings
    ├── pages/                       # Storefront and admin pages
    │   ├── AboutPage.tsx            # Calder Road Dewsbury workshop story
    │   ├── AccountPage.tsx          # Customer order history & workshop tracking timeline
    │   ├── AdminDashboard.tsx       # Secure CMS portal (Passkey: plush2026)
    │   ├── BasketPage.tsx           # Dedicated basket page with voucher input
    │   ├── BlogDetailPage.tsx       # Single buying guide reader with internal links
    │   ├── BlogListPage.tsx         # Guide hub with category filters
    │   ├── CategoryPage.tsx         # Category listings with price/material filters
    │   ├── CheckoutPage.tsx         # Delivery selection, test payment & order placement
    │   ├── ContactPage.tsx          # Customer helpline, WhatsApp, and inquiry form
    │   ├── DeliveryPage.tsx         # 2-man room of choice logistics policy
    │   ├── FaqPage.tsx              # Categorised furniture FAQs
    │   ├── HomePage.tsx             # Flagship homepage with 5-piece hero switcher
    │   ├── NotFoundPage.tsx         # 404 recovery page
    │   ├── OrderConfirmationPage.tsx# Post-purchase receipt with tracking code
    │   ├── PolicyPages.tsx          # Privacy policy, terms of service, and cookie policy
    │   ├── ProductDetailPage.tsx    # Detailed product view with zoom & variant options
    │   ├── ReturnsPage.tsx          # 30-day sleep and comfort trial terms
    │   ├── SearchResultsPage.tsx    # Query-specific search page
    │   └── ShopPage.tsx             # All 19 products with sorting and sidebar filters
    ├── services/
    │   └── orderService.ts          # Order persistence service with Firestore schemas
    ├── types/
    │   └── index.ts                 # TypeScript type definitions across the store
    └── utils/
        ├── imageHelper.ts           # Image fallbacks and SVG vector assets
        └── wooCommerceParser.ts     # WooCommerce CSV validation and mapping logic
```

### 2.2 Feature-to-File Searchable Reference Table

| Feature / Website Area | Responsible Source File | What You Can Edit | Risk Level |
|---|---|---|---|
| **Top Announcement Banner** | `src/components/Header.tsx` & `src/data/initialData.ts` | Banner copy, link target, toggle visibility | Low |
| **Official Brand Logo** | `src/components/BrandLogo.tsx` & `public/logo.png` | Replace logo image file, adjust alt text | Low |
| **Main Navigation Menu** | `src/components/Header.tsx` & `src/components/MegaMenu.tsx` | Menu links, labels, spotlighted products | Medium |
| **Hero Section (Interactive)** | `src/pages/HomePage.tsx` (`heroShowpieces`) | Headings, featured products, prices, swatches | Medium |
| **Homepage Collection Cards** | `src/pages/HomePage.tsx` (Lines 370–440) | Card headings, images, CTA buttons | Low |
| **Product Listings & Filters** | `src/pages/ShopPage.tsx` & `src/pages/CategoryPage.tsx` | Price ranges, sorting logic, sidebar UI | High |
| **Product Detail Page** | `src/pages/ProductDetailPage.tsx` | Layout, tabs, zoom behavior, related items | High |
| **Cart & Slide-Over Drawer** | `src/components/CartDrawer.tsx` & `src/pages/BasketPage.tsx` | Free delivery threshold progress bar, labels | Medium |
| **Checkout & Order Creation** | `src/pages/CheckoutPage.tsx` & `src/context/StoreContext.tsx` | Payment options, delivery fees, order logic | Critical |
| **Order History & Tracking** | `src/pages/AccountPage.tsx` | Workshop tracking timeline statuses, UI | Medium |
| **Admin Dashboard & CMS** | `src/pages/AdminDashboard.tsx` & `src/components/cms/` | Passkey authentication, tabs, editing forms | High |
| **Product Catalogue Data** | `src/data/initialData.ts` (`INITIAL_PRODUCTS`) | Product names, prices, descriptions, images | Medium |
| **Category Definitions** | `src/data/initialData.ts` (`INITIAL_CATEGORIES`) | Slugs, category names, SEO descriptions | Medium |
| **Buying Guides & Articles** | `src/data/initialData.ts` (`INITIAL_BLOG_POSTS`) | Article text, dates, markdown content | Low |
| **Global Store Settings** | `src/data/initialData.ts` (`INITIAL_SETTINGS`) | Phone, WhatsApp, email, address, delivery fees | Low |
| **Global Theme & Styles** | `src/index.css` & `vite.config.ts` | Color tokens, fonts, Tailwind directives | High |

---

## 3. Frontend Website Editing Manual

### 3.1 Announcement Bar & Header
* **Component Path**: `src/components/Header.tsx`
* **Content Source**: `settings.promoBannerText`, `settings.isPromoBannerActive` in `src/data/initialData.ts` (lines 4–19) or editable via **Admin Dashboard > Settings**.
* **Editing Instructions**:
  1. Open `src/data/initialData.ts`.
  2. Locate `INITIAL_SETTINGS`.
  3. Modify `promoBannerText`:
     ```typescript
     promoBannerText: 'Autumn Living Event: Up to 40% off handcrafted sofas & bespoke beds + Free UK delivery over £150',
     ```
  4. To hide the banner, set `isPromoBannerActive: false`.
* **Testing Step**: Load the homepage and verify the dark top banner displays the new text. Click "Shop Event →" to verify it directs to `/shop`.

### 3.2 Brand Logo
* **Component Path**: `src/components/BrandLogo.tsx`
* **Asset Location**: `public/assets/brand/plush-comfort-official-logo.png` and `public/logo.png`
* **How to Replace**:
  1. Prepare your official logo as a transparent PNG with a recommended width of 400px–600px and height of 100px–150px.
  2. Overwrite `public/assets/brand/plush-comfort-official-logo.png` and `public/logo.png`.
  3. Alternatively, navigate to **Admin Dashboard > Settings > Brand Logo Manager** and upload the image directly from your browser.
* **Testing Step**: Check both the light Header bar and the dark Footer bar on desktop and mobile screens to confirm crisp rendering without distortion.

### 3.3 Interactive Hero Section
* **Component Path**: `src/pages/HomePage.tsx`
* **Data Definition**: `heroShowpieces` array (Lines 28–130)
* **What It Controls**: The headline, subheadline, CTA buttons, and the interactive 5-product showcase switcher.
* **Editing Instructions**:
  * To change the main headline, edit lines 165–173 in `src/pages/HomePage.tsx`:
    ```tsx
    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#221C18] leading-[1.12]">
      Elevate Your Living With{' '}
      <span className="text-[#B3642C] font-semibold italic">
        Handcrafted British Luxury.
      </span>
    </h1>
    ```
  * To modify one of the 5 showcased products, update the entry in `heroShowpieces`:
    ```typescript
    {
      id: 'prod-216',
      title: 'Verona Plush Velvet Corner Sofa',
      subtitle: 'Chesterfield-style L-shape settee with deep buttoned scroll arms & scatter cushions.',
      price: 1250,
      regularPrice: 1450,
      saveAmount: 200,
      slug: 'verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions',
      image: '/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-1.png',
      badge: 'Bestseller · Handcrafted in Yorkshire',
      category: 'Corner Sofas',
      categorySlug: 'corner-sofas',
      specs: ['Plush Velvet Weave', 'High-Tensile Springs', 'Solid Hardwood Frame', '10-Year Warranty'],
      swatches: [
        { name: 'Plush Slate Grey', colorHex: '#707072' },
        { name: 'Soft Cream', colorHex: '#E5DACB' },
        { name: 'Midnight Charcoal', colorHex: '#363738' },
      ],
    }
    ```
* **Risk & Testing**: Ensure `slug` matches an existing product slug in `INITIAL_PRODUCTS` so clicking "Shop This Handcrafted Piece" successfully opens the product page.

### 3.4 Navigation Menu & Desktop Mega Menu
* **Component Paths**: `src/components/Header.tsx` and `src/components/MegaMenu.tsx`
* **What It Controls**:
  * **Sofas Silo**: Corner Sofas, Chesterfield Sofas, Fabric Sofas, U-Shape Suites + Verona & U-Shape product cards.
  * **Beds Silo**: Beds & Bed Frames, Ottoman Divan Sets, Mattresses, Wardrobes + Ambassador & Ottoman Bed cards.
  * **Living Silo**: Armchairs, Wardrobes, Mattresses.
  * **Guides Silo**: Direct links to UK Sofa Buying Guide, Bed Sizes Guide, and WhatsApp Concierge.
* **Editing Instructions**: Open `src/components/MegaMenu.tsx` to alter category links or change the featured product cards in columns 2 and 3.

### 3.5 Product Detail Page (PDP)
* **Component Path**: `src/pages/ProductDetailPage.tsx`
* **Features**:
  * High-resolution image gallery with hover zoom.
  * Dynamic savings badge (`Save £X`).
  * Fabric/colour swatch selector and mattress size selector.
  * Delivery estimates (Standard vs White-Glove).
  * Collapsible accordion tabs: *Specifications*, *Delivery & Assembly*, *Fabric Care*, *Verified UK Reviews*.
  * Related and Complementary cross-sell carousels.

### 3.6 Footer, Contact Information & Legal Links
* **Component Path**: `src/components/Footer.tsx`
* **Content Source**: Powered dynamically by `settings` in `StoreContext.tsx`.
* **Details Rendered**:
  * Address: `Calder Road, Dewsbury, WF12 9EA, United Kingdom`
  * Telephone: `+44 7923 119077`
  * WhatsApp: `+44 7923 119077`
  * Email: `plushcomfort@gmail.com`
  * Trust Badges: Free UK Delivery (£150+), 30-Day Comfort Trial, Encrypted Payment, UK Customer Support.
  * Legal links: `/delivery`, `/returns`, `/privacy`, `/terms`, `/cookies`.

---

## 4. Hero Section and Image Management Guide

### 4.1 Asset Storage Locations

All visual assets in the Plush Comfort UK application are stored locally in the `/public/` directory or referenced via external URLs:

| Asset Category | File Path | Supported Formats | Target Dimensions |
|---|---|---|---|
| **Official Brand Logo** | `/public/assets/brand/plush-comfort-official-logo.png` | PNG (Transparent) | 400 × 120 px |
| **Product Photos (19 items)** | `/public/uploads/products/*` | WebP, PNG, JPG | 1200 × 900 px (4:3 aspect ratio) |
| **Category Hero Banners** | Defined in `INITIAL_CATEGORIES` image field | WebP, JPG | 1200 × 800 px (16:10 or 4:3) |
| **Buying Guide Covers** | Defined in `INITIAL_BLOG_POSTS` coverImage field | JPG, WebP | 1200 × 750 px (16:10) |
| **Workshop Photos** | `/public/uploads/products/*` | PNG, JPG | 1200 × 900 px |

### 4.2 Image Mapping Master Table

| Section on Website | Current Image Source | Rendered By Component | How to Replace |
|---|---|---|---|
| **Header Brand Logo** | `/assets/brand/plush-comfort-official-logo.png` | `BrandLogo.tsx` | Overwrite file or upload in Admin Settings |
| **Footer Brand Logo** | `/assets/brand/plush-comfort-official-logo.png` | `BrandLogo.tsx` | Overwrite file or upload in Admin Settings |
| **Hero Slide 1 (Verona)** | `/uploads/products/verona-plush-velvet-corner-sofa-...-1.png` | `HomePage.tsx` | Replace file or change path in `heroShowpieces[0].image` |
| **Hero Slide 2 (Ambassador)** | `/uploads/products/ambassador-luxury-deep-buttoned-...-1.jpg` | `HomePage.tsx` | Replace file or change path in `heroShowpieces[1].image` |
| **Hero Slide 3 (U-Shape)** | `/uploads/products/luxury-grey-crushed-velvet-u-shape-...-1.webp` | `HomePage.tsx` | Replace file or change path in `heroShowpieces[2].image` |
| **Hero Slide 4 (Nicole)** | `/uploads/products/nicole-luxury-chesterfield-corner-...-1.png` | `HomePage.tsx` | Replace file or change path in `heroShowpieces[3].image` |
| **Hero Slide 5 (Ottoman)** | `/uploads/products/double-ottoman-divan-bed-set-...-1.jpg` | `HomePage.tsx` | Replace file or change path in `heroShowpieces[4].image` |
| **Featured Card 1 (Sofas)** | `/uploads/products/nicole-3-seater-chesterfield-sofa-...-1.png` | `HomePage.tsx` (Line 390) | Change `src` attribute in `HomePage.tsx` |
| **Featured Card 2 (Beds)** | `/uploads/products/ambassador-luxury-deep-buttoned-...-1.jpg` | `HomePage.tsx` (Line 425) | Change `src` attribute in `HomePage.tsx` |
| **Autumn Sale Banner** | `/uploads/products/nicole-32-chesterfield-sofa-set-...-1.jpg` | `HomePage.tsx` (Line 615) | Change `src` attribute in `HomePage.tsx` |
| **Workshop Modal** | `/uploads/products/verona-plush-velvet-corner-sofa-...-2.png` | `HomePage.tsx` (Line 685) | Change `src` attribute in `HomePage.tsx` |
| **Product Gallery on PDP** | `product.images[]` | `ProductDetailPage.tsx` | Edit product in Admin Dashboard or `initialData.ts` |

### 4.3 Image Best Practices for Plush Comfort UK
1. **Aspect Ratio Discipline**: Maintain a **4:3 ratio** (e.g. 1200×900 px) for all product photographs. This prevents layout shifting and ensures cards align across desktop and mobile screens.
2. **Format**: Prefer `.webp` or compressed `.png` (under 250 KB per image) to guarantee fast mobile load times on UK 4G/5G connections.
3. **Alt Text**: Always include the product name, fabric finish, and brand in image `alt` attributes (e.g. `alt="Verona Plush Velvet Corner Sofa in Slate Grey - Plush Comfort UK"`).

---

## 5. Admin Dashboard: Access and Complete User Operations

### 5.1 Accessing the Admin Portal
* **URL Route**: Navigate directly to:
  ```
  https://plushcomfort.uk/
  ```
  and click the **"Admin"** button in the header (visible on desktop), or navigate in the browser console / code to route `{ name: 'admin' }`.
* **Security Passkey Gate**:
  * When opening the admin dashboard, a security authentication screen is presented.
  * **Verified Working Passkeys**: Enter `plush2026` or `admin`.
  * Click **"Authorize Access"**.
  * Upon verification, an authenticated session is created in `sessionStorage.getItem('pc_admin_auth') = 'true'`, granting full access to all management modules.

### 5.2 Admin Modules Overview

The portal contains 7 dedicated management sections:

```
[ Admin Portal Header: Calder Road Workshop CMS ]
├── 1. Overview (Real-time analytics, revenue, low stock alerts, quick actions)
├── 2. Products (Manage 19 items, edit pricing, stock levels, CSV export/import)
├── 3. Categories (Manage 9 categories, descriptions, SEO text, active status)
├── 4. Orders (Track order fulfillment, assign couriers, add tracking numbers)
├── 5. Content CMS (Manage buying guides, pillar pages, clusters, XML sitemap)
├── 6. Settings (Store contact details, delivery fees, brand logo manager)
└── 7. Analytics (Conversion funnels, search queries, event logs)
```

#### Module 1: Overview
* Displays total revenue, orders placed, items sold, average order value (AOV), and conversion rate.
* Highlights **Low Stock Alerts** for any piece whose inventory is at or below its `lowStockThreshold`.
* Quick buttons: *Add New Product*, *Import CSV*, *Export CSV*, *View Store*.

#### Module 2: Product Management
* Lists all 19 products with real-time stock counters, status badges (*Published* / *Draft*), category assignments, and pricing.
* **Inline Actions**:
  * **Publish/Unpublish Toggle**: Click the eye icon to instantly hide or show a product in the customer storefront.
  * **Stock Modifier**: Directly edit the stock number and click Save.
  * **Edit (Pencil Icon)**: Opens the full Product Editor modal.
  * **Duplicate (Copy Icon)**: Clones the product, generating a unique `-copy` SKU and slug.
  * **Delete (Trash Icon)**: Removes the product from the catalogue after confirmation.

#### Module 3: Category Management
* Displays the 9 verified categories.
* Allows toggling a category between active and inactive.
* **Edit Modal**: Update Category Name, Description, Bottom SEO Description (for topical authority), Hero Image URL, SEO Title, and SEO Description.

#### Module 4: Order Management & Logistics
* Displays all incoming orders (seeded and customer-placed).
* Shows customer delivery address, contact phone, ordered items, and payment method (Card, Klarna, Bank Transfer).
* **Fulfillment Status Pipeline**:
  * `Pending` → Order received, awaiting workshop scheduling.
  * `Processing` → Piece currently on the bench in the Dewsbury workshop.
  * `Dispatched` → Handed over to the 2-man logistics team.
  * `Delivered` → Successfully positioned in customer room of choice.
  * `Cancelled` → Order voided and stock restored.
* **Courier & Tracking Assignment**: Enter the carrier (e.g. *Panther Logistics*, *Furdeco*, *BJS Home Delivery*) and the tracking reference number.

#### Module 5: Content CMS & Buying Guides
* Embedded `CmsDashboard` allowing management of the 10 British furniture buying guides.
* Features:
  * **Table View**: Filter articles by Status (*Published*, *Draft*, *Scheduled*) and Type (*Pillar*, *Cluster*, *Buying Guide*).
  * **Silo Tree View**: Visualises which articles link into which primary pillar topics.
  * **SEO Audit View**: Detects missing meta descriptions, missing internal links, or duplicate canonical tags.
  * **XML Sitemap Generator**: Generates and copies RFC 4180 standard `sitemap.xml` entries for all pages.

#### Module 6: Store Settings
* Configure store information without code modifications:
  * Brand Name, Telephone, WhatsApp Helpline, Support Email.
  * Physical Workshop Address (`Calder Road, Dewsbury, WF12 9EA`).
  * Free Delivery Threshold (default: £150).
  * Standard Delivery Fee (default: £39.99).
  * White-Glove Two-Man Assembly Fee (default: £79.99).
  * Promotional Banner Text and Destination Link.
  * **Official Brand Logo Manager**: Upload a new logo file or input a direct image URL.

#### Module 7: Analytics & Event Log
* Visualises customer engagement metrics: product views by item, category browsing frequency, and top search queries.

---

## 6. Product Management Guide

### 6.1 Complete Product Data Structure (TypeScript Interface)

The verified product schema is defined in `src/types/index.ts` (lines 51–84):

```typescript
export interface Product {
  id: string;                      // Unique identifier, e.g. "prod-216"
  name: string;                    // Full display title
  slug: string;                    // URL path, e.g. "verona-plush-velvet-corner-sofa"
  sku: string;                     // Stock keeping unit, e.g. "PC-UK-216"
  categoryId: string;              // Target category ID, e.g. "cat-corner-sofas"
  subcategoryId?: string;          // Optional subcategory ID, e.g. "sub-corner-lshape"
  price: number;                   // Active selling price in GBP (£)
  salePrice?: number;              // Discounted promotional price in GBP (£)
  regularPrice?: number;           // Original price before savings (£)
  stock: number;                   // Available units in inventory
  lowStockThreshold: number;       // Triggers alert when stock drops to or below this
  images: string[];                // Array of image paths, primary image at index [0]
  shortDescription: string;        // 1-2 sentence excerpt shown on cards and under title
  fullDescription: string;         // Comprehensive product details and craftsmanship notes
  dimensions: ProductDimensions;   // Width, height, depth in centimetres (cm)
  materials: string[];             // Fabric & frame materials, e.g. ["Plush Velvet", "Hardwood Beech"]
  colours: ProductVariant[];       // Available upholstery colour swatches and hex codes
  sizes?: string[];                // Sizing variants, e.g. ["Double", "King", "Super King"]
  tags: string[];                  // Filter keywords, e.g. ["Chesterfield", "Corner", "Bestseller"]
  isPublished: boolean;            // Controls visibility in customer storefront
  isFeatured: boolean;             // Highlights product in featured sections
  isTrending: boolean;             // Displays product in "Trending Finds"
  deliveryInfo: string;            // Logistics terms and doorway clearance guidance
  careInstructions: string;        // Cleaning and fabric maintenance recommendations
  assemblyRequired?: boolean;      // Notes whether legs/modular clips require fitting
  seoTitle: string;                // Search engine title tag
  seoDescription: string;          // SERP meta description
  rating: number;                  // Customer review rating (1.0 - 5.0)
  reviewCount: number;             // Total verified customer reviews
  relatedProductIds: string[];     // IDs of similar pieces shown at bottom of PDP
  complementaryProductIds: string[]; // Cross-sell pieces (e.g. footstools, cushions)
  reviews: Review[];               // Array of verified review objects
}
```

### 6.2 Step-by-Step: Adding a New Product

#### Method A: Via Admin Dashboard (No Code Required)
1. Open the Admin Dashboard (passkey: `plush2026`).
2. Navigate to the **Products** tab.
3. Click the **"+ Add New Furniture Piece"** button in the top right.
4. Fill in the required fields:
   * **Product Name**: e.g., `Balmoral 3-Seater Chesterfield Sofa in Vintage Tan Leather`
   * **SKU**: e.g., `PC-UK-301`
   * **Category**: Select from dropdown (*Sofas*, *Chesterfield Sofas*, *Corner Sofas*, etc.)
   * **Selling Price (£)**: e.g., `1199`
   * **Regular Price (£)**: e.g., `1399`
   * **Stock Quantity**: e.g., `8`
   * **Image URLs**: Provide comma-separated paths or URLs (e.g., `/uploads/products/balmoral-1.jpg`).
   * **Short & Full Descriptions**: Enter product copy.
5. Click **"Save Furniture Piece"**. The new product is instantly added to your active catalogue and saved to `localStorage`.

#### Method B: Via Source Code Seed (`src/data/initialData.ts`)
1. Open `src/data/initialData.ts`.
2. Locate `INITIAL_PRODUCTS` (line 214).
3. Add a new product object conforming to the `Product` interface:
   ```typescript
   {
     id: 'prod-301',
     name: 'Balmoral 3-Seater Chesterfield Sofa in Vintage Tan Leather',
     slug: 'balmoral-3-seater-chesterfield-sofa-in-vintage-tan-leather',
     sku: 'PC-UK-301',
     categoryId: 'cat-chesterfield-sofas',
     subcategoryId: 'sub-chesterfield-3seater',
     price: 1199,
     regularPrice: 1399,
     salePrice: 1199,
     stock: 8,
     lowStockThreshold: 2,
     images: [
       '/uploads/products/balmoral-1.jpg',
       '/uploads/products/balmoral-2.jpg'
     ],
     shortDescription: 'Master hand-tufted vintage tan leather Chesterfield 3-seater crafted in Yorkshire.',
     fullDescription: 'Handcrafted in our Dewsbury workshops using 100% full-grain antique leather...',
     dimensions: { width: 220, height: 78, depth: 95, seatHeight: 48 },
     materials: ['Vintage Aniline Leather', 'Solid European Beech', 'Serpentine Springs'],
     colours: [{ name: 'Vintage Tan', hex: '#8B5A2B' }],
     tags: ['Chesterfield', 'Leather', '3-Seater'],
     isPublished: true,
     isFeatured: true,
     isTrending: true,
     deliveryInfo: 'Delivered in protective packaging with 2-man room-of-choice placement.',
     careInstructions: 'Treat with leather balm twice yearly. Wipe spills immediately with damp cloth.',
     seoTitle: 'Balmoral 3-Seater Leather Chesterfield Sofa UK | Plush Comfort',
     seoDescription: 'Shop the handcrafted Balmoral 3-seater Chesterfield sofa in vintage tan leather. Solid beech frame with 10-year warranty.',
     rating: 4.9,
     reviewCount: 14,
     relatedProductIds: ['prod-166', 'prod-160'],
     complementaryProductIds: ['prod-23'],
     reviews: []
   },
   ```
4. Save the file. Run `npm run build` to verify compilation.

### 6.3 Bulk Product Import via WooCommerce CSV Tool

The store includes an integrated **WooCommerce Product Importer** (`WooCommerceProductImporter.tsx`) supporting standard WooCommerce CSV exports:
1. Open **Admin Dashboard > Products**.
2. Click **"Import WooCommerce CSV"**.
3. Choose your `.csv` file. The tool parses headers:
   * `ID`, `Type`, `SKU`, `Name`, `Published`, `Is featured?`
   * `Regular price`, `Sale price`, `Categories`, `Images`
   * `Short description`, `Description`, `Weight`, `Dimensions`
4. The tool automatically maps legacy categories to the 9 active Plush Comfort target categories, strips unwanted builder markup, and validates image links.
5. Review the preview diagnostics and click **"Complete Import"**.

---

## 7. Product Category Management

### 7.1 The 9 Verified Store Categories

All products in Plush Comfort UK belong to one of 9 primary categories defined in `src/data/initialData.ts`:

| Category Name | Category ID | URL Slug | Primary Associated Products |
|---|---|---|---|
| **Sofas** | `cat-sofas` | `sofas` | Parent umbrella category for all living seating |
| **Chesterfield Sofas** | `cat-chesterfield-sofas` | `chesterfield-sofas` | Nicole 3-Seater, Nicole Corner, Classic Oxblood 2/3-Seaters, Bella Corner, Nicole 3+2 Set |
| **Corner Sofas** | `cat-corner-sofas` | `corner-sofas` | Verona Plush Velvet, Luxury Crushed Velvet U-Shape, Oxford Fabric, Lilly Corner, Luxury U-Shaped with Double Chaise |
| **Fabric Sofas** | `cat-fabric-sofas` | `fabric-sofas` | Verona Light Grey Deep Seating, Modern Grey Sofa |
| **Armchairs** | `cat-armchairs` | `armchairs` | Beige Armchair, Bouclé Accent Chairs |
| **Beds & Bed Frames** | `cat-beds-bed-frames` | `beds-bed-frames` | Ambassador Luxury Deep-Buttoned Upholstered Bed Frame |
| **Divan Beds** | `cat-divan-beds` | `divan-beds` | Double Ottoman Divan Bed Set with Orthopaedic Mattress |
| **Mattresses** | `cat-mattresses` | `mattresses` | King Mattress, Pocket Sprung & Orthopaedic options |
| **Wardrobes** | `cat-wardrobes` | `wardrobes` | White Wardrobe, Bedroom Storage |

### 7.2 Category Page Filtering Architecture

In `src/pages/CategoryPage.tsx`, products are filtered dynamically using smart category inheritance:
```typescript
const categoryProducts = useMemo(() => {
  if (!category) return [];
  return products.filter((p) => {
    if (!p.isPublished) return false;
    // Direct category match
    if (p.categoryId === category.id) return true;
    // Sofas umbrella displays all sofa variants & armchairs
    if (category.slug === 'sofas' && (p.categoryId.includes('sofa') || p.categoryId === 'cat-armchairs')) return true;
    // Beds umbrella displays all bed frames, divans, and mattresses
    if ((category.slug === 'beds-bed-frames' || category.slug === 'beds') && (p.categoryId.includes('bed') || p.categoryId === 'cat-mattresses')) return true;
    return false;
  });
}, [category, products]);
```

### 7.3 How to Update Category Content & Bottom SEO Copy
1. Open **Admin Dashboard > Categories**.
2. Click **Edit (Pencil Icon)** on any category (e.g. *Chesterfield Sofas*).
3. Update the **Bottom SEO Description**:
   * This is a dedicated 200–300 word educational guide positioned below the product grid. It establishes topical depth for Google search crawlers without pushing products below the fold for mobile users.
4. Click **"Save Category"**.

---

## 8. Complete SEO Management Manual

### 8.1 On-Page SEO Implementation

#### Document Titles & Meta Descriptions
Document titles and meta descriptions update dynamically in the client browser across all routes:
* **Category Pages (`CategoryPage.tsx`)**:
  ```typescript
  document.title = activeSubcategory
    ? `${activeSubcategory.name} | Handcrafted ${category.name} | Plush Comfort UK`
    : (category.seoTitle || `Luxury Handcrafted ${category.name} UK | Plush Comfort`);
  ```
* **Buying Guide / Pillar Pages (`BlogDetailPage.tsx`)**:
  ```typescript
  document.title = post.seoTitle || `${post.title} | Plush Comfort UK`;
  ```
* **Static Fallback (`index.html`)**:
  * Title: `Plush Comfort UK - Luxury Handcrafted Sofas & Beds` (51 characters — within Google's 60-character limit).
  * Meta Description: `Discover luxury handcrafted sofas and bespoke ottoman beds from Plush Comfort UK. Handcrafted in Yorkshire with free mainland UK delivery.` (144 characters — within Google's 155–160 character limit).

#### OpenGraph & Social Sharing Meta Tags (`index.html`)
```html
<meta property="og:title" content="Plush Comfort UK - Luxury Handcrafted Sofas & Beds" />
<meta property="og:description" content="Discover luxury handcrafted sofas and bespoke ottoman beds from Plush Comfort UK. Handcrafted in Yorkshire with free mainland UK delivery." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://plushcomfort.uk/" />
<meta property="og:site_name" content="Plush Comfort" />
<meta name="twitter:card" content="summary_large_image" />
```

### 8.2 Structured Data (Schema.org JSON-LD)

#### Verified Implemented Schema: `FurnitureStore`
In `index.html` (lines 19–48), the official local business schema is implemented:
```json
{
  "@context": "https://schema.org",
  "@type": "FurnitureStore",
  "name": "Plush Comfort UK",
  "url": "https://plushcomfort.uk/",
  "logo": "https://plushcomfort.uk/logo.png",
  "description": "Premium British furniture retailer specialising in handcrafted luxury sofas, bespoke ottoman beds, and living room furniture.",
  "telephone": "+44 7923 119077",
  "email": "plushcomfort@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Calder Road",
    "addressLocality": "Dewsbury",
    "postalCode": "WF12 9EA",
    "addressCountry": "GB"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  ],
  "priceRange": "££ - £££",
  "currenciesAccepted": "GBP",
  "paymentAccepted": "Credit Card, Debit Card, Klarna"
}
```

### 8.3 XML Sitemap & robots.txt Management
* **Dynamic Generator**: Use **Admin Dashboard > Content CMS > Generate XML Sitemap** (`SitemapModal.tsx`) to produce an up-to-date sitemap with all current URLs.
* **Production Static Deployment**: To make the sitemap directly reachable by search engines at `https://plushcomfort.uk/sitemap.xml`, paste the generated output into a new file named `public/sitemap.xml`.
* **Standard `robots.txt`**: Create `public/robots.txt` with:
  ```txt
  User-agent: *
  Allow: /
  Disallow: /admin

  Sitemap: https://plushcomfort.uk/sitemap.xml
  ```

---

## 9. Content Management and Copywriting Guide

### 9.1 Content Source Reference Map

| Content Section | Managed Through | File Path / Variable | Technical Notes |
|---|---|---|---|
| **Homepage Hero Headline** | Source Code | `src/pages/HomePage.tsx` (Line 165) | Hardcoded for high typographic performance |
| **Hero 5 Showpiece Slides** | Source Code / State | `src/pages/HomePage.tsx` (`heroShowpieces`) | Real product data with swatches |
| **Featured Collection Cards** | Source Code | `src/pages/HomePage.tsx` (Line 370) | Contains links to `/category/corner-sofas` and `/category/beds-bed-frames` |
| **All Product Copy** | Admin / Source Code | `src/data/initialData.ts` (`INITIAL_PRODUCTS`) | Full rich descriptions and specifications |
| **Category Intro & Bottom SEO**| Admin / Source Code | `src/data/initialData.ts` (`INITIAL_CATEGORIES`)| Editable via Admin Dashboard > Categories |
| **Buying Guides & Articles** | Admin CMS / Seed | `src/data/initialData.ts` (`INITIAL_BLOG_POSTS`) | Full Markdown editor in Admin Dashboard |
| **About Us Craftsmanship Page** | Source Code | `src/pages/AboutPage.tsx` | Historical West Yorkshire joinery copy |
| **Helpline, Email, Address** | Admin Settings / Seed | `src/data/initialData.ts` (`INITIAL_SETTINGS`) | Centralized across Header, Footer, and Contact |
| **Returns & Comfort Trial** | Source Code | `src/pages/ReturnsPage.tsx` | Explains 30-day sleep trial and return terms |
| **2-Man Delivery Logistics** | Source Code | `src/pages/DeliveryPage.tsx` | Details doorway clearances and packaging |

---

## 10. Database Architecture and Data Persistence

### 10.1 Verified Implementation: Client-Side LocalStorage

The store utilizes HTML5 `localStorage` as its active persistence engine. This means changes persist across page reloads and browser sessions without requiring a paid database server.

#### Storage Key Map (`src/context/StoreContext.tsx`)
```typescript
const STORAGE_KEYS = {
  PRODUCTS: 'plush_comfort_products_v4',     // All 19 active products + user additions
  CATEGORIES: 'plush_comfort_categories_v4', // All 9 categories + updates
  BLOGS: 'plush_comfort_blogs_v4',           // All 10 buying guides + new posts
  SETTINGS: 'plush_comfort_settings_v4',     // Logo URL, delivery fees, contact info
  ORDERS: 'plush_comfort_orders_v4',         // Customer and sample order histories
  CART: 'plush_comfort_cart_v4',             // Active customer basket lines
  WISHLIST: 'plush_comfort_wishlist_v4',     // Saved product IDs
  ANALYTICS: 'plush_comfort_analytics_v4',   // In-app conversion & browsing events
};
```

#### Seed Fallback Safeguard
If a customer clears their browser data or visits the site for the first time, `StoreContext.tsx` detects the absence of `plush_comfort_products_v4` and instantly initializes the state using the pristine records from `src/data/initialData.ts`.

### 10.2 Roadmap to a Persistent Remote Database (PostgreSQL / Firestore)
If you wish to upgrade from local browser storage to a centralized multi-user database so that product updates made on one computer appear immediately for all customers worldwide:
1. **Firestore Option**: The groundwork is already established in `src/services/orderService.ts` (`FIRESTORE_COLLECTION_ORDERS`). Adding the Firebase SDK allows syncing orders and products directly to Google Cloud Firestore.
2. **PostgreSQL / Cloud SQL Option**: Implement an Express server (`server.ts`) running Drizzle ORM or Prisma connected to a relational database, exposing REST API routes (`/api/products`, `/api/orders`).

---

## 11. Backend, APIs, and Business Logic

### 11.1 Client-Side Business Logic

All core e-commerce business operations execute inside `src/context/StoreContext.tsx`:

1. **Cart & Basket Calculations (`addToCart`, `updateCartQuantity`, `removeFromCart`)**:
   * Generates a unique line ID: `${productId}-${Date.now()}-${random}`.
   * Merges duplicate lines sharing the exact same product ID, colour swatch, and size.
   * Computes subtotal: `sum(item.price * item.quantity)`.
2. **Free Delivery Logic**:
   * Evaluates if `cartSubtotal >= settings.freeDeliveryThreshold` (£150).
   * Standard Delivery (£39.99) is waived when over threshold.
   * White-Glove delivery is billed at `settings.whiteGloveDeliveryFee` (£79.99).
3. **Promo Voucher Engine**:
   * Entering voucher code `PLUSH10` applies a 10% discount across the cart subtotal.
4. **Order Placement Pipeline (`createOrder`)**:
   * Decrements stock quantity in `products` state for each purchased item.
   * Appends the new order to `orders` with an initial status of `pending`.
   * Emits a `purchase` event for analytics tracking.
   * Empties the shopping cart.

---

## 12. Code Editing and Customisation Guide

### 12.1 Common Customisation Procedures

#### A. How to Update Global Brand Colours
1. Open `src/index.css`.
2. The primary brand colours used across the site are:
   * **British Heritage Amber/Rust**: `#A25828` / `#B3642C` (hover: `#8A461A`)
   * **Deep Charcoal / Black**: `#221C18`
   * **Warm Linen Background**: `#FAF8F5`
   * **Border Stone**: `#E8E0D5` / `#ECE3D5`
3. To alter the primary accent colour globally, search and replace `#A25828` with your preferred HEX code across `src/pages/` and `src/components/`.

#### B. How to Update Typography
1. Open `index.html` (lines 16–18). The Google Fonts imported are:
   * **Playfair Display**: Used for luxury serif headings (`font-serif`).
   * **Plus Jakarta Sans**: Used for clean body text and buttons (`font-sans`).
2. To replace with a different font, update the `<link href="...">` in `index.html` and the corresponding font family definition in `src/index.css`.

#### C. How to Add a New Page to the Store
1. Create a new component in `src/pages/` (e.g. `src/pages/FabricSamplesPage.tsx`).
2. Open `src/types/index.ts` and add the route name to `PageRoute`:
   ```typescript
   export type PageRoute =
     | { name: 'home' }
     | { name: 'samples' } // New route
     // ...
   ```
3. Open `src/App.tsx`:
   * Import the new page: `import { FabricSamplesPage } from './pages/FabricSamplesPage';`
   * Add a case to `renderCurrentView()`:
     ```tsx
     case 'samples':
       return <FabricSamplesPage />;
     ```
4. Link to it from the Header or Footer using `setRoute({ name: 'samples' })`.

---

## 13. Environment Variables, Secrets, and Integrations

### 13.1 Environment Variable Audit

The project root contains `.env.example`:
```env
# GEMINI_API_KEY: Optional key for Gemini AI API calls
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: The URL where this applet is hosted
APP_URL="MY_APP_URL"
```

* **Client-Side Variables**: Any variable accessed in frontend code must begin with `VITE_` (e.g. `VITE_STORE_URL`).
* **Security Notice**: Never store database passwords, Stripe private keys, or admin passkeys in client-side code or public GitHub repositories.

---

## 14. Deployment and Hosting Operations Manual

### 14.1 Running the Store Locally

```bash
# 1. Clone repository and navigate to folder
cd plush-comfort-uk

# 2. Install dependencies cleanly
npm install

# 3. Start local development server
npm run dev
# The store will be live at http://localhost:3000

# 4. Run TypeScript checks
npm run lint

# 5. Build production bundle
npm run build
```

### 14.2 Deploying to Vercel

The project is fully pre-configured for **Vercel**:
1. Push your repository to GitHub or GitLab.
2. In the Vercel Dashboard, click **"Add New Project"** and select the repository.
3. Configure the build settings:
   * **Framework Preset**: `Vite`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
   * **Install Command**: `npm install`
4. The included `vercel.json` ensures that direct visits and page refreshes on sub-pages (e.g. `/category/sofas`, `/shop`) route to `index.html` with zero 404 errors.

---

## 15. Security and Access Management

1. **Admin Passkey Protection**:
   * The Admin Dashboard is guarded by `AdminDashboard.tsx`.
   * Sessions are held in browser `sessionStorage`. Closing the browser tab terminates the session.
   * To change the passkey, edit line 143 in `src/pages/AdminDashboard.tsx`.
2. **Input Sanitization**:
   * The WooCommerce CSV importer uses an RFC 4180 parser that strips executable script tags, HTML event handlers, and remote iframe exploits from product descriptions.
3. **Safe Storage**:
   * Customer payment card details are never stored locally; the checkout module simulates payment or passes through to Klarna/bank transfer instructions.

---

## 16. Troubleshooting Guide

| Issue / Error | Likely Cause | Verification Step | Solution |
|---|---|---|---|
| **Vercel Build Fails with `ERESOLVE`** | Conflicting `esbuild` or Vite peer dependencies | Check `package.json` for explicit `esbuild` pin | Remove `"esbuild"` from `devDependencies`. Vite resolves `esbuild@0.28.2` natively. |
| **Direct URLs Return 404 on Vercel** | Missing SPA rewrite rule | Check for `vercel.json` in root | Ensure `vercel.json` contains `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}`. |
| **Products Revert to Old Mock Data** | Old `localStorage` cache key | Open DevTools > Application > LocalStorage | Clear `localStorage` or update `STORAGE_KEYS.PRODUCTS` version in `StoreContext.tsx`. |
| **Product Photos Appear Broken** | Misspelled path or missing file in `/public/` | Check browser Console (404 on image URL) | Verify the image exists in `/public/uploads/products/`. The system uses `getProductFallbackImage` as backup. |
| **Admin Passkey Not Accepted** | Typo or caps lock active | Verify input matches `plush2026` or `admin` | Enter `plush2026` in lowercase. |
| **Free Delivery Not Applying** | Cart subtotal below £150 threshold | Check cart items total | Add items until subtotal is ≥ £150. Threshold can be adjusted in Admin Settings. |
| **Voucher Code PLUSH10 Fails** | Typo or lowercase input | Verify code entered is `PLUSH10` | The checkout checks for `PLUSH10` (case-insensitive). |

---

## 17. Master Change Impact and Dependency Map

| Requested Change | Where to Change | Primary File Affected | Dependencies Impacted | Testing Required |
|---|---|---|---|---|
| **Change Store Phone / WhatsApp** | Admin Settings or Code | `src/data/initialData.ts` | Header, Footer, Contact Page, WhatsApp links | Check footer links and test `tel:` and `wa.me` links |
| **Add a New Category** | Admin Categories or Code | `src/data/initialData.ts` | CategoryPage, MegaMenu, Shop filters | Verify CategoryPage renders products with matching ID |
| **Update Product Price** | Admin Products or Code | `src/data/initialData.ts` | ProductCard, PDP, Cart subtotal, Checkout | Verify correct price in cart and checkout breakdown |
| **Change Free Shipping Threshold**| Admin Settings or Code | `src/data/initialData.ts` | CartDrawer delivery meter, Checkout fee | Test cart with values below and above new threshold |
| **Replace Official Logo** | Admin Settings or File | `public/assets/brand/...` | `BrandLogo.tsx`, Header, Footer, Favicon | Check header and footer rendering on mobile/desktop |
| **Publish New Buying Guide** | Admin Content CMS | `src/data/initialData.ts` | BlogListPage, BlogDetailPage, SitemapModal | Verify article displays and internal links resolve |

---

## 18. Testing and Quality Assurance Protocols

Run this checklist prior to any production deployment:

- [ ] **Compilation**: Run `npm run lint` (`tsc --noEmit`) — must return exit code 0.
- [ ] **Production Build**: Run `npm run build` — must generate bundle in `dist/` without errors.
- [ ] **Homepage Verification**: Open `/` and toggle all 5 hero showpiece tabs. Confirm smooth image transitions.
- [ ] **Catalogue Browsing**: Open `/shop` and test price slider and category filter buttons.
- [ ] **Product Detail Page**: Open a sofa and a bed. Confirm image gallery thumbnail switching and hover zoom.
- [ ] **Cart Flow**: Add an item to cart. Confirm slide-over drawer opens, delivery meter updates, and quantity stepper works.
- [ ] **Checkout Test**: Complete a test order with UK postcode and confirm redirection to Order Confirmation page with order number.
- [ ] **Admin Security**: Open `/admin` in private window. Confirm passkey `plush2026` grants access.

---

## 19. Maintenance and Operations Schedule

* **Daily / Weekly**:
  * Review Admin Dashboard **Overview** for incoming orders and adjust fulfillment statuses as workshop orders progress.
  * Check **Low Stock Alerts** in the Products tab.
* **Monthly**:
  * Generate a fresh XML Sitemap using **Admin Dashboard > Content CMS > Generate XML Sitemap** and submit to Google Search Console.
  * Export a backup of your store catalogue using **Admin Dashboard > Products > Export Products (CSV)**.
* **Quarterly**:
  * Run `npm outdated` to check for security patches on dependencies.
  * Review page performance via Google PageSpeed Insights.

---

## 20. Glossary of Technical Terms

* **SPA (Single-Page Application)**: A website that loads a single HTML page and dynamically updates content as the user interacts with the app without full page reloads.
* **Vite**: A modern, high-speed frontend build tool that compiles and bundles TypeScript and React into production-ready web assets.
* **LocalStorage**: A browser feature that allows websites to store key-value data persistently on the user's computer without an external database.
* **Slug**: The URL-friendly version of a name (e.g. `verona-plush-velvet-corner-sofa`).
* **SKU (Stock Keeping Unit)**: A unique merchant code assigned to each inventory item (e.g. `PC-UK-216`).
* **Pillar Page**: A comprehensive, long-form buying guide that covers a broad topic in depth and links to related sub-articles (clusters).
* **Topical Silo**: An SEO site structure that groups related content together under logical categories to establish search engine authority.

---

## 21. Audit Summary and Unimplemented Features Matrix

| Feature | Current Status | Technical Explanation |
|---|---|---|
| **19 Uploaded Products** | **Fully Implemented** | Present in `initialData.ts`, local high-res photos in `/public/uploads/products/` |
| **9 Product Categories** | **Fully Implemented** | Full SEO descriptions, FAQs, and product assignments active |
| **Interactive 5-Piece Hero** | **Fully Implemented** | Flagship product switcher with swatches and live pricing on Homepage |
| **Official Brand Logo** | **Fully Implemented** | High-res transparent PNG loaded in Header and Footer with fallbacks |
| **Admin Dashboard & CMS** | **Fully Implemented** | Passkey-protected management for products, categories, orders, and content |
| **WooCommerce CSV Importer** | **Fully Implemented** | Parses RFC 4180 CSV files, cleans HTML, and maps categories |
| **XML Sitemap Tool** | **Fully Implemented** | Generates dynamic sitemap for search engines in Admin CMS |
| **Remote Centralized Database** | **Not Implemented** | Currently uses browser `localStorage`. Multi-user remote sync requires connecting PostgreSQL or Firebase |
| **Live Payment Gateway (Stripe)** | **Partially Implemented** | Checkout UI supports Card, Klarna, and Bank Transfer; test mode active (live API key integration required for real card charges) |
| **Automated Email Dispatch (SMTP)**| **Partially Implemented** | Receipts render on screen; sending automated emails requires integrating SendGrid, Resend, or AWS SES |
