# Plush Comfort UK — v5 Change List

Every item from the "Changing required for Plush Comfort" document, with what was done and where to manage it.

## Menu
| Request | Done |
|---|---|
| Staff & Owner button moved to the top bar | ✅ Right side of the dark top bar, next to phone and email |
| Social icons in the top bar, phone and email on the other side | ✅ Socials on the left, phone, email and Staff & Owner on the right (Store Design → Header & top bar) |
| Centre text narrower and scrolling like a news ticker | ✅ Narrow scrolling ticker (pauses on hover) |
| Only the open page highlighted (Sofas and Beds were both highlighted) | ✅ Exactly one item is highlighted, worked out from the current page, category or product |

## Footer
| Request | Done |
|---|---|
| Social media icons | ✅ Facebook, Instagram, Pinterest, TikTok, YouTube, LinkedIn (only the ones filled in appear) |
| "Join our circle" widened to remove the empty space | ✅ Full-width newsletter band under the 3 link columns |

## Homepage
| Request | Done |
|---|---|
| Hero product full-size image; clicking a thumbnail changes it | ✅ Uses real products, chosen in Store Design → Homepage → Showcase products |
| Remove the Upholstery colour icons | ✅ Removed |
| Workshop Tour button: video link or upload | ✅ Store Design → Homepage → Video button (YouTube, Vimeo or MP4 upload). Hidden when empty. See STAFF_GUIDE §7.1 |
| Trust line replaced with the 4 badges | ✅ Free Delivery · 30-Day Exchange/Return · Cash on Delivery · Customer Support (editable in Store Design → Footer) |
| Real feature images and body images for all guides | ✅ 30 new images (10 covers plus 20 body images) made from the real product photos |

## Category page
| Request | Done |
|---|---|
| Filter sidebar moved to a top row; bigger product cards | ✅ Sticky filter row (price, material, in-stock, sort); full-width 3-column grid |
| Expert Advice as a banner | ✅ Banner after the first 6 products |

## Staff login
| Request | Done |
|---|---|
| Staff cannot create accounts; the Owner creates them | ✅ |
| How to connect reCAPTCHA | ✅ SETUP_DATABASE_AND_SERVICES.md §5 (env keys; the real Google checkbox appears automatically) |
| Forgotten password goes to the Owner as a request | ✅ Staff & Roles → Password reset requests |

## Staff overview
| Request | Done |
|---|---|
| Summary based on that person's access | ✅ Only shows the areas the person can use |

## Master (Owner) login
| Request | Done |
|---|---|
| Owner can change staff passwords | ✅ Staff & Roles → Set password (signs them out everywhere) |
| Logs of everything: password creation and sessions, Owner and staff | ✅ Security log, per-person History, all active sessions with Revoke |
| Emergency recovery by WhatsApp or email code; recovery key removed | ✅ |
| Password login, forgot password (email code), login with code (number or email) | ✅ |

## Master overview
| Request | Done |
|---|---|
| WooCommerce-style summary plus store and technical history | ✅ Revenue, orders, AOV, monthly sales chart, top products, low stock, recent orders, store changes, technical events |

## Category & SEO tab
| Request | Done |
|---|---|
| Create, preview, update and delete categories; on by default for staff | ✅ Categories & SEO access is in every role by default |

## Variations
| Request | Done |
|---|---|
| Custom variation: pick the specific variation to add | ✅ "+ Add Custom Variation…" list (sizes, suites, corners, beds, storage, headboards, mattresses) or a blank one |
| Colour as a standard variation; clicking a colour shows its images | ✅ Per-colour photos; the product gallery switches when a colour is chosen |

## Blogs / Articles / Pillars / Guides
| Request | Done |
|---|---|
| Publish with full SEO and connect to the pillar | ✅ SEO tab plus "Parent pillar"; Article, FAQ and Breadcrumb schema |
| Feature image on the homepage and blog page | ✅ |
| Body supports images, carousel/slider and charts (create or upload) | ✅ Toolbar: Image, Carousel, Chart builder, Tip, Steps, Checklist, FAQ, CTA, Products |
| Pillar design similar to the reference page, editable in the dashboard | ✅ Progress bar, hero with buttons, sticky table of contents, numbered chapters, key takeaways, cluster cards, FAQ, products, author, share, closing banner |

## Duplicate tabs
| Request | Done |
|---|---|
| "Homepage Sections" and "Store Hero Section" merged | ✅ One **Store Design** tab |

## SEO settings
| Request | Done |
|---|---|
| Image upload next to meta title, canonical and robots everywhere | ✅ "Social share image" on products, categories, blogs and global settings |
| OG and Twitter use that image; otherwise the feature image | ✅ Order: share image, then feature image, then default image |

## Images
| Request | Done |
|---|---|
| All images to WebP at 100–200 KB, with quality | ✅ All images converted (≤200 KB, max 1600 px), plus 480/800 px mobile versions |
| Future uploads converted automatically | ✅ Compressed to WebP in the browser before upload. `npm run images` handles files added by FTP |

## Content
| Request | Done |
|---|---|
| "10-Year Frame Guarantee" changed to "1 Year Warranty" everywhere | ✅ |
| Yorkshire, workshop and physical-store references removed; rewritten for an online store | ✅ About, Contact, FAQ, footer, schema, guides, checkout, emails |
| Product page shows only the regular and sale price (VAT/Klarna line removed) | ✅ |

## Database
| Request | Done |
|---|---|
| Connect a database so changes go live (with and without Hostinger) | ✅ MySQL support built in (`DATABASE_URL`; table created automatically). See SETUP_DATABASE_AND_SERVICES.md |

## Audit
| Request | Done |
|---|---|
| SEO, page speed and Core Web Vitals audit | ✅ SEO_AUDIT_REPORT.md. Also implemented: server-side rendering, CLS fixed to 0, responsive images, code-splitting, compression, schema fixes |

## Small related fixes made while doing the above
- Star ratings and rating schema only show when a product has real reviews; new products start with 0 reviews (Google policy).
- `npm start` now always runs in production mode.
- The upload size limit allows MP4 videos up to 20 MB.
