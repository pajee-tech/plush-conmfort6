/**
 * Responsive images: every built-in photo in /uploads/products and /uploads/blog has
 * 480px and 800px WebP versions next to it (name-480.webp, name-800.webp).
 * Phones download the small file instead of the full 1600px image.
 * Run `npm run images` after adding new photos to those folders to create the sizes.
 */
const VARIANT_DIRS = /^\/uploads\/(products|blog)\/[^/]+\.webp$/;

export function srcSetFor(url?: string): string | undefined {
  if (!url || !VARIANT_DIRS.test(url) || /-(480|800)\.webp$/.test(url)) return undefined;
  const base = url.slice(0, -5);
  return `${base}-480.webp 480w, ${base}-800.webp 800w, ${url} 1600w`;
}

/** A smaller version of an image for thumbnails (falls back to the original). */
export function thumbFor(url?: string, width: 480 | 800 = 480): string | undefined {
  if (!url || !VARIANT_DIRS.test(url) || /-(480|800)\.webp$/.test(url)) return url;
  return `${url.slice(0, -5)}-${width}.webp`;
}

export function logoFor(url?: string): string | undefined {
  if (url === '/assets/brand/plush-comfort-official-logo.webp') return '/assets/brand/plush-comfort-official-logo-240.webp';
  if (url === '/logo.webp') return '/logo-240.webp';
  return url;
}
