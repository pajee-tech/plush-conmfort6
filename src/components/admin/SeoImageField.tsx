import React, { useState } from 'react';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { adminAuthService, readFileAsDataUrl } from '../../services/adminAuthService';

interface ImageFieldProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  help?: string;
  /** Image shown (and used) when this field is empty */
  fallback?: string;
  fallbackLabel?: string;
  previewClass?: string;
}

/**
 * Image picker with upload + URL box. Uploads are automatically converted to WebP (≤ 200 KB).
 * Used for: social share (Open Graph / Twitter) images, cover images, banners.
 */
export const ImageField: React.FC<ImageFieldProps> = ({
  label,
  value,
  onChange,
  help,
  fallback,
  fallbackLabel = 'featured image',
  previewClass = 'w-40 aspect-[1200/630]',
}) => {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await adminAuthService.uploadImage(dataUrl, file.name, label);
      if (res.success && res.url) onChange(res.url);
      else setErr(res.error || 'Upload failed');
    } catch (ex: any) {
      setErr(ex.message || 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const shown = value || fallback;
  return (
    <div className="space-y-2">
      <label className="block font-semibold text-stone-800 text-xs">{label}</label>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`${previewClass} rounded-xl overflow-hidden border border-stone-200 bg-[#FAF8F5] flex items-center justify-center shrink-0 relative`}>
          {shown ? <img src={shown} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-stone-300" />}
          {!value && fallback && (
            <span className="absolute bottom-1 left-1 right-1 text-center bg-black/60 text-white text-[9px] rounded px-1 py-0.5">
              Using {fallbackLabel}
            </span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={fallback ? `Empty = ${fallbackLabel}` : '/uploads/... or https://...'}
              className="flex-1 p-2.5 rounded-xl border border-stone-300 font-mono text-[11px]"
            />
            {value && (
              <button type="button" onClick={() => onChange('')} className="px-2 rounded-xl border border-stone-300 text-stone-500" title="Remove">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <label className="inline-flex items-center gap-1.5 bg-[#A25828] hover:bg-[#8A461A] text-white px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer">
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span>{busy ? 'Optimising…' : 'Upload image'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={upload} disabled={busy} />
          </label>
          {help && <p className="text-[10px] text-stone-500 leading-relaxed">{help}</p>}
          {err && <p className="text-[11px] text-red-600 font-semibold">{err}</p>}
        </div>
      </div>
    </div>
  );
};

/** Social share image (Open Graph + Twitter card) with automatic fallback to the featured image. */
export const SeoImageField: React.FC<{ value?: string; onChange: (url: string) => void; fallback?: string }> = ({ value, onChange, fallback }) => (
  <ImageField
    label="Social share image (Open Graph & Twitter card)"
    value={value}
    onChange={onChange}
    fallback={fallback}
    help="Shown when this page is shared on Facebook, WhatsApp, X/Twitter, LinkedIn. Best size 1200 × 630px. Leave empty to use the featured image automatically."
  />
);
