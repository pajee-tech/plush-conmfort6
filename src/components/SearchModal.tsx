import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, X, ArrowRight, Star } from 'lucide-react';
import { getProductFallbackImage } from '../utils/imageHelper';

export const SearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    products,
    setRoute,
    trackEvent,
  } = useStore();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const POPULAR_SEARCHES = [
    'Bouclé Armchair',
    'Corner Sofa',
    'King Ottoman Bed',
    '3-Seater Sofa',
    'Oak Side Table',
    'Sofa Bed',
    'Plush Velvet',
  ];

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredProducts = query.trim()
    ? products.filter(
        (p) =>
          p.isPublished &&
          (p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.shortDescription.toLowerCase().includes(query.toLowerCase()) ||
            p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
            p.materials.some((m) => m.toLowerCase().includes(query.toLowerCase())) ||
            p.sku.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const handleSelectProduct = (slug: string, name: string) => {
    trackEvent('search', undefined, name, query);
    setIsSearchOpen(false);
    setRoute({ name: 'product', slug });
  };

  const handleExecuteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    trackEvent('search', undefined, undefined, query);
    setIsSearchOpen(false);
    setRoute({ name: 'search', query: query.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="relative min-h-screen flex items-start justify-center p-4 sm:p-6 lg:p-12">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E8E0D5] overflow-hidden animate-fade-in">
          {/* Search Input Bar */}
          <form onSubmit={handleExecuteSearch} className="relative flex items-center border-b border-[#E8E0D5] px-4 py-3 bg-[#FAF8F5]">
            <Search className="w-5 h-5 text-[#8A786A] mr-3 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search handcrafted sofas, ottoman beds, materials..."
              className="w-full text-base bg-transparent text-[#221C18] placeholder-stone-400 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer mr-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="text-xs font-semibold text-stone-500 hover:text-stone-900 px-2 py-1 bg-stone-200 rounded cursor-pointer"
            >
              ESC
            </button>
          </form>

          {/* Quick Suggestions when Query is Empty */}
          {!query.trim() && (
            <div className="p-6">
              <div className="text-xs font-semibold text-[#8A786A] uppercase tracking-wider mb-3">
                Popular British Furniture Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="text-xs bg-[#FAF7F2] hover:bg-[#F0E9DF] text-[#4A3E37] border border-[#E8E0D5] px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Real-time Results */}
          {query.trim() && (
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between text-xs text-[#8A786A] mb-3 px-2">
                <span>
                  Found <strong>{filteredProducts.length}</strong> matching pieces
                </span>
                <button
                  onClick={handleExecuteSearch}
                  className="text-[#A25828] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  View full results page <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-sm text-stone-500">
                  No furniture found matching &ldquo;{query}&rdquo;. Try searching for &ldquo;sofa&rdquo;, &ldquo;bed&rdquo;, or &ldquo;bouclé&rdquo;.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((p) => {
                    const price = p.salePrice ?? p.price;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProduct(p.slug, p.name)}
                        className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                      >
                        <div className="w-14 h-14 rounded-lg bg-[#F5EFE6] flex-shrink-0 overflow-hidden p-1 flex items-center justify-center">
                          <img
                            src={p.images[0] || getProductFallbackImage(p.name, p.categoryId)}
                            alt={p.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-[#221C18] group-hover:text-[#A25828] truncate">
                            {p.name}
                          </h4>
                          <p className="text-xs text-stone-500 truncate mt-0.5">
                            {p.shortDescription}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-[#221C18]">
                              £{price.toFixed(2)}
                            </span>
                            <span className="text-[11px] text-stone-400">· SKU: {p.sku}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-[#A25828] group-hover:translate-x-1 transition-all" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
