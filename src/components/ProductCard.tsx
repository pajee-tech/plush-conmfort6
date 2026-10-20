import { srcSetFor } from '../utils/responsiveImage';
import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { getProductFallbackImage } from '../utils/imageHelper';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setRoute, toggleWishlist, isInWishlist, addToCart } = useStore();
  const isWishlisted = isInWishlist(product.id);

  const displayPrice = product.salePrice ?? product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const imageSrc = product.images[0] || getProductFallbackImage(product.name, product.categoryId);

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-[#EFEAE2] hover:border-[#D5C7B7] p-3.5 transition-all duration-300 hover:shadow-md">
      {/* Product Image Area with quick-action badges and crawlable link */}
      <a
        href={`/product/${product.slug}`}
        onClick={(e) => {
          e.preventDefault();
          setRoute({ name: 'product', slug: product.slug });
        }}
        title={`View ${product.name}`}
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#FAF7F2] flex items-center justify-center cursor-pointer group-hover:scale-[1.01] transition-transform duration-300 block"
      >
        <img
          src={imageSrc}
          srcSet={srcSetFor(imageSrc)}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 400px"
          decoding="async"
          alt={product.imageGallery?.[0]?.alt || product.name}
          className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          width="400"
          height="300"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = getProductFallbackImage(product.name, product.categoryId);
          }}
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-2.5 left-2.5 bg-[#A25828] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
            Save £{(product.price - product.salePrice!).toFixed(0)}
          </span>
        )}

        {/* Low Stock Warning */}
        {product.stock <= product.lowStockThreshold && product.stock > 0 && (
          <span className="absolute bottom-2.5 left-2.5 bg-amber-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-xs">
            Only {product.stock} left
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
            isWishlisted
              ? 'bg-red-50 text-red-500 border border-red-200'
              : 'bg-white/90 text-stone-600 hover:text-[#A25828] hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
        </button>
      </a>

      {/* Product Information */}
      <div className="flex flex-col flex-1 pt-3">
        {/* Title as Crawlable Link */}
        <a
          href={`/product/${product.slug}`}
          onClick={(e) => {
            e.preventDefault();
            setRoute({ name: 'product', slug: product.slug });
          }}
          className="text-left font-medium text-sm text-[#221C18] line-clamp-1 hover:text-[#A25828] transition-colors cursor-pointer block"
          title={product.name}
        >
          {product.name}
        </a>

        {/* Rating Stars - 5 yellow stars as seen in screenshot */}
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
              />
            ))}
          </div>
          <span className="text-[11px] text-[#8A786A] ml-1">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between mt-2 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-base text-[#221C18] tabular-nums">
              £{displayPrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through tabular-nums">
                £{product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Quick Add To Basket Button */}
          <button
            onClick={() => addToCart(product.id, 1)}
            aria-label={`Add ${product.name} to basket`}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#A25828] text-stone-700 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-[#E8E0D5] hover:border-[#A25828]"
            title="Add to Basket"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
