import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from './BrandLogo';
import {
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Truck,
  RefreshCw,
  Headphones,
  CheckCircle2,
  Banknote,
  Star,
  Send,
} from 'lucide-react';
import { SocialIcons } from './SocialIcons';
import { TrustBadge } from '../types';

export const DEFAULT_TRUST_BADGES: TrustBadge[] = [
  { title: 'Free Delivery', subtitle: 'On all orders across the UK', icon: 'truck' },
  { title: '30-Day Exchange/Return', subtitle: 'Hassle-free exchange policy', icon: 'exchange' },
  { title: 'Cash on Delivery', subtitle: 'Pay with cash upon delivery', icon: 'cash' },
  { title: 'Customer Support', subtitle: 'Mon-Sat 9am-6pm helpline', icon: 'support' },
];

const BADGE_ICONS: Record<TrustBadge['icon'], React.ComponentType<{ className?: string }>> = {
  truck: Truck,
  exchange: RefreshCw,
  cash: Banknote,
  support: Headphones,
  shield: ShieldCheck,
  star: Star,
};

export const Footer: React.FC = () => {
  const { setRoute, settings, activeCategories } = useStore();
  const handleNavClick = (url: string, e: React.MouseEvent) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return;
    }
    e.preventDefault();
    if (url.startsWith('/category/')) {
      const parts = url.replace('/category/', '').split('/');
      setRoute({ name: 'category', categorySlug: parts[0], subcategorySlug: parts[1] });
    } else if (url.startsWith('/product/')) {
      setRoute({ name: 'product', slug: url.replace('/product/', '') });
    } else if (url === '/shop') {
      setRoute({ name: 'shop' });
    } else if (url === '/delivery') {
      setRoute({ name: 'delivery' });
    } else if (url === '/returns') {
      setRoute({ name: 'returns' });
    } else if (url === '/faqs') {
      setRoute({ name: 'faqs' });
    } else if (url === '/contact') {
      setRoute({ name: 'contact' });
    } else if (url === '/account') {
      setRoute({ name: 'account' });
    } else if (url === '/wishlist') {
      setRoute({ name: 'wishlist' });
    } else if (url === '/blog') {
      setRoute({ name: 'blog' });
    } else if (url === '/about') {
      setRoute({ name: 'about' });
    } else if (url === '/privacy') {
      setRoute({ name: 'privacy' });
    } else if (url === '/terms') {
      setRoute({ name: 'terms' });
    } else if (url === '/cookies') {
      setRoute({ name: 'cookies' });
    } else if (url === '/admin') {
      setRoute({ name: 'admin' });
    } else {
      setRoute({ name: 'home' });
    }
  };

  const defaultColumns = [
    {
      id: 'col-collections',
      title: 'Collections',
      links: [
        { title: 'Handcrafted Sofas', url: '/category/sofas' },
        { title: 'Corner & Chaise Sofas', url: '/category/corner-sofas' },
        { title: '3-Seater Living Room Sofas', url: '/category/fabric-sofas' },
        { title: 'Bespoke Ottoman Beds', url: '/category/beds-bed-frames' },
        { title: 'Upholstered Wingback Beds', url: '/category/beds-bed-frames' },
        { title: 'Shop All Collections →', url: '/shop' },
      ],
    },
    {
      id: 'col-care',
      title: 'Customer Care',
      links: [
        { title: 'UK Delivery & White Glove', url: '/delivery' },
        { title: '30-Day Exchange & Returns', url: '/returns' },
        { title: 'Track Order & Dispatch', url: '/account' },
        { title: 'Saved Wishlist', url: '/wishlist' },
        { title: 'Frequently Asked Questions', url: '/faqs' },
        { title: 'Contact Customer Care', url: '/contact' },
      ],
    },
  ];

  const columnsToRender =
    settings.footerDesign?.columns && settings.footerDesign.columns.length > 0
      ? settings.footerDesign.columns
      : defaultColumns;

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setNewsletterSubscribed(true);
  };

  return (
    <footer className="bg-[#FAF7F2] border-t border-[#E8E0D5] text-[#4A3E37]">
      {/* 4 trust badges — editable in Dashboard → Store Design → Footer & Social */}
      <div className="border-b border-[#E8E0D5] bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            {(settings.trustBadges && settings.trustBadges.length > 0 ? settings.trustBadges : DEFAULT_TRUST_BADGES).map((b, i) => {
              const Icon = BADGE_ICONS[b.icon] || ShieldCheck;
              return (
                <div key={i} className="flex flex-col md:flex-row items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#FAF5EE] flex items-center justify-center text-[#A25828] shrink-0 border border-[#E8E0D5]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#221C18]">{b.title}</h4>
                    <p className="text-xs text-[#736961] mt-0.5">{b.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer: brand (left) + link columns (right) + full-width newsletter band under the columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Brand & contact */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo variant="footer" />

            {settings.footerDesign?.aboutText && (
              <p className="text-xs text-[#524842] leading-relaxed max-w-sm">
                {settings.footerDesign.aboutText}
              </p>
            )}

            <div className="space-y-2 text-xs text-[#524842] pt-1">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#A25828] shrink-0" />
                <a href={`tel:${(settings.footerDesign?.phone || settings.phone).replace(/\s+/g, '')}`} className="hover:text-[#A25828]">
                  {settings.footerDesign?.phone || settings.phone}
                </a>
                <span className="text-stone-400">·</span>
                <a
                  href={`https://wa.me/${(settings.footerDesign?.whatsapp || settings.whatsapp || '').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  WhatsApp Us
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#A25828] shrink-0" />
                <a href={`mailto:${settings.footerDesign?.email || settings.email}`} className="hover:text-[#A25828]">
                  {settings.footerDesign?.email || settings.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#A25828] shrink-0" />
                <span>{settings.footerDesign?.openingHours || settings.businessHours}</span>
              </div>
            </div>

            {/* Social media icons */}
            <div className="pt-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8A786A] mb-2">Follow us</span>
              <SocialIcons settings={settings} />
            </div>
          </div>

          {/* Link columns + newsletter (same total width) */}
          <div className="lg:col-span-8 space-y-10">
            <div className={`grid grid-cols-2 gap-8 ${columnsToRender.length >= 3 ? 'sm:grid-cols-3' : columnsToRender.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
              {columnsToRender.map((col) => (
                <div key={col.id}>
                  <h4 className="font-serif font-bold text-base text-[#221C18] mb-4">{col.title}</h4>
                  <ul className="space-y-2.5 text-xs">
                    {col.links.map((link, idx) => (
                      <li key={idx}>
                        <a
                          href={link.url}
                          onClick={(e) => handleNavClick(link.url, e)}
                          className="hover:text-[#A25828] transition-colors cursor-pointer block text-[#524842]"
                        >
                          {link.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Newsletter band spanning the width of the link columns */}
            <div className="rounded-2xl bg-white border border-[#E8E0D5] p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <div className="md:max-w-xs">
                <h4 className="font-serif font-bold text-lg text-[#221C18]">Join Our Circle</h4>
                <p className="text-xs text-[#6B6159] leading-relaxed mt-1">
                  Exclusive fabric previews, seasonal sales and interior inspiration — straight to your inbox.
                </p>
              </div>
              <div className="flex-1">
                {newsletterSubscribed ? (
                  <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thank you! You are subscribed to Plush Comfort updates.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                    <label htmlFor="footer-newsletter" className="sr-only">Email address</label>
                    <input
                      id="footer-newsletter"
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="flex-1 text-sm px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#D5C7B7] text-[#221C18] placeholder-stone-400 focus:outline-none focus:border-[#A25828]"
                    />
                    <button
                      type="submit"
                      className="bg-[#A25828] text-white hover:bg-[#8A461A] text-sm font-semibold px-6 py-3 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Subscribe</span>
                    </button>
                  </form>
                )}
                <a
                  href="/blog"
                  onClick={(e) => {
                    e.preventDefault();
                    setRoute({ name: 'blog' });
                  }}
                  className="inline-block mt-2 text-xs font-semibold text-[#A25828] hover:underline"
                >
                  Read our buying guides &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal, Payment Badges & Copyright */}
        <div className="border-t border-[#E8E0D5] mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#8A786A]">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>
              {settings.footerDesign?.copyrightText || `© ${new Date().getFullYear()} Plush Comfort UK. All rights reserved.`}
            </span>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                setRoute({ name: 'privacy' });
              }}
              className="hover:text-[#221C18] transition-colors cursor-pointer"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                setRoute({ name: 'terms' });
              }}
              className="hover:text-[#221C18] transition-colors cursor-pointer"
            >
              Terms &amp; Conditions
            </a>
            <a
              href="/cookies"
              onClick={(e) => {
                e.preventDefault();
                setRoute({ name: 'cookies' });
              }}
              className="hover:text-[#221C18] transition-colors cursor-pointer"
            >
              Cookie Policy
            </a>
            <a
              href="/admin"
              rel="nofollow"
              onClick={(e) => {
                e.preventDefault();
                setRoute({ name: 'admin' });
              }}
              className="hover:text-[#221C18] transition-colors cursor-pointer text-[#8A786A] opacity-80 hover:opacity-100"
            >
              Staff &amp; Owner Portal
            </a>
          </div>

          {/* Payment / Handover Badges */}
          <div className="flex flex-wrap items-center gap-2 text-stone-600 font-sans text-[11px]">
            <span className="px-2.5 py-1 bg-[#FAF5EE] text-[#A25828] font-semibold rounded-lg border border-[#E8CDBB]">
              Cash on Delivery (Pay on Handover)
            </span>
            <span className="px-2.5 py-1 bg-white rounded-lg border border-[#E8E0D5]">
              2-Man Room of Choice
            </span>
            <span className="px-2.5 py-1 bg-white rounded-lg border border-[#E8E0D5]">
              1 Year Warranty
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
