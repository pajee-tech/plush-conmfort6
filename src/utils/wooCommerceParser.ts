import { Product, Category } from '../types';
import { FURNITURE_IMAGES, getProductFallbackImage } from './imageHelper';

export interface WooParseResult {
  success: boolean;
  totalParsed: number;
  products: Product[];
  warnings: string[];
  errors: string[];
  missingImages: string[];
  headersFound: string[];
}

/**
 * Robust RFC 4180 CSV Parser supporting multiline cells, escaped quotes, and commas.
 */
export function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.length > 0 && currentRow.some((c) => c !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  // Push last cell/row
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Strips HTML tags and Hostinger / preview builder metadata.
 */
export function cleanDescription(rawText: string): string {
  if (!rawText) return '';
  return rawText
    // Remove Hostinger preview links and builder artifacts
    .replace(/https?:\/\/[^\s]*hostinger[^\s]*/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove like counts, save counts, view counts
    .replace(/(?:views|likes|saves|favourites?):\s*\d+/gi, '')
    // Convert basic HTML breaks & paragraphs to newlines
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    // Remove all remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Collapse multiple empty lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Generate a clean URL slug from product name.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/^the\s+/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Map raw category string from CSV to one of the 9 target categories.
 */
export function mapCategoryToTarget(
  rawCat: string,
  categories: Category[]
): { categoryId: string; subcategoryId?: string } {
  const norm = (rawCat || '').toLowerCase();

  // 1. Chesterfield Sofas
  if (norm.includes('chesterfield')) {
    const cat = categories.find((c) => c.slug === 'chesterfield-sofas') || categories[0];
    return { categoryId: cat.id, subcategoryId: cat.subcategories[0]?.id };
  }

  // 2. Corner Sofas
  if (norm.includes('corner') || norm.includes('chaise') || norm.includes('l-shape') || norm.includes('sectional')) {
    const cat = categories.find((c) => c.slug === 'corner-sofas') || categories[0];
    return { categoryId: cat.id, subcategoryId: cat.subcategories[0]?.id };
  }

  // 3. Armchairs & Accent Chairs
  if (norm.includes('armchair') || norm.includes('accent chair') || norm.includes('lounge chair') || (norm.includes('chair') && !norm.includes('table'))) {
    const cat = categories.find((c) => c.slug === 'armchairs') || categories[0];
    return { categoryId: cat.id, subcategoryId: cat.subcategories[0]?.id };
  }

  // 4. Fabric Sofas
  if (norm.includes('fabric') || norm.includes('linen') || norm.includes('boucle') || norm.includes('bouclé') || norm.includes('velvet')) {
    const cat = categories.find((c) => c.slug === 'fabric-sofas') || categories[0];
    return { categoryId: cat.id, subcategoryId: cat.subcategories[0]?.id };
  }

  // 5. Divan Beds
  if (norm.includes('divan')) {
    const cat = categories.find((c) => c.slug === 'divan-beds') || categories[1] || categories[0];
    return { categoryId: cat.id, subcategoryId: cat.subcategories[0]?.id };
  }

  // 6. Mattresses
  if (norm.includes('mattress')) {
    const cat = categories.find((c) => c.slug === 'mattresses') || categories[1] || categories[0];
    return { categoryId: cat.id, subcategoryId: cat.subcategories[0]?.id };
  }

  // 7. Wardrobes
  if (norm.includes('wardrobe') || norm.includes('closet') || norm.includes('storage unit')) {
    const cat = categories.find((c) => c.slug === 'wardrobes') || categories[categories.length - 1];
    return { categoryId: cat.id, subcategoryId: cat.subcategories[0]?.id };
  }

  // 8. Beds & Bed Frames
  if (norm.includes('bed') || norm.includes('ottoman') || norm.includes('bedroom')) {
    const cat = categories.find((c) => c.slug === 'beds-bed-frames' || c.slug === 'beds') || categories[1] || categories[0];
    return { categoryId: cat.id, subcategoryId: cat.subcategories[0]?.id };
  }

  // 9. Sofas (Default)
  const sofaCat = categories.find((c) => c.slug === 'sofas') || categories[0];
  return { categoryId: sofaCat.id, subcategoryId: sofaCat.subcategories[0]?.id };
}

/**
 * Parse WooCommerce CSV Export and map to full persistent Product models.
 */
export function parseWooCommerceCsv(
  csvContent: string,
  categories: Category[]
): WooParseResult {
  const result: WooParseResult = {
    success: false,
    totalParsed: 0,
    products: [],
    warnings: [],
    errors: [],
    missingImages: [],
    headersFound: [],
  };

  if (!csvContent || !csvContent.trim()) {
    result.errors.push('The provided CSV content is completely empty.');
    return result;
  }

  const rows = parseCsvRows(csvContent);
  if (rows.length < 2) {
    result.errors.push('CSV requires a valid header row and at least one product row.');
    return result;
  }

  const rawHeaders = rows[0];
  const headers = rawHeaders.map((h) => h.toLowerCase().trim());
  result.headersFound = rawHeaders;

  // Find column indices
  const findCol = (...names: string[]): number => {
    for (const name of names) {
      const idx = headers.findIndex((h) => h === name || h.includes(name));
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const nameCol = findCol('name', 'post_title', 'product name', 'title');
  const skuCol = findCol('sku', 'item code', 'id');
  const regularPriceCol = findCol('regular price', 'regular_price', 'price', 'standard price');
  const salePriceCol = findCol('sale price', 'sale_price', 'discount price');
  const categoriesCol = findCol('categories', 'category', 'product_cat');
  const imagesCol = findCol('images', 'image', 'picture', 'photos');
  const descCol = findCol('description', 'post_content', 'body', 'full description');
  const shortDescCol = findCol('short description', 'post_excerpt', 'summary');
  const stockCol = findCol('stock', 'stock_quantity', 'qty');

  // Verify essential columns
  if (nameCol === -1) {
    result.errors.push('Missing essential column: Product Name (expected "Name", "post_title", or "Product Name").');
  }
  if (regularPriceCol === -1 && salePriceCol === -1) {
    result.errors.push('Missing essential column: Price (expected "Regular price", "regular_price", or "Price").');
  }

  if (result.errors.length > 0) {
    return result;
  }

  // Parse product rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    const rawName = nameCol !== -1 ? row[nameCol] : '';
    if (!rawName || !rawName.trim()) {
      result.warnings.push(`Row ${rowNum}: Skipped because product name is empty.`);
      continue;
    }

    const name = rawName.trim();
    const rawSku = skuCol !== -1 && row[skuCol] ? row[skuCol].trim() : `PC-${generateSlug(name).slice(0, 10).toUpperCase()}-${rowNum}`;
    
    // Parse prices
    const regPriceStr = regularPriceCol !== -1 ? row[regularPriceCol] : '';
    const cleanRegPrice = regPriceStr ? parseFloat(regPriceStr.replace(/[^0-9.]/g, '')) : NaN;

    const salePriceStr = salePriceCol !== -1 ? row[salePriceCol] : '';
    const cleanSalePrice = salePriceStr ? parseFloat(salePriceStr.replace(/[^0-9.]/g, '')) : NaN;

    if (isNaN(cleanRegPrice) && isNaN(cleanSalePrice)) {
      result.warnings.push(`Row ${rowNum} ("${name}"): Invalid or missing price.`);
      continue;
    }

    const price = !isNaN(cleanRegPrice) ? cleanRegPrice : cleanSalePrice;
    const salePrice = !isNaN(cleanSalePrice) && cleanSalePrice < price ? cleanSalePrice : undefined;

    // Parse category
    const rawCat = categoriesCol !== -1 ? row[categoriesCol] : '';
    const { categoryId, subcategoryId } = mapCategoryToTarget(rawCat, categories);

    // Parse descriptions
    const rawFullDesc = descCol !== -1 ? row[descCol] : '';
    const fullDescription = cleanDescription(rawFullDesc) || `${name} — luxury comfort with free UK delivery, a 1 year warranty and cash on delivery from Plush Comfort UK.`;

    const rawShortDesc = shortDescCol !== -1 ? row[shortDescCol] : '';
    const shortDescription = cleanDescription(rawShortDesc) || fullDescription.slice(0, 150) + '...';

    // Parse images gallery
    const rawImagesStr = imagesCol !== -1 ? row[imagesCol] : '';
    const imageUrls = rawImagesStr
      ? rawImagesStr
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:image'))
      : [];

    if (imageUrls.length === 0) {
      result.missingImages.push(`${name} (SKU: ${rawSku})`);
      // Provide high-fidelity vector fallback
      const catSlug = categories.find((c) => c.id === categoryId)?.slug || 'sofas';
      imageUrls.push(getProductFallbackImage(name, catSlug));
    }

    // Stock
    const stockStr = stockCol !== -1 ? row[stockCol] : '';
    const stockVal = stockStr ? parseInt(stockStr.replace(/[^0-9]/g, ''), 10) : 10;
    const stock = !isNaN(stockVal) ? stockVal : 10;

    // SEO content
    const slug = generateSlug(name);
    const seoTitle = `${name} | Plush Comfort UK`;
    const seoDescription = shortDescription.length <= 160
      ? shortDescription
      : `${shortDescription.slice(0, 155).trim()}... Free UK delivery & 1 year warranty.`;

    const product: Product = {
      id: `woo-${slug}-${rawSku.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      name,
      slug,
      sku: rawSku,
      categoryId,
      subcategoryId,
      price,
      salePrice,
      stock,
      lowStockThreshold: 3,
      images: imageUrls,
      shortDescription,
      fullDescription,
      dimensions: {
        width: 200,
        height: 85,
        depth: 95,
      },
      materials: ['Handcrafted British Joinery', 'Kiln-Dried Hardwood', 'High-Density Reflex Foam'],
      colours: [
        { name: 'Oatmeal Tweed', hex: '#EDE4D8' },
        { name: 'Heritage Charcoal', hex: '#3C3B3A' }
      ],
      sizes: ['Standard UK Dimension'],
      tags: ['WooCommerce Imported', 'Handcrafted UK', 'Luxury Furniture'],
      isPublished: true,
      isFeatured: i <= 4,
      isTrending: i % 2 === 0,
      deliveryInfo: 'Delivered across mainland UK with 2-man room of choice logistics.',
      careInstructions: 'Spot clean with mild upholstery cleaner or professional dry clean.',
      assemblyRequired: false,
      seoTitle,
      seoDescription,
      rating: 4.9,
      reviewCount: 12 + (i * 3) % 40,
      relatedProductIds: [],
      complementaryProductIds: [],
      reviews: []
    };

    result.products.push(product);
  }

  // Link related products within same category
  for (const prod of result.products) {
    const siblings = result.products.filter((p) => p.categoryId === prod.categoryId && p.id !== prod.id);
    prod.relatedProductIds = siblings.slice(0, 3).map((s) => s.id);
  }

  result.totalParsed = result.products.length;
  result.success = result.products.length > 0;

  return result;
}
