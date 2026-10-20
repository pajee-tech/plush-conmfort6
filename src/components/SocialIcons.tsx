import React from 'react';
import { StoreSettings } from '../types';

type Network = 'instagram' | 'facebook' | 'pinterest' | 'tiktok' | 'youtube' | 'linkedin' | 'whatsapp';

const PATHS: Record<Network, string> = {
  instagram:
    'M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 4.6a5.2 5.2 0 1 0 0 10.4 5.2 5.2 0 0 0 0-10.4Zm0 8.6a3.4 3.4 0 1 1 0-6.8 3.4 3.4 0 0 1 0 6.8Zm5.4-9.9a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z',
  facebook:
    'M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.2-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z',
  pinterest:
    'M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.3-5.4s-.3-.7-.3-1.6c0-1.5.9-2.7 2-2.7.9 0 1.4.7 1.4 1.6 0 1-.6 2.4-.9 3.7-.3 1.1.6 2 1.7 2 2 0 3.5-2.1 3.5-5.2 0-2.7-1.9-4.6-4.7-4.6-3.2 0-5.1 2.4-5.1 4.9 0 1 .4 2 .9 2.6.1.1.1.2.1.3l-.3 1.4c-.1.2-.2.3-.4.2-1.4-.7-2.3-2.7-2.3-4.4 0-3.6 2.6-6.9 7.5-6.9 3.9 0 7 2.8 7 6.6 0 3.9-2.5 7.1-5.9 7.1-1.2 0-2.2-.6-2.6-1.3l-.7 2.7c-.3 1-.9 2.2-1.4 2.9A10 10 0 1 0 12 2Z',
  tiktok:
    'M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.7a5.8 5.8 0 1 0 5 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.3-1.6Z',
  youtube:
    'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z',
  linkedin:
    'M6.9 8.9H3.8V20h3.1V8.9ZM5.3 3.8a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6ZM20.2 13.6c0-3-.7-5-4.1-5-1.6 0-2.7.9-3.2 1.7V8.9h-3V20h3.1v-5.5c0-1.4.3-2.8 2.1-2.8 1.7 0 1.8 1.6 1.8 2.9V20h3.1v-6.4Z',
  whatsapp:
    'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.3-.5-.5-.9-1-1.2-1.6-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z',
};

const LABELS: Record<Network, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  pinterest: 'Pinterest',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
};

export function getSocialLinks(settings: StoreSettings): Array<{ network: Network; url: string }> {
  const f = settings.footerDesign;
  const list: Array<{ network: Network; url?: string }> = [
    { network: 'facebook', url: f?.socialFacebook },
    { network: 'instagram', url: f?.socialInstagram },
    { network: 'tiktok', url: f?.socialTiktok },
    { network: 'youtube', url: f?.socialYoutube },
    { network: 'pinterest', url: f?.socialPinterest },
    { network: 'linkedin', url: f?.socialLinkedin },
  ];
  return list.filter((l) => l.url && l.url.trim()).map((l) => ({ network: l.network, url: l.url!.trim() }));
}

export const SocialIcon: React.FC<{ network: Network; className?: string }> = ({ network, className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d={PATHS[network]} />
  </svg>
);

interface SocialIconsProps {
  settings: StoreSettings;
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md';
}

/** Row of round social media icon links, managed from Dashboard → Store Design → Footer & Social. */
export const SocialIcons: React.FC<SocialIconsProps> = ({ settings, variant = 'light', size = 'md' }) => {
  const links = getSocialLinks(settings);
  if (links.length === 0) return null;
  const box = size === 'sm' ? 'w-6 h-6' : 'w-9 h-9';
  const icon = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const colours =
    variant === 'dark'
      ? 'text-stone-300 hover:text-white hover:bg-white/10'
      : 'text-[#7A6A5E] bg-white border border-[#E8E0D5] hover:text-white hover:bg-[#A25828] hover:border-[#A25828]';
  return (
    <div className="flex items-center gap-1.5">
      {links.map((l) => (
        <a
          key={l.network}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Plush Comfort on ${LABELS[l.network]}`}
          title={LABELS[l.network]}
          className={`${box} rounded-full flex items-center justify-center transition-colors ${colours}`}
        >
          <SocialIcon network={l.network} className={icon} />
        </a>
      ))}
    </div>
  );
};
