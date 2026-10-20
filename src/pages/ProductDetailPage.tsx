import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { getProductFallbackImage } from '../utils/imageHelper';
import { srcSetFor, thumbFor } from '../utils/responsiveImage';
import { ProductVariation } from '../types';
import {
  Heart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  Layers,
  Ruler,
  HelpCircle,
  Tag,
  CheckCircle2,
} from 'lucide-react';

interface ProductDetailPageProps {
  slug: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug }) => {
  const {
    products,
    categories,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setRoute,
    settings,
    trackEvent,
  } = useStore();

  const product = products.find((p) => p.slug === slug);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColour, setSelectedColour] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'delivery' | 'care' | 'reviews'>('specs');
  const [zoomActive, setZoomActive] = useState(false);
  const [wishlistToast, setWishlistToast] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedColour(product.colours[0]?.name || '');
      setSelectedSize(product.sizes?.[0] || '');
      setQuantity(1);
      setActiveImageIndex(0);

      // Initialize selected variation (default option or first option)
      if (product.variations && product.variations.length > 0) {
        const defaultVar = product.variations.find((v) => v.isDefault) || product.variations[0];
        setSelectedVariation(defaultVar);
      } else {
        setSelectedVariation(null);
      }

      const activeInitialPrice = product.variations?.[0]?.salePrice ?? product.variations?.[0]?.price ?? product.salePrice ?? product.price;
      trackEvent('product_view', product.id, product.name, undefined, activeInitialPrice);

      // Dynamic SEO Title & Meta Description update
      const pageTitle = product.seoTitle || `${product.name} | Handcrafted British Furniture | Plush Comfort UK`;
      document.title = pageTitle;

      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          product.seoDescription || product.shortDescription || `Buy the ${product.name} online at Plush Comfort UK. Free UK delivery, 1 year warranty and cash on delivery.`
        );
      }
    }
  }, [product, slug]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-bold">Furniture Piece Not Found</h1>
        <p className="text-stone-500 mt-2">The requested piece may have been updated or moved.</p>
        <button
          onClick={() => setRoute({ name: 'shop' })}
          className="mt-6 bg-[#A25828] text-white px-6 py-2.5 rounded-full text-xs font-semibold"
        >
          Explore All Furniture
        </button>
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const isWishlisted = isInWishlist(product.id);

  // Gallery follows the selected colour (if that colour has its own photos)
  const selectedColourObj = product.colours.find((c) => c.name === selectedColour);
  const galleryImages =
    selectedColourObj?.images && selectedColourObj.images.length > 0
      ? selectedColourObj.images
      : selectedColourObj?.image
      ? [selectedColourObj.image, ...product.images.filter((i) => i !== selectedColourObj.image)]
      : product.images;
  const handleSelectColour = (name: string) => {
    setSelectedColour(name);
    setActiveImageIndex(0);
  };

  // Dynamic pricing based on selected variation
  const activePrice = selectedVariation
    ? (selectedVariation.salePrice ?? selectedVariation.price)
    : (product.salePrice ?? product.price);

  const activeRegularPrice = selectedVariation
    ? selectedVariation.price
    : product.price;

  const hasDiscount = selectedVariation?.salePrice
    ? selectedVariation.salePrice < selectedVariation.price
    : (product.salePrice && product.salePrice < product.price);

  const currentSku = selectedVariation?.sku || product.sku;
  const currentStock = selectedVariation ? selectedVariation.stock : product.stock;

  // Related & Complementary Products
  const relatedProducts = products.filter(
    (p) => p.isPublished && product.relatedProductIds.includes(p.id)
  );
  const complementaryProducts = products.filter(
    (p) => p.isPublished && product.complementaryProductIds.includes(p.id)
  );

  const handleAddToCart = () => {
    addToCart(
      product.id,
      quantity,
      selectedColour,
      selectedSize,
      undefined,
      selectedVariation?.id,
      selectedVariation?.configuration || selectedVariation?.name,
      activePrice
    );
  };

  const handleSelectVariation = (v: ProductVariation) => {
    setSelectedVariation(v);
    if (v.image) {
      const idx = galleryImages.indexOf(v.image);
      if (idx >= 0) setActiveImageIndex(idx);
    }
    if (v.colour && product.colours.some((c) => c.name === v.colour && (c.images?.length || 0) > 0)) {
      setSelectedColour(v.colour);
      setActiveImageIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
      {/* 1. BREADCRUMBS */}
      <div className="bg-white border-b border-[#E8E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs text-[#8A786A] overflow-x-auto whitespace-nowrap">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setRoute({ name: 'home' });
              }}
              className="hover:text-[#A25828] cursor-pointer"
            >
              Home
            </a>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            {category && (
              <>
                <a
                  href={`/category/${category.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute({ name: 'category', categorySlug: category.slug });
                  }}
                  className="hover:text-[#A25828] cursor-pointer"
                >
                  {category.name}
                </a>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </>
            )}
            <span className="font-semibold text-[#221C18] truncate">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* 2. MAIN PURCHASE MODULE (2-Column Grid) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Column: Image Gallery & Zoom */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div
              className="relative w-full aspect-[4/3] rounded-3xl bg-white border border-[#E8E0D5] overflow-hidden flex items-center justify-center p-4 cursor-crosshair group shadow-xs"
              onMouseEnter={() => setZoomActive(true)}
              onMouseLeave={() => setZoomActive(false)}
            >
              <img
                key={galleryImages[activeImageIndex]}
                src={galleryImages[activeImageIndex] || galleryImages[0] || getProductFallbackImage(product.name, product.categoryId)}
                srcSet={srcSetFor(galleryImages[activeImageIndex] || galleryImages[0])}
                sizes="(max-width: 1024px) 94vw, 720px"
                alt={`${product.name}${selectedColour ? ` in ${selectedColour}` : ''}`}
                width={1200}
                height={900}
                fetchPriority="high"
                className={`w-full h-full object-contain transition-transform duration-300 ${
                  zoomActive ? 'scale-125' : 'scale-100'
                }`}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getProductFallbackImage(product.name, product.categoryId);
                }}
              />

              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-[#A25828] text-white text-xs font-bold px-3 py-1 rounded-md shadow-sm">
                  Save £{(product.price - product.salePrice!).toFixed(2)}
                </span>
              )}

              <button
                onClick={() => {
                  toggleWishlist(product.id);
                  setWishlistToast(true);
                  setTimeout(() => setWishlistToast(false), 3500);
                }}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
                  isWishlisted
                    ? 'bg-red-50 text-red-500 border border-red-200'
                    : 'bg-white/90 text-stone-600 hover:text-[#A25828] hover:bg-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
              </button>

              <span className="absolute bottom-3 right-4 text-[11px] text-stone-400 bg-white/80 px-2 py-0.5 rounded backdrop-blur-xs">
                Hover to zoom
              </span>
            </div>

            {/* Thumbnail Row */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 rounded-xl bg-white border-2 overflow-hidden p-1 shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#A25828] ring-2 ring-[#A25828]/20'
                        : 'border-[#E8E0D5] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={thumbFor(img)} alt={`${product.name} photo ${idx + 1}`} loading="lazy" width={80} height={80} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              {/* Product Category & SKU */}
              <div className="flex items-center justify-between text-xs text-[#8A786A] mb-1 font-medium">
                <span>{category?.name || 'Handcrafted Furniture'}</span>
                <span className="font-mono text-[11px]">SKU: {currentSku}</span>
              </div>

              {/* Product Title */}
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#221C18] leading-tight">
                {product.name}
              </h1>

              {/* Review Stars & Verified Count (only when the product has real reviews) */}
              {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#221C18]">
                  {product.rating}
                </span>
                <span className="text-xs text-[#8A786A]">
                  ({product.reviewCount} verified UK reviews)
                </span>
              </div>
              )}
            </div>

            {/* Price Box & Stock Indicator */}
            <div className="p-4 rounded-2xl bg-white border border-[#E8E0D5] flex items-center justify-between shadow-2xs">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-[#221C18] tabular-nums">
                    £{activePrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-stone-400 line-through tabular-nums">
                      £{activeRegularPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                {currentStock > 0 ? (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>In Stock ({currentStock} available)</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">
                    <span>Handcrafted to order (2 weeks)</span>
                  </div>
                )}
              </div>
            </div>

            {/* PRODUCT VARIATION / SUITE SELECTOR (Daals & Furniture Village Style) */}
            {product.variations && product.variations.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#A25828]" />
                    <span>Suite Configuration &amp; Size:</span>
                  </span>
                  {selectedVariation && (
                    <span className="text-[#A25828] font-bold">
                      {selectedVariation.name || selectedVariation.configuration}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.variations.map((v) => {
                    const isSelected = selectedVariation?.id === v.id;
                    const vPrice = v.salePrice ?? v.price;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectVariation(v)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-[#A25828] bg-[#FAF2EB]/60 ring-2 ring-[#A25828]/20 shadow-xs'
                            : 'border-stone-200 bg-white hover:border-[#D5C7B7]'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${isSelected ? 'text-[#8A461A]' : 'text-stone-900'}`}>
                              {v.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono block">
                            SKU: {v.sku}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className={`text-xs font-bold tabular-nums block ${isSelected ? 'text-[#A25828]' : 'text-stone-800'}`}>
                            £{vPrice.toFixed(0)}
                          </span>
                          <span className={`text-[9px] font-semibold ${v.stock > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {v.stock > 0 ? `${v.stock} in stock` : 'Made to order'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Colour Variant Selector */}
            {product.colours.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-stone-800">
                    Fabric &amp; Colour:
                  </span>
                  <span className="text-[#A25828] font-bold">
                    {selectedColour}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.colours.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => handleSelectColour(col.name)}
                      aria-pressed={selectedColour === col.name}
                      title={col.images?.length ? `${col.name} — ${col.images.length} photo(s)` : col.name}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                        selectedColour === col.name
                          ? 'border-[#A25828] bg-white ring-2 ring-[#A25828]/20 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-400'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Variant Selector (if no modular variations or for supplementary dimension) */}
            {(!product.variations || product.variations.length === 0) && product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-stone-800">
                    Configuration &amp; Sizing:
                  </span>
                  <span className="text-[#A25828] font-bold">
                    {selectedSize}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        selectedSize === s
                          ? 'border-[#A25828] bg-[#A25828] text-white shadow-xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions: Quantity Stepper, Add to Basket & Add to Wishlist */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#D5C7B7] rounded-full bg-white px-2 py-1.5 shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 text-stone-600 hover:text-black cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-sm font-bold text-[#221C18] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 text-stone-600 hover:text-black cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#A25828] hover:bg-[#8A461A] text-white py-3.5 px-6 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Add to Basket</span>
                  <span>·</span>
                  <span className="tabular-nums">£{(activePrice * quantity).toFixed(2)}</span>
                </button>
              </div>

              {/* Dedicated Add to Wishlist Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    toggleWishlist(product.id);
                    setWishlistToast(true);
                    setTimeout(() => setWishlistToast(false), 3500);
                  }}
                  className={`flex-1 py-3 px-5 rounded-full text-xs font-bold transition-all border flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
                    isWishlisted
                      ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                      : 'bg-white text-stone-800 border-[#D5C7B7] hover:border-[#A25828] hover:text-[#A25828]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isWishlisted ? 'Saved in Wishlist (Click to remove)' : 'Save to Wishlist'}</span>
                </button>

                {isWishlisted && (
                  <button
                    onClick={() => setRoute({ name: 'wishlist' })}
                    className="text-xs font-bold text-[#A25828] hover:underline whitespace-nowrap cursor-pointer px-2"
                  >
                    View Wishlist &rarr;
                  </button>
                )}
              </div>

              {/* Instant Wishlist Toast Notification */}
              {wishlistToast && (
                <div className="p-3 bg-white rounded-xl border border-[#A25828]/30 shadow-md flex items-center justify-between text-xs animate-fade-in">
                  <div className="flex items-center gap-2 text-stone-800">
                    <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    <span>
                      {isWishlisted
                        ? `"${product.name}" added to your saved wishlist!`
                        : `"${product.name}" removed from your wishlist.`}
                    </span>
                  </div>
                  <button
                    onClick={() => setRoute({ name: 'wishlist' })}
                    className="font-bold text-[#A25828] hover:underline text-[11px]"
                  >
                    View Saved Items &rarr;
                  </button>
                </div>
              )}
            </div>

            {/* Key Delivery & Trust Guarantees */}
            <div className="pt-4 border-t border-[#E8E0D5] space-y-2.5 text-xs text-[#5C5047]">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#A25828] shrink-0" />
                <span>
                  <strong>2-Man Room of Choice Delivery:</strong> {product.deliveryInfo}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-[#A25828] shrink-0" />
                <span>
                  <strong>30-Day Exchange / Return:</strong> Hassle-free exchange policy.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#A25828] shrink-0" />
                <span>
                  <strong>1 Year Warranty:</strong> Every piece is covered for 12 months from delivery.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. PRODUCT TABS (SPECIFICATIONS, DELIVERY, CARE, REVIEWS) */}
        <div className="mt-16 bg-white rounded-3xl border border-[#E8E0D5] overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#E8E0D5] bg-[#FAF8F5] overflow-x-auto">
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'specs'
                  ? 'border-[#A25828] text-[#A25828] bg-white'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              Dimensions &amp; Specs
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'delivery'
                  ? 'border-[#A25828] text-[#A25828] bg-white'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              UK Delivery &amp; Access
            </button>
            <button
              onClick={() => setActiveTab('care')}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'care'
                  ? 'border-[#A25828] text-[#A25828] bg-white'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              Care &amp; Cleaning
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'border-[#A25828] text-[#A25828] bg-white'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              Customer Reviews ({product.reviewCount})
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="p-6 sm:p-10">
            {activeTab === 'specs' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#221C18] mb-2">
                    Product Description
                  </h3>
                  <p className="text-sm text-[#5C5047] leading-relaxed">
                    {product.fullDescription}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-stone-200">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#A25828] mb-3 flex items-center gap-1.5">
                      <Ruler className="w-4 h-4" />
                      Measurements &amp; Proportions
                    </h4>
                    <table className="w-full text-xs text-stone-700 divide-y divide-stone-100">
                      <tbody>
                        <tr className="py-2 flex justify-between">
                          <td className="text-stone-500">Overall Width</td>
                          <td className="font-semibold tabular-nums">{product.dimensions.width} cm</td>
                        </tr>
                        <tr className="py-2 flex justify-between">
                          <td className="text-stone-500">Overall Height</td>
                          <td className="font-semibold tabular-nums">{product.dimensions.height} cm</td>
                        </tr>
                        <tr className="py-2 flex justify-between">
                          <td className="text-stone-500">Overall Depth</td>
                          <td className="font-semibold tabular-nums">{product.dimensions.depth} cm</td>
                        </tr>
                        {product.dimensions.seatHeight && (
                          <tr className="py-2 flex justify-between">
                            <td className="text-stone-500">Seat Height from Floor</td>
                            <td className="font-semibold tabular-nums">{product.dimensions.seatHeight} cm</td>
                          </tr>
                        )}
                        {product.dimensions.storageDepth && (
                          <tr className="py-2 flex justify-between">
                            <td className="text-stone-500">Ottoman Storage Internal Depth</td>
                            <td className="font-semibold tabular-nums">{product.dimensions.storageDepth} cm</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#A25828] mb-3 flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      Materials &amp; Craftsmanship
                    </h4>
                    <ul className="space-y-2 text-xs text-stone-700">
                      {product.materials.map((mat, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{mat}</span>
                        </li>
                      ))}
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Assembly: {product.assemblyRequired ? 'Minimal legs attachment / tool included' : 'Delivered pre-assembled'}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-4 text-sm text-[#5C5047] leading-relaxed">
                <h3 className="font-serif text-xl font-bold text-[#221C18]">
                  Specialist Two-Man Delivery Team
                </h3>
                <p>
                  Because furniture is bulky and valuable, we do not ship via standard single-driver couriers. Every order is delivered by our specialist two-man furniture logistics partner directly to your room of choice.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E0D5]">
                    <h4 className="font-bold text-xs text-[#221C18] uppercase mb-1">Room of Choice</h4>
                    <p className="text-xs text-stone-600">Our drivers carry the pieces upstairs, unbox, and place them exactly where you want.</p>
                  </div>
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E0D5]">
                    <h4 className="font-bold text-xs text-[#221C18] uppercase mb-1">Pre-Delivery Time Slot</h4>
                    <p className="text-xs text-stone-600">You will receive an SMS and phone call the day prior with a 2-hour delivery window.</p>
                  </div>
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E0D5]">
                    <h4 className="font-bold text-xs text-[#221C18] uppercase mb-1">Doorway Fit Check</h4>
                    <p className="text-xs text-stone-600">All our sofas feature detachable solid oak feet to fit through standard 76cm UK doorways.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="space-y-4 text-sm text-[#5C5047] leading-relaxed">
                <h3 className="font-serif text-xl font-bold text-[#221C18]">
                  Caring For Your Luxury Upholstery
                </h3>
                <p>{product.careInstructions}</p>
                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E0D5] space-y-2 text-xs">
                  <p><strong>Spill Emergency:</strong> Never scrub or rub spills, as this can force liquids deeper into the woven pile. Blot immediately with a dry kitchen paper towel or clean white cloth.</p>
                  <p><strong>Sunlight:</strong> Avoid placing delicate bouclé or velvet fabrics in direct harsh sunlight to prevent gradual colour shifting over decades.</p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#221C18]">
                      Verified Customer Feedback
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Based on {product.reviewCount} verified British customer reviews.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-[#221C18]">
                      {product.rating}
                    </span>
                    <div className="text-xs text-amber-500">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-stone-500 text-[11px]">100% Recommended</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 divide-y divide-stone-100">
                  {product.reviews.map((rev) => (
                    <div key={rev.id} className="pt-4 first:pt-0 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{rev.author}</span>
                          <span className="text-stone-400">·</span>
                          <span className="text-stone-500">{rev.location}</span>
                          {rev.verifiedPurchase && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold">
                              Verified Buyer
                            </span>
                          )}
                        </div>
                        <span className="text-stone-400 text-[11px]">{rev.date}</span>
                      </div>
                      <h4 className="font-bold text-sm text-[#221C18]">{rev.title}</h4>
                      <p className="text-xs sm:text-sm text-[#5C5047] leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. COMPLEMENTARY & RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#221C18] mb-6">
              Complete the Look with Matching Pieces
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* 5. STRUCTURED DATA / JSON-LD SCHEMA FOR GOOGLE SERP COMPLIANCE */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org/',
                '@type': 'Product',
                name: product.name,
                image: product.images,
                description: product.seoDescription || product.shortDescription,
                sku: currentSku,
                mpn: currentSku,
                brand: {
                  '@type': 'Brand',
                  name: 'Plush Comfort UK',
                },
                offers: {
                  '@type': 'Offer',
                  url: typeof window !== 'undefined' ? window.location.href : `https://plushcomfort.uk/product/${product.slug}`,
                  priceCurrency: 'GBP',
                  price: activePrice,
                  priceValidUntil: '2027-12-31',
                  itemCondition: 'https://schema.org/NewCondition',
                  availability: currentStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
                  seller: {
                    '@type': 'Organization',
                    name: 'Plush Comfort UK',
                  },
                },
                ...(product.reviewCount > 0
                  ? {
                      aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: product.rating,
                        reviewCount: product.reviewCount,
                        bestRating: '5',
                        worstRating: '1',
                      },
                    }
                  : {}),
              },
              {
                '@context': 'https://schema.org/',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://plushcomfort.uk/',
                  },
                  ...(category
                    ? [
                        {
                          '@type': 'ListItem',
                          position: 2,
                          name: category.name,
                          item: `https://plushcomfort.uk/category/${category.slug}`,
                        },
                      ]
                    : []),
                  {
                    '@type': 'ListItem',
                    position: category ? 3 : 2,
                    name: product.name,
                    item: `https://plushcomfort.uk/product/${product.slug}`,
                  },
                ],
              },
            ]),
          }}
        />
      </div>
    </div>
  );
};
