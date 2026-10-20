import fs from 'fs';
import path from 'path';

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`);
  return await res.text();
}

async function main() {
  console.log('Fetching logo from homepage...');
  const homeHtml = await fetchHtml('https://plushcomfort.uk/');
  
  // Find logo
  const logoImgs = [...homeHtml.matchAll(/<img[^>]+src="([^">]+)"[^>]*>/gi)]
    .map(m => m[1])
    .filter(src => /logo/i.test(src) || /plush/i.test(src));
  console.log('Candidate logo URLs:', logoImgs);

  // Shop page 1 & 2
  console.log('Fetching shop page 1 & 2...');
  const shop1Html = await fetchHtml('https://plushcomfort.uk/shop/');
  const shop2Html = await fetchHtml('https://plushcomfort.uk/shop/page/2/');

  const extractLinks = (html) => {
    const matches = [...html.matchAll(/href="(https:\/\/plushcomfort\.uk\/product\/[^"\/]+\/)"/g)];
    return [...new Set(matches.map(m => m[1]))];
  };

  const productUrls = [...new Set([...extractLinks(shop1Html), ...extractLinks(shop2Html)])];
  console.log(`Found ${productUrls.length} products:`, productUrls);

  const productsData = [];

  for (let i = 0; i < productUrls.length; i++) {
    const pUrl = productUrls[i];
    console.log(`[${i + 1}/${productUrls.length}] Fetching ${pUrl}`);
    try {
      const html = await fetchHtml(pUrl);

      // Product Title
      const titleMatch = html.match(/<h1[^>]*class="[^"]*product_title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i) ||
                         html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      // SKU
      const skuMatch = html.match(/class="sku">([\s\S]*?)<\/span>/i);
      const sku = skuMatch ? skuMatch[1].trim() : '';

      // Categories
      const catMatches = [...html.matchAll(/rel="tag">([\s\S]*?)<\/a>/gi)].map(m => m[1].trim());

      // Prices
      const priceBlockMatch = html.match(/<p class="price">([\s\S]*?)<\/p>/i);
      let regularPrice = 0;
      let salePrice = null;
      if (priceBlockMatch) {
        const pb = priceBlockMatch[1];
        const amounts = [...pb.matchAll(/woocommerce-Price-amount amount">[\s\S]*?<bdi>([\s\S]*?)<\/bdi>/gi)]
          .map(m => m[1].replace(/&pound;|£|,/g, '').trim())
          .map(Number);
        if (amounts.length >= 2) {
          regularPrice = amounts[0];
          salePrice = amounts[1];
        } else if (amounts.length === 1) {
          regularPrice = amounts[0];
        }
      }

      // Short Description
      const shortDescMatch = html.match(/class="woocommerce-product-details__short-description">([\s\S]*?)<\/div>/i);
      const shortDescription = shortDescMatch ? shortDescMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';

      // Full Description
      const fullDescMatch = html.match(/id="tab-description">([\s\S]*?)<\/div>/i) ||
                            html.match(/woocommerce-Tabs-panel--description">([\s\S]*?)<\/div>/i);
      const fullDescription = fullDescMatch ? fullDescMatch[1].trim() : '';

      // Images
      // Look for large images in wp-post-image or woocommerce gallery
      const imgMatches = [...html.matchAll(/<img[^>]+(?:data-large_image|data-src|src)="([^">]+)"[^>]*>/gi)]
        .map(m => m[1])
        .filter(src => src.includes('/wp-content/uploads/'))
        .filter(src => !src.includes('150x150') && !src.includes('100x100') && !src.includes('300x300'));
      
      const galleryImgs = [...new Set(imgMatches)];

      // Additional Attributes (like dimensions, material, etc.)
      const attrMatches = [...html.matchAll(/<th class="woocommerce-product-attributes-item__label">([\s\S]*?)<\/th>[\s\S]*?<td class="woocommerce-product-attributes-item__value">([\s\S]*?)<\/td>/gi)]
        .map(m => ({
          label: m[1].replace(/<[^>]+>/g, '').trim(),
          value: m[2].replace(/<[^>]+>/g, '').trim()
        }));

      productsData.push({
        url: pUrl,
        slug: pUrl.replace('https://plushcomfort.uk/product/', '').replace(/\/$/, ''),
        title,
        sku,
        categories: catMatches,
        regularPrice,
        salePrice,
        shortDescription,
        fullDescription,
        images: galleryImgs,
        attributes: attrMatches
      });
    } catch (err) {
      console.error(`Error fetching ${pUrl}:`, err);
    }
  }

  fs.writeFileSync('scripts/scraped_products.json', JSON.stringify({
    logoImgs,
    products: productsData
  }, null, 2));

  console.log('Saved to scripts/scraped_products.json! Total products:', productsData.length);
}

main().catch(console.error);
