import React, { useState } from 'react';
import { BlogPost, Product, Category } from '../../types';
import { X, Copy, Check, Download, FileCode2, Globe } from 'lucide-react';

interface SitemapModalProps {
  isOpen: boolean;
  onClose: () => void;
  blogPosts: BlogPost[];
  products: Product[];
  categories: Category[];
}

export const SitemapModal: React.FC<SitemapModalProps> = ({
  isOpen,
  onClose,
  blogPosts,
  products,
  categories,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Filter only published and indexable pages
  const publishedPosts = blogPosts.filter((b) => b.isPublished && !b.isNoIndex && b.status === 'published');
  const publishedProducts = products.filter((p) => p.isPublished);
  const activeCategories = categories.filter((c) => c.isActive);

  const baseUrl = 'https://plushcomfort.uk';
  const currentDate = new Date().toISOString().split('T')[0];

  const xmlEntries = [
    // Core Pages
    `  <url>\n    <loc>${baseUrl}/</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
    `  <url>\n    <loc>${baseUrl}/shop</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`,
    `  <url>\n    <loc>${baseUrl}/blog</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>`,
    `  <url>\n    <loc>${baseUrl}/delivery</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
    `  <url>\n    <loc>${baseUrl}/returns</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
    `  <url>\n    <loc>${baseUrl}/about</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`,
    `  <url>\n    <loc>${baseUrl}/contact</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`,
    `  <url>\n    <loc>${baseUrl}/faqs</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`,

    // Categories
    ...activeCategories.map(
      (cat) =>
        `  <url>\n    <loc>${baseUrl}/category/${cat.slug}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>`
    ),

    // Published Blog Posts / Guides / Pillars (CMS)
    ...publishedPosts.map((post) => {
      const priority = post.contentType === 'pillar_page' ? '0.85' : '0.75';
      const lastmod = post.lastUpdated || currentDate;
      return `  <url>\n    <loc>${baseUrl}/blog/${post.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    }),

    // Published Products
    ...publishedProducts.map(
      (prod) =>
        `  <url>\n    <loc>${baseUrl}/product/${prod.slug}</loc>\n    <lastmod>${currentDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
    ),
  ];

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlEntries.join(
    '\n'
  )}\n</urlset>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sitemapXml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([sitemapXml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sitemap.xml');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 z-10 space-y-6 shadow-2xl border border-[#E8E0D5] max-h-[90vh] flex flex-col animate-fade-in">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] text-[#A25828] flex items-center justify-center border border-[#E8E0D5]">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-[#221C18]">
                Production XML Sitemap Generator
              </h3>
              <p className="text-xs text-stone-500">
                Indexable URLs automatically synced with CMS publishing status ({xmlEntries.length} total URLs)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-black p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-between bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E0D5] text-xs shrink-0">
          <div className="flex items-center gap-4 text-stone-700">
            <span className="flex items-center gap-1.5 font-semibold">
              <Globe className="w-4 h-4 text-[#A25828]" />
              Endpoint: <code className="text-[#A25828] font-mono">https://plushcomfort.uk/sitemap.xml</code>
            </span>
            <span className="text-stone-400">·</span>
            <span className="text-emerald-700 font-semibold">
              {publishedPosts.length} CMS Articles &amp; Pillars Included
            </span>
            <span className="text-stone-400">·</span>
            <span className="text-stone-500">
              Drafts &amp; NoIndex Excluded
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 bg-white border border-[#D5C7B7] hover:border-black text-stone-800 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied XML' : 'Copy XML'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 bg-[#A25828] hover:bg-[#8A461A] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download sitemap.xml</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-stone-900 text-stone-200 p-4 rounded-2xl font-mono text-xs leading-relaxed border border-stone-800">
          <pre className="whitespace-pre overflow-x-auto">{sitemapXml}</pre>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-stone-200 text-xs text-stone-500 shrink-0">
          <span>Submit this URL directly in Google Search Console for instant discovery.</span>
          <button
            onClick={onClose}
            className="bg-[#221C18] text-white px-5 py-2 rounded-xl font-semibold hover:bg-black transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
