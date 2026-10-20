import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  generateSeoDataForRoute,
  injectSeoIntoHtml,
  generateXmlSitemap,
  generateRobotsTxt,
} from '../src/utils/seoEngine';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_BLOG_POSTS,
  INITIAL_SETTINGS,
} from '../src/data/initialData';
import { Product, Category, BlogPost, StoreSettings } from '../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const DATA_DIR = path.resolve(ROOT_DIR, 'data');

function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

function ensureDirSync(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function runPrerender() {
  console.log('[Prerender] Starting static site prerendering for SEO...');

  const templatePath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('[Prerender] dist/index.html not found! Run "vite build" first.');
    process.exit(1);
  }

  const rawTemplate = fs.readFileSync(templatePath, 'utf-8');

  // Load latest data (or fallback to initialData)
  const products: Product[] = readJsonFile(path.join(DATA_DIR, 'store_products.json'), INITIAL_PRODUCTS);
  const categories: Category[] = readJsonFile(path.join(DATA_DIR, 'store_categories.json'), INITIAL_CATEGORIES);
  const blogPosts: BlogPost[] = INITIAL_BLOG_POSTS;
  const settings: StoreSettings = {
    ...INITIAL_SETTINGS,
    ...(readJsonFile(path.join(DATA_DIR, 'store_design.json'), {})),
  };

  const routesToPrerender: string[] = [
    '/',
    '/shop',
    '/blog',
    '/delivery',
    '/contact',
    '/about',
    '/returns',
    '/faqs',
    '/privacy',
    '/terms',
    '/cookies',
  ];

  // Categories & Subcategories
  categories.filter((c) => c.isActive).forEach((c) => {
    routesToPrerender.push(`/category/${c.slug}`);
    if (c.subcategories && c.subcategories.length > 0) {
      c.subcategories.forEach((sub) => {
        routesToPrerender.push(`/category/${c.slug}/${sub.slug}`);
      });
    }
  });

  // Published Products
  products.filter((p) => p.isPublished).forEach((p) => {
    routesToPrerender.push(`/product/${p.slug}`);
  });

  // Published Blog Posts
  blogPosts.filter((b) => b.isPublished).forEach((b) => {
    routesToPrerender.push(`/blog/${b.slug}`);
  });

  let renderedCount = 0;

  for (const route of routesToPrerender) {
    const seoData = generateSeoDataForRoute(route, products, categories, blogPosts, settings);
    const html = injectSeoIntoHtml(rawTemplate, seoData, settings);

    if (route === '/') {
      fs.writeFileSync(templatePath, html, 'utf-8');
      renderedCount++;
      continue;
    }

    const targetDir = path.join(DIST_DIR, route.replace(/^\//, ''));
    ensureDirSync(targetDir);
    fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8');
    renderedCount++;
  }

  // Pre-render 404 page for static hosting (Vercel / GitHub Pages / Netlify)
  const notFoundSeo = generateSeoDataForRoute('/404', products, categories, blogPosts, settings);
  const notFoundHtml = injectSeoIntoHtml(rawTemplate, notFoundSeo, settings);
  fs.writeFileSync(path.join(DIST_DIR, '404.html'), notFoundHtml, 'utf-8');

  // Generate static XML sitemap in dist and public
  const sitemapXml = generateXmlSitemap(products, categories, blogPosts, 'https://plushcomfort.uk');
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf-8');
  fs.writeFileSync(path.join(ROOT_DIR, 'public', 'sitemap.xml'), sitemapXml, 'utf-8');

  // Generate static robots.txt in dist and public
  const robotsTxt = generateRobotsTxt('https://plushcomfort.uk');
  fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsTxt, 'utf-8');
  fs.writeFileSync(path.join(ROOT_DIR, 'public', 'robots.txt'), robotsTxt, 'utf-8');

  console.log(`[Prerender] Successfully prerendered ${renderedCount} crawlable routes!`);
  console.log('[Prerender] Generated static sitemap.xml and robots.txt.');
}

runPrerender().catch((err) => {
  console.error('[Prerender] Error during prerendering:', err);
  process.exit(1);
});
