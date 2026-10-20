import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  StoreSettings,
  HeroDesignSettings,
  MegaMenuDesignSettings,
  FooterDesignSettings,
  HomepageSection,
  Product,
} from '../../types';
import { DEFAULT_HOMEPAGE_SECTIONS } from '../../data/initialData';
import { adminAuthService } from '../../services/adminAuthService';
import {
  Sparkles,
  Layout,
  Menu,
  Sliders,
  Upload,
  Check,
  Eye,
  Info,
  Layers,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  X,
  ShoppingBag,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Clock,
  Video,
  Megaphone,
  Share2,
  BadgeCheck,
} from 'lucide-react';
import { ImageField } from './SeoImageField';
import { DEFAULT_TRUST_BADGES } from '../Footer';
import { TrustBadge } from '../../types';

const DEFAULT_FOOTER_COLUMNS = [
  {
    id: 'col-shop',
    title: 'Shop Collections',
    links: [
      { title: 'Handcrafted Sofas', url: '/category/sofas' },
      { title: 'Chesterfield Suites', url: '/category/chesterfield-sofas' },
      { title: 'Corner & U-Shape Sofas', url: '/category/corner-sofas' },
      { title: 'Ottoman Storage Beds', url: '/category/beds-bed-frames' },
      { title: 'Pocket Sprung Mattresses', url: '/category/mattresses' },
      { title: 'Shop All Products', url: '/shop' },
    ],
  },
  {
    id: 'col-care',
    title: 'Customer Care',
    links: [
      { title: 'UK Delivery & White Glove', url: '/delivery' },
      { title: '30-Day Exchange & Returns', url: '/returns' },
      { title: 'Track Your Order', url: '/account' },
      { title: 'Saved Wishlist', url: '/wishlist' },
      { title: 'Frequently Asked Questions', url: '/faqs' },
      { title: 'Contact Customer Care', url: '/contact' },
    ],
  },
  {
    id: 'col-guides',
    title: 'Inspiration & Guides',
    links: [
      { title: 'Sofa Buying Guide', url: '/blog' },
      { title: 'Fabric & Velvet Care', url: '/blog' },
      { title: 'Room Measuring Tips', url: '/blog' },
      { title: 'About Plush Comfort', url: '/about' },
    ],
  },
];

type DesignSubTab = 'homepage' | 'header' | 'megamenu' | 'footer' | 'global';

export interface StoreDesignStudioProps {
  initialSubTab?: DesignSubTab;
}

