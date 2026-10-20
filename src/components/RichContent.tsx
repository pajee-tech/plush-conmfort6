import React, { useState } from 'react';
import { Product } from '../types';
import { srcSetFor, thumbFor } from '../utils/responsiveImage';
import { ChevronLeft, ChevronRight, Lightbulb, CheckCircle2, ArrowRight, ChevronDown, Quote, Star } from 'lucide-react';

/**
 * Plush Comfort rich content format (used by blogs, guides and pillar pages)
 * ------------------------------------------------------------------------
 * Normal Markdown:  # H1, ## H2, ### H3, **bold**, *italic*, [link](/url), - bullets, 1. numbers,
 *                   > quote, --- divider, | tables |, ![alt text](/uploads/image.webp "Optional caption")
 *
 * Custom blocks (insert them with the toolbar in Dashboard → Blogs & Guides):
 *   :::tip Expert tip            :::takeaways              :::steps
 *   Text of the tip              - Point one               Title | Description
 *   :::                          :::                       :::
 *
 *   :::carousel                  :::chart bar Sofa widths (cm)     (bar | line | pie)
 *   /uploads/a.webp | Caption    2 Seater | 160
 *   /uploads/b.webp | Caption    3 Seater | 210
 *   :::                          :::
 *
 *   :::cta Ready to choose? | Shop Sofas | /category/sofas
 *   Short supporting text
 *   :::
 *
 *   :::products prod-216, prod-124     :::checklist Delivery checklist     :::faq
 *   :::                                - Measure the door                 Q: Question?
 *                                      :::                                A: Answer.
 *                                                                         :::
 *   :::timeline
 *   2 weeks before | Measure rooms; Choose fabric
 *   :::
 */

