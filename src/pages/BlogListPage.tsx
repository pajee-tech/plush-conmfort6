import { srcSetFor } from '../utils/responsiveImage';
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BlogPost, ContentType } from '../types';
import {
  ArrowRight,
  BookOpen,
  Clock,
  Calendar,
  Search,
  Filter,
  Layers,
  Sparkles,
} from 'lucide-react';

export const BlogListPage: React.FC = () => {
  const { blogPosts, setRoute } = useStore();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeType, setActiveType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Only display published articles (not drafts or future scheduled items)
  const publishedPosts = blogPosts.filter((b) => b.isPublished && b.status === 'published');

  // Filtered list
  const filteredPosts = publishedPosts.filter((post) => {
    if (activeCategory !== 'all' && post.category !== activeCategory) return false;
    if (activeType !== 'all' && post.contentType !== activeType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(q);
      const matchExcerpt = post.excerpt.toLowerCase().includes(q);
      const matchTags = post.tags?.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchExcerpt || matchTags;
    }
    return true;
  });

  const pillarGuides = filteredPosts.filter(
    (b) => b.contentType === 'pillar_page' || b.type === 'pillar'
  );
  const clusterArticles = filteredPosts.filter(
    (b) => b.contentType !== 'pillar_page' && b.type !== 'pillar'
  );

  const getContentTypeBadge = (type: BlogPost['contentType']) => {
    switch (type) {
      case 'pillar_page':
        return <span className="bg-[#A25828] text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md tracking-wider">Pillar Guide</span>;
      case 'howto_guide':
        return <span className="bg-blue-100 text-blue-900 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md">How-To Guide</span>;
      case 'comparison_article':
        return <span className="bg-purple-100 text-purple-900 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md">Comparison</span>;
      case 'faq_resource':
        return <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md">Buying FAQs</span>;
      default:
        return <span className="bg-[#FAF5EE] text-[#A25828] text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md border border-[#E8DFC5]">Guide</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#A25828]">
            <BookOpen className="w-4 h-4" />
            <span>British Furniture Journal &amp; Guides</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#221C18]">
            The Plush Comfort Living Journal
          </h1>
          <p className="text-sm sm:text-base text-[#6B6159] leading-relaxed">
            Sofa and bed buying guides, UK size charts, fabric comparisons and care advice from the Plush Comfort team.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-3xl border border-[#E8E0D5] mb-12 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides (e.g. velvet, sizing, gas lift)..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-2xl border border-[#D5C7B7] bg-[#FAF8F5] focus:outline-none focus:border-[#A25828]"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto text-xs">
            {[
              { id: 'all', label: 'All Journal Guides' },
              { id: 'Sofas', label: 'Sofas & Seating' },
              { id: 'Beds', label: 'Beds & Storage' },
              { id: 'Care & Maintenance', label: 'Care & Cleaning' },
              { id: 'Buying Resources', label: 'Resources & FAQs' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#221C18] text-white shadow-2xs'
                    : 'bg-[#FAF8F5] text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. PILLAR BUYING GUIDES (FLAGSHIP GUIDES) */}
        {pillarGuides.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-[#A25828]" />
              <h2 className="font-serif text-2xl font-bold text-[#221C18]">
                Flagship Pillar Buying Guides ({pillarGuides.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pillarGuides.map((pillar) => (
                <div
                  key={pillar.id}
                  onClick={() => setRoute({ name: 'blog-detail', slug: pillar.slug })}
                  className="group bg-white rounded-3xl border border-[#E8E0D5] hover:border-[#D5C7B7] overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:shadow-xl"
                >
                  <div className="aspect-[16/9] bg-[#F5EFE6] overflow-hidden flex items-center justify-center relative">
                    <img
                      src={pillar.coverImage}
                      srcSet={srcSetFor(pillar.coverImage)}
                      sizes="(max-width: 768px) 92vw, 600px"
                      loading="lazy"
                      alt={pillar.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-4 left-4 bg-[#A25828] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-md tracking-wider shadow-xs">
                      Flagship Pillar
                    </span>
                    <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-xs text-[#221C18] text-[10px] font-bold uppercase px-2.5 py-1 rounded-md">
                      {pillar.category}
                    </span>
                  </div>

                  <div className="p-8 flex flex-col flex-1 justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-[#8A786A] font-medium">
                        <span>{pillar.publishDate}</span>
                        <span aria-hidden="true">·</span>
                        <span>{pillar.readTime}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#A25828] font-bold">{pillar.author}</span>
                      </div>

                      <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#221C18] group-hover:text-[#A25828] transition-colors leading-snug">
                        {pillar.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#665B53] line-clamp-3 leading-relaxed">
                        {pillar.excerpt}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-2 text-xs font-bold text-[#A25828] group-hover:gap-3 transition-all">
                      <span>Read Comprehensive Guide</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2. SUPPORTING CLUSTER ARTICLES & HOW-TO GUIDES */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-[#221C18]">
              Supporting Articles &amp; Practical Advice ({clusterArticles.length})
            </h2>
            <span className="text-xs text-stone-500">
              Filtered by topic &amp; category
            </span>
          </div>

          {clusterArticles.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-[#E8E0D5] max-w-lg mx-auto space-y-3">
              <h3 className="font-serif font-bold text-xl text-[#221C18]">No Articles Found</h3>
              <p className="text-xs text-stone-500">
                No articles match &ldquo;{searchQuery}&rdquo;. Try clearing your search query or selecting All Guides.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="bg-[#A25828] text-white px-5 py-2 rounded-full text-xs font-bold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {clusterArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setRoute({ name: 'blog-detail', slug: article.slug })}
                  className="group bg-white rounded-2xl border border-[#E8E0D5] hover:border-[#D5C7B7] overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:shadow-md"
                >
                  <div className="aspect-[16/10] bg-[#FAF7F2] overflow-hidden relative">
                    <img
                      src={article.coverImage}
                      srcSet={srcSetFor(article.coverImage)}
                      sizes="(max-width: 768px) 92vw, 400px"
                      loading="lazy"
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      {getContentTypeBadge(article.contentType)}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1 justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-[#8A786A]">
                        <span>{article.publishDate}</span>
                        <span>·</span>
                        <span>{article.readTime}</span>
                        <span>·</span>
                        <span className="text-[#A25828] font-medium">{article.category}</span>
                      </div>

                      <h3 className="font-serif font-bold text-base text-[#221C18] group-hover:text-[#A25828] transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-stone-400 font-medium">By {article.author}</span>
                      <span className="font-bold text-[#A25828] flex items-center gap-1 group-hover:gap-1.5 transition-all">
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