export const StoreDesignStudio: React.FC<StoreDesignStudioProps> = ({ initialSubTab = 'homepage' }) => {
  const { settings, updateSettings, products } = useStore();

  const [activeSubTab, setActiveSubTab] = useState<DesignSubTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [designForm, setDesignForm] = useState<StoreSettings>(() => ({
    ...settings,
    homepageSections: settings.homepageSections || DEFAULT_HOMEPAGE_SECTIONS,
    footerDesign: {
      ...settings.footerDesign,
      aboutText: settings.footerDesign?.aboutText || 'Plush Comfort UK is an online furniture store delivering luxury sofas, corner suites and ottoman beds across the UK.',
      columns: settings.footerDesign?.columns && settings.footerDesign.columns.length > 0 ? settings.footerDesign.columns : DEFAULT_FOOTER_COLUMNS,
      phone: settings.footerDesign?.phone || settings.phone,
      whatsapp: settings.footerDesign?.whatsapp || settings.whatsapp,
      email: settings.footerDesign?.email || settings.email,
      address: settings.footerDesign?.address || settings.address,
      openingHours: settings.footerDesign?.openingHours || settings.businessHours,
      socialInstagram: settings.footerDesign?.socialInstagram || 'https://instagram.com/plushcomfortuk',
      socialFacebook: settings.footerDesign?.socialFacebook || 'https://facebook.com/plushcomfortuk',
      socialPinterest: settings.footerDesign?.socialPinterest ?? 'https://pinterest.com/plushcomfortuk',
      socialTiktok: settings.footerDesign?.socialTiktok || '',
      socialYoutube: settings.footerDesign?.socialYoutube || '',
      socialLinkedin: settings.footerDesign?.socialLinkedin || '',
      copyrightText: settings.footerDesign?.copyrightText || `© ${new Date().getFullYear()} Plush Comfort UK. All rights reserved.`,
    },
  }));

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Upload helper for hero, promo & logo
  const handleUploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'heroDesktop' | 'heroMobile' | 'megaPromo' | 'logo' | 'favicon'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await adminAuthService.uploadImage(base64Data, file.name, `Design Studio: ${field}`);
        if (res.success && res.url) {
          if (field === 'heroDesktop') {
            setDesignForm((prev) => ({
              ...prev,
              heroDesign: {
                ...(prev.heroDesign || settings.heroDesign!),
                desktopImage: res.url!,
              },
            }));
          } else if (field === 'heroMobile') {
            setDesignForm((prev) => ({
              ...prev,
              heroDesign: {
                ...(prev.heroDesign || settings.heroDesign!),
                mobileImage: res.url!,
              },
            }));
          } else if (field === 'megaPromo') {
            setDesignForm((prev) => ({
              ...prev,
              megaMenuDesign: {
                ...(prev.megaMenuDesign || settings.megaMenuDesign!),
                promoImage: res.url!,
              },
            }));
          } else if (field === 'logo') {
            setDesignForm((prev) => ({
              ...prev,
              logoUrl: res.url!,
            }));
          } else if (field === 'favicon') {
            setDesignForm((prev) => ({
              ...prev,
              faviconUrl: res.url!,
            }));
          }
        }
      } catch (err) {
        console.error('Image upload failed:', err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload helper for homepage section images
  const handleUploadSectionImage = async (e: React.ChangeEvent<HTMLInputElement>, sectionId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await adminAuthService.uploadImage(base64Data, file.name, `Homepage Section: ${sectionId}`);
        if (res.success && res.url) {
          updateSection(sectionId, { image: res.url });
        }
      } catch (err) {
        console.error('Section image upload failed:', err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Homepage Sections Handlers
  const currentSections: HomepageSection[] = (designForm.homepageSections || DEFAULT_HOMEPAGE_SECTIONS)
    .slice()
    .sort((a, b) => a.order - b.order);

  const updateSection = (sectionId: string, updates: Partial<HomepageSection>) => {
    const updated = currentSections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s));
    setDesignForm((prev) => ({ ...prev, homepageSections: updated }));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSections.length) return;

    const newSections = [...currentSections];
    const current = newSections[index];
    const target = newSections[targetIndex];

    const tempOrder = current.order;
    current.order = target.order;
    target.order = tempOrder;

    newSections.sort((a, b) => a.order - b.order);
    setDesignForm((prev) => ({ ...prev, homepageSections: newSections }));
  };

  const addProductToSection = (sectionId: string, productId: string) => {
    if (!productId) return;
    const updated = currentSections.map((s) => {
      if (s.id === sectionId) {
        const currentIds = s.productIds || [];
        if (!currentIds.includes(productId)) {
          return { ...s, productIds: [...currentIds, productId] };
        }
      }
      return s;
    });
    setDesignForm((prev) => ({ ...prev, homepageSections: updated }));
  };

  const removeProductFromSection = (sectionId: string, productId: string) => {
    const updated = currentSections.map((s) => {
      if (s.id === sectionId) {
        return { ...s, productIds: (s.productIds || []).filter((id) => id !== productId) };
      }
      return s;
    });
    setDesignForm((prev) => ({ ...prev, homepageSections: updated }));
  };

  const replaceProductInSection = (sectionId: string, oldProductId: string, newProductId: string) => {
    if (!newProductId || oldProductId === newProductId) return;
    const updated = currentSections.map((s) => {
      if (s.id === sectionId) {
        const currentIds = s.productIds || [];
        return { ...s, productIds: currentIds.map((id) => (id === oldProductId ? newProductId : id)) };
      }
      return s;
    });
    setDesignForm((prev) => ({ ...prev, homepageSections: updated }));
  };

  // Footer Management Handlers
  const footer = designForm.footerDesign || settings.footerDesign!;
  const footerColumns = footer.columns && footer.columns.length > 0 ? footer.columns : DEFAULT_FOOTER_COLUMNS;

  const handleAddFooterColumn = () => {
    const newCol = {
      id: `col-${Date.now()}`,
      title: 'New Column',
      links: [{ title: 'All Products', url: '/shop' }],
    };
    setDesignForm((prev) => ({
      ...prev,
      footerDesign: {
        ...(prev.footerDesign || footer),
        columns: [...footerColumns, newCol],
      },
    }));
  };

  const handleRemoveFooterColumn = (colId: string) => {
    if (footerColumns.length <= 1) {
      alert('You must have at least one footer column.');
      return;
    }
    setDesignForm((prev) => ({
      ...prev,
      footerDesign: {
        ...(prev.footerDesign || footer),
        columns: footerColumns.filter((c) => c.id !== colId),
      },
    }));
  };

  const handleUpdateColumnTitle = (colId: string, newTitle: string) => {
    setDesignForm((prev) => ({
      ...prev,
      footerDesign: {
        ...(prev.footerDesign || footer),
        columns: footerColumns.map((c) => (c.id === colId ? { ...c, title: newTitle } : c)),
      },
    }));
  };

  const handleAddLinkToColumn = (colId: string) => {
    setDesignForm((prev) => ({
      ...prev,
      footerDesign: {
        ...(prev.footerDesign || footer),
        columns: footerColumns.map((c) =>
          c.id === colId
            ? { ...c, links: [...c.links, { title: 'New Link', url: '/shop' }] }
            : c
        ),
      },
    }));
  };

  const handleUpdateLink = (colId: string, linkIndex: number, title: string, url: string) => {
    setDesignForm((prev) => ({
      ...prev,
      footerDesign: {
        ...(prev.footerDesign || footer),
        columns: footerColumns.map((c) => {
          if (c.id === colId) {
            const newLinks = [...c.links];
            newLinks[linkIndex] = { title, url };
            return { ...c, links: newLinks };
          }
          return c;
        }),
      },
    }));
  };

  const handleRemoveLink = (colId: string, linkIndex: number) => {
    setDesignForm((prev) => ({
      ...prev,
      footerDesign: {
        ...(prev.footerDesign || footer),
        columns: footerColumns.map((c) => {
          if (c.id === colId) {
            return { ...c, links: c.links.filter((_, idx) => idx !== linkIndex) };
          }
          return c;
        }),
      },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(designForm); // saves to the server (live) + this browser
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const hero = designForm.heroDesign || settings.heroDesign!;
  const setHero = (patch: Partial<typeof hero>) => setDesignForm((prev) => ({ ...prev, heroDesign: { ...(prev.heroDesign || hero), ...patch } }));
  const showcaseIds = hero.showcaseProductIds && hero.showcaseProductIds.length > 0 ? hero.showcaseProductIds : ['prod-216', 'prod-194', 'prod-223', 'prod-180', 'prod-130'];
  const trustPoints = hero.trustPoints && hero.trustPoints.length > 0 ? hero.trustPoints : [
    { strong: '1 Year', text: 'Warranty' },
    { strong: 'Free UK', text: 'Mainland Delivery' },
    { strong: '30-Day', text: 'Exchange / Return' },
    { strong: 'Cash', text: 'on Delivery' },
  ];
  const badges: TrustBadge[] = designForm.trustBadges && designForm.trustBadges.length > 0 ? designForm.trustBadges : DEFAULT_TRUST_BADGES;
  const setBadges = (next: TrustBadge[]) => setDesignForm((prev) => ({ ...prev, trustBadges: next }));
  const [videoUploading, setVideoUploading] = useState(false);
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setVideoUploading(true);
    const res = await adminAuthService.uploadVideo(file);
    setVideoUploading(false);
    if (res.success && res.url) setHero({ videoUrl: res.url, showVideoButton: true });
    else alert(res.error || 'Video upload failed');
  };
  const mega = designForm.megaMenuDesign || settings.megaMenuDesign!;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E0D5] space-y-6 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A25828]">
                Theme &amp; Experience Studio
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Live Storefront Connected
              </span>
            </div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#221C18] mt-1">
              Storefront &amp; Homepage Management
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Manage Homepage Hero, Homepage Sections, Mega Menus, Footer, and Brand Assets. Changes save persistently.
            </p>
          </div>

          {saveSuccess && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Changes saved &amp; live on storefront!</span>
            </div>
          )}
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200 text-xs font-semibold">
          {(
            [
              ['homepage', 'Homepage (Hero + Sections)', Sparkles],
              ['header', 'Top Bar & Header', Megaphone],
              ['megamenu', 'Mega Menu', Menu],
              ['footer', 'Footer, Social & Trust Badges', Layout],
              ['global', 'Brand Assets', Sliders],
            ] as const
          ).map(([id, label, Icon], i) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSubTab(id)}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === id ? 'bg-[#A25828] text-white shadow-xs' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{i + 1}. {label}</span>
            </button>
          ))}
        </div>

        {/* Tab Forms */}
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* TAB 1: HOMEPAGE = HERO SETTINGS + ALL SECTIONS (merged, no duplicate tabs) */}
          {activeSubTab === 'homepage' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 rounded-2xl border border-[#A25828]/30 bg-[#FAF2EB]/40 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#A25828] text-white font-mono font-bold text-xs flex items-center justify-center">#1</span>
                  <h4 className="font-serif font-bold text-base text-[#221C18]">Hero section</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-stone-800 mb-1">Main headline (H1)</label>
                    <input type="text" value={hero.heading} onChange={(e) => setHero({ heading: e.target.value })} className="w-full p-2.5 rounded-xl border border-[#D5C7B7] font-serif text-base" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-stone-800 mb-1">Sub-heading</label>
                    <input type="text" value={hero.subheading} onChange={(e) => setHero({ subheading: e.target.value })} className="w-full p-2.5 rounded-xl border border-[#D5C7B7]" />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">Main button text</label>
                    <input type="text" value={hero.primaryCtaText} onChange={(e) => setHero({ primaryCtaText: e.target.value })} className="w-full p-2.5 rounded-xl border border-[#D5C7B7]" />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">Main button link</label>
                    <input type="text" value={hero.primaryCtaLink} onChange={(e) => setHero({ primaryCtaLink: e.target.value })} className="w-full p-2.5 rounded-xl border border-[#D5C7B7] font-mono text-[11px]" />
                  </div>
                </div>

                {/* Video button */}
                <div className="p-4 rounded-xl bg-white border border-[#E8E0D5] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-stone-900 flex items-center gap-1.5"><Video className="w-4 h-4 text-[#A25828]" /> Video button (next to the main button)</span>
                    <label className="flex items-center gap-2 font-semibold text-stone-700">
                      <input type="checkbox" checked={hero.showVideoButton !== false} onChange={(e) => setHero({ showVideoButton: e.target.checked })} />
                      Show
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Button text</label>
                      <input value={hero.videoButtonText || ''} placeholder="Watch Video" onChange={(e) => setHero({ videoButtonText: e.target.value })} className="w-full p-2.5 rounded-xl border border-stone-300" />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">Popup title</label>
                      <input value={hero.videoTitle || ''} placeholder="See Plush Comfort in Action" onChange={(e) => setHero({ videoTitle: e.target.value })} className="w-full p-2.5 rounded-xl border border-stone-300" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-stone-700 mb-1">Video link — YouTube / Vimeo link, or upload an MP4 (max 20 MB)</label>
                      <div className="flex gap-2">
                        <input
                          value={hero.videoUrl || ''}
                          placeholder="https://www.youtube.com/watch?v=..."
                          onChange={(e) => setHero({ videoUrl: e.target.value })}
                          className="flex-1 p-2.5 rounded-xl border border-stone-300 font-mono text-[11px]"
                        />
                        <label className="bg-[#A25828] hover:bg-[#8A461A] text-white px-3 py-2.5 rounded-xl font-semibold cursor-pointer inline-flex items-center gap-1">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{videoUploading ? 'Uploading…' : 'Upload MP4'}</span>
                          <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={handleVideoUpload} disabled={videoUploading} />
                        </label>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1">The button only appears when a video link is set. YouTube is recommended — it loads fastest.</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-stone-700 mb-1">Text under the video (optional)</label>
                      <input value={hero.videoDescription || ''} onChange={(e) => setHero({ videoDescription: e.target.value })} className="w-full p-2.5 rounded-xl border border-stone-300" />
                    </div>
                  </div>
                </div>

                {/* Trust points */}
                <div className="p-4 rounded-xl bg-white border border-[#E8E0D5] space-y-2">
                  <span className="font-bold text-stone-900">4 trust points under the buttons</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {trustPoints.slice(0, 4).map((tp, i) => (
                      <div key={i} className="flex gap-2">
                        <input value={tp.strong} onChange={(e) => setHero({ trustPoints: trustPoints.map((t, j) => (j === i ? { ...t, strong: e.target.value } : t)) })} className="w-24 p-2 rounded-lg border border-stone-300 font-bold" />
                        <input value={tp.text} onChange={(e) => setHero({ trustPoints: trustPoints.map((t, j) => (j === i ? { ...t, text: e.target.value } : t)) })} className="flex-1 p-2 rounded-lg border border-stone-300" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Showcase products */}
                <div className="p-4 rounded-xl bg-white border border-[#E8E0D5] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-stone-900">Products in the hero showcase</span>
                      <p className="text-[11px] text-stone-500">Each product's featured image is shown full size; customers click the thumbnails to switch.</p>
                    </div>
                    <select
                      value=""
                      onChange={(e) => e.target.value && setHero({ showcaseProductIds: [...showcaseIds.filter((id) => id !== e.target.value), e.target.value] })}
                      className="p-2 rounded-xl border border-stone-300 bg-white text-xs max-w-xs"
                    >
                      <option value="">+ Add product…</option>
                      {products.filter((p) => p.isPublished && !showcaseIds.includes(p.id)).map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {showcaseIds.map((id, i) => {
                      const p = products.find((x) => x.id === id);
                      if (!p) return null;
                      return (
                        <div key={id} className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 bg-[#FAF8F5]">
                          <img src={p.images[0]} alt="" className="w-12 h-10 object-cover rounded-lg" />
                          <span className="flex-1 text-[11px] font-semibold truncate">{i + 1}. {p.name}</span>
                          <button type="button" disabled={i === 0} onClick={() => { const n = [...showcaseIds]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setHero({ showcaseProductIds: n }); }} className="p-1 text-stone-500 disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                          <button type="button" onClick={() => setHero({ showcaseProductIds: showcaseIds.filter((x) => x !== id) })} className="p-1 text-stone-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-stone-500">Below: turn every homepage section on/off, change its order, text, image and products.</p>
            </div>
          )}

          {/* TAB 2: HOMEPAGE SECTIONS MANAGEMENT */}
          {activeSubTab === 'homepage' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#A25828]" />
                  <div className="space-y-1">
                    <span className="font-bold block">Individual Homepage Sections Control</span>
                    <p className="text-[11px] leading-relaxed">
                      Manage every homepage section: edit headings, subtitles, descriptions, and images. Turn sections <strong>ON or OFF</strong>, adjust their display order using the Up/Down arrows, and select, add, or replace products for product showcase sections.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDesignForm((prev) => ({ ...prev, homepageSections: DEFAULT_HOMEPAGE_SECTIONS }))}
                  className="text-[11px] font-semibold text-[#A25828] hover:underline shrink-0 bg-white px-3 py-1.5 rounded-xl border border-amber-300"
                >
                  Reset Default Layout
                </button>
              </div>

              {/* Sections List */}
              <div className="space-y-4">
                {currentSections.map((section, index) => {
                  const isFirst = index === 0;
                  const isLast = index === currentSections.length - 1;
                  const isProductSection = ['trending', 'under_2500', 'sofas', 'beds'].includes(section.id);
                  const isImageSection = ['dual_promos', 'deal_banner'].includes(section.id);

                  // Resolved product objects for this section
                  const sectionProducts = (section.productIds || [])
                    .map((id) => products.find((p) => p.id === id))
                    .filter(Boolean) as Product[];

                  return (
                    <div
                      key={section.id}
                      className={`rounded-2xl border transition-all ${
                        section.isVisible
                          ? 'bg-white border-[#E8E0D5] shadow-xs'
                          : 'bg-stone-50/80 border-stone-200 opacity-75'
                      } p-5 space-y-4`}
                    >
                      {/* Section Header Controls */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-[#FAF2EB] text-[#A25828] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-[#EEDFD0]">
                            #{index + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif font-bold text-base text-[#221C18]">
                                {section.title}
                              </h4>
                              <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                                ID: {section.id}
                              </span>
                            </div>
                            <span className="text-[11px] text-stone-500">
                              {section.subtitle || 'Homepage Section'}
                            </span>
                          </div>
                        </div>

                        {/* Order & Visibility Controls */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {/* Reorder Buttons */}
                          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
                            <button
                              type="button"
                              disabled={isFirst}
                              onClick={() => moveSection(index, 'up')}
                              title="Move section up"
                              className={`p-1.5 rounded-lg transition-colors ${
                                isFirst ? 'text-stone-300 cursor-not-allowed' : 'text-stone-700 hover:bg-white cursor-pointer'
                              }`}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={isLast}
                              onClick={() => moveSection(index, 'down')}
                              title="Move section down"
                              className={`p-1.5 rounded-lg transition-colors ${
                                isLast ? 'text-stone-300 cursor-not-allowed' : 'text-stone-700 hover:bg-white cursor-pointer'
                              }`}
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Visibility ON/OFF Toggle */}
                          <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-stone-200 hover:border-[#A25828] transition-colors">
                            <span className="text-[11px] font-semibold text-stone-700">
                              {section.isVisible ? 'Section ON' : 'Section OFF'}
                            </span>
                            <div className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={section.isVisible}
                                onChange={(e) => updateSection(section.id, { isVisible: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#A25828]"></div>
                            </div>
                          </label>
                        </div>
                      </div>

                      {section.id === 'hero' && (
                        <p className="text-[11px] text-stone-500">Headline, buttons, video and products for the hero are edited in the box at the top of this tab. The badge text above the headline is the “Subtitle” below.</p>
                      )}
                      {/* Content Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">Section Display Title</label>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                            className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">Subtitle / Badge Tagline</label>
                          <input
                            type="text"
                            value={section.subtitle || ''}
                            onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
                            className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-stone-700 mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={section.description || ''}
                          onChange={(e) => updateSection(section.id, { description: e.target.value })}
                          className="w-full p-2.5 rounded-xl border border-stone-300 bg-white text-xs leading-relaxed"
                        />
                      </div>

                      {/* Image & CTA (For promotional / banner sections) */}
                      {isImageSection && (
                        <div className="pt-2 border-t border-stone-200/80 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block font-semibold text-stone-700 mb-1">Section Image URL</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={section.image || ''}
                                  onChange={(e) => updateSection(section.id, { image: e.target.value })}
                                  className="flex-1 p-2.5 rounded-xl border border-stone-300 bg-white font-mono text-[11px]"
                                />
                                <label className="bg-[#A25828] hover:bg-[#8A461A] text-white px-3 py-2.5 rounded-xl font-semibold cursor-pointer shrink-0 inline-flex items-center gap-1">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Upload</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleUploadSectionImage(e, section.id)}
                                    className="hidden"
                                    disabled={isUploading}
                                  />
                                </label>
                              </div>
                            </div>

                            {section.id === 'deal_banner' && (
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block font-semibold text-stone-700 mb-1">CTA Button Text</label>
                                  <input
                                    type="text"
                                    value={section.ctaText || 'Shop Autumn Sale'}
                                    onChange={(e) => updateSection(section.id, { ctaText: e.target.value })}
                                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold text-stone-700 mb-1">CTA Destination URL</label>
                                  <input
                                    type="text"
                                    value={section.ctaLink || '/shop'}
                                    onChange={(e) => updateSection(section.id, { ctaLink: e.target.value })}
                                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono text-[11px]"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {section.image && (
                            <div className="w-full h-28 rounded-xl overflow-hidden border border-stone-200 bg-[#FAF8F5] relative">
                              <img src={section.image} alt="" className="w-full h-full object-contain" />
                              <span className="absolute bottom-1 right-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                                Image Preview
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Products Selection for Product Showcase Sections */}
                      {isProductSection && (
                        <div className="pt-3 border-t border-stone-200/80 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="font-semibold text-stone-800 text-xs flex items-center gap-1.5">
                                <ShoppingBag className="w-3.5 h-3.5 text-[#A25828]" />
                                <span>Selected Products ({sectionProducts.length})</span>
                              </span>
                              <span className="text-[11px] text-stone-500">
                                Add, remove, or replace products displayed in this section.
                              </span>
                            </div>

                            {/* Add Product Dropdown */}
                            <div className="flex items-center gap-2">
                              <select
                                onChange={(e) => {
                                  addProductToSection(section.id, e.target.value);
                                  e.target.value = '';
                                }}
                                className="p-2 rounded-xl border border-stone-300 bg-white text-xs max-w-xs cursor-pointer focus:border-[#A25828]"
                              >
                                <option value="">+ Add Product from Catalogue...</option>
                                {products
                                  .filter((p) => p.isPublished && !(section.productIds || []).includes(p.id))
                                  .map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} (£{(p.salePrice ?? p.price).toFixed(2)})
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>

                          {/* Selected Products Chips / Cards */}
                          {sectionProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
                              {sectionProducts.map((p) => (
                                <div
                                  key={p.id}
                                  className="flex items-center justify-between p-2 rounded-xl border border-stone-200 bg-[#FAF8F5] hover:bg-white transition-colors"
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <img
                                      src={p.images[0]}
                                      alt=""
                                      className="w-10 h-10 object-contain rounded-lg bg-white border border-stone-200 shrink-0 p-0.5"
                                    />
                                    <div className="overflow-hidden">
                                      <span className="font-bold text-stone-900 block truncate text-[11px]">
                                        {p.name}
                                      </span>
                                      <span className="text-[10px] text-[#A25828] font-semibold">
                                        £{(p.salePrice ?? p.price).toFixed(2)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0 ml-2">
                                    {/* Quick Replace Select */}
                                    <select
                                      title="Replace with another product"
                                      onChange={(e) => replaceProductInSection(section.id, p.id, e.target.value)}
                                      className="text-[10px] bg-white border border-stone-300 rounded p-1 cursor-pointer"
                                      defaultValue=""
                                    >
                                      <option value="" disabled>Swap...</option>
                                      {products
                                        .filter((swapP) => swapP.id !== p.id)
                                        .map((swapP) => (
                                          <option key={swapP.id} value={swapP.id}>
                                            {swapP.name}
                                          </option>
                                        ))}
                                    </select>

                                    {/* Remove Button */}
                                    <button
                                      type="button"
                                      onClick={() => removeProductFromSection(section.id, p.id)}
                                      title="Remove from this section"
                                      className="p-1 rounded-md text-stone-400 hover:text-red-600 hover:bg-stone-200 cursor-pointer transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-stone-400 italic text-[11px] py-1">
                              No specific products selected. The live section will display default catalogue items for this category automatically.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TOP BAR & HEADER */}
          {activeSubTab === 'header' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-3">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#A25828]" />
                <p className="text-[11px] leading-relaxed">
                  The dark bar above the menu shows: social icons (left), a scrolling announcement (centre), and phone, email and the <strong>Staff &amp; Owner</strong> button (right). Social links are edited in the Footer tab.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E0D5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 text-xs">Scrolling announcement</span>
                  <label className="flex items-center gap-2 font-semibold text-stone-700">
                    <input type="checkbox" checked={designForm.isPromoBannerActive} onChange={(e) => setDesignForm({ ...designForm, isPromoBannerActive: e.target.checked })} />
                    Show
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    value={designForm.promoBannerText}
                    onChange={(e) => setDesignForm({ ...designForm, promoBannerText: e.target.value })}
                    placeholder="e.g. Autumn Sale: up to 40% off + Free UK delivery"
                    className="sm:col-span-2 w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                  <input
                    value={designForm.announcementLink}
                    onChange={(e) => setDesignForm({ ...designForm, announcementLink: e.target.value })}
                    placeholder="/shop"
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-mono text-[11px]"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 bg-white font-semibold">
                  <input type="checkbox" checked={designForm.topBarShowSocials !== false} onChange={(e) => setDesignForm({ ...designForm, topBarShowSocials: e.target.checked })} />
                  Show social media icons in the top bar
                </label>
                <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 bg-white font-semibold">
                  <input type="checkbox" checked={designForm.topBarShowContact !== false} onChange={(e) => setDesignForm({ ...designForm, topBarShowContact: e.target.checked })} />
                  Show phone &amp; email in the top bar
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: MEGA MENU */}
          {activeSubTab === 'megamenu' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-3">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#A25828]" />
                <div className="space-y-1">
                  <span className="font-bold block">Mega Menu Spotlight Spotlight Card</span>
                  <p className="text-[11px] leading-relaxed">
                    Customise the featured product spotlight shown inside the desktop mega menu.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Spotlight Title</label>
                  <input
                    type="text"
                    value={mega.promoTitle}
                    onChange={(e) =>
                      setDesignForm({
                        ...designForm,
                        megaMenuDesign: { ...mega, promoTitle: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Spotlight Badge Tag</label>
                  <input
                    type="text"
                    value={mega.promoTag}
                    onChange={(e) =>
                      setDesignForm({
                        ...designForm,
                        megaMenuDesign: { ...mega, promoTag: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Destination URL</label>
                  <input
                    type="text"
                    value={mega.promoLink}
                    onChange={(e) =>
                      setDesignForm({
                        ...designForm,
                        megaMenuDesign: { ...mega, promoLink: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7] font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Description</label>
                  <input
                    type="text"
                    value={mega.promoDescription}
                    onChange={(e) =>
                      setDesignForm({
                        ...designForm,
                        megaMenuDesign: { ...mega, promoDescription: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Promo Spotlight Image URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={mega.promoImage}
                    onChange={(e) =>
                      setDesignForm({
                        ...designForm,
                        megaMenuDesign: { ...mega, promoImage: e.target.value },
                      })
                    }
                    className="flex-1 p-2.5 rounded-xl border border-stone-300 font-mono text-[11px]"
                  />
                  <label className="bg-[#A25828] hover:bg-[#8A461A] text-white px-3 py-2.5 rounded-xl font-semibold cursor-pointer shrink-0 inline-flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadImage(e, 'megaPromo')}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FOOTER MANAGEMENT */}
          {activeSubTab === 'footer' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-3">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#A25828]" />
                <div className="space-y-1">
                  <span className="font-bold block">Live Footer Management</span>
                  <p className="text-[11px] leading-relaxed">
                    Edit the footer text, contact details, social links, trust badges, copyright notice and every footer column and link.
                  </p>
                </div>
              </div>

              {/* Brand Story & Copyright */}
              <div className="space-y-4 bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E0D5]">
                <h4 className="font-serif font-bold text-sm text-[#221C18]">Brand Text &amp; Legal</h4>
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">
                    Footer Brand Story / About Paragraph
                  </label>
                  <textarea
                    rows={3}
                    value={footer.aboutText}
                    onChange={(e) =>
                      setDesignForm({
                        ...designForm,
                        footerDesign: { ...footer, aboutText: e.target.value },
                      })
                    }
                    className="w-full p-3 rounded-xl border border-[#D5C7B7] bg-white text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Copyright Notice Text</label>
                  <input
                    type="text"
                    value={footer.copyrightText}
                    onChange={(e) =>
                      setDesignForm({
                        ...designForm,
                        footerDesign: { ...footer, copyrightText: e.target.value },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7] bg-white"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E0D5]">
                <h4 className="font-serif font-bold text-sm text-[#221C18]">Customer Support Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">Telephone Support Helpline</label>
                    <input
                      type="text"
                      value={footer.phone}
                      onChange={(e) =>
                        setDesignForm({
                          ...designForm,
                          footerDesign: { ...footer, phone: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-[#D5C7B7] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">Official WhatsApp</label>
                    <input
                      type="text"
                      value={footer.whatsapp}
                      onChange={(e) =>
                        setDesignForm({
                          ...designForm,
                          footerDesign: { ...footer, whatsapp: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-[#D5C7B7] bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">Support Email</label>
                    <input
                      type="email"
                      value={footer.email}
                      onChange={(e) =>
                        setDesignForm({
                          ...designForm,
                          footerDesign: { ...footer, email: e.target.value },
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-[#D5C7B7] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-800 mb-1">Opening Hours</label>
                    <input
                      type="text"
                      value={footer.openingHours || ''}
                      onChange={(e) =>
                        setDesignForm({
                          ...designForm,
                          footerDesign: { ...footer, openingHours: e.target.value },
                        })
                      }
                      placeholder="Mon - Sat: 9:00 AM - 6:00 PM | Sun: Closed"
                      className="w-full p-2.5 rounded-xl border border-[#D5C7B7] bg-white"
                    />
                  </div>
                </div>

              </div>

              {/* Social Media Links (used in footer + top bar) */}
              <div className="space-y-4 bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E0D5]">
                <h4 className="font-serif font-bold text-sm text-[#221C18] flex items-center gap-1.5"><Share2 className="w-4 h-4 text-[#A25828]" /> Social media links</h4>
                <p className="text-[11px] text-stone-500">Shown as icons in the footer and the top bar. Leave a box empty to hide that icon.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(
                    [
                      ['socialFacebook', 'Facebook URL'],
                      ['socialInstagram', 'Instagram URL'],
                      ['socialTiktok', 'TikTok URL'],
                      ['socialYoutube', 'YouTube URL'],
                      ['socialPinterest', 'Pinterest URL'],
                      ['socialLinkedin', 'LinkedIn URL'],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key}>
                      <label className="block font-semibold text-stone-800 mb-1">{label}</label>
                      <input
                        type="url"
                        value={(footer as any)[key] || ''}
                        onChange={(e) => setDesignForm({ ...designForm, footerDesign: { ...footer, [key]: e.target.value } })}
                        className="w-full p-2.5 rounded-xl border border-[#D5C7B7] bg-white font-mono text-[11px]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust badges */}
              <div className="space-y-3 bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E0D5]">
                <h4 className="font-serif font-bold text-sm text-[#221C18] flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-[#A25828]" /> 4 trust badges (strip above the footer on every page)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {badges.slice(0, 4).map((b, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white border border-stone-200 space-y-2">
                      <div className="flex gap-2">
                        <select value={b.icon} onChange={(e) => setBadges(badges.map((x, j) => (j === i ? { ...x, icon: e.target.value as TrustBadge['icon'] } : x)))} className="p-2 rounded-lg border border-stone-300 bg-white">
                          <option value="truck">Truck</option>
                          <option value="exchange">Exchange</option>
                          <option value="cash">Cash</option>
                          <option value="support">Support</option>
                          <option value="shield">Shield</option>
                          <option value="star">Star</option>
                        </select>
                        <input value={b.title} onChange={(e) => setBadges(badges.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} className="flex-1 p-2 rounded-lg border border-stone-300 font-bold" />
                      </div>
                      <input value={b.subtitle} onChange={(e) => setBadges(badges.map((x, j) => (j === i ? { ...x, subtitle: e.target.value } : x)))} className="w-full p-2 rounded-lg border border-stone-300" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Footer Columns & Links Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#221C18]">
                      Footer Navigation Columns &amp; Links
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Manage column titles, links, and their internal or external destinations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFooterColumn}
                    className="bg-[#A25828] hover:bg-[#8A461A] text-white px-3.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Column</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {footerColumns.map((col, colIdx) => (
                    <div
                      key={col.id}
                      className="bg-white rounded-2xl p-4 border border-[#E8E0D5] shadow-xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-100">
                          <input
                            type="text"
                            value={col.title}
                            onChange={(e) => handleUpdateColumnTitle(col.id, e.target.value)}
                            className="font-serif font-bold text-stone-900 border-b border-dashed border-stone-300 focus:border-[#A25828] outline-none text-sm w-full py-0.5"
                            placeholder="Column Title"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFooterColumn(col.id)}
                            title="Delete Column"
                            className="text-stone-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Links List */}
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                          {col.links.map((link, linkIdx) => (
                            <div
                              key={linkIdx}
                              className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#FAF8F5] border border-stone-200"
                            >
                              <div className="flex-1 space-y-1">
                                <input
                                  type="text"
                                  value={link.title}
                                  onChange={(e) =>
                                    handleUpdateLink(col.id, linkIdx, e.target.value, link.url)
                                  }
                                  placeholder="Link Title"
                                  className="w-full text-xs font-semibold px-2 py-1 rounded border border-stone-200 bg-white"
                                />
                                <input
                                  type="text"
                                  value={link.url}
                                  onChange={(e) =>
                                    handleUpdateLink(col.id, linkIdx, link.title, e.target.value)
                                  }
                                  placeholder="/category/sofas"
                                  className="w-full text-[10px] font-mono px-2 py-0.5 rounded border border-stone-200 bg-white text-stone-600"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveLink(col.id, linkIdx)}
                                title="Remove Link"
                                className="text-stone-400 hover:text-red-600 p-1 rounded cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddLinkToColumn(col.id)}
                        className="w-full py-1.5 rounded-xl border border-dashed border-[#A25828]/50 text-[#A25828] hover:bg-[#FAF2EB] font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer mt-2"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Link to {col.title}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GLOBAL SETTINGS */}
          {activeSubTab === 'global' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-3">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#A25828]" />
                <div className="space-y-1">
                  <span className="font-bold block">Brand Asset Dimensions</span>
                  <p className="text-[11px] leading-relaxed">
                    <strong>Header/Footer Logo:</strong> 400 &times; 100px (4:1 transparent PNG).<br />
                    <strong>Browser Favicon:</strong> 64 &times; 64px or 32 &times; 32px ICO / PNG.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={designForm.brandName}
                    onChange={(e) => setDesignForm({ ...designForm, brandName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7] font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Official Logo URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={designForm.logoUrl || ''}
                      onChange={(e) => setDesignForm({ ...designForm, logoUrl: e.target.value })}
                      className="flex-1 p-2.5 rounded-xl border border-stone-300 font-mono text-[11px]"
                    />
                    <label className="bg-[#A25828] hover:bg-[#8A461A] text-white px-3 py-2.5 rounded-xl font-semibold cursor-pointer shrink-0 inline-flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadImage(e, 'logo')}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Logo Preview */}
              {designForm.logoUrl && (
                <div className="p-3 bg-stone-900 rounded-2xl inline-flex items-center justify-center">
                  <img src={designForm.logoUrl} alt="Logo Preview" className="h-10 object-contain" />
                </div>
              )}

            </div>
          )}

          {/* Submit */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            <button
              type="submit"
              className="bg-[#A25828] hover:bg-[#8A461A] text-white px-8 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Apply Store Design</span>
            </button>
            <span className="text-[11px] text-stone-400">
              Saves instantly to database and refreshes live storefront.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
