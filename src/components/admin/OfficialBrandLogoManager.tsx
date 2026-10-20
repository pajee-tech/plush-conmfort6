import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { BrandLogo } from '../BrandLogo';
import { Image, Upload, CheckCircle2, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';

export const OfficialBrandLogoManager: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [logoInput, setLogoInput] = useState<string>(settings?.logoUrl || '');
  const [altInput, setAltInput] = useState<string>(settings?.logoAlt || 'Plush Comfort UK - Luxury Handcrafted British Furniture');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, SVG, JPG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB. Please choose an optimized logo image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoInput(dataUrl);
      setUploadError(null);
    };
    reader.onerror = () => {
      setUploadError('Failed to read logo file. Please try again or paste a direct URL.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyLogo = () => {
    if (!logoInput.trim()) {
      setUploadError('Please choose a logo file or provide a logo image URL.');
      return;
    }

    updateSettings({
      logoUrl: logoInput.trim(),
      logoAlt: altInput.trim(),
    });

    setSaveSuccess(true);
    setUploadError(null);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleResetToDefault = () => {
    updateSettings({
      logoUrl: undefined,
      logoAlt: undefined,
    });
    setLogoInput('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8E0D5] p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E0D5]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#A25828]/10 text-[#A25828] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Official Brand Logo &amp; Identity System
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-xl">
            Upload your official Plush Comfort logo. The system locks native aspect ratios, prohibits stretching or recolouring, and guarantees crisp rendering across desktop headers, mobile navigation, and footers.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 animate-fade-in shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Brand Logo Live Site-Wide</span>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {uploadError}
        </div>
      )}

      {/* Upload Zone & Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
            1. Upload Official Logo File
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/svg+xml,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#D5C7B7] hover:border-[#A25828] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#FAF8F5] group"
          >
            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs mx-auto flex items-center justify-center text-[#A25828] mb-3 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-stone-800">
              Click to upload official logo file
            </p>
            <p className="text-[11px] text-stone-500 mt-1">
              Supports transparent PNG, vector SVG, WebP, or high-res JPG
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-stone-600">
              Or paste logo Image URL / Data URI
            </label>
            <input
              type="text"
              value={logoInput}
              onChange={(e) => setLogoInput(e.target.value)}
              placeholder="https://.../plush-comfort-logo.png"
              className="w-full text-xs p-3 rounded-xl border border-[#D5C7B7] focus:border-[#A25828] outline-none font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-stone-600">
              SEO Alt Text for Logo Image
            </label>
            <input
              type="text"
              value={altInput}
              onChange={(e) => setAltInput(e.target.value)}
              placeholder="Plush Comfort UK - Handcrafted Luxury Sofas & Beds"
              className="w-full text-xs p-3 rounded-xl border border-[#D5C7B7] focus:border-[#A25828] outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleApplyLogo}
              className="flex-1 bg-[#A25828] hover:bg-[#8A461A] text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Official Logo</span>
            </button>

            {settings?.logoUrl && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold py-2.5 px-3 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                title="Reset to handcrafted monogram crest"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Multi-Viewport Previews */}
        <div className="space-y-4">
          <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
            <Image className="w-3.5 h-3.5 text-[#A25828]" />
            2. Multi-Viewport Proportion Verification
          </label>

          {/* Desktop Header Navbar Preview */}
          <div className="p-4 rounded-2xl bg-white border border-[#E8E0D5] shadow-xs space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
              Desktop Header Navbar (Light BG)
            </span>
            <div className="p-3 bg-[#FAF8F5] rounded-xl flex items-center justify-between border border-stone-100">
              <BrandLogo variant="header" />
              <div className="hidden sm:flex items-center gap-3 text-[11px] text-stone-400">
                <span>Sofas</span>
                <span>Beds</span>
                <span>About</span>
              </div>
            </div>
          </div>

          {/* Mobile Header Preview */}
          <div className="p-4 rounded-2xl bg-white border border-[#E8E0D5] shadow-xs space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
              Mobile Header Compact (Screen Width &le; 640px)
            </span>
            <div className="p-3 bg-white rounded-xl flex items-center justify-between border border-stone-100">
              <BrandLogo variant="compact" />
              <span className="text-[10px] bg-stone-100 px-2 py-1 rounded text-stone-500">Menu</span>
            </div>
          </div>

          {/* Footer Preview */}
          <div className="p-4 rounded-2xl bg-[#221C18] text-white shadow-xs space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
              Website Footer (Dark Contrast BG)
            </span>
            <div className="p-3 bg-[#1C1613] rounded-xl border border-stone-800">
              <BrandLogo variant="footer" />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
            <strong>Brand Integrity Guarantee:</strong> Uses strict CSS aspect-ratio containment (<code className="font-mono text-[10px]">object-contain</code>) to ensure your artwork is never stretched, distorted, recoloured, or improperly cropped.
          </div>
        </div>
      </div>
    </div>
  );
};
