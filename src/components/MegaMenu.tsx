import { thumbFor } from '../utils/responsiveImage';
import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  BookOpen,
  Sparkles,
  Phone,
  MessageCircle,
  Tag,
} from 'lucide-react';

interface MegaMenuProps {
  activeSilo: 'sofas' | 'beds' | 'living' | 'guides' | null;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ activeSilo, onClose }) => {
  const { setRoute, settings, products } = useStore();

  if (!activeSilo) return null;

  // Real uploaded products
  const veronaSofa = products.find((p) => p.slug.includes('verona-plush-velvet-corner-sofa')) || products[1];
  const uShapeSofa = products.find((p) => p.slug.includes('luxury-grey-crushed-velvet-u-shape-sofa')) || products[0];
  const ambassadorBed = products.find((p) => p.slug.includes('ambassador-luxury-deep-buttoned')) || products[2];
  const ottomanBed = products.find((p) => p.slug.includes('double-ottoman-divan-bed-set')) || products[10];
  const armchair = products.find((p) => p.slug.includes('beige-armchair')) || products[15];
  const wardrobe = products.find((p) => p.slug.includes('white-wardrobe')) || products[16];

  return (
    <div
      onMouseLeave={onClose}
      className="absolute top-full left-0 w-full bg-white/98 backdrop-blur-md border-b border-[#E8E0D5] shadow-2xl z-50 animate-fade-in"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SILO 1: SOFAS */}
        {activeSilo === 'sofas' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Column 1: Core Subcategories */}
            <div className="md:col-span-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A25828]">
                <span>Silo 1 · Handcrafted British Sofas</span>
              </div>
              <h3 className="font-serif font-bold text-lg text-[#221C18]">
                Living Room Seating
              </h3>
              <ul className="space-y-2 text-sm text-[#4A3E37]">
                <li>
                  <a
                    href="/category/corner-sofas"
                    onClick={(e) => {
                      e.preventDefault();
                      setRoute({ name: 'category', categorySlug: 'corner-sofas' });
                      onClose();
                    }}
                    className="hover:text-[#A25828] transition-colors flex items-center justify-between w-full text-left py-1 cursor-pointer group"
                  >
                    <span className="group-hover:font-medium">Corner &amp; Chaise Sofas</span>
                    <span className="text-xs text-[#A25828] bg-[#F7F2EC] px-2 py-0.5 rounded-full font-medium">6 Models</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/category/chesterfield-sofas"
                    onClick={(e) => {
                      e.preventDefault();
                      setRoute({ name: 'category', categorySlug: 'chesterfield-sofas' });
                      onClose();
                    }}
                    className="hover:text-[#A25828] transition-colors flex items-center justify-between w-full text-left py-1 cursor-pointer group"
                  >
                    <span className="group-hover:font-medium">Chesterfield Sofas</span>
                    <span className="text-xs text-[#A25828] bg-[#F7F2EC] px-2 py-0.5 rounded-full font-medium">5 Models</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/category/fabric-sofas"
                    onClick={(e) => {
                      e.preventDefault();
                      setRoute({ name: 'category', categorySlug: 'fabric-sofas' });
                      onClose();
                    }}
                    className="hover:text-[#A25828] transition-colors flex items-center justify-between w-full text-left py-1 cursor-pointer group"
                  >
                    <span className="group-hover:font-medium">Fabric &amp; Chenille Sofas</span>
                    <span className="text-xs text-stone-500">Textured Bouclé</span>
                  </a>
                </li>
                <li>
                  <a
                    href="/category/corner-sofas"
                    onClick={(e) => {
                      e.preventDefault();
                      setRoute({ name: 'category', categorySlug: 'corner-sofas' });
                      onClose();
                    }}
                    className="hover:text-[#A25828] transition-colors flex items-center justify-between w-full text-left py-1 cursor-pointer group"
                  >
                    <span className="group-hover:font-medium">U-Shaped Large Sectionals</span>
                    <span className="text-xs text-stone-500">Double Chaise</span>
                  </a>
                </li>
              </ul>

              <div className="pt-2">
                <a
                  href="/category/sofas"
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute({ name: 'category', categorySlug: 'sofas' });
                    onClose();
                  }}
                  className="text-xs font-bold text-[#A25828] hover:underline flex items-center gap-1 cursor-pointer inline-flex"
                >
                  <span>Explore All Handcrafted Sofas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Column 2: Spotlight Product 1 (Verona Corner Sofa) */}
            <div className="md:col-span-4 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E0D5] hover:border-[#D5C7B7] transition-all flex flex-col justify-between group cursor-pointer">
              <a
                href={veronaSofa ? `/product/${veronaSofa.slug}` : '/category/corner-sofas'}
                onClick={(e) => {
                  e.preventDefault();
                  if (veronaSofa) setRoute({ name: 'product', slug: veronaSofa.slug });
                  onClose();
                }}
                className="block"
              >
                <div className="aspect-[4/3] rounded-xl bg-white overflow-hidden p-2 flex items-center justify-center mb-3 shadow-xs">
                  <img
                    src={thumbFor(veronaSofa?.images[0] || '/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-1.webp')} loading="lazy"
                    alt={veronaSofa?.name || 'Verona Plush Velvet Corner Sofa'}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#A25828] uppercase tracking-wider">
                    Customer Favourite
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Save £200
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm text-[#221C18] mt-1 line-clamp-1">
                  {veronaSofa?.name || 'Verona Plush Velvet Corner Sofa'}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-base text-[#221C18]">£{veronaSofa?.price || 1250}</span>
                  <span className="text-xs text-stone-400 line-through">£{veronaSofa?.regularPrice || 1450}</span>
                </div>
              </a>
            </div>

            {/* Column 3: Spotlight Product 2 (Luxury U-Shape Sofa) */}
            <div className="md:col-span-4 bg-white p-4 rounded-2xl border border-[#E8E0D5] hover:border-[#D5C7B7] transition-all flex flex-col justify-between group cursor-pointer shadow-xs">
              <div
                onClick={() => {
                  if (uShapeSofa) setRoute({ name: 'product', slug: uShapeSofa.slug });
                  onClose();
                }}
              >
                <div className="aspect-[4/3] rounded-xl bg-[#FAF8F5] overflow-hidden p-2 flex items-center justify-center mb-3">
                  <img
                    src={thumbFor(uShapeSofa?.images[0] || '/uploads/products/luxury-grey-crushed-velvet-u-shape-sofa-1.webp')} loading="lazy"
                    alt={uShapeSofa?.name || 'Luxury Grey Crushed Velvet U-Shape Sofa'}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#A25828] uppercase tracking-wider">
                    Grand Living Suite
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                    Double Chaise
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm text-[#221C18] mt-1 line-clamp-1">
                  {uShapeSofa?.name || 'Luxury Grey Crushed Velvet U-Shape Sofa'}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-base text-[#221C18]">£{uShapeSofa?.price || 1799}</span>
                  <span className="text-xs text-stone-400 line-through">£{uShapeSofa?.regularPrice || 2199}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SILO 2: BEDS */}
        {activeSilo === 'beds' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Column 1: Subcategories */}
            <div className="md:col-span-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A25828]">
                <span>Silo 2 · Bespoke British Beds</span>
              </div>
              <h3 className="font-serif font-bold text-lg text-[#221C18]">
                Bedroom Collection
              </h3>
              <ul className="space-y-2 text-sm text-[#4A3E37]">
                <li>
                  <button
                    onClick={() => {
                      setRoute({ name: 'category', categorySlug: 'beds-bed-frames' });
                      onClose();
                    }}
                    className="hover:text-[#A25828] transition-colors flex items-center justify-between w-full text-left py-1 cursor-pointer group"
                  >
                    <span className="group-hover:font-medium">Beds &amp; Bed Frames</span>
                    <span className="text-xs text-[#A25828] bg-[#F7F2EC] px-2 py-0.5 rounded-full font-medium">Deep Buttoned</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setRoute({ name: 'category', categorySlug: 'divan-beds' });
                      onClose();
                    }}
                    className="hover:text-[#A25828] transition-colors flex items-center justify-between w-full text-left py-1 cursor-pointer group"
                  >
                    <span className="group-hover:font-medium">Ottoman Divan Bed Sets</span>
                    <span className="text-xs text-[#A25828] bg-[#F7F2EC] px-2 py-0.5 rounded-full font-medium">850L Storage</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setRoute({ name: 'category', categorySlug: 'mattresses' });
                      onClose();
                    }}
                    className="hover:text-[#A25828] transition-colors flex items-center justify-between w-full text-left py-1 cursor-pointer group"
                  >
                    <span className="group-hover:font-medium">Pocket Sprung Mattresses</span>
                    <span className="text-xs text-stone-500">Orthopaedic</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setRoute({ name: 'category', categorySlug: 'wardrobes' });
                      onClose();
                    }}
                    className="hover:text-[#A25828] transition-colors flex items-center justify-between w-full text-left py-1 cursor-pointer group"
                  >
                    <span className="group-hover:font-medium">Bedroom Wardrobes</span>
                    <span className="text-xs text-stone-500">Soft Close</span>
                  </button>
                </li>
              </ul>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setRoute({ name: 'category', categorySlug: 'beds-bed-frames' });
                    onClose();
                  }}
                  className="text-xs font-bold text-[#A25828] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore All Handcrafted Beds</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Column 2: Spotlight Bed 1 (Ambassador Bed) */}
            <div className="md:col-span-4 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E0D5] hover:border-[#D5C7B7] transition-all flex flex-col justify-between group cursor-pointer">
              <div
                onClick={() => {
                  if (ambassadorBed) setRoute({ name: 'product', slug: ambassadorBed.slug });
                  onClose();
                }}
              >
                <div className="aspect-[4/3] rounded-xl bg-white overflow-hidden p-2 flex items-center justify-center mb-3 shadow-xs">
                  <img
                    src={thumbFor(ambassadorBed?.images[0] || '/uploads/products/ambassador-luxury-deep-buttoned-upholstered-bed-frame-1.webp')} loading="lazy"
                    alt={ambassadorBed?.name || 'Ambassador Luxury Deep-Buttoned Bed Frame'}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#A25828] uppercase tracking-wider">
                    Bespoke Headboard
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Save £249
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm text-[#221C18] mt-1 line-clamp-1">
                  {ambassadorBed?.name || 'Ambassador Luxury Deep-Buttoned Bed Frame'}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-base text-[#221C18]">£{ambassadorBed?.price || 1150}</span>
                  <span className="text-xs text-stone-400 line-through">£{ambassadorBed?.regularPrice || 1399}</span>
                </div>
              </div>
            </div>

            {/* Column 3: Spotlight Bed 2 (Double Ottoman Divan Set) */}
            <div className="md:col-span-4 bg-white p-4 rounded-2xl border border-[#E8E0D5] hover:border-[#D5C7B7] transition-all flex flex-col justify-between group cursor-pointer shadow-xs">
              <div
                onClick={() => {
                  if (ottomanBed) setRoute({ name: 'product', slug: ottomanBed.slug });
                  onClose();
                }}
              >
                <div className="aspect-[4/3] rounded-xl bg-[#FAF8F5] overflow-hidden p-2 flex items-center justify-center mb-3">
                  <img
                    src={thumbFor(ottomanBed?.images[0] || '/uploads/products/double-ottoman-divan-bed-set-with-orthopaedic-mattress-vertical-panelled-headboard-1.webp')} loading="lazy"
                    alt={ottomanBed?.name || 'Double Ottoman Divan Bed Set'}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#A25828] uppercase tracking-wider">
                    Full Set With Mattress
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                    Gas-Lift Ottoman
                  </span>
                </div>
                <h4 className="font-serif font-bold text-sm text-[#221C18] mt-1 line-clamp-1">
                  {ottomanBed?.name || 'Double Ottoman Divan Bed Set'}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-base text-[#221C18]">£{ottomanBed?.price || 850}</span>
                  <span className="text-xs text-stone-400 line-through">£{ottomanBed?.regularPrice || 1050}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SILO 3: LIVING & BEDROOM ESSENTIALS */}
        {activeSilo === 'living' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A25828]">
                Silo 3 · Living &amp; Bedroom Accents
              </span>
              <h3 className="font-serif font-bold text-lg text-[#221C18]">
                British Comfort Essentials
              </h3>
              <ul className="space-y-2 text-sm text-[#4A3E37]">
                <li>
                  <button
                    onClick={() => {
                      if (armchair) setRoute({ name: 'product', slug: armchair.slug });
                      onClose();
                    }}
                    className="hover:text-[#A25828] transition-colors flex items-center justify-between w-full text-left py-1 cursor-pointer"
                  >
                    <span>Beige Armchair</span>
                    <span className="font-bold tabular-nums">£320</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      if (wardrobe) setRoute({ name: 'product', slug: wardrobe.slug });
                      onClose();
                    }}
                    className="hover:text-[#A25828] transition-colors flex items-center justify-between w-full text-left py-1 cursor-pointer"
                  >
                    <span>White Wardrobe</span>
                    <span className="font-bold tabular-nums">£540</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setRoute({ name: 'category', categorySlug: 'mattresses' });
                      onClose();
                    }}
                    className="hover:text-[#A25828] transition-colors flex items-center justify-between w-full text-left py-1 cursor-pointer"
                  >
                    <span>King Mattress</span>
                    <span className="font-bold tabular-nums">£650</span>
                  </button>
                </li>
              </ul>
              <button
                onClick={() => {
                  setRoute({ name: 'shop' });
                  onClose();
                }}
                className="mt-2 text-xs font-bold text-[#A25828] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Browse All 19 Handcrafted Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="md:col-span-8 bg-[#FAF7F2] p-6 rounded-2xl border border-[#E8E0D5] flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/2 aspect-[4/3] rounded-xl overflow-hidden bg-white p-2 flex items-center justify-center">
                <img
                  src={thumbFor(armchair?.images[0] || 'https://images.unsplash.com/photo-1675767528117-963ce219b52a?q=85&w=1200&h=900')} loading="lazy"
                  alt="Beige Armchair"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-3 flex-1">
                <span className="text-[10px] font-bold text-[#A25828] uppercase">Living Room Accent</span>
                <h4 className="font-serif font-bold text-lg text-[#221C18]">
                  Handcrafted British Armchairs
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Tailored in soothing neutral textures and reinforced with kiln-dried timber frames. Engineered to pair seamlessly with our Chesterfield and corner sofas.
                </p>
                <button
                  onClick={() => {
                    setRoute({ name: 'category', categorySlug: 'armchairs' });
                    onClose();
                  }}
                  className="bg-[#A25828] text-white px-5 py-2.5 rounded-full text-xs font-semibold hover:bg-[#8A461A] transition-colors cursor-pointer"
                >
                  Explore Armchairs
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SILO 4: BUYING GUIDES & HERITAGE */}
        {activeSilo === 'guides' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] space-y-3">
              <span className="text-[10px] font-bold text-[#A25828] uppercase flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Pillar Guides</span>
              </span>
              <h4 className="font-serif font-bold text-base text-[#221C18]">
                Master Furniture Guides
              </h4>
              <ul className="space-y-2 text-xs text-[#524842]">
                <li>
                  <button
                    onClick={() => { setRoute({ name: 'blog-detail', slug: 'uk-sofa-buying-guide' }); onClose(); }}
                    className="hover:text-[#A25828] text-left underline"
                  >
                    The UK Sofa Buying Guide (Frame Joinery &amp; Fabrics)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { setRoute({ name: 'blog-detail', slug: 'uk-bed-sizes-and-storage-guide' }); onClose(); }}
                    className="hover:text-[#A25828] text-left underline"
                  >
                    UK Bed Sizes &amp; Hydraulic Ottoman Storage
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { setRoute({ name: 'blog-detail', slug: 'how-to-choose-right-sofa-size' }); onClose(); }}
                    className="hover:text-[#A25828] text-left underline"
                  >
                    7 Easy Ways to Choose the Right Sofa Size
                  </button>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E8E0D5] space-y-3">
              <span className="text-[10px] font-bold text-[#A25828] uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>British Guarantees</span>
              </span>
              <h4 className="font-serif font-bold text-base text-[#221C18]">
                Our Promises
              </h4>
              <div className="space-y-2 text-xs text-stone-600">
                <p><strong>1 Year Warranty:</strong> Every sofa and bed covered for 12 months.</p>
                <p><strong>30-Day Exchange/Return:</strong> Hassle-free exchange policy.</p>
                <p><strong>2-Man Room of Choice:</strong> Carried upstairs and unboxed by specialists.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 space-y-3">
              <span className="text-[10px] font-bold text-[#25D366] uppercase flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Customer Helpline</span>
              </span>
              <h4 className="font-serif font-bold text-base text-[#221C18]">
                WhatsApp Our Upholsterers
              </h4>
              <p className="text-xs text-stone-600">
                Need help measuring your doorway width or selecting custom fabric samples? Chat directly with our customer care team.
              </p>
              <a
                href="https://wa.me/447923119077"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
              >
                <span>WhatsApp: {settings.phone}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
