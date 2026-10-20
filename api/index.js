import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);

// server.ts
import express from "express";
import path2 from "path";
import fs2 from "fs";
import crypto from "crypto";
import compression from "compression";
import { fileURLToPath, pathToFileURL } from "url";

// src/utils/seoEngine.ts
var DEFAULT_ORIGIN = "https://plushcomfort.uk";
var DEFAULT_BRAND = "Plush Comfort UK";
var DEFAULT_LOGO = "https://plushcomfort.uk/logo.webp";
function cleanUrl(path3) {
  const p = path3.split("?")[0].split("#")[0];
  return p.replace(/\/+$/, "") || "/";
}
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function generateSeoDataForRoute(rawPath, products, categories, blogPosts, settings) {
  const path3 = cleanUrl(rawPath);
  const origin = DEFAULT_ORIGIN;
  const brandName = settings?.brandName || DEFAULT_BRAND;
  const abs = (src) => !src ? "" : src.startsWith("http") ? src : `${origin}${src.startsWith("/") ? "" : "/"}${src}`;
  const defaultImage = abs(settings?.defaultOgImage) || abs(settings?.logoUrl) || DEFAULT_LOGO;
  const f = settings?.footerDesign;
  const sameAs = [f?.socialFacebook, f?.socialInstagram, f?.socialTiktok, f?.socialYoutube, f?.socialPinterest, f?.socialLinkedin].filter(
    (x) => Boolean(x && x.trim())
  );
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brandName,
    url: origin,
    logo: abs(settings?.logoUrl) || DEFAULT_LOGO,
    description: "UK online furniture store selling luxury sofas, corner sofas, beds and ottoman beds with free UK mainland delivery and cash on delivery.",
    email: settings?.email || "plushcomfort@gmail.com",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings?.phone || "+44 7923 119077",
      contactType: "customer service",
      areaServed: "GB",
      availableLanguage: ["en"]
    },
    ...sameAs.length ? { sameAs } : {}
  };
  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brandName,
    url: origin,
    potentialAction: {
      "@type": "SearchAction",
      target: `${origin}/shop?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
  if (path3 === "/") {
    const title = "Plush Comfort UK | Luxury Sofas, Corner Sofas & Beds Online";
    const description = settings?.defaultMetaDescription || "Shop luxury sofas, corner sofas, Chesterfields and ottoman beds online. Free UK mainland delivery, 1 year warranty, 30-day exchange or return and cash on delivery.";
    const canonical = `${origin}/`;
    const heroImage = abs(settings?.defaultOgImage) || `${origin}/uploads/products/lilly-corner-sofa-luxury-plush-fabric-with-bolster-cushions-1.webp`;
    const categoryLinksHtml = categories.filter((c) => c.isActive).map(
      (c) => `<li><a href="/category/${c.slug}" title="${escapeHtml(c.name)}">${escapeHtml(c.name)}</a></li>`
    ).join("\n");
    const featuredProductsHtml = products.filter((p) => p.isPublished && p.isFeatured).slice(0, 6).map(
      (p) => `
        <article class="featured-product" itemscope itemtype="https://schema.org/Product">
          <a href="/product/${p.slug}">
            <h3 itemprop="name">${escapeHtml(p.name)}</h3>
            <p itemprop="description">${escapeHtml(p.shortDescription)}</p>
            <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
              <span itemprop="priceCurrency" content="GBP">\xA3</span>
              <span itemprop="price">${(p.salePrice ?? p.price).toFixed(2)}</span>
            </div>
          </a>
        </article>`
    ).join("\n");
    const semanticHtml = `
      <header>
        <nav aria-label="Main Navigation">
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/shop">All Collections</a></li>
            ${categoryLinksHtml}
            <li><a href="/blog">Buying Guides</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </nav>
        <h1>${escapeHtml(settings?.heroDesign?.heading || "Luxury Sofas & Beds, Delivered Across the UK")}</h1>
        <p>${escapeHtml(description)}</p>
      </header>
      <main>
        <section aria-label="Featured Collections">
          <h2>Living Room &amp; Bedroom Collections</h2>
          <ul>${categoryLinksHtml}</ul>
        </section>
        <section aria-label="Featured Products">
          <h2>Featured Furniture</h2>
          <div class="products-grid">${featuredProductsHtml}</div>
        </section>
        <section aria-label="Why shop with us">
          <h2>Why Shop With Plush Comfort</h2>
          <p>Free UK mainland delivery, a 1 year warranty, 30-day exchange or return and cash on delivery on every order.</p>
        </section>
      </main>
    `;
    return {
      statusCode: 200,
      title,
      description,
      canonicalUrl: canonical,
      robots: "index, follow",
      h1: settings?.heroDesign?.heading || "Luxury Sofas & Beds, Delivered Across the UK",
      openGraph: {
        title,
        description,
        image: heroImage,
        url: canonical,
        type: "website",
        siteName: brandName
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        image: heroImage
      },
      schemas: [organizationSchema, webSiteSchema],
      semanticHtml
    };
  }
  if (path3.startsWith("/product/")) {
    const slug = path3.replace("/product/", "").trim();
    const product = products.find((p) => p.slug === slug);
    if (!product || !product.isPublished) {
      return {
        statusCode: 404,
        title: "Furniture Piece Not Found | Plush Comfort UK",
        description: "The requested handcrafted furniture piece could not be found or has been moved.",
        canonicalUrl: `${origin}${path3}`,
        robots: "noindex, follow",
        h1: "Furniture Piece Not Found",
        openGraph: {
          title: "Furniture Piece Not Found | Plush Comfort UK",
          description: "The requested piece could not be found.",
          image: DEFAULT_LOGO,
          url: `${origin}${path3}`,
          type: "website",
          siteName: brandName
        },
        twitter: {
          card: "summary",
          title: "Furniture Piece Not Found",
          description: "Piece not found",
          image: DEFAULT_LOGO
        },
        schemas: [organizationSchema],
        semanticHtml: `
          <main>
            <h1>Furniture Piece Not Found</h1>
            <p>The requested product may have been moved or updated.</p>
            <p><a href="/shop">Browse All Handcrafted Furniture</a> | <a href="/category/sofas">Explore Luxury Sofas</a></p>
          </main>
        `
      };
    }
    const category = categories.find((c) => c.id === product.categoryId);
    const title = product.seoTitle || `${product.name} | Handcrafted British ${category?.name || "Furniture"} | Plush Comfort UK`;
    const description = product.seoDescription || product.shortDescription || `Buy the ${product.name} online at Plush Comfort UK. Free UK mainland delivery, 1 year warranty and cash on delivery.`;
    const canonical = product.canonicalUrl || `${origin}/product/${product.slug}`;
    const robots = product.robotsIndexing || "index, follow";
    const mainImage = abs(product.ogImage) || abs(product.images[0]) || defaultImage;
    const currentPrice = product.salePrice ?? product.price;
    const productSchema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.name,
      image: product.images.map((img) => img.startsWith("http") ? img : `${origin}${img}`),
      description: product.seoDescription || product.shortDescription,
      sku: product.sku,
      mpn: product.sku,
      brand: {
        "@type": "Brand",
        name: brandName
      },
      offers: {
        "@type": "Offer",
        url: canonical,
        priceCurrency: "GBP",
        price: currentPrice,
        priceValidUntil: "2027-12-31",
        itemCondition: "https://schema.org/NewCondition",
        availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
        seller: {
          "@type": "Organization",
          name: brandName
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "GB",
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 30,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn"
        },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: 0,
            currency: "GBP"
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "GB"
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 1,
              maxValue: 3,
              unitCode: "d"
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 3,
              maxValue: 7,
              unitCode: "d"
            }
          }
        }
      }
    };
    if (product.reviewCount > 0 && product.rating > 0) {
      productSchema.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: "5",
        worstRating: "1"
      };
    }
    const breadcrumbSchema = {
      "@context": "https://schema.org/",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${origin}/`
        },
        ...category ? [
          {
            "@type": "ListItem",
            position: 2,
            name: category.name,
            item: `${origin}/category/${category.slug}`
          }
        ] : [],
        {
          "@type": "ListItem",
          position: category ? 3 : 2,
          name: product.name,
          item: canonical
        }
      ]
    };
    const relatedHtml = products.filter((p) => p.isPublished && product.relatedProductIds.includes(p.id)).slice(0, 4).map(
      (p) => `<li><a href="/product/${p.slug}">${escapeHtml(p.name)} - \xA3${(p.salePrice ?? p.price).toFixed(2)}</a></li>`
    ).join("\n");
    const semanticHtml = `
      <nav aria-label="Breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          ${category ? `<li><a href="/category/${category.slug}">${escapeHtml(category.name)}</a></li>` : ""}
          <li aria-current="page">${escapeHtml(product.name)}</li>
        </ol>
      </nav>
      <article itemscope itemtype="https://schema.org/Product">
        <header>
          <h1 itemprop="name">${escapeHtml(product.name)}</h1>
          <p class="sku">SKU: <span itemprop="sku">${escapeHtml(product.sku)}</span></p>
          <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
            <span itemprop="priceCurrency" content="GBP">\xA3</span>
            <span itemprop="price" content="${currentPrice.toFixed(2)}">${currentPrice.toFixed(2)}</span>
            <link itemprop="availability" href="${product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/PreOrder"}" />
            <p>Status: ${product.stock > 0 ? `In Stock (${product.stock} units available)` : "Made to order"}</p>
          </div>
        </header>
        <section itemprop="description">
          <h2>Product Overview</h2>
          <p>${escapeHtml(product.fullDescription || product.shortDescription)}</p>
        </section>
        <section>
          <h2>Specifications</h2>
          <table>
            <tbody>
              <tr><th>Width</th><td>${product.dimensions.width} cm</td></tr>
              <tr><th>Height</th><td>${product.dimensions.height} cm</td></tr>
              <tr><th>Depth</th><td>${product.dimensions.depth} cm</td></tr>
              ${product.dimensions.seatHeight ? `<tr><th>Seat Height</th><td>${product.dimensions.seatHeight} cm</td></tr>` : ""}
              <tr><th>Materials</th><td>${escapeHtml(product.materials.join(", "))}</td></tr>
            </tbody>
          </table>
        </section>
        <section>
          <h2>Matching Furniture Pieces</h2>
          <ul>${relatedHtml}</ul>
        </section>
      </article>
    `;
    return {
      statusCode: 200,
      title,
      description,
      canonicalUrl: canonical,
      robots,
      h1: product.name,
      openGraph: {
        title,
        description,
        image: mainImage,
        url: canonical,
        type: "product",
        siteName: brandName
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        image: mainImage
      },
      schemas: [organizationSchema, productSchema, breadcrumbSchema],
      semanticHtml
    };
  }
  if (path3.startsWith("/category/")) {
    const parts = path3.replace("/category/", "").split("/");
    const catSlug = parts[0];
    const subcatSlug = parts[1];
    const category = categories.find(
      (c) => c.slug === catSlug || catSlug === "beds" && c.slug === "beds-bed-frames"
    );
    if (!category || !category.isActive) {
      return {
        statusCode: 404,
        title: "Category Not Found | Plush Comfort UK",
        description: "The requested furniture collection could not be found.",
        canonicalUrl: `${origin}${path3}`,
        robots: "noindex, follow",
        h1: "Category Not Found",
        openGraph: {
          title: "Category Not Found | Plush Comfort UK",
          description: "The requested category could not be found.",
          image: DEFAULT_LOGO,
          url: `${origin}${path3}`,
          type: "website",
          siteName: brandName
        },
        twitter: { card: "summary", title: "Category Not Found", description: "Not found", image: DEFAULT_LOGO },
        schemas: [organizationSchema],
        semanticHtml: `
          <main>
            <h1>Category Not Found</h1>
            <p>The requested furniture category is not available.</p>
            <p><a href="/shop">Browse All Collections</a></p>
          </main>
        `
      };
    }
    const subcategory = subcatSlug ? category.subcategories?.find((s) => s.slug === subcatSlug) : void 0;
    const title = subcategory ? `${subcategory.name} | Handcrafted ${category.name} | Plush Comfort UK` : category.seoTitle || `${category.name} UK | Luxury Handcrafted Furniture | Plush Comfort`;
    const description = category.seoDescription || category.description || `Shop ${category.name} online at Plush Comfort UK. Free UK mainland delivery, 1 year warranty and cash on delivery.`;
    const canonical = subcategory ? `${origin}/category/${category.slug}/${subcategory.slug}` : category.canonicalUrl || `${origin}/category/${category.slug}`;
    const robots = category.robotsIndexing || "index, follow";
    const ogImage = abs(category.ogImage) || abs(category.bannerImage || category.image) || defaultImage;
    const matchingProducts = products.filter((p) => {
      if (!p.isPublished) return false;
      if (p.categoryId === category.id) return true;
      if (category.slug === "sofas" && (p.categoryId.includes("sofa") || p.categoryId === "cat-armchairs")) return true;
      if ((category.slug === "beds-bed-frames" || category.slug === "beds") && (p.categoryId.includes("bed") || p.categoryId === "cat-mattresses")) return true;
      return false;
    });
    const productsHtml = matchingProducts.map(
      (p) => `
        <article class="category-product-card" itemscope itemtype="https://schema.org/Product">
          <a href="/product/${p.slug}">
            <h3 itemprop="name">${escapeHtml(p.name)}</h3>
            <p>From \xA3${(p.salePrice ?? p.price).toFixed(2)}</p>
            <p itemprop="description">${escapeHtml(p.shortDescription)}</p>
          </a>
        </article>`
    ).join("\n");
    const subcatLinksHtml = (category.subcategories || []).map((s) => `<li><a href="/category/${category.slug}/${s.slug}">${escapeHtml(s.name)}</a></li>`).join("\n");
    const breadcrumbSchema = {
      "@context": "https://schema.org/",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${origin}/`
        },
        {
          "@type": "ListItem",
          position: 2,
          name: category.name,
          item: `${origin}/category/${category.slug}`
        },
        ...subcategory ? [
          {
            "@type": "ListItem",
            position: 3,
            name: subcategory.name,
            item: canonical
          }
        ] : []
      ]
    };
    const collectionSchema = {
      "@context": "https://schema.org/",
      "@type": "CollectionPage",
      name: subcategory ? `${subcategory.name} - ${category.name}` : category.name,
      description,
      url: canonical,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: matchingProducts.map((p, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          url: `${origin}/product/${p.slug}`,
          name: p.name
        }))
      }
    };
    const semanticHtml = `
      <nav aria-label="Breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          <li><a href="/category/${category.slug}">${escapeHtml(category.name)}</a></li>
          ${subcategory ? `<li aria-current="page">${escapeHtml(subcategory.name)}</li>` : ""}
        </ol>
      </nav>
      <header>
        <h1>${escapeHtml(subcategory ? `${subcategory.name} - Handcrafted ${category.name}` : category.name)}</h1>
        <p>${escapeHtml(category.description)}</p>
      </header>
      ${subcatLinksHtml ? `<nav aria-label="Subcategories"><ul>${subcatLinksHtml}</ul></nav>` : ""}
      <main>
        <section aria-label="Products">
          <div class="products-grid">${productsHtml}</div>
        </section>
        ${category.bottomSeoDescription ? `
        <section class="editorial-guide">
          <h2>${escapeHtml(category.name)} Buying Guide</h2>
          <p>${escapeHtml(category.bottomSeoDescription)}</p>
        </section>` : ""}
      </main>
    `;
    return {
      statusCode: 200,
      title,
      description,
      canonicalUrl: canonical,
      robots,
      h1: subcategory ? `${subcategory.name} - Handcrafted ${category.name}` : category.name,
      openGraph: {
        title,
        description,
        image: ogImage,
        url: canonical,
        type: "website",
        siteName: brandName
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        image: ogImage
      },
      schemas: [organizationSchema, breadcrumbSchema, collectionSchema],
      semanticHtml
    };
  }
  if (path3 === "/shop") {
    const title = "Shop All Sofas, Beds & Furniture | Plush Comfort UK";
    const description = "Browse the full Plush Comfort range of sofas, corner sofas, Chesterfields, beds and mattresses. Free UK mainland delivery and cash on delivery.";
    const canonical = `${origin}/shop`;
    return {
      statusCode: 200,
      title,
      description,
      canonicalUrl: canonical,
      robots: "index, follow",
      h1: "All Furniture Collections",
      openGraph: {
        title,
        description,
        image: defaultImage,
        url: canonical,
        type: "website",
        siteName: brandName
      },
      twitter: { card: "summary_large_image", title, description, image: defaultImage },
      schemas: [organizationSchema],
      semanticHtml: `
        <header>
          <h1>All Furniture Collections</h1>
          <p>${escapeHtml(description)}</p>
        </header>
        <main>
          <ul>
            ${products.filter((p) => p.isPublished).map((p) => `<li><a href="/product/${p.slug}">${escapeHtml(p.name)} - \xA3${(p.salePrice ?? p.price).toFixed(2)}</a></li>`).join("\n")}
          </ul>
        </main>
      `
    };
  }
  if (path3 === "/blog") {
    const title = "Furniture Guides & Living Inspiration | Plush Comfort UK";
    const description = "Sofa and bed buying guides, size charts, fabric comparisons and care advice from the Plush Comfort team.";
    const canonical = `${origin}/blog`;
    return {
      statusCode: 200,
      title,
      description,
      canonicalUrl: canonical,
      robots: "index, follow",
      h1: "Furniture Guides & Living Inspiration",
      openGraph: { title, description, image: defaultImage, url: canonical, type: "website", siteName: brandName },
      twitter: { card: "summary_large_image", title, description, image: defaultImage },
      schemas: [organizationSchema],
      semanticHtml: `
        <header>
          <h1>Furniture Guides & Living Inspiration</h1>
          <p>${escapeHtml(description)}</p>
        </header>
        <main>
          <ul>
            ${blogPosts.filter((b) => b.isPublished).map((b) => `<li><a href="/blog/${b.slug}">${escapeHtml(b.title)}</a></li>`).join("\n")}
          </ul>
        </main>
      `
    };
  }
  if (path3.startsWith("/blog/")) {
    const slug = path3.replace("/blog/", "").trim();
    const post = blogPosts.find((b) => b.slug === slug);
    if (!post || !post.isPublished) {
      return {
        statusCode: 404,
        title: "Guide Not Found | Plush Comfort UK",
        description: "The requested buying guide or article could not be found.",
        canonicalUrl: `${origin}${path3}`,
        robots: "noindex, follow",
        h1: "Guide Not Found",
        openGraph: { title: "Guide Not Found", description: "", image: DEFAULT_LOGO, url: `${origin}${path3}`, type: "website", siteName: brandName },
        twitter: { card: "summary", title: "Guide Not Found", description: "", image: DEFAULT_LOGO },
        schemas: [organizationSchema],
        semanticHtml: `<h1>Guide Not Found</h1><p><a href="/blog">Browse all articles</a></p>`
      };
    }
    const title = post.seoTitle || `${post.title} | Plush Comfort UK`;
    const description = post.seoDescription || post.excerpt;
    const canonical = post.canonicalUrl || `${origin}/blog/${post.slug}`;
    const coverImage = abs(post.socialImage) || abs(post.coverImage) || defaultImage;
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description,
      image: coverImage,
      author: {
        "@type": "Person",
        name: post.author || "Plush Comfort Team"
      },
      publisher: {
        "@type": "Organization",
        name: brandName,
        logo: {
          "@type": "ImageObject",
          url: DEFAULT_LOGO
        }
      },
      datePublished: post.publishDate,
      dateModified: post.lastUpdated || post.publishDate,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonical
      }
    };
    return {
      statusCode: 200,
      title,
      description,
      canonicalUrl: canonical,
      robots: post.isNoIndex ? "noindex, follow" : "index, follow",
      h1: post.title,
      openGraph: { title, description, image: coverImage, url: canonical, type: "article", siteName: brandName },
      twitter: { card: "summary_large_image", title, description, image: coverImage },
      schemas: [organizationSchema, articleSchema],
      semanticHtml: `
        <article itemscope itemtype="https://schema.org/BlogPosting">
          <header>
            <h1 itemprop="headline">${escapeHtml(post.title)}</h1>
            <p>Published: <time itemprop="datePublished">${post.publishDate}</time> by <span itemprop="author">${escapeHtml(post.author)}</span></p>
          </header>
          <p>${escapeHtml(post.excerpt)}</p>
          <div itemprop="articleBody">${escapeHtml(post.content.replace(/:::[a-z]+[^\n]*\n?/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, ""))}</div>
        </article>
      `
    };
  }
  const staticPages = {
    "/about": {
      title: "About Plush Comfort UK | Online Sofa & Bed Store",
      desc: "Plush Comfort UK is an online furniture store delivering luxury sofas and beds across the UK with free delivery, a 1 year warranty and cash on delivery.",
      h1: "About Plush Comfort UK"
    },
    "/contact": {
      title: "Contact Customer Care | Plush Comfort UK",
      desc: "Questions about an order, delivery or a product? Call, email or WhatsApp the Plush Comfort customer care team, Monday to Saturday.",
      h1: "Contact Plush Comfort"
    },
    "/delivery": {
      title: "Two-Man Room of Choice UK Delivery | Plush Comfort UK",
      desc: "Free UK mainland delivery over \xA3150. Specialist two-man delivery logistics direct to your room of choice with timed delivery slots.",
      h1: "UK Delivery & White Glove Service"
    },
    "/returns": {
      title: "30-Day Exchange & Returns Policy | Plush Comfort UK",
      desc: "30-day hassle-free exchange or return on sofas and beds, plus a 1 year warranty on every order.",
      h1: "30-Day Exchange & Returns Policy"
    },
    "/faqs": {
      title: "Frequently Asked Questions | Plush Comfort UK",
      desc: "Answers to common questions about sizes, fabrics, delivery times, assembly, cash on delivery and returns.",
      h1: "Frequently Asked Questions"
    },
    "/privacy": {
      title: "Privacy Policy | Plush Comfort UK",
      desc: "How Plush Comfort UK securely handles your personal data, payments, and browsing information in compliance with UK GDPR.",
      h1: "Privacy & Data Protection Policy"
    },
    "/terms": {
      title: "Terms & Conditions | Plush Comfort UK",
      desc: "Terms of sale, 1 year warranty conditions, orders, delivery and cash on delivery payment terms for Plush Comfort UK.",
      h1: "Terms & Conditions of Sale"
    },
    "/cookies": {
      title: "Cookie Policy | Plush Comfort UK",
      desc: "Information on essential, functional, and performance cookies used on plushcomfort.uk.",
      h1: "Cookie & Tracking Policy"
    }
  };
  if (staticPages[path3]) {
    const page = staticPages[path3];
    const canonical = `${origin}${path3}`;
    return {
      statusCode: 200,
      title: page.title,
      description: page.desc,
      canonicalUrl: canonical,
      robots: "index, follow",
      h1: page.h1,
      openGraph: { title: page.title, description: page.desc, image: defaultImage, url: canonical, type: "website", siteName: brandName },
      twitter: { card: "summary_large_image", title: page.title, description: page.desc, image: defaultImage },
      schemas: [organizationSchema],
      semanticHtml: `<main><h1>${escapeHtml(page.h1)}</h1><p>${escapeHtml(page.desc)}</p></main>`
    };
  }
  if (path3 === "/admin") {
    return {
      statusCode: 200,
      title: "Master Admin Portal | Plush Comfort UK",
      description: "Administrative management console.",
      canonicalUrl: `${origin}/admin`,
      robots: "noindex, nofollow",
      h1: "Plush Comfort UK Administration",
      openGraph: { title: "Admin", description: "", image: DEFAULT_LOGO, url: `${origin}/admin`, type: "website", siteName: brandName },
      twitter: { card: "summary", title: "Admin", description: "", image: DEFAULT_LOGO },
      schemas: [],
      semanticHtml: `<h1>Plush Comfort UK Administration</h1>`
    };
  }
  return {
    statusCode: 404,
    title: "Page Not Found (404) | Plush Comfort UK",
    description: "The requested page does not exist on Plush Comfort UK.",
    canonicalUrl: `${origin}${path3}`,
    robots: "noindex, follow",
    h1: "Page Not Found (404)",
    openGraph: { title: "404 Not Found", description: "", image: DEFAULT_LOGO, url: `${origin}${path3}`, type: "website", siteName: brandName },
    twitter: { card: "summary", title: "404 Not Found", description: "", image: DEFAULT_LOGO },
    schemas: [organizationSchema],
    semanticHtml: `
      <main>
        <h1>Page Not Found (404)</h1>
        <p>The page you are looking for does not exist.</p>
        <p><a href="/">Return to Home</a> | <a href="/shop">Browse All Furniture</a></p>
      </main>
    `
  };
}
function injectSeoIntoHtml(templateHtml, seoData, settings, ssr) {
  let html = templateHtml;
  const titleTag = `<title>${escapeHtml(seoData.title)}</title>`;
  if (html.includes("<title>")) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, titleTag);
  } else {
    html = html.replace("</head>", `  ${titleTag}
</head>`);
  }
  const metaTags = [
    `<meta name="description" content="${escapeHtml(seoData.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(seoData.canonicalUrl)}" />`,
    `<meta name="robots" content="${escapeHtml(seoData.robots)}" />`,
    // Open Graph
    `<meta property="og:title" content="${escapeHtml(seoData.openGraph.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seoData.openGraph.description)}" />`,
    `<meta property="og:image" content="${escapeHtml(seoData.openGraph.image)}" />`,
    `<meta property="og:url" content="${escapeHtml(seoData.openGraph.url)}" />`,
    `<meta property="og:type" content="${escapeHtml(seoData.openGraph.type)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(seoData.openGraph.siteName)}" />`,
    // Twitter
    `<meta name="twitter:card" content="${escapeHtml(seoData.twitter.card)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(seoData.twitter.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(seoData.twitter.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(seoData.twitter.image)}" />`
  ];
  if (settings?.googleSiteVerification) {
    metaTags.push(`<meta name="google-site-verification" content="${escapeHtml(settings.googleSiteVerification)}" />`);
  }
  if (settings?.bingSiteVerification) {
    metaTags.push(`<meta name="msvalidate.01" content="${escapeHtml(settings.bingSiteVerification)}" />`);
  }
  html = html.replace(/<meta\s+name="description"[\s\S]*?>/gi, "").replace(/<link\s+rel="canonical"[\s\S]*?>/gi, "").replace(/<meta\s+name="robots"[\s\S]*?>/gi, "").replace(/<meta\s+property="og:[^"]+"[\s\S]*?>/gi, "").replace(/<meta\s+name="twitter:[^"]+"[\s\S]*?>/gi, "");
  let schemaTags = "";
  if (seoData.schemas && seoData.schemas.length > 0) {
    schemaTags = seoData.schemas.map((schema) => `  <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
  </script>`).join("\n");
  }
  html = html.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
  const headInject = `
  ${metaTags.join("\n  ")}
${schemaTags}
`;
  html = html.replace("</head>", `${headInject}</head>`);
  const brandedAppShell = `
    <div id="initial-app-shell" style="min-height: 100vh; background-color: #FAF8F5; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; color: #221C18; letter-spacing: -0.02em;">
        PLUSH COMFORT
      </div>
      <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #8A786A; margin-top: 6px; font-weight: 500;">
        Luxury Sofas &amp; Beds \xB7 UK Delivery
      </div>
      <div style="width: 40px; height: 2px; background: #A25828; margin-top: 20px; border-radius: 9999px;"></div>
    </div>`;
  const rootDivRegex = /<div\s+id="root"[\s\S]*?<\/div>(?=\s*<script|\s*<\/body>)/i;
  const simpleRootRegex = /<div\s+id="root"[\s\S]*?<\/div>/i;
  if (ssr?.appHtml) {
    const boot = ssr.bootJson ? `<script>window.__PC_DATA__=${ssr.bootJson.replace(/</g, "\\u003c")}</script>` : "";
    const block = `<div id="root">${ssr.appHtml}</div>${boot}`;
    if (rootDivRegex.test(html)) return html.replace(rootDivRegex, () => block);
    return html.replace("</body>", () => `${block}
</body>`);
  }
  if (seoData.semanticHtml) {
    const crawlerBlock = `
    ${brandedAppShell}
    <noscript id="seo-noscript-content">
      ${seoData.semanticHtml}
    </noscript>
    <div id="seo-crawler-content" class="sr-only" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;" aria-hidden="true">
      ${seoData.semanticHtml}
    </div>`;
    if (rootDivRegex.test(html)) {
      html = html.replace(rootDivRegex, `<div id="root">${crawlerBlock}</div>`);
    } else if (simpleRootRegex.test(html)) {
      html = html.replace(simpleRootRegex, `<div id="root">${crawlerBlock}</div>`);
    } else {
      html = html.replace("</body>", `<div id="root">${crawlerBlock}</div>
</body>`);
    }
  } else {
    if (rootDivRegex.test(html)) {
      html = html.replace(rootDivRegex, `<div id="root">${brandedAppShell}</div>`);
    } else if (simpleRootRegex.test(html)) {
      html = html.replace(simpleRootRegex, `<div id="root">${brandedAppShell}</div>`);
    } else {
      html = html.replace("</body>", `<div id="root">${brandedAppShell}</div>
</body>`);
    }
  }
  return html;
}
function generateXmlSitemap(products, categories, blogPosts, baseUrl = DEFAULT_ORIGIN) {
  const currentDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const urls = [];
  urls.push({ loc: `${baseUrl}/`, lastmod: currentDate, changefreq: "daily", priority: "1.0" });
  urls.push({ loc: `${baseUrl}/shop`, lastmod: currentDate, changefreq: "daily", priority: "0.9" });
  urls.push({ loc: `${baseUrl}/blog`, lastmod: currentDate, changefreq: "daily", priority: "0.8" });
  urls.push({ loc: `${baseUrl}/delivery`, lastmod: currentDate, changefreq: "monthly", priority: "0.7" });
  urls.push({ loc: `${baseUrl}/contact`, lastmod: currentDate, changefreq: "monthly", priority: "0.7" });
  urls.push({ loc: `${baseUrl}/about`, lastmod: currentDate, changefreq: "monthly", priority: "0.6" });
  urls.push({ loc: `${baseUrl}/returns`, lastmod: currentDate, changefreq: "monthly", priority: "0.6" });
  urls.push({ loc: `${baseUrl}/faqs`, lastmod: currentDate, changefreq: "weekly", priority: "0.7" });
  urls.push({ loc: `${baseUrl}/privacy`, lastmod: currentDate, changefreq: "monthly", priority: "0.3" });
  urls.push({ loc: `${baseUrl}/terms`, lastmod: currentDate, changefreq: "monthly", priority: "0.3" });
  urls.push({ loc: `${baseUrl}/cookies`, lastmod: currentDate, changefreq: "monthly", priority: "0.3" });
  categories.filter((c) => c.isActive && c.robotsIndexing !== "noindex, follow" && c.robotsIndexing !== "noindex, nofollow").forEach((c) => {
    urls.push({
      loc: `${baseUrl}/category/${c.slug}`,
      lastmod: currentDate,
      changefreq: "daily",
      priority: "0.9"
    });
    if (c.subcategories && c.subcategories.length > 0) {
      c.subcategories.forEach((sub) => {
        urls.push({
          loc: `${baseUrl}/category/${c.slug}/${sub.slug}`,
          lastmod: currentDate,
          changefreq: "daily",
          priority: "0.8"
        });
      });
    }
  });
  products.filter((p) => p.isPublished && p.robotsIndexing !== "noindex, follow" && p.robotsIndexing !== "noindex, nofollow").forEach((p) => {
    urls.push({
      loc: `${baseUrl}/product/${p.slug}`,
      lastmod: currentDate,
      changefreq: "weekly",
      priority: "0.9"
    });
  });
  blogPosts.filter((b) => b.isPublished && !b.isNoIndex).forEach((b) => {
    urls.push({
      loc: `${baseUrl}/blog/${b.slug}`,
      lastmod: b.lastUpdated || b.publishDate || currentDate,
      changefreq: "monthly",
      priority: "0.7"
    });
  });
  const xmlEntries = urls.map(
    (u) => `  <url>
    <loc>${escapeHtml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;
}
function generateRobotsTxt(baseUrl = DEFAULT_ORIGIN) {
  return `# Robots.txt for Plush Comfort UK
# Official Storefront: ${baseUrl}

User-agent: *
Allow: /
Allow: /uploads/
Allow: /assets/

# Disallow private administration, account, and checkout flows
Disallow: /admin
Disallow: /admin/
Disallow: /api/
Disallow: /basket
Disallow: /checkout
Disallow: /account

# Canonical XML Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;
}
function runSeoAudit(products, categories, blogPosts) {
  let missingTitles = 0;
  let shortTitles = 0;
  let longTitles = 0;
  let missingDescriptions = 0;
  let shortDescriptions = 0;
  let longDescriptions = 0;
  let missingAltTexts = 0;
  let noindexPages = 0;
  const itemsWithWarnings = [];
  products.forEach((p) => {
    const issues = [];
    const title = p.seoTitle || p.name;
    const desc = p.seoDescription || p.shortDescription || "";
    if (!p.seoTitle) missingTitles++;
    if (title.length < 30) shortTitles++;
    if (title.length > 60) longTitles++;
    if (!p.seoDescription) missingDescriptions++;
    if (desc.length < 120) shortDescriptions++;
    if (desc.length > 160) longDescriptions++;
    if (p.robotsIndexing?.includes("noindex")) noindexPages++;
    const hasMissingAlt = p.imageGallery ? p.imageGallery.some((g) => !g.alt || g.alt.trim() === "") : false;
    if (hasMissingAlt) {
      missingAltTexts++;
      issues.push("Missing image alt text in gallery");
    }
    if (!p.seoTitle) issues.push("Missing explicit SEO Title");
    if (!p.seoDescription) issues.push("Missing explicit Meta Description");
    if (title.length < 30) issues.push(`Title too short (${title.length} chars; min 30)`);
    if (title.length > 60) issues.push(`Title too long (${title.length} chars; max 60)`);
    if (issues.length > 0) {
      itemsWithWarnings.push({
        type: "product",
        id: p.id,
        name: p.name,
        url: `/product/${p.slug}`,
        issues
      });
    }
  });
  categories.forEach((c) => {
    const issues = [];
    const title = c.seoTitle || c.name;
    const desc = c.seoDescription || c.description || "";
    if (!c.seoTitle) missingTitles++;
    if (title.length < 30) shortTitles++;
    if (title.length > 60) longTitles++;
    if (!c.seoDescription) missingDescriptions++;
    if (desc.length < 120) shortDescriptions++;
    if (desc.length > 160) longDescriptions++;
    if (c.robotsIndexing?.includes("noindex")) noindexPages++;
    if (!c.imageAlt) {
      missingAltTexts++;
      issues.push("Missing category image alt text");
    }
    if (!c.seoTitle) issues.push("Missing explicit SEO Title");
    if (!c.seoDescription) issues.push("Missing explicit Meta Description");
    if (issues.length > 0) {
      itemsWithWarnings.push({
        type: "category",
        id: c.id,
        name: c.name,
        url: `/category/${c.slug}`,
        issues
      });
    }
  });
  const totalPages = products.length + categories.length + blogPosts.length + 8;
  const crawlableUrlCount = products.filter((p) => p.isPublished && !p.robotsIndexing?.includes("noindex")).length + categories.filter((c) => c.isActive && !c.robotsIndexing?.includes("noindex")).length + blogPosts.filter((b) => b.isPublished && !b.isNoIndex).length + 8;
  return {
    totalPages,
    totalProducts: products.length,
    totalCategories: categories.length,
    totalBlogPosts: blogPosts.length,
    missingTitles,
    shortTitles,
    longTitles,
    missingDescriptions,
    shortDescriptions,
    longDescriptions,
    missingAltTexts,
    noindexPages,
    crawlableUrlCount,
    itemsWithWarnings
  };
}
function autoFixMissingSeo(products, categories) {
  let fixCount = 0;
  const updatedProducts = products.map((p) => {
    let changed = false;
    let seoTitle = p.seoTitle;
    let seoDescription = p.seoDescription;
    let canonicalUrl = p.canonicalUrl;
    let imageGallery = p.imageGallery;
    if (!seoTitle || seoTitle.length < 25) {
      seoTitle = `${p.name} | Luxury Handcrafted British Sofa`;
      if (seoTitle.length > 60) {
        seoTitle = `${p.name} | Plush Comfort UK`;
      }
      changed = true;
      fixCount++;
    }
    if (!seoDescription || seoDescription.length < 80) {
      seoDescription = `Shop the ${p.name} at Plush Comfort UK. Free UK mainland delivery, 1 year warranty and cash on delivery.`;
      if (seoDescription.length > 160) {
        seoDescription = seoDescription.slice(0, 157) + "...";
      }
      changed = true;
      fixCount++;
    }
    if (!canonicalUrl) {
      canonicalUrl = `https://plushcomfort.uk/product/${p.slug}`;
      changed = true;
    }
    if (imageGallery) {
      imageGallery = imageGallery.map((img, i) => {
        if (!img.alt || img.alt.trim() === "") {
          changed = true;
          fixCount++;
          return { ...img, alt: `${p.name} handcrafted photo ${i + 1}` };
        }
        return img;
      });
    }
    return changed ? { ...p, seoTitle, seoDescription, canonicalUrl, imageGallery } : p;
  });
  const updatedCategories = categories.map((c) => {
    let changed = false;
    let seoTitle = c.seoTitle;
    let seoDescription = c.seoDescription;
    let canonicalUrl = c.canonicalUrl;
    let imageAlt = c.imageAlt;
    if (!seoTitle || seoTitle.length < 25) {
      seoTitle = `${c.name} UK | Luxury Handcrafted British Furniture`;
      if (seoTitle.length > 60) seoTitle = `${c.name} | Plush Comfort UK`;
      changed = true;
      fixCount++;
    }
    if (!seoDescription || seoDescription.length < 80) {
      seoDescription = `Shop ${c.name} online at Plush Comfort UK. Free UK mainland delivery, 1 year warranty and cash on delivery.`;
      if (seoDescription.length > 160) seoDescription = seoDescription.slice(0, 157) + "...";
      changed = true;
      fixCount++;
    }
    if (!canonicalUrl) {
      canonicalUrl = `https://plushcomfort.uk/category/${c.slug}`;
      changed = true;
    }
    if (!imageAlt) {
      imageAlt = `${c.name} handcrafted luxury British collection`;
      changed = true;
      fixCount++;
    }
    return changed ? { ...c, seoTitle, seoDescription, canonicalUrl, imageAlt } : c;
  });
  return { updatedProducts, updatedCategories, fixCount };
}

