import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  BlogPost,
  StoreSettings,
  Order,
  CartItem,
  PageRoute,
  AnalyticsEvent,
  OrderCustomer,
  OrderItem,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_BLOG_POSTS,
  INITIAL_SETTINGS,
  INITIAL_ORDERS,
} from '../data/initialData';
import { parseWooCommerceCsv, WooParseResult } from '../utils/wooCommerceParser';
import { adminAuthService } from '../services/adminAuthService';

export interface CsvImportResult {
  success: boolean;
  count: number;
  updatedCount?: number;
  addedCount?: number;
  totalParsed?: number;
  warnings?: string[];
  errors?: string[];
  missingImages?: string[];
  error?: string;
  products?: Product[];
}

interface AnalyticsMetrics {
  totalRevenue: number;
  totalOrders: number;
  itemsSold: number;
  averageOrderValue: number;
  productViews: Record<string, number>;
  categoryViews: Record<string, number>;
  searchQueries: Record<string, number>;
  addToCartCount: number;
  checkoutStartCount: number;
  purchaseCount: number;
  conversionRate: number; // percentage
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  activeCategories: Category[];
  blogPosts: BlogPost[];
  settings: StoreSettings;
  orders: Order[];
  cart: CartItem[];
  wishlist: string[];
  currentRoute: PageRoute;
  setRoute: (route: PageRoute) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  
  // Cart
  addToCart: (
    productId: string,
    quantity?: number,
    selectedColour?: string,
    selectedSize?: string,
    selectedMaterial?: string,
    selectedVariationId?: string,
    selectedConfiguration?: string,
    unitPrice?: number
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartCount: number;

  // Wishlist
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Checkout
  createOrder: (data: {
    customer: OrderCustomer;
    paymentMethod: 'cod' | 'card' | 'klarna' | 'bank_transfer';
    deliveryOption: 'standard' | 'white_glove' | 'express';
    promoCode?: string;
  }) => Promise<Order>;

  // Admin
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  duplicateProduct: (productId: string) => Product;
  updateStock: (productId: string, newStock: number) => void;
  toggleProductPublish: (productId: string) => void;

  addCategory: (category: Omit<Category, 'id'>) => Category;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  toggleCategoryActive: (categoryId: string) => void;
  refreshAdminOrders: () => Promise<void>;

  updateOrderStatus: (orderId: string, status: Order['fulfilmentStatus'], courier?: string, trackingNumber?: string) => void;
  cancelOrder: (orderId: string) => void;

  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  
  addBlogPost: (post: Omit<BlogPost, 'id'>) => BlogPost;
  updateBlogPost: (post: BlogPost) => void;
  deleteBlogPost: (postId: string) => void;
  duplicateBlogPost: (postId: string) => BlogPost;
  toggleBlogPostStatus: (postId: string) => void;

  // CSV
  exportProductsCSV: () => string;
  importProductsCSV: (csvString: string, replaceAll?: boolean) => CsvImportResult;

  // Analytics
  trackEvent: (type: AnalyticsEvent['type'], targetId?: string, targetName?: string, query?: string, value?: number) => void;
  getAnalyticsMetrics: () => AnalyticsMetrics;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'plush_comfort_products_v5',
  CATEGORIES: 'plush_comfort_categories_v5',
  BLOGS: 'plush_comfort_blogs_v5',
  SETTINGS: 'plush_comfort_settings_v5',
  ORDERS: 'plush_comfort_orders_v5',
  CART: 'plush_comfort_cart_v5',
  WISHLIST: 'plush_comfort_wishlist_v5',
  ANALYTICS: 'plush_comfort_analytics_v5',
};

function attachVariationsIfMissing(list: Product[]): Product[] {
  return list.map((p) => {
    if (p.variations && p.variations.length > 0) return p;

    const isBed = p.categoryId.includes('bed') || p.categoryId.includes('mattress');
    const isSofa = p.categoryId.includes('sofa') || p.categoryId === 'cat-armchairs';

    if (isSofa) {
      return {
        ...p,
        variations: [
          { id: `${p.id}-var-1`, name: '1 Seater (Armchair)', configuration: '1 Seater', sku: `${p.sku}-1S`, price: Math.round(p.price * 0.45), salePrice: p.salePrice ? Math.round(p.salePrice * 0.45) : undefined, stock: 5 },
          { id: `${p.id}-var-2`, name: '2 Seater Sofa', configuration: '2 Seater', sku: `${p.sku}-2S`, price: Math.round(p.price * 0.65), salePrice: p.salePrice ? Math.round(p.salePrice * 0.65) : undefined, stock: 8 },
          { id: `${p.id}-var-3`, name: '3 Seater Sofa', configuration: '3 Seater', sku: `${p.sku}-3S`, price: Math.round(p.price * 0.8), salePrice: p.salePrice ? Math.round(p.salePrice * 0.8) : undefined, stock: 10 },
          { id: `${p.id}-var-32`, name: '3+2 Sofa Suite', configuration: '3+2 Suite', sku: `${p.sku}-32`, price: p.price, salePrice: p.salePrice, stock: p.stock, isDefault: true },
          { id: `${p.id}-var-33`, name: '3+3 Sofa Suite', configuration: '3+3 Suite', sku: `${p.sku}-33`, price: Math.round(p.price * 1.15), salePrice: p.salePrice ? Math.round(p.salePrice * 1.15) : undefined, stock: 4 },
          { id: `${p.id}-var-22`, name: '2+2 Sofa Suite', configuration: '2+2 Suite', sku: `${p.sku}-22`, price: Math.round(p.price * 0.95), salePrice: p.salePrice ? Math.round(p.salePrice * 0.95) : undefined, stock: 6 },
          { id: `${p.id}-var-321`, name: '3+2+1 Complete Suite', configuration: '3+2+1 Suite', sku: `${p.sku}-321`, price: Math.round(p.price * 1.35), salePrice: p.salePrice ? Math.round(p.salePrice * 1.35) : undefined, stock: 3 },
        ],
      };
    }

    if (isBed) {
      return {
        ...p,
        variations: [
          { id: `${p.id}-var-sgl`, name: 'Single (3ft)', configuration: 'Single (3ft)', sku: `${p.sku}-SGL`, price: Math.round(p.price * 0.7), salePrice: p.salePrice ? Math.round(p.salePrice * 0.7) : undefined, stock: 6 },
          { id: `${p.id}-var-sdbl`, name: 'Small Double (4ft)', configuration: 'Small Double (4ft)', sku: `${p.sku}-SDBL`, price: Math.round(p.price * 0.85), salePrice: p.salePrice ? Math.round(p.salePrice * 0.85) : undefined, stock: 7 },
          { id: `${p.id}-var-dbl`, name: 'Double (4ft 6in)', configuration: 'Double (4ft 6in)', sku: `${p.sku}-DBL`, price: p.price, salePrice: p.salePrice, stock: p.stock, isDefault: true },
          { id: `${p.id}-var-kng`, name: 'King (5ft)', configuration: 'King (5ft)', sku: `${p.sku}-KNG`, price: Math.round(p.price * 1.15), salePrice: p.salePrice ? Math.round(p.salePrice * 1.15) : undefined, stock: 9 },
          { id: `${p.id}-var-skng`, name: 'Super King (6ft)', configuration: 'Super King (6ft)', sku: `${p.sku}-SKNG`, price: Math.round(p.price * 1.3), salePrice: p.salePrice ? Math.round(p.salePrice * 1.3) : undefined, stock: 5 },
        ],
      };
    }

    return p;
  });
}

function parsePathToRoute(pathname: string): PageRoute {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === '' || p === '/') return { name: 'home' };
  if (p === '/admin') return { name: 'admin' };
  if (p === '/shop') return { name: 'shop' };
  if (p === '/basket') return { name: 'basket' };
  if (p === '/checkout') return { name: 'checkout' };
  if (p === '/account') return { name: 'account' };
  if (p === '/wishlist') return { name: 'wishlist' };
  if (p === '/about') return { name: 'about' };
  if (p === '/contact') return { name: 'contact' };
  if (p === '/delivery') return { name: 'delivery' };
  if (p === '/returns') return { name: 'returns' };
  if (p === '/faqs') return { name: 'faqs' };
  if (p === '/privacy') return { name: 'privacy' };
  if (p === '/terms') return { name: 'terms' };
  if (p === '/cookies') return { name: 'cookies' };
  if (p === '/blog') return { name: 'blog' };
  if (p === '/search') {
    const q = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') || '' : '';
    return { name: 'search', query: q };
  }
  if (p.startsWith('/product/')) {
    const slug = decodeURIComponent(p.replace('/product/', '').replace(/\/+$/, ''));
    return { name: 'product', slug };
  }
  if (p.startsWith('/category/')) {
    const rest = p.replace('/category/', '').replace(/\/+$/, '');
    const parts = rest.split('/');
    return {
      name: 'category',
      categorySlug: decodeURIComponent(parts[0]),
      subcategorySlug: parts[1] ? decodeURIComponent(parts[1]) : undefined,
    };
  }
  if (p.startsWith('/blog/')) {
    const slug = decodeURIComponent(p.replace('/blog/', '').replace(/\/+$/, ''));
    return { name: 'blog-detail', slug };
  }
  if (p.startsWith('/order-confirmation/')) {
    const orderId = decodeURIComponent(p.replace('/order-confirmation/', '').replace(/\/+$/, ''));
    return { name: 'order-confirmation', orderId };
  }
  return { name: '404' };
}

