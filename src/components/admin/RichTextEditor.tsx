import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Eye,
  Code,
  Search,
  X,
  ExternalLink,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write content here...',
  rows = 6,
  label,
}) => {
  const { products, categories, blogPosts } = useStore();
  const [isPreview, setIsPreview] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkSearch, setLinkSearch] = useState('');
  const [customAnchorText, setCustomAnchorText] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTextAtCursor = (before: string, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || 'text';
    const replacement = `${before}${selectedText}${after}`;

    const newValue =
      textarea.value.substring(0, start) +
      replacement +
      textarea.value.substring(end);

    onChange(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 50);
  };

  const handleInsertLink = (title: string, url: string) => {
    const anchor = customAnchorText.trim() || title;
    const markdownLink = `[${anchor}](${url})`;

    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        textarea.value.substring(0, start) +
        markdownLink +
        textarea.value.substring(end);
      onChange(newValue);
    } else {
      onChange(value ? `${value} ${markdownLink}` : markdownLink);
    }

    setIsLinkModalOpen(false);
    setCustomAnchorText('');
    setCustomUrl('');
    setLinkSearch('');
  };

  // Compile internal link targets
  const internalLinkTargets = [
    // Static Pages
    { type: 'Page', title: 'Home Page', url: '/' },
    { type: 'Page', title: 'Shop All Collections', url: '/shop' },
    { type: 'Page', title: 'UK Delivery & White Glove', url: '/delivery' },
    { type: 'Page', title: '30-Day Comfort Returns', url: '/returns' },
    { type: 'Page', title: 'Contact Customer Care', url: '/contact' },
    { type: 'Page', title: 'About Plush Comfort', url: '/about' },
    { type: 'Page', title: 'Frequently Asked Questions', url: '/faqs' },
    // Categories
    ...categories.map((c) => ({
      type: 'Category',
      title: `${c.name} Collection`,
      url: `/category/${c.slug}`,
    })),
    // Products
    ...products.map((p) => ({
      type: 'Product',
      title: p.name,
      url: `/product/${p.slug}`,
    })),
    // Blog guides
    ...blogPosts.map((b) => ({
      type: 'Buying Guide',
      title: b.title,
      url: `/blog/${b.slug}`,
    })),
  ].filter((item) => {
    if (!linkSearch) return true;
    const q = linkSearch.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.url.toLowerCase().includes(q);
  });

  // Render markdown preview
  const renderPreviewHtml = (text: string) => {
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Headings
    formatted = formatted.replace(/^### (.*$)/gim, '<h3 class="text-base font-serif font-bold text-[#221C18] mt-3 mb-1">$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gim, '<h2 class="text-lg font-serif font-bold text-[#221C18] mt-4 mb-2">$1</h2>');

    // Bold & Italic
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Blockquote
    formatted = formatted.replace(/^\> (.*$)/gim, '<blockquote class="border-l-2 border-[#A25828] pl-3 py-1 my-2 italic text-stone-600 bg-stone-50 rounded-r">$1</blockquote>');

    // Links [text](url)
    formatted = formatted.replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" class="text-[#A25828] font-semibold underline hover:text-[#8A461A]" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Bullet points
    formatted = formatted.replace(/^- (.*$)/gim, '<li class="list-disc ml-5 my-0.5">$1</li>');

    // Paragraphs
    formatted = formatted.replace(/\n\n/g, '<p class="my-2"></p>');

    return { __html: formatted };
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold text-stone-700">{label}</label>}

      <div className="border border-[#D5C7B7] rounded-2xl bg-white overflow-hidden shadow-xs focus-within:border-[#A25828] transition-colors">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-1 px-3 py-2 bg-[#FAF8F5] border-b border-[#E8E0D5]">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => insertTextAtCursor('## ', '')}
              title="Heading 2"
              className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor('### ', '')}
              title="Heading 3"
              className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-stone-300 mx-1" />
            <button
              type="button"
              onClick={() => insertTextAtCursor('**', '**')}
              title="Bold"
              className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor('*', '*')}
              title="Italic"
              className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor('> ', '')}
              title="Quote"
              className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-stone-300 mx-1" />
            <button
              type="button"
              onClick={() => insertTextAtCursor('- ', '')}
              title="Bullet List"
              className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertTextAtCursor('1. ', '')}
              title="Numbered List"
              className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition-colors cursor-pointer"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-stone-300 mx-1" />
            <button
              type="button"
              onClick={() => {
                const textarea = textareaRef.current;
                if (textarea) {
                  const sel = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
                  if (sel) setCustomAnchorText(sel);
                }
                setIsLinkModalOpen(true);
              }}
              title="Insert Internal Link"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FAF2EB] text-[#A25828] border border-[#EEDFD0] hover:bg-[#F5E6D8] text-xs font-semibold transition-colors cursor-pointer"
            >
              <LinkIcon className="w-3 h-3" />
              <span>Link</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isPreview
                ? 'bg-[#A25828] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-200 hover:text-stone-900'
            }`}
          >
            {isPreview ? (
              <>
                <Code className="w-3 h-3" />
                <span>Editor</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </>
            )}
          </button>
        </div>

        {/* Content Area */}
        {isPreview ? (
          <div
            className="p-4 text-xs text-stone-700 bg-white min-h-[140px] max-h-[300px] overflow-y-auto leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={renderPreviewHtml(value || '*No content entered.*')}
          />
        ) : (
          <textarea
            ref={textareaRef}
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full text-xs p-3 text-[#221C18] font-sans leading-relaxed outline-hidden resize-y"
          />
        )}
      </div>

      {/* Internal Link Search & Insertion Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsLinkModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 z-10 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FAF2EB] text-[#A25828] flex items-center justify-center">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#221C18]">Insert Internal Link</h3>
                  <p className="text-[11px] text-stone-500">Connect to products, categories, or buying guides</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom text input */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Anchor Text (Display)</label>
                <input
                  type="text"
                  placeholder="e.g. Handcrafted Sofas"
                  value={customAnchorText}
                  onChange={(e) => setCustomAnchorText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Custom Destination URL</label>
                <input
                  type="text"
                  placeholder="e.g. /category/sofas"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300"
                />
              </div>
            </div>

            {customUrl && (
              <button
                type="button"
                onClick={() => handleInsertLink(customAnchorText || customUrl, customUrl)}
                className="w-full bg-[#A25828] text-white py-2 rounded-xl text-xs font-semibold hover:bg-[#8A461A] transition-colors"
              >
                Insert Custom Link &rarr;
              </button>
            )}

            {/* Search list of existing site items */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <label className="block text-xs font-semibold text-stone-700">Or Select Existing Store Page:</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search products, collections, guides..."
                  value={linkSearch}
                  onChange={(e) => setLinkSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-stone-200 bg-[#FAF8F5]"
                />
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1 divide-y divide-stone-100 pr-1">
                {internalLinkTargets.slice(0, 15).map((target, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInsertLink(target.title, target.url)}
                    className="w-full text-left p-2 rounded-xl hover:bg-[#FAF2EB] transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="truncate pr-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A25828] block">
                        {target.type}
                      </span>
                      <span className="text-xs font-medium text-stone-800 group-hover:text-[#A25828] truncate block">
                        {target.title}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">{target.url}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#A25828] shrink-0" />
                  </button>
                ))}
                {internalLinkTargets.length === 0 && (
                  <p className="text-xs text-stone-400 text-center py-4">No matching pages found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