// src/utils/imageHelper.ts
var FURNITURE_IMAGES = {
  // Hero Accent Chair (as seen in approved screenshot)
  heroAccentChair: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
    <defs>
      <radialGradient id="shadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="%238C7A6B" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="%238C7A6B" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="chairBoucle" x1="20%" y1="10%" x2="80%" y2="90%">
        <stop offset="0%" stop-color="%23FBF8F3"/>
        <stop offset="45%" stop-color="%23F2ECE3"/>
        <stop offset="100%" stop-color="%23DED4C7"/>
      </linearGradient>
      <linearGradient id="cushionShadow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="%23ECE3D7"/>
        <stop offset="100%" stop-color="%23C8BCAE"/>
      </linearGradient>
      <linearGradient id="oakLeg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23A87B51"/>
        <stop offset="50%" stop-color="%238C5E35"/>
        <stop offset="100%" stop-color="%23684120"/>
      </linearGradient>
    </defs>
    <!-- Background Soft Floor Ambient -->
    <ellipse cx="300" cy="510" rx="200" ry="28" fill="url(%23shadow)"/>
    
    <!-- Wooden Legs -->
    <!-- Back-left leg -->
    <polygon points="210,390 195,490 205,492 225,390" fill="%23684120"/>
    <!-- Back-right leg -->
    <polygon points="380,390 405,490 395,492 365,390" fill="%23684120"/>
    <!-- Front-left leg -->
    <polygon points="230,410 205,515 220,518 250,410" fill="url(%23oakLeg)"/>
    <!-- Front-right leg -->
    <polygon points="360,410 395,515 380,518 340,410" fill="url(%23oakLeg)"/>
    <!-- Leg stretcher crossbar -->
    <rect x="235" y="420" width="120" height="10" rx="3" fill="%238C5E35" transform="rotate(-2 295 425)"/>

    <!-- Chair Main Shell Backrest & Arms -->
    <path d="M 160 260 C 150 180, 210 100, 300 100 C 390 100, 450 180, 440 260 C 435 310, 420 370, 395 395 C 370 415, 230 415, 205 395 C 180 370, 165 310, 160 260 Z" fill="url(%23chairBoucle)"/>
    
    <!-- Inner Sculpted Back Cushion -->
    <path d="M 190 240 C 185 170, 230 125, 300 125 C 370 125, 415 170, 410 240 C 405 285, 385 340, 300 340 C 215 340, 195 285, 190 240 Z" fill="%23F7F2EB" opacity="0.85"/>
    
    <!-- Curved Left Armrest Fold -->
    <path d="M 160 250 C 155 310, 185 365, 225 380 C 235 345, 215 290, 195 240 Z" fill="%23E4DACE"/>
    <!-- Curved Right Armrest Fold -->
    <path d="M 440 250 C 445 310, 415 365, 375 380 C 365 345, 385 290, 405 240 Z" fill="%23D7CCC0"/>

    <!-- Thick Plush Deep Seat Cushion -->
    <path d="M 195 350 C 190 320, 410 320, 405 350 C 400 395, 375 420, 300 422 C 225 420, 200 395, 195 350 Z" fill="url(%23cushionShadow)"/>
    <ellipse cx="300" cy="358" rx="100" ry="32" fill="url(%23chairBoucle)"/>
    
    <!-- Boucle Texture Piping Seams -->
    <path d="M 200 370 Q 300 395 400 370" stroke="%23CABDB0" stroke-width="2.5" fill="none"/>
    <path d="M 230 180 Q 300 195 370 180" stroke="%23DDD2C5" stroke-width="1.5" stroke-dasharray="3,3" fill="none"/>
  </svg>`,
  // Living Room Sofa Scene (as seen in Card 1)
  livingRoomSofa: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 460" width="100%" height="100%">
    <defs>
      <radialGradient id="roomShadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="%23685A4E" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="%23685A4E" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="sofaFabric" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="%23FAF6F0"/>
        <stop offset="70%" stop-color="%23EDE4D8"/>
        <stop offset="100%" stop-color="%23D8CABE"/>
      </linearGradient>
      <linearGradient id="flutedOak" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="%238E613B"/>
        <stop offset="50%" stop-color="%23B07D4F"/>
        <stop offset="100%" stop-color="%238E613B"/>
      </linearGradient>
    </defs>
    <!-- Room Floor Shadow -->
    <ellipse cx="320" cy="410" rx="270" ry="30" fill="url(%23roomShadow)"/>
    
    <!-- Sofa Legs -->
    <polygon points="120,330 110,400 122,402 135,330" fill="%23634024"/>
    <polygon points="500,330 510,400 498,402 485,330" fill="%23634024"/>
    <polygon points="210,330 205,400 215,400 220,330" fill="%23634024"/>
    <polygon points="410,330 415,400 405,400 400,330" fill="%23634024"/>

    <!-- Sofa Main Backrest Frame -->
    <rect x="100" y="160" width="420" height="150" rx="24" fill="url(%23sofaFabric)"/>
    
    <!-- Backrest Cushions -->
    <rect x="120" y="150" width="125" height="120" rx="16" fill="%23F5EFE6" stroke="%23D5C7B7" stroke-width="1.5"/>
    <rect x="255" y="150" width="125" height="120" rx="16" fill="%23F8F2EA" stroke="%23D5C7B7" stroke-width="1.5"/>
    <rect x="390" y="150" width="125" height="120" rx="16" fill="%23F3EDE3" stroke="%23D5C7B7" stroke-width="1.5"/>

    <!-- Left & Right Track Armrests -->
    <rect x="90" y="210" width="40" height="130" rx="14" fill="%23ECE3D6" stroke="%23D0C2B2" stroke-width="1"/>
    <rect x="505" y="210" width="40" height="130" rx="14" fill="%23ECE3D6" stroke="%23D0C2B2" stroke-width="1"/>

    <!-- Plump Deep Seat Base Cushions -->
    <rect x="120" y="260" width="130" height="75" rx="14" fill="%23FDFBF7" stroke="%23D2C4B3" stroke-width="1.5"/>
    <rect x="255" y="260" width="130" height="75" rx="14" fill="%23FAF5EE" stroke="%23D2C4B3" stroke-width="1.5"/>
    <rect x="390" y="260" width="130" height="75" rx="14" fill="%23F6EFE6" stroke="%23D2C4B3" stroke-width="1.5"/>

    <!-- Scatter Cushions -->
    <!-- Left soft throw cushion -->
    <rect x="140" y="215" width="55" height="55" rx="10" transform="rotate(-12 165 240)" fill="%23DFD3C3" stroke="%23C2B3A1" stroke-width="1"/>
    <!-- Right caramel accent cushion -->
    <rect x="440" y="215" width="55" height="55" rx="10" transform="rotate(10 465 240)" fill="%23BA7A4C" stroke="%239E5F34" stroke-width="1"/>

    <!-- Round Fluted Coffee Table In Front -->
    <ellipse cx="320" cy="400" rx="80" ry="24" fill="%23A17045"/>
    <path d="M 240 375 L 240 410 Q 320 432 400 410 L 400 375 Z" fill="url(%23flutedOak)"/>
    <!-- Fluted vertical lines on table -->
    <line x1="260" y1="380" x2="260" y2="415" stroke="%237A4E29" stroke-width="2"/>
    <line x1="280" y1="383" x2="280" y2="418" stroke="%237A4E29" stroke-width="2"/>
    <line x1="300" y1="385" x2="300" y2="420" stroke="%237A4E29" stroke-width="2"/>
    <line x1="320" y1="385" x2="320" y2="420" stroke="%237A4E29" stroke-width="2"/>
    <line x1="340" y1="385" x2="340" y2="420" stroke="%237A4E29" stroke-width="2"/>
    <line x1="360" y1="383" x2="360" y2="418" stroke="%237A4E29" stroke-width="2"/>
    <line x1="380" y1="380" x2="380" y2="415" stroke="%237A4E29" stroke-width="2"/>
    <ellipse cx="320" cy="375" rx="80" ry="22" fill="%23C9986B"/>

    <!-- Ceramic Bowl On Table -->
    <ellipse cx="318" cy="370" rx="30" ry="9" fill="%23ECE6DC"/>
    <ellipse cx="318" cy="368" rx="25" ry="7" fill="%23DBD3C6"/>

    <!-- Decorative Fiddle-Leaf Fig Plant in background right -->
    <path d="M 545 190 Q 565 160 595 180 Q 575 210 545 190 Z" fill="%23536B4D"/>
    <path d="M 540 215 Q 575 220 585 245 Q 555 255 540 215 Z" fill="%2343583E"/>
    <path d="M 535 240 Q 560 260 575 285 Q 545 290 535 240 Z" fill="%235A7553"/>
  </svg>`,
  // Luxury Bed Scene (Card 2)
  luxuryBed: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 460" width="100%" height="100%">
    <defs>
      <radialGradient id="bedShadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="%23685A4E" stop-opacity="0.32"/>
        <stop offset="100%" stop-color="%23685A4E" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="headboardFabric" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="%23F6EFE7"/>
        <stop offset="50%" stop-color="%23E8DFD3"/>
        <stop offset="100%" stop-color="%23D5C8B8"/>
      </linearGradient>
      <linearGradient id="linenCover" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23FDFDFB"/>
        <stop offset="60%" stop-color="%23F3EDE3"/>
        <stop offset="100%" stop-color="%23DFD5C7"/>
      </linearGradient>
    </defs>
    <!-- Bed Ambient Shadow -->
    <ellipse cx="320" cy="415" rx="260" ry="25" fill="url(%23bedShadow)"/>

    <!-- Deep Channel Tufted Headboard -->
    <rect x="140" y="80" width="360" height="230" rx="16" fill="url(%23headboardFabric)" stroke="%23C9BCAB" stroke-width="2"/>
    <!-- Vertical Channels -->
    <line x1="200" y1="82" x2="200" y2="305" stroke="%23BBAE9C" stroke-width="3"/>
    <line x1="260" y1="82" x2="260" y2="305" stroke="%23BBAE9C" stroke-width="3"/>
    <line x1="320" y1="82" x2="320" y2="305" stroke="%23BBAE9C" stroke-width="3"/>
    <line x1="380" y1="82" x2="380" y2="305" stroke="%23BBAE9C" stroke-width="3"/>
    <line x1="440" y1="82" x2="440" y2="305" stroke="%23BBAE9C" stroke-width="3"/>

    <!-- Left Nightstand & Lamp -->
    <rect x="70" y="260" width="60" height="90" rx="8" fill="%23BA885B"/>
    <rect x="75" y="300" width="50" height="40" rx="4" fill="%23A17147"/>
    <circle cx="100" cy="320" r="3" fill="%23E2BE8D"/>
    <!-- Lamp -->
    <path d="M 90 260 L 100 210 L 110 260 Z" fill="%23EFE9DF"/>
    <polygon points="85,210 115,210 120,185 80,185" fill="%23FAF7F2" stroke="%23DFD6C8" stroke-width="1"/>

    <!-- Right Nightstand -->
    <rect x="510" y="260" width="60" height="90" rx="8" fill="%23BA885B"/>
    <rect x="515" y="300" width="50" height="40" rx="4" fill="%23A17147"/>
    <circle cx="540" cy="320" r="3" fill="%23E2BE8D"/>

    <!-- Bed Upholstered Mattress & Base -->
    <polygon points="140,290 500,290 480,405 160,405" fill="%23DFD6C9"/>
    
    <!-- Plush Layered Pillows -->
    <rect x="170" y="220" width="130" height="70" rx="14" fill="%23FFFFFF" stroke="%23DDD2C4" stroke-width="1.5"/>
    <rect x="340" y="220" width="130" height="70" rx="14" fill="%23FFFFFF" stroke="%23DDD2C4" stroke-width="1.5"/>
    <rect x="185" y="245" width="105" height="55" rx="10" fill="%23EFE7DB" stroke="%23CFC3B3" stroke-width="1.5"/>
    <rect x="350" y="245" width="105" height="55" rx="10" fill="%23B77549" stroke="%239D5F34" stroke-width="1.5"/>

    <!-- Folded Linen Duvet -->
    <path d="M 155 285 L 485 285 L 475 395 L 165 395 Z" fill="url(%23linenCover)"/>
    <path d="M 155 285 Q 320 305 485 285 L 480 325 Q 320 345 160 325 Z" fill="%23EDE3D4"/>
    
    <!-- End of Bed Waffle Throw Blanket -->
    <path d="M 165 360 L 475 360 L 470 405 L 170 405 Z" fill="%23A65F32" stroke="%238C4C24" stroke-width="1"/>
  </svg>`,
  // Limited Time Promo Credenza Scene
  promoCredenza: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 400" width="100%" height="100%">
    <defs>
      <linearGradient id="credenzaOak" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23C5996D"/>
        <stop offset="50%" stop-color="%23AC7F53"/>
        <stop offset="100%" stop-color="%238C5F36"/>
      </linearGradient>
      <linearGradient id="brassLamp" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="%23DFBA74"/>
        <stop offset="100%" stop-color="%23A9823C"/>
      </linearGradient>
    </defs>
    <!-- Background subtle oval line decoration -->
    <ellipse cx="400" cy="220" rx="240" ry="140" fill="none" stroke="%23E2D0BE" stroke-width="1.5" stroke-dasharray="6,4"/>

    <!-- Floor Shadow -->
    <ellipse cx="400" cy="355" rx="270" ry="20" fill="%237D6E60" opacity="0.25"/>

    <!-- Credenza Cabinet Sideboard -->
    <!-- Legs -->
    <polygon points="170,290 160,350 170,352 180,290" fill="%23674321"/>
    <polygon points="340,290 350,350 340,352 330,290" fill="%23674321"/>
    <!-- Body -->
    <rect x="150" y="170" width="210" height="130" rx="8" fill="url(%23credenzaOak)"/>
    <!-- 3 Doors -->
    <rect x="155" y="175" width="65" height="120" rx="4" fill="%23BA8D61" stroke="%23966D44" stroke-width="1"/>
    <rect x="223" y="175" width="65" height="120" rx="4" fill="%23C29569" stroke="%23966D44" stroke-width="1"/>
    <rect x="291" y="175" width="65" height="120" rx="4" fill="%23BA8D61" stroke="%23966D44" stroke-width="1"/>
    <!-- Minimalist Knobs -->
    <circle cx="210" cy="235" r="3" fill="%2356371A"/>
    <circle cx="233" cy="235" r="3" fill="%2356371A"/>
    <circle cx="345" cy="235" r="3" fill="%2356371A"/>

    <!-- Ceramic Vase & Botanical Branch on Credenza -->
    <path d="M 270 170 C 265 155, 260 145, 275 145 C 290 145, 285 155, 280 170 Z" fill="%23ECE4D8" stroke="%23CCC0B2" stroke-width="1"/>
    <path d="M 275 145 Q 260 105 250 85" stroke="%2358483B" stroke-width="2" fill="none"/>
    <ellipse cx="250" cy="90" rx="6" ry="12" transform="rotate(-30 250 90)" fill="%23859678"/>
    <ellipse cx="265" cy="115" rx="6" ry="10" transform="rotate(25 265 115)" fill="%23859678"/>

    <!-- Mid-Century Armchair -->
    <!-- Chair Legs -->
    <polygon points="410,280 395,355 405,357 425,280" fill="%235A391D"/>
    <polygon points="530,280 550,355 540,357 515,280" fill="%235A391D"/>
    <!-- Seat & Backrest -->
    <rect x="410" y="180" width="115" height="100" rx="14" fill="%23ECE5DA" stroke="%23D3C6B5" stroke-width="1.5"/>
    <rect x="420" y="250" width="95" height="35" rx="8" fill="%23FAF6F0"/>
    <!-- Sculpted Wooden Arms -->
    <path d="M 395 240 Q 450 220 515 240" stroke="%238C5F36" stroke-width="6" stroke-linecap="round" fill="none"/>

    <!-- Brass Arched Floor Lamp -->
    <ellipse cx="600" cy="350" rx="25" ry="6" fill="%238C6E33"/>
    <line x1="600" y1="350" x2="600" y2="120" stroke="url(%23brassLamp)" stroke-width="3"/>
    <path d="M 600 120 Q 600 90 575 90" stroke="url(%23brassLamp)" stroke-width="3" fill="none"/>
    <!-- Lamp Shade -->
    <path d="M 560 120 L 590 120 L 580 90 L 570 90 Z" fill="%23FAF7F0" stroke="%23D8CFBE" stroke-width="1"/>
    <!-- Warm Light Glow -->
    <polygon points="560,120 590,120 620,240 530,240" fill="%23FEEBC8" opacity="0.18"/>
  </svg>`,
  // Brand imagery
  workshop: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440" width="100%" height="100%">
    <defs>
      <linearGradient id="woodTable" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="%23A7784A"/>
        <stop offset="100%" stop-color="%237D532A"/>
      </linearGradient>
    </defs>
    <!-- Background Workshop Wall -->
    <rect width="640" height="440" fill="%23F4EFE8"/>
    <!-- Timber Planks on Wall -->
    <rect x="60" y="40" width="520" height="15" fill="%23D8CABB"/>
    <rect x="60" y="70" width="520" height="15" fill="%23D8CABB"/>
    <!-- Hanging Master Joinery Tools -->
    <rect x="120" y="85" width="8" height="60" fill="%238E5E35"/>
    <polygon points="120,145 128,145 126,170 122,170" fill="%239EA5AB"/>
    <rect x="160" y="85" width="10" height="40" rx="2" fill="%23BA7A48"/>
    <rect x="200" y="85" width="14" height="70" fill="%23563B23"/>

    <!-- Artisan Solid Wood Workbench -->
    <rect x="40" y="220" width="560" height="40" rx="4" fill="url(%23woodTable)"/>
    <rect x="70" y="260" width="35" height="160" fill="%23674320"/>
    <rect x="535" y="260" width="35" height="160" fill="%23674320"/>

    <!-- Handcrafted Sofa Solid Beech Wood Frame Being Built -->
    <rect x="140" y="170" width="360" height="18" rx="2" fill="%23D1A572" stroke="%239D7241" stroke-width="1"/>
    <rect x="150" y="110" width="16" height="60" fill="%23D1A572"/>
    <rect x="470" y="110" width="16" height="60" fill="%23D1A572"/>
    <rect x="140" y="100" width="360" height="18" rx="2" fill="%23D1A572"/>

    <!-- Rolls of Luxurious Boucle & Velvet Fabric -->
    <ellipse cx="490" cy="210" rx="25" ry="12" fill="%23A15A2B"/>
    <rect x="465" y="160" width="50" height="50" fill="%23B86B38"/>
    <ellipse cx="490" cy="160" rx="25" ry="12" fill="%23D68651"/>

    <ellipse cx="540" cy="210" rx="22" ry="10" fill="%234A5642"/>
    <rect x="518" y="170" width="44" height="40" fill="%235C6C52"/>
    <ellipse cx="540" cy="170" rx="22" ry="10" fill="%23728667"/>

    <!-- Yellow Traditional Tailor Measuring Tape -->
    <path d="M 120 220 Q 240 235 380 215" stroke="%23E5B537" stroke-width="5" fill="none"/>
  </svg>`
};

// src/data/blogPosts.ts
var IMG = (file) => `/uploads/blog/${file}`;
var INITIAL_BLOG_POSTS = [
  // ───────────────────────── PILLAR 1: SOFAS ─────────────────────────
  {
    id: "blog-sofa-pillar",
    title: "The Complete UK Sofa Buying Guide: Size, Comfort & Fabrics",
    slug: "uk-sofa-buying-guide",
    contentType: "pillar_page",
    type: "pillar",
    category: "Sofas",
    status: "published",
    isPublished: true,
    lastUpdated: "2026-10-18",
    excerpt: "Everything you need to know before you buy a sofa online in the UK \u2014 frames and fillings, picking the right size and shape, choosing a fabric that suits your home, and getting it through the front door.",
    content: `Buying a sofa online is easy once you know what to look for. A good sofa should feel supportive on day one, still look good years later, and actually fit through your door. This guide walks you through every decision in the order you should make it.

:::takeaways
Measure your room, doorways and stairs before you choose a style.
Corner and U-shape sofas suit open-plan rooms; 2 and 3 seaters suit snugs and flats.
Velvet and chenille are soft and family-friendly; leather is the easiest to wipe clean.
Every Plush Comfort sofa comes with free UK mainland delivery, a 1 year warranty and cash on delivery.
:::

## What makes a sofa comfortable and long-lasting?
Comfort comes from three layers working together: the frame, the support system, and the cushion fillings.

- **The frame** \u2014 a solid timber frame with reinforced joints keeps the sofa square and quiet. Avoid frames that creak or rock when you sit on the arm.
- **The support** \u2014 pocket springs or serpentine springs under the seat stop you from sinking. Webbing alone softens faster.
- **The fillings** \u2014 high-density foam keeps its shape; fibre-wrapped foam feels softer and needs plumping.

![A cream fabric 3+2 sofa set in a bright living room](${IMG("uk-sofa-buying-guide-1.webp")} "Matching 3+2 sets give a room balance \u2014 the Nicole 3+2 Chesterfield set")

:::tip Comfort test at home
Sit back fully with your feet flat on the floor. Your knees should be roughly level with your hips. Seat heights between 44\u201348cm suit most adults.
:::

## Which sofa shape suits your room?
Choose the shape first, then the size. The right shape makes a room feel bigger; the wrong one blocks walkways.

| Shape | Best for | Typical width |
|---|---|---|
| **2 Seater** | Flats, snugs, bay windows | 150\u2013180 cm |
| **3 Seater** | Most living rooms | 190\u2013220 cm |
| **Corner (L-shape)** | Open-plan rooms, families | 240\u2013280 cm per side |
| **U-shape** | Large lounges, movie nights | 300\u2013340 cm |

:::chart bar Typical sofa widths unit=cm
2 Seater | 165
3 Seater | 210
Corner sofa | 260
U-shape sofa | 330
:::

## How to measure before you order
Most delivery problems happen at the door, not in the room. Measure these five things:

:::steps
Room space | Mark the sofa footprint with masking tape and leave at least 45\u201360cm in front for walking.
Front door | Measure the width and height of the opening with the door fully open.
Hallway and turns | Note radiators, banisters and tight corners that reduce the space.
Stairs | For upstairs rooms, measure the diagonal clearance under the ceiling.
Lifts and flats | Check the lift door and inside depth if you live in an apartment.
:::

Read the full step-by-step method in [How to Measure a Room for a Sofa](/blog/how-to-measure-living-room-for-sofa).

## Choosing the right fabric
Your fabric decides how the sofa feels and how easy it is to live with.

- **Plush and crushed velvet** \u2014 soft, rich colour and surprisingly pet-friendly because there are no loops to catch.
- **Chenille and textured weaves** \u2014 cosy, hard-wearing and great at hiding everyday marks.
- **Leather** \u2014 wipes clean easily and develops character over time.

Compare them side by side in [Fabric vs Velvet & Leather](/blog/fabric-vs-velvet-leather-sofas).

![A grey corner sofa with scatter cushions in a living room](${IMG("uk-sofa-buying-guide-2.webp")} "Corner sofas make the most of open-plan spaces")

## Our most popular sofas

:::products prod-124, prod-216, prod-136, prod-223
:::

## Delivery, warranty and payment
Every sofa from Plush Comfort is delivered free to UK mainland addresses. You pay by **cash on delivery**, every order includes a **1 year warranty**, and you have **30 days to exchange or return**. See our [delivery information](/delivery) for timescales.

:::cta Ready to find your sofa? | Shop All Sofas | /category/sofas
Free UK delivery \xB7 1 year warranty \xB7 Cash on delivery
:::`,
    coverImage: IMG("uk-sofa-buying-guide-cover.webp"),
    socialImage: IMG("uk-sofa-buying-guide-cover.webp"),
    author: "Plush Comfort Team",
    authorRole: "Furniture Buying Advisors",
    publishDate: "10 Aug 2026",
    readTime: "8 min read",
    tags: ["Sofa Guide", "Pillar Guide", "Living Room"],
    seoTitle: "UK Sofa Buying Guide: Size, Comfort & Fabrics | Plush Comfort",
    seoDescription: "How to choose a sofa in the UK: frames and fillings, sofa shapes and sizes, fabric choices and how to measure your doors before you buy online.",
    canonicalUrl: "https://plushcomfort.uk/blog/uk-sofa-buying-guide",
    relatedCategorySlug: "sofas",
    relatedProductIds: ["prod-124", "prod-216", "prod-136"],
    keyTakeaways: [],
    faqs: [
      { question: "How long does a good sofa last?", answer: "With a solid frame, sprung seats and regular cushion plumping, a quality sofa normally stays comfortable for many years. Rotating cushions every couple of weeks helps them wear evenly." },
      { question: "Is a corner sofa or a 3+2 set better?", answer: "A corner sofa seats more people in less floor space and suits open-plan rooms. A 3+2 set is more flexible to arrange and easier to fit through narrow hallways." },
      { question: "Can I pay when my sofa arrives?", answer: "Yes. Plush Comfort orders are paid by cash on delivery, so you only pay when your sofa is delivered." }
    ],
    pillarLayout: {
      eyebrow: "Plush Comfort Sofa Buying Guide",
      primaryCtaText: "Start Reading",
      secondaryCtaText: "Shop Sofas",
      secondaryCtaLink: "/category/sofas",
      showTableOfContents: true,
      showChapterNumbers: true,
      closingTitle: "Ready to choose your sofa?",
      closingText: "Free UK mainland delivery, a 1 year warranty, 30-day exchange or return, and cash on delivery on every order.",
      closingCtaText: "Shop All Sofas",
      closingCtaLink: "/category/sofas"
    }
  },
  {
    id: "blog-sofa-size",
    title: "7 Easy Ways to Refresh Your Living Room (And Pick the Right Sofa Size)",
    slug: "how-to-choose-right-sofa-size",
    contentType: "cluster_article",
    type: "cluster",
    parentPillarId: "blog-sofa-pillar",
    pillarSlug: "uk-sofa-buying-guide",
    category: "Sofas",
    status: "published",
    isPublished: true,
    lastUpdated: "2026-10-18",
    excerpt: "Simple interior rules for sofa proportions, coffee table spacing, layout and texture that make any UK living room feel bigger and more welcoming.",
    content: `A fresh living room rarely needs a full makeover. Getting the sofa size and layout right does most of the work.

:::takeaways
Your sofa should take up about two-thirds of the wall it sits against.
Leave 45\u201360cm between the sofa and the coffee table.
Raised legs and lighter fabrics make small rooms feel larger.
:::

## 1. Size the sofa to the wall
A sofa that fills roughly two-thirds of its wall looks balanced. Much smaller and the room feels empty; much larger and it feels cramped.

## 2. Try the masking tape test
Mark the sofa's width and depth on the floor for a day. Walk around it, open doors and check you can still reach windows and radiators.

![A U-shape sofa with matching footstool in a bright lounge](${IMG("how-to-choose-right-sofa-size-1.webp")} "A footstool adds seating without blocking the room")

## 3. Space the coffee table properly
Keep **45\u201360cm** between the sofa and coffee table, and choose a table that sits a few centimetres lower than the seat.

## 4. Choose legs for the room size
Visible legs let light pass under the sofa, which makes compact rooms feel more open. Chunky skirted bases suit large rooms.

## 5. Layer textures
Mix a smooth velvet sofa with a chunky knit throw or a textured rug. Texture adds warmth without adding clutter.

## 6. Angle seating for conversation
Not every seat has to face the TV. Angling an armchair towards the sofa creates a natural conversation corner.

## 7. Protect busy areas
For homes with children and pets, choose fabrics that hide marks \u2014 crushed velvet and chenille are good choices.

![A grey corner sofa arranged in a living room](${IMG("how-to-choose-right-sofa-size-2.webp")} "Corner sofas tuck neatly into an unused corner")

:::products prod-152, prod-174
:::`,
    coverImage: IMG("how-to-choose-right-sofa-size-cover.webp"),
    socialImage: IMG("how-to-choose-right-sofa-size-cover.webp"),
    author: "Plush Comfort Team",
    authorRole: "Interior & Styling Advice",
    publishDate: "12 Aug 2026",
    readTime: "5 min read",
    tags: ["Decor Tips", "Living Room", "Sofa Sizing"],
    seoTitle: "How to Choose the Right Sofa Size for Your Living Room | Plush Comfort",
    seoDescription: "7 easy tips to pick the right sofa size, space your coffee table and refresh your UK living room layout.",
    canonicalUrl: "https://plushcomfort.uk/blog/how-to-choose-right-sofa-size",
    relatedCategorySlug: "sofas",
    relatedProductIds: ["prod-152", "prod-174", "prod-119"],
    faqs: [
      { question: "How much space should be between a sofa and a TV?", answer: "A simple rule is to sit about 1.5 to 2.5 times the screen size (diagonal) away from the TV." }
    ]
  },
  {
    id: "blog-fabric-care",
    title: "Fabric vs Velvet & Leather: Which Sofa Material Lasts Longest?",
    slug: "fabric-vs-velvet-leather-sofas",
    contentType: "comparison_article",
    type: "cluster",
    parentPillarId: "blog-sofa-pillar",
    pillarSlug: "uk-sofa-buying-guide",
    category: "Sofas",
    status: "published",
    isPublished: true,
    lastUpdated: "2026-10-18",
    excerpt: "An honest comparison of fabric, velvet and leather sofas \u2014 how they feel, how they wear, and which suits homes with children and pets.",
    content: `Your sofa material affects comfort, cleaning and how the sofa ages. Here is how the three most popular options compare.

:::takeaways
Velvet is soft and resists pet claws because it has no loops.
Chenille and textured fabrics hide everyday marks well.
Leather is the easiest to wipe clean and ages with character.
:::

## Quick comparison

| | Fabric / Chenille | Velvet | Leather |
|---|---|---|---|
| **Feel** | Soft and cosy | Plush and smooth | Cool, firm, smooth |
| **Pets** | Good | Very good | Good (watch for scratches) |
| **Cleaning** | Vacuum + spot clean | Brush + spot clean | Wipe with a damp cloth |
| **Look over time** | Relaxes gently | May show light "shading" | Develops a patina |

:::chart bar Ease of cleaning (out of 10)
Leather | 9
Velvet | 7
Chenille fabric | 7
:::

## Fabric and chenille
Textured fabrics feel warm and inviting. Their weave hides small marks and crumbs, which makes them a practical family choice.

![Close-up of a soft fabric sofa arm with stud detail](${IMG("fabric-vs-velvet-leather-sofas-1.webp")} "Textured fabric hides everyday marks")

## Velvet and crushed velvet
Velvet has a short, dense pile with no loops, so claws are less likely to snag. Crushed velvet has a shimmering finish that disguises pressure marks.

:::tip Velvet care
Brush velvet gently in one direction every few weeks to keep the pile looking even.
:::

## Leather
Leather is ideal if you want something you can simply wipe down. It softens with use and develops a rich patina.

![A classic oxblood leather Chesterfield sofa](${IMG("fabric-vs-velvet-leather-sofas-2.webp")} "Leather Chesterfields age beautifully")

:::products prod-223, prod-160
:::`,
    coverImage: IMG("fabric-vs-velvet-leather-sofas-cover.webp"),
    socialImage: IMG("fabric-vs-velvet-leather-sofas-cover.webp"),
    author: "Plush Comfort Team",
    authorRole: "Upholstery Care Advice",
    publishDate: "05 Aug 2026",
    readTime: "6 min read",
    tags: ["Furniture Care", "Fabrics", "Materials"],
    seoTitle: "Fabric vs Velvet vs Leather Sofas: Which Lasts Longest? | Plush Comfort",
    seoDescription: "Compare fabric, velvet and leather sofas for comfort, cleaning, pets and durability before you buy.",
    canonicalUrl: "https://plushcomfort.uk/blog/fabric-vs-velvet-leather-sofas",
    relatedCategorySlug: "sofas",
    relatedProductIds: ["prod-223", "prod-160", "prod-174"],
    faqs: [
      { question: "Is velvet good for a sofa with pets?", answer: "Yes \u2014 velvet has a flat pile with no loops, so claws are less likely to catch than on woven fabrics." },
      { question: "Which sofa material is easiest to clean?", answer: "Leather is the easiest; most spills can be wiped away with a damp cloth." }
    ]
  },
  {
    id: "blog-sofa-measure",
    title: "How to Measure a Room for a Sofa: Step-by-Step UK Guide",
    slug: "how-to-measure-living-room-for-sofa",
    contentType: "howto_guide",
    type: "cluster",
    parentPillarId: "blog-sofa-pillar",
    pillarSlug: "uk-sofa-buying-guide",
    category: "Sofas",
    status: "published",
    isPublished: true,
    lastUpdated: "2026-10-18",
    excerpt: "A simple measuring checklist for doorways, hallways, stairs and the room itself, so your new sofa arrives without surprises.",
    content: `Measuring takes ten minutes and saves a lot of stress on delivery day. You will need a tape measure, masking tape and the sofa dimensions from the product page.

## Step-by-step

:::steps
Measure the room | Note the wall length and where windows, radiators and sockets are.
Mark the footprint | Use masking tape to outline the sofa's width and depth on the floor.
Check the walkway | Leave 45\u201360cm in front of the sofa and about 75cm for main walkways.
Measure the front door | Width and height of the opening with the door fully open.
Measure hallways and corners | Note anything that sticks out, such as radiators or coat hooks.
Measure stairs | Check the height between the stairs and the ceiling at the tightest point.
:::

![A light grey sofa photographed straight on](${IMG("how-to-measure-living-room-for-sofa-1.webp")} "Compare the sofa depth with your narrowest doorway")

:::tip The depth rule
A sofa usually goes through a doorway on its back or side, so compare the sofa's **depth** and **height** \u2014 not its width \u2014 with the door opening.
:::

:::checklist Before you order
- Room measured and footprint taped
- Front door width and height noted
- Hallway width checked
- Stair clearance checked (if upstairs)
- Parking and access for the delivery team
:::

![A cream U-shape sofa in a living room](${IMG("how-to-measure-living-room-for-sofa-2.webp")} "Large sofas arrive in sections that fit through standard doors")

Unsure about a measurement? Send a photo and your measurements to our team on WhatsApp and we will help you check \u2014 see [Contact us](/contact).`,
    coverImage: IMG("how-to-measure-living-room-for-sofa-cover.webp"),
    socialImage: IMG("how-to-measure-living-room-for-sofa-cover.webp"),
    author: "Plush Comfort Team",
    authorRole: "Delivery & Customer Care",
    publishDate: "12 Aug 2026",
    readTime: "5 min read",
    tags: ["How To", "Sizing", "Delivery"],
    seoTitle: "How to Measure a Room for a Sofa | Step-by-Step UK Guide | Plush Comfort",
    seoDescription: "Measure your room, doors, hallway and stairs before buying a sofa online with this simple UK checklist.",
    canonicalUrl: "https://plushcomfort.uk/blog/how-to-measure-living-room-for-sofa",
    relatedCategorySlug: "sofas",
    relatedProductIds: ["prod-112", "prod-119"],
    faqs: [
      { question: "Do corner sofas come in one piece?", answer: "Most corner and U-shape sofas arrive in separate sections that join together in your room, which makes them much easier to get through doors." }
    ]
  },
  {
    id: "blog-sofa-small-rooms",
    title: "Best Sofa Styles for Small UK Living Rooms & Snugs",
    slug: "best-sofa-styles-small-living-rooms",
    contentType: "cluster_article",
    type: "cluster",
    parentPillarId: "blog-sofa-pillar",
    pillarSlug: "uk-sofa-buying-guide",
    category: "Sofas",
    status: "published",
    isPublished: true,
    lastUpdated: "2026-10-18",
    excerpt: "How to get comfortable seating in a compact living room \u2014 the right sofa size, arm style, legs and colour for flats, terraces and snugs.",
    content: `Small rooms need sofas that work hard without taking over. These style choices make the biggest difference.

## Choose a compact size
A 2 or 3 seater is usually the best fit for a small living room. If you need more seats, a compact corner sofa can use a dead corner instead of the middle of the room.

![A grey fabric corner sofa in a compact living room](${IMG("best-sofa-styles-small-living-rooms-1.webp")} "A compact corner sofa uses an unused corner")

## Watch the arms
Large rolled arms add width without adding seats. Slimmer arms give you more sitting space for the same overall width.

## Raise it up
Sofas on visible legs show more floor, which tricks the eye into seeing a bigger room.

## Go lighter
Light greys, creams and soft neutrals reflect light and keep a small room feeling fresh.

![A light grey sofa with scatter cushions](${IMG("best-sofa-styles-small-living-rooms-2.webp")} "Light neutrals keep compact rooms bright")

:::products prod-187, prod-15
:::`,
    coverImage: IMG("best-sofa-styles-small-living-rooms-cover.webp"),
    socialImage: IMG("best-sofa-styles-small-living-rooms-cover.webp"),
    author: "Plush Comfort Team",
    authorRole: "Interior & Styling Advice",
    publishDate: "15 Aug 2026",
    readTime: "4 min read",
    tags: ["Small Spaces", "Living Room"],
    seoTitle: "Best Sofas for Small Living Rooms in the UK | Plush Comfort",
    seoDescription: "Compact sofa styles, sizes and colours that make small UK living rooms, flats and snugs feel bigger.",
    canonicalUrl: "https://plushcomfort.uk/blog/best-sofa-styles-small-living-rooms",
    relatedCategorySlug: "sofas",
    relatedProductIds: ["prod-187", "prod-15", "prod-166"]
  },
  {
    id: "blog-sofa-clean",
    title: "How to Clean and Maintain a Fabric or Velvet Sofa",
    slug: "how-to-clean-and-maintain-sofa",
    contentType: "howto_guide",
    type: "cluster",
    parentPillarId: "blog-sofa-pillar",
    pillarSlug: "uk-sofa-buying-guide",
    category: "Care & Maintenance",
    status: "published",
    isPublished: true,
    lastUpdated: "2026-10-18",
    excerpt: "A simple care routine to keep fabric and velvet sofas looking new: weekly vacuuming, cushion plumping and what to do when something spills.",
    content: `A few minutes of care each week keeps your sofa looking and feeling new for longer.

:::timeline
Every week | Vacuum with a soft brush attachment; Plump seat and back cushions
Every two weeks | Rotate reversible cushions; Brush velvet gently in one direction
Every few months | Check feet and fixings are tight; Spot clean any marks
:::

## Weekly vacuuming
Dust and grit wear fabric fibres over time. Use the soft brush attachment on a low setting.

![Close-up of a crushed velvet sofa cushion](${IMG("how-to-clean-and-maintain-sofa-1.webp")} "Brush velvet gently to keep the pile even")

## What to do when something spills

:::steps
Act fast | The sooner you treat a spill, the easier it comes out.
Blot, don't rub | Press a clean white cloth onto the spill to absorb it. Rubbing pushes it deeper.
Use cold water | Lightly dampen a cloth with cold water. Hot water can set stains.
Let it air dry | Keep away from radiators and direct heat.
:::

:::warning Always test first
Try any cleaner on a hidden area before using it on a visible part of the sofa.
:::

![Detail of a soft fabric sofa arm](${IMG("how-to-clean-and-maintain-sofa-2.webp")} "Regular plumping keeps cushions in shape")`,
    coverImage: IMG("how-to-clean-and-maintain-sofa-cover.webp"),
    socialImage: IMG("how-to-clean-and-maintain-sofa-cover.webp"),
    author: "Plush Comfort Team",
    authorRole: "Upholstery Care Advice",
    publishDate: "18 Aug 2026",
    readTime: "4 min read",
    tags: ["Care & Maintenance", "Cleaning"],
    seoTitle: "How to Clean a Fabric or Velvet Sofa | Care Guide | Plush Comfort",
    seoDescription: "Weekly care routine and spill guide for fabric and velvet sofas \u2014 vacuuming, plumping and stain removal tips.",
    canonicalUrl: "https://plushcomfort.uk/blog/how-to-clean-and-maintain-sofa",
    relatedCategorySlug: "sofas",
    relatedProductIds: ["prod-223", "prod-136"]
  },
  // ───────────────────────── PILLAR 2: BEDS ─────────────────────────
  {
    id: "blog-bed-pillar",
    title: "UK Bed Sizes & Storage Explained: Single, Double, King & Super King",
    slug: "uk-bed-sizes-and-storage-guide",
    contentType: "pillar_page",
    type: "pillar",
    category: "Beds",
    status: "published",
    isPublished: true,
    lastUpdated: "2026-10-18",
    excerpt: "UK bed sizes in centimetres and feet, how much room each size needs, and how ottoman, divan and upholstered frames compare for storage.",
    content: `Choosing a bed starts with two questions: what size fits your room, and how much storage do you need? This guide answers both.

:::takeaways
A UK double is 135 \xD7 190cm; a king is 150 \xD7 200cm.
Leave at least 60cm of walking space around the bed.
Ottoman beds give the most storage; divans suit rooms where you can open drawers.
:::

## UK bed sizes

| Size | Mattress (cm) | Feet | Suggested room |
|---|---|---|---|
| **Single** | 90 \xD7 190 | 3ft | 2.5 \xD7 3.0 m |
| **Small Double** | 120 \xD7 190 | 4ft | 3.0 \xD7 3.0 m |
| **Double** | 135 \xD7 190 | 4ft 6in | 3.2 \xD7 3.5 m |
| **King** | 150 \xD7 200 | 5ft | 3.6 \xD7 4.0 m |
| **Super King** | 180 \xD7 200 | 6ft | 4.0 \xD7 4.5 m |

*Bed frames, especially upholstered ones with tall headboards, are usually 10\u201315cm larger than the mattress.*

:::chart bar Mattress width by size unit=cm
Single | 90
Small Double | 120
Double | 135
King | 150
Super King | 180
:::

![A double divan bed set with a panelled headboard](${IMG("uk-bed-sizes-and-storage-guide-1.webp")} "A double bed suits most UK master and guest bedrooms")

## Ottoman, divan or bed frame?
- **Ottoman beds** lift up on gas struts to reveal storage under the whole mattress.
- **Divan beds** have drawers in the base \u2014 handy if you have space beside the bed.
- **Upholstered bed frames** make a statement with tall headboards and suit larger rooms.

Read the full comparison: [Ottoman vs Divan vs Standard Frames](/blog/ottoman-vs-divan-vs-standard-beds).

![An upholstered bed with a tall buttoned headboard](${IMG("uk-bed-sizes-and-storage-guide-2.webp")} "Tall headboards create a focal point")

## Our popular beds

:::products prod-194, prod-130
:::

:::cta Find your new bed | Shop Beds | /category/beds-bed-frames
Free UK mainland delivery \xB7 1 year warranty \xB7 Cash on delivery
:::`,
    coverImage: IMG("uk-bed-sizes-and-storage-guide-cover.webp"),
    socialImage: IMG("uk-bed-sizes-and-storage-guide-cover.webp"),
    author: "Plush Comfort Team",
    authorRole: "Bedroom & Sleep Advice",
    publishDate: "08 Aug 2026",
    readTime: "7 min read",
    tags: ["Bed Guide", "Pillar Guide", "Bedroom"],
    seoTitle: "UK Bed Sizes Explained: Single to Super King (cm & ft) | Plush Comfort",
    seoDescription: "UK bed sizes in cm and feet, room sizes for each, and how ottoman, divan and upholstered beds compare for storage.",
    canonicalUrl: "https://plushcomfort.uk/blog/uk-bed-sizes-and-storage-guide",
    relatedCategorySlug: "beds-bed-frames",
    relatedProductIds: ["prod-194", "prod-130", "prod-19"],
    faqs: [
      { question: "What size is a UK double bed?", answer: "A UK double mattress is 135cm wide and 190cm long (4ft 6in \xD7 6ft 3in)." },
      { question: "Is a king size bed too big for a small bedroom?", answer: "A king needs a room of roughly 3.6 \xD7 4.0m to leave comfortable walking space. In smaller rooms a double usually fits better." }
    ],
    pillarLayout: {
      eyebrow: "Plush Comfort Bed Buying Guide",
      primaryCtaText: "See Bed Sizes",
      secondaryCtaText: "Shop Beds",
      secondaryCtaLink: "/category/beds-bed-frames",
      showTableOfContents: true,
      showChapterNumbers: true,
      closingTitle: "Ready for a better night\u2019s sleep?",
      closingText: "Free UK mainland delivery, a 1 year warranty, 30-day exchange or return, and cash on delivery.",
      closingCtaText: "Shop Beds",
      closingCtaLink: "/category/beds-bed-frames"
    }
  },
  {
    id: "blog-bed-storage",
    title: "Small Bedroom Storage Ideas: Make the Most of an Ottoman Bed",
    slug: "small-bedroom-organization-ideas",
    contentType: "cluster_article",
    type: "cluster",
    parentPillarId: "blog-bed-pillar",
    pillarSlug: "uk-bed-sizes-and-storage-guide",
    category: "Beds",
    status: "published",
    isPublished: true,
    lastUpdated: "2026-10-18",
    excerpt: "Practical storage ideas for small UK bedrooms \u2014 from using the space under your bed to choosing a headboard that makes the room feel taller.",
    content: `In a small bedroom, the bed can take up nearly half the floor. Using the space underneath it is the quickest way to free up room.

:::steps
Store out-of-season clothes | Vacuum bags under an ottoman base keep coats and jumpers dust-free.
Replace a chest of drawers | Under-bed storage can free floor space for a chair or mirror.
Go tall with the headboard | A tall headboard draws the eye upwards in low-ceilinged rooms.
Keep bedside clutter low | Wall shelves or slim bedside tables keep floors clear.
:::

![A divan bed with storage in a cosy bedroom](${IMG("small-bedroom-organization-ideas-1.webp")} "Under-bed storage replaces bulky furniture")

:::tip Measure the lift space
An ottoman lifts from the foot end, so make sure nothing blocks the end of the bed.
:::

![A made bed with a panelled headboard and bedside lamps](${IMG("small-bedroom-organization-ideas-2.webp")} "Matching lamps keep the look calm and tidy")

:::products prod-130, prod-194
:::`,
    coverImage: IMG("small-bedroom-organization-ideas-cover.webp"),
    socialImage: IMG("small-bedroom-organization-ideas-cover.webp"),
    author: "Plush Comfort Team",
    authorRole: "Bedroom & Sleep Advice",
    publishDate: "09 Aug 2026",
    readTime: "4 min read",
    tags: ["Storage", "Bedroom", "Bed Guide"],
    seoTitle: "Small Bedroom Storage Ideas & Ottoman Beds | Plush Comfort",
    seoDescription: "Space-saving ideas for small UK bedrooms: ottoman storage, tall headboards and decluttering tips.",
    canonicalUrl: "https://plushcomfort.uk/blog/small-bedroom-organization-ideas",
    relatedCategorySlug: "beds-bed-frames",
    relatedProductIds: ["prod-130", "prod-194"]
  },
  {
    id: "blog-bed-comparison",
    title: "Ottoman Beds vs Divan vs Standard Frames: Which Should You Buy?",
    slug: "ottoman-vs-divan-vs-standard-beds",
    contentType: "comparison_article",
    type: "cluster",
    parentPillarId: "blog-bed-pillar",
    pillarSlug: "uk-bed-sizes-and-storage-guide",
    category: "Beds",
    status: "published",
    isPublished: true,
    lastUpdated: "2026-10-18",
    excerpt: "A side-by-side look at storage, access, cleaning and style for ottoman beds, divan beds and upholstered bed frames.",
    content: `Each bed type suits a different room and lifestyle. Here is how they compare.

| Feature | Ottoman bed | Divan bed | Upholstered frame |
|---|---|---|---|
| **Storage** | Whole base | Drawers | Little or none |
| **Access** | Lifts from the foot end | Drawers need side space | \u2014 |
| **Dust** | Enclosed | Enclosed in drawers | Floor visible underneath |
| **Look** | Upholstered statement | Classic and simple | Tall headboard focal point |

:::chart pie Where shoppers say they need storage most
Clothes | 45
Bedding | 30
Shoes & bags | 15
Other | 10
:::

![A tall buttoned upholstered bed in a bedroom](${IMG("ottoman-vs-divan-vs-standard-beds-1.webp")} "Upholstered frames make a statement")

## Our verdict
- Choose an **ottoman** if you need maximum storage in a small room.
- Choose a **divan** if you want drawers and have space beside the bed.
- Choose an **upholstered frame** if style and a tall headboard matter most.

![A divan bed with an orthopaedic mattress](${IMG("ottoman-vs-divan-vs-standard-beds-2.webp")} "Divan sets come with a matching mattress")`,
    coverImage: IMG("ottoman-vs-divan-vs-standard-beds-cover.webp"),
    socialImage: IMG("ottoman-vs-divan-vs-standard-beds-cover.webp"),
    author: "Plush Comfort Team",
    authorRole: "Bedroom & Sleep Advice",
    publishDate: "14 Aug 2026",
    readTime: "5 min read",
    tags: ["Bed Comparison", "Ottoman Beds", "Divans"],
    seoTitle: "Ottoman vs Divan vs Bed Frame: Which to Buy? | Plush Comfort",
    seoDescription: "Compare ottoman beds, divan beds and upholstered frames for storage, access, cleaning and style.",
    canonicalUrl: "https://plushcomfort.uk/blog/ottoman-vs-divan-vs-standard-beds",
    relatedCategorySlug: "beds-bed-frames",
    relatedProductIds: ["prod-194", "prod-130"]
  },
  {
    id: "blog-bed-faqs",
    title: "Bed Buying FAQs: Sizes, Mattresses & Delivery",
    slug: "uk-bed-buying-faqs-and-resources",
    contentType: "faq_resource",
    type: "cluster",
    parentPillarId: "blog-bed-pillar",
    pillarSlug: "uk-bed-sizes-and-storage-guide",
    category: "Buying Resources",
    status: "published",
    isPublished: true,
    lastUpdated: "2026-10-18",
    excerpt: "Quick answers to the questions we are asked most about beds \u2014 mattress compatibility, gas-lift ottomans, delivery and payment.",
    content: `Answers to the questions our customer care team hears most often.

:::faq
Q: Can I use my existing mattress?
A: Yes, as long as it matches the bed size (for example a 135 \xD7 190cm mattress for a UK double).
Q: Are gas-lift ottoman beds safe?
A: Gas struts hold the base open while you use the storage and close smoothly when pushed down. Keep fingers clear of the hinge area when closing.
Q: How will a large bed get through my hallway?
A: Beds are delivered in parts and assembled in your room, so they fit through standard doors and stairs.
Q: How do I pay?
A: All orders are cash on delivery \u2014 you pay when your bed arrives.
Q: What if I change my mind?
A: You have 30 days to exchange or return, and every bed includes a 1 year warranty. See our [returns policy](/returns).
:::

![An upholstered bed in a calm bedroom](${IMG("uk-bed-buying-faqs-and-resources-1.webp")} "Upholstered beds are delivered in parts and assembled in your room")`,
    coverImage: IMG("uk-bed-buying-faqs-and-resources-cover.webp"),
    socialImage: IMG("uk-bed-buying-faqs-and-resources-cover.webp"),
    author: "Plush Comfort Team",
    authorRole: "Customer Care",
    publishDate: "20 Aug 2026",
    readTime: "3 min read",
    tags: ["FAQs", "Buying Advice", "Beds"],
    seoTitle: "Bed Buying FAQs: Sizes, Mattresses & Delivery | Plush Comfort UK",
    seoDescription: "Answers about mattress sizes, ottoman gas lifts, delivery through narrow hallways, payment and returns.",
    canonicalUrl: "https://plushcomfort.uk/blog/uk-bed-buying-faqs-and-resources",
    relatedCategorySlug: "beds-bed-frames",
    relatedProductIds: ["prod-194", "prod-130", "prod-19"]
  }
];

// src/data/initialData.ts
var DEFAULT_HOMEPAGE_SECTIONS = [
  {
    id: "hero",
    type: "hero",
    title: "Flagship Interactive Hero Showcase",
    subtitle: "Premium UK Online Furniture Store",
    description: "Luxury sofas & ottoman beds delivered across the UK",
    order: 1,
    isVisible: true
  },
  {
    id: "dual_promos",
    type: "dual_promos",
    title: "Featured Collection Cards",
    subtitle: "Living Room Collection",
    description: "Direct showcase cards for Corner Sofas and Luxury Beds",
    image: "/uploads/products/nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric-1.webp",
    order: 2,
    isVisible: true
  },
  {
    id: "categories",
    type: "categories",
    title: "Shop by Category",
    subtitle: "Curated British Catalog",
    description: "Explore all handcrafted living and bedroom collections",
    order: 3,
    isVisible: true
  },
  {
    id: "trending",
    type: "trending",
    title: "Trending Customer Favourites",
    subtitle: "Plush Comfort UK Bestsellers",
    description: "Our most-loved sofas and beds \u2014 free UK delivery, 1 year warranty and cash on delivery.",
    productIds: ["prod-216", "prod-194", "prod-223", "prod-180", "prod-130"],
    order: 4,
    isVisible: true
  },
  {
    id: "under_2500",
    type: "under_2500",
    title: "Shop Furniture Under \xA32,500",
    subtitle: "Luxury Within Reach",
    description: "Luxury suites, corner sofas and storage beds at honest online prices.",
    productIds: ["prod-216", "prod-194", "prod-180", "prod-130"],
    order: 5,
    isVisible: true
  },
  {
    id: "sofas",
    type: "sofas",
    title: "Sofas & Living Room Suites",
    subtitle: "Sofas & Living Room",
    description: "Kiln-dried beech frames, high-tensile serpentine springs, and stain-resistant luxury velvets.",
    productIds: ["prod-216", "prod-223", "prod-180", "prod-181"],
    order: 6,
    isVisible: true
  },
  {
    id: "beds",
    type: "beds",
    title: "Luxury Beds & Ottoman Frames",
    subtitle: "Bespoke Bedroom Storage",
    description: "German hydraulic gas pistons, reinforced timber slats, and deep diamond wingback headboards.",
    productIds: ["prod-194", "prod-130", "prod-195", "prod-131"],
    order: 7,
    isVisible: true
  },
  {
    id: "deal_banner",
    type: "deal_banner",
    title: "Save up to \xA3400 Off Handcrafted Suites",
    subtitle: "Limited Autumn Promotion \xB7 Free UK Delivery",
    description: "Every order includes free UK mainland delivery, a 1 year warranty, 30-day exchange or return, and cash on delivery.",
    image: "/uploads/products/nicole-32-chesterfield-sofa-set-in-soft-fabric-with-studded-detail-1.webp",
    ctaText: "Shop Autumn Sale",
    ctaLink: "/shop",
    order: 8,
    isVisible: true
  },
  {
    id: "guides",
    type: "guides",
    title: "Home Inspiration & Buying Guides",
    subtitle: "Expert British upholstery guides, doorway clearances & hydraulic ottoman storage advice.",
    order: 9,
    isVisible: true
  }
];
var INITIAL_SETTINGS = {
  brandName: "Plush Comfort UK",
  phone: "+44 7923 119077",
  whatsapp: "+44 7923 119077",
  email: "plushcomfort@gmail.com",
  address: "Registered in England & Wales",
  businessHours: "Monday \u2013 Saturday: 9:00 AM \u2013 6:00 PM (Closed Sundays)",
  freeDeliveryThreshold: 150,
  standardDeliveryFee: 39.99,
  whiteGloveDeliveryFee: 79.99,
  promoBannerText: "Autumn Living Event: Up to 40% off handcrafted sofas & bespoke beds + Free UK delivery over \xA3150",
  isPromoBannerActive: true,
  announcementLink: "/shop",
  logoUrl: "/assets/brand/plush-comfort-official-logo.webp",
  logoAlt: "Plush Comfort UK Official Logo",
  faviconUrl: "/favicon.ico",
  heroDesign: {
    heading: "British Craftsmanship, Tailored for Comfort",
    subheading: "Premium sofas, corner suites and ottoman beds \u2014 ordered online and delivered free to your door.",
    description: "Deep-seated comfort, premium velvets and solid frames \u2014 with free UK mainland delivery and cash on delivery.",
    desktopImage: "/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-1.webp",
    mobileImage: "/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-2.webp",
    imageAlt: "Verona plush velvet corner sofa",
    primaryCtaText: "Shop Handcrafted Sofas",
    primaryCtaLink: "/category/sofas",
    secondaryCtaText: "Explore Bespoke Beds",
    secondaryCtaLink: "/category/beds-bed-frames",
    alignment: "left",
    showTrustBadges: true,
    showFloatingCard: true,
    isVisible: true
  },
  megaMenuDesign: {
    columns: [
      {
        id: "col-sofas",
        title: "Sofas & Sectionals",
        links: [
          { title: "All Sofas", url: "/category/sofas" },
          { title: "Chesterfield Sofas", url: "/category/chesterfield-sofas", badge: "Popular" },
          { title: "Corner Sofas & L-Shape", url: "/category/corner-sofas" },
          { title: "Fabric & Velvet Sofas", url: "/category/fabric-sofas" },
          { title: "Armchairs & Cuddle Chairs", url: "/category/armchairs" }
        ]
      },
      {
        id: "col-beds",
        title: "Beds & Sleep",
        links: [
          { title: "Beds & Bed Frames", url: "/category/beds-bed-frames" },
          { title: "Ottoman Storage Beds", url: "/category/ottoman-beds", badge: "Best Seller" },
          { title: "Orthopaedic Mattresses", url: "/category/mattresses" },
          { title: "Living Room Furniture", url: "/category/living-room-furniture" }
        ]
      },
      {
        id: "col-guides",
        title: "Buying Guides & Care",
        links: [
          { title: "Sofa Buying Guide 2026", url: "/blog" },
          { title: "Ottoman Bed Storage Guide", url: "/blog" },
          { title: "Velvet Fabric Care Guide", url: "/blog" },
          { title: "Measuring Your Living Room", url: "/blog" }
        ]
      }
    ],
    promoImage: "/uploads/products/ambassador-luxury-deep-buttoned-upholstered-bed-frame-1.webp",
    promoTitle: "Ambassador Deep-Tufted Ottoman Bed",
    promoTag: "Special Offer",
    promoLink: "/product/ambassador-luxury-deep-buttoned-upholstered-bed-frame",
    promoDescription: "Gas-lift hydraulic storage with handcrafted buttoned chesterfield headboard. Made to order.",
    isVisible: true
  },
  footerDesign: {
    aboutText: "Plush Comfort UK is an online furniture store delivering luxury sofas, corner suites and ottoman beds across the UK \u2014 with free delivery, a 1 year warranty and cash on delivery.",
    columns: [
      {
        id: "col-shop",
        title: "Shop Collections",
        links: [
          { title: "Handcrafted Sofas", url: "/category/sofas" },
          { title: "Chesterfield Suites", url: "/category/chesterfield-sofas" },
          { title: "Corner & U-Shape Sofas", url: "/category/corner-sofas" },
          { title: "Ottoman Storage Beds", url: "/category/ottoman-beds" },
          { title: "Pocket Sprung Mattresses", url: "/category/mattresses" },
          { title: "Shop All Products", url: "/shop" }
        ]
      },
      {
        id: "col-care",
        title: "Customer Care",
        links: [
          { title: "UK Delivery & White Glove", url: "/delivery" },
          { title: "30-Day Exchange & Returns", url: "/returns" },
          { title: "Track Your Order", url: "/account" },
          { title: "Saved Wishlist", url: "/wishlist" },
          { title: "Frequently Asked Questions", url: "/faqs" },
          { title: "Contact Customer Care", url: "/contact" }
        ]
      },
      {
        id: "col-guides",
        title: "Inspiration & Guides",
        links: [
          { title: "Sofa Buying Guide", url: "/blog" },
          { title: "Fabric & Velvet Care", url: "/blog" },
          { title: "Room Measuring Tips", url: "/blog" },
          { title: "About Plush Comfort", url: "/about" }
        ]
      }
    ],
    phone: "+44 7923 119077",
    whatsapp: "+44 7923 119077",
    email: "plushcomfort@gmail.com",
    address: "",
    openingHours: "Mon - Sat: 9:00 AM - 6:00 PM | Sun: Closed",
    socialInstagram: "https://instagram.com/plushcomfortuk",
    socialFacebook: "https://facebook.com/plushcomfortuk",
    socialPinterest: "https://pinterest.com/plushcomfortuk",
    copyrightText: "\xA9 2026 Plush Comfort UK. All rights reserved. Registered in England & Wales."
  },
  homepageSections: DEFAULT_HOMEPAGE_SECTIONS
};
var INITIAL_CATEGORIES = [
  {
    id: "cat-sofas",
    name: "Sofas",
    slug: "sofas",
    seoTitle: "Luxury Handcrafted Sofas UK | Bespoke British Living | Plush Comfort",
    seoDescription: "Shop handcrafted British sofas delivered across the UK. Explore corner sofas, 3-seaters, loveseats and sofa beds with European hardwood frames and 1 year warranty.",
    description: "Bespoke, handcrafted British sofas engineered for cloud-like comfort and timeless elegance.",
    bottomSeoDescription: "At Plush Comfort, every sofa is built using kiln-dried European hardwood frames and high-density pocket-sprung bases. Whether you are seeking a grand corner sofa for family gatherings, an elegant 3-seater for a formal living room, or a space-saving chaise sofa bed, our collections offer unmatched durability and bespoke British tailoring. All frames come backed by our 1 year warranty, delivered directly to your room of choice with our specialist two-man delivery team. Read our comprehensive sofa guide at /blog/uk-sofa-buying-guide for expert advice on sizing and fabric care.",
    image: "/uploads/products/luxury-u-shape-sofa-1.webp",
    isActive: true,
    order: 1,
    subcategories: [
      { id: "sub-sofa-corner", name: "Corner Sofas", slug: "corner-sofas", description: "Generous modular and L-shaped sectional sofas designed to maximise seating and living space." },
      { id: "sub-sofa-3seater", name: "3-Seater Sofas", slug: "3-seater-sofas", description: "Classic British family sofas offering deep cushioning and refined proportions." },
      { id: "sub-sofa-2seater", name: "2-Seater Sofas", slug: "2-seater-sofas", description: "Compact loveseats and 2-seater sofas ideal for apartments, snugs, and bay windows." },
      { id: "sub-sofa-recliner", name: "Recliner Sofas", slug: "recliner-sofas", description: "Smooth power and manual reclining sofas engineered for ultimate ergonomic relaxation." },
      { id: "sub-sofa-bed", name: "Sofa Beds", slug: "sofa-beds", description: "Dual-purpose click-clack and pull-out sofa beds with luxury guest mattresses." },
      { id: "sub-sofa-chaise", name: "Chaise Longues", slug: "chaise-longues", description: "Sculptural reading loungers and extended chaise pieces for timeless decadence." }
    ],
    faqs: [
      { question: "Do you deliver sofas across the UK?", answer: "Yes. Every Plush Comfort sofa is delivered free to UK mainland addresses, comes with a 1 year warranty, and you pay by cash on delivery." },
      { question: "How do I measure my doorway for sofa delivery?", answer: "We recommend checking the narrowest doorway width, hallway turns, and ceiling height. Our delivery team offers two-man room-of-choice delivery and removable wooden sofa feet to ensure smooth access." },
      { question: "What fabric protection is included?", answer: "Our fabrics are treated with high-grade Scotchgard stain resistance, and removable cushion covers can be professionally dry cleaned." }
    ]
  },
  {
    id: "cat-chesterfield-sofas",
    name: "Chesterfield Sofas",
    slug: "chesterfield-sofas",
    seoTitle: "Chesterfield Sofas UK | Hand-Buttoned Leather & Velvet | Plush Comfort",
    seoDescription: "Authentic British Chesterfield sofas delivered across the UK. Deep button-tufting, scroll arms, pocket sprung seating and solid hardwood frames.",
    description: "Iconic British heritage Chesterfield sofas featuring deep hand-tufted diamond buttoning, sweeping rolled arms, and opulent upholstery.",
    bottomSeoDescription: "An undisputed icon of British furniture making, the Chesterfield sofa embodies timeless grandeur and artisan pride. Each deep button is hand-pulled through individually pleated leather or plush velvet, anchored firmly into solid beech framework. Fitted with heavy-duty serpentine spring suspension and high-resilience reflex foam cores, our Chesterfields marry historical grandeur with contemporary everyday comfort. Available in antique hand-rubbed leathers and sumptuous stain-resistant velvets.",
    image: "/uploads/products/nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric-1.webp",
    isActive: true,
    order: 2,
    subcategories: [
      { id: "sub-chesterfield-3seater", name: "3-Seater Chesterfields", slug: "3-seater-chesterfields" },
      { id: "sub-chesterfield-corner", name: "Chesterfield Corner Sofas", slug: "chesterfield-corner-sofas" },
      { id: "sub-chesterfield-chair", name: "Chesterfield Club Chairs", slug: "chesterfield-club-chairs" }
    ],
    faqs: [
      { question: "What makes an authentic Chesterfield sofa?", answer: "Authentic Chesterfields feature deep diamond button tufting where the folds are manually pleated rather than machine-stitched, rolled arms at equal height to the back, and turned solid wood bun feet." },
      { question: "Are Chesterfield sofas comfortable for daily lounging?", answer: "Yes. While traditional Chesterfields could be quite firm, Plush Comfort combines traditional hand-pleating with modern pocket-sprung bases and high-resilience foam toppers for deep, ergonomic comfort." }
    ]
  },
  {
    id: "cat-corner-sofas",
    name: "Corner Sofas",
    slug: "corner-sofas",
    seoTitle: "Luxury Corner & Chaise Sofas UK | Modular Living | Plush Comfort",
    seoDescription: "Explore deep modular corner sofas and chaise sectionals delivered across the UK. Stain-resistant velvets, pocket springs, and room of choice 2-man delivery.",
    description: "Sprawling modular and L-shaped corner sofas designed to optimize seating space, social relaxation, and generous family lounging.",
    bottomSeoDescription: "Maximize your living space with Plush Comfort\u2019s modular and L-shaped corner sofas. Built using solid European beech frames, each sectional is engineered for flexible home layouts with interchangeable left and right-hand chaise units. Features high-tensile steel serpentine springs, memory foam core toppers, and high-performance spill-shield fabrics that wipe clean effortlessly. Delivered in interlocking sections for effortless navigation through narrow UK doorways.",
    image: "/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-1.webp",
    isActive: true,
    order: 3,
    subcategories: [
      { id: "sub-corner-lshape", name: "L-Shaped Sofas", slug: "l-shaped-sofas" },
      { id: "sub-corner-modular", name: "Modular Sectionals", slug: "modular-sectionals" },
      { id: "sub-corner-ushape", name: "U-Shaped Large Sofas", slug: "u-shaped-sofas" }
    ],
    faqs: [
      { question: "Can corner sofas fit through narrow doorways?", answer: "Yes. All Plush Comfort corner sofas are delivered in modular interlocking sections with removable feet to guarantee seamless passage through standard UK hallways and doorframes." },
      { question: "Can I choose left or right chaise orientation?", answer: "Most of our corner sofas are available with dedicated left-hand, right-hand, or universal reversible chaise configurations." }
    ]
  },
  {
    id: "cat-fabric-sofas",
    name: "Fabric Sofas",
    slug: "fabric-sofas",
    seoTitle: "Luxury Fabric Sofas UK | Boucl\xE9, Linen & Velvet | Plush Comfort",
    seoDescription: "Discover handcrafted British fabric sofas in premium Italian boucl\xE9, Belgian linen and stain-resistant velvet. 1 year warranty and white glove delivery.",
    description: "Tactile, breathable fabric sofas tailored in textured Italian boucl\xE9s, Belgian linens, and soft performance velvets.",
    bottomSeoDescription: "Wrap your home in tactile British warmth with our bespoke fabric sofas. Every piece is dressed in upholstery sourced from trusted European textile mills, rated at 60,000 to 100,000 Martindale rubs for exceptional domestic durability. Pre-treated with Scotchgard stain resistance, our fabrics repel liquid spills while retaining luxurious softness. Built over double-dowelled hardwood skeletons with a 1 year warranty.",
    image: "/uploads/products/oxford-fabric-corner-sofa-in-light-grey-textured-chenille-1.webp",
    isActive: true,
    order: 4,
    subcategories: [
      { id: "sub-fabric-linen", name: "Belgian Linen Sofas", slug: "linen-sofas" },
      { id: "sub-fabric-boucle", name: "Boucl\xE9 Sofas", slug: "boucle-sofas" },
      { id: "sub-fabric-velvet", name: "Performance Velvet Sofas", slug: "velvet-sofas" }
    ],
    faqs: [
      { question: "Are your sofa fabrics stain-resistant?", answer: "Yes, our fabrics undergo hydrophobic performance treatment causing liquids to bead on the surface for easy blot-cleaning with a clean cloth." }
    ]
  },
  {
    id: "cat-armchairs",
    name: "Armchairs",
    slug: "armchairs",
    seoTitle: "Bespoke Armchairs & Accent Chairs UK | Plush Comfort",
    seoDescription: "Elevate your living space with handcrafted British armchairs, sculptural boucl\xE9 accent chairs and fireside wingback seating delivered across the UK.",
    description: "Sculptural accent chairs, supportive reading armchairs, and fireside wingback seating handcrafted to make a refined design statement.",
    bottomSeoDescription: "An artisan armchair is the defining focal point of any curated living room, reading nook, or master bedroom suite. At Plush Comfort, our armchairs feature steam-bent timber frames, turned oak legs, and cold-cure ergonomic foam cushioning that maintains its silhouette year after year. From tactile boucl\xE9 swivel armchairs to traditional high-back wing chairs, discover personal sanctuary comfort.",
    image: "https://images.unsplash.com/photo-1675767528117-963ce219b52a?q=85&w=1200&h=900",
    isActive: true,
    order: 5,
    subcategories: [
      { id: "sub-armchair-accent", name: "Accent Chairs", slug: "accent-chairs" },
      { id: "sub-armchair-wingback", name: "Wingback Armchairs", slug: "wingback-armchairs" },
      { id: "sub-armchair-boucle", name: "Boucl\xE9 Armchairs", slug: "boucle-armchairs" }
    ],
    faqs: [
      { question: "Do armchairs arrive fully assembled?", answer: "Yes, the majority of our armchairs arrive fully assembled. Only the solid oak legs may require simple hand-screwing into pre-drilled steel brackets without tools." }
    ]
  },
  {
    id: "cat-beds-bed-frames",
    name: "Beds & Bed Frames",
    slug: "beds-bed-frames",
    seoTitle: "Luxury Beds & Bed Frames UK | Handcrafted Ottoman & Wingback Beds | Plush Comfort",
    seoDescription: "Discover bespoke hydraulic ottoman storage beds and luxury upholstered wingback frames delivered across the UK. Up to 850L dust-free bedroom storage.",
    description: "Luxury upholstered beds and heavy-duty gas-lift ottoman storage beds delivered across the UK.",
    bottomSeoDescription: "Transform your bedroom into a tranquil sanctuary with Plush Comfort\u2019s bespoke British bed frames. Our signature ottoman beds feature heavy-duty German gas-lift pistons that effortlessly reveal up to 4x the storage capacity of traditional divan drawers, concealing extra duvets, seasonal clothing, and bedding neatly beneath your mattress. Crafted from sustainably sourced timber with reinforced solid wooden slats and deep-padded wingback headboards, each bed is customisable in over 30 luxury boucl\xE9s, velvets, and textured linens.",
    image: "/uploads/products/ambassador-luxury-deep-buttoned-upholstered-bed-frame-1.webp",
    isActive: true,
    order: 6,
    subcategories: [
      { id: "sub-bed-ottoman", name: "Ottoman Beds", slug: "ottoman-beds", description: "End-lift and side-lift hydraulic gas-lift storage beds maximizing bedroom floor space." },
      { id: "sub-bed-upholstered", name: "Upholstered Beds", slug: "upholstered-beds", description: "Plush winged and channel-tufted fabric beds designed as architectural focal points." },
      { id: "sub-bed-wooden", name: "Wooden Bed Frames", slug: "wooden-bed-frames", description: "Solid natural oak, walnut, and pine frames showcasing organic grain craftsmanship." }
    ],
    faqs: [
      { question: "How much weight can your Ottoman beds support?", answer: "Our reinforced steel sub-frames and hydraulic pistons safely support up to 300kg of mattress and occupant weight while remaining feather-light to lift." },
      { question: "Which bed sizes are available?", answer: "All of our beds follow standard UK sizing: Single (3ft), Small Double (4ft), Double (4ft6), King (5ft), and Super King (6ft)." },
      { question: "Is assembly included?", answer: "We offer white-glove assembly across mainland UK where our drivers build the bed in your room of choice and remove all packaging." }
    ]
  },
  {
    id: "cat-divan-beds",
    name: "Divan Beds",
    slug: "divan-beds",
    seoTitle: "British Divan Beds & Bases with Storage | Plush Comfort UK",
    seoDescription: "Handcrafted UK divan beds with continental drawer storage and deep-tufted headboards. Solid timber frames with 1 year warranty.",
    description: "Classic British divan bases with reinforced solid timber frames, smooth-gliding storage drawers, and floor-standing tufted headboards.",
    bottomSeoDescription: "The quintessence of British bedroom craftsmanship, our Divan Beds combine sturdy solid pine box construction with custom continental drawer arrangements. Choose 2-drawer, 4-drawer, or continental head-end drawer layouts designed to open smoothly even with bedside tables in place. Upholstered in a full palette of linens and velvets, with optional matching Chesterfield and fluted headboards.",
    image: "/uploads/products/double-ottoman-divan-bed-set-with-orthopaedic-mattress-vertical-panelled-headboard-1.webp",
    isActive: true,
    order: 7,
    subcategories: [
      { id: "sub-divan-2drawer", name: "2-Drawer Divans", slug: "2-drawer-divans" },
      { id: "sub-divan-4drawer", name: "4-Drawer Divans", slug: "4-drawer-divans" },
      { id: "sub-divan-reinforced", name: "Heavy Duty Divans", slug: "heavy-duty-divans" }
    ],
    faqs: [
      { question: "What is a continental drawer layout?", answer: "Continental drawers feature smaller drawers at the head-end of the bed so they can be pulled out freely without colliding with bedside tables." }
    ]
  },
  {
    id: "cat-mattresses",
    name: "Mattresses",
    slug: "mattresses",
    seoTitle: "Orthopaedic & Pocket Sprung Luxury Mattresses UK | Plush Comfort",
    seoDescription: "Experience restorative British sleep with hand-tufted pocket sprung, natural wool and cooling memory foam mattresses. 100-night trial and free UK delivery.",
    description: "Orthopaedic pocket-sprung, pure British wool, and temperature-regulating memory foam mattresses for restorative slumber.",
    bottomSeoDescription: "Engineered for optimal spinal alignment and pressure relief, Plush Comfort mattresses are hand-tufted using up to 3,000 individually responsive pocket springs. Layered with natural breathable fillings including British sheep wool, organic cotton, and cool-gel infused reflex foam, our mattresses prevent motion transfer between sleeping partners. Tested to UK BS 7177 flammability standards with a 100-night sleep trial guarantee.",
    image: "https://images.unsplash.com/photo-1545858899-278ffaa47025?q=85&w=1200&h=900",
    isActive: true,
    order: 8,
    subcategories: [
      { id: "sub-mat-pocket", name: "Pocket Sprung Mattresses", slug: "pocket-sprung-mattresses" },
      { id: "sub-mat-ortho", name: "Orthopaedic Firm Mattresses", slug: "orthopaedic-mattresses" },
      { id: "sub-mat-natural", name: "Natural Wool Mattresses", slug: "natural-wool-mattresses" }
    ],
    faqs: [
      { question: "Do your mattresses come with a trial period?", answer: "Yes! We provide a 100-night comfort trial. If your new mattress is not providing perfect sleep, we will exchange or refund it hassle-free." },
      { question: "What firmness ratings are available?", answer: "We offer Medium-Soft, Medium-Firm (our most popular balance for back and side sleepers), and Extra Firm Orthopaedic support." }
    ]
  },
  {
    id: "cat-wardrobes",
    name: "Wardrobes",
    slug: "wardrobes",
    seoTitle: "Luxury Bedroom Wardrobes & Storage Solutions UK | Plush Comfort",
    seoDescription: "Premium British freestanding and sliding wardrobes with soft-close mechanisms, custom internal shelving and solid timber finishes.",
    description: "Freestanding, sliding-door, and fitted-look wardrobes engineered for smart, dust-free bedroom organization.",
    bottomSeoDescription: "Elevate your bedroom storage with Plush Comfort\u2019s precision-engineered wardrobes. Featuring German soft-close door dampers, full-extension hanging rails, and modular interior shelf partitions, each wardrobe combines clean contemporary architectural aesthetics with heavy-duty construction. Built to harmonize seamlessly with our handcrafted beds and sideboards.",
    image: "https://images.unsplash.com/photo-1681381606316-426c1605dde3?q=85&w=1200&h=900",
    isActive: true,
    order: 9,
    subcategories: [
      { id: "sub-wardrobes-sliding", name: "Sliding Wardrobes", slug: "sliding-wardrobes" },
      { id: "sub-wardrobes-hinged", name: "Hinged 2 & 3 Door Wardrobes", slug: "hinged-wardrobes" },
      { id: "sub-wardrobes-mirrored", name: "Mirrored Wardrobes", slug: "mirrored-wardrobes" }
    ],
    faqs: [
      { question: "Is wardrobe assembly available?", answer: "Yes, our two-man white-glove logistics team offers full assembly and packaging removal right inside your bedroom." }
    ]
  }
];
var INITIAL_PRODUCTS = [
  {
    "id": "prod-223",
    "name": "Luxury Grey Crushed Velvet U-Shape Sofa",
    "slug": "luxury-grey-crushed-velvet-u-shape-sofa",
    "sku": "PC-UK-223",
    "categoryId": "cat-corner-sofas",
    "subcategoryId": "sub-u-shape",
    "price": 1799,
    "salePrice": 1449,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/luxury-grey-crushed-velvet-u-shape-sofa-1.webp",
      "/uploads/products/luxury-grey-crushed-velvet-u-shape-sofa-2.webp",
      "/uploads/products/luxury-grey-crushed-velvet-u-shape-sofa-3.webp",
      "/uploads/products/luxury-grey-crushed-velvet-u-shape-sofa-4.webp",
      "/uploads/products/luxury-grey-crushed-velvet-u-shape-sofa-5.webp",
      "/uploads/products/luxury-grey-crushed-velvet-u-shape-sofa-6.webp"
    ],
    "shortDescription": "Upgrade your living room with this ultra-luxury U-shaped corner sofa in shimmering champagne-grey crushed velvet. Designed for spacious UK homes, this large modular settee features deep foam-filled seating, plush scatter cushions, sleek modern chrome feet, and a matching padded footstool to create the ultimate lounge experience for family relaxation and entertaining.",
    "fullDescription": "Transform your home into a high-end sanctuary with our Luxury Crushed Velvet U-Shape Corner Sofa. Tailored specifically for modern UK living interiors, this expansive modular settee seamlessly blends glamorous aesthetics with sink-in comfort, making it the perfect focal point for open-plan lounge areas and modern living rooms.\n\n\nUpholstered in premium, shimmer-effect crushed velvet fabric, this U-shaped sofa catches the light beautifully while delivering a soft, luxurious touch. The grand U-shape configuration provides generous seating space, paired with a versatile matching footstool that creates a seamless lounge setup. Deep, high-resilience foam seats ensure exceptional support that maintains its shape over time, complemented by plush back cushions and stylish striped accent pillows.\n\n\nBuilt on a sturdy, reinforced wooden frame, this large settee is finished with low-profile modern metallic feet for superior structural stability and contemporary flair.\n\n\nKey Features\n\n\nHigh-Search UK Keywords: Luxury U-Shape Sofa, Large Modular Settee, Crushed Velvet Corner Sofa, Grey U-Shaped Sectional.\n\n\nPremium Fabric Upholstery: Durable, soft-touch crushed velvet with a multi-tonal luxury sheen.\n\n\nSpacious U-Shape Layout: Maximizes seating capacity, perfect for large families and hosting guests.\n\n\nComplete Lounge Set: Includes a matching oversized footstool and decorative accent cushions.\n\n\nSuperior Comfort Construction: High-density foam seating with a sturdy frame and modern chrome feet.",
    "dimensions": {
      "width": 340,
      "height": 90,
      "depth": 200,
      "seatHeight": 48
    },
    "materials": [
      "Crushed Velvet",
      "Kiln-Dried Hardwood",
      "High-Density Reflex Foam",
      "Chrome Glides"
    ],
    "colours": [
      {
        "name": "Champagne Grey",
        "hex": "#A8A49D"
      },
      {
        "name": "Silver Slate",
        "hex": "#8E9094"
      }
    ],
    "tags": [
      "U-Shape Sofa",
      "Crushed Velvet",
      "Corner Sofa",
      "Living Room",
      "Bespoke"
    ],
    "isPublished": true,
    "isFeatured": true,
    "isTrending": true,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Luxury Grey Crushed Velvet U-Shape Sofa | Plush Comfort UK",
    "seoDescription": "Shop the Luxury Grey Crushed Velvet U-Shape Sofa at Plush Comfort UK. Grand 340cm dual-chaise layout, deep foam seating, and premium craftsmanship.",
    "rating": 4.8,
    "reviewCount": 14,
    "relatedProductIds": [
      "prod-216",
      "prod-174",
      "prod-152",
      "prod-124"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-216",
    "name": "Verona Plush Velvet Corner Sofa \u2013 Grey Fabric Chesterfield Style L-Shape Settee with Scatter Cushions",
    "slug": "verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions",
    "sku": "PC-UK-216",
    "categoryId": "cat-corner-sofas",
    "subcategoryId": "sub-corner-l-shape",
    "price": 1250,
    "salePrice": 849,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-1.webp",
      "/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-2.webp",
      "/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-3.webp",
      "/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-4.webp"
    ],
    "shortDescription": "Transform your living room with the luxury Verona Plush Velvet Corner Sofa in sleek grey. Combining classic Chesterfield deep-tufted scroll arms with contemporary plush velvet upholstery, this spacious L-shaped settee features high-density foam seat cushions, modern chrome feet, and a mix of patterned scatter cushions for ultimate comfort and style.",
    "fullDescription": "Elevate your home decor with the exquisite Verona Plush Velvet Corner Sofa, designed to bring timeless grandeur and relaxed comfort into any modern UK living area. Blending classic British upholstery heritage with modern interior trends, this grey corner sofa serves as a stunning centerpiece for family lounging or entertaining guests.\n\n\nCrafted with attention to detail, the Verona features signature Chesterfield-inspired rolled arms adorned with classic button tufting, paired with sleek silver chrome feet that add a clean, contemporary edge. Covered in a soft-touch, durable plush velvet fabric, it offers a luxurious feel while standing up to daily family life.\n\n\nThe soft scatter-back arrangement includes a mix of plain velvet, cozy plaid tartan patterns, and subtle stag motif cushions, allowing you to tailor your seating comfort. High-resilience foam-filled seat cushions ensure long-lasting support without losing shape, providing the ideal blend of sink-in softness and sturdy ergonomics.\n\n\nKey Features\n\n\nPremium Upholstery: Soft, heavy-duty grey plush velvet fabric designed for comfort and longevity.\n\n\nChesterfield Detailing: Deep-buttoned, rolled scroll arms for a classic touch.\n\n\nScatter-Back Design: Includes coordinating plain, tartan plaid, and stag-print accent cushions.\n\n\nSuperior Comfort: Deep, foam-filled seat cushions paired with a strong internal hardwood frame.\n\n\nModern Accents: Sleek, low-profile chrome feet for clean support.",
    "dimensions": {
      "width": 260,
      "height": 88,
      "depth": 260,
      "seatHeight": 46
    },
    "materials": [
      "Premium Plush Velvet",
      "Solid Beech Frame",
      "Pocket Sprung Core",
      "Carved Wood Feet"
    ],
    "colours": [
      {
        "name": "Mink Grey",
        "hex": "#8E877F"
      },
      {
        "name": "Pebble Grey",
        "hex": "#9E9E9E"
      }
    ],
    "tags": [
      "Verona Sofa",
      "Plush Velvet",
      "Chesterfield Corner",
      "Scatter Cushions",
      "Grey Sofa"
    ],
    "isPublished": true,
    "isFeatured": true,
    "isTrending": true,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Verona Plush Velvet Corner Sofa \u2013 Grey Fabric Chesterfield Style | Plush Comfort UK",
    "seoDescription": "The Verona Plush Velvet Corner Sofa combines Chesterfield scrolled buttoning with relaxed scatter cushions. Handcrafted with kiln-dried timber frames.",
    "rating": 4.8,
    "reviewCount": 17,
    "relatedProductIds": [
      "prod-223",
      "prod-174",
      "prod-152",
      "prod-124"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-194",
    "name": "Ambassador Luxury Deep-Buttoned Upholstered Bed Frame",
    "slug": "ambassador-luxury-deep-buttoned-upholstered-bed-frame",
    "sku": "PC-UK-194",
    "categoryId": "cat-beds-bed-frames",
    "subcategoryId": "sub-upholstered-beds",
    "price": 1150,
    "salePrice": 899,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/ambassador-luxury-deep-buttoned-upholstered-bed-frame-1.webp",
      "/uploads/products/ambassador-luxury-deep-buttoned-upholstered-bed-frame-2.webp",
      "/uploads/products/ambassador-luxury-deep-buttoned-upholstered-bed-frame-3.webp",
      "/uploads/products/ambassador-luxury-deep-buttoned-upholstered-bed-frame-4.webp",
      "/uploads/products/ambassador-luxury-deep-buttoned-upholstered-bed-frame-5.webp"
    ],
    "shortDescription": "Transform your bedroom into a opulent retreat with the Ambassador Upholstered Bed Frame. Featuring a grand floor-standing headboard, matching deep-buttoned footboard, and padded side rails, this bespoke frame combines grand Chesterfield styling with premium comfort. Available in Double, King, and Super King sizes across a wide selection of bespoke velvet fabric colours.",
    "fullDescription": "Grand Luxury Design for the Modern Bedroom\n\n\nMake an unmistakable statement with the Ambassador Bed Frame, designed to bring boutique hotel grandeur directly to your master bedroom. Defined by its impressive floor-standing headboard, matching low footboard, and thick plush upholstery, the Ambassador frame features all-over deep diamond tufting that creates an ultra-luxurious, grand silhouette.\n\n\nBespoke UK Craftsmanship & Premium Fabrics\n\n\nHand-upholstered to the highest standards, the Ambassador bed frame is built with quality and comfort in mind:\n\n\nAll-Over Deep Button Tufting: Features deep diamond-tufted detailing across the headboard, footboard, and extended side rails for 360-degree luxury.\n\n\nGrand Floor-Standing Headboard: Creates a striking focal point, providing soft, padded support for late-night reading or relaxing.\n\n\nCustom Colour & Fabric Options: Personalise your bed to match your decor, with choices ranging from deep Navy Blue, Royal Blue, and Slate Grey to Cream, Beige, and Plush Pink.\n\n\nSturdy Frame & Slatted Base: Constructed from solid timber with heavy-duty slatted support, ensuring optimal mattress ventilation, stability, and a sound night&#8217;s sleep.\n\n\nAvailable Sizes & Tailored Fit\n\n\nWhether upgrading a guest room or designing a grand master suite, the Ambassador bed frame comes in standard UK sizing options:\n\n\nDouble (4ft 6in): Ideal for compact master bedrooms without compromising on style.\n\n\nKing Size (5ft): The perfect balance of spacious comfort and striking proportions.\n\n\nSuper King Size (6ft): The ultimate luxury choice for maximum sleeping space and dramatic visual impact.\n\n\nSpecifications\n\n\nModel: Ambassador Bed Frame\n\n\nSizes Available: Double (4ft 6&#8243;), King Size (5ft), Super King Size (6ft)\n\n\nUpholstery Options: Plush Velvet, Crushed Velvet, Soft Linen, or Chenille\n\n\nColour Options: Navy Blue, Grey, Cream, Beige, Black, Pink, Emerald Green (Custom samples available)\n\n\nDesign: Deep Diamond Buttoned Headboard, Footboard, & Padded Side Rails\n\n\nBase Type: Solid Wooden Slatted Base with Reinforced Center Support Rail\n\n\nProduct Features\n\n\nGrand floor-standing headboard design adds height and elegance to any bedroom\n\n\nDeeply padded upholstery provides extra comfort and plush tactile feel\n\n\nCompatible with all standard UK size mattresses\n\n\nHeavy-duty wooden slatted support system extends mattress lifespan\n\n\nCare & Maintenance Instructions\n\n\nFabric Care: Gently brush or vacuum using a soft upholstery attachment to keep velvet fibers plush.\n\n\nSpills: Blot liquid spills immediately with a clean, dry cloth; do not rub liquid into the velvet pile.\n\n\nFrame Maintenance: Periodically check and tighten frame fixings to maintain structural firmness.\n\n\nWould you like me to add options for an gas-lift ottoman storage base or specific mattress pairing bundles to this listing?",
    "dimensions": {
      "width": 165,
      "height": 137,
      "depth": 215,
      "mattressSize": "King (5ft)"
    },
    "materials": [
      "Heavyweight Velvet Upholstery",
      "Reinforced Timber Slat Base",
      "Chunky Chrome Feet",
      "High-Density Padding"
    ],
    "colours": [
      {
        "name": "Deep Anthracite",
        "hex": "#3B3B3B"
      },
      {
        "name": "Champagne Beige",
        "hex": "#D6CDBF"
      },
      {
        "name": "Silver Ice",
        "hex": "#C2C4C6"
      }
    ],
    "sizes": [
      "Double (4ft 6)",
      "King (5ft)",
      "Super King (6ft)"
    ],
    "tags": [
      "Ambassador Bed",
      "Deep Buttoned",
      "Upholstered Bed",
      "Luxury Beds",
      "UK Delivery"
    ],
    "isPublished": true,
    "isFeatured": true,
    "isTrending": true,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": true,
    "seoTitle": "Ambassador Luxury Deep-Buttoned Upholstered Bed Frame | Plush Comfort UK",
    "seoDescription": "The Ambassador Luxury Bed Frame features an opulent 54-inch floor-standing headboard with deep diamond buttoning. Built to last with solid slats.",
    "rating": 4.8,
    "reviewCount": 20,
    "relatedProductIds": [],
    "complementaryProductIds": [
      "prod-19"
    ],
    "reviews": []
  },
  {
    "id": "prod-187",
    "name": "Nicole 3-Seater Chesterfield Sofa in Soft Cream Fabric",
    "slug": "nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric",
    "sku": "PC-UK-187",
    "categoryId": "cat-chesterfield-sofas",
    "subcategoryId": "sub-3-seater",
    "price": 999,
    "salePrice": 699,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric-1.webp",
      "/uploads/products/nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric-2.webp",
      "/uploads/products/nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric-3.webp",
      "/uploads/products/nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric-4.webp",
      "/uploads/products/nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric-5.webp",
      "/uploads/products/nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric-6.webp"
    ],
    "shortDescription": "Bring modern luxury to your living room with the Nicole 3-Seater Sofa in soft cream fabric. Blending classic Chesterfield scrolled arms with deeply cushioned scatter-back pillows and piped seat edges, this spacious three-seater settee provides the perfect combination of timeless elegance and cozy everyday comfort.",
    "fullDescription": "Classic British Silhouette Meets Contemporary Comfort\n\n\nEnhance your living space with the Nicole 3-Seater Sofa, a sophisticated piece designed to blend period charm with relaxed modern living. Upholstered in a high-grade, velvety soft cream fabric, this three-seater settee creates a warm, airy atmosphere in both modern apartments and traditional UK homes.\n\n\nCrafted with Premium Details\n\n\nEvery element of the Nicole sofa reflects thoughtful design and quality tailoring:\n\n\nSignature Scrolled Arms: Elegant Chesterfield-inspired wide scroll arms add a stately, classic touch to the modern silhouette.\n\n\nPlush Scatter-Back Design: Layered pillow-back cushions offer customizable support, making it effortless to sink in and unwind.\n\n\nDeep Cushion Seating: Generously filled seat cushions feature fine piped edges, ensuring maximum comfort while maintaining a sleek, tailored shape.\n\n\nBuilt to Last: Engineered with a heavy-duty hardwood frame and anchored by dark turned wooden feet for robust stability.\n\n\nThe Perfect Centerpiece for Modern Living\n\n\nDesigned to seat three adults comfortably, the Nicole sofa serves as a versatile focal point for living rooms, snugs, or open-plan lounge areas. Its soft neutral hue pairs effortlessly with bold accent throws, natural wood tones, or minimalist interior decor.\n\n\nSpecifications\n\n\nModel: Nicole 3-Seater Sofa\n\n\nUpholstery: Premium Soft-Touch Fabric / Soft Velvet\n\n\nColour: Cream / Warm Off-White\n\n\nCapacity: 3-Seater\n\n\nFrame Material: Kiln-Dried Solid Hardwood & Reinforced Composites\n\n\nSeat Cushions: High-Resilience Foam with Fiber Wrap\n\n\nBack Style: Loose Scatter Cushion Pillows\n\n\nLegs: Dark Turned Solid Wood Feet\n\n\nProduct Features\n\n\nSweeping Chesterfield-style scroll arms for a classic luxury look\n\n\nDeep, spacious seating capacity designed for everyday relaxation\n\n\nUltra-soft fabric finish that is durable and simple to keep fresh\n\n\nIncludes extra accent scatter cushions for tailored back support\n\n\nCare & Maintenance Instructions\n\n\nRoutine Cleaning: Vacuum gently using an upholstery brush attachment to clear dust and maintain fabric texture.\n\n\nCushion Care: Plump and rotate back cushions regularly to preserve loft and shape.\n\n\nSpills: Blot liquid spills immediately with a clean, dry white cloth; do not rub into the weave.\n\n\nDeep Cleaning: Professional fabric cleaning recommended for tough spots.\n\n\nWould you like me to create the matching 2-seater version or the armchair listing to complete the full Nicole collection?",
    "dimensions": {
      "width": 220,
      "height": 84,
      "depth": 96,
      "seatHeight": 48
    },
    "materials": [
      "Soft Cream Chenille Weave",
      "Kiln-Dried European Hardwood",
      "Antiqued Brass Studding",
      "Turned Dark Oak Feet"
    ],
    "colours": [
      {
        "name": "Soft Cream",
        "hex": "#F3EFE6"
      },
      {
        "name": "Oatmeal",
        "hex": "#D8CCA3"
      }
    ],
    "tags": [
      "Chesterfield Sofa",
      "3 Seater",
      "Cream Fabric",
      "Scrolled Arms",
      "Handcrafted"
    ],
    "isPublished": true,
    "isFeatured": true,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Nicole 3-Seater Chesterfield Sofa in Soft Cream Fabric | Plush Comfort UK",
    "seoDescription": "Discover the Nicole 3-Seater Chesterfield Sofa in soft cream fabric. Signature scrolled arms, hand-applied brass studs, and deep buttoned backrest.",
    "rating": 4.8,
    "reviewCount": 23,
    "relatedProductIds": [
      "prod-180",
      "prod-166",
      "prod-160",
      "prod-136"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-180",
    "name": "Nicole Luxury Chesterfield Corner Sofa in Cream Soft Velvet",
    "slug": "nicole-luxury-chesterfield-corner-sofa-in-cream-soft-velvet",
    "sku": "PC-UK-180",
    "categoryId": "cat-chesterfield-sofas",
    "subcategoryId": "sub-chesterfield-corner",
    "price": 1450,
    "salePrice": 1199,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/nicole-luxury-chesterfield-corner-sofa-in-cream-soft-velvet-1.webp",
      "/uploads/products/nicole-luxury-chesterfield-corner-sofa-in-cream-soft-velvet-2.webp",
      "/uploads/products/nicole-luxury-chesterfield-corner-sofa-in-cream-soft-velvet-3.webp",
      "/uploads/products/nicole-luxury-chesterfield-corner-sofa-in-cream-soft-velvet-4.webp",
      "/uploads/products/nicole-luxury-chesterfield-corner-sofa-in-cream-soft-velvet-5.webp",
      "/uploads/products/nicole-luxury-chesterfield-corner-sofa-in-cream-soft-velvet-6.webp"
    ],
    "shortDescription": "Bring modern grandeur home with the Nicole Chesterfield Corner Sofa in elegant cream velvet. Combining timeless scroll arms, deep button detailing, and plush scatter-back cushions, this spacious L-shaped sofa offers ultimate comfort and high-end UK living room style. Optional matching buttoned footstool available.",
    "fullDescription": "Statement Elegance Meets Modern Comfort\n\n\nTransform your interior with the Nicole Corner Sofa, a striking fusion of classic Chesterfield craftsmanship and contemporary British design. Upholstered in a high-grade, ultra-soft cream fabric, this corner settee brightens up open-plan living rooms, lounge suites, and modern family homes with an inviting, luxurious aesthetic.\n\n\nHandcrafted Quality & Period Details\n\n\nDesigned for those who appreciate detailed craftsmanship, the Nicole sofa showcases exquisite elements from every angle:\n\n\nClassic Scroll Arms: Elegant deep-tufted rolled arms offer a sophisticated, traditional Chesterfield silhouette.\n\n\nPlush Cushioning: Abundant pillow-back scatter cushions give you tailored support, making relaxing, lounging, or socialising effortless.\n\n\nDeep Comfort Seating: High-resilience foam seat cushions feature fine piped edges to retain their structured shape without sacrificing plush softness.\n\n\nDurable Construction: Supported by a heavy-duty solid hardwood frame and finished with dark turned wooden feet for excellent longevity.\n\n\nDesigned for Spacious UK Living\n\n\nThe expansive symmetrical corner layout comfortably seats 5 to 6 adults, making it an ideal centerpiece for family gatherings or entertaining guests. Pair it with the matching button-tufted ottoman footstool for complete footrest comfort or additional coffee table functionality.\n\n\nSpecifications\n\n\nModel: Nicole Corner Sofa\n\n\nFabric: Premium Soft Velvet / Brushed Chenille\n\n\nColour: Cream / Light Beige\n\n\nConfiguration: Symmetrical Corner (L-Shape)\n\n\nFrame Material: Kiln-Dried Solid Hardwood\n\n\nSeat Cushioning: High-Density Foam with Fiber Wrap\n\n\nBack Style: Full Scatter-Back Pillow Cushions\n\n\nLegs: Dark Turned Solid Wood Feet\n\n\nProduct Features\n\n\nHigh-end Chesterfield rolled arms with deep button tufting\n\n\nGenerous multi-seater capacity ideal for modern family homes\n\n\nVelvet fabric with a soft-touch texture that is durable and easy to maintain\n\n\nIncludes deep, piped seat cushions and matching scatter pillows\n\n\nCare & Maintenance Instructions\n\n\nRoutine Care: Vacuum gently using a soft upholstery brush attachment to keep the fabric fresh.\n\n\nCushion Maintenance: Plump and rotate back cushions weekly to maintain shape and loft.\n\n\nSpills: Blot liquid spills immediately with a dry, lint-free white cloth. Avoid scrubbing fabric fibers.\n\n\nCleaning: Professional upholstery cleaning recommended for stubborn stains.",
    "dimensions": {
      "width": 275,
      "height": 86,
      "depth": 275,
      "seatHeight": 47
    },
    "materials": [
      "Plush Cream Velvet",
      "Solid Birchwood Inner Frame",
      "Hand-Pleated Scrolled Arms",
      "Chrome Corner Glides"
    ],
    "colours": [
      {
        "name": "Cream Velvet",
        "hex": "#F5F0E8"
      },
      {
        "name": "Soft Champagne",
        "hex": "#DED3BF"
      }
    ],
    "tags": [
      "Nicole Corner",
      "Chesterfield Corner",
      "Cream Velvet",
      "Luxury Living",
      "Hand-Tufted"
    ],
    "isPublished": true,
    "isFeatured": true,
    "isTrending": true,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Nicole Luxury Chesterfield Corner Sofa in Cream Soft Velvet | Plush Comfort UK",
    "seoDescription": "Make a glamorous statement with the Nicole Luxury Chesterfield Corner Sofa. Symmetrical corner design, sumptuous cream velvet, and hand-tufted detailing.",
    "rating": 4.8,
    "reviewCount": 26,
    "relatedProductIds": [
      "prod-187",
      "prod-166",
      "prod-160",
      "prod-136"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-174",
    "name": "Oxford Fabric Corner Sofa in Light Grey Textured Chenille",
    "slug": "oxford-fabric-corner-sofa-in-light-grey-textured-chenille",
    "sku": "PC-UK-174",
    "categoryId": "cat-corner-sofas",
    "subcategoryId": "sub-corner-l-shape",
    "price": 1250,
    "salePrice": 899,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/oxford-fabric-corner-sofa-in-light-grey-textured-chenille-1.webp",
      "/uploads/products/oxford-fabric-corner-sofa-in-light-grey-textured-chenille-2.webp",
      "/uploads/products/oxford-fabric-corner-sofa-in-light-grey-textured-chenille-3.webp",
      "/uploads/products/oxford-fabric-corner-sofa-in-light-grey-textured-chenille-4.webp"
    ],
    "shortDescription": "Transform your living space with the Oxford Corner Sofa in a sophisticated light grey textured fabric. Featuring spacious L-shaped seating, plush scatter-back cushions, clean square armrests, and deep-cushioned comfort, this modern corner settee brings effortless style, warmth, and generous seating to any contemporary UK home.",
    "fullDescription": "Contemporary Style Meets Everyday Comfort\n\n\nUpgrade your home with the modern elegance of the Oxford Corner Sofa. Designed to maximize floor space while offering generous seating, this contemporary L-shaped sofa seamlessly blends understated luxury with cozy functionality. Wrapped in a rich, textured chenille fabric in an on-trend light grey hue, the Oxford sofa instantly brightens up your living room, lounge, or open-plan family area.\n\n\nTailored Design & Premium Details\n\n\nCrafted with attention to detail, the Oxford features a balanced mix of crisp structure and sumptuously soft lounging:\n\n\nTextured Fabric Finish: Durable, soft-touch fabric with subtle tonal variations that add warmth and depth to your d\xE9cor.\n\n\nSupportive & Plush Seating: Deep, high-density foam seat cushions designed to retain their shape while delivering exceptional relaxing comfort.\n\n\nScatter-Back Cushioning: Generously filled back cushions and accent scatter cushions allow you to customize your support for relaxed lounging or hosting guests.\n\n\nModern Silhouette: Broad, square armrests and piping trim details give the sofa a sleek, tailored edge.\n\n\nSturdy Frame Construction: Built around a heavy-duty hardwood frame engineered to withstand the demands of everyday family life.\n\n\nDesigned for Modern Living\n\n\nMeasuring 230cm x 230cm, the symmetrical corner layout provides ample seating room for family and friends, making it an ideal anchor piece for entertainment areas or cozy evenings in.\n\n\nSpecifications\n\n\nModel: Oxford Corner Sofa\n\n\nConfiguration: Symmetrical L-Shape\n\n\nDimensions: 230 cm x 230 cm\n\n\nUpholstery: Soft Textured Chenille Fabric\n\n\nColour: Light Grey / Silver Neutral\n\n\nFrame Material: Kiln-Dried Solid Hardwood & Reinforced Composites\n\n\nCushion Filling: High-Resilience Foam (Seats) & Fiber-Filled (Backs)\n\n\nProduct Features\n\n\nGenerous corner design optimizes floor space while maximizing seating capacity\n\n\nSoft-touch, durable textured fabric designed for busy modern households\n\n\nDeep-cushioned seats with coordinating accent cushions included\n\n\nVersatile neutral grey tones easily match with bold accent cushions or minimalist interior schemes\n\n\nCare & Maintenance Instructions\n\n\nRoutine Care: Vacuum gently using an upholstery attachment to remove dust and debris.\n\n\nCushion Maintenance: Plump and rotate back cushions regularly to maintain shape and even wear.\n\n\nSpills: Blot spills immediately with a dry, clean white cloth; do not rub into the fabric weave.\n\n\nCleaning: Professional fabric cleaning recommended for stubborn stains.\n\n\nWould you like me to adjust the dimensions or add color variation options (such as dark grey, beige, or corduroy) to match your exact stock levels?",
    "dimensions": {
      "width": 250,
      "height": 85,
      "depth": 180,
      "seatHeight": 45
    },
    "materials": [
      "Textured Chenille Weave",
      "Kiln-Dried Structural Frame",
      "Fibre-Filled Scatter Backs",
      "Solid Black Tapered Feet"
    ],
    "colours": [
      {
        "name": "Light Grey Chenille",
        "hex": "#C7C9CC"
      },
      {
        "name": "Charcoal",
        "hex": "#4A4D52"
      }
    ],
    "tags": [
      "Oxford Sofa",
      "Chenille Fabric",
      "Corner Sofa",
      "Light Grey",
      "Family Sofa"
    ],
    "isPublished": true,
    "isFeatured": true,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Oxford Fabric Corner Sofa in Light Grey Textured Chenille | Plush Comfort UK",
    "seoDescription": "The Oxford Corner Sofa combines tactile light grey chenille with deep lounge seating and plush scatter cushions. Durable, family-ready British comfort.",
    "rating": 4.8,
    "reviewCount": 29,
    "relatedProductIds": [
      "prod-223",
      "prod-216",
      "prod-152",
      "prod-124"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-166",
    "name": "Classic Oxblood Antique Leather 2-Seater Chesterfield Sofa",
    "slug": "classic-oxblood-antique-leather-2-seater-chesterfield-sofa",
    "sku": "PC-UK-166",
    "categoryId": "cat-chesterfield-sofas",
    "subcategoryId": "sub-2-seater",
    "price": 1050,
    "salePrice": 699,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/classic-oxblood-antique-leather-2-seater-chesterfield-sofa-1.webp",
      "/uploads/products/classic-oxblood-antique-leather-2-seater-chesterfield-sofa-2.webp",
      "/uploads/products/classic-oxblood-antique-leather-2-seater-chesterfield-sofa-3.webp",
      "/uploads/products/classic-oxblood-antique-leather-2-seater-chesterfield-sofa-4.webp",
      "/uploads/products/classic-oxblood-antique-leather-2-seater-chesterfield-sofa-5.webp",
      "/uploads/products/classic-oxblood-antique-leather-2-seater-chesterfield-sofa-6.webp",
      "/uploads/products/classic-oxblood-antique-leather-2-seater-chesterfield-sofa-7.webp"
    ],
    "shortDescription": "Add compact elegance to your living space with our Classic Oxblood Leather 2-Seater Chesterfield Sofa. Handcrafted in the UK using 100% genuine antique leather, this classic love seat features iconic deep button tufting, hand-tacked brass studs, and traditional scrolled arms\u2014perfect for smaller living rooms, snugs, or home offices.",
    "fullDescription": "Compact Luxury with Vintage British Style\n\n\nMaximize your seating space without compromising on style. Our Classic Oxblood 2-Seater Chesterfield Sofa delivers all the iconic heritage design of a traditional Chesterfield in a space-saving footprint. Ideal for compact living rooms, reading nooks, or private offices, this two-seater love seat brings warmth, richness, and effortless British sophistication to any room.\n\n\nMaster-Crafted Construction & Premium Finish\n\n\nBuilt by skilled craftsmen, every element reflects authentic period detailing:\n\n\n100% Genuine Antique Leather: Finished in a rich, two-tone Oxblood burgundy that deepens in character and develops a unique vintage patina over time.\n\n\nHand-Tufted Detailing: Featuring classic diamond buttoning across the back, rolled arms, and front apron for a timeless look.\n\n\nIndividual Brass Studding: Hand-hammered brass studwork meticulously outlines the classic scroll arms.\n\n\nSturdy Frame: Built around a solid hardwood frame and finished with hand-turned solid timber feet for long-lasting stability.\n\n\nDesigned for Everyday Comfort\n\n\nEngineered for both relaxation and durability, the twin high-density foam seat cushions provide a firm, supportive sit that maintains its shape over time. Designed to offer comfortable seating for two, it strikes the ideal balance between traditional craftsmanship and modern convenience.\n\n\nSpecifications\n\n\nType: 2-Seater Chesterfield Sofa / Love Seat\n\n\nUpholstery: 100% Genuine Antique Leather\n\n\nColour: Oxblood Red / Deep Burgundy\n\n\nFrame Material: Kiln-Dried Solid Hardwood\n\n\nDetails: Deep Button Tufting & Brass Stud Work\n\n\nLegs: Solid Wood Feet\n\n\nProduct Features\n\n\nCompact 2-person capacity designed for versatile space arrangement\n\n\nAuthentic British heritage silhouette with classic scroll arms\n\n\nPremium real leather upholstery that easy to maintain and ages gracefully\n\n\nLow-maintenance leather\u2014wipes clean easily with a soft cloth\n\n\nCare & Maintenance Instructions\n\n\nRoutine Cleaning: Dust regularly using a clean, soft cloth.\n\n\nSpills: Blot liquid spills immediately with a dry cloth; avoid abrasive solvents or harsh chemicals.\n\n\nLeather Care: Treat with a good-quality leather conditioner every 6 to 12 months to maintain suppleness and lustre.\n\n\nPlacement: Keep clear of direct heat sources and direct sunlight to prevent drying or premature fading.",
    "dimensions": {
      "width": 168,
      "height": 78,
      "depth": 92,
      "seatHeight": 46
    },
    "materials": [
      "100% Genuine Antique Leather",
      "Hand-Rubbed Oxblood Finish",
      "Kiln-Dried Beechwood Frame",
      "Individual Brass Studs"
    ],
    "colours": [
      {
        "name": "Antique Oxblood",
        "hex": "#631B22"
      }
    ],
    "tags": [
      "Oxblood Leather",
      "Chesterfield 2-Seater",
      "Antique Leather",
      "British Heritage"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": true,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Classic Oxblood Antique Leather 2-Seater Chesterfield Sofa | Plush Comfort UK",
    "seoDescription": "Genuine hand-rubbed antique oxblood leather 2-seater Chesterfield sofa. Authentic British craftsmanship with hand-tied serpentine springs and button tufting.",
    "rating": 4.8,
    "reviewCount": 32,
    "relatedProductIds": [
      "prod-187",
      "prod-180",
      "prod-160",
      "prod-136"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-160",
    "name": "Classic Oxblood Antique Leather 3-Seater Chesterfield Sofa",
    "slug": "classic-oxblood-antique-leather-3-seater-chesterfield-sofa",
    "sku": "PC-UK-160",
    "categoryId": "cat-chesterfield-sofas",
    "subcategoryId": "sub-3-seater",
    "price": 950,
    "salePrice": 799,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/classic-oxblood-antique-leather-3-seater-chesterfield-sofa-1.webp",
      "/uploads/products/classic-oxblood-antique-leather-3-seater-chesterfield-sofa-2.webp",
      "/uploads/products/classic-oxblood-antique-leather-3-seater-chesterfield-sofa-3.webp",
      "/uploads/products/classic-oxblood-antique-leather-3-seater-chesterfield-sofa-4.webp",
      "/uploads/products/classic-oxblood-antique-leather-3-seater-chesterfield-sofa-5.webp"
    ],
    "shortDescription": "Bring timeless British elegance into your home with our Classic Oxblood Leather 3-Seater Chesterfield Sofa. Hand-crafted using 100% genuine antique leather, this iconic settee features deep button tufting, hand-tacked brass studding, and classic scrolled arms\u2014offering unparalleled comfort, durability, and quintessential heritage style.",
    "fullDescription": "The Ultimate British Design Classic\n\n\nElevate your living room, study, or commercial space with the enduring elegance of our Classic Oxblood 3-Seater Chesterfield Sofa. Renowned worldwide for its regal presence and historic British charm, this sofa combines traditional craftsmanship with luxurious everyday comfort. Whether placed in a modern apartment or a period country home, its rich antique finish effortlessly becomes the focal point of any interior.\n\n\nSuperior Craftsmanship & Premium Materials\n\n\nHandmade by skilled artisans, every detail of this Chesterfield is crafted to perfection:\n\n\n100% Real Antique Leather: Upholstered in top-grain leather featuring a distinct two-tone Oxblood red wash-off finish that deepens in character over time.\n\n\nDeep Buttoned Back & Arms: Classic hand-tufted diamond buttoning across the backrest, high rolled arms, and front border.\n\n\nHand-Studded Detailing: Individual brass studding individually hammered along the scroll arms for an authentic, refined touch.\n\n\nBuilt to Last: Supported by a robust hardwood frame and finished with hand-turned solid wood feet, ensuring stability and long-lasting durability.\n\n\nUncompromising Comfort\n\n\nDesigned for both style and relaxation, the deep-cushioned 3-seater design offers generous seating room. The high-density foam seat cushions provide a supportive yet comfortable sit, retaining their shape year after year while providing an ideal balance between vintage structure and modern relaxation.\n\n\nSpecifications\n\n\nType: 3-Seater Chesterfield Sofa\n\n\nUpholstery: 100% Genuine Antique Leather\n\n\nColour: Oxblood Red / Wash-Off Burgundy\n\n\nFrame Material: Kiln-Dried Solid Hardwood\n\n\nDetails: Deep Button Tufting & Brass Stud Work\n\n\nLegs: Solid Wood Feet\n\n\nProduct Features\n\n\nAuthentic British heritage silhouette with classic scroll arms\n\n\nDurable 100% genuine leather that develops a rich vintage patina over time\n\n\nGenerous 3-person seating capacity ideal for modern or traditional spaces\n\n\nLow-maintenance leather\u2014easy to wipe clean and maintain with leather conditioner\n\n\nCare & Maintenance Instructions\n\n\nRoutine Cleaning: Dust regularly with a soft, clean cloth.\n\n\nSpills: Wipe liquid spills immediately using a dry absorbent cloth; avoid harsh chemical detergents.\n\n\nLeather Care: Apply a quality leather conditioner every 6 to 12 months to preserve warmth, flexibility, and colour luster.",
    "dimensions": {
      "width": 215,
      "height": 78,
      "depth": 92,
      "seatHeight": 46
    },
    "materials": [
      "100% Genuine Antique Leather",
      "Traditional Hand-Rubbed Patina",
      "Solid Hardwood Frame",
      "Hand-Turned Mahogany Bun Feet"
    ],
    "colours": [
      {
        "name": "Antique Oxblood",
        "hex": "#631B22"
      }
    ],
    "tags": [
      "Oxblood Chesterfield",
      "3 Seater Leather Sofa",
      "Antique British",
      "Handcrafted"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Classic Oxblood Antique Leather 3-Seater Chesterfield Sofa | Plush Comfort UK",
    "seoDescription": "The ultimate British icon. Classic Oxblood Antique Leather 3-Seater Chesterfield sofa with deep diamond tufting and hand-hammered brass studwork.",
    "rating": 4.8,
    "reviewCount": 15,
    "relatedProductIds": [
      "prod-187",
      "prod-180",
      "prod-166",
      "prod-136"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-152",
    "name": "Luxury U Shape Sofa",
    "slug": "luxury-u-shape-sofa",
    "sku": "PC-UK-152",
    "categoryId": "cat-corner-sofas",
    "subcategoryId": "sub-u-shape",
    "price": 1699,
    "salePrice": 1449,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/luxury-u-shape-sofa-1.webp",
      "/uploads/products/luxury-u-shape-sofa-2.webp",
      "/uploads/products/luxury-u-shape-sofa-3.webp",
      "/uploads/products/luxury-u-shape-sofa-4.webp",
      "/uploads/products/luxury-u-shape-sofa-5.webp",
      "/uploads/products/luxury-u-shape-sofa-6.webp",
      "/uploads/products/luxury-u-shape-sofa-7.webp"
    ],
    "shortDescription": "Transform your living room with our Luxury U Shape Sofa, designed for spacious comfort, modern style and everyday relaxation. Available in a range of colours and fabric options, this generously sized U-shaped sofa is perfect for family living rooms, entertaining guests and creating a stylish focal point in your home.",
    "fullDescription": "Bring comfort and contemporary elegance into your home with our Luxury U Shape Sofa, a beautifully designed statement piece made for modern UK living. With its generous U-shaped layout, this sofa provides plenty of seating space for family and guests while creating a warm and inviting atmosphere in your living room.\n\n\nDesigned with comfort, style and versatility in mind, the sofa features deep, supportive seating and a spacious chaise-style configuration, giving everyone room to sit back, relax and enjoy their space. Its sophisticated appearance works beautifully with both modern and classic interiors, making it an excellent choice for living rooms, open-plan spaces and larger family homes.\n\n\nMultiple colours are available, allowing you to choose a finish that complements your existing d\xE9cor. Whether you prefer a soft neutral shade for a light and elegant look or a deeper colour for a bold contemporary feel, you can create a sofa that suits your personal style and home.\n\n\nThe Luxury U Shape Sofa is ideal for relaxing after a long day, family movie nights, entertaining friends or simply enjoying a comfortable weekend at home. Its spacious design makes excellent use of your living area while providing the premium look and feel expected from a modern luxury sofa.\n\n\nKey Features\n\n\nLuxury U-shaped design for generous seating\n\n\nMultiple colours available to suit different interiors\n\n\nSpacious and comfortable seating for family and guests\n\n\nContemporary design suitable for modern UK homes\n\n\nPerfect for living rooms and larger open-plan spaces\n\n\nStylish statement piece with a sophisticated finish\n\n\nIdeal for relaxing, entertaining and family gatherings\n\n\nDesigned to combine comfort, practicality and luxury\n\n\nUpgrade your living space with a luxury U-shaped corner sofa that offers the perfect balance of style and comfort. Choose your preferred colour and create a welcoming centrepiece your whole family can enjoy.\n\n\nLuxury U Shape Sofa, U Shaped Sofa UK, Luxury Corner Sofa, Large U Shape Sofa, U Shape Corner Sofa, Modern U Shaped Sofa, Fabric U Shape Sofa, Luxury Sofa UK, Large Corner Sofa UK, Living Room Sofa, U Shaped Couch.",
    "dimensions": {
      "width": 330,
      "height": 88,
      "depth": 195,
      "seatHeight": 47
    },
    "materials": [
      "Soft Structured Fabric",
      "Reinforced Timber Frame",
      "Fibre-Filled Cushions",
      "Low Profile Block Feet"
    ],
    "colours": [
      {
        "name": "Slate Grey",
        "hex": "#707378"
      },
      {
        "name": "Mink Beige",
        "hex": "#BFB5A6"
      }
    ],
    "tags": [
      "U Shape Sofa",
      "Extra Large Sofa",
      "Family Living Room",
      "Plush Comfort"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": true,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Luxury U Shape Sofa \u2013 Extra Large Family Seating | Plush Comfort UK",
    "seoDescription": "Spacious Luxury U Shape Sofa designed for large living rooms and family movie nights. Double chaise layout upholstered in hard-wearing plush fabric.",
    "rating": 4.8,
    "reviewCount": 18,
    "relatedProductIds": [
      "prod-223",
      "prod-216",
      "prod-174",
      "prod-124"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-136",
    "name": "Nicole 3+2 Chesterfield Sofa Set in Soft Fabric with Studded Detail",
    "slug": "nicole-32-chesterfield-sofa-set-in-soft-fabric-with-studded-detail",
    "sku": "PC-UK-136",
    "categoryId": "cat-chesterfield-sofas",
    "subcategoryId": "sub-sofa-sets",
    "price": 1299,
    "salePrice": 999,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/nicole-32-chesterfield-sofa-set-in-soft-fabric-with-studded-detail-1.webp",
      "/uploads/products/nicole-32-chesterfield-sofa-set-in-soft-fabric-with-studded-detail-2.webp",
      "/uploads/products/nicole-32-chesterfield-sofa-set-in-soft-fabric-with-studded-detail-3.webp",
      "/uploads/products/nicole-32-chesterfield-sofa-set-in-soft-fabric-with-studded-detail-4.webp",
      "/uploads/products/nicole-32-chesterfield-sofa-set-in-soft-fabric-with-studded-detail-5.webp"
    ],
    "shortDescription": "Bring timeless luxury to your living space with the Nicole 3+2 Sofa Set. Reimagining the iconic Chesterfield silhouette in a soft-touch upholstered fabric, this suite features elegant scroll arms, classic button-tufted trim, and metallic studding alongside a plush scatter-back design. Available in a versatile array of premium shades to suit any British home.",
    "fullDescription": "Elevate your home\u2019s interior with the Nicole 3+2 Sofa Set, a masterclass in grand style and relaxed comfort tailored for UK living rooms. Combining a spacious 3-seater and a matching 2-seater couch, this suite blends the heritage charm of traditional Chesterfield tailoring with modern, sink-in comfort.\n\n\nThe Nicole features dramatic rolled arms lined with refined silver stud detailing, complemented by deep button-tufting along the front apron and arms. Unlike traditional rigid leather designs, the Nicole is upholstered in a tactile, velvet-touch fabric and features deep, high-resilience foam seat cushions paired with a plush array of scatter-back cushions\u2014giving you the perfect balance of structured elegance and cozy relaxation.\n\n\nClassic Chesterfield Styling: Hand-studded trim, buttoned details, and sweeping scroll arms for a timeless, high-end look.\n\n\nExtensive Shade Range: Personalise your set with options including Cream, Champagne, Slate Grey, Charcoal, Forest Green, and Royal Blue.\n\n\nGenerous Seating Suite: Includes both a 3-seater sofa for entertaining and a compact 2-seater ideal for complete room arrangement.\n\n\nUK Fire & Safety Compliant: Engineered on a reinforced timber frame and fully certified to British Furniture Safety Regulations (BS 5852).",
    "dimensions": {
      "width": 220,
      "height": 84,
      "depth": 96,
      "seatHeight": 48
    },
    "materials": [
      "Linen-Touch Soft Upholstery",
      "Dual Hardwood Construction",
      "Individually Pinned Studs",
      "High-Resilience Core"
    ],
    "colours": [
      {
        "name": "Warm Cream",
        "hex": "#F0E8DC"
      },
      {
        "name": "Ash Grey",
        "hex": "#A2A4A8"
      }
    ],
    "tags": [
      "3+2 Sofa Set",
      "Chesterfield Suite",
      "Living Room Set",
      "Nicole Chesterfield"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Nicole 3+2 Chesterfield Sofa Set with Studded Detail | Plush Comfort UK",
    "seoDescription": "Complete suite living: the Nicole 3+2 Chesterfield Sofa Set includes both a 3-seater and a 2-seater sofa with traditional scroll arms and studded trim.",
    "rating": 4.8,
    "reviewCount": 21,
    "relatedProductIds": [
      "prod-187",
      "prod-180",
      "prod-166",
      "prod-160"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-130",
    "name": "Double Ottoman Divan Bed Set with Orthopaedic Mattress & Vertical Panelled Headboard",
    "slug": "double-ottoman-divan-bed-set-with-orthopaedic-mattress-vertical-panelled-headboard",
    "sku": "PC-UK-130",
    "categoryId": "cat-divan-beds",
    "subcategoryId": "sub-ottoman-divans",
    "price": 850,
    "salePrice": 699,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/double-ottoman-divan-bed-set-with-orthopaedic-mattress-vertical-panelled-headboard-1.webp",
      "/uploads/products/double-ottoman-divan-bed-set-with-orthopaedic-mattress-vertical-panelled-headboard-2.webp",
      "/uploads/products/double-ottoman-divan-bed-set-with-orthopaedic-mattress-vertical-panelled-headboard-3.webp",
      "/uploads/products/double-ottoman-divan-bed-set-with-orthopaedic-mattress-vertical-panelled-headboard-4.webp",
      "/uploads/products/double-ottoman-divan-bed-set-with-orthopaedic-mattress-vertical-panelled-headboard-5.webp"
    ],
    "shortDescription": "Maximize your bedroom space without sacrificing luxury with this Double Ottoman Divan Bed set. Paired with a supportive medium-firm mattress and an upholstered vertical padded headboard, this complete sleep solution features a side- or end-opening gas-lift ottoman base to conceal bedding, clothes, and seasonal essentials. Available in a spectrum of premium fabric colors to match any interior.",
    "fullDescription": "Transform your master bedroom or guest room into an organized, hotel-inspired haven with our Double Ottoman Divan Bed Set. Designed specifically for contemporary UK homes where space optimization is essential, this all-in-one set seamlessly combines full under-bed storage with exceptional sleep support and modern aesthetic appeal.\n\n\nThe core feature is the smooth, powerful gas-strut ottoman mechanism, which effortlessly lifts the entire mattress platform to reveal a deep, dust-free storage compartment underneath. Upholstered in soft-touch fabric, the base is complemented by a bold floor-standing or strutted headboard featuring clean vertical fluting that serves as an eye-catching focal point.\n\n\nComplete with an orthopaedic sprung mattress, this bed set provides optimal spinal alignment, pressure relief, and breathable comfort for a peaceful night&#8217;s sleep.\n\n\nEffortless Gas-Lift Storage: Smooth hydraulics allow easy, hands-free access to under-bed storage\u2014ideal for extra linen, pillows, or suitcases.\n\n\nBespoke Fabric & Colour Options: Tailor your bed to your decor with options including Crushed Velvet, Plush Velvet, Linen, or Classic Boucl\xE9 in Grey, Beige, Charcoal, Navy, and Blush Pink.\n\n\nComplete Sleep Package: Includes a double ottoman base, matching vertical-panel headboard, and a deep, quilted medium-firm mattress.\n\n\nBritish Craftsmanship & Safety: Handcrafted in the UK and fully certified to conform with UK Fire Safety Regulations (BS 7177 / BS 5852).",
    "dimensions": {
      "width": 140,
      "height": 130,
      "depth": 200,
      "storageDepth": 28,
      "mattressSize": "Double (4ft 6)"
    },
    "materials": [
      "Gas-Lift Hydraulic Pistons",
      "Reinforced Divan Base",
      "Orthopaedic Tufted Mattress",
      "Vertical Panelled Padded Headboard"
    ],
    "colours": [
      {
        "name": "Silver Grey Plush",
        "hex": "#BDBEC0"
      },
      {
        "name": "Charcoal Linen",
        "hex": "#3C3E42"
      },
      {
        "name": "Oatmeal",
        "hex": "#D7CEBD"
      }
    ],
    "sizes": [
      "Double (4ft 6)",
      "King (5ft)"
    ],
    "tags": [
      "Ottoman Bed",
      "Divan Bed Set",
      "Orthopaedic Mattress",
      "Storage Bed",
      "Underbed Storage"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": true,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": true,
    "seoTitle": "Double Ottoman Divan Bed Set with Orthopaedic Mattress & Headboard | Plush Comfort UK",
    "seoDescription": "Maximize bedroom storage with our Double Ottoman Divan Bed set. Features smooth gas-lift pistons, 54-inch vertical panel headboard, and medium-firm orthopaedic mattress.",
    "rating": 4.8,
    "reviewCount": 24,
    "relatedProductIds": [],
    "complementaryProductIds": [
      "prod-19"
    ],
    "reviews": []
  },
  {
    "id": "prod-124",
    "name": "Lilly Corner Sofa \u2013 Luxury Plush Fabric with Bolster Cushions",
    "slug": "lilly-corner-sofa-luxury-plush-fabric-with-bolster-cushions",
    "sku": "PC-UK-124",
    "categoryId": "cat-corner-sofas",
    "subcategoryId": "sub-corner-l-shape",
    "price": 1250,
    "salePrice": 999,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/lilly-corner-sofa-luxury-plush-fabric-with-bolster-cushions-1.webp",
      "/uploads/products/lilly-corner-sofa-luxury-plush-fabric-with-bolster-cushions-2.webp",
      "/uploads/products/lilly-corner-sofa-luxury-plush-fabric-with-bolster-cushions-3.webp",
      "/uploads/products/lilly-corner-sofa-luxury-plush-fabric-with-bolster-cushions-4.webp",
      "/uploads/products/lilly-corner-sofa-luxury-plush-fabric-with-bolster-cushions-5.webp"
    ],
    "shortDescription": "Bring timeless elegance and deep-seated comfort to your living area with the Lilly Corner Sofa. Featuring distinctive stitched vertical paneling along the apron and wide curved armrests, paired with matching cylindrical bolster cushions, this corner sofa blends traditional warmth with contemporary British styling. Available in a wide spectrum of rich, neutral, and vibrant upholstery shades.",
    "fullDescription": "Upgrade your living room with the Lilly Corner Sofa, a masterpiece of modern British upholstery designed for exceptional comfort and refined visual appeal. Crafted to maximize floor space without compromising on seating area, this L-shaped corner unit offers an inviting setting for relaxing, reading, or social gatherings.\n\n\nThe Lilly is defined by its thoughtful design details\u2014including subtle vertical panel stitching along the front base and rounded armrests, which complement its soft, micro-suede or matte velvet texture. Generously padded back supports and thick seat cushions offer a balance of gentle sink-in feel and long-lasting firm support. Included cylindrical bolster pillows add both ergonomic wrist/arm support and a distinct touch of designer flair.\n\n\nBespoke Shade Range: Select from classic neutrals like Beige, Cream, and Slate Grey, or bold options such as Forest Green, Mustard, and Deep Blue.\n\n\nPremium Upholstery: Covered in ultra-soft, durable fabric designed to resist daily wear while remaining gentle to the touch.\n\n\nBuilt to Last: Frame constructed using ethically sourced, reinforced timber designed to withstand everyday family use.\n\n\nUK Safety Certified: Fully compliant with British Furniture and Furnishings Fire Safety Regulations (BS 5852).",
    "dimensions": {
      "width": 245,
      "height": 86,
      "depth": 165,
      "seatHeight": 46
    },
    "materials": [
      "Luxury Plush Soft-Touch Fabric",
      "Stitched Fluted Arm Detail",
      "Reflex Foam Cushioning",
      "Matching Cylindrical Bolsters"
    ],
    "colours": [
      {
        "name": "Plush Dove Grey",
        "hex": "#A8AAAD"
      },
      {
        "name": "Emerald Forest",
        "hex": "#264A38"
      }
    ],
    "tags": [
      "Lilly Corner Sofa",
      "Bolster Cushions",
      "Fluted Arms",
      "Plush Fabric",
      "Corner Settee"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Lilly Corner Sofa \u2013 Luxury Plush Fabric with Bolster Cushions | Plush Comfort UK",
    "seoDescription": "The Lilly Corner Sofa delivers contemporary elegance with distinctive vertical fluting along the sides, plush back cushions, and matching cylindrical bolsters.",
    "rating": 4.8,
    "reviewCount": 27,
    "relatedProductIds": [
      "prod-223",
      "prod-216",
      "prod-174",
      "prod-152"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-119",
    "name": "Luxury U-Shaped Velvet Corner Sofa with Double Chaise",
    "slug": "luxury-u-shaped-velvet-corner-sofa-with-double-chaise",
    "sku": "PC-UK-119",
    "categoryId": "cat-corner-sofas",
    "subcategoryId": "sub-u-shape",
    "price": 1199,
    "salePrice": 999,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/luxury-u-shaped-velvet-corner-sofa-with-double-chaise-1.webp",
      "/uploads/products/luxury-u-shaped-velvet-corner-sofa-with-double-chaise-2.webp",
      "/uploads/products/luxury-u-shaped-velvet-corner-sofa-with-double-chaise-3.webp",
      "/uploads/products/luxury-u-shaped-velvet-corner-sofa-with-double-chaise-4.webp"
    ],
    "shortDescription": "Elevate your living space with this spacious UK-styled U-shaped sectional sofa. Featuring dual chaise lounges, ultra-plush cushioning, and a modern neutral aesthetic, it offers the ultimate combination of luxury and relaxed family seating. Available in a wide selection of premium fabrics and vibrant or subtle colors to suit any interior.",
    "fullDescription": "Transform your living room into a sophisticated retreat with this luxury U-shaped sectional sofa. Designed specifically for contemporary UK homes, this statement piece blends clean-lined modern elegance with generous proportions, making it the ideal focal point for family movie nights, entertaining, or simply unwinding in comfort.\n\n\nThe symmetrical U-shaped layout features dual extended chaises, allowing multiple people to stretch out with full-leg support at the same time. Deep, high-density foam seat cushions provide resilient, medium-firm support, while a plush array of back cushions and contrasting accent pillows offer tailored comfort for any seating position.\n\n\nUpholstered in soft-touch, premium chenille-velvet fabric, this sofa is engineered for both style and daily durability. Built on a reinforced hardwood frame with low-profile legs, it delivers exceptional stability and long-lasting quality.\n\n\nVersatile Color Selection: Available in multiple shades including Cream, Pebble Grey, Charcoal, Mink, Forest Green, and Midnight Blue.\n\n\nFamily-Friendly Durability: Treated fabric provides superior wear resistance for everyday British household use.",
    "dimensions": {
      "width": 325,
      "height": 89,
      "depth": 190,
      "seatHeight": 48
    },
    "materials": [
      "Silky Smooth Velvet",
      "Double Chaise Lounge Layout",
      "Heavy-Duty Timber Framing",
      "Chrome Bracket Supports"
    ],
    "colours": [
      {
        "name": "Champagne Taupe",
        "hex": "#C2B8A6"
      },
      {
        "name": "Midnight Charcoal",
        "hex": "#2C2E33"
      }
    ],
    "tags": [
      "Double Chaise Sofa",
      "Velvet U-Shape",
      "Luxury Settee",
      "Plush Seating"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Luxury U-Shaped Velvet Corner Sofa with Double Chaise | Plush Comfort UK",
    "seoDescription": "Indulge in spacious comfort with our Luxury U-Shaped Velvet Corner Sofa featuring dual chaise ends. Perfect for family lounging and cinema rooms.",
    "rating": 4.8,
    "reviewCount": 30,
    "relatedProductIds": [
      "prod-223",
      "prod-216",
      "prod-174",
      "prod-152"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-112",
    "name": "Verona Corner Sofa \u2013 Luxury Light Grey Fabric Sofa with Deep Seating",
    "slug": "verona-corner-sofa-luxury-light-grey-fabric-sofa-with-deep-seating",
    "sku": "PC-UK-112",
    "categoryId": "cat-fabric-sofas",
    "subcategoryId": "sub-fabric-corner",
    "price": 1250,
    "salePrice": 849,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/verona-corner-sofa-luxury-light-grey-fabric-sofa-with-deep-seating-1.webp",
      "/uploads/products/verona-corner-sofa-luxury-light-grey-fabric-sofa-with-deep-seating-2.webp",
      "/uploads/products/verona-corner-sofa-luxury-light-grey-fabric-sofa-with-deep-seating-3.webp",
      "/uploads/products/verona-corner-sofa-luxury-light-grey-fabric-sofa-with-deep-seating-4.webp",
      "/uploads/products/verona-corner-sofa-luxury-light-grey-fabric-sofa-with-deep-seating-5.webp"
    ],
    "shortDescription": "Verona Corner Sofa Bring timeless elegance and everyday comfort to your living room with the Verona Corner Sofa. Upholstered in a sophisticated light-grey fabric, this spacious corner sofa features deep seating, generously filled cushions and beautifully rolled, button-tufted arms. Its classic design makes it a stylish focal point for both traditional and contemporary UK homes.",
    "fullDescription": "The Verona Corner Sofa combines classic British-inspired styling with the comfort your home deserves. Designed for relaxed family living and entertaining, its generous corner configuration provides plenty of room to stretch out, while the deep cushioned seating creates a welcoming place to unwind.\n\n\nFinished in an elegant light-grey upholstery, the Verona offers a versatile look that complements a wide range of interiors, from modern neutral spaces to more traditional living rooms. The distinctive rolled arms and deep button tufting add a refined touch, while the soft, coordinating scatter cushions provide additional comfort and a layered, luxurious appearance.\n\n\nWhether you&#8217;re enjoying a quiet evening, hosting friends or bringing the family together, the Verona Corner Sofa provides an inviting combination of style, space and everyday comfort.\n\n\nKey Features:\n\n\nElegant light-grey upholstered finish\n\n\nSpacious corner design, ideal for family living rooms\n\n\nDeep, comfortable seating\n\n\nClassic rolled arms with button-tufted detailing\n\n\nIncludes coordinating scatter cushions\n\n\nTimeless design suited to both traditional and contemporary interiors\n\n\nA stylish statement piece for the modern UK home",
    "dimensions": {
      "width": 255,
      "height": 87,
      "depth": 255,
      "seatHeight": 46
    },
    "materials": [
      "Soft Weave Chenille-Polyester Fabric",
      "Deep Reflex Foam Seats",
      "Tufted Scroll Trim",
      "Solid Wood Tapered Legs"
    ],
    "colours": [
      {
        "name": "Light Grey Weave",
        "hex": "#B8B9BB"
      }
    ],
    "tags": [
      "Verona Fabric Sofa",
      "Deep Seating",
      "Light Grey Sofa",
      "Corner Fabric"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Verona Corner Sofa \u2013 Luxury Light Grey Fabric Sofa with Deep Seating | Plush Comfort UK",
    "seoDescription": "Sink into the deep seating of the Verona Corner Sofa. Soft-touch light grey weave, classic rolled detailing, and durable construction handcrafted in the UK.",
    "rating": 4.8,
    "reviewCount": 33,
    "relatedProductIds": [
      "prod-15"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-96",
    "name": "Luxurious Bella Chesterfield Corner Sofa",
    "slug": "luxurious-bella-modern-chesterfield-corner-sofa",
    "sku": "PC-UK-96",
    "categoryId": "cat-chesterfield-sofas",
    "subcategoryId": "sub-chesterfield-corner",
    "price": 1699,
    "salePrice": 1299,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "/uploads/products/luxurious-bella-modern-chesterfield-corner-sofa-1.webp",
      "/uploads/products/luxurious-bella-modern-chesterfield-corner-sofa-2.webp",
      "/uploads/products/luxurious-bella-modern-chesterfield-corner-sofa-3.webp",
      "/uploads/products/luxurious-bella-modern-chesterfield-corner-sofa-4.webp",
      "/uploads/products/luxurious-bella-modern-chesterfield-corner-sofa-5.webp",
      "/uploads/products/luxurious-bella-modern-chesterfield-corner-sofa-6.webp"
    ],
    "shortDescription": "Transform your living space with the Bella Chesterfield Corner Sofa. Combining timeless British heritage with modern glamour, this stunning corner group features vertical channel tufting, striking gold-tone metallic strip detailing, and deep plush cushioning for ultimate relaxation. Complete with a matching footstool and coordinating scatter cushions, it\u2019s the ultimate statement piece for any stylish UK home.",
    "fullDescription": "Elevate your home decor with the sophisticated Bella Chesterfield Corner Sofa. Designed to make an impression, this luxurious corner sofa set seamlessly blends classic Chesterfield charm with sleek, modern design elements.\n\n\nCrafted with premium soft-touch upholstery, the sofa features elegant vertical channel stitching accented by eye-catching gold chrome strip inserts along the backrest, frame, and matching Ottoman coffee table. Deep-filled foam seats and generous back support ensure maximum comfort without sacrificing style.\n\n\nWhether you&#8217;re hosting guests or unwinding after a long day, the spacious L-shaped layout offers ample seating space for the whole family.\n\n\nKey Features:\n\n\nModern Luxury Design: Unique vertical channel paneling highlighted with polished gold trim details.\n\n\nSpacious L-Shape Corner Layout: Maximises living room space while offering comfortable seating for family and guests.\n\n\nPremium Upholstery: Upholstered in a high-grade, plush soft-touch fabric (Off-White / Cream) that is smooth and easy to maintain.\n\n\nMatching Ottoman Footstool / Coffee Table Included: Features a glass top inset for added practicality and luxury appeal.\n\n\nMatching Scatter Cushions Included: Includes plush cushions with decorative gold accents to complete the look.\n\n\nSturdy Frame: Built with a durable hardwood frame designed to handle everyday UK family life.\n\n\nSpecifications:\n\n\nSofa Style: Chesterfield / Modern Channel Tufted\n\n\nOrientation: Corner / Sectional Group\n\n\nColor: Cream / Off-White with Gold Metal Trim\n\n\nUpholstery: Soft Plush Fabric\n\n\nIncludes: Corner Sofa Unit + Matching Ottoman/Coffee Table + Matching Cushions",
    "dimensions": {
      "width": 280,
      "height": 88,
      "depth": 280,
      "seatHeight": 48
    },
    "materials": [
      "Gleaming Crushed Velvet",
      "Deep Diamond Buttoned Arms & Back",
      "Hand-Finished Chrome Studs",
      "Metallic Cabriole Feet"
    ],
    "colours": [
      {
        "name": "Glacier Silver",
        "hex": "#C0C2C7"
      },
      {
        "name": "Deep Onyx",
        "hex": "#232426"
      }
    ],
    "tags": [
      "Bella Chesterfield",
      "Crushed Velvet",
      "Chesterfield Corner",
      "Showstopper Sofa"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Luxurious Bella Chesterfield Corner Sofa | Plush Comfort UK",
    "seoDescription": "The Bella Chesterfield Corner Sofa is a showstopper. Deep diamond buttoning, studded borders, and luxurious velvet finish finished by skilled upholsterers.",
    "rating": 4.8,
    "reviewCount": 16,
    "relatedProductIds": [
      "prod-187",
      "prod-180",
      "prod-166",
      "prod-160"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  },
  {
    "id": "prod-23",
    "name": "Beige Armchair",
    "slug": "beige-armchair",
    "sku": "PC-UK-23",
    "categoryId": "cat-armchairs",
    "subcategoryId": "sub-accent-chairs",
    "price": 320,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "https://images.unsplash.com/photo-1675767528117-963ce219b52a?q=85&w=1200&h=900"
    ],
    "shortDescription": "Add a touch of warmth to any room with this beige armchair, designed for comfort with plush cushioning and sturdy wooden legs.",
    "fullDescription": "Add a touch of warmth to any room with this beige armchair, designed for comfort with plush cushioning and sturdy wooden legs.",
    "dimensions": {
      "width": 82,
      "height": 84,
      "depth": 80,
      "seatHeight": 45
    },
    "materials": [
      "Soft Boucl\xE9-Linen Fabric",
      "Solid Turned Wooden Legs",
      "Supportive Foam Core",
      "Ergonomic Curved Backrest"
    ],
    "colours": [
      {
        "name": "Warm Beige",
        "hex": "#DED5C7"
      }
    ],
    "tags": [
      "Beige Armchair",
      "Accent Chair",
      "Living Room Seating",
      "Bedroom Chair"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Beige Armchair \u2013 Cosy Scandi Accent Chair | Plush Comfort UK",
    "seoDescription": "Add warmth and versatile seating to any room with this beige armchair, designed for comfort with plush cushioning and sturdy wooden legs.",
    "rating": 4.8,
    "reviewCount": 19,
    "relatedProductIds": [],
    "complementaryProductIds": [],
    "reviews": []
  },
  {
    "id": "prod-21",
    "name": "White Wardrobe",
    "slug": "white-wardrobe",
    "sku": "PC-UK-21",
    "categoryId": "cat-wardrobes",
    "subcategoryId": "sub-freestanding-wardrobes",
    "price": 540,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "https://images.unsplash.com/photo-1681381606316-426c1605dde3?q=85&w=1200&h=900"
    ],
    "shortDescription": "Keep your bedroom tidy with this elegant white wardrobe, featuring ample storage space and full-length mirrors to brighten your room.",
    "fullDescription": "Keep your bedroom tidy with this elegant white wardrobe, featuring ample storage space and full-length mirrors to brighten your room.",
    "dimensions": {
      "width": 120,
      "height": 195,
      "depth": 55
    },
    "materials": [
      "Engineered Solid Core Wood",
      "White Matte Finish",
      "Full-Length Bevelled Mirror Panels",
      "Smooth Glide Metal Drawer Runners"
    ],
    "colours": [
      {
        "name": "Pure White Matte",
        "hex": "#FDFDFD"
      }
    ],
    "tags": [
      "White Wardrobe",
      "Mirrored Wardrobe",
      "Bedroom Storage",
      "Double Wardrobe"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": true,
    "seoTitle": "White Wardrobe with Full-Length Mirrors | Plush Comfort UK",
    "seoDescription": "Keep your bedroom tidy and bright with this elegant white wardrobe, featuring generous hanging storage, shelving, and full-length mirrors.",
    "rating": 4.8,
    "reviewCount": 22,
    "relatedProductIds": [],
    "complementaryProductIds": [],
    "reviews": []
  },
  {
    "id": "prod-19",
    "name": "King Mattress",
    "slug": "king-mattress",
    "sku": "PC-UK-19",
    "categoryId": "cat-mattresses",
    "subcategoryId": "sub-orthopaedic-mattresses",
    "price": 650,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "https://images.unsplash.com/photo-1545858899-278ffaa47025?q=85&w=1200&h=900"
    ],
    "shortDescription": "Experience restful nights with this king-size mattress featuring advanced memory foam layers that adapt to your body for ultimate comfort.",
    "fullDescription": "Experience restful nights with this king-size mattress featuring advanced memory foam layers that adapt to your body for ultimate comfort.",
    "dimensions": {
      "width": 150,
      "height": 26,
      "depth": 200,
      "mattressSize": "King (5ft)"
    },
    "materials": [
      "Individually Encased Pocket Springs",
      "High-Density Memory Foam Layer",
      "Breathable Bamboo Cover",
      "Hypoallergenic Fillings"
    ],
    "colours": [
      {
        "name": "Pure White & Grey Border",
        "hex": "#EEEEEE"
      }
    ],
    "sizes": [
      "King (5ft)"
    ],
    "tags": [
      "King Mattress",
      "Memory Foam",
      "Pocket Sprung",
      "Orthopaedic Mattress"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "King Size Memory Foam & Pocket Sprung Mattress | Plush Comfort UK",
    "seoDescription": "Experience restful nights with this king-size mattress featuring advanced memory foam layers and supportive pocket springs for pressure-relieving sleep.",
    "rating": 4.8,
    "reviewCount": 25,
    "relatedProductIds": [],
    "complementaryProductIds": [],
    "reviews": []
  },
  {
    "id": "prod-15",
    "name": "Modern Grey Sofa",
    "slug": "modern-grey-sofa",
    "sku": "PC-UK-15",
    "categoryId": "cat-fabric-sofas",
    "subcategoryId": "sub-fabric-3-seater",
    "price": 799,
    "stock": 8,
    "lowStockThreshold": 2,
    "images": [
      "https://images.unsplash.com/photo-1602374078449-4ac1a50b7a25?q=85&w=1200&h=900"
    ],
    "shortDescription": "This contemporary grey sofa blends comfort and style, featuring soft fabric upholstery and supportive cushions perfect for relaxing after a long day.",
    "fullDescription": "This contemporary grey sofa blends comfort and style, featuring soft fabric upholstery and supportive cushions perfect for relaxing after a long day.",
    "dimensions": {
      "width": 210,
      "height": 85,
      "depth": 92,
      "seatHeight": 46
    },
    "materials": [
      "Durable Textured Grey Upholstery",
      "Kiln-Dried European Beech Frame",
      "High-Density Cushioning",
      "Sleek Powder-Coated Metal Legs"
    ],
    "colours": [
      {
        "name": "Contemporary Grey",
        "hex": "#7D8085"
      }
    ],
    "tags": [
      "Modern Grey Sofa",
      "Fabric Sofa",
      "Contemporary Living",
      "Minimalist Settee"
    ],
    "isPublished": true,
    "isFeatured": false,
    "isTrending": false,
    "deliveryInfo": "Free 2-man room-of-choice UK delivery. Handcrafted to order and delivered in 5\u201310 working days.",
    "careInstructions": "Gently vacuum upholstery with a soft brush attachment. Blot liquid spills immediately with an absorbent uncoloured cloth. Professional cleaning recommended.",
    "assemblyRequired": false,
    "seoTitle": "Modern Grey Sofa \u2013 Contemporary British Living | Plush Comfort UK",
    "seoDescription": "This contemporary grey sofa blends comfort and style, featuring soft fabric upholstery and supportive cushions perfect for relaxing after a long day.",
    "rating": 4.8,
    "reviewCount": 28,
    "relatedProductIds": [
      "prod-112"
    ],
    "complementaryProductIds": [
      "prod-23"
    ],
    "reviews": []
  }
];
var INITIAL_ORDERS = [
  {
    id: "ord-101",
    orderNumber: "PC-UK-82914",
    createdAt: "2026-10-09T14:22:00Z",
    customer: {
      fullName: "Gareth Edwards",
      email: "gareth.edwards@gmail.com",
      phone: "+44 7700 900123",
      addressLine1: "14 Chapel Lane",
      city: "Harrogate",
      county: "North Yorkshire",
      postcode: "HG1 2PW",
      country: "United Kingdom"
    },
    items: [
      {
        productId: "prod-kensington-chair",
        name: "The Kensington Boucl\xE9 Accent Armchair",
        sku: "PC-CHR-KEN-01",
        price: 389,
        quantity: 1,
        selectedColour: "Cozy Boucl\xE9 Beige",
        image: FURNITURE_IMAGES.heroAccentChair
      },
      {
        productId: "prod-airedale-table",
        name: "The Airedale Natural Oak Minimalist Side Table",
        sku: "PC-ACC-AIR-ST",
        price: 99,
        quantity: 1,
        selectedColour: "Natural Honey Oak",
        image: FURNITURE_IMAGES.heroAccentChair
      }
    ],
    subtotal: 488,
    deliveryFee: 0,
    discountAmount: 0,
    total: 488,
    paymentMethod: "card",
    paymentStatus: "paid",
    fulfilmentStatus: "processing",
    deliveryOption: "standard",
    courier: "DX Freight Specialists",
    trackingNumber: "DX-GB-99214401",
    estimatedDeliveryDate: "14 Oct 2026",
    timeline: [
      { status: "Order Placed", timestamp: "2026-10-09T14:22:00Z", note: "Payment verified via Stripe UK (\xA3488.00)" },
      { status: "Processing", timestamp: "2026-10-09T16:00:00Z", note: "Quality check passed. Allocated to delivery route." }
    ]
  },
  {
    id: "ord-102",
    orderNumber: "PC-UK-82855",
    createdAt: "2026-10-08T10:15:00Z",
    customer: {
      fullName: "Charlotte Willoughby",
      email: "c.willoughby@outlook.com",
      phone: "+44 7800 456789",
      addressLine1: "28 Lansdowne Road",
      city: "London",
      county: "Greater London",
      postcode: "W11 2LS",
      country: "United Kingdom"
    },
    items: [
      {
        productId: "prod-dewsbury-bed",
        name: "Ambassador Luxury Deep-Buttoned Upholstered Bed Frame",
        sku: "PC-BED-DEW-01",
        price: 749,
        quantity: 1,
        selectedColour: "Oatmeal Tweed",
        selectedSize: "King Size (5ft)",
        image: FURNITURE_IMAGES.luxuryBed
      }
    ],
    subtotal: 749,
    deliveryFee: 79.99,
    discountAmount: 0,
    total: 828.99,
    paymentMethod: "klarna",
    paymentStatus: "paid",
    fulfilmentStatus: "dispatched",
    deliveryOption: "white_glove",
    courier: "Panther 2-Man White Glove",
    trackingNumber: "PANTHER-UK-441092",
    estimatedDeliveryDate: "12 Oct 2026",
    timeline: [
      { status: "Order Placed", timestamp: "2026-10-08T10:15:00Z", note: "Paid with Klarna Pay in 3 (\xA3828.99)" },
      { status: "Processing", timestamp: "2026-10-08T11:30:00Z", note: "Bed frame quality audit complete." },
      { status: "Dispatched", timestamp: "2026-10-09T08:00:00Z", note: "Collected by Panther Logistics for 2-man room delivery and assembly." }
    ]
  }
];

// src/utils/permissions.ts
var ACCESS_AREAS = [
  { id: "overview", label: "Overview (own summary)", description: "Personal dashboard summary \u2014 always on" },
  { id: "products", label: "Products & Variations", description: "Add / edit products, prices, stock, colours & variations" },
  { id: "categories", label: "Categories & SEO", description: "Create, preview, update and delete categories" },
  { id: "content", label: "Blogs, Guides & Pillar Pages", description: "Write and publish articles, guides and pillar pages" },
  { id: "design", label: "Store Design (Homepage, Menu, Footer)", description: "Hero, homepage sections, top bar, mega menu, footer" },
  { id: "orders", label: "Orders & Fulfilment", description: "View orders and change order status" },
  { id: "analytics", label: "Analytics", description: "Storefront analytics" },
  { id: "settings", label: "Store Settings & Global SEO", description: "Contact details, delivery fees, default SEO image" },
  { id: "audit", label: "Activity & Audit Logs", description: "See the store-wide change history" }
];
var ROLE_DEFAULT_ACCESS = {
  admin: ["overview", "products", "categories", "content", "design", "orders", "analytics", "settings", "audit"],
  editor: ["overview", "products", "categories", "content"],
  marketer: ["overview", "categories", "content", "design"]
};
var AREA_IDS = new Set(ACCESS_AREAS.map((a) => a.id));
function getEffectiveAccess(user) {
  if (user.role === "master_admin") return ACCESS_AREAS.map((a) => a.id);
  const explicit = (user.permissions || []).filter((p) => AREA_IDS.has(p));
  if (explicit.length > 0) {
    return Array.from(/* @__PURE__ */ new Set(["overview", ...explicit]));
  }
  return ROLE_DEFAULT_ACCESS[user.role] || ["overview"];
}

// serverlib/dataStore.ts
import fs from "fs";
import path from "path";
var cache = /* @__PURE__ */ new Map();
var backend;
var lastRefresh = 0;
var REFRESH_MS = Number(process.env.DB_REFRESH_MS || 3e3);
function fileBackend(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {
  }
  return {
    name: "file",
    async loadAll() {
      const out = {};
      try {
        for (const f of fs.readdirSync(dir)) {
          if (!f.endsWith(".json")) continue;
          try {
            out[f.replace(/\.json$/, "")] = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"));
          } catch (err) {
            console.error(`[dataStore] Could not parse ${f}:`, err);
          }
        }
      } catch {
      }
      return out;
    },
    async save(key, value) {
      const target = path.join(dir, `${key}.json`);
      const tmp = `${target}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(value, null, 2), "utf-8");
      fs.renameSync(tmp, target);
    }
  };
}
async function mysqlBackend(url) {
  const mysql = await import("mysql2/promise");
  const pool = mysql.createPool({
    uri: url,
    waitForConnections: true,
    connectionLimit: 5,
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : void 0
  });
  await pool.query(
    `CREATE TABLE IF NOT EXISTS pc_store (
       store_key VARCHAR(120) NOT NULL PRIMARY KEY,
       store_value LONGTEXT NOT NULL,
       updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
     ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  return {
    name: "mysql",
    async loadAll() {
      const [rows] = await pool.query("SELECT store_key, store_value FROM pc_store");
      const out = {};
      for (const r of rows) {
        try {
          out[r.store_key] = JSON.parse(r.store_value);
        } catch {
        }
      }
      return out;
    },
    async save(key, value) {
      await pool.query(
        "INSERT INTO pc_store (store_key, store_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE store_value = VALUES(store_value)",
        [key, JSON.stringify(value)]
      );
    }
  };
}
async function postgresBackend(url) {
  const pgMod = await import("pg");
  const Pool = pgMod.Pool || pgMod.default?.Pool;
  const pool = new Pool({
    connectionString: url,
    max: 3,
    idleTimeoutMillis: 1e4,
    connectionTimeoutMillis: 1e4,
    ssl: process.env.DATABASE_SSL === "false" ? void 0 : { rejectUnauthorized: false }
    // Neon requires SSL
  });
  await pool.query(
    `CREATE TABLE IF NOT EXISTS pc_store (
       store_key VARCHAR(120) PRIMARY KEY,
       store_value TEXT NOT NULL,
       updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
     )`
  );
  return {
    name: "postgres",
    async loadAll() {
      const res = await pool.query("SELECT store_key, store_value FROM pc_store");
      const out = {};
      for (const r of res.rows) {
        try {
          out[r.store_key] = JSON.parse(r.store_value);
        } catch {
        }
      }
      return out;
    },
    async save(key, value) {
      await pool.query(
        `INSERT INTO pc_store (store_key, store_value, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (store_key) DO UPDATE SET store_value = EXCLUDED.store_value, updated_at = NOW()`,
        [key, JSON.stringify(value)]
      );
    }
  };
}
var initPromise = null;
function initDataStore(fileDir) {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const url = process.env.DATABASE_URL;
    const isPg = !!url && /^postgres(ql)?:/i.test(url);
    const isMy = !!url && url.startsWith("mysql");
    if (url && (isPg || isMy)) {
      try {
        backend = isPg ? await postgresBackend(url) : await mysqlBackend(url);
        console.log(`[dataStore] Connected to ${isPg ? "PostgreSQL (Neon)" : "MySQL"} database.`);
        const existing = await backend.loadAll();
        if (Object.keys(existing).length === 0) {
          const legacy = await fileBackend(fileDir).loadAll();
          for (const [k, v] of Object.entries(legacy)) await backend.save(k, v);
          if (Object.keys(legacy).length) console.log(`[dataStore] Migrated ${Object.keys(legacy).length} JSON files into the database.`);
        }
      } catch (err) {
        console.error("[dataStore] Database connection failed \u2014 falling back to JSON files:", err);
        backend = fileBackend(fileDir);
      }
    } else {
      if (url) console.error("[dataStore] DATABASE_URL is set but is not mysql:// or postgres:// \u2014 ignoring it.");
      backend = fileBackend(fileDir);
      console.log(`[dataStore] Using JSON file storage in ${fileDir}`);
    }
    const all = await backend.loadAll();
    cache.clear();
    for (const [k, v] of Object.entries(all)) cache.set(k, v);
    lastRefresh = Date.now();
  })();
  return initPromise;
}
async function refreshIfStale() {
  if (!backend || backend.name === "file") return;
  if (Date.now() - lastRefresh < REFRESH_MS) return;
  lastRefresh = Date.now();
  try {
    const all = await backend.loadAll();
    for (const [k, v] of Object.entries(all)) cache.set(k, v);
  } catch (err) {
    console.warn("[dataStore] refresh failed:", err);
  }
}
function readData(key, fallback) {
  return cache.has(key) ? cache.get(key) : fallback;
}
var pendingWrites = /* @__PURE__ */ new Set();
function writeData(key, value) {
  cache.set(key, value);
  if (!backend) return;
  const p = backend.save(key, value).catch((err) => console.error(`[dataStore] save "${key}" failed:`, err)).then(() => {
    pendingWrites.delete(p);
  });
  pendingWrites.add(p);
}
function hasPendingWrites() {
  return pendingWrites.size > 0;
}
async function flushWrites() {
  while (pendingWrites.size) await Promise.all([...pendingWrites]);
}
function storageBackendName() {
  return backend?.name || "starting";
}

// serverlib/messaging.ts
import nodemailer from "nodemailer";
function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}
function isWhatsAppConfigured() {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}
var transporter = null;
function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  return transporter;
}
async function sendEmail(to, subject, text, html) {
  if (!isEmailConfigured()) throw new Error("Email (SMTP) is not configured on the server.");
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html
  });
}
async function sendOtpEmail(to, code, purpose) {
  const title = purpose === "login" ? "Your sign-in code" : "Your password reset code";
  const action = purpose === "login" ? "sign in to the Plush Comfort staff portal" : "reset your Plush Comfort master password";
  const text = `${title}: ${code}

Use this code to ${action}. It expires in 10 minutes.
If you did not request this, you can ignore this email \u2014 your account is safe.`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:460px;margin:auto;padding:24px;border:1px solid #E8E0D5;border-radius:16px">
    <h2 style="font-family:Georgia,serif;color:#221C18;margin:0 0 8px">${title}</h2>
    <p style="color:#5A4F46;font-size:14px">Use this code to ${action}:</p>
    <div style="font-size:32px;letter-spacing:8px;font-weight:700;color:#A25828;padding:12px 0">${code}</div>
    <p style="color:#8A786A;font-size:12px">The code expires in 10 minutes. If you did not request it, ignore this email.</p>
  </div>`;
  await sendEmail(to, `${title} \u2014 Plush Comfort UK`, text, html);
}
async function sendOtpWhatsApp(phone, code) {
  if (!isWhatsAppConfigured()) throw new Error("WhatsApp Cloud API is not configured on the server.");
  const to = phone.replace(/[^0-9]/g, "");
  const template = process.env.WHATSAPP_OTP_TEMPLATE;
  const body = template ? {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: template,
      language: { code: process.env.WHATSAPP_TEMPLATE_LANG || "en_GB" },
      components: [
        { type: "body", parameters: [{ type: "text", text: code }] },
        // Authentication templates with a "copy code" button need the code again here
        { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: code }] }
      ]
    }
  } : {
    // Plain text only works inside a 24h customer-service window — use a template in production
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: `Plush Comfort sign-in code: ${code} (expires in 10 minutes)` }
  };
  const res = await fetch(
    `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  );
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`WhatsApp API error ${res.status}: ${txt.slice(0, 300)}`);
  }
}
function isRecaptchaConfigured() {
  return Boolean(process.env.RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY);
}
async function verifyRecaptcha(token, ip) {
  if (!isRecaptchaConfigured()) return true;
  if (!token) return false;
  try {
    const params = new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY, response: token });
    if (ip) params.set("remoteip", ip);
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error("[recaptcha] verification failed:", err);
    return false;
  }
}

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var app = express();
var PORT = process.env.PORT || 3e3;
var SITE_URL = (process.env.SITE_URL || "https://plushcomfort.uk").replace(/\/+$/, "");
var IS_PRODUCTION = process.env.NODE_ENV === "production";
app.set("trust proxy", true);
app.use(compression());
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
var DATA_DIR = process.env.DATA_DIR ? path2.resolve(process.env.DATA_DIR) : process.env.VERCEL ? path2.resolve("/tmp", "plush_comfort_data") : path2.resolve(__dirname, "data");
var UPLOADS_DIR = process.env.UPLOADS_DIR ? path2.resolve(process.env.UPLOADS_DIR) : process.env.VERCEL ? path2.resolve("/tmp", "plush_comfort_uploads") : path2.resolve(__dirname, "public", "uploads");
try {
  fs2.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch (dirErr) {
  console.warn("Directory creation warning:", dirErr);
}
var dataReady = initDataStore(DATA_DIR);
app.use(async (_req, _res, next) => {
  try {
    await dataReady;
    await refreshIfStale();
  } catch {
  }
  next();
});
app.use((_req, res, next) => {
  const originalEnd = res.end.bind(res);
  res.end = (...args) => {
    if (!hasPendingWrites()) return originalEnd(...args);
    flushWrites().finally(() => originalEnd(...args));
    return res;
  };
  next();
});
var K = {
  USERS: "admin_users",
  SESSIONS: "active_sessions",
  LOGS: "audit_logs",
  DESIGN: "store_design",
  PRODUCTS: "store_products",
  CATEGORIES: "store_categories",
  BLOGS: "store_blogs",
  ORDERS: "store_orders",
  RESET_REQUESTS: "password_reset_requests",
  OTPS: "otp_codes"
};
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1e5, 64, "sha512").toString("hex");
}
function hashPasswordLegacy(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1e4, 64, "sha512").toString("hex");
}
function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}
function safeEqual(a, b) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}
function verifyPassword(user, password) {
  if (safeEqual(hashPassword(password, user.salt), user.passwordHash)) return true;
  if (safeEqual(hashPasswordLegacy(password, user.salt), user.passwordHash)) {
    user.passwordHash = hashPassword(password, user.salt);
    return true;
  }
  return false;
}
function setPassword(user, password) {
  user.salt = generateSalt();
  user.passwordHash = hashPassword(password, user.salt);
  user.passwordChangedAt = (/* @__PURE__ */ new Date()).toISOString();
}
function passwordProblem(pw) {
  if (typeof pw !== "string" || pw.length < 8) return "Password must be at least 8 characters long.";
  if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return "Password must contain letters and numbers.";
  return null;
}
function clientIp(req) {
  return (req.ip || req.socket.remoteAddress || "127.0.0.1").replace("::ffff:", "");
}
function describeDevice(ua) {
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Unknown OS";
  const kind = /Mobile|Android|iPhone/.test(ua) ? "Mobile" : "Desktop";
  return `${browser} on ${os} (${kind})`;
}
function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    phone: u.phone,
    role: u.role,
    permissions: u.permissions,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
    passwordChangedAt: u.passwordChangedAt,
    isActive: u.isActive
  };
}
function maskEmail(email) {
  const [n, d] = email.split("@");
  return `${n.slice(0, 2)}${"*".repeat(Math.max(1, n.length - 2))}@${d}`;
}
function maskPhone(phone) {
  const digits = phone.replace(/[^0-9]/g, "");
  return `\u2022\u2022\u2022\u2022 ${digits.slice(-3)}`;
}
var getUsers = () => readData(K.USERS, []);
var saveUsers = (u) => writeData(K.USERS, u);
var getSessions = () => readData(K.SESSIONS, []);
var saveSessions = (s) => writeData(K.SESSIONS, s);
var loginRateLimits = /* @__PURE__ */ new Map();
function checkRateLimit(key) {
  const record = loginRateLimits.get(key);
  const now = Date.now();
  if (record?.lockedUntil && record.lockedUntil > now) {
    const waitMinutes = Math.ceil((record.lockedUntil - now) / 6e4);
    return {
      allowed: false,
      message: `Temporarily locked after repeated failed attempts. Try again in ${waitMinutes} minute(s).`,
      waitMinutes
    };
  }
  return { allowed: true };
}
function recordFailure(key) {
  const record = loginRateLimits.get(key) || { attempts: 0 };
  record.attempts += 1;
  if (record.attempts >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1e3;
    record.attempts = 0;
  }
  loginRateLimits.set(key, record);
}
function resetFailures(key) {
  loginRateLimits.delete(key);
}
function recordAuditLog(log) {
  const logs = readData(K.LOGS, []).slice();
  logs.unshift({
    ...log,
    id: `log-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (logs.length > 5e3) logs.length = 5e3;
  writeData(K.LOGS, logs);
}
function createSession(user, req, method) {
  const ua = String(req.headers["user-agent"] || "Web Browser");
  const now = /* @__PURE__ */ new Date();
  const session = {
    id: `sess-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
    token: crypto.randomBytes(32).toString("hex"),
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    role: user.role,
    permissions: user.permissions,
    device: describeDevice(ua),
    userAgent: ua,
    ip: clientIp(req),
    method,
    signedInAt: now.toISOString(),
    lastActiveAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1e3).toISOString()
  };
  const sessions = getSessions().filter((s) => !s.expiresAt || new Date(s.expiresAt).getTime() > Date.now());
  sessions.push(session);
  saveSessions(sessions);
  user.lastLoginAt = now.toISOString();
  return session;
}
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Authentication token required" });
  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.token === token);
  if (idx === -1) return res.status(401).json({ error: "Session expired or invalidated. Please log in again." });
  const session = sessions[idx];
  if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
    saveSessions(sessions.filter((s) => s.token !== token));
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }
  const user = getUsers().find((u) => u.id === session.userId);
  if (!user || !user.isActive) {
    saveSessions(sessions.filter((s) => s.userId !== session.userId));
    return res.status(401).json({ error: "This account has been disabled." });
  }
  const updated = { ...session, role: user.role, permissions: user.permissions, userName: user.name, lastActiveAt: (/* @__PURE__ */ new Date()).toISOString() };
  if (Date.now() - new Date(session.lastActiveAt).getTime() > 6e4) {
    const copy = sessions.slice();
    copy[idx] = updated;
    saveSessions(copy);
  }
  req.user = updated;
  next();
}
function requireMaster(req, res, next) {
  if (req.user?.role === "master_admin") return next();
  return res.status(403).json({ error: "Only the Master Admin (owner) can do this." });
}
function requireAccess(...areas) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const access = getEffectiveAccess({ role: req.user.role, permissions: req.user.permissions });
    if (areas.some((a) => access.includes(a))) return next();
    return res.status(403).json({ error: "Your account does not have access to this area. Ask the owner to grant access." });
  };
}
function actor(req) {
  const u = req.user;
  return { userId: u.userId, userName: u.userName, userEmail: u.userEmail, userRole: u.role, ipAddress: u.ip };
}
app.get("/api/auth/config", (_req, res) => {
  res.json({
    recaptchaSiteKey: isRecaptchaConfigured() ? process.env.RECAPTCHA_SITE_KEY : null,
    otpEmailEnabled: isEmailConfigured() || !IS_PRODUCTION,
    otpWhatsappEnabled: isWhatsAppConfigured(),
    emailConfigured: isEmailConfigured(),
    storage: storageBackendName()
  });
});
app.get("/api/auth/status", (req, res) => {
  const users = getUsers();
  const token = req.headers["authorization"]?.split(" ")[1];
  const session = token ? getSessions().find((s) => s.token === token) : void 0;
  const user = session ? users.find((u) => u.id === session.userId && u.isActive) : void 0;
  res.json({
    initialized: users.some((u) => u.role === "master_admin"),
    authenticated: Boolean(session && user),
    user: user ? publicUser(user) : null
  });
});
app.post("/api/auth/init-master", (req, res) => {
  const users = getUsers().slice();
  if (users.some((u) => u.role === "master_admin")) {
    return res.status(403).json({ error: "Master Admin has already been set up. Setup is permanently locked." });
  }
  const { email, name, password, phone } = req.body || {};
  if (!email || !name) return res.status(400).json({ error: "Full name and email are required." });
  const pwErr = passwordProblem(password);
  if (pwErr) return res.status(400).json({ error: pwErr });
  const master = {
    id: `usr-master-${Date.now()}`,
    email: String(email).trim().toLowerCase(),
    name: String(name).trim(),
    phone: phone ? String(phone).trim() : void 0,
    passwordHash: "",
    salt: "",
    role: "master_admin",
    permissions: ["all"],
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    isActive: true
  };
  setPassword(master, password);
  users.push(master);
  const session = createSession(master, req, "initial setup");
  saveUsers(users);
  recordAuditLog({
    userId: master.id,
    userName: master.name,
    userEmail: master.email,
    userRole: "master_admin",
    action: "MASTER_ACCOUNT_CREATED",
    category: "security",
    target: master.email,
    details: `Owner (Master Admin) account created and password set for ${master.email}.`,
    ipAddress: session.ip,
    userAgent: session.userAgent,
    subjectUserId: master.id
  });
  res.json({ success: true, token: session.token, user: publicUser(master) });
});
app.post("/api/auth/login", async (req, res) => {
  const ip = clientIp(req);
  const ua = String(req.headers["user-agent"] || "");
  const rate = checkRateLimit(ip);
  if (!rate.allowed) return res.status(429).json({ error: rate.message, waitMinutes: rate.waitMinutes });
  const { email, password, loginType, recaptchaToken } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
  if (loginType === "staff" && !await verifyRecaptcha(recaptchaToken, ip)) {
    return res.status(400).json({ error: `reCAPTCHA verification failed. Please tick "I'm not a robot" again.` });
  }
  const users = getUsers().slice();
  const user = users.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());
  const fail = (reason) => {
    recordFailure(ip);
    recordAuditLog({
      userId: user?.id || "unknown",
      userName: user?.name || "Unknown",
      userEmail: String(email).trim().toLowerCase(),
      userRole: user?.role || "unknown",
      action: "LOGIN_FAILED",
      category: "security",
      target: String(email).trim().toLowerCase(),
      details: `Failed ${loginType === "master" ? "master" : "staff"} sign-in attempt (${reason}).`,
      ipAddress: ip,
      userAgent: ua,
      subjectUserId: user?.id
    });
    return res.status(401).json({ error: "Invalid email or password." });
  };
  if (!user) return fail("unknown email");
  if (!user.isActive) return fail("account disabled");
  if (!verifyPassword(user, String(password))) return fail("wrong password");
  if (loginType === "master" && user.role !== "master_admin") return fail("staff account used on Master tab");
  if (loginType === "staff" && user.role === "master_admin") {
    return res.status(400).json({ error: 'This is the owner account \u2014 please use the "Master Login" tab.' });
  }
  resetFailures(ip);
  const session = createSession(user, req, "password");
  saveUsers(users);
  recordAuditLog({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    action: "LOGIN",
    category: "auth",
    target: "Admin Session",
    details: `${user.name} signed in with password on ${session.device} (IP ${ip}).`,
    ipAddress: ip,
    userAgent: ua,
    subjectUserId: user.id
  });
  res.json({ success: true, token: session.token, user: publicUser(user) });
});
var OTP_TTL_MS = 10 * 60 * 1e3;
function findMasterByIdentifier(identifier) {
  const id = String(identifier || "").trim().toLowerCase();
  const digits = id.replace(/[^0-9]/g, "");
  return getUsers().find(
    (u) => u.role === "master_admin" && u.isActive && (u.email.toLowerCase() === id || digits.length >= 7 && u.phone && u.phone.replace(/[^0-9]/g, "").endsWith(digits.slice(-10)))
  );
}
app.post("/api/auth/otp/request", async (req, res) => {
  const ip = clientIp(req);
  const rate = checkRateLimit(`otp:${ip}`);
  if (!rate.allowed) return res.status(429).json({ error: rate.message });
  const { identifier, purpose = "login", channel = "email" } = req.body || {};
  if (!["login", "reset"].includes(purpose)) return res.status(400).json({ error: "Invalid request." });
  const user = findMasterByIdentifier(identifier);
  const generic = {
    success: true,
    message: "If this is the owner account, a 6-digit code has been sent. It expires in 10 minutes."
  };
  if (!user) {
    recordFailure(`otp:${ip}`);
    return res.json(generic);
  }
  const otps = readData(K.OTPS, {});
  const existing = otps[`${user.id}:${purpose}`];
  if (existing && Date.now() - existing.sentAt < 6e4) {
    return res.status(429).json({ error: "Please wait a minute before requesting another code." });
  }
  const code = String(crypto.randomInt(1e5, 1e6));
  const useWhatsApp = channel === "whatsapp";
  try {
    if (useWhatsApp) {
      if (!user.phone) return res.status(400).json({ error: "No WhatsApp number is saved on the owner account. Add it under My Account first." });
      await sendOtpWhatsApp(user.phone, code);
      generic.sentTo = maskPhone(user.phone);
    } else if (isEmailConfigured()) {
      await sendOtpEmail(user.email, code, purpose);
      generic.sentTo = maskEmail(user.email);
    } else if (!IS_PRODUCTION) {
      console.log(`
[DEV OTP] ${purpose} code for ${user.email}: ${code}
`);
      generic.devNotice = "SMTP is not configured \u2014 in development the code is printed in the server console.";
    } else {
      return res.status(503).json({ error: "Email sending is not configured on the server yet (see SMTP settings in the README)." });
    }
  } catch (err) {
    console.error("[otp] send failed:", err);
    return res.status(502).json({ error: `Could not send the code: ${err.message || "messaging error"}` });
  }
  otps[`${user.id}:${purpose}`] = {
    userId: user.id,
    purpose,
    codeHash: crypto.createHash("sha256").update(code).digest("hex"),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    sentAt: Date.now(),
    channel: useWhatsApp ? "whatsapp" : "email"
  };
  writeData(K.OTPS, { ...otps });
  recordAuditLog({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    action: purpose === "login" ? "LOGIN_CODE_SENT" : "RESET_CODE_SENT",
    category: "security",
    target: user.email,
    details: `${purpose === "login" ? "Sign-in" : "Password reset"} code sent by ${useWhatsApp ? "WhatsApp" : "email"}.`,
    ipAddress: ip,
    subjectUserId: user.id
  });
  res.json(generic);
});
function consumeOtp(user, purpose, code) {
  const otps = { ...readData(K.OTPS, {}) };
  const key = `${user.id}:${purpose}`;
  const rec = otps[key];
  if (!rec || rec.expiresAt < Date.now()) return "The code has expired. Please request a new one.";
  if (rec.attempts >= 5) {
    delete otps[key];
    writeData(K.OTPS, otps);
    return "Too many wrong attempts. Please request a new code.";
  }
  const ok = safeEqual(crypto.createHash("sha256").update(String(code).trim()).digest("hex"), rec.codeHash);
  if (!ok) {
    otps[key] = { ...rec, attempts: rec.attempts + 1 };
    writeData(K.OTPS, otps);
    return "Incorrect code.";
  }
  delete otps[key];
  writeData(K.OTPS, otps);
  return null;
}
app.post("/api/auth/otp/login", (req, res) => {
  const ip = clientIp(req);
  const { identifier, code } = req.body || {};
  const users = getUsers().slice();
  const found = findMasterByIdentifier(identifier);
  const user = found && users.find((u) => u.id === found.id);
  if (!user) return res.status(401).json({ error: "Incorrect or expired code." });
  const err = consumeOtp(user, "login", code);
  if (err) {
    recordAuditLog({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action: "LOGIN_FAILED",
      category: "security",
      target: user.email,
      details: `Failed sign-in with code (${err})`,
      ipAddress: ip,
      subjectUserId: user.id
    });
    return res.status(401).json({ error: err });
  }
  const session = createSession(user, req, "one-time code");
  saveUsers(users);
  recordAuditLog({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    action: "LOGIN",
    category: "auth",
    target: "Admin Session",
    details: `${user.name} signed in with a one-time code on ${session.device} (IP ${ip}).`,
    ipAddress: ip,
    userAgent: session.userAgent,
    subjectUserId: user.id
  });
  res.json({ success: true, token: session.token, user: publicUser(user) });
});
app.post("/api/auth/otp/reset-password", (req, res) => {
  const ip = clientIp(req);
  const { identifier, code, newPassword } = req.body || {};
  const pwErr = passwordProblem(newPassword);
  if (pwErr) return res.status(400).json({ error: pwErr });
  const users = getUsers().slice();
  const found = findMasterByIdentifier(identifier);
  const user = found && users.find((u) => u.id === found.id);
  if (!user) return res.status(401).json({ error: "Incorrect or expired code." });
  const err = consumeOtp(user, "reset", code);
  if (err) return res.status(401).json({ error: err });
  setPassword(user, newPassword);
  saveUsers(users);
  saveSessions(getSessions().filter((s) => s.userId !== user.id));
  recordAuditLog({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    action: "PASSWORD_CHANGED",
    category: "security",
    target: user.email,
    details: "Owner password reset with a one-time code. All sessions were signed out.",
    ipAddress: ip,
    subjectUserId: user.id
  });
  res.json({ success: true, message: "Password updated. Please sign in with your new password." });
});
app.post("/api/auth/password-reset-request", (req, res) => {
  const ip = clientIp(req);
  const rate = checkRateLimit(`reset:${ip}`);
  if (!rate.allowed) return res.status(429).json({ error: rate.message });
  recordFailure(`reset:${ip}`);
  const { email, note } = req.body || {};
  const user = getUsers().find((u) => u.email.toLowerCase() === String(email || "").trim().toLowerCase());
  if (user && user.role !== "master_admin") {
    const list = readData(K.RESET_REQUESTS, []).slice();
    if (!list.some((r) => r.userId === user.id && r.status === "pending")) {
      list.unshift({
        id: `rr-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        note: note ? String(note).slice(0, 300) : void 0,
        requestedAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "pending"
      });
      writeData(K.RESET_REQUESTS, list.slice(0, 200));
      recordAuditLog({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        action: "PASSWORD_RESET_REQUESTED",
        category: "security",
        target: user.email,
        details: `${user.name} asked the owner for a password reset.`,
        ipAddress: ip,
        subjectUserId: user.id
      });
    }
  }
  res.json({ success: true, message: "Your request has been sent to the store owner. They will set a new password for you." });
});
app.get("/api/auth/password-reset-requests", authenticateToken, requireMaster, (_req, res) => {
  res.json({ requests: readData(K.RESET_REQUESTS, []) });
});
app.put("/api/auth/password-reset-requests/:id", authenticateToken, requireMaster, (req, res) => {
  const list = readData(K.RESET_REQUESTS, []).slice();
  const idx = list.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Request not found." });
  list[idx] = {
    ...list[idx],
    status: req.body?.status === "dismissed" ? "dismissed" : "resolved",
    resolvedAt: (/* @__PURE__ */ new Date()).toISOString(),
    resolvedBy: req.user.userName
  };
  writeData(K.RESET_REQUESTS, list);
  res.json({ success: true });
});
app.post("/api/auth/logout", authenticateToken, (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  saveSessions(getSessions().filter((s) => s.token !== token));
  recordAuditLog({
    ...actor(req),
    action: "LOGOUT",
    category: "auth",
    target: "Admin Session",
    details: `${req.user.userName} signed out (${req.user.device}).`,
    subjectUserId: req.user.userId
  });
  res.json({ success: true, message: "Logged out successfully." });
});
app.post("/api/auth/logout-other-devices", authenticateToken, (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const sessions = getSessions();
  const remaining = sessions.filter((s) => s.userId !== req.user.userId || s.token === token);
  const removed = sessions.length - remaining.length;
  saveSessions(remaining);
  recordAuditLog({
    ...actor(req),
    action: "LOGOUT_OTHER_DEVICES",
    category: "auth",
    target: "Active Sessions",
    details: `${req.user.userName} signed out ${removed} other device(s).`,
    subjectUserId: req.user.userId
  });
  res.json({ success: true, message: `Successfully logged out ${removed} other device(s).`, revokedCount: removed });
});
var sessionView = (s, currentToken) => ({
  id: s.id,
  userId: s.userId,
  userName: s.userName,
  userEmail: s.userEmail,
  role: s.role,
  device: s.device,
  ip: s.ip,
  method: s.method,
  signedInAt: s.signedInAt,
  lastActiveAt: s.lastActiveAt,
  isCurrent: s.token === currentToken
});
app.get("/api/auth/active-sessions", authenticateToken, (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const all = req.query.all === "1" && req.user.role === "master_admin";
  const sessions = getSessions().filter((s) => all || s.userId === req.user.userId);
  res.json({ sessions: sessions.map((s) => sessionView(s, token)) });
});
app.delete("/api/auth/sessions/:sessionId", authenticateToken, (req, res) => {
  const isMaster = req.user.role === "master_admin";
  const sessions = getSessions();
  const target = sessions.find((s) => s.id === req.params.sessionId);
  if (!target || !isMaster && target.userId !== req.user.userId) {
    return res.status(404).json({ error: "Session not found." });
  }
  saveSessions(sessions.filter((s) => s.id !== target.id));
  recordAuditLog({
    ...actor(req),
    action: "SESSION_REVOKED",
    category: "security",
    target: target.userEmail,
    details: `${req.user.userName} signed out ${target.userName}'s session on ${target.device}.`,
    subjectUserId: target.userId
  });
  res.json({ success: true, message: "Session revoked." });
});
app.put("/api/auth/me", authenticateToken, (req, res) => {
  const users = getUsers().slice();
  const user = users.find((u) => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found." });
  const { name, phone } = req.body || {};
  if (name) user.name = String(name).trim();
  if (phone !== void 0) user.phone = String(phone).trim() || void 0;
  saveUsers(users);
  recordAuditLog({
    ...actor(req),
    action: "PROFILE_UPDATED",
    category: "users",
    target: user.email,
    details: `${user.name} updated their name / WhatsApp number.`,
    subjectUserId: user.id
  });
  res.json({ success: true, user: publicUser(user) });
});
app.put("/api/auth/me/password", authenticateToken, (req, res) => {
  const users = getUsers().slice();
  const user = users.find((u) => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found." });
  if (user.role !== "master_admin") {
    return res.status(403).json({ error: 'Staff passwords are managed by the owner. Use "Request password change".' });
  }
  const { currentPassword, newPassword } = req.body || {};
  if (!verifyPassword(user, String(currentPassword || ""))) return res.status(401).json({ error: "Current password is incorrect." });
  const pwErr = passwordProblem(newPassword);
  if (pwErr) return res.status(400).json({ error: pwErr });
  setPassword(user, newPassword);
  saveUsers(users);
  recordAuditLog({
    ...actor(req),
    action: "PASSWORD_CHANGED",
    category: "security",
    target: user.email,
    details: `${user.name} changed their own password.`,
    subjectUserId: user.id
  });
  res.json({ success: true });
});
app.get("/api/auth/users", authenticateToken, requireMaster, (_req, res) => {
  res.json({ users: getUsers().map(publicUser) });
});
app.post("/api/auth/users", authenticateToken, requireMaster, (req, res) => {
  const { email, name, password, role, permissions, phone } = req.body || {};
  if (!email || !name || !role) return res.status(400).json({ error: "Email, name and role are required." });
  if (!["admin", "editor", "marketer"].includes(role)) return res.status(400).json({ error: "Role must be admin, editor or marketer." });
  const pwErr = passwordProblem(password);
  if (pwErr) return res.status(400).json({ error: pwErr });
  const users = getUsers().slice();
  if (users.some((u) => u.email.toLowerCase() === String(email).trim().toLowerCase())) {
    return res.status(400).json({ error: "A user with this email address already exists." });
  }
  const newUser = {
    id: `usr-${Date.now()}`,
    email: String(email).trim().toLowerCase(),
    name: String(name).trim(),
    phone: phone ? String(phone).trim() : void 0,
    passwordHash: "",
    salt: "",
    role,
    permissions: Array.isArray(permissions) && permissions.length ? permissions : [role],
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    createdBy: req.user.userName,
    isActive: true
  };
  setPassword(newUser, password);
  users.push(newUser);
  saveUsers(users);
  recordAuditLog({
    ...actor(req),
    action: "USER_CREATED",
    category: "users",
    target: newUser.email,
    details: `Owner created staff account ${newUser.name} (${newUser.role}) and set the initial password. Access: ${getEffectiveAccess(newUser).join(", ")}.`,
    subjectUserId: newUser.id
  });
  res.json({ success: true, user: publicUser(newUser) });
});
app.put("/api/auth/users/:id", authenticateToken, requireMaster, (req, res) => {
  const users = getUsers().slice();
  const target = users.find((u) => u.id === req.params.id);
  if (!target) return res.status(404).json({ error: "User not found." });
  if (target.role === "master_admin" && target.id !== req.user.userId) {
    return res.status(403).json({ error: "Cannot modify another Master Admin account." });
  }
  const { name, role, permissions, isActive, password, phone } = req.body || {};
  const changes = [];
  if (name && name !== target.name) {
    changes.push(`name \u2192 ${name}`);
    target.name = String(name).trim();
  }
  if (phone !== void 0 && phone !== target.phone) {
    changes.push("WhatsApp number");
    target.phone = String(phone).trim() || void 0;
  }
  if (role && target.role !== "master_admin" && role !== target.role) {
    changes.push(`role ${target.role} \u2192 ${role}`);
    target.role = role;
  }
  if (Array.isArray(permissions) && target.role !== "master_admin") {
    changes.push("access areas");
    target.permissions = permissions;
  }
  if (typeof isActive === "boolean" && target.role !== "master_admin" && isActive !== target.isActive) {
    changes.push(isActive ? "enabled" : "disabled");
    target.isActive = isActive;
    if (!isActive) saveSessions(getSessions().filter((s) => s.userId !== target.id));
  }
  saveUsers(users);
  if (password) {
    const pwErr = passwordProblem(password);
    if (pwErr) return res.status(400).json({ error: pwErr });
    setPassword(target, password);
    saveUsers(users);
    saveSessions(getSessions().filter((s) => s.userId !== target.id || target.id === req.user.userId));
    recordAuditLog({
      ...actor(req),
      action: "PASSWORD_CHANGED",
      category: "security",
      target: target.email,
      details: `Owner set a new password for ${target.name}. Their other sessions were signed out.`,
      subjectUserId: target.id
    });
    const rr = readData(K.RESET_REQUESTS, []).map(
      (r) => r.userId === target.id && r.status === "pending" ? { ...r, status: "resolved", resolvedAt: (/* @__PURE__ */ new Date()).toISOString(), resolvedBy: req.user.userName } : r
    );
    writeData(K.RESET_REQUESTS, rr);
  }
  if (changes.length) {
    recordAuditLog({
      ...actor(req),
      action: "USER_UPDATED",
      category: "users",
      target: target.email,
      details: `Owner updated ${target.name}: ${changes.join(", ")}.`,
      subjectUserId: target.id
    });
  }
  res.json({ success: true, message: "User updated successfully.", user: publicUser(target) });
});
app.delete("/api/auth/users/:id", authenticateToken, requireMaster, (req, res) => {
  const users = getUsers();
  const target = users.find((u) => u.id === req.params.id);
  if (!target) return res.status(404).json({ error: "User not found." });
  if (target.role === "master_admin") return res.status(403).json({ error: "Cannot delete the Master Admin account." });
  saveUsers(users.filter((u) => u.id !== target.id));
  saveSessions(getSessions().filter((s) => s.userId !== target.id));
  recordAuditLog({
    ...actor(req),
    action: "USER_DELETED",
    category: "users",
    target: target.email,
    details: `Owner deleted staff account ${target.name} (${target.role}).`,
    subjectUserId: target.id
  });
  res.json({ success: true, message: "User deleted successfully." });
});
app.get("/api/auth/users/:id/history", authenticateToken, requireMaster, (req, res) => {
  const id = req.params.id;
  const logs = readData(K.LOGS, []).filter((l) => l.subjectUserId === id || l.userId === id);
  const sessions = getSessions().filter((s) => s.userId === id).map((s) => sessionView(s));
  res.json({ logs: logs.slice(0, 300), sessions });
});
app.get("/api/audit-logs", authenticateToken, (req, res) => {
  const access = getEffectiveAccess({ role: req.user.role, permissions: req.user.permissions });
  const canSeeAll = req.user.role === "master_admin" || access.includes("audit");
  let logs = readData(K.LOGS, []);
  if (!canSeeAll || req.query.mine === "1") logs = logs.filter((l) => l.userId === req.user.userId);
  if (req.user.role !== "master_admin") logs = logs.filter((l) => l.category !== "security" || l.userId === req.user.userId);
  const { page = "1", limit = "20", search, category, action, scope } = req.query;
  if (category && category !== "all") logs = logs.filter((l) => l.category === category);
  if (action && action !== "all") logs = logs.filter((l) => l.action === action);
  if (scope === "store") logs = logs.filter((l) => ["products", "categories", "design", "settings", "content", "orders"].includes(l.category));
  if (scope === "technical") logs = logs.filter((l) => ["auth", "security", "users", "system"].includes(l.category));
  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter(
      (l) => [l.target, l.details, l.userName, l.userEmail, l.action].some((v) => (v || "").toLowerCase().includes(q))
    );
  }
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(500, Math.max(1, parseInt(limit, 10) || 20));
  res.json({
    logs: logs.slice((pageNum - 1) * limitNum, pageNum * limitNum),
    total: logs.length,
    page: pageNum,
    totalPages: Math.max(1, Math.ceil(logs.length / limitNum))
  });
});
app.get("/api/audit-logs/export", authenticateToken, requireAccess("audit"), (_req, res) => {
  const logs = readData(K.LOGS, []);
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = ["Timestamp", "User", "Email", "Role", "Category", "Action", "Target", "Details", "IP Address"];
  const rows = logs.map((l) => [l.timestamp, l.userName, l.userEmail, l.userRole, l.category, l.action, l.target, l.details, l.ipAddress].map(esc));
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="plush-comfort-audit-logs-${Date.now()}.csv"`);
  res.send([header.join(","), ...rows.map((r) => r.join(","))].join("\n"));
});
app.post("/api/audit-logs", authenticateToken, (req, res) => {
  const { action, category, target, details, beforeAfter } = req.body || {};
  if (!action || !category || !target || !details) {
    return res.status(400).json({ error: "Action, category, target, and details are required." });
  }
  if (category === "security") return res.status(400).json({ error: "Security events are recorded by the server only." });
  recordAuditLog({ ...actor(req), action, category, target, details, beforeAfter, userAgent: String(req.headers["user-agent"] || "") });
  res.json({ success: true });
});
app.post("/api/upload", authenticateToken, (req, res) => {
  const { data, filename, alt } = req.body || {};
  if (!data || !filename) return res.status(400).json({ error: "Base64 data and filename are required." });
  const matches = String(data).match(/^data:(image|video)\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!matches) return res.status(400).json({ error: "Invalid file data format." });
  const kind = matches[1];
  const allowed = kind === "image" ? ["webp", "jpeg", "jpg", "png", "gif", "svg+xml", "avif"] : ["mp4", "webm"];
  if (!allowed.includes(matches[2])) return res.status(400).json({ error: `File type ${matches[2]} is not allowed.` });
  const ext = matches[2].replace("jpeg", "jpg").replace("svg+xml", "svg");
  const buffer = Buffer.from(matches[3], "base64");
  const maxBytes = kind === "video" ? 20 * 1024 * 1024 : 2 * 1024 * 1024;
  if (buffer.length > maxBytes) return res.status(413).json({ error: `File is too large (max ${maxBytes / 1024 / 1024} MB).` });
  const cleanName = String(filename).toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-").slice(0, 80);
  const finalFilename = `${cleanName}-${Date.now()}.${ext}`;
  fs2.writeFileSync(path2.join(UPLOADS_DIR, finalFilename), buffer);
  recordAuditLog({
    ...actor(req),
    action: kind === "video" ? "VIDEO_UPLOAD" : "IMAGE_UPLOAD",
    category: "design",
    target: finalFilename,
    details: `Uploaded ${finalFilename} (${Math.round(buffer.length / 1024)} KB)${alt ? ` \u2014 alt: "${alt}"` : ""}`
  });
  res.json({ success: true, url: `/uploads/${finalFilename}`, filename: finalFilename, size: buffer.length, alt: alt || "" });
});
function summarise(prevList, nextList, label) {
  const prev = new Map((prevList || []).map((x) => [x.id, x]));
  const next = new Map(nextList.map((x) => [x.id, x]));
  const added = nextList.filter((x) => !prev.has(x.id)).map(label);
  const removed = (prevList || []).filter((x) => !next.has(x.id)).map(label);
  const changed = nextList.filter((x) => prev.has(x.id) && JSON.stringify(prev.get(x.id)) !== JSON.stringify(x)).map(label);
  const parts = [];
  if (added.length) parts.push(`added ${added.slice(0, 5).join(", ")}`);
  if (changed.length) parts.push(`updated ${changed.slice(0, 5).join(", ")}${changed.length > 5 ? ` +${changed.length - 5} more` : ""}`);
  if (removed.length) parts.push(`deleted ${removed.slice(0, 5).join(", ")}`);
  return parts.join("; ") || "no visible changes";
}
app.get("/api/store/design", (_req, res) => {
  res.json({ design: readData(K.DESIGN, null) });
});
app.put("/api/store/design", authenticateToken, requireAccess("design", "settings"), (req, res) => {
  const prev = readData(K.DESIGN, null) || {};
  const next = req.body || {};
  writeData(K.DESIGN, next);
  const changedKeys = Object.keys(next).filter((k) => JSON.stringify(prev[k]) !== JSON.stringify(next[k]));
  recordAuditLog({
    ...actor(req),
    action: "STORE_DESIGN_UPDATED",
    category: "design",
    target: "Store Design & Settings",
    details: `${req.user.userName} updated: ${changedKeys.join(", ") || "no visible changes"}.`
  });
  res.json({ success: true, message: "Store design updated and persisted." });
});
app.get("/api/store/products", (_req, res) => {
  res.json({ products: readData(K.PRODUCTS, null) });
});
app.post("/api/store/products", authenticateToken, requireAccess("products", "orders"), (req, res) => {
  const { products, changeSummary } = req.body || {};
  if (!Array.isArray(products)) return res.status(400).json({ error: "Products array required." });
  const prev = readData(K.PRODUCTS, null) || INITIAL_PRODUCTS;
  writeData(K.PRODUCTS, products);
  recordAuditLog({
    ...actor(req),
    action: "PRODUCTS_SAVED",
    category: "products",
    target: `Catalogue (${products.length} products)`,
    details: changeSummary || `${req.user.userName}: ${summarise(prev, products, (p) => p.name)}.`
  });
  res.json({ success: true, message: "Products persisted." });
});
app.get("/api/store/categories", (_req, res) => {
  res.json({ categories: readData(K.CATEGORIES, null) });
});
app.post("/api/store/categories", authenticateToken, requireAccess("categories"), (req, res) => {
  const { categories, changeSummary } = req.body || {};
  if (!Array.isArray(categories)) return res.status(400).json({ error: "Categories array required." });
  const prev = readData(K.CATEGORIES, null) || INITIAL_CATEGORIES;
  writeData(K.CATEGORIES, categories);
  recordAuditLog({
    ...actor(req),
    action: "CATEGORIES_SAVED",
    category: "categories",
    target: `Categories (${categories.length})`,
    details: changeSummary || `${req.user.userName}: ${summarise(prev, categories, (c) => c.name)}.`
  });
  res.json({ success: true, message: "Categories persisted." });
});
app.get("/api/store/blogs", (_req, res) => {
  res.json({ blogs: readData(K.BLOGS, null) });
});
app.post("/api/store/blogs", authenticateToken, requireAccess("content"), (req, res) => {
  const { blogs, changeSummary } = req.body || {};
  if (!Array.isArray(blogs)) return res.status(400).json({ error: "Blogs array required." });
  const prev = readData(K.BLOGS, null) || INITIAL_BLOG_POSTS;
  writeData(K.BLOGS, blogs);
  recordAuditLog({
    ...actor(req),
    action: "CONTENT_SAVED",
    category: "content",
    target: `Blogs & Guides (${blogs.length})`,
    details: changeSummary || `${req.user.userName}: ${summarise(prev, blogs, (b) => b.title)}.`
  });
  res.json({ success: true });
});
function getOrders() {
  return readData(K.ORDERS, null) || INITIAL_ORDERS;
}
app.post("/api/orders", (req, res) => {
  const ip = clientIp(req);
  const rate = checkRateLimit(`order:${ip}`);
  if (!rate.allowed) return res.status(429).json({ error: rate.message });
  const order = req.body?.order;
  if (!order || !Array.isArray(order.items) || order.items.length === 0 || !order.customer?.email) {
    return res.status(400).json({ error: "Invalid order." });
  }
  const products = getCurrentProducts();
  const settings = getCurrentSettings();
  let subtotal = 0;
  if (order.items.some((it) => !products.some((x) => x.id === it.productId))) {
    return res.status(400).json({ error: "One of the products in your basket is no longer available." });
  }
  const items = order.items.map((it) => {
    const p = products.find((x) => x.id === it.productId);
    const v = it.variationId ? p.variations?.find((x) => x.id === it.variationId) : void 0;
    const unit = v ? v.salePrice ?? v.price : p.salePrice ?? p.price;
    const qty = Math.max(1, Math.min(20, Number(it.quantity) || 1));
    subtotal += unit * qty;
    return { ...it, name: p.name, sku: v?.sku || p.sku, price: unit, quantity: qty };
  });
  const deliveryFee = order.deliveryOption === "white_glove" ? settings.whiteGloveDeliveryFee : subtotal >= settings.freeDeliveryThreshold ? 0 : settings.standardDeliveryFee;
  const discountAmount = order.promoCode?.trim().toUpperCase() === "PLUSH10" ? Math.round(subtotal * 10) / 100 : 0;
  const saved = {
    ...order,
    items,
    subtotal,
    deliveryFee,
    discountAmount,
    total: Math.max(0, subtotal - discountAmount + deliveryFee),
    paymentStatus: order.paymentMethod === "cod" ? "pending" : order.paymentStatus,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  writeData(K.ORDERS, [saved, ...getOrders().filter((o) => o.id !== saved.id)]);
  const updatedProducts = products.map((p) => {
    const lines = items.filter((i) => i.productId === p.id);
    if (!lines.length) return p;
    const qty = lines.reduce((a, i) => a + i.quantity, 0);
    return {
      ...p,
      stock: Math.max(0, p.stock - qty),
      variations: p.variations?.map((v) => {
        const vq = lines.filter((i) => i.variationId === v.id).reduce((a, i) => a + i.quantity, 0);
        return vq ? { ...v, stock: Math.max(0, v.stock - vq) } : v;
      })
    };
  });
  writeData(K.PRODUCTS, updatedProducts);
  recordAuditLog({
    userId: "customer",
    userName: saved.customer.fullName,
    userEmail: saved.customer.email,
    userRole: "customer",
    action: "ORDER_PLACED",
    category: "orders",
    target: saved.orderNumber,
    details: `New order ${saved.orderNumber} \u2014 \xA3${saved.total.toFixed(2)} (${items.length} line(s), ${saved.paymentMethod.toUpperCase()}).`,
    ipAddress: ip
  });
  res.json({ success: true, order: saved });
});
app.get("/api/orders", authenticateToken, requireAccess("orders", "overview"), (req, res) => {
  const access = getEffectiveAccess({ role: req.user.role, permissions: req.user.permissions });
  const orders = getOrders();
  if (req.user.role === "master_admin" || access.includes("orders")) return res.json({ orders });
  res.json({ orders: orders.map((o) => ({ ...o, customer: { ...o.customer, email: "", phone: "", addressLine1: "", addressLine2: "" } })) });
});
app.put("/api/orders/:id", authenticateToken, requireAccess("orders"), (req, res) => {
  const orders = getOrders().slice();
  const idx = orders.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Order not found." });
  const prev = orders[idx];
  const next = { ...prev, ...req.body, id: prev.id, orderNumber: prev.orderNumber };
  orders[idx] = next;
  writeData(K.ORDERS, orders);
  recordAuditLog({
    ...actor(req),
    action: "ORDER_UPDATED",
    category: "orders",
    target: prev.orderNumber,
    details: `${req.user.userName} changed ${prev.orderNumber}: ${prev.fulfilmentStatus} \u2192 ${next.fulfilmentStatus}.`,
    beforeAfter: { fulfilmentStatus: { before: prev.fulfilmentStatus, after: next.fulfilmentStatus } }
  });
  res.json({ success: true, order: next });
});
function getCurrentProducts() {
  const list = readData(K.PRODUCTS, null);
  return Array.isArray(list) && list.length ? list : INITIAL_PRODUCTS;
}
function getCurrentCategories() {
  const list = readData(K.CATEGORIES, null);
  return Array.isArray(list) && list.length ? list : INITIAL_CATEGORIES;
}
function getCurrentBlogPosts() {
  const list = readData(K.BLOGS, null);
  return Array.isArray(list) && list.length ? list : INITIAL_BLOG_POSTS;
}
function getCurrentSettings() {
  return { ...INITIAL_SETTINGS, ...readData(K.DESIGN, null) || {} };
}
app.get("/sitemap.xml", (_req, res) => {
  try {
    const xml = generateXmlSitemap(getCurrentProducts(), getCurrentCategories(), getCurrentBlogPosts(), SITE_URL);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.status(200).send(xml);
  } catch (err) {
    console.error("Error generating sitemap.xml:", err);
    res.status(500).send("Error generating sitemap");
  }
});
app.get("/robots.txt", (_req, res) => {
  try {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.status(200).send(generateRobotsTxt(SITE_URL));
  } catch {
    res.status(500).send("User-agent: *\nAllow: /\n");
  }
});
app.get("/api/seo/audit", (_req, res) => {
  try {
    res.json({ success: true, audit: runSeoAudit(getCurrentProducts(), getCurrentCategories(), getCurrentBlogPosts()) });
  } catch {
    res.status(500).json({ error: "Failed to run SEO audit" });
  }
});
app.post("/api/seo/auto-fix", authenticateToken, requireAccess("products", "categories"), (req, res) => {
  try {
    const { updatedProducts, updatedCategories, fixCount } = autoFixMissingSeo(getCurrentProducts(), getCurrentCategories());
    writeData(K.PRODUCTS, updatedProducts);
    writeData(K.CATEGORIES, updatedCategories);
    recordAuditLog({
      ...actor(req),
      action: "SEO_METADATA_AUTO_FIXED",
      category: "settings",
      target: `Storewide SEO (${fixCount} fields)`,
      details: `${req.user.userName} auto-generated SEO titles, descriptions and alt texts for ${fixCount} missing fields.`
    });
    res.json({ success: true, fixCount, message: `Applied SEO fixes to ${fixCount} items.` });
  } catch {
    res.status(500).json({ error: "Failed to auto-fix SEO fields" });
  }
});
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, storage: storageBackendName(), time: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get(/^\/(uploads|assets\/brand)\/.+\.(jpe?g|png)$/i, (req, res, next) => {
  const webpPath = req.path.replace(/\.(jpe?g|png)$/i, ".webp");
  const candidates = [
    path2.join(UPLOADS_DIR, webpPath.replace(/^\/uploads\//, "")),
    path2.resolve(__dirname, "public", webpPath.slice(1)),
    path2.resolve(__dirname, "dist", webpPath.slice(1))
  ];
  if (candidates.some((c) => fs2.existsSync(c))) return res.redirect(301, webpPath);
  next();
});
app.use("/uploads", express.static(UPLOADS_DIR, { maxAge: "30d", fallthrough: true }));
async function startServer() {
  await dataReady;
  let vite = null;
  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import("vite");
    vite = await createViteServer({ server: { middlewareMode: true }, appType: "custom" });
    app.use(vite.middlewares);
  } else {
    app.use("/assets", express.static(path2.resolve(__dirname, "dist", "assets"), { maxAge: "1y", immutable: true }));
    app.use(express.static(path2.resolve(__dirname, "dist"), { index: false, redirect: false, maxAge: "1d" }));
  }
  app.get("*", async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith("/api/") || url.startsWith("/@") || path2.extname(req.path)) return next();
    try {
      const settings = getCurrentSettings();
      const seoData = generateSeoDataForRoute(req.path, getCurrentProducts(), getCurrentCategories(), getCurrentBlogPosts(), settings);
      let ssr;
      if (!req.path.startsWith("/admin") && process.env.DISABLE_SSR !== "true") {
        try {
          const mod = vite ? await vite.ssrLoadModule("/src/entry-server.tsx") : await import(pathToFileURL(path2.resolve(__dirname, "dist-server", "entry-server.js")).href);
          const bootData = {
            products: readData(K.PRODUCTS, null),
            categories: readData(K.CATEGORIES, null),
            blogs: readData(K.BLOGS, null),
            design: readData(K.DESIGN, null)
          };
          const hasLive = Object.values(bootData).some((v) => v);
          ssr = {
            appHtml: await mod.render(req.originalUrl, bootData),
            bootJson: hasLive ? JSON.stringify(bootData) : void 0
          };
        } catch (ssrErr) {
          console.warn("[ssr] falling back to client rendering for", url, ssrErr);
        }
      }
      let template = "";
      if (vite) {
        template = await vite.transformIndexHtml(url, fs2.readFileSync(path2.resolve(__dirname, "index.html"), "utf-8"));
      } else {
        const distIndex = path2.resolve(__dirname, "dist", "index.html");
        template = fs2.readFileSync(fs2.existsSync(distIndex) ? distIndex : path2.resolve(__dirname, "index.html"), "utf-8");
      }
      res.status(seoData.statusCode).setHeader("Content-Type", "text/html; charset=utf-8").setHeader("Cache-Control", "no-cache").send(injectSeoIntoHtml(template, seoData, settings, ssr));
    } catch (err) {
      console.error("Error rendering SEO HTML for route:", url, err);
      if (vite) vite.ssrFixStacktrace(err);
      res.status(500).send("Server Error rendering page");
    }
  });
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`[Plush Comfort] Server running on http://0.0.0.0:${PORT} (storage: ${storageBackendName()})`);
  });
}
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer().catch((err) => console.error("Failed to start server:", err));
}
var server_default = app;

// serverless/vercel-entry.ts
var vercel_entry_default = server_default;
export {
  vercel_entry_default as default
};
