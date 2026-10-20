import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { HelpCircle, ChevronDown, Search } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const { setRoute, settings } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const FAQS = [
    {
      category: 'sofas',
      q: 'Do you have a physical shop I can visit?',
      a: 'Plush Comfort is an online store, which keeps our prices low. Every product page has full sizes and photos, and our team is happy to send extra photos or videos on WhatsApp to help you choose.',
    },
    {
      category: 'sofas',
      q: 'What warranty is included?',
      a: 'Every sofa and bed comes with a 1 year warranty against manufacturing defects, starting from the day it is delivered. You also have 30 days to exchange or return.',
    },
    {
      category: 'sofas',
      q: 'Will your sofas fit through narrow British cottage doorways?',
      a: 'Yes! All of our sofas are designed with detachable solid oak feet, which reduces the doorway clearance height by up to 10cm. In addition, our corner and modular sofas are built in two interlocking halves that slide effortlessly through standard 76cm UK doorways.',
    },
    {
      category: 'beds',
      q: 'How does the hydraulic gas-lift Ottoman mechanism work?',
      a: 'Our Ottoman beds feature dual German-engineered 800N gas-assisted pistons. They effortlessly counterbalance the weight of your mattress, allowing you to lift the slatted platform with a gentle single-handed pull to reveal up to 850 litres of clean storage.',
    },
    {
      category: 'beds',
      q: 'Are your beds compatible with standard UK mattress sizes?',
      a: 'Yes, our beds are precision-engineered to fit standard UK Single (3ft), Small Double (4ft), Double (4ft6), King (5ft), and Super King (6ft) mattresses.',
    },
    {
      category: 'delivery',
      q: 'How does the 2-man room of choice delivery work?',
      a: 'We never dump heavy boxes on your doorstep. Our specialist 2-man delivery team will carry your pieces upstairs or through hallways directly into your room of choice. You will receive an SMS the day prior with a 2-hour delivery window.',
    },
    {
      category: 'delivery',
      q: 'What is the free delivery threshold?',
      a: `All UK mainland orders over £${settings.freeDeliveryThreshold} qualify for 100% Free 2-Man Delivery. Orders below this threshold are charged a flat £${settings.standardDeliveryFee.toFixed(2)}.`,
    },
    {
      category: 'payments',
      q: 'Which payment methods do you accept?',
      a: 'We currently operate on a Cash on Delivery (Pay on Handover) basis across all UK mainland deliveries. Our 2-man delivery logistics crew carries your sofa or bed into your room of choice, assists with unpacking, and lets you inspect the quality before you pay. You pay cash or card upon handover with £0 charged upfront.',
    },
  ];

  const filteredFaqs = FAQS.filter((faq) => {
    if (activeCategory !== 'all' && faq.category !== activeCategory) return false;
    if (searchQuery.trim() && !faq.q.toLowerCase().includes(searchQuery.toLowerCase()) && !faq.a.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A25828]">
            Got Questions? We&apos;ve Got Answers.
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#221C18]">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-[#6B6159] max-w-xl mx-auto">
            Find immediate answers regarding British craftsmanship, delivery coverage, doorway access, and warranty.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs (e.g. ottoman lift, doorway size, delivery)..."
            className="w-full text-xs sm:text-sm pl-12 pr-4 py-3 rounded-full bg-white border border-[#D5C7B7] shadow-xs focus:outline-none focus:border-[#A25828]"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {['all', 'sofas', 'beds', 'delivery', 'payments'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer border ${
                activeCategory === cat
                  ? 'bg-[#221C18] text-white border-[#221C18]'
                  : 'bg-white text-stone-700 border-[#E0D7CC] hover:bg-stone-50'
              }`}
            >
              {cat === 'all' ? 'All Questions' : cat}
            </button>
          ))}
        </div>

        {/* FAQs Accordion */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E0D5] divide-y divide-[#EFEAE2]">
          {filteredFaqs.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-500">
              No answers found for &ldquo;{searchQuery}&rdquo;. Call our team directly on {settings.phone}.
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="py-5 first:pt-0 last:pb-0">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left font-serif font-bold text-base sm:text-lg text-[#221C18] hover:text-[#A25828] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-stone-400 transition-transform ${
                        isOpen ? 'rotate-180 text-[#A25828]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-xs sm:text-sm text-[#5C5047] leading-relaxed animate-fade-in">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Support Callout */}
        <div className="text-center space-y-2">
          <p className="text-xs text-stone-600">
            Still have questions? Our customer care specialists are happy to advise.
          </p>
          <button
            onClick={() => setRoute({ name: 'contact' })}
            className="text-xs font-bold text-[#A25828] hover:underline"
          >
            Speak to our Team &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
