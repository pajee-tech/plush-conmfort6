import React from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, Home, ShoppingBag } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { setRoute } = useStore();

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center py-20 px-4">
      <div className="max-w-lg w-full bg-white rounded-3xl p-10 border border-[#E8E0D5] text-center space-y-6 shadow-sm">
        <div className="font-serif text-7xl font-bold text-[#A25828]">404</div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#221C18]">
          Furniture Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6159] leading-relaxed">
          The page or product you are looking for might have been discontinued, relocated, or temporarily moved during our catalog refresh.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setRoute({ name: 'home' })}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#A25828] text-white hover:bg-[#8A461A] px-6 py-3 rounded-full text-xs font-semibold cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </button>
          <button
            onClick={() => setRoute({ name: 'shop' })}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 px-6 py-3 rounded-full text-xs font-semibold cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Shop All Furniture</span>
          </button>
        </div>
      </div>
    </div>
  );
};
