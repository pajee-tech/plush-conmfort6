import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Cookie } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const { setRoute } = useStore();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('plush_comfort_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('plush_comfort_cookie_consent', 'all');
    setShowBanner(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('plush_comfort_cookie_consent', 'essential');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 animate-fade-in">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl border border-[#E8E0D5] text-xs text-[#4A3E37]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FAF0E6] flex items-center justify-center text-[#A25828] shrink-0 mt-0.5">
            <Cookie className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-[#221C18]">Your Privacy at Plush Comfort</h4>
            <p className="mt-1 text-stone-600 leading-relaxed">
              We use necessary cookies to run our UK store and optional cookies to analyze shop performance and improve your furniture shopping experience.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={handleAcceptAll}
                className="bg-[#A25828] text-white hover:bg-[#8A461A] px-4 py-1.5 rounded-full font-semibold cursor-pointer transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={handleEssentialOnly}
                className="bg-[#FAF7F2] text-[#4A3E37] hover:bg-stone-200 border border-[#D5C7B7] px-3 py-1.5 rounded-full font-medium cursor-pointer transition-colors"
              >
                Essential Only
              </button>
              <button
                onClick={() => setRoute({ name: 'cookies' })}
                className="text-stone-500 hover:underline cursor-pointer ml-auto"
              >
                Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
