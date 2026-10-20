import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { RichContent, extractHeadings, extractFaqs } from '../components/RichContent';
import { srcSetFor, thumbFor } from '../utils/responsiveImage';
import {
  ChevronRight,
  ChevronDown,
  Clock,
  Calendar,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Layers,
  Sparkles,
  CheckCircle2,
  List,
  Facebook,
  Link2,
  MessageCircle,
} from 'lucide-react';

interface BlogDetailPageProps {
  slug: string;
}

export const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ slug }) => {
  const { blogPosts, products, setRoute } = useStore();
  const [copiedLink, setCopiedLink] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const post = blogPosts.find((b) => b.slug === slug);

  useEffect(() => {
    if (post) {
      document.title = post.seoTitle || `${post.title} | Plush Comfort UK`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', post.seoDescription || post.excerpt);
    }
  }, [post]);

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const headings = useMemo(() => extractHeadings(post?.content || '').filter((h) => h.level === 2), [post?.content]);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-bold text-[#221C18]">Guide Not Found</h1>
        <p className="text-stone-500 mt-2 text-sm">The requested guide may have been moved, updated, or unpublished.</p>
        <button onClick={() => setRoute({ name: 'blog' })} className="mt-6 bg-[#A25828] text-white px-6 py-2.5 rounded-full text-xs font-semibold cursor-pointer">
          Return to Buying Guides
        </button>
      </div>
    );
  }

  const isPillar = post.contentType === 'pillar_page' || post.type === 'pillar';
  const layout = post.pillarLayout || {};
  const parentPillar = !isPillar
    ? blogPosts.find((b) => (post.parentPillarId && b.id === post.parentPillarId) || (post.pillarSlug && b.slug === post.pillarSlug))
    : null;
  const clusterChildren = isPillar
    ? blogPosts.filter((b) => b.id !== post.id && b.isPublished && (b.parentPillarId === post.id || b.pillarSlug === post.slug))
    : [];
  const siblingArticles = parentPillar
    ? blogPosts.filter((b) => b.id !== post.id && b.isPublished && (b.parentPillarId === parentPillar.id || b.pillarSlug === parentPillar.slug)).slice(0, 3)
    : [];
  const relatedProducts = products.filter((p) => p.isPublished && post.relatedProductIds?.includes(p.id)).slice(0, 3);
  const inlineFaqs = extractFaqs(post.content);
  const faqs = [...(post.faqs || []), ...inlineFaqs].filter((f, i, arr) => arr.findIndex((x) => x.question === f.question) === i);
  const showToc = layout.showTableOfContents !== false && headings.length >= 3;

  const navigate = (url: string) => {
    const clean = url.split('#')[0].split('?')[0];
    if (url.startsWith('#')) {
      document.getElementById(url.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    } else if (clean.startsWith('/product/')) setRoute({ name: 'product', slug: clean.replace('/product/', '') });
    else if (clean.startsWith('/category/')) {
      const [cat, sub] = clean.replace('/category/', '').split('/');
      setRoute({ name: 'category', categorySlug: cat, subcategorySlug: sub });
    } else if (clean.startsWith('/blog/')) setRoute({ name: 'blog-detail', slug: clean.replace('/blog/', '') });
    else if (clean === '/blog') setRoute({ name: 'blog' });
    else if (clean === '/shop') setRoute({ name: 'shop' });
    else if (['/delivery', '/returns', '/faqs', '/about', '/contact', '/privacy', '/terms'].includes(clean)) {
      setRoute({ name: clean.slice(1) as any });
    } else if (/^https?:\/\//.test(url)) window.open(url, '_blank', 'noopener,noreferrer');
    else setRoute({ name: 'home' });
  };

  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://plushcomfort.uk/blog/${post.slug}`;
  const canonical = post.canonicalUrl || `https://plushcomfort.uk/blog/${post.slug}`;
  const absolute = (src: string) => (src.startsWith('http') ? src : `https://plushcomfort.uk${src}`);

  const schemas: any[] = [
    {
      '@context': 'https://schema.org',
      '@type': isPillar ? 'Article' : 'BlogPosting',
      headline: post.title,
      description: post.seoDescription || post.excerpt,
      image: absolute(post.socialImage || post.coverImage),
      datePublished: post.publishDate,
      dateModified: post.lastUpdated || post.publishDate,
      author: { '@type': 'Person', name: post.author, jobTitle: post.authorRole || undefined },
      publisher: {
        '@type': 'Organization',
        name: 'Plush Comfort UK',
        logo: { '@type': 'ImageObject', url: 'https://plushcomfort.uk/logo.webp' },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://plushcomfort.uk/' },
        { '@type': 'ListItem', position: 2, name: 'Buying Guides', item: 'https://plushcomfort.uk/blog' },
        ...(parentPillar
          ? [{ '@type': 'ListItem', position: 3, name: parentPillar.title, item: `https://plushcomfort.uk/blog/${parentPillar.slug}` }]
          : []),
        { '@type': 'ListItem', position: parentPillar ? 4 : 3, name: post.title, item: canonical },
      ],
    },
  ];
  if (faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
    });
  }

  const TocList = ({ onPick }: { onPick?: () => void }) => (
    <ol className="space-y-1.5 text-sm">
      {headings.map((h, i) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              onPick?.();
            }}
            className="flex gap-2 text-[#5A4E46] hover:text-[#A25828] leading-snug"
          >
            <span className="text-[#A25828] font-semibold tabular-nums">{String(i + 1).padStart(2, '0')}</span>
            <span>{h.text}</span>
          </a>
        </li>
      ))}
    </ol>
  );

  const ShareRow = () => (
    <div className="flex items-center gap-2">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${pageUrl}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="w-9 h-9 rounded-full border border-[#E8E0D5] bg-white flex items-center justify-center text-stone-600 hover:text-[#A25828]"
      >
        <MessageCircle className="w-4 h-4" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="w-9 h-9 rounded-full border border-[#E8E0D5] bg-white flex items-center justify-center text-stone-600 hover:text-[#A25828]"
      >
        <Facebook className="w-4 h-4" />
      </a>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(pageUrl);
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2500);
        }}
        aria-label="Copy link"
        className="h-9 px-3 rounded-full border border-[#E8E0D5] bg-white flex items-center justify-center gap-1.5 text-stone-600 hover:text-[#A25828] text-xs font-semibold"
      >
        {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
        <span>{copiedLink ? 'Copied' : 'Copy link'}</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      {/* Reading progress */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 pointer-events-none">
        <div className="pc-progress h-full bg-[#A25828]" style={{ transform: `scaleX(${progress})` }} />
      </div>

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-[#E8E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#8A786A] overflow-x-auto whitespace-nowrap scrollbar-none">
            <a href="/" onClick={(e) => { e.preventDefault(); setRoute({ name: 'home' }); }} className="hover:text-[#A25828]">Home</a>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <a href="/blog" onClick={(e) => { e.preventDefault(); setRoute({ name: 'blog' }); }} className="hover:text-[#A25828]">Buying Guides</a>
            {parentPillar && (
              <>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                <a
                  href={`/blog/${parentPillar.slug}`}
                  onClick={(e) => { e.preventDefault(); setRoute({ name: 'blog-detail', slug: parentPillar.slug }); }}
                  className="hover:text-[#A25828] truncate max-w-[200px]"
                >
                  {parentPillar.title}
                </a>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold text-[#221C18] truncate max-w-[280px]">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* ============ HERO ============ */}
      {isPillar ? (
        <header className="bg-white border-b border-[#E8E0D5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#A25828]">
                {layout.eyebrow || `Plush Comfort ${post.category} Guide`}
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#221C18] leading-[1.1]">{post.title}</h1>
              <p className="text-base sm:text-lg text-[#6B6159] leading-relaxed">{post.excerpt}</p>
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={() => navigate(layout.primaryCtaLink || (headings[0] ? `#${headings[0].id}` : '/shop'))}
                  className="bg-[#A25828] hover:bg-[#8A461A] text-white px-6 py-3 rounded-full text-sm font-semibold inline-flex items-center gap-2"
                >
                  {layout.primaryCtaText || 'Start Reading'} <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate(layout.secondaryCtaLink || `/category/${post.relatedCategorySlug || 'sofas'}`)}
                  className="bg-white border border-[#D5C7B7] hover:border-[#221C18] text-[#221C18] px-6 py-3 rounded-full text-sm font-semibold"
                >
                  {layout.secondaryCtaText || `Shop ${post.category}`}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8A786A] pt-2">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{post.lastUpdated ? `Updated ${post.lastUpdated}` : post.publishDate}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
                <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />{clusterChildren.length} supporting guides</span>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="aspect-[16/10] rounded-3xl overflow-hidden bg-[#F3EEE7] border border-[#E8E0D5] shadow-sm">
                <img src={post.coverImage} srcSet={srcSetFor(post.coverImage)} sizes="(max-width: 1024px) 94vw, 600px" alt={post.title} width={1600} height={1000} fetchPriority="high" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>
      ) : (
        <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="flex items-center gap-2 text-xs text-[#8A786A] font-medium flex-wrap mb-4">
            <span className="bg-[#FAF5EE] text-[#A25828] px-3 py-1 rounded-md font-bold uppercase tracking-wider border border-[#E8DFC5] text-[10px]">
              {post.contentType.replace(/_/g, ' ')}
            </span>
            <span className="bg-white px-2.5 py-1 rounded-md border border-[#E8E0D5] font-semibold text-stone-700">{post.category}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{post.publishDate}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.readTime}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#221C18] leading-tight">{post.title}</h1>
          <p className="text-base sm:text-lg text-[#6B6159] leading-relaxed mt-4">{post.excerpt}</p>
          <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-[#F3EEE7] border border-[#E8E0D5] mt-8 shadow-sm">
            <img src={post.coverImage} srcSet={srcSetFor(post.coverImage)} sizes="(max-width: 1024px) 94vw, 900px" alt={post.title} width={1600} height={900} fetchPriority="high" className="w-full h-full object-cover" />
          </div>
        </header>
      )}

      {/* ============ BODY ============ */}
      <div className={`${isPillar ? 'max-w-7xl' : 'max-w-6xl'} mx-auto px-4 sm:px-6 lg:px-8 pt-10`}>
        <div className={`grid gap-10 ${showToc ? 'lg:grid-cols-[260px_minmax(0,1fr)]' : ''}`}>
          {showToc && (
            <aside className="hidden lg:block">
              <div className="sticky top-32 space-y-5">
                <div className="p-5 rounded-2xl bg-white border border-[#E8E0D5]">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#221C18] mb-3">
                    <List className="w-4 h-4 text-[#A25828]" /> On this page
                  </div>
                  <TocList />
                </div>
                <div className="p-5 rounded-2xl bg-[#FAF5EE] border border-[#E8DFC5]">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#A25828] mb-2">Share this guide</div>
                  <ShareRow />
                </div>
              </div>
            </aside>
          )}

          <div className={`min-w-0 ${showToc ? 'max-w-3xl' : 'max-w-3xl mx-auto w-full'}`}>
            {showToc && (
              <div className="lg:hidden mb-6 rounded-2xl bg-white border border-[#E8E0D5]">
                <button onClick={() => setTocOpen(!tocOpen)} className="w-full p-4 flex items-center justify-between text-sm font-bold text-[#221C18]">
                  <span className="flex items-center gap-2"><List className="w-4 h-4 text-[#A25828]" /> On this page ({headings.length})</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${tocOpen ? 'rotate-180' : ''}`} />
                </button>
                {tocOpen && <div className="px-4 pb-4"><TocList onPick={() => setTocOpen(false)} /></div>}
              </div>
            )}

            {parentPillar && (
              <a
                href={`/blog/${parentPillar.slug}`}
                onClick={(e) => { e.preventDefault(); setRoute({ name: 'blog-detail', slug: parentPillar.slug }); }}
                className="mb-8 p-4 bg-[#FAF5EE] rounded-2xl border border-[#E8DFC5] flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-[#A25828] shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A25828] block">Part of the complete guide</span>
                    <span className="font-serif font-bold text-sm sm:text-base text-[#221C18] group-hover:text-[#A25828]">{parentPillar.title}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#A25828] shrink-0" />
              </a>
            )}

            {post.keyTakeaways && post.keyTakeaways.length > 0 && (
              <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-[#221C18] text-white">
                <div className="text-xs font-bold uppercase tracking-wider text-[#E8A87C] mb-3">Key takeaways</div>
                <ul className="space-y-2">
                  {post.keyTakeaways.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-stone-100">
                      <CheckCircle2 className="w-4 h-4 text-[#E8A87C] shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <article className="text-[#3C322C]">
              <RichContent
                content={post.content}
                onNavigate={navigate}
                products={products}
                chapterNumbers={isPillar && layout.showChapterNumbers !== false}
              />
            </article>

            {isPillar && clusterChildren.length > 0 && (
              <section className="mt-14">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#A25828]">Content cluster</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#221C18] mt-1 mb-6">Go deeper: guides in this series</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {clusterChildren.map((child) => (
                    <a
                      key={child.id}
                      href={`/blog/${child.slug}`}
                      onClick={(e) => { e.preventDefault(); setRoute({ name: 'blog-detail', slug: child.slug }); }}
                      className="group bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden hover:shadow-md transition-all"
                    >
                      <div className="aspect-[16/9] bg-[#F3EEE7] overflow-hidden">
                         <img src={thumbFor(child.coverImage, 800)} alt={child.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A25828]">{child.contentType.replace(/_/g, ' ')}</span>
                        <h3 className="font-serif font-bold text-base text-[#221C18] group-hover:text-[#A25828] mt-1 line-clamp-2">{child.title}</h3>
                        <span className="text-xs font-semibold text-[#A25828] inline-flex items-center gap-1 mt-2">Read article <ArrowRight className="w-3.5 h-3.5" /></span>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {post.faqs && post.faqs.length > 0 && (
              <section className="mt-14">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#221C18] mb-5">Frequently asked questions</h2>
                <div className="divide-y divide-[#EFEAE2] rounded-2xl border border-[#E8E0D5] bg-white">
                  {post.faqs.map((f, i) => (
                    <div key={i} className="px-5">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        aria-expanded={openFaq === i}
                        className="w-full py-4 flex items-center justify-between gap-3 text-left font-semibold text-[#221C18] hover:text-[#A25828]"
                      >
                        <span>{f.question}</span>
                        <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${openFaq === i ? 'rotate-180 text-[#A25828]' : ''}`} />
                      </button>
                      {openFaq === i && <p className="pb-4 text-sm text-[#5A4E46] leading-relaxed">{f.answer}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {relatedProducts.length > 0 && (
              <section className="mt-14 pt-10 border-t border-[#E8E0D5]">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#A25828] mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Featured in this guide</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#221C18] mb-6">Shop the pieces mentioned</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            )}

            <div className="mt-14 p-5 rounded-2xl bg-white border border-[#E8E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#A25828] text-white flex items-center justify-center font-serif font-bold text-lg">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A786A] block">Written by</span>
                  <span className="font-bold text-sm text-[#221C18]">{post.author}</span>
                  {post.authorRole && <span className="text-xs text-stone-500 block">{post.authorRole}</span>}
                </div>
              </div>
              <ShareRow />
            </div>

            {siblingArticles.length > 0 && (
              <section className="mt-14">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#221C18] mb-5">Keep reading</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {siblingArticles.map((a) => (
                    <a
                      key={a.id}
                      href={`/blog/${a.slug}`}
                      onClick={(e) => { e.preventDefault(); setRoute({ name: 'blog-detail', slug: a.slug }); }}
                      className="group bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden"
                    >
                       <img src={thumbFor(a.coverImage)} alt={a.title} loading="lazy" className="w-full aspect-[16/10] object-cover" />
                      <div className="p-3">
                        <h3 className="font-serif font-bold text-sm text-[#221C18] group-hover:text-[#A25828] line-clamp-2">{a.title}</h3>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="mt-16 p-8 sm:p-10 bg-[#221C18] rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl">{layout.closingTitle || 'Found the right size and fabric?'}</h2>
            <p className="text-sm text-stone-300 max-w-xl">
              {layout.closingText || 'Free UK delivery, a 1 year warranty and cash on delivery on every order. Questions? Our team replies on WhatsApp Mon–Sat.'}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate(layout.closingCtaLink || `/category/${post.relatedCategorySlug || 'sofas'}`)}
              className="bg-[#A25828] hover:bg-[#8A461A] text-white px-6 py-3 rounded-full text-sm font-bold"
            >
              {layout.closingCtaText || `Shop ${post.category}`}
            </button>
            <button onClick={() => setRoute({ name: 'contact' })} className="border border-white/30 hover:border-white text-white px-5 py-3 rounded-full text-sm font-semibold">
              Ask Our Team
            </button>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button onClick={() => setRoute({ name: 'blog' })} className="inline-flex items-center gap-2 text-xs font-bold text-[#A25828] hover:underline cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            <span>All buying guides</span>
          </button>
        </div>
      </div>
    </div>
  );
};