export interface HeadingItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*_`[\]()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Collect H2 / H3 headings (outside custom blocks) for the "On this page" table of contents. */
export function extractHeadings(content: string): HeadingItem[] {
  const out: HeadingItem[] = [];
  let inBlock = false;
  for (const raw of (content || '').split('\n')) {
    const line = raw.trim();
    if (line.startsWith(':::')) {
      inBlock = line.length > 3 ? true : false;
      if (line === ':::') inBlock = false;
      continue;
    }
    if (inBlock) continue;
    if (line.startsWith('## ')) out.push({ id: slugifyHeading(line.slice(3)), text: line.slice(3).replace(/\*\*/g, ''), level: 2 });
    else if (line.startsWith('### ')) out.push({ id: slugifyHeading(line.slice(4)), text: line.slice(4).replace(/\*\*/g, ''), level: 3 });
  }
  return out;
}

/** Collect FAQ pairs from :::faq blocks (used for FAQPage schema). */
export function extractFaqs(content: string): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];
  const re = /:::faq\s*\n([\s\S]*?)\n:::/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content || ''))) {
    let q = '';
    for (const line of m[1].split('\n')) {
      const t = line.trim();
      if (/^Q:/i.test(t)) q = t.replace(/^Q:\s*/i, '');
      else if (/^A:/i.test(t) && q) {
        faqs.push({ question: q, answer: t.replace(/^A:\s*/i, '') });
        q = '';
      }
    }
  }
  return faqs;
}

interface RichContentProps {
  content: string;
  onNavigate: (url: string) => void;
  products?: Product[];
  /** Show "Chapter 01" labels above each H2 (pillar pages) */
  chapterNumbers?: boolean;
  /** Smaller typography for the editor preview */
  compact?: boolean;
}

const BRAND_COLOURS = ['#A25828', '#D19A6A', '#6B5B4E', '#C9B79C', '#8A461A', '#E5D3BF'];

const Carousel: React.FC<{ items: Array<{ src: string; caption: string }> }> = ({ items }) => {
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;
  const go = (d: number) => setIndex((i) => (i + d + items.length) % items.length);
  return (
    <figure className="not-prose my-8">
      <div className="relative rounded-2xl overflow-hidden bg-[#F3EEE7] aspect-[16/10] border border-[#E8E0D5]">
        {items.map((it, i) => (
          <img
            key={it.src + i}
            src={it.src}
            srcSet={srcSetFor(it.src)}
            sizes="(max-width: 768px) 92vw, 760px"
            alt={it.caption}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-[#221C18]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-[#221C18]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show image ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/60'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {items[index]?.caption && (
        <figcaption className="text-xs text-[#8A786A] italic mt-2 text-center">{items[index].caption}</figcaption>
      )}
    </figure>
  );
};

const Chart: React.FC<{ type: string; title: string; rows: Array<{ label: string; value: number }>; unit?: string }> = ({
  type,
  title,
  rows,
  unit = '',
}) => {
  if (rows.length === 0) return null;
  const max = Math.max(...rows.map((r) => r.value), 1);
  const total = rows.reduce((a, r) => a + r.value, 0) || 1;
  return (
    <figure className="not-prose my-8 p-5 sm:p-6 rounded-2xl border border-[#E8E0D5] bg-white">
      {title && <figcaption className="font-serif font-bold text-base text-[#221C18] mb-4">{title}</figcaption>}
      {type === 'pie' || type === 'donut' ? (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <svg viewBox="0 0 42 42" className="w-40 h-40 shrink-0" role="img" aria-label={title}>
            {(() => {
              let offset = 25;
              return rows.map((r, i) => {
                const pct = (r.value / total) * 100;
                const el = (
                  <circle
                    key={i}
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="transparent"
                    stroke={BRAND_COLOURS[i % BRAND_COLOURS.length]}
                    strokeWidth="6"
                    strokeDasharray={`${pct} ${100 - pct}`}
                    strokeDashoffset={offset}
                  />
                );
                offset -= pct;
                return el;
              });
            })()}
          </svg>
          <ul className="space-y-1.5 text-sm text-[#4A3E37]">
            {rows.map((r, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ background: BRAND_COLOURS[i % BRAND_COLOURS.length] }} />
                <span className="font-medium">{r.label}</span>
                <span className="text-[#8A786A]">
                  {r.value}
                  {unit} ({Math.round((r.value / total) * 100)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : type === 'line' ? (
        <svg viewBox="0 0 320 170" className="w-full h-auto" role="img" aria-label={title}>
          {[0, 1, 2, 3].map((g) => (
            <line key={g} x1="30" x2="310" y1={20 + g * 40} y2={20 + g * 40} stroke="#EFE7DC" />
          ))}
          <polyline
            fill="none"
            stroke="#A25828"
            strokeWidth="2.5"
            points={rows
              .map((r, i) => `${30 + (i * 280) / Math.max(1, rows.length - 1)},${140 - (r.value / max) * 120}`)
              .join(' ')}
          />
          {rows.map((r, i) => {
            const x = 30 + (i * 280) / Math.max(1, rows.length - 1);
            const y = 140 - (r.value / max) * 120;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="3.5" fill="#A25828" />
                <text x={x} y={y - 8} fontSize="9" textAnchor="middle" fill="#4A3E37">
                  {r.value}
                  {unit}
                </text>
                <text x={x} y="160" fontSize="9" textAnchor="middle" fill="#8A786A">
                  {r.label}
                </text>
              </g>
            );
          })}
        </svg>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[110px_1fr_auto] sm:grid-cols-[160px_1fr_auto] items-center gap-3 text-sm">
              <span className="text-[#4A3E37] font-medium truncate">{r.label}</span>
              <div className="h-3 rounded-full bg-[#F3EEE7] overflow-hidden">
                <div className="h-full rounded-full bg-[#A25828]" style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
              <span className="text-[#221C18] font-semibold tabular-nums">
                {r.value}
                {unit}
              </span>
            </div>
          ))}
        </div>
      )}
    </figure>
  );
};

const FaqBlock: React.FC<{ items: Array<{ q: string; a: string }>; render: (s: string) => React.ReactNode }> = ({ items, render }) => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="not-prose my-8 divide-y divide-[#EFEAE2] rounded-2xl border border-[#E8E0D5] bg-white">
      {items.map((it, i) => (
        <div key={i} className="px-5">
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="w-full py-4 flex items-center justify-between gap-3 text-left font-semibold text-[#221C18] hover:text-[#A25828]"
          >
            <span>{it.q}</span>
            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${open === i ? 'rotate-180 text-[#A25828]' : ''}`} />
          </button>
          {open === i && <div className="pb-4 text-sm text-[#5A4E46] leading-relaxed">{render(it.a)}</div>}
        </div>
      ))}
    </div>
  );
};

const Checklist: React.FC<{ title: string; items: string[] }> = ({ title, items }) => {
  const [done, setDone] = useState<Record<number, boolean>>({});
  const count = Object.values(done).filter(Boolean).length;
  return (
    <div className="not-prose my-8 p-5 sm:p-6 rounded-2xl border border-[#E8E0D5] bg-[#FAF8F5]">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h4 className="font-serif font-bold text-base text-[#221C18]">{title || 'Checklist'}</h4>
        <span className="text-xs font-semibold text-[#A25828]">
          {count}/{items.length} completed
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i}>
            <label className="flex items-start gap-3 text-sm text-[#4A3E37] cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(done[i])}
                onChange={(e) => setDone({ ...done, [i]: e.target.checked })}
                className="mt-0.5 w-4 h-4 accent-[#A25828]"
              />
              <span className={done[i] ? 'line-through text-[#8A786A]' : ''}>{it}</span>
            </label>
          </li>
        ))}
      </ul>
      {count > 0 && (
        <button type="button" onClick={() => setDone({})} className="mt-3 text-xs text-[#8A786A] hover:text-[#A25828] underline">
          Reset checklist
        </button>
      )}
    </div>
  );
};

