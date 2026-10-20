import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from './BrandLogo';
import { MegaMenu } from './MegaMenu';
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  Phone,
  ChevronDown,
  ChevronRight,
  Lock,
  MessageCircle,
  Mail,
} from 'lucide-react';
import { SocialIcons } from './SocialIcons';

export const Header: React.FC = () => {
  const {
    currentRoute,
    setRoute,
    cartCount,
    wishlist,
    settings,
    setIsCartDrawerOpen,
    setIsSearchOpen,
    products,
    categories,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSiloOpen, setMobileSiloOpen] = useState<'sofas' | 'beds' | 'living' | 'guides' | null>(null);
  const [activeMegaSilo, setActiveMegaSilo] = useState<'sofas' | 'beds' | 'living' | 'guides' | null>(null);

  // Work out which top-level menu item belongs to the page that is open right now.
  // Only ONE item is ever highlighted; hovering a menu only opens the dropdown.
  const siloForSlug = (slug: string): 'sofas' | 'beds' | 'living' | null => {
    const s = slug.toLowerCase();
    if (s.includes('sofa') || s.includes('armchair') || s.includes('chair')) return 'sofas';
    if (s.includes('bed') || s.includes('mattress') || s.includes('ottoman') || s.includes('divan')) return 'beds';
    if (s.includes('living') || s.includes('dining') || s.includes('table')) return 'living';
    return null;
  };
  const activeNav: string = (() => {
    switch (currentRoute.name) {
      case 'home':
        return 'home';
      case 'shop':
        return 'shop';
      case 'about':
        return 'about';
      case 'contact':
        return 'contact';
      case 'blog':
      case 'blog-detail':
        return 'guides';
      case 'category': {
        const cat = categories.find((c) => c.slug === currentRoute.categorySlug);
        const parent = cat?.parentId ? categories.find((c) => c.id === cat.parentId) : undefined;
        return siloForSlug(parent?.slug || currentRoute.categorySlug) || '';
      }
      case 'product': {
        const prod = products.find((p) => p.slug === currentRoute.slug);
        const cat = prod ? categories.find((c) => c.id === prod.categoryId) : undefined;
        return siloForSlug(cat?.slug || prod?.categoryId || '') || '';
      }
      default:
        return '';
    }
  })();
  const isCurrent = (navId: string) => activeNav === navId;
  const navClass = (navId: string) =>
    `transition-colors hover:text-[#A25828] cursor-pointer py-2 border-b-2 ${
      isCurrent(navId) ? 'text-[#A25828] font-bold border-[#A25828]' : 'border-transparent'
    }`;

  const phone = settings.footerDesign?.phone || settings.phone;
  const email = settings.footerDesign?.email || settings.email;
  const showSocials = settings.topBarShowSocials !== false;
  const showContact = settings.topBarShowContact !== false;

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/98 backdrop-blur-md border-b border-[#E8E0D5] transition-all">
      {/* TOP BAR: socials (left) · scrolling announcement (centre) · contact + Staff & Owner (right) */}
      <div className="bg-[#221C18] text-[#FDFBF7] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center gap-4">
          {showSocials && (
            <div className="hidden md:flex items-center shrink-0">
              <SocialIcons settings={settings} variant="dark" size="sm" />
            </div>
          )}

          {settings.isPromoBannerActive && settings.promoBannerText ? (
            <a
              href={settings.announcementLink || '/shop'}
              onClick={(e) => {
                e.preventDefault();
                const link = settings.announcementLink || '/shop';
                if (link.startsWith('/category/')) setRoute({ name: 'category', categorySlug: link.replace('/category/', '') });
                else if (link.startsWith('/product/')) setRoute({ name: 'product', slug: link.replace('/product/', '') });
                else setRoute({ name: 'shop' });
              }}
              className="pc-marquee flex-1 min-w-0 overflow-hidden whitespace-nowrap mx-auto max-w-xl cursor-pointer"
              aria-label={settings.promoBannerText}
            >
              <span className="pc-marquee-track">
                {[0, 1].map((i) => (
                  <span key={i} className="flex items-center gap-10 pr-10" aria-hidden={i === 1}>
                    <span className="font-medium tracking-wide">{settings.promoBannerText}</span>
                    <span className="text-[#E8A87C] font-semibold">Shop now &rarr;</span>
                    <span className="font-medium tracking-wide">Cash on Delivery · 30-Day Exchange / Return</span>
                    <span className="text-[#E8A87C] font-semibold">&#9733;</span>
                  </span>
                ))}
              </span>
            </a>
          ) : (
            <div className="flex-1" />
          )}

          <div className="hidden lg:flex items-center gap-4 shrink-0 text-stone-300">
            {showContact && phone && (
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Phone className="w-3.5 h-3.5 text-[#E8A87C]" />
                <span>{phone}</span>
              </a>
            )}
            {showContact && email && (
              <a href={`mailto:${email}`} className="hidden xl:flex items-center gap-1.5 hover:text-white transition-colors">
                <Mail className="w-3.5 h-3.5 text-[#E8A87C]" />
                <span>{email}</span>
              </a>
            )}
            <a
              href="/admin"
              rel="nofollow"
              onClick={(e) => {
                e.preventDefault();
                setActiveMegaSilo(null);
                setRoute({ name: 'admin' });
              }}
              title="Restricted — Staff & Owner Portal Only"
              className="flex items-center gap-1.5 text-[11px] text-stone-300 hover:text-white border border-white/15 hover:border-[#E8A87C] px-2.5 py-1 rounded-md transition-colors"
            >
              <Lock className="w-3 h-3 text-[#E8A87C]" />
              <span className="font-medium">Staff &amp; Owner</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo - Bespoke Original Vector Logo for Plush Comfort UK */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setActiveMegaSilo(null);
                setRoute({ name: 'home' });
              }}
              className="text-left focus:outline-none block"
              title="Plush Comfort UK - Luxury Handcrafted Furniture"
            >
              <BrandLogo variant="header" />
            </a>
          </div>

          {/* Desktop Silo / Mega Menu Navigation */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#4A3E37]">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                setActiveMegaSilo(null);
                setRoute({ name: 'home' });
              }}
              className={navClass('home')}
            >
              Home
            </a>

            {/* Silo 1: Sofas Mega Trigger */}
            <div
              className="relative"
              onMouseEnter={() => setActiveMegaSilo('sofas')}
            >
              <a
                href="/category/sofas"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveMegaSilo(null);
                  setRoute({ name: 'category', categorySlug: 'sofas' });
                }}
                className={`flex items-center gap-1 ${navClass('sofas')}`}
              >
                <span>Sofas</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>

            {/* Silo 2: Beds Mega Trigger */}
            <div
              className="relative"
              onMouseEnter={() => setActiveMegaSilo('beds')}
            >
              <a
                href="/category/beds"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveMegaSilo(null);
                  setRoute({ name: 'category', categorySlug: 'beds' });
                }}
                className={`flex items-center gap-1 ${navClass('beds')}`}
              >
                <span>Beds</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>

            {/* Silo 3: Living & Dining Furniture */}
            <div
              className="relative"
              onMouseEnter={() => setActiveMegaSilo('living')}
            >
              <a
                href="/shop"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveMegaSilo(null);
                  setRoute({ name: 'shop' });
                }}
                className={`flex items-center gap-1 ${navClass('living')}`}
              >
                <span>Living &amp; Dining</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>

            <a
              href="/shop"
              onClick={(e) => {
                e.preventDefault();
                setActiveMegaSilo(null);
                setRoute({ name: 'shop' });
              }}
              className={navClass('shop')}
            >
              Shop All
            </a>

            {/* Silo 4: Buying Guides */}
            <div
              className="relative"
              onMouseEnter={() => setActiveMegaSilo('guides')}
            >
              <a
                href="/blog"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveMegaSilo(null);
                  setRoute({ name: 'blog' });
                }}
                className={`flex items-center gap-1 ${navClass('guides')}`}
              >
                <span>Buying Guides</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>

            <a
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                setActiveMegaSilo(null);
                setRoute({ name: 'about' });
              }}
              className={navClass('about')}
            >
              About
            </a>

            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                setActiveMegaSilo(null);
                setRoute({ name: 'contact' });
              }}
              className={navClass('contact')}
            >
              Contact
            </a>
          </nav>

          {/* Right Action Icons & Primary CTA */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search furniture catalog"
              className="p-2 text-[#4A3E37] hover:text-[#A25828] transition-colors rounded-full hover:bg-stone-100 cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon with Dynamic Count Badge */}
            <button
              onClick={() => {
                setActiveMegaSilo(null);
                setRoute({ name: 'wishlist' });
              }}
              aria-label="Wishlist saved pieces"
              className="p-2 text-[#4A3E37] hover:text-[#A25828] transition-colors rounded-full hover:bg-stone-100 relative cursor-pointer"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#A25828] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Basket Drawer Trigger with Live Count */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              aria-label="Shopping basket"
              className="p-2 text-[#4A3E37] hover:text-[#A25828] transition-colors rounded-full hover:bg-stone-100 relative cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-[#A25828] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => {
                setActiveMegaSilo(null);
                setRoute({ name: 'shop' });
              }}
              className="hidden sm:inline-flex items-center justify-center bg-[#A25828] text-white hover:bg-[#8A461A] px-5 py-2.5 rounded-full text-sm font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
            >
              Shop Now
            </button>

            {/* Mobile / Tablet Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="lg:hidden p-2 text-[#221C18] hover:text-[#A25828] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP MEGA MENU DROPDOWN */}
      <MegaMenu activeSilo={activeMegaSilo} onClose={() => setActiveMegaSilo(null)} />

      {/* MOBILE & TABLET SILO ACCORDION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E8E0D5] px-4 pt-4 pb-8 shadow-2xl max-h-[85vh] overflow-y-auto animate-fade-in">
          <div className="space-y-2 text-sm font-medium text-[#221C18]">
            <button
              onClick={() => { setRoute({ name: 'home' }); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-xl hover:bg-[#FAF8F5]"
            >
              Home
            </button>

            {/* Silo 1: Sofas Accordion */}
            <div className="border border-[#E8E0D5] rounded-2xl overflow-hidden">
              <button
                onClick={() => setMobileSiloOpen(mobileSiloOpen === 'sofas' ? null : 'sofas')}
                className="w-full flex items-center justify-between p-3.5 bg-[#FAF8F5] text-left font-bold text-[#221C18]"
              >
                <span>Sofas &amp; Sectionals</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileSiloOpen === 'sofas' ? 'rotate-180' : ''}`} />
              </button>
              {mobileSiloOpen === 'sofas' && (
                <div className="p-3 bg-white space-y-2 text-xs text-stone-700 divide-y divide-stone-100">
                  <button
                    onClick={() => { setRoute({ name: 'category', categorySlug: 'sofas' }); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 font-bold text-[#A25828]"
                  >
                    View All Sofas &rarr;
                  </button>
                  <button
                    onClick={() => { setRoute({ name: 'category', categorySlug: 'sofas', subcategorySlug: 'corner-sofas' }); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2"
                  >
                    Corner &amp; Chaise Sofas
                  </button>
                  <button
                    onClick={() => { setRoute({ name: 'category', categorySlug: 'sofas', subcategorySlug: '3-seater-sofas' }); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2"
                  >
                    3-Seater Sofas
                  </button>
                  <button
                    onClick={() => { setRoute({ name: 'category', categorySlug: 'sofas', subcategorySlug: '2-seater-sofas' }); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2"
                  >
                    2-Seater Loveseats
                  </button>
                  <button
                    onClick={() => { setRoute({ name: 'category', categorySlug: 'sofas', subcategorySlug: 'sofa-beds' }); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2"
                  >
                    Sofa Beds
                  </button>
                  <button
                    onClick={() => { setRoute({ name: 'blog-detail', slug: 'uk-sofa-buying-guide' }); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 text-stone-500 font-semibold"
                  >
                    Read Sofa Buying Guide ↗
                  </button>
                </div>
              )}
            </div>

            {/* Silo 2: Beds Accordion */}
            <div className="border border-[#E8E0D5] rounded-2xl overflow-hidden">
              <button
                onClick={() => setMobileSiloOpen(mobileSiloOpen === 'beds' ? null : 'beds')}
                className="w-full flex items-center justify-between p-3.5 bg-[#FAF8F5] text-left font-bold text-[#221C18]"
              >
                <span>Beds &amp; Ottoman Frames</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileSiloOpen === 'beds' ? 'rotate-180' : ''}`} />
              </button>
              {mobileSiloOpen === 'beds' && (
                <div className="p-3 bg-white space-y-2 text-xs text-stone-700 divide-y divide-stone-100">
                  <button
                    onClick={() => { setRoute({ name: 'category', categorySlug: 'beds' }); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 font-bold text-[#A25828]"
                  >
                    View All Beds &rarr;
                  </button>
                  <button
                    onClick={() => { setRoute({ name: 'category', categorySlug: 'beds', subcategorySlug: 'ottoman-beds' }); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2"
                  >
                    Gas-Lift Ottoman Storage Beds
                  </button>
                  <button
                    onClick={() => { setRoute({ name: 'category', categorySlug: 'beds', subcategorySlug: 'upholstered-beds' }); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2"
                  >
                    Upholstered Wingback Beds
                  </button>
                  <button
                    onClick={() => { setRoute({ name: 'category', categorySlug: 'beds', subcategorySlug: 'divan-beds' }); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2"
                  >
                    Deep Buttoned Divans
                  </button>
                  <button
                    onClick={() => { setRoute({ name: 'blog-detail', slug: 'uk-bed-sizes-and-storage-guide' }); setMobileMenuOpen(false); }}
                    className="w-full text-left py-2 text-stone-500 font-semibold"
                  >
                    Read UK Bed Sizes Guide ↗
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => { setRoute({ name: 'shop' }); setMobileMenuOpen(false); }}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-[#FAF8F5] font-semibold"
            >
              Shop All Collections
            </button>

            <button
              onClick={() => { setRoute({ name: 'blog' }); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-xl hover:bg-[#FAF8F5]"
            >
              Furniture Buying Guides
            </button>

            <button
              onClick={() => { setRoute({ name: 'wishlist' }); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-xl hover:bg-[#FAF8F5] flex items-center justify-between"
            >
              <span>Saved Wishlist</span>
              {wishlist.length > 0 && (
                <span className="bg-[#A25828] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setRoute({ name: 'account' }); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-xl hover:bg-[#FAF8F5]"
            >
              Order History &amp; Live Tracking
            </button>

            <button
              onClick={() => { setRoute({ name: 'about' }); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-xl hover:bg-[#FAF8F5]"
            >
              About Plush Comfort
            </button>

            <button
              onClick={() => { setRoute({ name: 'contact' }); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-xl hover:bg-[#FAF8F5]"
            >
              Contact Customer Care
            </button>

            <a
              href="/admin"
              rel="nofollow"
              onClick={(e) => {
                e.preventDefault();
                setRoute({ name: 'admin' });
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2.5 px-3 rounded-xl bg-stone-100/90 font-medium text-xs text-stone-700 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#A25828]" />
                <span>Staff &amp; Owner Portal</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded">Staff Only</span>
            </a>
          </div>

          <div className="mt-5 pt-4 border-t border-stone-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
              <SocialIcons settings={settings} size="sm" />
              <div className="flex flex-col items-end">
                {phone && <a href={`tel:${phone.replace(/\s+/g, '')}`} className="font-semibold">{phone}</a>}
                {email && <a href={`mailto:${email}`}>{email}</a>}
              </div>
            </div>
            <a
              href={`https://wa.me/${(settings.whatsapp || phone || '').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl text-xs font-bold"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Us ({settings.whatsapp || phone})</span>
            </a>
            <button
              onClick={() => { setRoute({ name: 'shop' }); setMobileMenuOpen(false); }}
              className="w-full bg-[#A25828] text-white py-3 rounded-full text-xs font-bold"
            >
              Shop Handcrafted Furniture
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
