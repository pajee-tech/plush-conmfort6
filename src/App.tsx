import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { CookieConsent } from './components/CookieConsent';

// Pages
import { HomePage } from './pages/HomePage';
const ShopPage = React.lazy(() => import('./pages/ShopPage').then((m) => ({ default: m.ShopPage })));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage').then((m) => ({ default: m.CategoryPage })));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const BasketPage = React.lazy(() => import('./pages/BasketPage').then((m) => ({ default: m.BasketPage })));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = React.lazy(() => import('./pages/OrderConfirmationPage').then((m) => ({ default: m.OrderConfirmationPage })));
const AccountPage = React.lazy(() => import('./pages/AccountPage').then((m) => ({ default: m.AccountPage })));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage').then((m) => ({ default: m.WishlistPage })));
const SearchResultsPage = React.lazy(() => import('./pages/SearchResultsPage').then((m) => ({ default: m.SearchResultsPage })));
const AboutPage = React.lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const DeliveryPage = React.lazy(() => import('./pages/DeliveryPage').then((m) => ({ default: m.DeliveryPage })));
const ReturnsPage = React.lazy(() => import('./pages/ReturnsPage').then((m) => ({ default: m.ReturnsPage })));
const FaqPage = React.lazy(() => import('./pages/FaqPage').then((m) => ({ default: m.FaqPage })));
const PolicyPages = React.lazy(() => import('./pages/PolicyPages').then((m) => ({ default: m.PolicyPages })));
const BlogListPage = React.lazy(() => import('./pages/BlogListPage').then((m) => ({ default: m.BlogListPage })));
const BlogDetailPage = React.lazy(() => import('./pages/BlogDetailPage').then((m) => ({ default: m.BlogDetailPage })));
// The staff dashboard is large — load it only when /admin is opened (keeps the storefront fast)
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

export const AppContent: React.FC = () => {
  const { currentRoute } = useStore();

  // Enforce Google noindex on administrative and private customer checkout pages
  React.useEffect(() => {
    const noIndexRoutes = ['admin', 'checkout', 'basket', 'order-confirmation', 'account'];
    const shouldNoIndex = noIndexRoutes.includes(currentRoute.name);

    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }

    let metaGooglebot = document.querySelector('meta[name="googlebot"]');
    if (!metaGooglebot) {
      metaGooglebot = document.createElement('meta');
      metaGooglebot.setAttribute('name', 'googlebot');
      document.head.appendChild(metaGooglebot);
    }

    if (shouldNoIndex) {
      metaRobots.setAttribute('content', 'noindex, nofollow, noarchive');
      metaGooglebot.setAttribute('content', 'noindex, nofollow, noarchive');
    } else {
      metaRobots.setAttribute('content', 'index, follow, max-image-preview:large');
      metaGooglebot.setAttribute('content', 'index, follow, max-image-preview:large');
    }
  }, [currentRoute.name]);

  const renderCurrentView = () => {
    switch (currentRoute.name) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'category':
        return (
          <CategoryPage
            categorySlug={currentRoute.categorySlug}
            subcategorySlug={currentRoute.subcategorySlug}
          />
        );
      case 'product':
        return <ProductDetailPage slug={currentRoute.slug} />;
      case 'search':
        return <SearchResultsPage query={currentRoute.query} />;
      case 'basket':
        return <BasketPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'order-confirmation':
        return <OrderConfirmationPage orderId={currentRoute.orderId} />;
      case 'account':
        return <AccountPage />;
      case 'wishlist':
        return <WishlistPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'delivery':
        return <DeliveryPage />;
      case 'returns':
        return <ReturnsPage />;
      case 'faqs':
        return <FaqPage />;
      case 'privacy':
        return <PolicyPages type="privacy" />;
      case 'terms':
        return <PolicyPages type="terms" />;
      case 'cookies':
        return <PolicyPages type="cookies" />;
      case 'blog':
        return <BlogListPage />;
      case 'blog-detail':
        return <BlogDetailPage slug={currentRoute.slug} />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-[#221C18] bg-[#FAF8F5]">
      <Header />
      <main className="flex-1">
        <React.Suspense
          fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-[#E8E0D5] border-t-[#A25828] animate-spin" />
            </div>
          }
        >
          {renderCurrentView()}
        </React.Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <SearchModal />
      <CookieConsent />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