export const RichContent: React.FC<RichContentProps> = ({ content, onNavigate, products = [], chapterNumbers = false, compact = false }) => {
  const renderInline = (text: string): React.ReactNode[] => {
    // links, bold, italic
    const tokens: React.ReactNode[] = [];
    const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let k = 0;
    while ((m = re.exec(text))) {
      if (m.index > last) tokens.push(text.slice(last, m.index));
      if (m[1]) {
        const url = m[2];
        const external = /^https?:\/\//.test(url);
        tokens.push(
          <a
            key={k++}
            href={url}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            onClick={(e) => {
              if (external) return;
              e.preventDefault();
              onNavigate(url);
            }}
            className="text-[#A25828] hover:text-[#8A461A] font-semibold underline underline-offset-2"
          >
            {m[1]}
          </a>
        );
      } else if (m[3]) tokens.push(<strong key={k++} className="font-semibold text-[#221C18]">{m[3]}</strong>);
      else if (m[4]) tokens.push(<em key={k++}>{m[4]}</em>);
      last = re.lastIndex;
    }
    if (last < text.length) tokens.push(text.slice(last));
    return tokens;
  };

  const lines = (content || '').split('\n');
  const out: React.ReactNode[] = [];
  let chapter = 0;
  let i = 0;
  let key = 0;
  const pText = compact ? 'text-sm' : 'text-[15px] sm:text-base';

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    // ---------- custom blocks ----------
    if (line.startsWith(':::') && line.length > 3) {
      const header = line.slice(3).trim();
      const [kind, ...restParts] = header.split(/\s+/);
      const rest = restParts.join(' ');
      const body: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') {
        body.push(lines[i]);
        i++;
      }
      i++; // skip closing :::
      const bodyLines = body.map((b) => b.trim()).filter(Boolean);

      switch (kind) {
        case 'tip':
        case 'note':
        case 'warning': {
          out.push(
            <aside
              key={key++}
              className={`not-prose my-7 p-5 rounded-2xl border-l-4 ${
                kind === 'warning' ? 'bg-amber-50 border-amber-500' : 'bg-[#FAF5EE] border-[#A25828]'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A25828] mb-1.5">
                <Lightbulb className="w-4 h-4" />
                <span>{rest || (kind === 'warning' ? 'Important' : 'Expert tip')}</span>
              </div>
              {bodyLines.map((b, bi) => (
                <p key={bi} className="text-sm text-[#4A3E37] leading-relaxed">
                  {renderInline(b)}
                </p>
              ))}
            </aside>
          );
          break;
        }
        case 'takeaways': {
          out.push(
            <div key={key++} className="not-prose my-7 p-5 sm:p-6 rounded-2xl bg-[#221C18] text-white">
              <div className="text-xs font-bold uppercase tracking-wider text-[#E8A87C] mb-3">{rest || 'Key takeaways'}</div>
              <ul className="space-y-2">
                {bodyLines.map((b, bi) => (
                  <li key={bi} className="flex items-start gap-2.5 text-sm text-stone-100 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-[#E8A87C] shrink-0 mt-0.5" />
                    <span>{renderInline(b.replace(/^[-*]\s*/, ''))}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
          break;
        }
        case 'steps': {
          out.push(
            <ol key={key++} className="not-prose my-8 grid gap-3">
              {bodyLines.map((b, bi) => {
                const [title, desc] = b.replace(/^\d+\.\s*/, '').split('|').map((x) => x.trim());
                return (
                  <li key={bi} className="flex gap-4 p-4 rounded-2xl bg-white border border-[#E8E0D5]">
                    <span className="font-serif font-bold text-2xl text-[#A25828] leading-none w-10 shrink-0">
                      {String(bi + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="font-semibold text-[#221C18]">{renderInline(title)}</div>
                      {desc && <p className="text-sm text-[#5A4E46] mt-0.5 leading-relaxed">{renderInline(desc)}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          );
          break;
        }
        case 'carousel':
        case 'slider':
        case 'gallery': {
          const items = bodyLines.map((b) => {
            const [src, caption] = b.split('|').map((x) => x.trim());
            return { src, caption: caption || '' };
          });
          out.push(<Carousel key={key++} items={items} />);
          break;
        }
        case 'chart': {
          const [type, ...titleParts] = rest.split(/\s+/);
          let title = titleParts.join(' ');
          const unitMatch = title.match(/\s*unit=(\S+)\s*$/);
          const unit = unitMatch ? unitMatch[1] : '';
          if (unitMatch) title = title.replace(unitMatch[0], '');
          const rows = bodyLines
            .map((b) => {
              const [label, value] = b.split('|').map((x) => x.trim());
              return { label, value: parseFloat((value || '').replace(/[^0-9.-]/g, '')) || 0 };
            })
            .filter((r) => r.label);
          out.push(<Chart key={key++} type={type || 'bar'} title={title} rows={rows} unit={unit} />);
          break;
        }
        case 'cta': {
          const [title, btn, url] = rest.split('|').map((x) => x.trim());
          out.push(
            <div
              key={key++}
              className="not-prose my-8 p-6 rounded-2xl bg-[#F7F2EC] border border-[#EAE2D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h4 className="font-serif font-bold text-lg text-[#221C18]">{title}</h4>
                {bodyLines.map((b, bi) => (
                  <p key={bi} className="text-sm text-[#6B6159] mt-1">
                    {renderInline(b)}
                  </p>
                ))}
              </div>
              {btn && url && (
                <a
                  href={url}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(url);
                  }}
                  className="shrink-0 inline-flex items-center gap-2 bg-[#A25828] hover:bg-[#8A461A] text-white px-5 py-2.5 rounded-full text-sm font-semibold"
                >
                  {btn} <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          );
          break;
        }
        case 'products': {
          const ids = rest.split(',').map((x) => x.trim()).filter(Boolean);
          const list = ids.map((id) => products.find((p) => p.id === id && p.isPublished)).filter(Boolean) as Product[];
          if (list.length) {
            out.push(
              <div key={key++} className="not-prose my-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {list.map((p) => (
                  <a
                    key={p.id}
                    href={`/product/${p.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/product/${p.slug}`);
                    }}
                    className="group flex gap-3 p-3 rounded-2xl bg-white border border-[#E8E0D5] hover:border-[#A25828] transition-colors"
                  >
                     <img src={thumbFor(p.images[0])} alt={p.name} loading="lazy" className="w-24 h-20 object-cover rounded-xl bg-[#F3EEE7] shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#221C18] group-hover:text-[#A25828] line-clamp-2">{p.name}</div>
                      <div className="text-sm font-bold text-[#A25828] mt-1">
                        £{(p.salePrice ?? p.price).toLocaleString('en-GB')}
                        {p.salePrice && p.salePrice < p.price && (
                          <span className="ml-2 text-xs text-stone-400 line-through font-normal">£{p.price.toLocaleString('en-GB')}</span>
                        )}
                      </div>
                      <span className="text-xs text-[#8A786A] flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> View product
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            );
          }
          break;
        }
        case 'checklist': {
          out.push(<Checklist key={key++} title={rest} items={bodyLines.map((b) => b.replace(/^[-*]\s*(\[ ?x?\]\s*)?/i, ''))} />);
          break;
        }
        case 'faq': {
          const items: Array<{ q: string; a: string }> = [];
          let q = '';
          bodyLines.forEach((b) => {
            if (/^Q:/i.test(b)) q = b.replace(/^Q:\s*/i, '');
            else if (/^A:/i.test(b) && q) {
              items.push({ q, a: b.replace(/^A:\s*/i, '') });
              q = '';
            }
          });
          out.push(<FaqBlock key={key++} items={items} render={(s) => renderInline(s)} />);
          break;
        }
        case 'timeline': {
          out.push(
            <ol key={key++} className="not-prose my-8 relative border-l-2 border-[#E8DFC5] ml-3 space-y-6">
              {bodyLines.map((b, bi) => {
                const [label, items] = b.split('|').map((x) => x.trim());
                return (
                  <li key={bi} className="pl-6 relative">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#A25828] border-4 border-[#FAF8F5]" />
                    <div className="text-xs font-bold uppercase tracking-wider text-[#A25828]">{label}</div>
                    <ul className="mt-1 space-y-1">
                      {(items || '').split(';').filter(Boolean).map((it, ii) => (
                        <li key={ii} className="text-sm text-[#4A3E37]">
                          • {renderInline(it.trim())}
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ol>
          );
          break;
        }
        default: {
          bodyLines.forEach((b) =>
            out.push(
              <p key={key++} className={`${pText} text-[#4A3E37] leading-relaxed my-4`}>
                {renderInline(b)}
              </p>
            )
          );
        }
      }
      continue;
    }

    // ---------- tables ----------
    if (line.startsWith('|') && line.endsWith('|')) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(lines[i].trim());
        i++;
      }
      const cells = rows.map((r) => r.split('|').slice(1, -1).map((c) => c.trim()));
      const head = cells[0] || [];
      const bodyRows = cells.slice(cells[1] && cells[1].every((c) => /^:?-{2,}:?$/.test(c)) ? 2 : 1);
      out.push(
        <div key={key++} className="not-prose my-7 overflow-x-auto rounded-2xl border border-[#E8E0D5] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E0D5] text-[#221C18]">
              <tr>
                {head.map((c, ci) => (
                  <th key={ci} className="py-3 px-4 font-bold">
                    {renderInline(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEAE2]">
              {bodyRows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, ci) => (
                    <td key={ci} className="py-3 px-4 text-[#4A3E37]">
                      {renderInline(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // ---------- lists ----------
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length && (ordered ? /^\d+\.\s+/.test(lines[i].trim()) : /^[-*]\s+/.test(lines[i].trim()))) {
        items.push(lines[i].trim().replace(ordered ? /^\d+\.\s+/ : /^[-*]\s+/, ''));
        i++;
      }
      const ListTag = ordered ? 'ol' : 'ul';
      out.push(
        <ListTag key={key++} className={`my-4 space-y-2 pl-5 ${ordered ? 'list-decimal' : 'list-disc'} marker:text-[#A25828]`}>
          {items.map((it, ii) => (
            <li key={ii} className={`${pText} text-[#4A3E37] leading-relaxed pl-1`}>
              {renderInline(it)}
            </li>
          ))}
        </ListTag>
      );
      continue;
    }

    i++;
    if (!line) continue;

    // ---------- images ----------
    const img = line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
    if (img) {
      out.push(
        <figure key={key++} className="not-prose my-8">
          <img
            src={img[2]}
            srcSet={srcSetFor(img[2])}
            sizes="(max-width: 768px) 92vw, 760px"
            alt={img[1]}
            width={1200}
            height={750}
            loading="lazy"
            decoding="async"
            className="w-full h-auto aspect-[16/10] rounded-2xl border border-[#E8E0D5] bg-[#F3EEE7] object-cover"
          />
          {(img[3] || img[1]) && <figcaption className="text-xs text-[#8A786A] italic mt-2 text-center">{img[3] || img[1]}</figcaption>}
        </figure>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      const text = line.slice(4);
      out.push(
        <h3 key={key++} id={slugifyHeading(text)} className="scroll-mt-28 font-serif font-bold text-xl sm:text-2xl text-[#221C18] mt-9 mb-3">
          {renderInline(text)}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      const text = line.slice(3);
      chapter++;
      out.push(
        <div key={key++} className="mt-12 mb-4 scroll-mt-28" id={slugifyHeading(text)}>
          {chapterNumbers && (
            <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#A25828] mb-1">
              Chapter {String(chapter).padStart(2, '0')}
            </span>
          )}
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#221C18] pb-2 border-b border-[#E8E0D5]/70">{renderInline(text)}</h2>
        </div>
      );
    } else if (line.startsWith('# ')) {
      // The page already has an H1 — render body H1s as H2 for correct SEO heading order
      out.push(
        <h2 key={key++} className="font-serif font-bold text-2xl sm:text-3xl text-[#221C18] mt-8 mb-4">
          {renderInline(line.slice(2))}
        </h2>
      );
    } else if (line.startsWith('> ')) {
      out.push(
        <blockquote key={key++} className="not-prose my-7 p-5 bg-[#FAF5EE] rounded-2xl border-l-4 border-[#A25828] text-sm text-[#4A3E37]">
          <Quote className="w-4 h-4 text-[#A25828] mb-1" />
          {renderInline(line.slice(2))}
        </blockquote>
      );
    } else if (line === '---') {
      out.push(<hr key={key++} className="my-10 border-[#E8E0D5]" />);
    } else if (/^\*[^*].*\*$/.test(line)) {
      out.push(
        <p key={key++} className="text-xs text-[#8A786A] italic my-3">
          {line.slice(1, -1)}
        </p>
      );
    } else {
      out.push(
        <p key={key++} className={`${pText} text-[#4A3E37] leading-relaxed my-4`}>
          {renderInline(line)}
        </p>
      );
    }
  }

  return <>{out}</>;
};
