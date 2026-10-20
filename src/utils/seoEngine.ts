import { Product, Category, BlogPost, StoreSettings, SeoAuditReport } from '../types';

export interface RouteSeoResult {
  statusCode: number;
  title: string;
  description: string;
  canonicalUrl: string;
  robots: string;
  h1: string;
  openGraph: {
    title: string;
    description: string;
    image: string;
    url: string;
    type: string;
    siteName: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image: string;
  };
  schemas: any[];
  semanticHtml: string;
}

const DEFAULT_ORIGIN = 'https://plushcomfort.uk';
const DEFAULT_BRAND = 'Plush Comfort UK';
const DEFAULT_LOGO = 'https://plushcomfort.uk/logo.webp';

export function cleanUrl(path: string): string {
  const p = path.split('?')[0].split('#')[0];
  return p.replace(/\/+$/, '') || '/';
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateSeoDataForRoute(
  rawPath: string,
  products: Product[],
  categories: Category[],
  blogPosts: BlogPost[],
  settings?: StoreSettings
): RouteSeoResult {
  const path = cleanUrl(rawPath);
  const origin = DEFAULT_ORIGIN;
  const brandName = settings?.brandName || DEFAULT_BRAND;
  const abs = (src?: string) => (!src ? '' : src.startsWith('http') ? src : `${origin}${src.startsWith('/') ? '' : '/'}${src}`);
  // Default social image: Dashboard → Settings & Global SEO → Default social share image (falls back to logo)
  const defaultImage = abs(settings?.defaultOgImage) || abs(settings?.logoUrl) || DEFAULT_LOGO;
  const f = settings?.footerDesign;
  const sameAs = [f?.socialFacebook, f?.socialInstagram, f?.socialTiktok, f?.socialYoutube, f?.socialPinterest, f?.socialLinkedin].filter(
    (x): x is string => Boolean(x && x.trim())
  );

  // 1. Core Organization Schema (online store — no physical shop address)
  const organizationSchema: any = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brandName,
    url: origin,
    logo: abs(settings?.logoUrl) || DEFAULT_LOGO,
    description: 'UK online furniture store selling luxury sofas, corner sofas, beds and ottoman beds with free UK mainland delivery and cash on delivery.',
    email: settings?.email || 'plushcomfort@gmail.com',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings?.phone || '+44 7923 119077',
      contactType: 'customer service',
      areaServed: 'GB',
      availableLanguage: ['en'],
    },
    ...(sameAs.length ? { sameAs } : {}),
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: brandName,
    url: origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${origin}/shop?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  // ROUTE 1: HOMEPAGE (/)
  if (path === '/') {
    const title = 'Plush Comfort UK | Luxury Sofas, Corner Sofas & Beds Online';
    const description =
      settings?.defaultMetaDescription ||
      'Shop luxury sofas, corner sofas, Chesterfields and ottoman beds online. Free UK mainland delivery, 1 year warranty, 30-day exchange or return and cash on delivery.';
    const canonical = `${origin}/`;
    const heroImage = abs(settings?.defaultOgImage) || `${origin}/uploads/products/lilly-corner-sofa-luxury-plush-fabric-with-bolster-cushions-1.webp`;

    const categoryLinksHtml = categories
      .filter((c) => c.isActive)
      .map(
        (c) => `<li><a href="/category/${c.slug}" title="${escapeHtml(c.name)}">${escapeHtml(c.name)}</a></li>`
      )
      .join('\n');

    const featuredProductsHtml = products
      .filter((p) => p.isPublished && p.isFeatured)
      .slice(0, 6)
      .map(
        (p) => `
        <article class="featured-product" itemscope itemtype="https://schema.org/Product">
          <a href="/product/${p.slug}">
            <h3 itemprop="name">${escapeHtml(p.name)}</h3>
            <p itemprop="description">${escapeHtml(p.shortDescription)}</p>
            <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
              <span itemprop="priceCurrency" content="GBP">£</span>
              <span itemprop="price">${(p.salePrice ?? p.price).toFixed(2)}</span>
            </div>
          </a>
        </article>`
      )
      .join('\n');

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
        <h1>${escapeHtml(settings?.heroDesign?.heading || 'Luxury Sofas & Beds, Delivered Across the UK')}</h1>
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
      robots: 'index, follow',
      h1: settings?.heroDesign?.heading || 'Luxury Sofas & Beds, Delivered Across the UK',
      openGraph: {
        title,
        description,
        image: heroImage,
        url: canonical,
        type: 'website',
        siteName: brandName,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        image: heroImage,
      },
      schemas: [organizationSchema, webSiteSchema],
      semanticHtml,
    };
  }

  // ROUTE 2: PRODUCT PAGE (/product/:slug)
  if (path.startsWith('/product/')) {
    const slug = path.replace('/product/', '').trim();
    const product = products.find((p) => p.slug === slug);

    if (!product || !product.isPublished) {
      return {
        statusCode: 404,
        title: 'Furniture Piece Not Found | Plush Comfort UK',
        description: 'The requested handcrafted furniture piece could not be found or has been moved.',
        canonicalUrl: `${origin}${path}`,
        robots: 'noindex, follow',
        h1: 'Furniture Piece Not Found',
        openGraph: {
          title: 'Furniture Piece Not Found | Plush Comfort UK',
          description: 'The requested piece could not be found.',
          image: DEFAULT_LOGO,
          url: `${origin}${path}`,
          type: 'website',
          siteName: brandName,
        },
        twitter: {
          card: 'summary',
          title: 'Furniture Piece Not Found',
          description: 'Piece not found',
          image: DEFAULT_LOGO,
        },
        schemas: [organizationSchema],
        semanticHtml: `
          <main>
            <h1>Furniture Piece Not Found</h1>
            <p>The requested product may have been moved or updated.</p>
            <p><a href="/shop">Browse All Handcrafted Furniture</a> | <a href="/category/sofas">Explore Luxury Sofas</a></p>
          </main>
        `,
      };
    }

    const category = categories.find((c) => c.id === product.categoryId);
    const title =
      product.seoTitle ||
      `${product.name} | Handcrafted British ${category?.name || 'Furniture'} | Plush Comfort UK`;
    const description =
      product.seoDescription ||
      product.shortDescription ||
      `Buy the ${product.name} online at Plush Comfort UK. Free UK mainland delivery, 1 year warranty and cash on delivery.`;
    const canonical = product.canonicalUrl || `${origin}/product/${product.slug}`;
    const robots = product.robotsIndexing || 'index, follow';
    // Social image: product SEO image → featured image → global default
    const mainImage = abs(product.ogImage) || abs(product.images[0]) || defaultImage;

    const currentPrice = product.salePrice ?? product.price;

    // Build Product Schema
    const productSchema: any = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      image: product.images.map((img) => (img.startsWith('http') ? img : `${origin}${img}`)),
      description: product.seoDescription || product.shortDescription,
      sku: product.sku,
      mpn: product.sku,
      brand: {
        '@type': 'Brand',
        name: brandName,
      },
      offers: {
        '@type': 'Offer',
        url: canonical,
        priceCurrency: 'GBP',
        price: currentPrice,
        priceValidUntil: '2027-12-31',
        itemCondition: 'https://schema.org/NewCondition',
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
        seller: {
          '@type': 'Organization',
          name: brandName,
        },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'GB',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 30,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: 0,
            currency: 'GBP',
          },
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'GB',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 3,
              unitCode: 'd',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 3,
              maxValue: 7,
              unitCode: 'd',
            },
          },
        },
      },
    };
    // Only publish star ratings that come from real reviews (Google policy)
    if (product.reviewCount > 0 && product.rating > 0) {
      productSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: '5',
        worstRating: '1',
      };
    }

    // Breadcrumbs Schema
    const breadcrumbSchema = {
      '@context': 'https://schema.org/',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${origin}/`,
        },
        ...(category
          ? [
              {
                '@type': 'ListItem',
                position: 2,
                name: category.name,
                item: `${origin}/category/${category.slug}`,
              },
            ]
          : []),
        {
          '@type': 'ListItem',
          position: category ? 3 : 2,
          name: product.name,
          item: canonical,
        },
      ],
    };

    // Related Products HTML
    const relatedHtml = products
      .filter((p) => p.isPublished && product.relatedProductIds.includes(p.id))
      .slice(0, 4)
      .map(
        (p) => `<li><a href="/product/${p.slug}">${escapeHtml(p.name)} - £${(p.salePrice ?? p.price).toFixed(2)}</a></li>`
      )
      .join('\n');

    const semanticHtml = `
      <nav aria-label="Breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          ${category ? `<li><a href="/category/${category.slug}">${escapeHtml(category.name)}</a></li>` : ''}
          <li aria-current="page">${escapeHtml(product.name)}</li>
        </ol>
      </nav>
      <article itemscope itemtype="https://schema.org/Product">
        <header>
          <h1 itemprop="name">${escapeHtml(product.name)}</h1>
          <p class="sku">SKU: <span itemprop="sku">${escapeHtml(product.sku)}</span></p>
          <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
            <span itemprop="priceCurrency" content="GBP">£</span>
            <span itemprop="price" content="${currentPrice.toFixed(2)}">${currentPrice.toFixed(2)}</span>
            <link itemprop="availability" href="${product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder'}" />
            <p>Status: ${product.stock > 0 ? `In Stock (${product.stock} units available)` : 'Made to order'}</p>
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
              ${product.dimensions.seatHeight ? `<tr><th>Seat Height</th><td>${product.dimensions.seatHeight} cm</td></tr>` : ''}
              <tr><th>Materials</th><td>${escapeHtml(product.materials.join(', '))}</td></tr>
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
        type: 'product',
        siteName: brandName,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        image: mainImage,
      },
      schemas: [organizationSchema, productSchema, breadcrumbSchema],
      semanticHtml,
    };
  }

  // ROUTE 3: CATEGORY PAGE (/category/:slug or /category/:catSlug/:subcatSlug)
  if (path.startsWith('/category/')) {
    const parts = path.replace('/category/', '').split('/');
    const catSlug = parts[0];
    const subcatSlug = parts[1];

    const category = categories.find(
      (c) => c.slug === catSlug || (catSlug === 'beds' && c.slug === 'beds-bed-frames')
    );

    if (!category || !category.isActive) {
      return {
        statusCode: 404,
        title: 'Category Not Found | Plush Comfort UK',
        description: 'The requested furniture collection could not be found.',
        canonicalUrl: `${origin}${path}`,
        robots: 'noindex, follow',
        h1: 'Category Not Found',
        openGraph: {
          title: 'Category Not Found | Plush Comfort UK',
          description: 'The requested category could not be found.',
          image: DEFAULT_LOGO,
          url: `${origin}${path}`,
          type: 'website',
          siteName: brandName,
        },
        twitter: { card: 'summary', title: 'Category Not Found', description: 'Not found', image: DEFAULT_LOGO },
        schemas: [organizationSchema],
        semanticHtml: `
          <main>
            <h1>Category Not Found</h1>
            <p>The requested furniture category is not available.</p>
            <p><a href="/shop">Browse All Collections</a></p>
          </main>
        `,
      };
    }

    const subcategory = subcatSlug
      ? category.subcategories?.find((s) => s.slug === subcatSlug)
      : undefined;

    const title = subcategory
      ? `${subcategory.name} | Handcrafted ${category.name} | Plush Comfort UK`
      : category.seoTitle || `${category.name} UK | Luxury Handcrafted Furniture | Plush Comfort`;

    const description =
      category.seoDescription ||
      category.description ||
      `Shop ${category.name} online at Plush Comfort UK. Free UK mainland delivery, 1 year warranty and cash on delivery.`;

    const canonical = subcategory
      ? `${origin}/category/${category.slug}/${subcategory.slug}`
      : category.canonicalUrl || `${origin}/category/${category.slug}`;

    const robots = category.robotsIndexing || 'index, follow';
    const ogImage = abs(category.ogImage) || abs(category.bannerImage || category.image) || defaultImage;

    // Filter matching products
    const matchingProducts = products.filter((p) => {
      if (!p.isPublished) return false;
      if (p.categoryId === category.id) return true;
      if (category.slug === 'sofas' && (p.categoryId.includes('sofa') || p.categoryId === 'cat-armchairs')) return true;
      if ((category.slug === 'beds-bed-frames' || category.slug === 'beds') && (p.categoryId.includes('bed') || p.categoryId === 'cat-mattresses')) return true;
      return false;
    });

    const productsHtml = matchingProducts
      .map(
        (p) => `
        <article class="category-product-card" itemscope itemtype="https://schema.org/Product">
          <a href="/product/${p.slug}">
            <h3 itemprop="name">${escapeHtml(p.name)}</h3>
            <p>From £${(p.salePrice ?? p.price).toFixed(2)}</p>
            <p itemprop="description">${escapeHtml(p.shortDescription)}</p>
          </a>
        </article>`
      )
      .join('\n');

    const subcatLinksHtml = (category.subcategories || [])
      .map((s) => `<li><a href="/category/${category.slug}/${s.slug}">${escapeHtml(s.name)}</a></li>`)
      .join('\n');

    const breadcrumbSchema = {
      '@context': 'https://schema.org/',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${origin}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: category.name,
          item: `${origin}/category/${category.slug}`,
        },
        ...(subcategory
          ? [
              {
                '@type': 'ListItem',
                position: 3,
                name: subcategory.name,
                item: canonical,
              },
            ]
          : []),
      ],
    };

    const collectionSchema = {
      '@context': 'https://schema.org/',
      '@type': 'CollectionPage',
      name: subcategory ? `${subcategory.name} - ${category.name}` : category.name,
      description,
      url: canonical,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: matchingProducts.map((p, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `${origin}/product/${p.slug}`,
          name: p.name,
        })),
      },
    };

    const semanticHtml = `
      <nav aria-label="Breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          <li><a href="/category/${category.slug}">${escapeHtml(category.name)}</a></li>
          ${subcategory ? `<li aria-current="page">${escapeHtml(subcategory.name)}</li>` : ''}
        </ol>
      </nav>
      <header>
        <h1>${escapeHtml(subcategory ? `${subcategory.name} - Handcrafted ${category.name}` : category.name)}</h1>
        <p>${escapeHtml(category.description)}</p>
      </header>
      ${subcatLinksHtml ? `<nav aria-label="Subcategories"><ul>${subcatLinksHtml}</ul></nav>` : ''}
      <main>
        <section aria-label="Products">
          <div class="products-grid">${productsHtml}</div>
        </section>
        ${category.bottomSeoDescription ? `
        <section class="editorial-guide">
          <h2>${escapeHtml(category.name)} Buying Guide</h2>
          <p>${escapeHtml(category.bottomSeoDescription)}</p>
        </section>` : ''}
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
        type: 'website',
        siteName: brandName,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        image: ogImage,
      },
      schemas: [organizationSchema, breadcrumbSchema, collectionSchema],
      semanticHtml,
    };
  }

  // ROUTE 4: ALL SHOP COLLECTIONS (/shop)
  if (path === '/shop') {
    const title = 'Shop All Sofas, Beds & Furniture | Plush Comfort UK';
    const description =
      'Browse the full Plush Comfort range of sofas, corner sofas, Chesterfields, beds and mattresses. Free UK mainland delivery and cash on delivery.';
    const canonical = `${origin}/shop`;

    return {
      statusCode: 200,
      title,
      description,
      canonicalUrl: canonical,
      robots: 'index, follow',
      h1: 'All Furniture Collections',
      openGraph: {
        title,
        description,
        image: defaultImage,
        url: canonical,
        type: 'website',
        siteName: brandName,
      },
      twitter: { card: 'summary_large_image', title, description, image: defaultImage },
      schemas: [organizationSchema],
      semanticHtml: `
        <header>
          <h1>All Furniture Collections</h1>
          <p>${escapeHtml(description)}</p>
        </header>
        <main>
          <ul>
            ${products.filter((p) => p.isPublished).map((p) => `<li><a href="/product/${p.slug}">${escapeHtml(p.name)} - £${(p.salePrice ?? p.price).toFixed(2)}</a></li>`).join('\n')}
          </ul>
        </main>
      `,
    };
  }

  // ROUTE 5: BLOG & BUYING GUIDES (/blog and /blog/:slug)
  if (path === '/blog') {
    const title = 'Furniture Guides & Living Inspiration | Plush Comfort UK';
    const description = 'Sofa and bed buying guides, size charts, fabric comparisons and care advice from the Plush Comfort team.';
    const canonical = `${origin}/blog`;

    return {
      statusCode: 200,
      title,
      description,
      canonicalUrl: canonical,
      robots: 'index, follow',
      h1: 'Furniture Guides & Living Inspiration',
      openGraph: { title, description, image: defaultImage, url: canonical, type: 'website', siteName: brandName },
      twitter: { card: 'summary_large_image', title, description, image: defaultImage },
      schemas: [organizationSchema],
      semanticHtml: `
        <header>
          <h1>Furniture Guides & Living Inspiration</h1>
          <p>${escapeHtml(description)}</p>
        </header>
        <main>
          <ul>
            ${blogPosts.filter((b) => b.isPublished).map((b) => `<li><a href="/blog/${b.slug}">${escapeHtml(b.title)}</a></li>`).join('\n')}
          </ul>
        </main>
      `,
    };
  }

  if (path.startsWith('/blog/')) {
    const slug = path.replace('/blog/', '').trim();
    const post = blogPosts.find((b) => b.slug === slug);

    if (!post || !post.isPublished) {
      return {
        statusCode: 404,
        title: 'Guide Not Found | Plush Comfort UK',
        description: 'The requested buying guide or article could not be found.',
        canonicalUrl: `${origin}${path}`,
        robots: 'noindex, follow',
        h1: 'Guide Not Found',
        openGraph: { title: 'Guide Not Found', description: '', image: DEFAULT_LOGO, url: `${origin}${path}`, type: 'website', siteName: brandName },
        twitter: { card: 'summary', title: 'Guide Not Found', description: '', image: DEFAULT_LOGO },
        schemas: [organizationSchema],
        semanticHtml: `<h1>Guide Not Found</h1><p><a href="/blog">Browse all articles</a></p>`,
      };
    }

    const title = post.seoTitle || `${post.title} | Plush Comfort UK`;
    const description = post.seoDescription || post.excerpt;
    const canonical = post.canonicalUrl || `${origin}/blog/${post.slug}`;
    const coverImage = abs(post.socialImage) || abs(post.coverImage) || defaultImage;

    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description,
      image: coverImage,
      author: {
        '@type': 'Person',
        name: post.author || 'Plush Comfort Team',
      },
      publisher: {
        '@type': 'Organization',
        name: brandName,
        logo: {
          '@type': 'ImageObject',
          url: DEFAULT_LOGO,
        },
      },
      datePublished: post.publishDate,
      dateModified: post.lastUpdated || post.publishDate,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonical,
      },
    };

    return {
      statusCode: 200,
      title,
      description,
      canonicalUrl: canonical,
      robots: post.isNoIndex ? 'noindex, follow' : 'index, follow',
      h1: post.title,
      openGraph: { title, description, image: coverImage, url: canonical, type: 'article', siteName: brandName },
      twitter: { card: 'summary_large_image', title, description, image: coverImage },
      schemas: [organizationSchema, articleSchema],
      semanticHtml: `
        <article itemscope itemtype="https://schema.org/BlogPosting">
          <header>
            <h1 itemprop="headline">${escapeHtml(post.title)}</h1>
            <p>Published: <time itemprop="datePublished">${post.publishDate}</time> by <span itemprop="author">${escapeHtml(post.author)}</span></p>
          </header>
          <p>${escapeHtml(post.excerpt)}</p>
          <div itemprop="articleBody">${escapeHtml(post.content.replace(/:::[a-z]+[^\n]*\n?/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, ''))}</div>
        </article>
      `,
    };
  }

  // ROUTE 6: STATIC PAGES
  const staticPages: Record<string, { title: string; desc: string; h1: string }> = {
    '/about': {
      title: 'About Plush Comfort UK | Online Sofa & Bed Store',
      desc: 'Plush Comfort UK is an online furniture store delivering luxury sofas and beds across the UK with free delivery, a 1 year warranty and cash on delivery.',
      h1: 'About Plush Comfort UK',
    },
    '/contact': {
      title: 'Contact Customer Care | Plush Comfort UK',
      desc: 'Questions about an order, delivery or a product? Call, email or WhatsApp the Plush Comfort customer care team, Monday to Saturday.',
      h1: 'Contact Plush Comfort',
    },
    '/delivery': {
      title: 'Two-Man Room of Choice UK Delivery | Plush Comfort UK',
      desc: 'Free UK mainland delivery over £150. Specialist two-man delivery logistics direct to your room of choice with timed delivery slots.',
      h1: 'UK Delivery & White Glove Service',
    },
    '/returns': {
      title: '30-Day Exchange & Returns Policy | Plush Comfort UK',
      desc: '30-day hassle-free exchange or return on sofas and beds, plus a 1 year warranty on every order.',
      h1: '30-Day Exchange & Returns Policy',
    },
    '/faqs': {
      title: 'Frequently Asked Questions | Plush Comfort UK',
      desc: 'Answers to common questions about sizes, fabrics, delivery times, assembly, cash on delivery and returns.',
      h1: 'Frequently Asked Questions',
    },
    '/privacy': {
      title: 'Privacy Policy | Plush Comfort UK',
      desc: 'How Plush Comfort UK securely handles your personal data, payments, and browsing information in compliance with UK GDPR.',
      h1: 'Privacy & Data Protection Policy',
    },
    '/terms': {
      title: 'Terms & Conditions | Plush Comfort UK',
      desc: 'Terms of sale, 1 year warranty conditions, orders, delivery and cash on delivery payment terms for Plush Comfort UK.',
      h1: 'Terms & Conditions of Sale',
    },
    '/cookies': {
      title: 'Cookie Policy | Plush Comfort UK',
      desc: 'Information on essential, functional, and performance cookies used on plushcomfort.uk.',
      h1: 'Cookie & Tracking Policy',
    },
  };

  if (staticPages[path]) {
    const page = staticPages[path];
    const canonical = `${origin}${path}`;
    return {
      statusCode: 200,
      title: page.title,
      description: page.desc,
      canonicalUrl: canonical,
      robots: 'index, follow',
      h1: page.h1,
      openGraph: { title: page.title, description: page.desc, image: defaultImage, url: canonical, type: 'website', siteName: brandName },
      twitter: { card: 'summary_large_image', title: page.title, description: page.desc, image: defaultImage },
      schemas: [organizationSchema],
      semanticHtml: `<main><h1>${escapeHtml(page.h1)}</h1><p>${escapeHtml(page.desc)}</p></main>`,
    };
  }

  // ROUTE 7: ADMIN ROUTE (/admin)
  if (path === '/admin') {
    return {
      statusCode: 200,
      title: 'Master Admin Portal | Plush Comfort UK',
      description: 'Administrative management console.',
      canonicalUrl: `${origin}/admin`,
      robots: 'noindex, nofollow',
      h1: 'Plush Comfort UK Administration',
      openGraph: { title: 'Admin', description: '', image: DEFAULT_LOGO, url: `${origin}/admin`, type: 'website', siteName: brandName },
      twitter: { card: 'summary', title: 'Admin', description: '', image: DEFAULT_LOGO },
      schemas: [],
      semanticHtml: `<h1>Plush Comfort UK Administration</h1>`,
    };
  }

  // DEFAULT / 404
  return {
    statusCode: 404,
    title: 'Page Not Found (404) | Plush Comfort UK',
    description: 'The requested page does not exist on Plush Comfort UK.',
    canonicalUrl: `${origin}${path}`,
    robots: 'noindex, follow',
    h1: 'Page Not Found (404)',
    openGraph: { title: '404 Not Found', description: '', image: DEFAULT_LOGO, url: `${origin}${path}`, type: 'website', siteName: brandName },
    twitter: { card: 'summary', title: '404 Not Found', description: '', image: DEFAULT_LOGO },
    schemas: [organizationSchema],
    semanticHtml: `
      <main>
        <h1>Page Not Found (404)</h1>
        <p>The page you are looking for does not exist.</p>
        <p><a href="/">Return to Home</a> | <a href="/shop">Browse All Furniture</a></p>
      </main>
    `,
  };
}

export function injectSeoIntoHtml(
  templateHtml: string,
  seoData: RouteSeoResult,
  settings?: StoreSettings,
  ssr?: { appHtml: string; bootJson?: string }
): string {
  let html = templateHtml;

  // 1. Replace or insert Title
  const titleTag = `<title>${escapeHtml(seoData.title)}</title>`;
  if (html.includes('<title>')) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, titleTag);
  } else {
    html = html.replace('</head>', `  ${titleTag}\n</head>`);
  }

  // 2. Build Meta Tags block
  const metaTags: string[] = [
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
    `<meta name="twitter:image" content="${escapeHtml(seoData.twitter.image)}" />`,
  ];

  // Search Engine Verification Tags (if configured in settings)
  if (settings?.googleSiteVerification) {
    metaTags.push(`<meta name="google-site-verification" content="${escapeHtml(settings.googleSiteVerification)}" />`);
  }
  if (settings?.bingSiteVerification) {
    metaTags.push(`<meta name="msvalidate.01" content="${escapeHtml(settings.bingSiteVerification)}" />`);
  }

  // Clean out existing default description and og tags from template to prevent duplicates
  html = html
    .replace(/<meta\s+name="description"[\s\S]*?>/gi, '')
    .replace(/<link\s+rel="canonical"[\s\S]*?>/gi, '')
    .replace(/<meta\s+name="robots"[\s\S]*?>/gi, '')
    .replace(/<meta\s+property="og:[^"]+"[\s\S]*?>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]+"[\s\S]*?>/gi, '');

  // 3. Structured Data JSON-LD Schemas
  let schemaTags = '';
  if (seoData.schemas && seoData.schemas.length > 0) {
    schemaTags = seoData.schemas
      .map((schema) => `  <script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n  </script>`)
      .join('\n');
  }

  // Clean out template's hardcoded schema script to avoid duplicate definitions
  html = html.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');

  // Insert meta tags and schema right before </head>
  const headInject = `\n  ${metaTags.join('\n  ')}\n${schemaTags}\n`;
  html = html.replace('</head>', `${headInject}</head>`);

  // 4. Inject zero-CLS branded app-shell and crawler-safe semantic HTML
  // Prevents the raw unstyled HTML flash and layout shift before React hydrates
  const brandedAppShell = `
    <div id="initial-app-shell" style="min-height: 100vh; background-color: #FAF8F5; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; color: #221C18; letter-spacing: -0.02em;">
        PLUSH COMFORT
      </div>
      <div style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #8A786A; margin-top: 6px; font-weight: 500;">
        Luxury Sofas &amp; Beds · UK Delivery
      </div>
      <div style="width: 40px; height: 2px; background: #A25828; margin-top: 20px; border-radius: 9999px;"></div>
    </div>`;

  const rootDivRegex = /<div\s+id="root"[\s\S]*?<\/div>(?=\s*<script|\s*<\/body>)/i;
  const simpleRootRegex = /<div\s+id="root"[\s\S]*?<\/div>/i;

  // Real server-rendered page (preferred): visible content + data for the browser app
  if (ssr?.appHtml) {
    const boot = ssr.bootJson
      ? `<script>window.__PC_DATA__=${ssr.bootJson.replace(/</g, '\\u003c')}</script>`
      : '';
    const block = `<div id="root">${ssr.appHtml}</div>${boot}`;
    if (rootDivRegex.test(html)) return html.replace(rootDivRegex, () => block);
    return html.replace('</body>', () => `${block}\n</body>`);
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
      html = html.replace('</body>', `<div id="root">${crawlerBlock}</div>\n</body>`);
    }
  } else {
    if (rootDivRegex.test(html)) {
      html = html.replace(rootDivRegex, `<div id="root">${brandedAppShell}</div>`);
    } else if (simpleRootRegex.test(html)) {
      html = html.replace(simpleRootRegex, `<div id="root">${brandedAppShell}</div>`);
    } else {
      html = html.replace('</body>', `<div id="root">${brandedAppShell}</div>\n</body>`);
    }
  }

  return html;
}

export function generateXmlSitemap(
  products: Product[],
  categories: Category[],
  blogPosts: BlogPost[],
  baseUrl: string = DEFAULT_ORIGIN
): string {
  const currentDate = new Date().toISOString().split('T')[0];
  const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];

  // Core Static Pages
  urls.push({ loc: `${baseUrl}/`, lastmod: currentDate, changefreq: 'daily', priority: '1.0' });
  urls.push({ loc: `${baseUrl}/shop`, lastmod: currentDate, changefreq: 'daily', priority: '0.9' });
  urls.push({ loc: `${baseUrl}/blog`, lastmod: currentDate, changefreq: 'daily', priority: '0.8' });
  urls.push({ loc: `${baseUrl}/delivery`, lastmod: currentDate, changefreq: 'monthly', priority: '0.7' });
  urls.push({ loc: `${baseUrl}/contact`, lastmod: currentDate, changefreq: 'monthly', priority: '0.7' });
  urls.push({ loc: `${baseUrl}/about`, lastmod: currentDate, changefreq: 'monthly', priority: '0.6' });
  urls.push({ loc: `${baseUrl}/returns`, lastmod: currentDate, changefreq: 'monthly', priority: '0.6' });
  urls.push({ loc: `${baseUrl}/faqs`, lastmod: currentDate, changefreq: 'weekly', priority: '0.7' });
  urls.push({ loc: `${baseUrl}/privacy`, lastmod: currentDate, changefreq: 'monthly', priority: '0.3' });
  urls.push({ loc: `${baseUrl}/terms`, lastmod: currentDate, changefreq: 'monthly', priority: '0.3' });
  urls.push({ loc: `${baseUrl}/cookies`, lastmod: currentDate, changefreq: 'monthly', priority: '0.3' });

  // Categories & Subcategories
  categories.filter((c) => c.isActive && c.robotsIndexing !== 'noindex, follow' && c.robotsIndexing !== 'noindex, nofollow').forEach((c) => {
    urls.push({
      loc: `${baseUrl}/category/${c.slug}`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '0.9',
    });

    if (c.subcategories && c.subcategories.length > 0) {
      c.subcategories.forEach((sub) => {
        urls.push({
          loc: `${baseUrl}/category/${c.slug}/${sub.slug}`,
          lastmod: currentDate,
          changefreq: 'daily',
          priority: '0.8',
        });
      });
    }
  });

  // Published Products
  products.filter((p) => p.isPublished && p.robotsIndexing !== 'noindex, follow' && p.robotsIndexing !== 'noindex, nofollow').forEach((p) => {
    urls.push({
      loc: `${baseUrl}/product/${p.slug}`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.9',
    });
  });

  // Published Blog Posts
  blogPosts.filter((b) => b.isPublished && !b.isNoIndex).forEach((b) => {
    urls.push({
      loc: `${baseUrl}/blog/${b.slug}`,
      lastmod: b.lastUpdated || b.publishDate || currentDate,
      changefreq: 'monthly',
      priority: '0.7',
    });
  });

  const xmlEntries = urls
    .map(
      (u) => `  <url>
    <loc>${escapeHtml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;
}

