export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  bottomSeoDescription: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  robotsIndexing?: 'index, follow' | 'noindex, follow' | 'noindex, nofollow';
  ogImage?: string; // Social share image (Open Graph / Twitter). Falls back to banner / featured image
  image: string; // Featured image
  bannerImage?: string; // Hero banner image
  showBanner?: boolean; // Show or hide banner on category page
  imageAlt?: string;
  parentId?: string; // Parent category ID for hierarchical nesting
  isActive: boolean; // Future categories like Dining & Wardrobes can be toggled
  order: number;
  subcategories: Subcategory[];
  internalLinks?: Array<{ title: string; url: string }>;
  faqs?: Array<{ question: string; answer: string }>;
}

export type SofaConfiguration =
  | '1 Seater'
  | '2 Seater'
  | '3 Seater'
  | '3+2 Suite'
  | '3+3 Suite'
  | '2+2 Suite'
  | '3+2+1 Suite'
  | 'Corner L-Shape (Left)'
  | 'Corner L-Shape (Right)'
  | 'U-Shape Sectional'
  | 'Single (3ft)'
  | 'Small Double (4ft)'
  | 'Double (4ft 6in)'
  | 'King (5ft)'
  | 'Super King (6ft)'
  | 'Custom';

export interface ProductVariation {
  id: string;
  name: string; // e.g. "3+2 Sofa Suite" or "King (5ft)"
  configuration: string; // e.g. "3+2", "3 Seater", "Corner L-Shape (Left)"
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  colour?: string; // e.g. "Steel Grey"
  colourHex?: string;
  material?: string; // e.g. "Crushed Velvet"
  size?: string;
  image?: string; // variation-specific image
  isDefault?: boolean;
}

export interface ProductImageItem {
  id: string;
  url: string;
  alt: string;
  isFeatured?: boolean;
  order: number;
}

export interface ProductVariant {
  name: string;
  hex: string;
  image?: string;
  /** Gallery shown on the product page when this colour is selected (first image = main image) */
  images?: string[];
}

export interface ProductDimensions {
  width: number; // cm
  height: number; // cm
  depth: number; // cm
  seatHeight?: number; // cm
  storageDepth?: number; // cm
  mattressSize?: string;
  weightCapacity?: string;
  boxDimensions?: string;
}

export interface Review {
  id: string;
  author: string;
  location: string;
  rating: number; // 1-5
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  subcategoryId?: string;
  price: number;
  salePrice?: number;
  regularPrice?: number;
  stock: number;
  lowStockThreshold: number;
  images: string[];
  imageGallery?: ProductImageItem[];
  variations?: ProductVariation[];
  shortDescription: string;
  fullDescription: string;
  dimensions: ProductDimensions;
  materials: string[];
  colours: ProductVariant[];
  sizes?: string[]; // e.g. "Single", "Double", "King", "Super King"
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  deliveryInfo: string;
  careInstructions: string;
  assemblyRequired?: boolean;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl?: string;
  robotsIndexing?: 'index, follow' | 'noindex, follow' | 'noindex, nofollow';
  ogImage?: string; // Social share image; falls back to the featured product image
  rating: number;
  reviewCount: number;
  relatedProductIds: string[];
  complementaryProductIds: string[];
  reviews: Review[];
}

export interface CartItem {
  id: string; // unique item line id
  productId: string;
  quantity: number;
  selectedColour?: string;
  selectedSize?: string;
  selectedMaterial?: string;
  selectedVariationId?: string;
  selectedConfiguration?: string;
  unitPrice?: number;
}

export interface OrderCustomer {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  selectedColour?: string;
  selectedSize?: string;
  selectedConfiguration?: string;
  variationId?: string;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "PC-84920"
  createdAt: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
  promoCode?: string;
  paymentMethod: 'cod' | 'card' | 'klarna' | 'bank_transfer';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  fulfilmentStatus: 'pending' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';
  deliveryOption: 'standard' | 'white_glove' | 'express';
  courier?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  customerNotes?: string;
  timeline: Array<{
    status: string;
    timestamp: string;
    note: string;
  }>;
}

export type ContentType =
  | 'blog_post'
  | 'buying_guide'
  | 'pillar_page'
  | 'cluster_article'
  | 'howto_guide'
  | 'comparison_article'
  | 'faq_resource';

export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface InternalLinkReference {
  targetId: string;
  targetType: 'product' | 'category' | 'pillar' | 'cluster' | 'guide';
  title: string;
  url: string;
}

export interface PillarLayoutSettings {
  eyebrow?: string; // small uppercase label above the H1
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  showTableOfContents?: boolean;
  showChapterNumbers?: boolean;
  closingTitle?: string;
  closingText?: string;
  closingCtaText?: string;
  closingCtaLink?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  contentType: ContentType;
  type: 'pillar' | 'cluster'; // backwards compatibility
  parentPillarId?: string; // ID of the parent pillar page
  pillarSlug?: string; // Slug of the parent pillar page
  excerpt: string;
  content: string; // rich formatted text with markdown headings, tables, links, images
  coverImage: string;
  socialImage?: string;
  author: string;
  authorRole?: string;
  publishDate: string;
  scheduledDate?: string;
  lastUpdated?: string;
  status: ContentStatus;
  readTime: string;
  category: string; // e.g. "Sofas", "Beds", "Care & Maintenance", "Interior Advice"
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  canonicalUrl?: string;
  isNoIndex?: boolean;
  relatedCategorySlug?: string;
  relatedProductIds?: string[];
  internalLinks?: InternalLinkReference[];
  isPublished: boolean; // boolean mirror of status === 'published'
  keyTakeaways?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  pillarLayout?: PillarLayoutSettings;
}

