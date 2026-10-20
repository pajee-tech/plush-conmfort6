import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Category, StoreSettings, AdminUser } from '../types';
import {
  BarChart3,
  Package,
  Layers,
  ShoppingBag,
  FileText,
  Settings,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Download,
  Upload,
  Search,
  Eye,
  EyeOff,
  Palette,
  Shield,
  Users,
  LogOut,
  UserCircle,
  ExternalLink,
  Check,
} from 'lucide-react';
import { AdminAuthGate } from '../components/admin/AdminAuthGate';
import { ProductEditorModal } from '../components/admin/ProductEditorModal';
import { CategoryEditorModal } from '../components/admin/CategoryEditorModal';
import { StoreDesignStudio } from '../components/admin/StoreDesignStudio';
import { AuditLogsViewer } from '../components/admin/AuditLogsViewer';
import { UsersRolesManager } from '../components/admin/UsersRolesManager';
import { CmsDashboard } from '../components/cms/CmsDashboard';
import { WooCommerceProductImporter } from '../components/admin/WooCommerceProductImporter';
import { MasterOverview, StaffOverview } from '../components/admin/AdminOverview';
import { ImageField } from '../components/admin/SeoImageField';
import { adminAuthService } from '../services/adminAuthService';
import { AccessAreaId, getEffectiveAccess } from '../utils/permissions';

type TabId = AccessAreaId | 'users' | 'account';

const EMPTY_CATEGORY: Category = {
  id: '',
  name: '',
  slug: '',
  description: '',
  bottomSeoDescription: '',
  image: '',
  bannerImage: '',
  showBanner: true,
  isActive: true,
  order: 99,
  subcategories: [],
  robotsIndexing: 'index, follow',
};

interface AdminDashboardContentProps {
  currentUser: AdminUser;
  onLogout: () => void;
  onUserUpdate: (u: AdminUser) => void;
}

