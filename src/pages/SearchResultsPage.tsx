import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Search, ChevronRight, Filter } from 'lucide-react';

interface SearchResultsPageProps {
  query?: string;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ query = '' }) => {
  const { products, setRoute, trackEvent } = useStore();
  const [searchVal, setSearchVal] = useState(query);
  const [submittedQuery, setSubmittedQuery] = useState(query);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    setSubmittedQuery(searchVal.trim());
    trackEvent('search', undefined, undefined, searchVal.trim());
  };

  const matchingProducts = products.filter(
    (p) =>
      p.isPublished &&
      (p.name.toLowerCase().includes(submittedQuery.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(submittedQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(submittedQuery.toLowerCase())) ||
        p.materials.some((m) => m.toLowerCase().includes(submittedQuery.toLowerCase())) ||
        p.sku.toLowerCase().includes(submittedQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-xs text-[#8A786A] mb-4">
          <button
            onClick={() => setRoute({ name: 'home' })}
            className="hover:text-[#A25828] cursor-pointer"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Search</span>
          {submittedQuery && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-bold text-[#221C18]">&ldquo;{submittedQuery}&rdquo;</span>
            </>
          )}
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-[#E8E0D5] mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#221C18]">
              Search Results
            </h1>
            <p className="text-xs text-[#8A786A] mt-1">
              Found <strong>{matchingProducts.length}</strong> matching handcrafted furniture pieces.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm w-full">
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search sofas, beds..."
              className="flex-1 px-3.5 py-2 text-xs border border-[#D5C7B7] rounded-lg bg-white"
            />
            <button
              type="submit"
              className="bg-[#A25828] text-white px-4 py-2 rounded-lg text-xs font-semibold"
            >
              Search
            </button>
          </form>
        </div>

        {matchingProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-[#E8E0D5] max-w-lg mx-auto space-y-3">
            <Search className="w-12 h-12 text-stone-300 mx-auto" />
            <h2 className="font-serif text-2xl font-bold text-[#221C18]">
              No Furniture Found
            </h2>
            <p className="text-xs text-stone-500">
              We couldn&apos;t find any pieces matching &ldquo;{submittedQuery}&rdquo;. Try searching for general terms like &ldquo;sofa&rdquo;, &ldquo;bed&rdquo;, or &ldquo;bouclé&rdquo;.
            </p>
            <button
              onClick={() => setRoute({ name: 'shop' })}
              className="mt-2 bg-[#A25828] text-white px-6 py-2.5 rounded-full text-xs font-semibold"
            >
              Browse All Collections
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {matchingProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
