import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Truck, HeartHandshake, Banknote, MessageCircle, Phone } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { setRoute, settings } = useStore();

  const promises = [
    { icon: Truck, title: 'Free UK Delivery', text: 'Free delivery to UK mainland addresses, booked in with you before dispatch.' },
    { icon: ShieldCheck, title: '1 Year Warranty', text: 'Every sofa and bed is covered for 12 months from the day it is delivered.' },
    { icon: HeartHandshake, title: '30-Day Exchange/Return', text: 'Changed your mind? Exchange or return within 30 days — hassle-free.' },
    { icon: Banknote, title: 'Cash on Delivery', text: 'Nothing to pay online. You pay when your furniture arrives at your door.' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24">
      <div className="bg-white border-b border-[#E8E0D5] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A25828]">About Plush Comfort UK</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#221C18]">Luxury Comfort, Delivered to Your Door.</h1>
          <p className="text-base sm:text-lg text-[#6B6159] leading-relaxed max-w-2xl mx-auto">
            Plush Comfort is a UK online furniture store. We bring together beautiful sofas, corner suites and beds at honest prices — and deliver
            them straight to homes across the UK.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A25828]">Why we started</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#221C18]">Shopping for furniture should be simple</h2>
            <p className="text-sm text-[#5C5047] leading-relaxed">
              Buying a sofa or bed is a big decision. We keep it simple: clear photos, honest sizes, real prices, and a friendly team you can
              message on WhatsApp whenever you need help choosing.
            </p>
            <p className="text-sm text-[#5C5047] leading-relaxed">
              Every product is selected for comfort and long-lasting quality — solid frames, supportive seating and fabrics that stand up to
              everyday family life. Because we sell online, we pass the savings on to you.
            </p>
          </div>
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-[#FAF7F2] border border-[#E8E0D5] shadow-sm">
            <img
              src="/uploads/products/lilly-corner-sofa-luxury-plush-fabric-with-bolster-cushions-1.webp"
              alt="Lilly corner sofa in a warm living room"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {promises.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-white p-6 rounded-2xl border border-[#E8E0D5] space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#FAF5EE] text-[#A25828] flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#221C18]">{title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#FAF5EE] rounded-3xl p-8 sm:p-12 border border-[#E8DFC5] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#A25828] uppercase">Talk to our team</span>
            <h3 className="font-serif text-2xl font-bold text-[#221C18]">Need help choosing a size or fabric?</h3>
            <p className="text-xs text-stone-600 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {settings.phone}</span>
              <span className="inline-flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp {settings.whatsapp}</span>
              <span>· {settings.businessHours}</span>
            </p>
          </div>
          <button
            onClick={() => setRoute({ name: 'contact' })}
            className="bg-[#A25828] text-white hover:bg-[#8A461A] px-6 py-3 rounded-full text-xs font-semibold shrink-0 cursor-pointer"
          >
            Contact Customer Care
          </button>
        </div>
      </div>
    </div>
  );
};