const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({ currentUser, onLogout, onUserUpdate }) => {
  const {
    products,
    categories,
    orders,
    blogPosts,
    settings,
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
    updateOrderStatus,
    updateSettings,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    duplicateBlogPost,
    toggleBlogPostStatus,
    exportProductsCSV,
    getAnalyticsMetrics,
    refreshAdminOrders,
    setRoute,
  } = useStore();

  const isMaster = currentUser.role === 'master_admin';
  const access = getEffectiveAccess(currentUser);
  const can = (a: AccessAreaId) => access.includes(a);

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [productSearch, setProductSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [showWooImporter, setShowWooImporter] = useState(false);
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // My account
  const [meName, setMeName] = useState(currentUser.name);
  const [mePhone, setMePhone] = useState(currentUser.phone || '');
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwNew2, setPwNew2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [accountMsg, setAccountMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => setSettingsForm(settings), [settings]);
  useEffect(() => {
    if (activeTab === 'orders') refreshAdminOrders();
  }, [activeTab]);

  const flash = (msg: string) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(null), 3000);
  };

  const metrics = getAnalyticsMetrics();
  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);

  const handleDownloadCSV = () => {
    const blob = new Blob([exportProductsCSV()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `plush_comfort_products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    flash('Settings saved — live on the website.');
  };

  const allTabs: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }>; show: boolean }> = [
    { id: 'overview', label: 'Overview', icon: BarChart3, show: true },
    { id: 'products', label: 'Products & Variations', icon: Package, show: can('products') },
    { id: 'categories', label: 'Categories & SEO', icon: Layers, show: can('categories') },
    { id: 'content', label: 'Blogs, Guides & Pillars', icon: FileText, show: can('content') },
    { id: 'design', label: 'Store Design', icon: Palette, show: can('design') },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, show: can('orders') },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, show: can('analytics') },
    { id: 'settings', label: 'Settings & Global SEO', icon: Settings, show: can('settings') },
    { id: 'audit', label: 'Activity Logs', icon: Shield, show: can('audit') },
    { id: 'users', label: 'Staff & Roles', icon: Users, show: isMaster },
    { id: 'account', label: 'My Account', icon: UserCircle, show: true },
  ];
  const availableTabs = allTabs.filter((t) => t.show);

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#221C18] pb-24">
      {/* Admin header */}
      <div className="bg-[#221C18] text-white border-b border-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#A25828] flex items-center justify-center font-serif font-bold text-base">PC</div>
            <div>
              <h1 className="font-serif font-bold text-lg text-white leading-none">Plush Comfort Dashboard</h1>
              <span className="text-[11px] text-stone-400">
                {isMaster ? 'Owner (Master) access' : `Staff access · ${currentUser.role}`}
              </span>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-2.5">
            <div className="hidden sm:flex items-center gap-2 bg-stone-900/90 px-3 py-1.5 rounded-lg border border-stone-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-stone-300 font-medium">{currentUser.name}</span>
            </div>
            <button onClick={() => setRoute({ name: 'home' })} className="text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-lg">
              &larr; View Website
            </button>
            <button onClick={onLogout} className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg font-bold">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-1 border-t border-stone-800 scrollbar-none">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold whitespace-nowrap border-b-2 ${
                  isActive ? 'border-[#A25828] text-white bg-stone-900' : 'border-transparent text-stone-400 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#A25828]' : ''}`} />
                <span>{tab.label}</span>
                {tab.id === 'products' && lowStockProducts.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-500" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {savedMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold text-xs flex items-center gap-2">
            <Check className="w-4 h-4" /> {savedMsg}
          </div>
        )}

        {/* ========== OVERVIEW ========== */}
        {activeTab === 'overview' &&
          (isMaster || (currentUser.role === 'admin' && can('orders') && can('products')) ? (
            <MasterOverview onOpenTab={(t) => setActiveTab(t as TabId)} />
          ) : (
            <StaffOverview user={currentUser} onOpenTab={(t) => setActiveTab(t as TabId)} />
          ))}

        {/* ========== PRODUCTS ========== */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-5 rounded-3xl border border-[#E8E0D5] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search products by name or SKU…"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5]"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 justify-end">
                <button onClick={() => setShowWooImporter(true)} className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> Import CSV
                </button>
                <button onClick={handleDownloadCSV} className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
                <button onClick={() => setIsCreatingProduct(true)} className="bg-[#A25828] hover:bg-[#8A461A] text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#E8E0D5] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-stone-700">
                  <thead className="bg-[#FAF8F5] text-stone-500 uppercase tracking-wider text-[10px] border-b border-[#E8E0D5] font-bold">
                    <tr>
                      <th className="py-3 px-4">Photo</th>
                      <th className="py-3 px-4">Name &amp; SKU</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price (£)</th>
                      <th className="py-3 px-4">Options</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {products
                      .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()))
                      .map((p) => {
                        const cat = categories.find((c) => c.id === p.categoryId)?.name || '';
                        const isLow = p.stock <= p.lowStockThreshold;
                        return (
                          <tr key={p.id} className="hover:bg-stone-50/50">
                            <td className="py-3 px-4">
                              <img src={p.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover border border-[#E8E0D5]" />
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-stone-900 block">{p.name}</span>
                              <span className="text-[11px] text-stone-400 font-mono">SKU: {p.sku}</span>
                            </td>
                            <td className="py-3 px-4 text-stone-600">{cat}</td>
                            <td className="py-3 px-4 font-bold tabular-nums">
                              £{(p.salePrice ?? p.price).toFixed(2)}
                              {p.salePrice && <span className="block text-[10px] text-stone-400 line-through">£{p.price.toFixed(2)}</span>}
                            </td>
                            <td className="py-3 px-4">
                              <span className="bg-[#FAF2EB] text-[#A25828] px-2 py-0.5 rounded-full font-bold text-[10px] whitespace-nowrap">
                                {p.variations?.length || 0} sizes · {p.colours.length} colours
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="number"
                                min="0"
                                value={p.stock}
                                onChange={(e) => updateStock(p.id, parseInt(e.target.value, 10) || 0)}
                                className={`w-16 px-2 py-1 border rounded-lg font-mono font-bold ${isLow ? 'border-amber-500 bg-amber-50' : 'border-stone-200'}`}
                              />
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => toggleProductPublish(p.id)}
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${p.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}
                              >
                                {p.isPublished ? 'Published' : 'Draft'}
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-1">
                                <a href={`/product/${p.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-stone-400 hover:text-[#A25828]" title="Preview on website">
                                  <Eye className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={() => {
                                    duplicateProduct(p.id);
                                    adminAuthService.logAudit('PRODUCT_DUPLICATED', 'products', p.name, `${currentUser.name} duplicated ${p.name}`);
                                  }}
                                  className="p-1.5 text-stone-400 hover:text-stone-700"
                                  title="Duplicate"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setEditingProduct(p)} className="p-1.5 text-stone-400 hover:text-[#A25828]" title="Edit">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete ${p.name}?`)) {
                                      deleteProduct(p.id);
                                      adminAuthService.logAudit('PRODUCT_DELETED', 'products', p.name, `${currentUser.name} deleted product ${p.name}`);
                                    }
                                  }}
                                  className="p-1.5 text-stone-400 hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========== CATEGORIES ========== */}
        {activeTab === 'categories' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E0D5] space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#221C18]">Categories</h3>
                <p className="text-xs text-stone-500 mt-1">Create, preview, edit, hide or delete categories. Each one has its own banner, description, FAQs and SEO.</p>
              </div>
              <button
                onClick={() => {
                  setIsCreatingCategory(true);
                  setEditingCategory({ ...EMPTY_CATEGORY, order: categories.length + 1 });
                }}
                className="bg-[#A25828] hover:bg-[#8A461A] text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> New Category
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories
                .slice()
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((cat) => {
                  const count = products.filter((p) => p.categoryId === cat.id).length;
                  const parent = cat.parentId ? categories.find((c) => c.id === cat.parentId) : undefined;
                  return (
                    <div key={cat.id} className="p-4 rounded-2xl border border-[#E8E0D5] bg-[#FAF8F5] flex gap-4">
                      <img src={cat.bannerImage || cat.image} alt="" className="w-24 h-24 rounded-xl object-cover bg-white border border-stone-200 shrink-0" />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-serif font-bold text-base text-[#221C18]">{cat.name}</h4>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cat.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                            {cat.isActive ? 'Live' : 'Hidden'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          /category/{cat.slug} · {count} products{parent ? ` · inside ${parent.name}` : ''}
                        </p>
                        <p className="text-xs text-stone-600 line-clamp-2">{cat.description}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <a
                            href={`/category/${cat.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-white border border-[#D5C7B7] text-stone-700 text-[11px] font-semibold rounded-lg inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Preview
                          </a>
                          <button
                            onClick={() => {
                              setIsCreatingCategory(false);
                              setEditingCategory(cat);
                            }}
                            className="px-2.5 py-1 bg-white border border-[#D5C7B7] hover:border-[#A25828] text-[#A25828] text-[11px] font-bold rounded-lg"
                          >
                            Edit &amp; SEO
                          </button>
                          <button
                            onClick={() => {
                              toggleCategoryActive(cat.id);
                              adminAuthService.logAudit('CATEGORY_VISIBILITY', 'categories', cat.name, `${currentUser.name} ${cat.isActive ? 'hid' : 'published'} ${cat.name}`);
                            }}
                            className="px-2.5 py-1 bg-white border border-[#D5C7B7] text-stone-700 text-[11px] font-semibold rounded-lg inline-flex items-center gap-1"
                          >
                            {cat.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            {cat.isActive ? 'Hide' : 'Show'}
                          </button>
                          <button
                            onClick={() => {
                              const msg = count
                                ? `${cat.name} still has ${count} product(s). They will stay in the catalogue but without this category until you move them. Delete anyway?`
                                : `Delete the category ${cat.name}?`;
                              if (confirm(msg)) {
                                deleteCategory(cat.id);
                                adminAuthService.logAudit('CATEGORY_DELETED', 'categories', cat.name, `${currentUser.name} deleted category ${cat.name}`);
                              }
                            }}
                            className="px-2.5 py-1 bg-white border border-red-200 text-red-600 text-[11px] font-semibold rounded-lg inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ========== STORE DESIGN (one merged tab) ========== */}
        {activeTab === 'design' && <StoreDesignStudio />}

        {/* ========== ACTIVITY LOGS ========== */}
        {activeTab === 'audit' && <AuditLogsViewer />}

        {/* ========== STAFF ========== */}
        {activeTab === 'users' && isMaster && <UsersRolesManager />}

        {/* ========== ORDERS ========== */}
        {activeTab === 'orders' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E0D5] space-y-6 animate-fade-in">
            <div>
              <h3 className="font-serif font-bold text-xl text-[#221C18]">Customer Orders</h3>
              <p className="text-xs text-stone-500 mt-1">All website orders are saved on the server. Change the status as you pack, dispatch and deliver.</p>
            </div>
            <div className="border border-stone-200 rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200 font-bold">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-stone-50/50 align-top">
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">{o.orderNumber}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString('en-GB')}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold block">{o.customer.fullName}</span>
                        <span className="text-[11px] text-stone-400 font-mono">{o.customer.email}</span>
                        <span className="text-[10px] text-stone-500 block">{o.customer.phone} · {o.customer.postcode}</span>
                      </td>
                      <td className="py-3 px-4">
                        {o.items.map((it, idx) => (
                          <div key={idx} className="truncate max-w-xs">
                            {it.quantity}× {it.name}
                            {it.selectedConfiguration ? ` (${it.selectedConfiguration})` : ''}
                            {it.selectedColour ? ` · ${it.selectedColour}` : ''}
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4 tabular-nums">
                        <span className="font-bold text-stone-900 block">£{o.total.toFixed(2)}</span>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                          {o.paymentMethod === 'cod' ? `Cash on Delivery · ${o.paymentStatus}` : o.paymentMethod.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={o.fulfilmentStatus}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                          className="p-1.5 rounded-lg border border-stone-300 bg-white text-xs font-semibold"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== CONTENT ========== */}
        {activeTab === 'content' && (
          <CmsDashboard
            blogPosts={blogPosts}
            products={products}
            categories={categories}
            onAddPost={addBlogPost}
            onUpdatePost={updateBlogPost}
            onDeletePost={deleteBlogPost}
            onDuplicatePost={duplicateBlogPost}
            onToggleStatus={toggleBlogPostStatus}
            onNavigateToPost={(slug) => window.open(`/blog/${slug}`, '_blank', 'noopener')}
          />
        )}

        {/* ========== SETTINGS & GLOBAL SEO ========== */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6 animate-fade-in text-xs">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E0D5] space-y-4">
              <h3 className="font-serif font-bold text-xl text-[#221C18]">Contact &amp; delivery</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Phone helpline</label>
                  <input value={settingsForm.phone} onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })} className="w-full p-2.5 rounded-xl border border-stone-300" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">WhatsApp number</label>
                  <input value={settingsForm.whatsapp} onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })} className="w-full p-2.5 rounded-xl border border-stone-300" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Support email</label>
                  <input type="email" value={settingsForm.email} onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })} className="w-full p-2.5 rounded-xl border border-stone-300" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Customer support hours</label>
                  <input value={settingsForm.businessHours} onChange={(e) => setSettingsForm({ ...settingsForm, businessHours: e.target.value })} className="w-full p-2.5 rounded-xl border border-stone-300" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Registered business address (legal pages only — not shown as a shop)</label>
                  <input value={settingsForm.address} onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })} className="w-full p-2.5 rounded-xl border border-stone-300" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t">
                <div>
                  <label className="block font-semibold mb-1">Free delivery threshold (£)</label>
                  <input type="number" value={settingsForm.freeDeliveryThreshold} onChange={(e) => setSettingsForm({ ...settingsForm, freeDeliveryThreshold: Number(e.target.value) })} className="w-full p-2.5 rounded-xl border border-stone-300" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Standard delivery fee (£)</label>
                  <input type="number" step="0.01" value={settingsForm.standardDeliveryFee} onChange={(e) => setSettingsForm({ ...settingsForm, standardDeliveryFee: Number(e.target.value) })} className="w-full p-2.5 rounded-xl border border-stone-300" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Premium (assembly) delivery fee (£)</label>
                  <input type="number" step="0.01" value={settingsForm.whiteGloveDeliveryFee} onChange={(e) => setSettingsForm({ ...settingsForm, whiteGloveDeliveryFee: Number(e.target.value) })} className="w-full p-2.5 rounded-xl border border-stone-300" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E0D5] space-y-4">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#221C18]">Global SEO settings</h3>
                <p className="text-stone-500 mt-1">Used on every page that has no own SEO values. Product, category and article pages have their own SEO tabs.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Title suffix (added to page titles)</label>
                  <input value={settingsForm.defaultSeoTitleSuffix || ''} placeholder="| Plush Comfort UK" onChange={(e) => setSettingsForm({ ...settingsForm, defaultSeoTitleSuffix: e.target.value })} className="w-full p-2.5 rounded-xl border border-stone-300" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Default meta description</label>
                  <input value={settingsForm.defaultMetaDescription || ''} onChange={(e) => setSettingsForm({ ...settingsForm, defaultMetaDescription: e.target.value })} className="w-full p-2.5 rounded-xl border border-stone-300" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Google Search Console verification code</label>
                  <input value={settingsForm.googleSiteVerification || ''} placeholder="content value only" onChange={(e) => setSettingsForm({ ...settingsForm, googleSiteVerification: e.target.value })} className="w-full p-2.5 rounded-xl border border-stone-300 font-mono" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Bing Webmaster verification code</label>
                  <input value={settingsForm.bingSiteVerification || ''} onChange={(e) => setSettingsForm({ ...settingsForm, bingSiteVerification: e.target.value })} className="w-full p-2.5 rounded-xl border border-stone-300 font-mono" />
                </div>
              </div>
              <ImageField
                label="Default social share image (Open Graph & Twitter card)"
                value={settingsForm.defaultOgImage}
                onChange={(url) => setSettingsForm({ ...settingsForm, defaultOgImage: url })}
                fallback={settingsForm.logoUrl}
                fallbackLabel="logo"
                help="Used on the homepage, shop, blog list and policy pages, and on any page without its own image. Best size 1200 × 630px."
              />
            </div>

            <button type="submit" className="bg-[#A25828] text-white px-8 py-3 rounded-full font-bold hover:bg-[#8A461A]">
              Save Settings
            </button>
          </form>
        )}

        {/* ========== ANALYTICS ========== */}
        {activeTab === 'analytics' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E0D5] space-y-6 animate-fade-in">
            <h3 className="font-serif font-bold text-xl text-[#221C18]">Storefront analytics (this browser)</h3>
            <p className="text-xs text-stone-500">For full visitor analytics connect Google Analytics 4 — see the README.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                ['Product views', Object.values(metrics.productViews).reduce((a, b) => a + b, 0)],
                ['Add to basket', metrics.addToCartCount],
                ['Purchases', metrics.purchaseCount],
                ['Conversion rate', `${metrics.conversionRate}%`],
              ].map(([l, v]) => (
                <div key={l as string} className="p-4 bg-[#FAF8F5] rounded-2xl border">
                  <span className="text-[10px] text-stone-400 font-bold uppercase">{l}</span>
                  <span className="text-2xl font-bold block mt-1">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== MY ACCOUNT ========== */}
        {activeTab === 'account' && (
          <div className="grid lg:grid-cols-2 gap-6 animate-fade-in text-xs">
            <div className="bg-white p-6 rounded-3xl border border-[#E8E0D5] space-y-4">
              <h3 className="font-serif font-bold text-xl text-[#221C18]">My details</h3>
              {accountMsg && (
                <div className={`p-3 rounded-xl font-semibold ${accountMsg.kind === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>{accountMsg.text}</div>
              )}
              <div>
                <label className="block font-semibold mb-1">Name</label>
                <input value={meName} onChange={(e) => setMeName(e.target.value)} className="w-full p-2.5 rounded-xl border border-stone-300" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email (username)</label>
                <input value={currentUser.email} disabled className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-500" />
              </div>
              <div>
                <label className="block font-semibold mb-1">WhatsApp number {isMaster && '(used for WhatsApp login codes)'}</label>
                <input value={mePhone} onChange={(e) => setMePhone(e.target.value)} placeholder="+44 7…" className="w-full p-2.5 rounded-xl border border-stone-300" />
              </div>
              <button
                onClick={async () => {
                  const r = await adminAuthService.updateMe({ name: meName, phone: mePhone });
                  if (r.success && r.user) {
                    onUserUpdate(r.user);
                    setAccountMsg({ kind: 'ok', text: 'Details saved.' });
                  } else setAccountMsg({ kind: 'err', text: r.error || 'Could not save.' });
                }}
                className="bg-[#A25828] text-white px-6 py-2.5 rounded-full font-bold"
              >
                Save details
              </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E8E0D5] space-y-4">
              <h3 className="font-serif font-bold text-xl text-[#221C18]">Password</h3>
              {isMaster ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (pwNew !== pwNew2) return setAccountMsg({ kind: 'err', text: 'New passwords do not match.' });
                    const r = await adminAuthService.changeMyPassword(pwCurrent, pwNew);
                    setAccountMsg(r.success ? { kind: 'ok', text: 'Password changed.' } : { kind: 'err', text: r.error || 'Failed.' });
                    if (r.success) {
                      setPwCurrent('');
                      setPwNew('');
                      setPwNew2('');
                    }
                  }}
                  className="space-y-3"
                >
                  {[
                    ['Current password', pwCurrent, setPwCurrent],
                    ['New password', pwNew, setPwNew],
                    ['Confirm new password', pwNew2, setPwNew2],
                  ].map(([label, val, set]) => (
                    <div key={label as string}>
                      <label className="block font-semibold mb-1">{label as string}</label>
                      <input
                        type={showPw ? 'text' : 'password'}
                        required
                        minLength={label === 'Current password' ? 1 : 8}
                        value={val as string}
                        onChange={(e) => (set as (v: string) => void)(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-stone-300"
                      />
                    </div>
                  ))}
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} /> Show passwords
                  </label>
                  <button type="submit" className="bg-[#221C18] text-white px-6 py-2.5 rounded-full font-bold">
                    Change password
                  </button>
                  <p className="text-[11px] text-stone-500">Forgot it? On the sign-in screen use “Forgot password?” to get a reset code by email or WhatsApp.</p>
                </form>
              ) : (
                <div className="space-y-3">
                  <p className="text-stone-600 leading-relaxed">
                    Staff passwords are set by the store owner. If you need a new password, send a request — the owner will see it in
                    <strong> Staff &amp; Roles</strong>.
                  </p>
                  <button
                    onClick={async () => {
                      const r = await adminAuthService.requestPasswordResetFromOwner(currentUser.email, 'Requested from My Account');
                      setAccountMsg(r.success ? { kind: 'ok', text: 'Request sent to the owner.' } : { kind: 'err', text: (r as any).error || 'Failed.' });
                    }}
                    className="bg-[#A25828] text-white px-6 py-2.5 rounded-full font-bold"
                  >
                    Request password change
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {(editingProduct || isCreatingProduct) && (
        <ProductEditorModal
          product={editingProduct}
          isNew={isCreatingProduct}
          onClose={() => {
            setEditingProduct(null);
            setIsCreatingProduct(false);
          }}
          onSave={(saved) => {
            if (isCreatingProduct) {
              addProduct(saved);
              setIsCreatingProduct(false);
            } else {
              updateProduct(saved);
              setEditingProduct(null);
            }
            flash(`${saved.name} saved — live on the website.`);
          }}
        />
      )}

      {editingCategory && (
        <CategoryEditorModal
          category={editingCategory}
          isNew={isCreatingCategory}
          onClose={() => {
            setEditingCategory(null);
            setIsCreatingCategory(false);
          }}
          onSave={(saved) => {
            if (isCreatingCategory) {
              const { id, ...rest } = saved;
              addCategory(rest);
            } else {
              updateCategory(saved);
            }
            flash(`Category ${saved.name} saved.`);
            setEditingCategory(null);
            setIsCreatingCategory(false);
          }}
        />
      )}

      {showWooImporter && <WooCommerceProductImporter onClose={() => setShowWooImporter(false)} />}
    </div>
  );
};

export const AdminDashboard: React.FC = () => (
  <AdminAuthGate>
    {({ user, onLogout, onUserUpdate }) => <AdminDashboardContent currentUser={user} onLogout={onLogout} onUserUpdate={onUserUpdate} />}
  </AdminAuthGate>
);

export default AdminDashboard;
