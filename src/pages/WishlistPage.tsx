import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { wishlist, products, setRoute, addToCart, toggleWishlist } = useStore();
  const { settings } = useStore();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleMoveAllToCart = () => {
    wishlistedProducts.forEach((p) => {
      addToCart(p.id, 1);
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E0D5] mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A25828] mb-1">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Saved Furniture Pieces</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#221C18]">
              Your Personal Wishlist ({wishlistedProducts.length})
            </h1>
            <p className="text-xs text-[#8A786A] mt-1">
              Handcrafted British sofas, bespoke ottoman beds, and oak accents saved to your session.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {wishlistedProducts.length > 0 && (
              <button
                onClick={handleMoveAllToCart}
                className="bg-[#A25828] hover:bg-[#8A461A] text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Move All to Basket</span>
              </button>
            )}
            <button
              onClick={() => setRoute({ name: 'shop' })}
              className="text-xs font-semibold text-stone-600 hover:text-[#A25828] hover:underline cursor-pointer"
            >
              Continue Shopping &rarr;
            </button>
          </div>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-[#E8E0D5] max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#221C18]">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              Explore our sofas, corner suites and ottoman beds and click the heart icon on any piece to save it here.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setRoute({ name: 'shop' })}
                className="bg-[#A25828] text-white hover:bg-[#8A461A] px-7 py-3 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                Browse All Collections
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlistedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#E8E0D5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-600">
              <span>
                Need help deciding? Contact our customer care team on <strong>{settings.phone}</strong> for size and fabric advice.
              </span>
              <button
                onClick={() => setRoute({ name: 'contact' })}
                className="text-[#A25828] font-bold hover:underline shrink-0"
              >
                Contact Upholstery Team &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
