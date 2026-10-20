import React, { useState } from 'react';
import { BlogPost, ContentType, ContentStatus, Product, Category } from '../../types';
import { ContentEditor } from './ContentEditor';
import { PillarClusterTree } from './PillarClusterTree';
import { SitemapModal } from './SitemapModal';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Layers,
  AlertTriangle,
  FileCode2,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Globe,
  Sparkles,
  Link2,
} from 'lucide-react';

interface CmsDashboardProps {
  blogPosts: BlogPost[];
  products: Product[];
  categories: Category[];
  onAddPost: (post: Omit<BlogPost, 'id'>) => BlogPost;
  onUpdatePost: (post: BlogPost) => void;
  onDeletePost: (id: string) => void;
  onDuplicatePost: (id: string) => BlogPost;
  onToggleStatus: (id: string) => void;
  onNavigateToPost: (slug: string) => void;
}

export const CmsDashboard: React.FC<CmsDashboardProps> = ({
  blogPosts,
  products,
  categories,
  onAddPost,
  onUpdatePost,
  onDeletePost,
  onDuplicatePost,
  onToggleStatus,
  onNavigateToPost,
}) => {
  // Navigation / View state
  const [subView, setSubView] = useState<'table' | 'silo_tree' | 'seo_audit'>('table');
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [initialPillarForNew, setInitialPillarForNew] = useState<string | undefined>(undefined);
  const [sitemapModalOpen, setSitemapModalOpen] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ContentType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ContentStatus>('all');

  const pillars = blogPosts.filter((b) => b.contentType === 'pillar_page' || b.type === 'pillar');

  // Filtered Posts
  const filteredPosts = blogPosts.filter((post) => {
    if (typeFilter !== 'all' && post.contentType !== typeFilter) return false;
    if (categoryFilter !== 'all' && post.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && post.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchSlug = post.slug.toLowerCase().includes(q);
      const matchAuthor = post.author.toLowerCase().includes(q);
      return matchTitle || matchSlug || matchAuthor;
    }
    return true;
  });

  // Metrics
  const publishedCount = blogPosts.filter((b) => b.status === 'published').length;
  const draftCount = blogPosts.filter((b) => b.status === 'draft').length;
  const scheduledCount = blogPosts.filter((b) => b.status === 'scheduled').length;
  const orphanCount = blogPosts.filter(
    (b) =>
      b.contentType !== 'pillar_page' &&
      !pillars.some(
        (p) => (b.parentPillarId && p.id === b.parentPillarId) || (b.pillarSlug && p.slug === b.pillarSlug)
      )
  ).length;

  const missingMetaCount = blogPosts.filter((b) => !b.seoDescription || b.seoDescription.length < 30).length;

  // Handlers
  const handleStartCreate = (pillarId?: string) => {
    setEditingPost(null);
    setInitialPillarForNew(pillarId);
    setIsEditing(true);
  };

  const handleStartEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsEditing(true);
  };

  const handleSavePost = (data: Omit<BlogPost, 'id'> | BlogPost) => {
    if ('id' in data) {
      onUpdatePost(data as BlogPost);
    } else {
      onAddPost(data);
    }
    setIsEditing(false);
    setEditingPost(null);
  };

  const getContentTypeLabel = (type: ContentType) => {
    switch (type) {
      case 'pillar_page':
        return 'Pillar Page';
      case 'cluster_article':
        return 'Cluster Article';
      case 'howto_guide':
        return 'How-To Guide';
      case 'comparison_article':
        return 'Comparison & Advice';
      case 'faq_resource':
        return 'Buying FAQs';
      case 'buying_guide':
        return 'Buying Guide';
      default:
        return 'Blog Post';
    }
  };

  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Published</span>
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
            <span>Draft</span>
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Scheduled</span>
          </span>
        );
      default:
        return <span className="text-[11px] text-stone-500">{status}</span>;
    }
  };

  // If in editor mode, display the full Content Editor
  if (isEditing) {
    return (
      <ContentEditor
        post={editingPost}
        pillars={pillars}
        allPosts={blogPosts}
        products={products}
        categories={categories}
        initialPillarId={initialPillarForNew}
        onSave={handleSavePost}
        onCancel={() => {
          setIsEditing(false);
          setEditingPost(null);
        }}
        onDelete={(id) => {
          onDeletePost(id);
          setIsEditing(false);
          setEditingPost(null);
        }}
        onPreview={onNavigateToPost}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* CMS Top Header & Quick Actions */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E0D5] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A25828] mb-1">
            <FileText className="w-4 h-4" />
            <span>Plush Comfort Content Engine</span>
          </div>
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#221C18]">
            Content Management System (CMS)
          </h2>
          <p className="text-xs text-[#8A786A] mt-1 max-w-2xl leading-relaxed">
            Create, format, publish, and organise SEO buying guides, pillar pages, cluster articles, and internal linking without editing code. All changes update public routes immediately.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => setSitemapModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-[#FAF8F5] border border-[#D5C7B7] hover:border-black text-stone-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Inspect XML Sitemap for Google Search Console"
          >
            <FileCode2 className="w-4 h-4 text-[#A25828]" />
            <span>XML Sitemap</span>
          </button>

          <button
            onClick={() => handleStartCreate()}
            className="inline-flex items-center gap-1.5 bg-[#A25828] hover:bg-[#8A461A] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Article or Guide</span>
          </button>
        </div>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#E8E0D5] shadow-2xs">
          <span className="text-xs font-semibold text-stone-500 block">Published Live</span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700 mt-1">
            {publishedCount}
          </div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Publicly indexable</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E8E0D5] shadow-2xs">
          <span className="text-xs font-semibold text-stone-500 block">Draft Articles</span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-stone-800 mt-1">
            {draftCount}
          </div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Unpublished drafts</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E8E0D5] shadow-2xs">
          <span className="text-xs font-semibold text-stone-500 block">Flagship Pillars</span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#A25828] mt-1">
            {pillars.length}
          </div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Anchor guide pages</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E8E0D5] shadow-2xs">
          <span className="text-xs font-semibold text-stone-500 block">Cluster Articles</span>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-[#221C18] mt-1">
            {blogPosts.length - pillars.length}
          </div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Supporting queries</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#E8E0D5] shadow-2xs">
          <span className="text-xs font-semibold text-stone-500 block">Orphan Content</span>
          <div className={`text-2xl sm:text-3xl font-serif font-bold mt-1 ${orphanCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {orphanCount}
          </div>
          <span className="text-[11px] text-stone-400 mt-0.5 block">Missing parent pillar</span>
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-[#E8E0D5] flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSubView('table')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subView === 'table'
                ? 'bg-[#221C18] text-white shadow-xs'
                : 'text-stone-600 hover:text-black hover:bg-stone-100'
            }`}
          >
            All Content Records ({blogPosts.length})
          </button>
          <button
            onClick={() => setSubView('silo_tree')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subView === 'silo_tree'
                ? 'bg-[#221C18] text-white shadow-xs'
                : 'text-stone-600 hover:text-black hover:bg-stone-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pillar &amp; Cluster Silo Map</span>
            {orphanCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 ml-1" />
            )}
          </button>
          <button
            onClick={() => setSubView('seo_audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subView === 'seo_audit'
                ? 'bg-[#221C18] text-white shadow-xs'
                : 'text-stone-600 hover:text-black hover:bg-stone-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>SEO Health Audit</span>
            {missingMetaCount > 0 && (
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {missingMetaCount}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={() => onNavigateToPost('uk-sofa-buying-guide')}
          className="text-xs font-semibold text-[#A25828] hover:underline flex items-center gap-1 px-3 py-1.5 cursor-pointer"
        >
          <span>View Public Storefront Journal &rarr;</span>
        </button>
      </div>

      {/* SUB-VIEW 1: TABLE VIEW */}
      {subView === 'table' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8E0D5] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, slug, or author..."
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-[#D5C7B7] bg-[#FAF8F5] focus:outline-none focus:border-[#A25828]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-xs">
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-[#D5C7B7] bg-white text-stone-700 cursor-pointer font-medium"
              >
                <option value="all">All Content Types</option>
                <option value="pillar_page">Flagship Pillars</option>
                <option value="cluster_article">Cluster Articles</option>
                <option value="howto_guide">How-To Guides</option>
                <option value="comparison_article">Comparisons</option>
                <option value="faq_resource">Buying FAQs</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#D5C7B7] bg-white text-stone-700 cursor-pointer font-medium"
              >
                <option value="all">All Categories</option>
                <option value="Sofas">Sofas</option>
                <option value="Beds">Beds</option>
                <option value="Care & Maintenance">Care &amp; Maintenance</option>
                <option value="Interior Advice">Interior Advice</option>
                <option value="Buying Resources">Buying Resources</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-[#D5C7B7] bg-white text-stone-700 cursor-pointer font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>

          {/* Articles Table */}
          <div className="bg-white rounded-3xl border border-[#E8E0D5] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#E8E0D5] text-[#8A786A] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-6">Article Title &amp; Slug</th>
                    <th className="py-3.5 px-4">Type &amp; Category</th>
                    <th className="py-3.5 px-4">Parent Pillar</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Internal Links</th>
                    <th className="py-3.5 px-4">Last Updated</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEAE2]">
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400">
                        No articles match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => {
                      const parent = pillars.find((p) => p.id === post.parentPillarId || p.slug === post.pillarSlug);
                      const isPillar = post.contentType === 'pillar_page' || post.type === 'pillar';
                      const linkCount = post.internalLinks?.length || 0;

                      return (
                        <tr key={post.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          {/* Title & Slug */}
                          <td className="py-4 px-6 max-w-xs">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#FAF5EE] border border-[#E8E0D5] overflow-hidden shrink-0">
                                <img
                                  src={post.coverImage}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="truncate">
                                <h4
                                  onClick={() => handleStartEdit(post)}
                                  className="font-serif font-bold text-sm text-[#221C18] truncate hover:text-[#A25828] cursor-pointer"
                                >
                                  {post.title}
                                </h4>
                                <span className="text-[11px] text-stone-400 font-mono block truncate">
                                  /blog/{post.slug}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Type & Category */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="block font-semibold text-stone-800">
                              {getContentTypeLabel(post.contentType)}
                            </span>
                            <span className="text-[11px] text-[#A25828] font-medium">
                              {post.category}
                            </span>
                          </td>

                          {/* Parent Pillar */}
                          <td className="py-4 px-4 max-w-[160px] truncate">
                            {isPillar ? (
                              <span className="text-[10px] font-bold uppercase bg-[#FAF5EE] text-[#A25828] px-2 py-0.5 rounded border border-[#E8DFC5]">
                                Root Pillar
                              </span>
                            ) : parent ? (
                              <span className="font-semibold text-stone-700 truncate block text-[11px]" title={parent.title}>
                                {parent.title}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                Orphan (None)
                              </span>
                            )}
                          </td>

                          {/* Status Toggle */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <button
                              onClick={() => onToggleStatus(post.id)}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              title="Click to toggle published / draft status"
                            >
                              {getStatusBadge(post.status)}
                            </button>
                          </td>

                          {/* Internal Links Count */}
                          <td className="py-4 px-4 whitespace-nowrap font-mono text-stone-600">
                            <span className={`inline-flex items-center gap-1 ${linkCount === 0 ? 'text-amber-600 font-bold' : ''}`}>
                              <Link2 className="w-3 h-3 text-[#A25828]" />
                              {linkCount} link{linkCount !== 1 ? 's' : ''}
                            </span>
                          </td>

                          {/* Last Updated */}
                          <td className="py-4 px-4 whitespace-nowrap text-stone-400 text-[11px]">
                            {post.lastUpdated || post.publishDate}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleStartEdit(post)}
                                className="p-1.5 text-stone-500 hover:text-black hover:bg-stone-100 rounded-lg cursor-pointer"
                                title="Edit Content"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onNavigateToPost(post.slug)}
                                className="p-1.5 text-stone-500 hover:text-[#A25828] hover:bg-stone-100 rounded-lg cursor-pointer"
                                title="Preview Public Page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDuplicatePost(post.id)}
                                className="p-1.5 text-stone-500 hover:text-black hover:bg-stone-100 rounded-lg cursor-pointer"
                                title="Duplicate as Draft"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete "${post.title}"?`)) {
                                    onDeletePost(post.id);
                                  }
                                }}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="Delete Article"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: SILO MAP */}
      {subView === 'silo_tree' && (
        <PillarClusterTree
          blogPosts={blogPosts}
          onEditPost={handleStartEdit}
          onCreateInPillar={(pillarId) => handleStartCreate(pillarId)}
          onPreviewPost={onNavigateToPost}
        />
      )}

      {/* SUB-VIEW 3: SEO HEALTH AUDIT */}
      {subView === 'seo_audit' && (
        <div className="bg-white p-8 rounded-3xl border border-[#E8E0D5] space-y-6">
          <div>
            <h3 className="font-serif font-bold text-xl text-[#221C18]">
              Content Health &amp; On-Page SEO Audit
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Automated diagnostics identifying articles needing meta descriptions, internal links, or pillar associations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Meta Description Diagnostic */}
            <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E8E0D5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase text-stone-700">Meta Descriptions</span>
                <span className="text-xs font-bold text-emerald-700">
                  {blogPosts.length - missingMetaCount} / {blogPosts.length} Passed
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Google requires unique 120–160 character meta descriptions to achieve optimal click-through rates.
              </p>
              {missingMetaCount > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-stone-200">
                  {blogPosts
                    .filter((b) => !b.seoDescription || b.seoDescription.length < 30)
                    .map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <span className="truncate pr-2 text-stone-800">{item.title}</span>
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="text-[#A25828] font-bold shrink-0 hover:underline"
                        >
                          Fix &rarr;
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Internal Links Diagnostic */}
            <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E8E0D5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase text-stone-700">Internal Link Depth</span>
                <span className="text-xs font-bold text-emerald-700">
                  {blogPosts.filter((b) => (b.internalLinks?.length || 0) > 0).length} / {blogPosts.length} Linked
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Articles with at least 2 internal links pass link authority between product lines and buying pillars.
              </p>
              <div className="space-y-1.5 pt-2 border-t border-stone-200">
                {blogPosts
                  .filter((b) => !b.internalLinks || b.internalLinks.length === 0)
                  .map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <span className="truncate pr-2 text-stone-800">{item.title}</span>
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="text-[#A25828] font-bold shrink-0 hover:underline"
                      >
                        Add Links &rarr;
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Pillar Silo Integrity */}
            <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E8E0D5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase text-stone-700">Topical Silo Integrity</span>
                <span className={`text-xs font-bold ${orphanCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {orphanCount === 0 ? '100% Clustered' : `${orphanCount} Orphans`}
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Every cluster article should link back to its parent pillar to establish topical authority for UK furniture search queries.
              </p>
              {orphanCount > 0 ? (
                <button
                  onClick={() => setSubView('silo_tree')}
                  className="w-full bg-rose-50 text-rose-700 border border-rose-200 py-2 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  View Orphan Content Map &rarr;
                </button>
              ) : (
                <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 pt-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All supporting articles properly nested under pillars</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* XML Sitemap Modal */}
      <SitemapModal
        isOpen={sitemapModalOpen}
        onClose={() => setSitemapModalOpen(false)}
        blogPosts={blogPosts}
        products={products}
        categories={categories}
      />
    </div>
  );
};