/** Live store data rendered by the server (SSR) and handed to the browser as window.__PC_DATA__ */
export interface StoreBootData {
  products?: Product[] | null;
  categories?: Category[] | null;
  blogs?: BlogPost[] | null;
  design?: Partial<StoreSettings> | null;
}

export const StoreProvider: React.FC<{ children: React.ReactNode; initialPath?: string; bootData?: StoreBootData }> = ({
  children,
  initialPath,
  bootData,
}) => {
  // Server data first (identical on server and browser → no flash), then the bundled defaults.
  const boot: StoreBootData =
    bootData || (typeof window !== 'undefined' ? ((window as any).__PC_DATA__ as StoreBootData) : undefined) || {};

  const [products, setProducts] = useState<Product[]>(() =>
    attachVariationsIfMissing(Array.isArray(boot.products) && boot.products.length ? boot.products : INITIAL_PRODUCTS)
  );

  const [categories, setCategories] = useState<Category[]>(() => {
    if (Array.isArray(boot.categories) && boot.categories.length) return boot.categories;
    try {
      const saved = null as string | null;
      if (saved) {
        const parsed: Category[] = JSON.parse(saved);
        const existingSlugs = new Set(parsed.map((c) => c.slug));
        const merged = [...parsed];
        for (const initialCat of INITIAL_CATEGORIES) {
          if (!existingSlugs.has(initialCat.slug)) {
            merged.push(initialCat);
          } else {
            const idx = merged.findIndex((c) => c.slug === initialCat.slug);
            if (idx >= 0) {
              merged[idx] = {
                ...merged[idx],
                seoTitle: merged[idx].seoTitle || initialCat.seoTitle,
                seoDescription: merged[idx].seoDescription || initialCat.seoDescription,
                bottomSeoDescription: merged[idx].bottomSeoDescription || initialCat.bottomSeoDescription,
                subcategories: initialCat.subcategories?.length ? initialCat.subcategories : merged[idx].subcategories,
                faqs: initialCat.faqs?.length ? initialCat.faqs : merged[idx].faqs,
              };
            }
          }
        }
        return merged;
      }
      return INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // Blog posts
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() =>
    Array.isArray(boot.blogs) && boot.blogs.length ? boot.blogs : INITIAL_BLOG_POSTS
  );

  // Settings - Always preserve official logo
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const d = boot.design || {};
    return { ...INITIAL_SETTINGS, ...d, logoUrl: d.logoUrl || INITIAL_SETTINGS.logoUrl, logoAlt: d.logoAlt || INITIAL_SETTINGS.logoAlt };
  });

  // Orders
  // Loaded from this browser after the first render (keeps server HTML and browser HTML identical)
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  // Cart
  // Loaded from this browser after the first render (keeps server HTML and browser HTML identical)
  const [cart, setCart] = useState<CartItem[]>([]);

  // Wishlist
  // Loaded from this browser after the first render (keeps server HTML and browser HTML identical)
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Analytics Events
  // Loaded from this browser after the first render (keeps server HTML and browser HTML identical)
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);

  // Navigation State with URL deep linking
  const [currentRoute, setCurrentRoute] = useState<PageRoute>(() =>
    parsePathToRoute(initialPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/'))
  );
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync route changes with browser address bar
  const setRoute = (newRoute: PageRoute) => {
    setCurrentRoute(newRoute);
    if (typeof window === 'undefined') return;

    let path = '/';
    if (newRoute.name === 'admin') path = '/admin';
    else if (newRoute.name === 'shop') path = '/shop';
    else if (newRoute.name === 'basket') path = '/basket';
    else if (newRoute.name === 'checkout') path = '/checkout';
    else if (newRoute.name === 'account') path = '/account';
    else if (newRoute.name === 'wishlist') path = '/wishlist';
    else if (newRoute.name === 'about') path = '/about';
    else if (newRoute.name === 'contact') path = '/contact';
    else if (newRoute.name === 'delivery') path = '/delivery';
    else if (newRoute.name === 'returns') path = '/returns';
    else if (newRoute.name === 'faqs') path = '/faqs';
    else if (newRoute.name === 'privacy') path = '/privacy';
    else if (newRoute.name === 'terms') path = '/terms';
    else if (newRoute.name === 'cookies') path = '/cookies';
    else if (newRoute.name === 'blog') path = '/blog';
    else if (newRoute.name === 'product') path = `/product/${newRoute.slug}`;
    else if (newRoute.name === 'category') {
      path = newRoute.subcategorySlug
        ? `/category/${newRoute.categorySlug}/${newRoute.subcategorySlug}`
        : `/category/${newRoute.categorySlug}`;
    } else if (newRoute.name === 'blog-detail') path = `/blog/${newRoute.slug}`;
    else if (newRoute.name === 'search') {
      path = newRoute.query ? `/search?q=${encodeURIComponent(newRoute.query)}` : '/search';
    } else if (newRoute.name === 'order-confirmation') {
      path = `/order-confirmation/${newRoute.orderId}`;
    }

    const currentUrl = window.location.pathname + window.location.search;
    if (currentUrl !== path) {
      window.history.pushState({ route: newRoute }, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Browser back/forward navigation listener & admin hotkey (Ctrl+Shift+A)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parsePathToRoute(window.location.pathname));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setRoute({ name: 'admin' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    // Initial backend store design check safely parsed to avoid uncaught JSON errors
    fetch('/api/store/design')
      .then(async (res) => {
        if (!res.ok) return null;
        const text = await res.text();
        if (!text || !text.trim().startsWith('{')) return null;
        return JSON.parse(text);
      })
      .then((data) => {
        if (data?.design) {
          setSettings((prev) => ({ ...prev, ...data.design }));
        }
      })
      .catch(() => {});

    // Products & blog posts always come from the live server so every visitor sees the latest content
    const loadJson = (url: string) =>
      fetch(url)
        .then(async (res) => {
          if (!res.ok) return null;
          const text = await res.text();
          if (!text || !text.trim().startsWith('{')) return null;
          return JSON.parse(text);
        })
        .catch(() => null);

    loadJson('/api/store/products').then((data) => {
      if (Array.isArray(data?.products) && data.products.length > 0) {
        skipSync.current.products = true;
        setProducts(attachVariationsIfMissing(data.products));
      }
    });
    loadJson('/api/store/blogs').then((data) => {
      if (Array.isArray(data?.blogs) && data.blogs.length > 0) {
        skipSync.current.blogs = true;
        setBlogPosts(data.blogs);
      }
    });

    // Initial backend store categories check
    fetch('/api/store/categories')
      .then(async (res) => {
        if (!res.ok) return null;
        const text = await res.text();
        if (!text || !text.trim().startsWith('{')) return null;
        return JSON.parse(text);
      })
      .then((data) => {
        if (Array.isArray(data?.categories) && data.categories.length > 0) {
          skipSync.current.categories = true;
          setCategories(data.categories);
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // ---- Live server sync for admin edits ----
  // Admin actions mark a collection "dirty"; the effect below pushes the full list to the server
  // (debounced) so changes are live for every visitor straight away.
  const dirty = React.useRef<{ products: boolean; blogs: boolean; categories: boolean }>({ products: false, blogs: false, categories: false });
  const skipSync = React.useRef<{ products: boolean; blogs: boolean; categories: boolean }>({ products: false, blogs: false, categories: false });
  const syncTimers = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const pushToServer = (kind: 'products' | 'blogs' | 'categories', list: unknown[]) => {
    const token = adminAuthService.getToken();
    if (!token) return;
    clearTimeout(syncTimers.current[kind]);
    syncTimers.current[kind] = setTimeout(() => {
      fetch(`/api/store/${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [kind]: list }),
      }).catch((err) => console.warn(`Backend ${kind} sync warning:`, err));
    }, 600);
  };

  useEffect(() => {
    if (skipSync.current.products) { skipSync.current.products = false; return; }
    if (dirty.current.products) { dirty.current.products = false; pushToServer('products', products); }
  }, [products]);
  useEffect(() => {
    if (skipSync.current.blogs) { skipSync.current.blogs = false; return; }
    if (dirty.current.blogs) { dirty.current.blogs = false; pushToServer('blogs', blogPosts); }
  }, [blogPosts]);
  useEffect(() => {
    if (skipSync.current.categories) { skipSync.current.categories = false; return; }
    if (dirty.current.categories) { dirty.current.categories = false; pushToServer('categories', categories); }
  }, [categories]);

  const markDirty = (kind: 'products' | 'blogs' | 'categories') => {
    dirty.current[kind] = true;
  };

  // Restore this visitor's basket, wishlist, orders and analytics (browser only)
  useEffect(() => {
    const read = <T,>(key: string): T | null => {
      try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
      } catch {
        return null;
      }
    };
    const c = read<CartItem[]>(STORAGE_KEYS.CART);
    if (c) setCart(c);
    const w = read<string[]>(STORAGE_KEYS.WISHLIST);
    if (w) setWishlist(w);
    const o = read<Order[]>(STORAGE_KEYS.ORDERS);
    if (o) setOrders(o);
    const a = read<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS);
    if (a) setAnalyticsEvents(a);
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) { console.error(e); }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) { console.error(e); }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogPosts));
    } catch (e) { console.error(e); }
  }, [blogPosts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) { console.error(e); }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) { console.error(e); }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) { console.error(e); }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
    } catch (e) { console.error(e); }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ANALYTICS, JSON.stringify(analyticsEvents));
    } catch (e) { console.error(e); }
  }, [analyticsEvents]);

  // Handle URL history state for smooth browser back/forward and deep linking
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentRoute]);

  // Active categories helper (for customer facing views)
  const activeCategories = categories.filter((c) => c.isActive);

  // Cart calculations with variation price support
  const cartSubtotal = cart.reduce((acc, item) => {
    const prod = products.find((p) => p.id === item.productId);
    if (!prod) return acc;
    const price = item.unitPrice ?? prod.salePrice ?? prod.price;
    return acc + price * item.quantity;
  }, 0);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = (
    productId: string,
    quantity = 1,
    selectedColour?: string,
    selectedSize?: string,
    selectedMaterial?: string,
    selectedVariationId?: string,
    selectedConfiguration?: string,
    unitPrice?: number
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const finalUnitPrice = unitPrice ?? product.salePrice ?? product.price;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === productId &&
          item.selectedVariationId === selectedVariationId &&
          item.selectedColour === selectedColour &&
          item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }

      const newItem: CartItem = {
        id: `${productId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId,
        quantity,
        selectedColour: selectedColour || product.colours[0]?.name,
        selectedSize: selectedSize || product.sizes?.[0],
        selectedMaterial: selectedMaterial || product.materials[0],
        selectedVariationId,
        selectedConfiguration,
        unitPrice: finalUnitPrice,
      };
      return [...prev, newItem];
    });

    trackEvent('add_to_cart', productId, product.name, undefined, finalUnitPrice);
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Analytics Tracker
  const trackEvent = (
    type: AnalyticsEvent['type'],
    targetId?: string,
    targetName?: string,
    query?: string,
    value?: number
  ) => {
    const event: AnalyticsEvent = {
      type,
      targetId,
      targetName,
      query,
      value,
      timestamp: new Date().toISOString(),
    };
    setAnalyticsEvents((prev) => [...prev.slice(-499), event]); // keep last 500 events
  };

  // Order Placement
  const createOrder = async (data: {
    customer: OrderCustomer;
    paymentMethod: 'cod' | 'card' | 'klarna' | 'bank_transfer';
    deliveryOption: 'standard' | 'white_glove' | 'express';
    promoCode?: string;
  }): Promise<Order> => {
    // Calculate final pricing
    const subtotal = cartSubtotal;
    let deliveryFee = 0;
    if (data.deliveryOption === 'white_glove') {
      deliveryFee = settings.whiteGloveDeliveryFee;
    } else {
      deliveryFee = subtotal >= settings.freeDeliveryThreshold ? 0 : settings.standardDeliveryFee;
    }

    let discountAmount = 0;
    if (data.promoCode && data.promoCode.trim().toUpperCase() === 'PLUSH10') {
      discountAmount = Math.round(subtotal * 0.1 * 100) / 100;
    }

    const total = Math.max(0, subtotal - discountAmount + deliveryFee);

    // Build order items & deduct stock
    const orderItems: OrderItem[] = cart.map((item) => {
      const prod = products.find((p) => p.id === item.productId)!;
      const variation = item.selectedVariationId ? prod.variations?.find((v) => v.id === item.selectedVariationId) : undefined;
      const colourImage = prod.colours.find((c) => c.name === item.selectedColour)?.images?.[0];
      return {
        productId: item.productId,
        name: prod.name,
        sku: variation?.sku || prod.sku,
        price: item.unitPrice ?? prod.salePrice ?? prod.price,
        quantity: item.quantity,
        selectedColour: item.selectedColour,
        selectedSize: item.selectedSize,
        selectedConfiguration: item.selectedConfiguration,
        variationId: item.selectedVariationId,
        image: colourImage || variation?.image || prod.images[0],
      };
    });

    // Update stock in products catalog
    setProducts((prev) =>
      prev.map((prod) => {
        const cartMatch = cart.find((c) => c.productId === prod.id);
        if (cartMatch) {
          const nextStock = Math.max(0, prod.stock - cartMatch.quantity);
          return { ...prod, stock: nextStock };
        }
        return prod;
      })
    );

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `PC-UK-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      customer: data.customer,
      items: orderItems,
      subtotal,
      deliveryFee,
      discountAmount,
      total,
      promoCode: data.promoCode,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'cod' ? 'pending' : 'paid',
      fulfilmentStatus: 'processing',
      deliveryOption: data.deliveryOption,
      courier: data.deliveryOption === 'white_glove' ? 'Panther 2-Man White Glove' : 'DX Freight Specialists',
      trackingNumber: `DX-GB-${Math.floor(10000000 + Math.random() * 90000000)}`,
      estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      timeline: [
        {
          status: 'Order Placed',
          timestamp: new Date().toISOString(),
          note:
            data.paymentMethod === 'cod'
              ? `Order confirmed with Cash on Delivery / Pay on Handover (£${total.toFixed(2)} due on delivery)`
              : `Payment confirmed via ${data.paymentMethod === 'klarna' ? 'Klarna Pay' : 'Stripe Card Checkout'} (£${total.toFixed(2)})`,
        },
        {
          status: 'Processing',
          timestamp: new Date().toISOString(),
          note: 'Order received and passed to our fulfilment team.',
        },
      ],
    };

    // Save the order on the server so the store team sees it in the dashboard
    let finalOrder = newOrder;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.order) finalOrder = data.order;
      }
    } catch (err) {
      console.warn('Order could not be sent to the server:', err);
    }

    setOrders((prev) => [finalOrder, ...prev.filter((o) => o.id !== finalOrder.id)]);
    clearCart();
    trackEvent('purchase', finalOrder.id, finalOrder.orderNumber, undefined, finalOrder.total);

    return finalOrder;
  };

  // Product Admin Operations
  const addProduct = (productData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    markDirty('products');
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (updatedProduct: Product) => {
    markDirty('products');
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const deleteProduct = (productId: string) => {
    markDirty('products');
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const duplicateProduct = (productId: string): Product => {
    const original = products.find((p) => p.id === productId);
    if (!original) throw new Error('Product not found');

    const duplicated: Product = {
      ...original,
      id: `prod-${Date.now()}`,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      sku: `${original.sku}-CP`,
      isPublished: false,
    };

    markDirty('products');
    setProducts((prev) => [duplicated, ...prev]);
    return duplicated;
  };

  const updateStock = (productId: string, newStock: number) => {
    markDirty('products');
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p))
    );
  };

  const toggleProductPublish = (productId: string) => {
    markDirty('products');
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isPublished: !p.isPublished } : p))
    );
  };

  // Category Operations
  const addCategory = (categoryData: Omit<Category, 'id'>): Category => {
    const newCategory: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    markDirty('categories');
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  };

  const updateCategory = (updated: Category) => {
    markDirty('categories');
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const deleteCategory = (categoryId: string) => {
    markDirty('categories');
    setCategories((prev) =>
      prev
        .filter((c) => c.id !== categoryId)
        .map((c) => (c.parentId === categoryId ? { ...c, parentId: undefined } : c))
    );
  };

  const toggleCategoryActive = (categoryId: string) => {
    markDirty('categories');
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, isActive: !c.isActive } : c))
    );
  };

  // Order Operations
  const refreshAdminOrders = async () => {
    const token = adminAuthService.getToken();
    if (!token) return;
    try {
      const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data?.orders)) setOrders(data.orders);
    } catch {}
  };

  const pushOrder = (order: Order) => {
    const token = adminAuthService.getToken();
    if (!token) return;
    fetch(`/api/orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(order),
    }).catch(() => {});
  };

  const updateOrderStatus = (
    orderId: string,
    status: Order['fulfilmentStatus'],
    courier?: string,
    trackingNumber?: string
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const timelineEntry = {
          status: status.charAt(0).toUpperCase() + status.slice(1),
          timestamp: new Date().toISOString(),
          note: trackingNumber ? `Updated tracking: ${trackingNumber} (${courier || 'Courier'})` : `Status changed to ${status}`,
        };
        const next = {
          ...order,
          fulfilmentStatus: status,
          courier: courier || order.courier,
          trackingNumber: trackingNumber || order.trackingNumber,
          timeline: [...order.timeline, timelineEntry],
        };
        pushOrder(next);
        return next;
      })
    );
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const next: Order = {
          ...order,
          fulfilmentStatus: 'cancelled',
          paymentStatus: 'refunded',
          timeline: [
            ...order.timeline,
            {
              status: 'Cancelled & Refunded',
              timestamp: new Date().toISOString(),
              note: 'Order was cancelled and refund processed to original payment method.',
            },
          ],
        };
        pushOrder(next);
        return next;
      })
    );
  };

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    const token = adminAuthService.getToken();
    if (token) {
      try {
        await fetch('/api/store/design', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updated),
        });
      } catch (err) {
        console.warn('Backend store design sync warning:', err);
      }
    }
  };

  // Blog post operations
  const addBlogPost = (postData: Omit<BlogPost, 'id'>): BlogPost => {
    const newPost: BlogPost = {
      ...postData,
      id: `blog-${Date.now()}`,
    };
    markDirty('blogs');
    setBlogPosts((prev) => [newPost, ...prev]);
    return newPost;
  };

  const updateBlogPost = (post: BlogPost) => {
    markDirty('blogs');
    setBlogPosts((prev) => prev.map((b) => (b.id === post.id ? post : b)));
  };

  const deleteBlogPost = (postId: string) => {
    markDirty('blogs');
    setBlogPosts((prev) => prev.filter((b) => b.id !== postId));
  };

  const duplicateBlogPost = (postId: string): BlogPost => {
    const original = blogPosts.find((b) => b.id === postId);
    if (!original) throw new Error('Post not found');
    const duplicated: BlogPost = {
      ...original,
      id: `blog-${Date.now()}`,
      title: `${original.title} (Draft Copy)`,
      slug: `${original.slug}-copy-${Math.floor(100 + Math.random() * 900)}`,
      status: 'draft',
      isPublished: false,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    markDirty('blogs');
    setBlogPosts((prev) => [duplicated, ...prev]);
    return duplicated;
  };

  const toggleBlogPostStatus = (postId: string) => {
    markDirty('blogs');
    setBlogPosts((prev) =>
      prev.map((b) => {
        if (b.id !== postId) return b;
        const nextStatus = b.status === 'published' ? 'draft' : 'published';
        return {
          ...b,
          status: nextStatus,
          isPublished: nextStatus === 'published',
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  // CSV Import / Export
  const exportProductsCSV = (): string => {
    const headers = ['ID', 'Name', 'SKU', 'Category', 'Price', 'SalePrice', 'Stock', 'IsPublished'];
    const rows = products.map((p) => {
      const cat = categories.find((c) => c.id === p.categoryId)?.name || '';
      return [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`,
        p.sku,
        `"${cat}"`,
        p.price,
        p.salePrice ?? '',
        p.stock,
        p.isPublished,
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  };

  const importProductsCSV = (csvString: string, replaceAll: boolean = false): CsvImportResult => {
    try {
      if (!csvString || !csvString.trim()) {
        return { success: false, count: 0, error: 'Empty CSV input provided.' };
      }

      // 1. Try robust WooCommerce parsing
      const wooResult: WooParseResult = parseWooCommerceCsv(csvString, categories);

      if (wooResult.success && wooResult.products.length > 0) {
        if (replaceAll) {
          markDirty('products');
          setProducts(wooResult.products);
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(wooResult.products));
          return {
            success: true,
            count: wooResult.products.length,
            addedCount: wooResult.products.length,
            updatedCount: 0,
            totalParsed: wooResult.totalParsed,
            warnings: wooResult.warnings,
            missingImages: wooResult.missingImages,
            products: wooResult.products,
          };
        }

        // Merge without duplicates
        let updatedCount = 0;
        let addedCount = 0;
        const currentProducts = [...products];

        for (const importedProd of wooResult.products) {
          const existingIndex = currentProducts.findIndex(
            (p) =>
              (importedProd.sku && p.sku && p.sku.toLowerCase() === importedProd.sku.toLowerCase()) ||
              p.slug === importedProd.slug ||
              p.name.toLowerCase() === importedProd.name.toLowerCase()
          );

          if (existingIndex !== -1) {
            // Update existing
            currentProducts[existingIndex] = {
              ...currentProducts[existingIndex],
              ...importedProd,
              id: currentProducts[existingIndex].id, // preserve ID
            };
            updatedCount++;
          } else {
            currentProducts.push(importedProd);
            addedCount++;
          }
        }

        markDirty('products');
        setProducts(currentProducts);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(currentProducts));

        return {
          success: true,
          count: addedCount + updatedCount,
          addedCount,
          updatedCount,
          totalParsed: wooResult.totalParsed,
          warnings: wooResult.warnings,
          missingImages: wooResult.missingImages,
          products: wooResult.products,
        };
      }

      // If WooCommerce parser encountered fatal schema errors, return specific error
      if (wooResult.errors.length > 0) {
        return {
          success: false,
          count: 0,
          error: wooResult.errors.join(' | '),
          errors: wooResult.errors,
          warnings: wooResult.warnings,
        };
      }

      return { success: false, count: 0, error: 'No valid products could be parsed from the CSV.' };
    } catch (err: unknown) {
      return { success: false, count: 0, error: err instanceof Error ? err.message : 'Invalid CSV format' };
    }
  };

  // Analytics Metrics Computation
  const getAnalyticsMetrics = (): AnalyticsMetrics => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => (o.fulfilmentStatus !== 'cancelled' ? sum + o.total : sum), 0);
    const itemsSold = orders.reduce((sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const productViews: Record<string, number> = {};
    const categoryViews: Record<string, number> = {};
    const searchQueries: Record<string, number> = {};
    let addToCartCount = 0;
    let checkoutStartCount = 0;
    let purchaseCount = 0;

    analyticsEvents.forEach((ev) => {
      if (ev.type === 'product_view' && ev.targetName) {
        productViews[ev.targetName] = (productViews[ev.targetName] || 0) + 1;
      } else if (ev.type === 'category_view' && ev.targetName) {
        categoryViews[ev.targetName] = (categoryViews[ev.targetName] || 0) + 1;
      } else if (ev.type === 'search' && ev.query) {
        searchQueries[ev.query.toLowerCase()] = (searchQueries[ev.query.toLowerCase()] || 0) + 1;
      } else if (ev.type === 'add_to_cart') {
        addToCartCount++;
      } else if (ev.type === 'checkout_start') {
        checkoutStartCount++;
      } else if (ev.type === 'purchase') {
        purchaseCount++;
      }
    });

    const totalViews = Object.values(productViews).reduce((a, b) => a + b, 0);
    const conversionRate = totalViews > 0 ? Math.round((purchaseCount / totalViews) * 100 * 10) / 10 : 3.8;

    return {
      totalRevenue,
      totalOrders,
      itemsSold,
      averageOrderValue,
      productViews,
      categoryViews,
      searchQueries,
      addToCartCount,
      checkoutStartCount,
      purchaseCount,
      conversionRate,
    };
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        activeCategories,
        blogPosts,
        settings,
        orders,
        cart,
        wishlist,
        currentRoute,
        setRoute,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isSearchOpen,
        setIsSearchOpen,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartSubtotal,
        cartCount,
        toggleWishlist,
        isInWishlist,
        createOrder,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        updateStock,
        toggleProductPublish,
        addCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryActive,
        refreshAdminOrders,
        updateOrderStatus,
        cancelOrder,
        updateSettings,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        duplicateBlogPost,
        toggleBlogPostStatus,
        exportProductsCSV,
        importProductsCSV,
        trackEvent,
        getAnalyticsMetrics,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
