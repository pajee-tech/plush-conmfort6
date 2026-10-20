import React, { useState, useRef, useEffect } from 'react';
import { BlogPost, ContentType, ContentStatus, Product, Category, InternalLinkReference, PillarLayoutSettings } from '../../types';
import { RichContent } from '../RichContent';
import { ImageField, SeoImageField } from '../admin/SeoImageField';
import { adminAuthService, readFileAsDataUrl } from '../../services/adminAuthService';
import {
  Save,
  Eye,
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  User,
  Link2,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  Table as TableIcon,
  Quote,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Globe,
  Share2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  GalleryHorizontal,
  BarChart3,
  Lightbulb,
  ListChecks,
  MousePointerClick,
  HelpCircle,
  ShoppingBag,
  Loader2,
} from 'lucide-react';

const DEFAULT_COVER = '/uploads/blog/uk-sofa-buying-guide-cover.webp';

interface ContentEditorProps {
  post: BlogPost | null; // null if creating a new post
  pillars: BlogPost[];
  allPosts: BlogPost[];
  products: Product[];
  categories: Category[];
  onSave: (postData: Omit<BlogPost, 'id'> | BlogPost) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  onPreview: (slug: string) => void;
  initialPillarId?: string;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  post,
  pillars,
  allPosts,
  products,
  categories,
  onSave,
  onCancel,
  onDelete,
  onPreview,
  initialPillarId,
}) => {
  const isEditing = Boolean(post);

  // Form State
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [contentType, setContentType] = useState<ContentType>(post?.contentType || 'cluster_article');
  const [parentPillarId, setParentPillarId] = useState<string>(
    post?.parentPillarId || initialPillarId || (pillars[0]?.id || '')
  );
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [coverImage, setCoverImage] = useState(post?.coverImage || DEFAULT_COVER);
  const [socialImage, setSocialImage] = useState(post?.socialImage || '');
  const [author, setAuthor] = useState(post?.author || 'Plush Comfort Team');
  const [authorRole, setAuthorRole] = useState(post?.authorRole || 'Furniture Buying Advisors');
  const [keyTakeaways, setKeyTakeaways] = useState<string>((post?.keyTakeaways || []).join('\n'));
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(post?.faqs || []);
  const [pillarLayout, setPillarLayout] = useState<PillarLayoutSettings>(post?.pillarLayout || { showTableOfContents: true, showChapterNumbers: true });
  const [blockModal, setBlockModal] = useState<null | 'chart' | 'carousel'>(null);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [chartTitle, setChartTitle] = useState('');
  const [chartUnit, setChartUnit] = useState('');
  const [chartRows, setChartRows] = useState<Array<{ label: string; value: string }>>([
    { label: '2 Seater', value: '165' },
    { label: '3 Seater', value: '210' },
  ]);
  const [carouselItems, setCarouselItems] = useState<Array<{ src: string; caption: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<ContentStatus>(post?.status || 'published');
  const [publishDate, setPublishDate] = useState(post?.publishDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  const [scheduledDate, setScheduledDate] = useState(post?.scheduledDate || '');
  const [category, setCategory] = useState(post?.category || 'Sofas');
  const [tags, setTags] = useState<string>(post?.tags?.join(', ') || 'Buying Guide, Living Room');
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription || '');
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonicalUrl || '');
  const [isNoIndex, setIsNoIndex] = useState(post?.isNoIndex || false);
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>(post?.relatedProductIds || []);
  const [internalLinks, setInternalLinks] = useState<InternalLinkReference[]>(post?.internalLinks || []);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Editor mode: 'edit' | 'split' | 'preview'
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'preview'>('edit');
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'relationships' | 'publishing'>('content');

  // Internal Link Search Drawer
  const [linkSearchOpen, setLinkSearchOpen] = useState(false);
  const [linkQuery, setLinkQuery] = useState('');
  const [linkAnchorText, setLinkAnchorText] = useState('');
  const [linkTypeFilter, setLinkTypeFilter] = useState<'all' | 'product' | 'category' | 'pillar' | 'cluster'>('all');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-generate slug from title if new or slug is empty
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isEditing || !slug) {
      const generated = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
    if (!seoTitle) {
      setSeoTitle(`${newTitle} | Plush Comfort UK`);
    }
  };

  // Auto calculate read time based on word count
  const calculateReadTime = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  // Toolbar Formatting helper
  const insertFormatting = (prefix: string, suffix = '', defaultPlaceholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end) || defaultPlaceholder;
    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  // Insert Table template
  const insertTable = () => {
    const tableTemplate = `\n| Metric / Feature | Specification | Recommended Room |\n|---|---|---|\n| **Single (3ft)** | 90 x 190 cm | 2.5m x 3.0m |\n| **Double (4ft6)** | 135 x 190 cm | 3.2m x 3.5m |\n| **King Size (5ft)** | 150 x 200 cm | 3.6m x 4.0m |\n\n`;
    insertFormatting(tableTemplate, '', '');
  };

  // Insert Callout / Tip box
  const insertCallout = () => {
    const callout = `\n> **Plush Comfort Craftsman Tip:** Always leave at least 50cm between your sofa front and your coffee table to allow natural walkway flow in British living rooms.\n\n`;
    insertFormatting(callout, '', '');
  };

  // ---- Rich blocks ----
  const insertBlock = (block: string) => insertFormatting(`\n${block.trim()}\n\n`, '', '');

  const uploadFiles = async (files: File[], label: string): Promise<string[]> => {
    setUploading(true);
    const urls: string[] = [];
    try {
      for (const f of files) {
        const res = await adminAuthService.uploadImage(await readFileAsDataUrl(f), `${slug || 'article'}-${f.name}`, label);
        if (res.success && res.url) urls.push(res.url);
      }
    } finally {
      setUploading(false);
    }
    return urls;
  };

  const handleInsertImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    const urls = await uploadFiles(files, title || 'Article image');
    const caption = window.prompt('Image caption / alt text (describe the photo for Google)', title) || title || 'Plush Comfort';
    urls.forEach((u) => insertBlock(`![${caption}](${u} "${caption}")`));
  };

  const handleCarouselUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    const urls = await uploadFiles(files, 'Carousel image');
    setCarouselItems((prev) => [...prev, ...urls.map((u) => ({ src: u, caption: '' }))]);
  };

  // Internal Link Targets Database Query
  const getSearchableLinkItems = () => {
    const items: Array<{
      id: string;
      title: string;
      url: string;
      type: 'product' | 'category' | 'pillar' | 'cluster' | 'guide';
      subtitle?: string;
    }> = [];

    // Products
    products.forEach((p) => {
      items.push({
        id: p.id,
        title: p.name,
        url: `/product/${p.slug}`,
        type: 'product',
        subtitle: `£${p.price.toFixed(2)} · ${p.colours.length} colours`,
      });
    });

    // Categories
    categories.forEach((c) => {
      items.push({
        id: c.id,
        title: `${c.name} Collection`,
        url: `/category/${c.slug}`,
        type: 'category',
        subtitle: `${c.subcategories.length} subcategories`,
      });
    });

    // Articles / Guides
    allPosts.forEach((postItem) => {
      if (post && postItem.id === post.id) return;
      items.push({
        id: postItem.id,
        title: postItem.title,
        url: `/blog/${postItem.slug}`,
        type: postItem.contentType === 'pillar_page' ? 'pillar' : 'cluster',
        subtitle: `${postItem.contentType.replace('_', ' ')} · ${postItem.author}`,
      });
    });

    return items.filter((item) => {
      if (linkTypeFilter !== 'all' && item.type !== linkTypeFilter) return false;
      if (linkQuery.trim()) {
        const q = linkQuery.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.url.toLowerCase().includes(q);
      }
      return true;
    });
  };

  // Insert selected link into content
  const handleInsertLink = (item: { id: string; title: string; url: string; type: any }) => {
    const anchor = linkAnchorText.trim() || item.title;
    const markdownLink = `[${anchor}](${item.url})`;

    // Insert into textarea
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = textarea.value.substring(0, start) + markdownLink + textarea.value.substring(end);
      setContent(newContent);
    } else {
      setContent((prev) => `${prev} ${markdownLink}`);
    }

    // Record internal link reference in post metadata
    setInternalLinks((prev) => {
      const existing = prev.find((l) => l.url === item.url);
      if (existing) return prev;
      return [
        ...prev,
        {
          targetId: item.id,
          targetType: item.type,
          title: anchor,
          url: item.url,
        },
      ];
    });

    setLinkSearchOpen(false);
    setLinkAnchorText('');
    setLinkQuery('');
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setValidationError('Please enter an article title.');
      return;
    }
    if (!slug.trim()) {
      setValidationError('Please specify a URL slug.');
      return;
    }

    const cleanSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Duplicate slug check across other posts
    const isDuplicate = allPosts.some((p) => p.slug === cleanSlug && (!post || p.id !== post.id));
    if (isDuplicate) {
      setValidationError(`The URL slug "/${cleanSlug}" is already in use by another article. Please use a unique slug.`);
      return;
    }

    setValidationError(null);

    const parentPillar = pillars.find((p) => p.id === parentPillarId);

    const postPayload: Omit<BlogPost, 'id'> = {
      title: title.trim(),
      slug: cleanSlug,
      contentType,
      type: contentType === 'pillar_page' ? 'pillar' : 'cluster',
      parentPillarId: contentType !== 'pillar_page' ? parentPillarId : undefined,
      pillarSlug: contentType !== 'pillar_page' && parentPillar ? parentPillar.slug : undefined,
      excerpt: excerpt.trim() || title.trim(),
      content: content.trim(),
      coverImage: coverImage.trim() || DEFAULT_COVER,
      socialImage: socialImage.trim() || undefined,
      author: author.trim() || 'Plush Comfort Team',
      authorRole: authorRole.trim() || 'Plush Comfort Specialist',
      publishDate: publishDate.trim(),
      scheduledDate: status === 'scheduled' ? scheduledDate : undefined,
      lastUpdated: new Date().toISOString().split('T')[0],
      status,
      isPublished: status === 'published',
      readTime: calculateReadTime(content),
      category: category.trim(),
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      seoTitle: seoTitle.trim() || `${title.trim()} | Plush Comfort UK`,
      seoDescription: seoDescription.trim() || excerpt.trim() || title.trim(),
      canonicalUrl: canonicalUrl.trim() || `https://plushcomfort.uk/blog/${cleanSlug}`,
      isNoIndex,
      relatedCategorySlug: category.toLowerCase().includes('bed') ? 'beds-bed-frames' : 'sofas',
      relatedProductIds,
      internalLinks,
      keyTakeaways: keyTakeaways.split('\n').map((t) => t.trim()).filter(Boolean),
      faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
      pillarLayout: contentType === 'pillar_page' ? pillarLayout : undefined,
    };

    if (isEditing && post) {
      onSave({ ...postPayload, id: post.id });
    } else {
      onSave(postPayload);
    }
  };

  const selectedParentPillar = pillars.find((p) => p.id === parentPillarId);

  return (
    <div className="bg-white rounded-3xl border border-[#E8E0D5] overflow-hidden shadow-xl animate-fade-in">
      {/* Editor Top Navigation Header */}
      <div className="bg-[#FAF8F5] p-6 border-b border-[#E8E0D5] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#A25828] text-white flex items-center justify-center font-serif font-bold text-lg">
            CMS
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl text-[#221C18]">
              {post ? `Edit: ${post.title}` : 'Create New Article / Guide'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span>URL: <code className="text-[#A25828] font-mono">/blog/{slug || 'url-slug'}</code></span>
              <span>·</span>
              <span className="font-semibold text-stone-700 capitalize">{contentType.replace('_', ' ')}</span>
              <span>·</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                status === 'scheduled' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700'
              }`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white border border-[#D5C7B7] rounded-xl p-1 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'edit' ? 'bg-[#221C18] text-white' : 'text-stone-600 hover:text-black'
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`hidden sm:inline-block px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'split' ? 'bg-[#221C18] text-white' : 'text-stone-600 hover:text-black'
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'preview' ? 'bg-[#221C18] text-white' : 'text-stone-600 hover:text-black'
              }`}
            >
              Live Preview
            </button>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={() => onPreview(slug)}
              className="p-2.5 rounded-xl border border-[#D5C7B7] text-stone-600 hover:text-black hover:bg-stone-50 cursor-pointer"
              title="Open public page in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 bg-[#A25828] hover:bg-[#8A461A] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save &amp; {status === 'published' ? 'Publish' : 'Store'}</span>
          </button>
        </div>
      </div>

      {/* Editor Sub-Tabs (Content, SEO, Silo Relationships, Publishing) */}
      <div className="border-b border-[#E8E0D5] px-6 bg-white flex items-center gap-6 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'content', label: '1. Article Content & Editor' },
          { id: 'relationships', label: '2. Pillar Silo & Internal Links' },
          { id: 'seo', label: '3. SEO & Google SERP Preview' },
          { id: 'publishing', label: '4. Authorship & Schedule' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3.5 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#A25828] text-[#A25828] font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="mx-6 sm:mx-8 mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{validationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="text-rose-500 hover:text-rose-700 cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Tab Panels */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* ================= TAB 1: ARTICLE CONTENT ================= */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Title & Slug Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Article Title (H1) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. How to Choose the Right Sofa Size for UK Living Rooms"
                  className="w-full text-base sm:text-lg font-serif px-4 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828]"
                />
              </div>

              <div className="lg:col-span-4 space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  URL Slug (/blog/:slug) *
                </label>
                <div className="flex rounded-xl border border-[#D5C7B7] overflow-hidden bg-[#FAF8F5]">
                  <span className="px-3 py-2.5 text-xs text-stone-400 font-mono select-none">/blog/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="how-to-choose-sofa-size"
                    className="w-full text-xs px-2 py-2.5 bg-white font-mono focus:outline-none focus:border-[#A25828]"
                  />
                </div>
              </div>
            </div>

            {/* Content Type & Pillar Assignment Bar */}
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E0D5] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Content Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7B7] bg-white font-medium cursor-pointer"
                >
                  <option value="pillar_page">Flagship Pillar Page</option>
                  <option value="cluster_article">Supporting Cluster Article</option>
                  <option value="howto_guide">How-To Guide</option>
                  <option value="comparison_article">Comparison &amp; Advice</option>
                  <option value="faq_resource">Buying Resource &amp; FAQs</option>
                  <option value="buying_guide">General Buying Guide</option>
                  <option value="blog_post">Standard Blog Post</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Parent Pillar Page (Silo Structure)
                </label>
                {contentType === 'pillar_page' ? (
                  <div className="px-3 py-2 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 italic">
                    Self-anchoring Pillar Root
                  </div>
                ) : (
                  <select
                    value={parentPillarId}
                    onChange={(e) => setParentPillarId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5C7B7] bg-white font-medium cursor-pointer"
                  >
                    <option value="">-- No Parent (Orphan Article) --</option>
                    {pillars.map((pil) => (
                      <option key={pil.id} value={pil.id}>
                        {pil.title} ({pil.category})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Furniture Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5C7B7] bg-white font-medium cursor-pointer"
                >
                  <option value="Sofas">Sofas</option>
                  <option value="Beds">Beds</option>
                  <option value="Care & Maintenance">Care &amp; Maintenance</option>
                  <option value="Interior Advice">Interior Advice</option>
                  <option value="Buying Resources">Buying Resources</option>
                  <option value="Living Room">Living Room</option>
                </select>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <label className="font-bold uppercase tracking-wider text-stone-700">
                  Article Lead Excerpt
                </label>
                <span className="text-stone-400">{excerpt.length} characters</span>
              </div>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief 2-3 sentence overview shown in article listings and category landing cards..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828]"
              />
            </div>

            {/* WYSIWYG / Markdown Editor with Live Toolbar */}
            <div className="border border-[#D5C7B7] rounded-2xl overflow-hidden bg-white shadow-2xs">
              {/* Toolbar */}
              <div className="bg-[#FAF8F5] border-b border-[#E8E0D5] p-2 flex flex-wrap items-center gap-1 text-xs">
                <div className="flex items-center gap-0.5 border-r border-[#E8E0D5] pr-2 mr-1">
                  <button
                    type="button"
                    onClick={() => insertFormatting('# ', '', 'Main Heading')}
                    className="p-1.5 rounded hover:bg-stone-200 text-stone-700 cursor-pointer"
                    title="Heading 1"
                  >
                    <Heading1 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('## ', '', 'Section Heading')}
                    className="p-1.5 rounded hover:bg-stone-200 text-stone-700 cursor-pointer"
                    title="Heading 2"
                  >
                    <Heading2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('### ', '', 'Subsection Heading')}
                    className="p-1.5 rounded hover:bg-stone-200 text-stone-700 cursor-pointer"
                    title="Heading 3"
                  >
                    <Heading3 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-0.5 border-r border-[#E8E0D5] pr-2 mr-1">
                  <button
                    type="button"
                    onClick={() => insertFormatting('**', '**', 'bold text')}
                    className="p-1.5 rounded hover:bg-stone-200 text-stone-700 cursor-pointer"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('*', '*', 'italic text')}
                    className="p-1.5 rounded hover:bg-stone-200 text-stone-700 cursor-pointer"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-0.5 border-r border-[#E8E0D5] pr-2 mr-1">
                  <button
                    type="button"
                    onClick={() => insertFormatting('- ', '', 'Bullet item')}
                    className="p-1.5 rounded hover:bg-stone-200 text-stone-700 cursor-pointer"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('1. ', '', 'Numbered item')}
                    className="p-1.5 rounded hover:bg-stone-200 text-stone-700 cursor-pointer"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-0.5 border-r border-[#E8E0D5] pr-2 mr-1">
                  <button
                    type="button"
                    onClick={insertCallout}
                    className="p-1.5 rounded hover:bg-stone-200 text-stone-700 cursor-pointer"
                    title="Craftsman Tip Box"
                  >
                    <Quote className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={insertTable}
                    className="p-1.5 rounded hover:bg-stone-200 text-stone-700 cursor-pointer"
                    title="Insert Comparison Table"
                  >
                    <TableIcon className="w-4 h-4" />
                  </button>
                  <label className="p-1.5 rounded hover:bg-stone-200 text-stone-700 cursor-pointer" title="Upload & insert image">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleInsertImageUpload} />
                  </label>
                  <button type="button" onClick={() => setBlockModal('carousel')} className="p-1.5 rounded hover:bg-stone-200 text-stone-700" title="Image carousel / slider">
                    <GalleryHorizontal className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setBlockModal('chart')} className="p-1.5 rounded hover:bg-stone-200 text-stone-700" title="Create a chart / graph">
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-0.5 border-r border-[#E8E0D5] pr-2 mr-1">
                  <button type="button" onClick={() => insertBlock(':::tip Expert tip\nWrite the tip here.\n:::')} className="p-1.5 rounded hover:bg-stone-200 text-stone-700" title="Tip box">
                    <Lightbulb className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => insertBlock(':::steps\nFirst step | Short description\nSecond step | Short description\n:::')} className="p-1.5 rounded hover:bg-stone-200 text-stone-700" title="Numbered steps">
                    <ListOrdered className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => insertBlock(':::checklist Checklist title\n- First item\n- Second item\n:::')} className="p-1.5 rounded hover:bg-stone-200 text-stone-700" title="Interactive checklist">
                    <ListChecks className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => insertBlock(':::faq\nQ: Your question?\nA: The answer.\n:::')} className="p-1.5 rounded hover:bg-stone-200 text-stone-700" title="FAQ accordion (adds FAQ schema)">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => insertBlock(':::cta Ready to shop? | Shop Sofas | /category/sofas\nFree UK delivery · 1 year warranty · Cash on delivery\n:::')} className="p-1.5 rounded hover:bg-stone-200 text-stone-700" title="Call-to-action box">
                    <MousePointerClick className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertBlock(`:::products ${(relatedProductIds.length ? relatedProductIds : products.slice(0, 2).map((p) => p.id)).join(', ')}\n:::`)}
                    className="p-1.5 rounded hover:bg-stone-200 text-stone-700"
                    title="Product cards (uses the products picked in tab 2)"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>

                {/* Dedicated Internal Link Insertion Button */}
                <button
                  type="button"
                  onClick={() => setLinkSearchOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-[#FAF5EE] border border-[#A25828]/40 hover:bg-[#A25828] hover:text-white text-[#A25828] px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  title="Search and insert internal link to product, category, or pillar"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Insert Internal Link...</span>
                </button>

                <div className="ml-auto text-[11px] text-stone-400 font-mono">
                  {content.trim().split(/\s+/).filter(Boolean).length} words · {calculateReadTime(content)}
                </div>
              </div>

              {/* View Split: Editor / Live Render */}
              <div className={`grid ${viewMode === 'split' ? 'grid-cols-2 divide-x divide-stone-200' : 'grid-cols-1'}`}>
                {/* Textarea Input */}
                {viewMode !== 'preview' && (
                  <textarea
                    ref={textareaRef}
                    rows={18}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your comprehensive furniture buying guide using headings (#, ##), paragraphs, lists, tables, and internal links..."
                    className="w-full p-5 text-sm font-mono leading-relaxed focus:outline-none resize-y text-stone-800"
                  />
                )}

                {/* Live Public Render Pane */}
                {(viewMode === 'split' || viewMode === 'preview') && (
                  <div className="p-8 bg-white overflow-y-auto max-h-[600px] prose prose-stone max-w-none text-[#3C322C]">
                    <div className="mb-4 pb-3 border-b border-stone-200 text-xs text-stone-400 flex items-center justify-between">
                      <span>Public Storefront Preview Simulation</span>
                      <span className="font-semibold text-emerald-700">Responsive UK Layout</span>
                    </div>

                    <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#221C18] not-prose mb-3">
                      {title || 'Untitled Article'}
                    </h1>

                    {selectedParentPillar && (
                      <div className="not-prose mb-6 p-3.5 bg-[#FAF5EE] rounded-xl border border-[#E8DFC5] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#A25828]" />
                          <div>
                            <span className="font-bold text-[#A25828] uppercase text-[10px]">Part of Pillar Series</span>
                            <span className="font-serif font-bold text-stone-800 ml-2">{selectedParentPillar.title}</span>
                          </div>
                        </div>
                        <span className="text-[#A25828] font-bold">View Pillar Guide &rarr;</span>
                      </div>
                    )}

                    <div className="not-prose">
                      {content ? (
                        <RichContent content={content} onNavigate={() => {}} products={products} chapterNumbers={contentType === 'pillar_page'} compact />
                      ) : (
                        <p className="text-sm text-stone-400">Start writing to see the live preview…</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Feature (cover) image — shown on the homepage guides section, blog list and top of the article */}
            <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E8E0D5] space-y-4">
              <ImageField
                label="Feature image (homepage, blog list & article header)"
                value={coverImage}
                onChange={setCoverImage}
                previewClass="w-48 aspect-[16/9]"
                help="Upload a real photo (landscape 16:9, e.g. 1600 × 900). It is converted to WebP under 200 KB automatically."
              />
            </div>

            {/* Key takeaways */}
            <div className="p-5 bg-white rounded-2xl border border-[#E8E0D5] space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">Key takeaways (one per line — shown in a box at the top)</label>
              <textarea
                rows={3}
                value={keyTakeaways}
                onChange={(e) => setKeyTakeaways(e.target.value)}
                placeholder={'Measure your doors before you buy\nVelvet is great for homes with pets'}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7]"
              />
            </div>

            {/* FAQs */}
            <div className="p-5 bg-white rounded-2xl border border-[#E8E0D5] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">FAQs (shown at the end + Google FAQ schema)</label>
                <button type="button" onClick={() => setFaqs([...faqs, { question: '', answer: '' }])} className="text-xs font-bold text-[#A25828]">
                  + Add FAQ
                </button>
              </div>
              {faqs.map((f, i) => (
                <div key={i} className="grid gap-2 p-3 rounded-xl bg-[#FAF8F5] border border-stone-200">
                  <div className="flex gap-2">
                    <input value={f.question} onChange={(e) => setFaqs(faqs.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)))} placeholder="Question" className="flex-1 text-xs p-2 rounded-lg border border-stone-300 font-semibold" />
                    <button type="button" onClick={() => setFaqs(faqs.filter((_, j) => j !== i))} className="p-2 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <textarea rows={2} value={f.answer} onChange={(e) => setFaqs(faqs.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)))} placeholder="Answer" className="text-xs p-2 rounded-lg border border-stone-300" />
                </div>
              ))}
              {faqs.length === 0 && <p className="text-[11px] text-stone-400">No FAQs yet.</p>}
            </div>

            {/* Pillar layout */}
            {contentType === 'pillar_page' && (
              <div className="p-5 bg-[#FAF5EE] rounded-2xl border border-[#E8DFC5] space-y-3 text-xs">
                <div className="font-bold text-stone-900 text-sm">Pillar page layout (hero, table of contents, closing banner)</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(
                    [
                      ['eyebrow', 'Small label above the title', 'Plush Comfort Sofa Buying Guide'],
                      ['primaryCtaText', 'Hero button 1 text', 'Start Reading'],
                      ['primaryCtaLink', 'Hero button 1 link (empty = first chapter)', ''],
                      ['secondaryCtaText', 'Hero button 2 text', 'Shop Sofas'],
                      ['secondaryCtaLink', 'Hero button 2 link', '/category/sofas'],
                      ['closingTitle', 'Closing banner title', 'Ready to choose your sofa?'],
                      ['closingText', 'Closing banner text', 'Free UK delivery…'],
                      ['closingCtaText', 'Closing button text', 'Shop All Sofas'],
                      ['closingCtaLink', 'Closing button link', '/category/sofas'],
                    ] as const
                  ).map(([key, label, ph]) => (
                    <div key={key}>
                      <label className="block font-semibold text-stone-700 mb-1">{label}</label>
                      <input
                        value={(pillarLayout as any)[key] || ''}
                        placeholder={ph}
                        onChange={(e) => setPillarLayout({ ...pillarLayout, [key]: e.target.value })}
                        className="w-full p-2 rounded-lg border border-[#D5C7B7] bg-white"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 font-semibold">
                    <input type="checkbox" checked={pillarLayout.showTableOfContents !== false} onChange={(e) => setPillarLayout({ ...pillarLayout, showTableOfContents: e.target.checked })} />
                    Show “On this page” table of contents
                  </label>
                  <label className="flex items-center gap-2 font-semibold">
                    <input type="checkbox" checked={pillarLayout.showChapterNumbers !== false} onChange={(e) => setPillarLayout({ ...pillarLayout, showChapterNumbers: e.target.checked })} />
                    Show “Chapter 01” labels
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: SILO & INTERNAL LINKS ================= */}
        {activeTab === 'relationships' && (
          <div className="space-y-6">
            <div className="p-5 bg-[#FAF5EE] rounded-2xl border border-[#E8DFC5] text-xs text-stone-700 leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
                <Link2 className="w-4 h-4 text-[#A25828]" />
                <span>Internal Linking &amp; Topical Authority Management</span>
              </div>
              <p>
                To maximise ranking for UK furniture keywords, each article must link naturally to:
                1) The parent Pillar Buying Guide, 2) Relevant commercial category pages, and 3) Featured handcrafted products.
              </p>
            </div>

            {/* Internal Links in this Article */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8E0D5] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#221C18]">
                    Recorded Internal Links ({internalLinks.length})
                  </h4>
                  <p className="text-xs text-stone-500">
                    Links tracked in this article record that pass PageRank across the store.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setLinkSearchOpen(true)}
                  className="bg-[#A25828] hover:bg-[#8A461A] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert New Link</span>
                </button>
              </div>

              {internalLinks.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF8F5] rounded-xl border border-dashed border-stone-300 space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                  <p className="text-xs text-stone-500 font-semibold">
                    No internal links recorded yet.
                  </p>
                  <p className="text-[11px] text-stone-400">
                    Click &ldquo;Insert New Link&rdquo; to add connections to products or buying guides.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                  {internalLinks.map((link, idx) => (
                    <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-700">
                          {link.targetType}
                        </span>
                        <div>
                          <span className="font-bold text-stone-900">{link.title}</span>
                          <span className="block text-[11px] text-stone-400 font-mono">{link.url}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInternalLinks(internalLinks.filter((_, i) => i !== idx))}
                        className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Remove link reference"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Featured Commercial Products in this Article */}
            <div className="bg-white p-6 rounded-2xl border border-[#E8E0D5] space-y-4">
              <div>
                <h4 className="font-serif font-bold text-base text-[#221C18]">
                  Handcrafted Pieces Featured in Bottom Carousel ({relatedProductIds.length})
                </h4>
                <p className="text-xs text-stone-500">
                  Select which catalog products to showcase in the &ldquo;Pieces Featured in this Guide&rdquo; strip at the foot of the page.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map((prod) => {
                  const isChecked = relatedProductIds.includes(prod.id);
                  return (
                    <label
                      key={prod.id}
                      className={`p-3 rounded-xl border text-xs flex items-center gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#A25828] bg-[#FAF5EE] text-[#A25828] font-semibold'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setRelatedProductIds(relatedProductIds.filter((id) => id !== prod.id));
                          } else {
                            setRelatedProductIds([...relatedProductIds, prod.id]);
                          }
                        }}
                        className="rounded border-stone-300 text-[#A25828] focus:ring-[#A25828]"
                      />
                      <div className="truncate">
                        <span className="block truncate font-medium text-stone-900">{prod.name}</span>
                        <span className="text-[11px] text-stone-400">£{prod.price.toFixed(2)}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: SEO & SERP PREVIEW ================= */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="p-5 bg-white rounded-2xl border border-[#E8E0D5]">
              <SeoImageField value={socialImage} onChange={setSocialImage} fallback={coverImage} />
            </div>
            {/* Google Search Results Simulator */}
            <div className="p-6 bg-white rounded-2xl border border-[#E8E0D5] space-y-3 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Google SERP Snippet Preview (UK Desktop &amp; Mobile)
              </span>

              <div className="p-4 bg-[#F8F9FA] rounded-xl border border-stone-200 font-sans max-w-2xl">
                <div className="flex items-center gap-1.5 text-xs text-[#202124] mb-1">
                  <div className="w-4 h-4 rounded-full bg-[#A25828] text-white text-[9px] font-bold flex items-center justify-center">
                    PC
                  </div>
                  <span className="text-[12px] text-[#4d5156]">https://plushcomfort.uk &gt; blog &gt; {slug || 'article-slug'}</span>
                </div>
                <h4 className="text-[#1a0dab] hover:underline text-lg font-medium leading-snug cursor-pointer line-clamp-1">
                  {seoTitle || title || 'Plush Comfort Furniture Article'}
                </h4>
                <p className="text-[#4d5156] text-xs leading-relaxed mt-1 line-clamp-2">
                  {seoDescription || excerpt || 'Your meta description will appear here…'}
                </p>
              </div>
            </div>

            {/* SEO Title Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold uppercase tracking-wider text-stone-700">
                  SEO Title Tag (&lt;title&gt;) *
                </label>
                <span className={`font-semibold ${seoTitle.length > 60 ? 'text-amber-600' : 'text-emerald-700'}`}>
                  {seoTitle.length} / 60 characters recommended
                </span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="e.g. How to Choose the Right Sofa Size | UK Living Rooms | Plush Comfort"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828]"
              />
            </div>

            {/* Meta Description Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold uppercase tracking-wider text-stone-700">
                  Meta Description (&lt;meta name=&quot;description&quot;&gt;) *
                </label>
                <span className={`font-semibold ${seoDescription.length > 160 ? 'text-amber-600' : 'text-emerald-700'}`}>
                  {seoDescription.length} / 160 characters recommended
                </span>
              </div>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Targeted description summarizing key points for Google search results..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828]"
              />
            </div>

            {/* Canonical URL & Index Directives */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Canonical URL Tag
                </label>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder={`https://plushcomfort.uk/blog/${slug || 'slug'}`}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#D5C7B7] font-mono"
                />
              </div>

            </div>

            {/* Indexing Checkbox */}
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E0D5] flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-stone-800 block">Search Engine Indexation</span>
                <span className="text-[11px] text-stone-500">Allow Googlebot and Bing to index this article</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                <input
                  type="checkbox"
                  checked={!isNoIndex}
                  onChange={(e) => setIsNoIndex(!e.target.checked)}
                  className="rounded border-stone-300 text-[#A25828] focus:ring-[#A25828]"
                />
                <span>Index in Google &amp; XML Sitemap</span>
              </label>
            </div>
          </div>
        )}

        {/* ================= TAB 4: PUBLISHING & AUTHORSHIP ================= */}
        {activeTab === 'publishing' && (
          <div className="space-y-6 max-w-2xl">
            {/* Status Selector */}
            <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E8E0D5] space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-800">
                Publication Status
              </label>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'published', label: 'Published Live', desc: 'Visible on storefront' },
                  { id: 'draft', label: 'Draft', desc: 'Saved privately in database' },
                  { id: 'scheduled', label: 'Scheduled', desc: 'Auto-publish on future date' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatus(st.id as ContentStatus)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      status === st.id
                        ? 'border-[#A25828] bg-white ring-2 ring-[#A25828]/20 shadow-xs'
                        : 'border-[#E8E0D5] bg-white hover:border-stone-300'
                    }`}
                  >
                    <span className="font-bold text-xs block text-stone-900">{st.label}</span>
                    <span className="text-[10px] text-stone-500">{st.desc}</span>
                  </button>
                ))}
              </div>

              {/* Scheduled Date Field */}
              {status === 'scheduled' && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Scheduled Publication Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7] bg-white"
                  />
                </div>
              )}
            </div>

            {/* Author Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Author Name *
                </label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Plush Comfort Team"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Author Role / Credential
                </label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  placeholder="e.g. Furniture Buying Advisor"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7]"
                />
              </div>
            </div>

            {/* Dates & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Public Display Date
                </label>
                <input
                  type="text"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Sofa Guide, Living Room, Sizing"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7]"
                />
              </div>
            </div>

            {isEditing && post && onDelete && (
              <div className="pt-6 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
                      onDelete(post.id);
                    }
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete this article permanently from database</span>
                </button>
              </div>
            )}
          </div>
        )}
      </form>

      {/* ================= CHART BUILDER / CAROUSEL MODALS ================= */}
      {blockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setBlockModal(null)} />
          <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 z-10 shadow-2xl max-h-[88vh] overflow-y-auto text-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#221C18]">{blockModal === 'chart' ? 'Create a chart / graph' : 'Image carousel (slider)'}</h3>
              <button type="button" onClick={() => setBlockModal(null)}><X className="w-5 h-5 text-stone-400" /></button>
            </div>

            {blockModal === 'chart' && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  {(['bar', 'line', 'pie'] as const).map((t) => (
                    <button key={t} type="button" onClick={() => setChartType(t)} className={`p-2 rounded-xl border font-semibold capitalize ${chartType === t ? 'border-[#A25828] bg-[#FAF2EB]' : 'border-stone-200'}`}>
                      {t === 'pie' ? 'Pie / donut' : `${t} chart`}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input value={chartTitle} onChange={(e) => setChartTitle(e.target.value)} placeholder="Chart title" className="col-span-2 p-2 rounded-lg border border-stone-300" />
                  <input value={chartUnit} onChange={(e) => setChartUnit(e.target.value)} placeholder="Unit (cm, %, £)" className="p-2 rounded-lg border border-stone-300" />
                </div>
                <div className="space-y-2">
                  {chartRows.map((r, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={r.label} onChange={(e) => setChartRows(chartRows.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Label" className="flex-1 p-2 rounded-lg border border-stone-300" />
                      <input value={r.value} onChange={(e) => setChartRows(chartRows.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} placeholder="Value" className="w-24 p-2 rounded-lg border border-stone-300" />
                      <button type="button" onClick={() => setChartRows(chartRows.filter((_, j) => j !== i))} className="p-2 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setChartRows([...chartRows, { label: '', value: '' }])} className="text-[#A25828] font-bold">+ Add row</button>
                </div>
                <div className="p-3 rounded-xl border border-stone-200 bg-[#FAF8F5]">
                  <RichContent
                    content={`:::chart ${chartType} ${chartTitle}${chartUnit ? ` unit=${chartUnit}` : ''}\n${chartRows.filter((r) => r.label).map((r) => `${r.label} | ${r.value}`).join('\n')}\n:::`}
                    onNavigate={() => {}}
                    compact
                  />
                </div>
                <p className="text-[11px] text-stone-500">Have a chart as an image instead? Use the image button in the toolbar to upload it.</p>
                <button
                  type="button"
                  onClick={() => {
                    insertBlock(`:::chart ${chartType} ${chartTitle}${chartUnit ? ` unit=${chartUnit}` : ''}\n${chartRows.filter((r) => r.label).map((r) => `${r.label} | ${r.value}`).join('\n')}\n:::`);
                    setBlockModal(null);
                  }}
                  className="w-full bg-[#A25828] text-white py-2.5 rounded-full font-bold"
                >
                  Insert chart
                </button>
              </>
            )}

            {blockModal === 'carousel' && (
              <>
                <label className="block p-4 rounded-xl border-2 border-dashed border-[#D5C7B7] text-center cursor-pointer hover:border-[#A25828]">
                  {uploading ? 'Uploading & optimising…' : 'Click to upload photos (you can select several)'}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleCarouselUpload} />
                </label>
                <div className="space-y-2">
                  {carouselItems.map((it, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <img src={it.src} alt="" className="w-16 h-12 object-cover rounded-lg" />
                      <input value={it.caption} onChange={(e) => setCarouselItems(carouselItems.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))} placeholder="Caption / alt text" className="flex-1 p-2 rounded-lg border border-stone-300" />
                      <button type="button" onClick={() => setCarouselItems(carouselItems.filter((_, j) => j !== i))} className="p-2 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={carouselItems.length === 0}
                  onClick={() => {
                    insertBlock(`:::carousel\n${carouselItems.map((c) => `${c.src} | ${c.caption || title}`).join('\n')}\n:::`);
                    setCarouselItems([]);
                    setBlockModal(null);
                  }}
                  className="w-full bg-[#A25828] text-white py-2.5 rounded-full font-bold disabled:opacity-40"
                >
                  Insert carousel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ================= INTERNAL LINK SEARCH DRAWER / MODAL ================= */}
      {linkSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setLinkSearchOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 z-10 space-y-4 shadow-2xl border border-[#E8E0D5] animate-fade-in flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 shrink-0">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-[#A25828]" />
                <h3 className="font-serif font-bold text-lg text-[#221C18]">
                  Search &amp; Insert Internal Link
                </h3>
              </div>
              <button onClick={() => setLinkSearchOpen(false)} className="text-stone-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 shrink-0">
              {/* Optional Custom Anchor Text */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Anchor Text (Optional - Defaults to Item Title)
                </label>
                <input
                  type="text"
                  value={linkAnchorText}
                  onChange={(e) => setLinkAnchorText(e.target.value)}
                  placeholder="e.g. Lilly Corner Sofa / Sofa Buying Guide"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#D5C7B7]"
                />
              </div>

              {/* Live Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  autoFocus
                  value={linkQuery}
                  onChange={(e) => setLinkQuery(e.target.value)}
                  placeholder="Search products, categories, or pillar guides..."
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-[#D5C7B7] bg-[#FAF8F5] focus:outline-none focus:border-[#A25828]"
                />
              </div>

              {/* Type Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
                {(['all', 'product', 'category', 'pillar', 'cluster'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setLinkTypeFilter(t)}
                    className={`px-2.5 py-1 rounded-full font-semibold capitalize transition-all cursor-pointer ${
                      linkTypeFilter === t
                        ? 'bg-[#221C18] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto divide-y divide-stone-100 border border-stone-200 rounded-xl pr-1">
              {getSearchableLinkItems().length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-400">
                  No matching links found for &ldquo;{linkQuery}&rdquo;.
                </div>
              ) : (
                getSearchableLinkItems().map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleInsertLink(item)}
                    className="p-3 hover:bg-[#FAF8F5] transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="truncate pr-3">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#FAF5EE] text-[#A25828] border border-[#E8DFC5]">
                          {item.type}
                        </span>
                        <span className="font-bold text-xs text-stone-900 group-hover:text-[#A25828] transition-colors truncate">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400 font-mono block mt-0.5">
                        {item.url} {item.subtitle && `· ${item.subtitle}`}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-[#A25828] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      + Insert Link
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="text-[11px] text-stone-400 text-center shrink-0">
              Clicking an item will format and insert markdown link <code className="text-[#A25828] font-mono">[Title](URL)</code> directly into your article content.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
