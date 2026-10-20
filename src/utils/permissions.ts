import { AdminUser, UserRole } from '../types';

/**
 * Dashboard access areas. Every staff account gets a list of these ids in
 * `permissions`. The Master Admin always has access to everything.
 */
export const ACCESS_AREAS = [
  { id: 'overview', label: 'Overview (own summary)', description: 'Personal dashboard summary — always on' },
  { id: 'products', label: 'Products & Variations', description: 'Add / edit products, prices, stock, colours & variations' },
  { id: 'categories', label: 'Categories & SEO', description: 'Create, preview, update and delete categories' },
  { id: 'content', label: 'Blogs, Guides & Pillar Pages', description: 'Write and publish articles, guides and pillar pages' },
  { id: 'design', label: 'Store Design (Homepage, Menu, Footer)', description: 'Hero, homepage sections, top bar, mega menu, footer' },
  { id: 'orders', label: 'Orders & Fulfilment', description: 'View orders and change order status' },
  { id: 'analytics', label: 'Analytics', description: 'Storefront analytics' },
  { id: 'settings', label: 'Store Settings & Global SEO', description: 'Contact details, delivery fees, default SEO image' },
  { id: 'audit', label: 'Activity & Audit Logs', description: 'See the store-wide change history' },
] as const;

export type AccessAreaId = (typeof ACCESS_AREAS)[number]['id'];

/** Default access for each staff role (used when the owner does not customise access). */
export const ROLE_DEFAULT_ACCESS: Record<Exclude<UserRole, 'master_admin'>, AccessAreaId[]> = {
  admin: ['overview', 'products', 'categories', 'content', 'design', 'orders', 'analytics', 'settings', 'audit'],
  editor: ['overview', 'products', 'categories', 'content'],
  marketer: ['overview', 'categories', 'content', 'design'],
};

const AREA_IDS = new Set<string>(ACCESS_AREAS.map((a) => a.id));

/** Resolve the effective access list for a user (handles legacy ['editor'] style permissions). */
export function getEffectiveAccess(user: Pick<AdminUser, 'role' | 'permissions'>): AccessAreaId[] {
  if (user.role === 'master_admin') return ACCESS_AREAS.map((a) => a.id);
  const explicit = (user.permissions || []).filter((p) => AREA_IDS.has(p)) as AccessAreaId[];
  if (explicit.length > 0) {
    // Overview is always available to every staff member
    return Array.from(new Set<AccessAreaId>(['overview', ...explicit]));
  }
  return ROLE_DEFAULT_ACCESS[user.role] || ['overview'];
}

export function hasAccess(user: Pick<AdminUser, 'role' | 'permissions'>, area: AccessAreaId): boolean {
  return getEffectiveAccess(user).includes(area);
}
