import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { HomepageSection, Product } from '../types';
import { DEFAULT_HOMEPAGE_SECTIONS } from '../data/initialData';
import { srcSetFor, thumbFor } from '../utils/responsiveImage';
import {
  Play,
  ArrowRight,
  Sparkles,
  X,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShoppingBag,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setRoute, products, categories, blogPosts, trackEvent, addToCart, toggleWishlist, wishlist, settings } = useStore();

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  // Hero showcase = real products chosen in Dashboard → Store Design → Homepage → Hero
  const DEFAULT_SHOWCASE_IDS = ['prod-216', 'prod-194', 'prod-223', 'prod-180', 'prod-130'];
  const showcaseIds =
    settings.heroDesign?.showcaseProductIds && settings.heroDesign.showcaseProductIds.length > 0
      ? settings.heroDesign.showcaseProductIds
      : DEFAULT_SHOWCASE_IDS;
  let showcaseProducts = showcaseIds
    .map((id) => products.find((p) => p.id === id && p.isPublished))
    .filter(Boolean) as Product[];
  if (showcaseProducts.length === 0) {
    showcaseProducts = products.filter((p) => p.isPublished && p.isFeatured).slice(0, 5);
  }
  if (showcaseProducts.length === 0) showcaseProducts = products.filter((p) => p.isPublished).slice(0, 5);

  const heroShowpieces = showcaseProducts.map((p) => {
    const defaultVar = p.variations?.find((v) => v.isDefault);
    const price = defaultVar ? defaultVar.salePrice ?? defaultVar.price : p.salePrice ?? p.price;
    const regularPrice = defaultVar ? defaultVar.price : p.price;
    const cat = categories.find((c) => c.id === p.categoryId);
    return {
      id: p.id,
      title: p.name,
      subtitle: p.shortDescription,
      price,
      regularPrice,
      saveAmount: Math.max(0, Math.round(regularPrice - price)),
      slug: p.slug,
      image: p.images[0],
      imageAlt: p.imageGallery?.[0]?.alt || p.name,
      badge: p.isTrending ? `Bestseller · ${cat?.name || 'Furniture'}` : cat?.name || 'Featured',
      specs: (p.materials || []).slice(0, 4),
      variationId: defaultVar?.id,
      configuration: defaultVar?.configuration,
    };
  });

  const heroTrustPoints =
    settings.heroDesign?.trustPoints && settings.heroDesign.trustPoints.length > 0
      ? settings.heroDesign.trustPoints
      : [
          { strong: '1 Year', text: 'Warranty' },
          { strong: 'Free UK', text: 'Mainland Delivery' },
          { strong: '30-Day', text: 'Exchange / Return' },
          { strong: 'Cash', text: 'on Delivery' },
        ];
  const heroTrustIcons = [ShieldCheck, Truck, RotateCcw, CheckCircle2];

  const videoUrl = (settings.heroDesign?.videoUrl || '').trim();
  const showVideoButton = settings.heroDesign?.showVideoButton !== false && Boolean(videoUrl);
  const getVideoEmbed = (url: string): { type: 'iframe' | 'video'; src: string } | null => {
    if (!url) return null;
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    if (yt) return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0` };
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeo) return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1` };
    return { type: 'video', src: url };
  };

  const currentHero = heroShowpieces[Math.min(activeHeroIndex, Math.max(0, heroShowpieces.length - 1))];

  // Resolve ordered homepage sections from StoreSettings or initial defaults
  const orderedSections: HomepageSection[] = (settings.homepageSections || DEFAULT_HOMEPAGE_SECTIONS)
    .slice()
    .sort((a, b) => a.order - b.order);

  // Helper to resolve products for a section (uses section.productIds if defined, else fallback list)
  const resolveSectionProducts = (sectionId: string, fallback: () => Product[]): Product[] => {
    const sec = orderedSections.find((s) => s.id === sectionId);
    if (sec?.productIds && sec.productIds.length > 0) {
      const resolved = sec.productIds
        .map((id) => products.find((p) => p.id === id && p.isPublished))
        .filter(Boolean) as Product[];
      if (resolved.length > 0) return resolved;
    }
    return fallback();
  };

  const trendingProducts = resolveSectionProducts('trending', () =>
    products.filter((p) => p.isPublished).slice(0, 5)
  );

  const under2500Products = resolveSectionProducts('under_2500', () =>
    products.filter((p) => p.isPublished && (p.salePrice ?? p.price) <= 2500).slice(0, 4)
  );

  const sofaProducts = resolveSectionProducts('sofas', () =>
    products
      .filter((p) => p.isPublished && (p.categoryId.includes('sofa') || p.categoryId === 'cat-armchairs'))
      .slice(0, 4)
  );

  const bedProducts = resolveSectionProducts('beds', () =>
    products
      .filter((p) => p.isPublished && (p.categoryId.includes('bed') || p.categoryId === 'cat-mattresses'))
      .slice(0, 4)
  );

  const inspirationPosts = blogPosts.filter((b) => b.isPublished).slice(0, 3);
  const isCurrentWishlisted = currentHero && wishlist.includes(currentHero.id);

  // Section Renderer
  const renderSection = (section: HomepageSection) => {
    if (!section.isVisible) return null;

    switch (section.id) {
      case 'hero':
        if (!currentHero) return null;
        return (
          <section key="hero" className="relative overflow-hidden pt-6 pb-12 lg:pt-10 lg:pb-20 border-b border-[#ECE3D5]">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#B3642C]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 left-10 w-96 h-96 bg-[#221C18]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
                {/* Left Column */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#B3642C]/10 border border-[#B3642C]/20 text-xs font-bold tracking-widest text-[#A25828] uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-[#A25828]" />
                    <span>{section.subtitle || 'Premium UK Online Furniture Store'}</span>
                  </div>

                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#221C18] leading-[1.12]">
                    {settings.heroDesign?.heading || 'Luxury Sofas & Beds, Delivered Across the UK'}
                  </h1>

                  <p className="text-sm sm:text-base text-[#665B53] font-normal leading-relaxed">
                    {settings.heroDesign?.subheading ||
                      'Premium sofas, corner suites and ottoman beds — ordered online and delivered free to your door.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      onClick={() => {
                        trackEvent('product_view', 'hero_cta', 'Hero primary CTA');
                        const ctaLink = settings.heroDesign?.primaryCtaLink;
                        if (ctaLink?.startsWith('/category/')) {
                          setRoute({ name: 'category', categorySlug: ctaLink.replace('/category/', '') });
                        } else if (ctaLink?.startsWith('/product/')) {
                          setRoute({ name: 'product', slug: ctaLink.replace('/product/', '') });
                        } else if (ctaLink === '/shop') {
                          setRoute({ name: 'shop' });
                        } else {
                          setRoute({ name: 'product', slug: currentHero.slug });
                        }
                      }}
                      className="bg-[#A25828] hover:bg-[#8A461A] text-white px-7 py-3.5 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center gap-2 group"
                    >
                      <span>{settings.heroDesign?.primaryCtaText || 'Shop Sofas'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {showVideoButton && (
                      <button
                        onClick={() => setVideoModalOpen(true)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#221C18] hover:text-[#A25828] py-3.5 px-4 rounded-full transition-colors cursor-pointer group"
                      >
                        <div className="w-9 h-9 rounded-full bg-white shadow-xs border border-[#E8E0D5] flex items-center justify-center text-[#A25828] group-hover:scale-105 transition-transform">
                          <Play className="w-4 h-4 fill-[#A25828] ml-0.5" />
                        </div>
                        <span>{settings.heroDesign?.videoButtonText || 'Watch Video'}</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#EAE1D4] grid grid-cols-2 gap-3 text-xs text-[#5A4F46]">
                    {heroTrustPoints.slice(0, 4).map((tp, i) => {
                      const Icon = heroTrustIcons[i] || CheckCircle2;
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-[#A25828] shrink-0" />
                          <span><strong>{tp.strong}</strong> {tp.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column Showcase */}
                <div className="lg:col-span-7 relative">
                  <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-xl border border-[#E8DFD3] relative overflow-hidden group">
                    {/* Full-size product image (changes when a thumbnail below is clicked) */}
                    <a
                      href={`/product/${currentHero.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setRoute({ name: 'product', slug: currentHero.slug });
                      }}
                      className="block w-full aspect-[16/10] bg-[#F3EEE7] rounded-2xl overflow-hidden relative cursor-pointer"
                    >
                      <img
                        key={currentHero.id}
                        src={currentHero.image}
                        srcSet={srcSetFor(currentHero.image)}
                        sizes="(max-width: 1024px) 94vw, 700px"
                        alt={currentHero.imageAlt}
                        width={1200}
                        height={750}
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-full object-cover animate-fade-in transition-transform duration-700 group-hover:scale-[1.03]"
                      />

                      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-white/95 backdrop-blur-xs text-[#A25828] font-bold text-xs px-3 py-1 rounded-full shadow-xs">
                            {currentHero.badge}
                          </span>
                          {currentHero.saveAmount > 0 && (
                            <span className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-xs">
                              Save £{currentHero.saveAmount}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(currentHero.id);
                          }}
                          aria-label="Save to wishlist"
                          className="p-2 rounded-full bg-white/95 hover:bg-white text-[#736961] hover:text-[#A25828] transition-colors cursor-pointer shadow-xs"
                        >
                          <Heart className={`w-4 h-4 ${isCurrentWishlisted ? 'fill-[#A25828] text-[#A25828]' : ''}`} />
                        </button>
                      </div>

                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="bg-white/95 backdrop-blur-xs text-[#221C18] text-xs font-bold px-4 py-2 rounded-full shadow-md flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-[#A25828]" />
                          <span>View Product Details</span>
                        </span>
                      </div>
                    </a>

                    <div className="mt-4 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h2
                          onClick={() => setRoute({ name: 'product', slug: currentHero.slug })}
                          className="font-serif font-bold text-lg text-[#221C18] hover:text-[#A25828] cursor-pointer transition-colors truncate"
                        >
                          {currentHero.title}
                        </h2>
                        <p className="text-xs text-[#736961] mt-0.5 line-clamp-1">{currentHero.subtitle}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-serif font-bold text-2xl text-[#221C18]">£{currentHero.price.toLocaleString('en-GB')}</span>
                          {currentHero.regularPrice > currentHero.price && (
                            <span className="text-sm text-stone-400 line-through">£{currentHero.regularPrice.toLocaleString('en-GB')}</span>
                          )}
                        </div>
                        <button
                          onClick={() => addToCart(currentHero.id, 1, undefined, undefined, undefined, currentHero.variationId, currentHero.configuration, currentHero.price)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#A25828] hover:bg-[#8A461A] px-3.5 py-2 rounded-full transition-colors cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Basket</span>
                        </button>
                      </div>
                    </div>

                    {currentHero.specs.length > 0 && (
                      <div className="mt-3 mx-1 flex flex-wrap gap-1.5 pt-3 border-t border-dashed border-[#F0E8DC]">
                        {currentHero.specs.map((spec, i) => (
                          <span key={i} className="text-[11px] bg-[#FAF7F2] text-[#63554B] px-2.5 py-1 rounded-md border border-[#EFE7DC] font-medium">
                            ✓ {spec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Thumbnails — clicking one swaps the featured image above */}
                  <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Featured products">
                    {heroShowpieces.map((piece, idx) => (
                      <button
                        key={piece.id}
                        role="tab"
                        aria-selected={activeHeroIndex === idx}
                        onClick={() => setActiveHeroIndex(idx)}
                        className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border text-left shrink-0 transition-all cursor-pointer ${
                          activeHeroIndex === idx
                            ? 'bg-white border-[#A25828] shadow-sm'
                            : 'bg-[#F7F2EC] border-[#E8DFD3] hover:bg-white text-[#736961]'
                        }`}
                      >
                        <div className="w-12 h-9 rounded-lg overflow-hidden bg-[#FAF8F5] shrink-0 border border-[#ECE2D5]">
                          <img src={thumbFor(piece.image)} alt="" loading="lazy" width={48} height={36} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold line-clamp-1 max-w-[120px] ${activeHeroIndex === idx ? 'text-[#221C18]' : 'text-[#685D54]'}`}>
                            {piece.title.split(' ').slice(0, 2).join(' ')}
                          </span>
                          <span className="text-[10px] text-[#A25828] font-semibold">£{piece.price.toLocaleString('en-GB')}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'dual_promos':
        return (
          <section key="dual_promos" className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {/* Card 1 */}
                <a
                  href="/category/corner-sofas"
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute({ name: 'category', categorySlug: 'corner-sofas' });
                  }}
                  className="bg-[#F7F2EC] rounded-3xl p-8 sm:p-10 border border-[#EAE2D8] flex flex-col sm:flex-row items-center justify-between relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 block"
                >
                  <div className="z-10 max-w-xs space-y-2 mb-6 sm:mb-0">
                    <span className="text-[11px] font-bold text-[#A25828] uppercase tracking-wider">
                      {section.subtitle || 'Living Room Collection'}
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#221C18]">
                      {section.title || 'Corner & Chesterfield Sofas'}
                    </h2>
                    <p className="text-sm text-[#736961]">
                      {section.description || 'From deep buttoned L-shapes to grand double-chaise suites. From £950.'}
                    </p>
                    <div className="pt-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#A25828] group-hover:bg-[#8A461A] px-4 py-2 rounded-full transition-all">
                        Shop Sofas ({products.filter((p) => p.categoryId.includes('sofa')).length} Models) <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  <div className="w-full sm:w-1/2 max-w-[280px] aspect-[4/3] flex items-center justify-center">
                    <img
                      src={thumbFor(section.image || '/uploads/products/nicole-3-seater-chesterfield-sofa-in-soft-cream-fabric-1.webp', 800)}
                      loading="lazy"
                      alt="Nicole 3-Seater Chesterfield Sofa in Soft Cream"
                      className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </a>

                {/* Card 2 */}
                <a
                  href="/category/beds-bed-frames"
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute({ name: 'category', categorySlug: 'beds-bed-frames' });
                  }}
                  className="bg-[#F4EFE7] rounded-3xl p-8 sm:p-10 border border-[#EAE2D8] flex flex-col sm:flex-row items-center justify-between relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 block"
                >
                  <div className="z-10 max-w-xs space-y-2 mb-6 sm:mb-0">
                    <span className="text-[11px] font-bold text-[#A25828] uppercase tracking-wider">
                      Bespoke British Sleep
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#221C18]">
                      Luxury Beds &amp; Ottomans
                    </h2>
                    <p className="text-sm text-[#736961]">
                      Hand-tufted 54-inch headboards &amp; German hydraulic gas-lift bases. From £850.
                    </p>
                    <div className="pt-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#A25828] group-hover:bg-[#8A461A] px-4 py-2 rounded-full transition-all">
                        Shop Beds &amp; Sets <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  <div className="w-full sm:w-1/2 max-w-[280px] aspect-[4/3] flex items-center justify-center">
                    <img
                      src="/uploads/products/ambassador-luxury-deep-buttoned-upholstered-bed-frame-1-800.webp"
                      loading="lazy"
                      alt="Ambassador Luxury Deep-Buttoned Bed Frame"
                      className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </a>
              </div>
            </div>
          </section>
        );

      case 'categories':
        return (
          <section key="categories" className="py-12 bg-[#F5EFE6]/50 border-y border-[#ECE3D5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#A25828]">
                    {section.subtitle || 'Curated British Catalog'}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#221C18] mt-1">
                    {section.title || 'Shop by Category'}
                  </h2>
                </div>
                <a
                  href="/shop"
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute({ name: 'shop' });
                  }}
                  className="text-xs font-semibold text-[#A25828] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All Products &rarr;
                </a>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {categories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setRoute({ name: 'category', categorySlug: cat.slug });
                    }}
                    className="group bg-white rounded-2xl border border-[#EBE2D5] hover:border-[#A25828] p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-md block"
                  >
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#FAF7F2] flex items-center justify-center mb-3">
                      <img
                        src={thumbFor(cat.image)}
                        alt={cat.name}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-[#221C18] group-hover:text-[#A25828] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-[#736961] line-clamp-1 mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                    <div className="pt-2 flex items-center text-[11px] font-semibold text-[#A25828] gap-1 group-hover:gap-2 transition-all">
                      <span>Browse</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        );

      case 'trending':
        return (
          <section key="trending" className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[#A25828]">
                  {section.subtitle || 'Plush Comfort UK Bestsellers'}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#221C18]">
                  {section.title || 'Trending Customer Favourites'}
                </h2>
                <p className="text-sm text-[#736961]">
                  {section.description ||
                    'Our most-loved sofas and beds — free UK delivery, 1 year warranty and cash on delivery.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
                {trendingProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        );

      case 'under_2500':
        return (
          <section key="under_2500" className="py-14 bg-[#FAF5EE] border-y border-[#ECE2D5]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A25828]/10 text-[#A25828] text-xs font-bold uppercase tracking-wider mb-2 border border-[#A25828]/20">
                    <Sparkles className="w-3 h-3 text-[#A25828]" />
                    <span>{section.subtitle || 'Luxury Within Reach'}</span>
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#221C18]">
                    {section.title || 'Shop Furniture Under £2,500'}
                  </h2>
                  <p className="text-sm text-[#736961] mt-1 max-w-2xl">
                    {section.description ||
                      'Quality frames, deep foam seating and premium fabrics at honest online prices.'}
                  </p>
                </div>
                <a
                  href="/shop"
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute({ name: 'shop' });
                  }}
                  className="text-xs font-semibold text-[#A25828] hover:text-[#8A461A] flex items-center gap-1.5 cursor-pointer bg-white px-4 py-2 rounded-full border border-[#D5C7B7] hover:border-[#A25828] transition-colors shrink-0 shadow-xs"
                >
                  <span>Explore Furniture Under £2,500</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {under2500Products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        );

      case 'sofas':
        return sofaProducts.length > 0 ? (
          <section key="sofas" className="py-12 bg-white border-y border-[#EAE2D8]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#A25828]">
                    {section.subtitle || 'Sofas & Living Room'}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#221C18] mt-1">
                    {section.title || 'Sofas & Living Room Suites'}
                  </h2>
                  <p className="text-sm text-[#736961] mt-1">
                    {section.description ||
                      'Kiln-dried beech frames, high-tensile serpentine springs, and stain-resistant luxury velvets.'}
                  </p>
                </div>
                <a
                  href="/category/sofas"
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute({ name: 'category', categorySlug: 'sofas' });
                  }}
                  className="text-xs font-semibold text-[#A25828] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  Explore All Sofas &rarr;
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {sofaProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        ) : null;

      case 'beds':
        return bedProducts.length > 0 ? (
          <section key="beds" className="py-12 bg-[#FAF7F2] border-b border-[#EAE2D8]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#A25828]">
                    {section.subtitle || 'Bespoke Bedroom Storage'}
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#221C18] mt-1">
                    {section.title || 'Luxury Beds & Ottoman Frames'}
                  </h2>
                  <p className="text-sm text-[#736961] mt-1">
                    {section.description ||
                      'German hydraulic gas pistons, reinforced timber slats, and deep diamond wingback headboards.'}
                  </p>
                </div>
                <a
                  href="/category/beds-bed-frames"
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute({ name: 'category', categorySlug: 'beds-bed-frames' });
                  }}
                  className="text-xs font-semibold text-[#A25828] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  Explore All Beds &rarr;
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {bedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        ) : null;

      case 'deal_banner':
        return (
          <section key="deal_banner" className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-[#F8EDE3] rounded-3xl p-8 sm:p-12 border border-[#EBDCCF] relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <span className="text-xs font-bold text-[#8A786A] uppercase tracking-wider">
                      {section.subtitle || 'Limited Autumn Promotion · Free UK Delivery'}
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#221C18] leading-tight">
                      {section.title ? (
                        <span>{section.title}</span>
                      ) : (
                        <>
                          Save up to <span className="text-[#B3642C]">£400 Off</span>
                          <br />
                          Handcrafted Suites
                        </>
                      )}
                    </h2>
                    <p className="text-sm text-[#665B53] max-w-md leading-relaxed">
                      {section.description ||
                        'Every order includes free UK mainland delivery, a 1 year warranty, 30-day exchange or return, and cash on delivery.'}
                    </p>

                    <div className="pt-2 flex items-center gap-4">
                      <button
                        onClick={() => {
                          trackEvent('category_view', 'promo_banner', 'Grab the Deal Banner');
                          const dest = section.ctaLink || '/shop';
                          if (dest === '/shop') setRoute({ name: 'shop' });
                          else if (dest.startsWith('/category/')) setRoute({ name: 'category', categorySlug: dest.replace('/category/', '') });
                          else setRoute({ name: 'shop' });
                        }}
                        className="bg-[#A25828] hover:bg-[#8A461A] text-white px-7 py-3.5 rounded-full text-sm font-semibold shadow-md transition-colors cursor-pointer"
                      >
                        {section.ctaText || 'Shop Autumn Sale'}
                      </button>

                      <svg
                        className="w-16 h-8 text-[#A25828] stroke-current fill-none hidden sm:block"
                        viewBox="0 0 60 30"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M 5 22 Q 35 30 50 12" />
                        <polyline points="42,8 52,11 49,20" />
                      </svg>
                    </div>
                  </div>

                  <div className="lg:col-span-6 flex items-center justify-center">
                    <div className="w-full max-w-lg aspect-[16/10] flex items-center justify-center">
                      <img
                        src={thumbFor(section.image || '/uploads/products/nicole-32-chesterfield-sofa-set-in-soft-fabric-with-studded-detail-1.webp', 800)}
                        loading="lazy"
                        alt={section.title || 'Nicole 3+2 Chesterfield Sofa Set'}
                        className="w-full h-full object-contain filter drop-shadow-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case 'guides':
        return (
          <section key="guides" className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-left mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#221C18]">
                    {section.title || 'Home Inspiration & Buying Guides'}
                  </h2>
                  <p className="text-sm text-[#736961] mt-1">
                    {section.description ||
                      'Expert British upholstery guides, doorway clearances & hydraulic ottoman storage advice.'}
                  </p>
                </div>
                <button
                  onClick={() => setRoute({ name: 'blog' })}
                  className="text-xs font-semibold text-[#A25828] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All Buying Guides &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {inspirationPosts.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => setRoute({ name: 'blog-detail', slug: post.slug })}
                    className="group bg-white rounded-2xl border border-[#EFEAE2] hover:border-[#D5C7B7] overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:shadow-md"
                  >
                    <div className="aspect-[16/10] bg-[#F5EFE6] overflow-hidden flex items-center justify-center">
                      <img
                        src={post.coverImage}
                        srcSet={srcSetFor(post.coverImage)}
                        sizes="(max-width: 768px) 92vw, 400px"
                        loading="lazy"
                        decoding="async"
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-5 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#8A786A] mb-2 font-medium">
                          <span>{post.publishDate}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#A25828]">{post.tags[0]}</span>
                        </div>

                        <h3 className="font-serif font-bold text-base text-[#221C18] group-hover:text-[#A25828] transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                      </div>

                      <div className="pt-4 flex items-center text-xs font-semibold text-[#A25828] gap-1 group-hover:gap-2 transition-all">
                        <span>Read Article</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Dynamic Ordered Homepage Sections Managed via Dashboard */}
      {orderedSections.map((sec) => (
        <React.Fragment key={sec.id}>
          {renderSection(sec)}
        </React.Fragment>
      ))}

      {/* Video modal — link is set in Dashboard → Store Design → Homepage → Hero → Video button */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setVideoModalOpen(false)} />
          <div className="relative bg-white rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl z-10 animate-fade-in border border-[#E8E0D5]">
            <div className="flex items-center justify-between pb-3">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#221C18]">
                {settings.heroDesign?.videoTitle || 'See Plush Comfort in Action'}
              </h3>
              <button
                onClick={() => setVideoModalOpen(false)}
                aria-label="Close video"
                className="p-1 rounded-full text-stone-400 hover:text-stone-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              {(() => {
                const embed = getVideoEmbed(videoUrl);
                if (!embed) return null;
                return embed.type === 'iframe' ? (
                  <iframe
                    src={embed.src}
                    title={settings.heroDesign?.videoTitle || 'Plush Comfort video'}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <video src={embed.src} className="w-full h-full" controls autoPlay playsInline />
                );
              })()}
            </div>
            {settings.heroDesign?.videoDescription && (
              <p className="text-sm text-stone-600 mt-4">{settings.heroDesign.videoDescription}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