export function generateRobotsTxt(baseUrl: string = DEFAULT_ORIGIN): string {
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

export function runSeoAudit(
  products: Product[],
  categories: Category[],
  blogPosts: BlogPost[]
): SeoAuditReport {
  let missingTitles = 0;
  let shortTitles = 0;
  let longTitles = 0;
  let missingDescriptions = 0;
  let shortDescriptions = 0;
  let longDescriptions = 0;
  let missingAltTexts = 0;
  let noindexPages = 0;

  const itemsWithWarnings: SeoAuditReport['itemsWithWarnings'] = [];

  // Audit Products
  products.forEach((p) => {
    const issues: string[] = [];
    const title = p.seoTitle || p.name;
    const desc = p.seoDescription || p.shortDescription || '';

    if (!p.seoTitle) missingTitles++;
    if (title.length < 30) shortTitles++;
    if (title.length > 60) longTitles++;

    if (!p.seoDescription) missingDescriptions++;
    if (desc.length < 120) shortDescriptions++;
    if (desc.length > 160) longDescriptions++;

    if (p.robotsIndexing?.includes('noindex')) noindexPages++;

    // Check images for alt text
    const hasMissingAlt = p.imageGallery
      ? p.imageGallery.some((g) => !g.alt || g.alt.trim() === '')
      : false;
    if (hasMissingAlt) {
      missingAltTexts++;
      issues.push('Missing image alt text in gallery');
    }

    if (!p.seoTitle) issues.push('Missing explicit SEO Title');
    if (!p.seoDescription) issues.push('Missing explicit Meta Description');
    if (title.length < 30) issues.push(`Title too short (${title.length} chars; min 30)`);
    if (title.length > 60) issues.push(`Title too long (${title.length} chars; max 60)`);

    if (issues.length > 0) {
      itemsWithWarnings.push({
        type: 'product',
        id: p.id,
        name: p.name,
        url: `/product/${p.slug}`,
        issues,
      });
    }
  });

  // Audit Categories
  categories.forEach((c) => {
    const issues: string[] = [];
    const title = c.seoTitle || c.name;
    const desc = c.seoDescription || c.description || '';

    if (!c.seoTitle) missingTitles++;
    if (title.length < 30) shortTitles++;
    if (title.length > 60) longTitles++;

    if (!c.seoDescription) missingDescriptions++;
    if (desc.length < 120) shortDescriptions++;
    if (desc.length > 160) longDescriptions++;

    if (c.robotsIndexing?.includes('noindex')) noindexPages++;
    if (!c.imageAlt) {
      missingAltTexts++;
      issues.push('Missing category image alt text');
    }

    if (!c.seoTitle) issues.push('Missing explicit SEO Title');
    if (!c.seoDescription) issues.push('Missing explicit Meta Description');

    if (issues.length > 0) {
      itemsWithWarnings.push({
        type: 'category',
        id: c.id,
        name: c.name,
        url: `/category/${c.slug}`,
        issues,
      });
    }
  });

  const totalPages = products.length + categories.length + blogPosts.length + 8;
  const crawlableUrlCount =
    products.filter((p) => p.isPublished && !p.robotsIndexing?.includes('noindex')).length +
    categories.filter((c) => c.isActive && !c.robotsIndexing?.includes('noindex')).length +
    blogPosts.filter((b) => b.isPublished && !b.isNoIndex).length +
    8;

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
    itemsWithWarnings,
  };
}

export function autoFixMissingSeo(
  products: Product[],
  categories: Category[]
): { updatedProducts: Product[]; updatedCategories: Category[]; fixCount: number } {
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
        seoDescription = seoDescription.slice(0, 157) + '...';
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
        if (!img.alt || img.alt.trim() === '') {
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
      if (seoDescription.length > 160) seoDescription = seoDescription.slice(0, 157) + '...';
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
