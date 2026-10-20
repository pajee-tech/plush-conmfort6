import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Filter, ChevronRight, SlidersHorizontal, RotateCcw } from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { products, activeCategories, setRoute } = useStore();

  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(2500);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.isPublished) return false;
        if (selectedCatId !== 'all' && p.categoryId !== selectedCatId) return false;
        const price = p.salePrice ?? p.price;
        if (price > maxPrice) return false;
        if (inStockOnly && p.stock <= 0) return false;
        return true;
      })
      .sort((a, b) => {
        const priceA = a.salePrice ?? a.price;
        const priceB = b.salePrice ?? b.price;
        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'rating') return b.rating - a.rating;
        return b.isFeatured ? 1 : -1;
      });
  }, [products, selectedCatId, maxPrice, inStockOnly, sortBy]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20">
      {/* Top Banner Header */}
      <div className="bg-white border-b border-[#E8E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="flex items-center gap-2 text-xs text-[#8A786A] mb-3">
            <button
              onClick={() => setRoute({ name: 'home' })}
              className="hover:text-[#A25828] cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-bold text-[#221C18]">Shop All Furniture</span>
          </nav>

          <div className="max-w-3xl space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#221C18]">
              All Handcrafted Collections
            </h1>
            <p className="text-sm sm:text-base text-[#6B6159]">
              Explore our full range of British handcrafted sofas, bespoke ottoman beds, and artisanal oak living room furniture.
            </p>
          </div>

          {/* Quick Category Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-6">
            <button
              onClick={() => setSelectedCatId('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                selectedCatId === 'all'
                  ? 'bg-[#221C18] text-white border-[#221C18]'
                  : 'bg-white text-stone-700 border-[#E0D7CC] hover:bg-stone-50'
              }`}
            >
              All Items ({products.filter((p) => p.isPublished).length})
            </button>
            {activeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                  selectedCatId === cat.id
                    ? 'bg-[#A25828] text-white border-[#A25828]'
                    : 'bg-white text-stone-700 border-[#E0D7CC] hover:bg-stone-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid & Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8E0D5]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="lg:hidden flex items-center gap-2 bg-white border border-[#D5C7B7] px-4 py-2 rounded-lg text-xs font-semibold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
            <span className="text-xs text-[#8A786A]">
              Showing <strong>{filteredProducts.length}</strong> items
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-[#D5C7B7] rounded-lg px-3 py-1.5 text-xs text-[#221C18] font-medium"
            >
              <option value="featured">Featured &amp; Bestsellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
          {/* Sidebar */}
          <aside className={`space-y-6 ${showFiltersMobile ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5] space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="font-semibold text-sm text-[#221C18] flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#A25828]" />
                  Refine Search
                </h3>
                {(selectedCatId !== 'all' || maxPrice < 2000 || inStockOnly) && (
                  <button
                    onClick={() => {
                      setSelectedCatId('all');
                      setMaxPrice(2000);
                      setInStockOnly(false);
                    }}
                    className="text-xs text-[#A25828] hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Price filter */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-stone-700">
                  <span>Max Budget:</span>
                  <span className="font-bold text-[#A25828] tabular-nums">£{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2500"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#A25828]"
                />
              </div>

              {/* In stock */}
              <div className="pt-2 border-t border-stone-200">
                <label className="flex items-center gap-2 text-xs text-stone-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-[#A25828] rounded"
                  />
                  <span>Ready for Dispatch Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <main className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E8E0D5] p-12 text-center">
                <h3 className="font-serif text-xl font-bold">No pieces found</h3>
                <p className="text-sm text-stone-500 mt-1">Try resetting your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