// Store Design Studio interfaces
export interface HeroDesignSettings {
  heading: string;
  subheading: string;
  description: string;
  desktopImage: string;
  mobileImage?: string;
  imageAlt: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  alignment: 'left' | 'center' | 'right';
  showTrustBadges: boolean;
  showFloatingCard: boolean;
  isVisible: boolean;
  /** Products shown in the hero showcase card (in order). Empty = featured products */
  showcaseProductIds?: string[];
  /** Secondary "video" button next to the primary CTA */
  showVideoButton?: boolean;
  videoButtonText?: string;
  /** YouTube / Vimeo link or a direct .mp4/.webm URL (uploaded to /uploads) */
  videoUrl?: string;
  videoTitle?: string;
  videoDescription?: string;
  /** Small trust points under the hero buttons */
  trustPoints?: Array<{ strong: string; text: string }>;
}

export interface MegaMenuDesignColumn {
  id: string;
  title: string;
  links: Array<{ title: string; url: string; badge?: string }>;
}

export interface MegaMenuDesignSettings {
  columns: MegaMenuDesignColumn[];
  promoImage: string;
  promoTitle: string;
  promoTag: string;
  promoLink: string;
  promoDescription: string;
  isVisible: boolean;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: Array<{ title: string; url: string }>;
}

export interface FooterDesignSettings {
  aboutText: string;
  columns: FooterColumn[];
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  openingHours: string;
  socialInstagram: string;
  socialFacebook: string;
  socialPinterest: string;
  socialTiktok?: string;
  socialYoutube?: string;
  socialLinkedin?: string;
  copyrightText: string;
}

export interface TrustBadge {
  title: string;
  subtitle: string;
  icon: 'truck' | 'exchange' | 'cash' | 'support' | 'shield' | 'star';
}

export interface HomepageSection {
  id: string; // 'hero' | 'dual_promos' | 'categories' | 'trending' | 'under_2500' | 'sofas' | 'beds' | 'deal_banner' | 'guides'
  type: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
  productIds?: string[];
  order: number;
  isVisible: boolean;
}

export interface StoreSettings {
  brandName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  businessHours: string;
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  whiteGloveDeliveryFee: number;
  promoBannerText: string;
  isPromoBannerActive: boolean;
  announcementLink: string;
  logoUrl?: string;
  logoAlt?: string;
  faviconUrl?: string;
  heroDesign?: HeroDesignSettings;
  megaMenuDesign?: MegaMenuDesignSettings;
  footerDesign?: FooterDesignSettings;
  homepageSections?: HomepageSection[];
  googleSiteVerification?: string;
  bingSiteVerification?: string;
  defaultSeoTitleSuffix?: string;
  defaultMetaDescription?: string;
  /** Default social share image used when a page has no own image */
  defaultOgImage?: string;
  /** Top bar (above the main navigation) */
  topBarShowSocials?: boolean;
  topBarShowContact?: boolean;
  /** 4 trust badges shown above the footer on every page */
  trustBadges?: TrustBadge[];
}

export interface SeoAuditReport {
  totalPages: number;
  totalProducts: number;
  totalCategories: number;
  totalBlogPosts: number;
  missingTitles: number;
  shortTitles: number;
  longTitles: number;
  missingDescriptions: number;
  shortDescriptions: number;
  longDescriptions: number;
  missingAltTexts: number;
  noindexPages: number;
  crawlableUrlCount: number;
  itemsWithWarnings: Array<{
    type: 'product' | 'category' | 'blog';
    id: string;
    name: string;
    url: string;
    issues: string[];
  }>;
}

// Security, RBAC & Audit Log interfaces
export type UserRole = 'master_admin' | 'admin' | 'editor' | 'marketer';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: string[];
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  phone?: string;
  passwordChangedAt?: string;
}

export interface PasswordResetRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  note?: string;
  requestedAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ActiveSession {
  id: string;
  method?: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: UserRole;
  device: string;
  ip: string;
  signedInAt: string;
  lastActiveAt: string;
  isCurrent?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  action: string;
  category: 'auth' | 'products' | 'categories' | 'design' | 'settings' | 'users' | 'orders' | 'content' | 'security' | 'system';
  target: string;
  details: string;
  beforeAfter?: Record<string, { before: any; after: any }>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AnalyticsEvent {
  type: 'product_view' | 'category_view' | 'search' | 'add_to_cart' | 'checkout_start' | 'purchase';
  targetId?: string;
  targetName?: string;
  query?: string;
  value?: number;
  timestamp: string;
}

export type PageRoute =
  | { name: 'home' }
  | { name: 'shop'; categoryId?: string; subcategoryId?: string }
  | { name: 'category'; categorySlug: string; subcategorySlug?: string }
  | { name: 'product'; slug: string }
  | { name: 'search'; query?: string }
  | { name: 'basket' }
  | { name: 'checkout' }
  | { name: 'order-confirmation'; orderId: string }
  | { name: 'account' }
  | { name: 'wishlist' }
  | { name: 'about' }
  | { name: 'contact' }
  | { name: 'delivery' }
  | { name: 'returns' }
  | { name: 'faqs' }
  | { name: 'privacy' }
  | { name: 'cookies' }
  | { name: 'terms' }
  | { name: 'blog' }
  | { name: 'blog-detail'; slug: string }
  | { name: 'admin'; section?: 'overview' | 'products' | 'categories' | 'orders' | 'content' | 'design' | 'audit' | 'users' | 'settings' | 'analytics' }
  | { name: '404' };
