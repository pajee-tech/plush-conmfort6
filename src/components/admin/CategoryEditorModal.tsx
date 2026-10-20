import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types';
import { RichTextEditor } from './RichTextEditor';
import { SeoImageField } from './SeoImageField';
import { adminAuthService } from '../../services/adminAuthService';
import { X, Check, Upload, Info, FolderTree } from 'lucide-react';

interface CategoryEditorModalProps {
  category: Category;
  isNew?: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
}

export const CategoryEditorModal: React.FC<CategoryEditorModalProps> = ({
  category,
  isNew = false,
  onClose,
  onSave,
}) => {
  const { categories } = useStore();

  const [formData, setFormData] = useState<Category>({
    ...category,
    bannerImage: category.bannerImage || category.image,
    showBanner: category.showBanner !== false,
    imageAlt: category.imageAlt || `${category.name} handcrafted British luxury furniture`,
    canonicalUrl: category.canonicalUrl || (category.slug ? `https://plushcomfort.uk/category/${category.slug}` : ''),
    robotsIndexing: category.robotsIndexing || 'index, follow',
    order: category.order || 0,
    parentId: category.parentId || '',
  });

  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'media'>('content');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          `${formData.name} hero banner`
        );
        if (res.success && res.url) {
          setFormData((prev) => ({
            ...prev,
            bannerImage: res.url,
            image: prev.image || res.url || '',
          }));
        } else {
          setUploadError(res.error || 'Upload failed.');
        }
      } catch (err: any) {
        setUploadError(err.message || 'Image upload error');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
          `${formData.name} thumbnail`
        );
        if (res.success && res.url) {
          setFormData((prev) => ({
            ...prev,
            image: res.url!,
            bannerImage: prev.bannerImage || res.url!,
          }));
        } else {
          setUploadError(res.error || 'Upload failed.');
        }
      } catch (err: any) {
        setUploadError(err.message || 'Image upload error');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const [formError, setFormError] = useState<string | null>(null);
  const toSlug = (v: string) => v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = toSlug(formData.slug || formData.name);
    if (!formData.name.trim() || !slug) {
      setFormError('Please enter a category name.');
      return;
    }
    if (categories.some((c) => c.slug === slug && c.id !== formData.id)) {
      setFormError(`The URL /category/${slug} is already used by another category.`);
      return;
    }
    onSave({
      ...formData,
      slug,
      parentId: formData.parentId || undefined,
      canonicalUrl: formData.canonicalUrl || `https://plushcomfort.uk/category/${slug}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 z-10 shadow-2xl max-h-[92vh] flex flex-col my-auto border border-[#E8E0D5]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A25828]">
              Collection &amp; Silo Editor
            </span>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#221C18]">
              {isNew ? 'Create New Category' : `Edit Category: ${formData.name}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 py-3 border-b border-stone-200 shrink-0 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
              activeTab === 'content'
                ? 'bg-[#A25828] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            1. Details &amp; Descriptions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
              activeTab === 'media'
                ? 'bg-[#A25828] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            2. Banners &amp; Media
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
              activeTab === 'seo'
                ? 'bg-[#A25828] text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            3. SEO, Canonical &amp; Indexing
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
          {formError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold">{formError}</div>}
          {activeTab === 'content' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: isNew ? toSlug(e.target.value) : formData.slug,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7] text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Category Slug *</label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-2.5 bg-stone-100 border border-r-0 border-[#D5C7B7] rounded-l-xl text-stone-400 font-mono text-[11px]">
                      /category/
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">
                    Parent Category (for Hierarchical Nesting)
                  </label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7] bg-white text-xs"
                  >
                    <option value="">None (Top-Level Primary Category)</option>
                    {categories
                      .filter((c) => c.id !== formData.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B7] text-xs font-bold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Header Introduction Summary
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#D5C7B7] text-xs leading-relaxed"
                />
              </div>

              <div>
                <RichTextEditor
                  label="Bottom Editorial Buying Guide & Internal Links (SEO Silo Pillar)"
                  value={formData.bottomSeoDescription}
                  onChange={(val) => setFormData({ ...formData, bottomSeoDescription: val })}
                  rows={7}
                />
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E0D5]">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-[#A25828] focus:ring-[#A25828] w-4 h-4"
                  />
                  <span>Active &amp; Visible on Storefront Navigation</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-3">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#A25828]" />
                <div className="space-y-1">
                  <span className="font-bold block">Recommended Image Dimensions</span>
                  <p className="text-[11px] leading-relaxed">
                    <strong>Hero Banner Image:</strong> 1920 &times; 450px (Panoramic, 16:4 aspect ratio).<br />
                    <strong>Category Thumbnail:</strong> 800 &times; 800px (1:1 ratio).
                  </p>
                </div>
              </div>

              {/* Show / Hide Banner Toggle */}
              <div className="flex items-center justify-between p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E0D5]">
                <div className="space-y-0.5">
                  <span className="font-semibold text-stone-900 text-xs block">
                    Show Category Banner on Category Page
                  </span>
                  <p className="text-[11px] text-stone-500 leading-normal">
                    Display the banner image with category title and description overlay on the live storefront. Turn off to hide banner without deleting content.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                  <input
                    type="checkbox"
                    checked={formData.showBanner !== false}
                    onChange={(e) => setFormData({ ...formData, showBanner: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A25828]"></div>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Category Hero Banner Image URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.bannerImage || ''}
                    onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl border border-stone-300 font-mono text-xs"
                    placeholder="/uploads/products/... or https://..."
                  />
                  <label className="bg-[#A25828] hover:bg-[#8A461A] text-white px-4 py-2.5 rounded-xl font-semibold cursor-pointer shrink-0 inline-flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
                {isUploading && <p className="text-stone-500 mt-1 animate-pulse">Uploading banner...</p>}
                {uploadError && <p className="text-red-600 mt-1">{uploadError}</p>}
              </div>

              {/* Banner Preview */}
              {(formData.bannerImage || formData.image) && (
                <div className="w-full h-36 rounded-2xl overflow-hidden border border-stone-200 relative bg-stone-900 shadow-inner">
                  <img
                    src={formData.bannerImage || formData.image}
                    alt=""
                    className="w-full h-full object-cover filter brightness-[0.70]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex flex-col justify-end p-3.5 space-y-0.5">
                    <span className="text-[9px] uppercase tracking-wider text-amber-300 font-bold">
                      Free UK Delivery · Cash on Delivery
                    </span>
                    <span className="text-white font-serif font-bold text-sm drop-shadow-md">
                      {formData.name}
                    </span>
                    <span className="text-stone-200 text-[10px] line-clamp-1 drop-shadow-sm">
                      {formData.description}
                    </span>
                  </div>
                  <span
                    className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow-xs ${
                      formData.showBanner !== false ? 'bg-emerald-600/90 text-white' : 'bg-stone-800/85 text-stone-300'
                    }`}
                  >
                    {formData.showBanner !== false ? '✓ Banner Visible' : '✕ Banner Hidden'}
                  </span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Category Thumbnail / Card Image</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 p-2.5 rounded-xl border border-stone-300 font-mono text-xs"
                    placeholder="/uploads/products/... or https://..."
                  />
                  <label className="bg-[#A25828] hover:bg-[#8A461A] text-white px-4 py-2.5 rounded-xl font-semibold cursor-pointer shrink-0 inline-flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Image Alt Text (for Google Search)</label>
                <input
                  type="text"
                  value={formData.imageAlt || ''}
                  onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
                  placeholder={`${formData.name} collection — Plush Comfort UK`}
                  className="w-full p-2.5 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">SEO Title Tag (Max 60 chars)</label>
                <input
                  type="text"
                  value={formData.seoTitle || ''}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  placeholder={`Luxury Handcrafted ${formData.name} UK | Plush Comfort`}
                  className="w-full p-2.5 rounded-xl border border-[#D5C7B7]"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  {(formData.seoTitle || '').length}/60 characters
                </span>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">SEO Meta Description (Max 160 chars)</label>
                <textarea
                  rows={3}
                  value={formData.seoDescription || ''}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  placeholder={`Shop ${formData.name.toLowerCase()} online at Plush Comfort UK. Free UK delivery, 1 year warranty and cash on delivery.`}
                  className="w-full p-3 rounded-xl border border-[#D5C7B7]"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  {(formData.seoDescription || '').length}/160 characters
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Canonical URL</label>
                  <input
                    type="text"
                    value={formData.canonicalUrl || `https://plushcomfort.uk/category/${formData.slug}`}
                    onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Search Engine Indexing Directive</label>
                  <select
                    value={formData.robotsIndexing || 'index, follow'}
                    onChange={(e) => setFormData({ ...formData, robotsIndexing: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  >
                    <option value="index, follow">index, follow (Recommended for Google)</option>
                    <option value="noindex, follow">noindex, follow</option>
                    <option value="noindex, nofollow">noindex, nofollow (Hidden)</option>
                  </select>
                </div>
              </div>

              <SeoImageField
                value={formData.ogImage}
                onChange={(url) => setFormData({ ...formData, ogImage: url })}
                fallback={formData.bannerImage || formData.image}
              />

              {/* SERP Preview */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Google Search Snippet Preview
                </span>
                <div className="font-sans">
                  <span className="text-xs text-stone-600 block truncate">
                    https://plushcomfort.uk &rsaquo; category &rsaquo; {formData.slug}
                  </span>
                  <h4 className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer">
                    {formData.seoTitle || `${formData.name} | Plush Comfort UK`}
                  </h4>
                  <p className="text-xs text-[#4d5156] line-clamp-2">
                    {formData.seoDescription || formData.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Save */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-600 font-semibold hover:bg-stone-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#A25828] hover:bg-[#8A461A] text-white px-8 py-2.5 rounded-full font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isNew ? 'Create Category' : 'Save Category Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
