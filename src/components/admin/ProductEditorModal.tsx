import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductVariation, ProductImageItem, SofaConfiguration } from '../../types';
import { RichTextEditor } from './RichTextEditor';
import { SeoImageField } from './SeoImageField';
import { readFileAsDataUrl } from '../../services/adminAuthService';
import { adminAuthService } from '../../services/adminAuthService';
import {
  X,
  Plus,
  Trash2,
  Upload,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  Info,
  Check,
  Search,
  Eye,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';

/** Everything that can be picked from "Add variation" */
const VARIATION_PICKLIST: Array<{ group: string; options: Array<{ name: string; config: string }> }> = [
  {
    group: 'Sofa sizes & suites',
    options: [
      { name: '1 Seater (Armchair)', config: '1 Seater' },
      { name: '2 Seater Sofa', config: '2 Seater' },
      { name: '3 Seater Sofa', config: '3 Seater' },
      { name: '4 Seater Sofa', config: '4 Seater' },
      { name: '3+2 Sofa Suite', config: '3+2 Suite' },
      { name: '3+3 Sofa Suite', config: '3+3 Suite' },
      { name: '2+2 Sofa Suite', config: '2+2 Suite' },
      { name: '3+2+1 Complete Suite', config: '3+2+1 Suite' },
      { name: 'Corner Sofa – Left Hand', config: 'Corner L-Shape (Left)' },
      { name: 'Corner Sofa – Right Hand', config: 'Corner L-Shape (Right)' },
      { name: 'U-Shape Sofa', config: 'U-Shape Sectional' },
      { name: 'Sofa + Footstool', config: 'Sofa + Footstool' },
      { name: 'Footstool only', config: 'Footstool' },
    ],
  },
  {
    group: 'Bed sizes',
    options: [
      { name: 'Single (3ft)', config: 'Single (3ft)' },
      { name: 'Small Double (4ft)', config: 'Small Double (4ft)' },
      { name: 'Double (4ft 6in)', config: 'Double (4ft 6in)' },
      { name: 'King (5ft)', config: 'King (5ft)' },
      { name: 'Super King (6ft)', config: 'Super King (6ft)' },
      { name: 'Bed Frame only', config: 'Frame Only' },
      { name: 'Bed + Mattress', config: 'Frame + Mattress' },
    ],
  },
  {
    group: 'Other',
    options: [
      { name: 'Standard', config: 'Standard' },
      { name: 'Custom (type your own name)', config: 'Custom' },
    ],
  },
];

const COLOUR_PRESETS: Array<{ name: string; hex: string }> = [
  { name: 'Grey', hex: '#8E9094' },
  { name: 'Silver', hex: '#C5C6C8' },
  { name: 'Charcoal', hex: '#36373A' },
  { name: 'Cream', hex: '#EDE5D8' },
  { name: 'Beige', hex: '#D5C7B5' },
  { name: 'Mink', hex: '#8E877F' },
  { name: 'Black', hex: '#1E1E1F' },
  { name: 'Navy Blue', hex: '#1D2A44' },
  { name: 'Emerald Green', hex: '#1F5C4A' },
  { name: 'Mustard', hex: '#C99A2E' },
  { name: 'Blush Pink', hex: '#D9A7A9' },
  { name: 'Oxblood', hex: '#5A1F22' },
];

interface ProductEditorModalProps {
  product: Product | null;
  isNew: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

const PRESET_SOFA_CONFIGS: Array<{ name: string; config: SofaConfiguration; priceMultiplier: number }> = [
  { name: '1 Seater (Armchair)', config: '1 Seater', priceMultiplier: 0.45 },
  { name: '2 Seater Sofa', config: '2 Seater', priceMultiplier: 0.65 },
  { name: '3 Seater Sofa', config: '3 Seater', priceMultiplier: 0.8 },
  { name: '3+2 Sofa Suite', config: '3+2 Suite', priceMultiplier: 1.0 },
  { name: '3+3 Sofa Suite', config: '3+3 Suite', priceMultiplier: 1.15 },
  { name: '2+2 Sofa Suite', config: '2+2 Suite', priceMultiplier: 0.95 },
  { name: '3+2+1 Complete Suite', config: '3+2+1 Suite', priceMultiplier: 1.35 },
  { name: 'Corner L-Shape (Left)', config: 'Corner L-Shape (Left)', priceMultiplier: 1.05 },
  { name: 'Corner L-Shape (Right)', config: 'Corner L-Shape (Right)', priceMultiplier: 1.05 },
];

const PRESET_BED_CONFIGS: Array<{ name: string; config: SofaConfiguration; priceMultiplier: number }> = [
  { name: 'Single Bed Frame (3ft)', config: 'Single (3ft)', priceMultiplier: 0.7 },
  { name: 'Small Double (4ft)', config: 'Small Double (4ft)', priceMultiplier: 0.85 },
  { name: 'Double Bed Frame (4ft 6in)', config: 'Double (4ft 6in)', priceMultiplier: 1.0 },
  { name: 'King Bed Frame (5ft)', config: 'King (5ft)', priceMultiplier: 1.15 },
  { name: 'Super King Bed Frame (6ft)', config: 'Super King (6ft)', priceMultiplier: 1.3 },
];

export const ProductEditorModal: React.FC<ProductEditorModalProps> = ({
  product,
  isNew,
  onClose,
  onSave,
}) => {
  const { categories, products } = useStore();

  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'variations' | 'description' | 'seo'>('basic');

  // Form state initialized from existing product or clean template
  const [formData, setFormData] = useState<Product>(() => {
    if (product) {
      return {
        ...product,
        variations: product.variations || [],
        imageGallery: product.imageGallery || product.images.map((img, i) => ({
          id: `img-${i}`,
          url: img,
          alt: `${product.name} handcrafted photo ${i + 1}`,
          order: i,
          isFeatured: i === 0,
        })),
      };
    }

    const defaultCat = categories[0]?.id || 'cat-sofas';
    const randomSku = `PC-UK-${Math.floor(100 + Math.random() * 900)}`;

    return {
      id: `prod-${Date.now()}`,
      name: '',
      slug: '',
      sku: randomSku,
      categoryId: defaultCat,
      price: 999,
      salePrice: 849,
      regularPrice: 1199,
      stock: 12,
      lowStockThreshold: 3,
      images: ['/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-1.webp'],
      imageGallery: [
        {
          id: 'img-0',
          url: '/uploads/products/verona-plush-velvet-corner-sofa-grey-fabric-chesterfield-style-l-shape-settee-with-scatter-cushions-1.webp',
          alt: 'Primary product photo',
          order: 0,
          isFeatured: true,
        },
      ],
      variations: [],
      shortDescription: 'Handcrafted luxury British sofa in premium plush velvet.',
      fullDescription: 'Indulge in bespoke British luxury. Constructed with kiln-dried European hardwood and pocket-sprung reflex foam for supreme longevity.',
      dimensions: { width: 250, height: 90, depth: 180, seatHeight: 48 },
      materials: ['Plush Velvet', 'Kiln-Dried Hardwood', 'Pocket Springs'],
      colours: [
        { name: 'Steel Grey', hex: '#6B6E70' },
        { name: 'Navy Blue', hex: '#1D2A44' },
      ],
      sizes: ['Standard Suite'],
      tags: ['Handcrafted', 'UK Made', 'Bespoke'],
      isPublished: true,
      isFeatured: false,
      isTrending: true,
      deliveryInfo: 'Delivered in 3–5 working days with 2-man room of choice delivery.',
      careInstructions: 'Spot clean with mild velvet upholstery foam cleaner.',
      seoTitle: '',
      seoDescription: '',
      canonicalUrl: '',
      robotsIndexing: 'index, follow',
      rating: 0,
      reviewCount: 0,
      relatedProductIds: [],
      complementaryProductIds: [],
      reviews: [],
    };
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Auto-generate slug from name if empty
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug && !isNew ? prev.slug : slug,
      seoTitle: prev.seoTitle || `${name} | Handcrafted Furniture UK | Plush Comfort`,
      seoDescription:
        prev.seoDescription ||
        `Shop the ${name} at Plush Comfort UK. Free UK delivery, 1 year warranty and cash on delivery.`,
    }));
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res = await adminAuthService.uploadImage(
          base64Data,
          file.name,
          `${formData.name} uploaded photo`
        );

        if (res.success && res.url) {
          const newUrl = res.url;
          if (!isGallery) {
            // Replace primary image
            const updatedImages = [newUrl, ...formData.images.slice(1)];
            setFormData((prev) => ({
              ...prev,
              images: updatedImages,
              imageGallery: [
                { id: `img-${Date.now()}`, url: newUrl, alt: `${formData.name} featured image`, order: 0, isFeatured: true },
                ...(prev.imageGallery || []).slice(1),
              ],
            }));
          } else {
            // Add to gallery
            const updatedImages = [...formData.images, newUrl];
            const updatedGallery = [
              ...(formData.imageGallery || []),
              {
                id: `img-${Date.now()}`,
                url: newUrl,
                alt: `${formData.name} gallery image`,
                order: (formData.imageGallery?.length || 0),
                isFeatured: false,
              },
            ];
            setFormData((prev) => ({
              ...prev,
              images: updatedImages,
              imageGallery: updatedGallery,
            }));
          }
        } else {
          setUploadError(res.error || 'Image upload failed.');
        }
      } catch (err: any) {
        setUploadError(err.message || 'Image processing error.');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Add Variation Handler (from the pick-list)
  const handleAddVariation = (pick?: { name: string; config: string }) => {
    let name = pick?.name || 'New Option';
    if (pick?.config === 'Custom') {
      const typed = window.prompt('Name for this variation (e.g. "3 Seater + Matching Armchair")');
      if (!typed) return;
      name = typed.trim();
    }
    const newVar: ProductVariation = {
      id: `var-${Date.now()}`,
      name,
      configuration: pick?.config === 'Custom' ? name : pick?.config || 'Standard',
      sku: `${formData.sku}-${(formData.variations?.length || 0) + 1}`,
      price: formData.price,
      salePrice: formData.salePrice,
      stock: 5,
      colour: formData.colours[0]?.name || 'Standard',
      image: formData.images[0] || '',
      isDefault: (formData.variations?.length || 0) === 0,
    };

    setFormData((prev) => ({
      ...prev,
      variations: [...(prev.variations || []), newVar],
    }));
  };

  // Quick Preset Generator
  const handleGeneratePresets = (type: 'sofa' | 'bed') => {
    const presets = type === 'sofa' ? PRESET_SOFA_CONFIGS : PRESET_BED_CONFIGS;
    const basePrice = formData.price || 999;
    const baseSale = formData.salePrice || 849;

    const generated: ProductVariation[] = presets.map((p, idx) => ({
      id: `var-${Date.now()}-${idx}`,
      name: p.name,
      configuration: p.config,
      sku: `${formData.sku}-${p.config.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}`,
      price: Math.round(basePrice * p.priceMultiplier),
      salePrice: Math.round(baseSale * p.priceMultiplier),
      stock: 8,
      colour: formData.colours[0]?.name || 'Steel Grey',
      image: formData.images[0] || '',
      isDefault: idx === (type === 'sofa' ? 3 : 2), // Default to 3+2 or Double
    }));

    setFormData((prev) => ({
      ...prev,
      variations: generated,
    }));
  };

  // ---- Colours (standard variation) ----
  const updateColour = (index: number, patch: Partial<Product['colours'][number]>) => {
    setFormData((prev) => ({
      ...prev,
      colours: prev.colours.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    }));
  };
  const addColour = (preset?: { name: string; hex: string }) => {
    setFormData((prev) => ({
      ...prev,
      colours: [...prev.colours, { name: preset?.name || 'New Colour', hex: preset?.hex || '#999999', images: [] }],
    }));
  };
  const removeColour = (index: number) => {
    setFormData((prev) => ({ ...prev, colours: prev.colours.filter((_, i) => i !== index) }));
  };
  const toggleColourImage = (index: number, url: string) => {
    const current = formData.colours[index]?.images || [];
    updateColour(index, { images: current.includes(url) ? current.filter((u) => u !== url) : [...current, url] });
  };
  const uploadColourImage = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setIsUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const res = await adminAuthService.uploadImage(await readFileAsDataUrl(file), `${formData.slug || 'product'}-${formData.colours[index]?.name || 'colour'}`, `${formData.name} in ${formData.colours[index]?.name}`);
        if (res.success && res.url) urls.push(res.url);
      }
      if (urls.length) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...urls.filter((u) => !prev.images.includes(u))],
          colours: prev.colours.map((c, i) => (i === index ? { ...c, images: [...(c.images || []), ...urls] } : c)),
        }));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a product name');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 z-10 shadow-2xl max-h-[92vh] flex flex-col my-auto border border-[#E8E0D5]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A25828]">
                {isNew ? 'Create Catalogue Entry' : 'Catalogue Editor'}
              </span>
              <span className="text-xs text-stone-400 font-mono">SKU: {formData.sku}</span>
            </div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#221C18]">
              {isNew ? 'Add Handcrafted Furniture' : formData.name || 'Edit Piece'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {formData.slug && (
              <a
                href={`/product/${formData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-[#FAF2EB] hover:bg-[#A25828] text-[#A25828] hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 font-semibold text-xs border border-[#EEDFD0]"
                title="Preview this piece on storefront in a new tab"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Product</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 py-3 border-b border-stone-200 overflow-x-auto shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'basic'
                ? 'bg-[#A25828] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            1. Core Info & Pricing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'images'
                ? 'bg-[#A25828] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            2. Images & Gallery ({formData.images.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('variations')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'variations'
                ? 'bg-[#A25828] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            3. Variations ({formData.variations?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'description'
                ? 'bg-[#A25828] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            4. Content & Specs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'seo'
                ? 'bg-[#A25828] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            5. SEO & Structured Data
          </button>
        </div>

        {/* Tab Contents */}
        <form onSubmit={handleSaveSubmit} className="flex-1 overflow-y-auto py-4 space-y-6 text-xs pr-1">
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Verona Plush Velvet Corner Sofa"
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7] text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">
                    URL Slug *
                  </label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-2.5 bg-stone-100 border border-r-0 border-[#D5C7B7] rounded-l-xl text-stone-400 font-mono text-[11px]">
                      /product/
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full p-2.5 rounded-r-xl border border-[#D5C7B7] text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Regular Price (£)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Sale Price (£, optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salePrice || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salePrice: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    placeholder="Discounted"
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7] text-[#A25828] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7] font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Primary Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7] bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Low Stock Warning Threshold</label>
                  <input
                    type="number"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value, 10) || 3 })}
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7]"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E0D5] flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded text-[#A25828] focus:ring-[#A25828] w-4 h-4"
                  />
                  <span>Published on Storefront</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-[#A25828] focus:ring-[#A25828] w-4 h-4"
                  />
                  <span>Featured on Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={formData.isTrending}
                    onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                    className="rounded text-[#A25828] focus:ring-[#A25828] w-4 h-4"
                  />
                  <span>Trending Badge</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: IMAGES & GALLERY */}
          {activeTab === 'images' && (
            <div className="space-y-6 animate-fade-in">
              {/* Guidance Box with Recommended Dimensions */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-3">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#A25828]" />
                <div className="space-y-1">
                  <span className="font-bold block">Recommended Image Standards</span>
                  <p className="text-[11px] leading-relaxed">
                    <strong>Primary / Gallery Photos:</strong> 1200 &times; 900px (4:3 ratio). Any JPG/PNG/WebP is accepted — it is automatically converted to WebP and compressed to under 200&nbsp;KB on upload.<br />
                    <strong>Square Thumbnails:</strong> 800 &times; 800px (1:1 ratio). Ensure all images have descriptive Alt text for Google Image Search SEO and UK accessibility standards.
                  </p>
                </div>
              </div>

              {/* Upload New Image Banner */}
              <div className="p-4 rounded-2xl border border-dashed border-[#D5C7B7] bg-[#FAF8F5] text-center space-y-2">
                <div className="flex items-center justify-center gap-3">
                  <label className="bg-[#A25828] hover:bg-[#8A461A] text-white px-5 py-2.5 rounded-full text-xs font-semibold cursor-pointer inline-flex items-center gap-2 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, true)}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
                {isUploading && <p className="text-stone-500 animate-pulse">Uploading and optimizing image...</p>}
                {uploadError && <p className="text-red-600 font-semibold">{uploadError}</p>}
              </div>

              {/* Images List */}
              <div className="space-y-3">
                <span className="font-bold text-stone-800 block text-xs">
                  Active Image List &amp; Alt Tags ({formData.images.length})
                </span>

                {formData.images.map((imgUrl, index) => {
                  const galleryItem = formData.imageGallery?.find((g) => g.url === imgUrl);
                  const isFeatured = index === 0;

                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-center gap-3 ${
                        isFeatured ? 'border-[#A25828] bg-[#FAF2EB]/40' : 'border-[#E8E0D5] bg-white'
                      }`}
                    >
                      {/* Image Preview */}
                      <div className="w-20 h-20 rounded-xl bg-white border border-stone-200 p-1 shrink-0 overflow-hidden flex items-center justify-center">
                        <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                      </div>

                      {/* Fields */}
                      <div className="flex-1 w-full space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 text-xs">
                            {isFeatured ? 'Primary Featured Image (Hero)' : `Gallery Photo #${index + 1}`}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono truncate max-w-xs">{imgUrl}</span>
                        </div>

                        <div>
                          <input
                            type="text"
                            placeholder="Descriptive Alt Text for SEO (e.g. Verona Plush Velvet Corner Sofa in Silver)"
                            value={galleryItem?.alt || `${formData.name} photo ${index + 1}`}
                            onChange={(e) => {
                              const newAlt = e.target.value;
                              const updatedGallery = (formData.imageGallery || []).map((g, i) =>
                                i === index ? { ...g, alt: newAlt } : g
                              );
                              setFormData({ ...formData, imageGallery: updatedGallery });
                            }}
                            className="w-full p-2 text-xs rounded-lg border border-stone-300"
                          />
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...formData.images];
                              const temp = copy[index - 1];
                              copy[index - 1] = copy[index];
                              copy[index] = temp;
                              setFormData({ ...formData, images: copy });
                            }}
                            title="Move Up"
                            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 cursor-pointer"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                        )}

                        {index < formData.images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...formData.images];
                              const temp = copy[index + 1];
                              copy[index + 1] = copy[index];
                              copy[index] = temp;
                              setFormData({ ...formData, images: copy });
                            }}
                            title="Move Down"
                            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 cursor-pointer"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        )}

                        {formData.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const filtered = formData.images.filter((_, i) => i !== index);
                              setFormData({ ...formData, images: filtered });
                            }}
                            title="Delete Image"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add custom image URL */}
              <div className="pt-2">
                <label className="block font-semibold text-stone-700 mb-1">Add Image by URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    id="new_img_url"
                    placeholder="https://... or /uploads/products/..."
                    className="flex-1 p-2 rounded-xl border border-stone-300 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('new_img_url') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        setFormData({
                          ...formData,
                          images: [...formData.images, input.value.trim()],
                        });
                        input.value = '';
                      }
                    }}
                    className="bg-stone-800 text-white px-4 py-2 rounded-xl font-semibold hover:bg-stone-900 cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VARIATIONS */}
          {activeTab === 'variations' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E0D5]">
                <div>
                  <h4 className="font-bold text-stone-900 text-xs">Product Variations &amp; Suites</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Configure modular suites (1 Seater, 2 Seater, 3 Seater, 3+2, 3+3, 2+2, 3+2+1, Bed sizes) with dedicated price, SKU, stock, and photos.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGeneratePresets('sofa')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#D5C7B7] hover:border-[#A25828] text-[#A25828] font-bold transition-colors cursor-pointer text-xs"
                  >
                    + Auto-Gen Sofa Suites
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGeneratePresets('bed')}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#D5C7B7] hover:border-[#A25828] text-[#A25828] font-bold transition-colors cursor-pointer text-xs"
                  >
                    + Auto-Gen Bed Sizes
                  </button>
                  <select
                    value=""
                    onChange={(e) => {
                      const [g, o] = e.target.value.split('::').map(Number);
                      if (!Number.isNaN(g)) handleAddVariation(VARIATION_PICKLIST[g].options[o]);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#A25828] text-white font-bold hover:bg-[#8A461A] cursor-pointer text-xs"
                    title="Pick the exact variation you want to add"
                  >
                    <option value="">+ Add Custom Variation…</option>
                    {VARIATION_PICKLIST.map((grp, gi) => (
                      <optgroup key={grp.group} label={grp.group}>
                        {grp.options.map((opt, oi) => (
                          <option key={opt.config + oi} value={`${gi}::${oi}`}>
                            {opt.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* ===== COLOURS (standard variation) ===== */}
              <div className="p-4 rounded-2xl border border-[#E8E0D5] bg-white space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[#A25828]" /> Colours ({formData.colours.length})
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Customers pick a colour on the product page and the gallery switches to that colour's photos. Tick existing photos or upload new ones per colour.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value=""
                      onChange={(e) => {
                        const preset = COLOUR_PRESETS[Number(e.target.value)];
                        if (preset) addColour(preset);
                      }}
                      className="p-1.5 rounded-xl border border-stone-300 bg-white text-xs"
                    >
                      <option value="">+ Add colour…</option>
                      {COLOUR_PRESETS.map((c, i) => (
                        <option key={c.name} value={i}>{c.name}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => addColour()} className="px-3 py-1.5 rounded-xl border border-[#D5C7B7] text-[#A25828] font-bold text-xs">
                      + Custom colour
                    </button>
                  </div>
                </div>

                {formData.colours.map((col, ci) => (
                  <div key={ci} className="p-3 rounded-xl bg-[#FAF8F5] border border-stone-200 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="color"
                        value={col.hex}
                        onChange={(e) => updateColour(ci, { hex: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-stone-300 cursor-pointer p-0.5 bg-white"
                        title="Swatch colour"
                      />
                      <input
                        type="text"
                        value={col.name}
                        onChange={(e) => updateColour(ci, { name: e.target.value })}
                        className="flex-1 min-w-[140px] p-2 rounded-lg border border-stone-300 font-semibold"
                        placeholder="Colour name (e.g. Silver Grey)"
                      />
                      <label className="px-3 py-2 rounded-lg bg-[#A25828] text-white font-semibold cursor-pointer inline-flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" /> Upload photos
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadColourImage(ci, e)} disabled={isUploading} />
                      </label>
                      <button type="button" onClick={() => removeColour(ci)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Remove colour">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.images.map((img) => {
                        const on = (col.images || []).includes(img);
                        return (
                          <button
                            type="button"
                            key={img}
                            onClick={() => toggleColourImage(ci, img)}
                            className={`w-14 h-14 rounded-lg overflow-hidden border-2 relative ${on ? 'border-[#A25828]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            title={on ? 'Shown for this colour (click to remove)' : 'Click to show for this colour'}
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            {on && (
                              <span className="absolute top-0.5 right-0.5 bg-[#A25828] text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center">
                                {(col.images || []).indexOf(img) + 1}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-stone-500 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {(col.images || []).length > 0
                        ? `${(col.images || []).length} photo(s) — photo 1 becomes the main image for ${col.name}.`
                        : 'No photos picked — the normal product gallery is shown for this colour.'}
                    </p>
                  </div>
                ))}
              </div>

              {/* Variations list */}
              <datalist id="pc-variation-configs">
                {VARIATION_PICKLIST.flatMap((g) => g.options).map((o) => (
                  <option key={o.config} value={o.config} />
                ))}
              </datalist>
              <div className="space-y-3">
                {(!formData.variations || formData.variations.length === 0) && (
                  <div className="p-8 text-center text-stone-400 border border-dashed rounded-2xl">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-xs text-stone-600">No variations configured yet.</p>
                    <p className="text-[11px] mt-1">
                      Click "Auto-Gen Sofa Suites" or "Add Custom Variation" above to enable variation selections on the live product page.
                    </p>
                  </div>
                )}

                {formData.variations?.map((v, index) => (
                  <div
                    key={v.id}
                    className="p-4 rounded-2xl border border-[#E8E0D5] bg-white space-y-3 hover:border-[#D5C7B7] transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => {
                            const updated = [...(formData.variations || [])];
                            updated[index].name = e.target.value;
                            setFormData({ ...formData, variations: updated });
                          }}
                          placeholder="e.g. 3+2 Sofa Suite"
                          className="font-bold text-stone-900 border-b border-dashed border-stone-300 focus:border-[#A25828] outline-hidden px-1 py-0.5"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-600 cursor-pointer">
                          <input
                            type="radio"
                            name="default_var"
                            checked={!!v.isDefault}
                            onChange={() => {
                              const updated = (formData.variations || []).map((item, i) => ({
                                ...item,
                                isDefault: i === index,
                              }));
                              setFormData({ ...formData, variations: updated });
                            }}
                          />
                          <span>Default Option</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (formData.variations || []).filter((_, i) => i !== index);
                            setFormData({ ...formData, variations: updated });
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 uppercase">Configuration</label>
                        <input
                          list="pc-variation-configs"
                          value={v.configuration}
                          onChange={(e) => {
                            const updated = [...(formData.variations || [])];
                            updated[index].configuration = e.target.value;
                            setFormData({ ...formData, variations: updated });
                          }}
                          className="w-full p-2 rounded-lg border border-stone-300 bg-white text-xs font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 uppercase">Price (£)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={v.price}
                          onChange={(e) => {
                            const updated = [...(formData.variations || [])];
                            updated[index].price = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, variations: updated });
                          }}
                          className="w-full p-2 rounded-lg border border-stone-300 font-bold text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 uppercase">Sale Price (£)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={v.salePrice || ''}
                          onChange={(e) => {
                            const updated = [...(formData.variations || [])];
                            updated[index].salePrice = e.target.value ? parseFloat(e.target.value) : undefined;
                            setFormData({ ...formData, variations: updated });
                          }}
                          className="w-full p-2 rounded-lg border border-stone-300 text-[#A25828] font-bold text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 uppercase">SKU</label>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => {
                            const updated = [...(formData.variations || [])];
                            updated[index].sku = e.target.value;
                            setFormData({ ...formData, variations: updated });
                          }}
                          className="w-full p-2 rounded-lg border border-stone-300 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 uppercase">Stock</label>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => {
                            const updated = [...(formData.variations || [])];
                            updated[index].stock = parseInt(e.target.value, 10) || 0;
                            setFormData({ ...formData, variations: updated });
                          }}
                          className="w-full p-2 rounded-lg border border-stone-300 font-bold text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 uppercase">Photo shown for this option (optional)</label>
                        <select
                          value={v.image || ''}
                          onChange={(e) => {
                            const updated = [...(formData.variations || [])];
                            updated[index] = { ...updated[index], image: e.target.value || undefined };
                            setFormData({ ...formData, variations: updated });
                          }}
                          className="w-full p-2 rounded-lg border border-stone-300 bg-white text-xs"
                        >
                          <option value="">Keep current photo</option>
                          {formData.images.map((img, ii) => (
                            <option key={img} value={img}>Photo {ii + 1}{ii === 0 ? ' (main)' : ''}</option>
                          ))}
                        </select>
                      </div>
                      {v.image && <img src={v.image} alt="" className="h-14 w-20 object-cover rounded-lg border border-stone-200 self-end" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DESCRIPTION & SPECS */}
          {activeTab === 'description' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Short Tagline / Excerpt
                </label>
                <textarea
                  rows={2}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#D5C7B7] text-xs leading-relaxed"
                />
              </div>

              {/* Rich Text Editor for Full Description with Internal Links */}
              <div>
                <RichTextEditor
                  label="Full Editorial Description (Supports Headings, Bullets & Internal Links)"
                  value={formData.fullDescription}
                  onChange={(val) => setFormData({ ...formData, fullDescription: val })}
                  rows={8}
                />
              </div>

              {/* Specifications */}
              <div className="pt-2 border-t border-stone-200">
                <span className="font-bold text-stone-800 block text-xs mb-2">Dimensions (cm)</span>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-stone-500 font-semibold">Width (cm)</label>
                    <input
                      type="number"
                      value={formData.dimensions.width}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dimensions: { ...formData.dimensions, width: Number(e.target.value) },
                        })
                      }
                      className="w-full p-2 rounded-lg border border-stone-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500 font-semibold">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.dimensions.height}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dimensions: { ...formData.dimensions, height: Number(e.target.value) },
                        })
                      }
                      className="w-full p-2 rounded-lg border border-stone-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500 font-semibold">Depth (cm)</label>
                    <input
                      type="number"
                      value={formData.dimensions.depth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dimensions: { ...formData.dimensions, depth: Number(e.target.value) },
                        })
                      }
                      className="w-full p-2 rounded-lg border border-stone-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500 font-semibold">Seat Height (cm)</label>
                    <input
                      type="number"
                      value={formData.dimensions.seatHeight || 48}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dimensions: { ...formData.dimensions, seatHeight: Number(e.target.value) },
                        })
                      }
                      className="w-full p-2 rounded-lg border border-stone-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery and Care */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">UK Delivery Notice</label>
                  <input
                    type="text"
                    value={formData.deliveryInfo}
                    onChange={(e) => setFormData({ ...formData, deliveryInfo: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Care &amp; Cleaning Instructions</label>
                  <input
                    type="text"
                    value={formData.careInstructions}
                    onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SEO & SCHEMA */}
          {activeTab === 'seo' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Meta Title (Max 60 characters)
                </label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder="e.g. Verona Plush Velvet Corner Sofa | Plush Comfort UK"
                  className="w-full p-2.5 rounded-xl border border-[#D5C7B7]"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  {formData.seoTitle.length}/60 characters
                </span>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Meta Description (Max 160 characters)
                </label>
                <textarea
                  rows={3}
                  value={formData.seoDescription}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  placeholder="e.g. Luxury grey velvet corner sofa with deep foam seats. Free UK delivery, 1 year warranty, cash on delivery."
                  className="w-full p-3 rounded-xl border border-[#D5C7B7]"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  {formData.seoDescription.length}/160 characters
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Canonical URL</label>
                  <input
                    type="text"
                    value={formData.canonicalUrl || `https://plushcomfort.uk/product/${formData.slug}`}
                    onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Robots Directive</label>
                  <select
                    value={formData.robotsIndexing || 'index, follow'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        robotsIndexing: e.target.value as any,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="index, follow">index, follow (Standard)</option>
                    <option value="noindex, follow">noindex, follow</option>
                    <option value="noindex, nofollow">noindex, nofollow (Hidden)</option>
                  </select>
                </div>
              </div>

              <SeoImageField
                value={formData.ogImage}
                onChange={(url) => setFormData({ ...formData, ogImage: url })}
                fallback={formData.images[0]}
              />

              {/* Google SERP Preview */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Google SERP Search Result Preview
                </span>
                <div className="font-sans">
                  <span className="text-xs text-stone-600 block truncate">
                    https://plushcomfort.uk &rsaquo; product &rsaquo; {formData.slug}
                  </span>
                  <h4 className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer">
                    {formData.seoTitle || formData.name}
                  </h4>
                  <p className="text-xs text-[#4d5156] line-clamp-2">
                    {formData.seoDescription || formData.shortDescription}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-600 font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-[#A25828] hover:bg-[#8A461A] text-white px-8 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Update Catalogue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
