import React from 'react';
import { useStore } from '../context/StoreContext';
import { RotateCcw, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

export const ReturnsPage: React.FC = () => {
  const { setRoute, settings } = useStore();

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A25828]">
            Complete Peace of Mind
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#221C18]">
            30-Day Exchange &amp; Returns
          </h1>
          <p className="text-sm sm:text-base text-[#6B6159] max-w-xl mx-auto">
            We want you to truly love living with your Plush Comfort furniture. Experience it at home for up to 30 days.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8E0D5] space-y-8">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#221C18] mb-3">
              How the 30-Day Trial Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-700">
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E0D5] space-y-2">
                <span className="w-7 h-7 rounded-full bg-[#A25828] text-white flex items-center justify-center font-bold text-xs">1</span>
                <h4 className="font-bold text-stone-900">Delivery to Your Home</h4>
                <p className="text-stone-600">The 30-day trial begins on the day our two-man team places your furniture in your room of choice.</p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E0D5] space-y-2">
                <span className="w-7 h-7 rounded-full bg-[#A25828] text-white flex items-center justify-center font-bold text-xs">2</span>
                <h4 className="font-bold text-stone-900">Live With It Daily</h4>
                <p className="text-stone-600">Test the seat cushions, bedroom space, and upholstery feel in your own everyday lighting.</p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E0D5] space-y-2">
                <span className="w-7 h-7 rounded-full bg-[#A25828] text-white flex items-center justify-center font-bold text-xs">3</span>
                <h4 className="font-bold text-stone-900">Keep or Collect</h4>
                <p className="text-stone-600">If you are not 100% satisfied, notify us at {settings.email} and we schedule a collection and refund.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-[#E8E0D5] text-xs text-[#5A4E46] leading-relaxed">
            <h3 className="font-serif text-xl font-bold text-[#221C18]">
              Return Conditions &amp; Refund Processing
            </h3>
            <p>
              To qualify for a full refund under the 30-Day Trial, the furniture must be in clean, undamaged condition, free from accidental tears, pet damage, or non-factory stains.
            </p>
            <p>
              Once collected by our delivery partner and checked at our warehouse, refunds are made to your original payment method within 3–5 working days.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setRoute({ name: 'contact' })}
            className="bg-[#A25828] text-white px-8 py-3 rounded-full text-xs font-semibold cursor-pointer"
          >
            Contact Customer Support
          </button>
        </div>
      </div>
    </div>
  );
};
