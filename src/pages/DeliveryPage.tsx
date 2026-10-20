import React from 'react';
import { useStore } from '../context/StoreContext';
import { Truck, ShieldCheck, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

export const DeliveryPage: React.FC = () => {
  const { settings, setRoute } = useStore();

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A25828]">
            Specialist UK Furniture Logistics
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#221C18]">
            Delivery &amp; White Glove Service
          </h1>
          <p className="text-sm sm:text-base text-[#6B6159] max-w-xl mx-auto">
            We deliver handcrafted luxury furniture across England, Scotland &amp; Wales with our dedicated two-man delivery specialists.
          </p>
        </div>

        {/* Delivery Options Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-[#E8E0D5] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl text-[#221C18]">
                Standard 2-Man Room Delivery
              </h3>
              <span className="text-xs font-bold text-[#A25828] bg-[#FAF5EE] px-3 py-1 rounded-full">
                FREE over £{settings.freeDeliveryThreshold}
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              For orders under £{settings.freeDeliveryThreshold}, delivery is a flat £{settings.standardDeliveryFee.toFixed(2)}.
            </p>
            <ul className="space-y-2 text-xs text-stone-700 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Specialist 2-man uniformed logistics team</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Carried directly into your room of choice (up to 3 floors)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>SMS notification with a 2-hour delivery window the day prior</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Driver calls 30 minutes before arrival</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-3xl border-2 border-[#A25828] space-y-4 relative">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl text-[#221C18]">
                White Glove Assembly &amp; Recycle
              </h3>
              <span className="text-xs font-bold text-white bg-[#A25828] px-3 py-1 rounded-full">
                £{settings.whiteGloveDeliveryFee.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Complete white-glove setup service for total hassle-free relaxation.
            </p>
            <ul className="space-y-2 text-xs text-stone-700 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#A25828] shrink-0" />
                <span>Everything included in Standard Delivery</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#A25828] shrink-0" />
                <span>Full assembly of bed frames or attaching sofa feet</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#A25828] shrink-0" />
                <span>Testing of Ottoman gas-lift hydraulic pistons</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#A25828] shrink-0" />
                <span>100% cardboard and protective wrap removal for eco-recycling</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Doorway Access & Lead Times */}
        <div className="bg-white rounded-3xl p-8 border border-[#E8E0D5] space-y-6">
          <h2 className="font-serif text-2xl font-bold text-[#221C18]">
            Checking Your Doorways &amp; Hallways
          </h2>
          <div className="text-xs text-[#5A4E46] space-y-3 leading-relaxed">
            <p>
              Before placing an order, we ask that you measure all access points:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E0D5]">
                <h4 className="font-bold text-stone-900 mb-1">1. Outer Front Door</h4>
                <p>Standard UK doors are 76cm or 83cm. With removable sofa feet, our frames slide easily through 74cm+.</p>
              </div>
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E0D5]">
                <h4 className="font-bold text-stone-900 mb-1">2. Stairwells &amp; Turns</h4>
                <p>Check ceiling height and handrail turns. Our corner sofas ship in 2 modular interlocking halves.</p>
              </div>
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E0D5]">
                <h4 className="font-bold text-stone-900 mb-1">3. Bedroom Door Clearance</h4>
                <p>Our Ottoman bed frames arrive flat-packed with headboard separate to guarantee staircase passage.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => setRoute({ name: 'shop' })}
            className="bg-[#A25828] text-white hover:bg-[#8A461A] px-8 py-3.5 rounded-full text-xs font-semibold cursor-pointer"
          >
            Explore Handcrafted Furniture
          </button>
        </div>
      </div>
    </div>
  );
};
