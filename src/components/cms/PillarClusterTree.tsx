import React from 'react';
import { BlogPost } from '../../types';
import {
  Layers,
  FileText,
  AlertTriangle,
  Link2,
  ArrowRight,
  ExternalLink,
  Edit2,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
  HelpCircle,
  HelpCircle as FaqIcon,
  Plus,
} from 'lucide-react';

interface PillarClusterTreeProps {
  blogPosts: BlogPost[];
  onEditPost: (post: BlogPost) => void;
  onCreateInPillar: (pillarId: string) => void;
  onPreviewPost: (slug: string) => void;
}

export const PillarClusterTree: React.FC<PillarClusterTreeProps> = ({
  blogPosts,
  onEditPost,
  onCreateInPillar,
  onPreviewPost,
}) => {
  const pillars = blogPosts.filter((b) => b.contentType === 'pillar_page' || b.type === 'pillar');

  // Identify orphan articles:
  // Non-pillar articles that do not have a parentPillarId or pillarSlug matching any existing pillar
  const orphanArticles = blogPosts.filter((b) => {
    if (b.contentType === 'pillar_page' || b.type === 'pillar') return false;
    const hasParent = pillars.some(
      (p) => (b.parentPillarId && p.id === b.parentPillarId) || (b.pillarSlug && p.slug === b.pillarSlug)
    );
    return !hasParent;
  });

  // Articles with 0 internal links
  const zeroLinkArticles = blogPosts.filter(
    (b) => (!b.internalLinks || b.internalLinks.length === 0) && !b.content.includes('/product/') && !b.content.includes('/category/') && !b.content.includes('/blog/')
  );

  const getContentTypeBadge = (type: BlogPost['contentType']) => {
    switch (type) {
      case 'pillar_page':
        return <span className="bg-[#A25828] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Pillar Page</span>;
      case 'cluster_article':
        return <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Cluster Article</span>;
      case 'howto_guide':
        return <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">How-To Guide</span>;
      case 'comparison_article':
        return <span className="bg-purple-100 text-purple-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Comparison</span>;
      case 'faq_resource':
        return <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">FAQ Resource</span>;
      default:
        return <span className="bg-stone-100 text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{type}</span>;
    }
  };

  const getStatusBadge = (status: BlogPost['status']) => {
    switch (status) {
      case 'published':
        return <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Published</span>;
      case 'draft':
        return <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">Draft</span>;
      case 'scheduled':
        return <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Scheduled</span>;
      default:
        return <span className="text-[10px] font-semibold text-stone-500 bg-stone-50 px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Banner */}
      <div className="bg-[#FAF5EE] p-6 rounded-3xl border border-[#E8DFC5] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A25828]">
            <Layers className="w-4 h-4" />
            <span>Topical Authority Silo Map</span>
          </div>
          <h3 className="font-serif font-bold text-xl text-[#221C18]">
            Pillar &amp; Cluster Content Architecture
          </h3>
          <p className="text-xs text-[#6B6159] max-w-2xl leading-relaxed">
            Concentrate SEO topical authority in British furniture searches. Each flagship Pillar Page anchors supporting Cluster Articles, How-To Guides, and Comparisons with structured bidirectional internal links.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-[#D5C7B7] text-center shadow-2xs">
            <span className="block font-serif font-bold text-xl text-[#221C18]">{pillars.length}</span>
            <span className="text-[10px] uppercase font-semibold text-stone-500">Pillars</span>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-[#D5C7B7] text-center shadow-2xs">
            <span className="block font-serif font-bold text-xl text-[#A25828]">
              {blogPosts.length - pillars.length}
            </span>
            <span className="text-[10px] uppercase font-semibold text-stone-500">Clusters</span>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-[#D5C7B7] text-center shadow-2xs">
            <span className="block font-serif font-bold text-xl text-rose-600">
              {orphanArticles.length}
            </span>
            <span className="text-[10px] uppercase font-semibold text-stone-500">Orphans</span>
          </div>
        </div>
      </div>

      {/* Orphan Content Alert (Section 8.C requirement) */}
      {orphanArticles.length > 0 && (
        <div className="bg-rose-50/70 p-6 rounded-3xl border border-rose-200 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-rose-900">
                Orphan Content Identified ({orphanArticles.length} articles without a Pillar)
              </h4>
              <p className="text-xs text-rose-700">
                These articles are not assigned to a parent pillar page. Assigning them to a pillar builds topic clusters and passes internal link equity.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {orphanArticles.map((orphan) => (
              <div
                key={orphan.id}
                className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    {getContentTypeBadge(orphan.contentType)}
                    {getStatusBadge(orphan.status)}
                  </div>
                  <h5 className="font-serif font-bold text-sm text-[#221C18] line-clamp-2">
                    {orphan.title}
                  </h5>
                  <span className="text-[11px] text-stone-400 mt-1 block font-mono">
                    /{orphan.slug}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                    <Link2 className="w-3 h-3" />
                    No Parent Pillar
                  </span>
                  <button
                    onClick={() => onEditPost(orphan)}
                    className="text-xs font-bold text-[#A25828] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Assign Pillar</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 0 Internal Links Warning */}
      {zeroLinkArticles.length > 0 && (
        <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>SEO Link Alert:</strong> {zeroLinkArticles.length} article(s) currently contain 0 internal commercial or pillar links. Use the Internal Linking tool in the editor to boost rankings.
            </span>
          </div>
          <button
            onClick={() => onEditPost(zeroLinkArticles[0])}
            className="font-bold text-[#A25828] hover:underline shrink-0"
          >
            Review First Article &rarr;
          </button>
        </div>
      )}

      {/* Active Pillars & Nested Clusters Tree */}
      <div className="space-y-6">
        <h4 className="font-serif font-bold text-lg text-[#221C18] flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#A25828]" />
          <span>Active Furniture Topic Clusters</span>
        </h4>

        {pillars.map((pillar) => {
          // Find all cluster children connected to this pillar
          const children = blogPosts.filter(
            (b) =>
              b.id !== pillar.id &&
              ((b.parentPillarId && b.parentPillarId === pillar.id) ||
                (b.pillarSlug && b.pillarSlug === pillar.slug))
          );

          return (
            <div
              key={pillar.id}
              className="bg-white rounded-3xl border border-[#E8E0D5] overflow-hidden shadow-xs"
            >
              {/* Pillar Header Card */}
              <div className="p-6 bg-[#FAF8F5] border-b border-[#E8E0D5] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-[#E8E0D5] overflow-hidden shrink-0">
                    <img
                      src={pillar.coverImage}
                      alt={pillar.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-[#A25828] text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md">
                        Flagship Pillar
                      </span>
                      <span className="text-xs font-semibold text-[#8A786A] bg-white border border-[#E8E0D5] px-2 py-0.5 rounded-full">
                        Category: {pillar.category}
                      </span>
                      {getStatusBadge(pillar.status)}
                    </div>
                    <h3 className="font-serif font-bold text-xl text-[#221C18]">
                      {pillar.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-stone-500">
                      <span>Slug: <code className="text-[#A25828] font-mono">/blog/{pillar.slug}</code></span>
                      <span>·</span>
                      <span>By {pillar.author} ({pillar.authorRole || 'Author'})</span>
                      <span>·</span>
                      <span>{children.length} Cluster Articles Assigned</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onCreateInPillar(pillar.id)}
                    className="inline-flex items-center gap-1.5 bg-white border border-[#D5C7B7] hover:border-black text-stone-800 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
                    title="Add a new cluster article to this pillar"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#A25828]" />
                    <span>Add Cluster Article</span>
                  </button>
                  <button
                    onClick={() => onEditPost(pillar)}
                    className="inline-flex items-center gap-1 bg-white border border-[#D5C7B7] hover:border-black text-stone-800 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-stone-600" />
                    <span>Edit Pillar</span>
                  </button>
                  <button
                    onClick={() => onPreviewPost(pillar.slug)}
                    className="inline-flex items-center gap-1 bg-[#A25828] hover:bg-[#8A461A] text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Live Page</span>
                  </button>
                </div>
              </div>

              {/* Cluster Children List */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8A786A]">
                    Nested Supporting Cluster Articles ({children.length})
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Topical sub-queries linking back to {pillar.title}
                  </span>
                </div>

                {children.length === 0 ? (
                  <div className="p-8 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-[#D5C7B7] space-y-2">
                    <p className="text-xs text-stone-500">
                      No cluster articles have been assigned to this pillar page yet.
                    </p>
                    <button
                      onClick={() => onCreateInPillar(pillar.id)}
                      className="text-xs font-bold text-[#A25828] hover:underline cursor-pointer"
                    >
                      + Create the first cluster article for this pillar
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {children.map((child) => {
                      const linkCount = child.internalLinks?.length || 0;
                      return (
                        <div
                          key={child.id}
                          className="p-4 rounded-2xl border border-[#E8E0D5] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5] hover:border-[#D5C7B7] transition-all flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              {getContentTypeBadge(child.contentType)}
                              <div className="flex items-center gap-1.5">
                                {getStatusBadge(child.status)}
                                <span className="text-[10px] text-stone-400">
                                  {child.readTime}
                                </span>
                              </div>
                            </div>

                            <h4 className="font-serif font-bold text-sm text-[#221C18] line-clamp-2">
                              {child.title}
                            </h4>

                            <p className="text-xs text-[#6B6159] mt-1 line-clamp-2 leading-relaxed">
                              {child.excerpt}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-stone-500">
                              <span className="flex items-center gap-1 font-mono text-[11px]">
                                <Link2 className="w-3 h-3 text-[#A25828]" />
                                {linkCount} Internal Link{linkCount !== 1 ? 's' : ''}
                              </span>
                              {child.relatedProductIds && child.relatedProductIds.length > 0 && (
                                <span className="text-[11px] text-stone-400">
                                  · {child.relatedProductIds.length} Products
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onEditPost(child)}
                                className="font-semibold text-stone-700 hover:text-black hover:underline cursor-pointer"
                              >
                                Edit
                              </button>
                              <span className="text-stone-300">·</span>
                              <button
                                onClick={() => onPreviewPost(child.slug)}
                                className="font-bold text-[#A25828] hover:underline cursor-pointer"
                              >
                                View &rarr;
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
