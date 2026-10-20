import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { AdminUser, AuditLog, Order } from '../../types';
import { adminAuthService } from '../../services/adminAuthService';
import { ACCESS_AREAS, AccessAreaId, getEffectiveAccess } from '../../utils/permissions';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  Users,
  PoundSterling,
  Boxes,
  FileText,
  Layers,
  Activity,
  Server,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const gbp = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const timeAgo = (iso: string) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const Kpi: React.FC<{ label: string; value: React.ReactNode; hint?: React.ReactNode; icon: React.ComponentType<{ className?: string }>; tone?: 'default' | 'warn' }> = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}) => (
  <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5]">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">{label}</span>
      <Icon className={`w-4 h-4 ${tone === 'warn' ? 'text-amber-500' : 'text-[#A25828]'}`} />
    </div>
    <div className={`text-2xl sm:text-3xl font-serif font-bold mt-2 tabular-nums ${tone === 'warn' ? 'text-amber-600' : 'text-[#221C18]'}`}>{value}</div>
    {hint && <div className="text-[11px] text-stone-500 mt-1">{hint}</div>}
  </div>
);

const LogList: React.FC<{ logs: AuditLog[]; empty: string }> = ({ logs, empty }) =>
  logs.length === 0 ? (
    <p className="text-xs text-stone-400 py-6 text-center">{empty}</p>
  ) : (
    <ul className="divide-y divide-stone-100">
      {logs.map((l) => (
        <li key={l.id} className="py-2.5 flex items-start gap-3 text-xs">
          <span className="mt-1 w-2 h-2 rounded-full bg-[#A25828] shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-stone-800">
              <span className="font-semibold">{l.userName}</span> <span className="text-stone-500">·</span>{' '}
              <span className="font-mono text-[10px] text-[#A25828]">{l.action}</span>
            </div>
            <div className="text-stone-500 truncate" title={l.details}>{l.details}</div>
          </div>
          <span className="text-[10px] text-stone-400 whitespace-nowrap">{timeAgo(l.timestamp)}</span>
        </li>
      ))}
    </ul>
  );

/* ============================================================ */
/* OWNER / ADMIN OVERVIEW (WooCommerce-style store summary)      */
/* ============================================================ */
export const MasterOverview: React.FC<{ onOpenTab: (tab: string) => void }> = ({ onOpenTab }) => {
  const { orders, products, categories, blogPosts, refreshAdminOrders, getAnalyticsMetrics } = useStore();
  const [range, setRange] = useState<'7' | '30' | '90' | '365' | 'all'>('30');
  const [storeLogs, setStoreLogs] = useState<AuditLog[]>([]);
  const [techLogs, setTechLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    await refreshAdminOrders();
    const [s, t] = await Promise.all([
      adminAuthService.getAuditLogs({ scope: 'store', limit: 12 }),
      adminAuthService.getAuditLogs({ scope: 'technical', limit: 12 }),
    ]);
    setStoreLogs(s.logs);
    setTechLogs(t.logs);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const since = range === 'all' ? 0 : Date.now() - Number(range) * 86400000;
  const inRange = useMemo(() => orders.filter((o) => new Date(o.createdAt).getTime() >= since), [orders, since]);
  const valid = inRange.filter((o) => o.fulfilmentStatus !== 'cancelled');
  const gross = valid.reduce((a, o) => a + o.total, 0);
  const net = valid.reduce((a, o) => a + o.subtotal - o.discountAmount, 0);
  const itemsSold = valid.reduce((a, o) => a + o.items.reduce((x, i) => x + i.quantity, 0), 0);
  const customers = new Set(valid.map((o) => o.customer.email || o.customer.fullName)).size;
  const pending = orders.filter((o) => o.fulfilmentStatus === 'pending' || o.fulfilmentStatus === 'processing').length;
  const codDue = orders.filter((o) => o.paymentStatus === 'pending' && o.fulfilmentStatus !== 'cancelled').reduce((a, o) => a + o.total, 0);

  // Monthly sales (last 12 months)
  const months = useMemo(() => {
    const now = new Date();
    const list = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-GB', { month: 'short' }), total: 0, count: 0 };
    });
    orders.forEach((o) => {
      if (o.fulfilmentStatus === 'cancelled') return;
      const d = new Date(o.createdAt);
      const m = list.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (m) {
        m.total += o.total;
        m.count += 1;
      }
    });
    return list;
  }, [orders]);
  const maxMonth = Math.max(1, ...months.map((m) => m.total));

  const statusCounts = (['pending', 'processing', 'dispatched', 'delivered', 'cancelled'] as Order['fulfilmentStatus'][]).map((s) => ({
    status: s,
    count: inRange.filter((o) => o.fulfilmentStatus === s).length,
  }));

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    valid.forEach((o) =>
      o.items.forEach((i) => {
        const cur = map.get(i.productId) || { name: i.name, qty: 0, revenue: 0 };
        cur.qty += i.quantity;
        cur.revenue += i.price * i.quantity;
        map.set(i.productId, cur);
      })
    );
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [valid]);

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold);
  const outOfStock = products.filter((p) => p.stock <= 0);
  const stockUnits = products.reduce((a, p) => a + Math.max(0, p.stock), 0);
  const stockValue = products.reduce((a, p) => a + Math.max(0, p.stock) * (p.salePrice ?? p.price), 0);
  const metrics = getAnalyticsMetrics();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="font-serif font-bold text-2xl text-[#221C18]">Store overview</h2>
          <p className="text-xs text-stone-500">Sales, orders, inventory and every change made to the store — in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={range} onChange={(e) => setRange(e.target.value as any)} className="p-2 rounded-xl border border-stone-300 bg-white text-xs font-semibold">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last 12 months</option>
            <option value="all">All time</option>
          </select>
          <button onClick={load} className="p-2 rounded-xl border border-stone-300 bg-white" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sales KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Gross sales" value={gbp(gross)} hint={`${valid.length} orders (excl. cancelled)`} icon={PoundSterling} />
        <Kpi label="Net sales" value={gbp(net)} hint="After discounts, before delivery" icon={TrendingUp} />
        <Kpi label="Average order" value={gbp(valid.length ? gross / valid.length : 0)} hint={`${itemsSold} items sold`} icon={ShoppingBag} />
        <Kpi label="Customers" value={customers} hint={`${pending} orders to fulfil`} icon={Users} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Monthly sales chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#E8E0D5]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif font-bold text-base text-[#221C18]">Monthly sales (last 12 months)</h3>
            <span className="text-xs text-stone-500">Cash due on delivery: <strong className="text-[#A25828]">{gbp(codDue)}</strong></span>
          </div>
          <div className="h-48 flex items-end gap-2">
            {months.map((m) => (
              <div key={m.key} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[9px] text-stone-500 opacity-0 group-hover:opacity-100 tabular-nums">{m.total ? `£${Math.round(m.total)}` : ''}</span>
                <div
                  className="w-full rounded-t-md bg-[#A25828]/85 group-hover:bg-[#A25828] transition-colors min-h-[2px]"
                  style={{ height: `${(m.total / maxMonth) * 150}px` }}
                  title={`${m.label}: ${gbp(m.total)} · ${m.count} orders`}
                />
                <span className="text-[10px] text-stone-500">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order status */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5]">
          <h3 className="font-serif font-bold text-base text-[#221C18] mb-3">Orders by status</h3>
          <ul className="space-y-2 text-xs">
            {statusCounts.map((s) => (
              <li key={s.status} className="flex items-center justify-between">
                <span className="capitalize text-stone-600">{s.status}</span>
                <span className="font-bold tabular-nums">{s.count}</span>
              </li>
            ))}
          </ul>
          <button onClick={() => onOpenTab('orders')} className="mt-4 text-xs font-bold text-[#A25828] hover:underline inline-flex items-center gap-1">
            Manage orders <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inventory */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Products" value={products.length} hint={`${products.filter((p) => p.isPublished).length} published · ${products.filter((p) => !p.isPublished).length} drafts`} icon={Package} />
        <Kpi label="Units in stock" value={stockUnits} hint={`Stock value ${gbp(stockValue)}`} icon={Boxes} />
        <Kpi label="Low stock" value={lowStock.length} hint="At or below threshold" icon={AlertTriangle} tone={lowStock.length ? 'warn' : 'default'} />
        <Kpi label="Out of stock" value={outOfStock.length} hint={`${categories.length} categories · ${blogPosts.length} articles`} icon={Layers} tone={outOfStock.length ? 'warn' : 'default'} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5]">
          <h3 className="font-serif font-bold text-base text-[#221C18] mb-3">Top products by revenue</h3>
          {topProducts.length === 0 ? (
            <p className="text-xs text-stone-400">No sales in this period yet.</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="text-stone-400 uppercase text-[10px]">
                <tr>
                  <th className="text-left pb-2">Product</th>
                  <th className="text-right pb-2">Qty</th>
                  <th className="text-right pb-2">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {topProducts.map((p) => (
                  <tr key={p.name}>
                    <td className="py-2 pr-2 truncate max-w-[220px]">{p.name}</td>
                    <td className="py-2 text-right tabular-nums">{p.qty}</td>
                    <td className="py-2 text-right font-semibold tabular-nums">{gbp(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5]">
          <h3 className="font-serif font-bold text-base text-[#221C18] mb-3">Stock alerts</h3>
          {[...outOfStock, ...lowStock].length === 0 ? (
            <p className="text-xs text-stone-400">All products are well stocked.</p>
          ) : (
            <ul className="divide-y divide-stone-100 text-xs">
              {[...outOfStock, ...lowStock].slice(0, 8).map((p) => (
                <li key={p.id} className="py-2 flex items-center justify-between gap-2">
                  <span className="truncate">{p.name}</span>
                  <span className={`font-bold ${p.stock <= 0 ? 'text-red-600' : 'text-amber-600'}`}>{p.stock <= 0 ? 'Out of stock' : `${p.stock} left`}</span>
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => onOpenTab('products')} className="mt-3 text-xs font-bold text-[#A25828] hover:underline inline-flex items-center gap-1">
            Update stock <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5]">
        <h3 className="font-serif font-bold text-base text-[#221C18] mb-3">Recent orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-stone-400 uppercase text-[10px]">
              <tr>
                <th className="text-left pb-2">Order</th>
                <th className="text-left pb-2">Date</th>
                <th className="text-left pb-2">Customer</th>
                <th className="text-left pb-2">Status</th>
                <th className="text-right pb-2">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.slice(0, 6).map((o) => (
                <tr key={o.id}>
                  <td className="py-2 font-mono font-bold">{o.orderNumber}</td>
                  <td className="py-2">{new Date(o.createdAt).toLocaleDateString('en-GB')}</td>
                  <td className="py-2">{o.customer.fullName}</td>
                  <td className="py-2 capitalize">{o.fulfilmentStatus}</td>
                  <td className="py-2 text-right font-semibold">{gbp(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Traffic summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Kpi label="Product views" value={Object.values(metrics.productViews).reduce((a, b) => a + b, 0)} hint="This browser's tracked events" icon={Activity} />
        <Kpi label="Add to basket" value={metrics.addToCartCount} icon={ShoppingBag} />
        <Kpi label="Checkouts" value={metrics.checkoutStartCount} icon={TrendingUp} />
        <Kpi label="Articles" value={blogPosts.filter((b) => b.isPublished).length} hint={`${blogPosts.filter((b) => !b.isPublished).length} drafts`} icon={FileText} />
      </div>

      {/* Change history */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif font-bold text-base text-[#221C18] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#A25828]" /> Store change history
            </h3>
            <button onClick={() => onOpenTab('audit')} className="text-[11px] font-bold text-[#A25828] hover:underline">View all</button>
          </div>
          <p className="text-[11px] text-stone-500 mb-2">Products, categories, design, content, settings and orders.</p>
          <LogList logs={storeLogs} empty="No store changes recorded yet." />
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif font-bold text-base text-[#221C18] flex items-center gap-2">
              <Server className="w-4 h-4 text-[#A25828]" /> Technical &amp; security log
            </h3>
            <button onClick={() => onOpenTab('audit')} className="text-[11px] font-bold text-[#A25828] hover:underline">View all</button>
          </div>
          <p className="text-[11px] text-stone-500 mb-2">Sign-ins, failed logins, password changes, sessions and staff accounts.</p>
          <LogList logs={techLogs} empty="No technical events yet." />
        </div>
      </div>
    </div>
  );
};

/* ============================================================ */
/* STAFF OVERVIEW — only shows what this person can access       */
/* ============================================================ */
export const StaffOverview: React.FC<{ user: AdminUser; onOpenTab: (tab: string) => void }> = ({ user, onOpenTab }) => {
  const { products, orders, blogPosts, categories, refreshAdminOrders } = useStore();
  const access = getEffectiveAccess(user);
  const can = (a: AccessAreaId) => access.includes(a);
  const [myLogs, setMyLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    adminAuthService.getAuditLogs({ mine: true, limit: 15 }).then((r) => setMyLogs(r.logs));
    if (can('orders')) refreshAdminOrders();
  }, []);

  const today = new Date().toDateString();
  const myToday = myLogs.filter((l) => new Date(l.timestamp).toDateString() === today).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl border border-[#E8E0D5]">
        <h2 className="font-serif font-bold text-2xl text-[#221C18]">Welcome back, {user.name.split(' ')[0]}</h2>
        <p className="text-xs text-stone-500 mt-1">
          Your role: <strong className="capitalize">{user.role}</strong> · You made {myToday} change{myToday === 1 ? '' : 's'} today.
        </p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {ACCESS_AREAS.filter((a) => can(a.id) && a.id !== 'overview').map((a) => (
            <button
              key={a.id}
              onClick={() => onOpenTab(a.id)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#FAF2EB] text-[#8A461A] border border-[#EEDFD0] hover:bg-[#A25828] hover:text-white"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {can('products') && (
          <>
            <Kpi label="Products" value={products.length} hint={`${products.filter((p) => !p.isPublished).length} drafts`} icon={Package} />
            <Kpi
              label="Low / out of stock"
              value={products.filter((p) => p.stock <= p.lowStockThreshold).length}
              hint="Needs attention"
              icon={AlertTriangle}
              tone={products.some((p) => p.stock <= p.lowStockThreshold) ? 'warn' : 'default'}
            />
          </>
        )}
        {can('orders') && (
          <>
            <Kpi label="Orders to fulfil" value={orders.filter((o) => ['pending', 'processing'].includes(o.fulfilmentStatus)).length} icon={ShoppingBag} />
            <Kpi label="Dispatched" value={orders.filter((o) => o.fulfilmentStatus === 'dispatched').length} hint="On the way to customers" icon={TrendingUp} />
          </>
        )}
        {can('content') && (
          <>
            <Kpi label="Published articles" value={blogPosts.filter((b) => b.isPublished).length} icon={FileText} />
            <Kpi label="Draft articles" value={blogPosts.filter((b) => !b.isPublished).length} icon={FileText} />
          </>
        )}
        {can('categories') && <Kpi label="Categories" value={categories.length} hint={`${categories.filter((c) => !c.isActive).length} hidden`} icon={Layers} />}
      </div>

      {can('products') && products.some((p) => p.stock <= p.lowStockThreshold) && (
        <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5]">
          <h3 className="font-serif font-bold text-base text-[#221C18] mb-2">Stock alerts</h3>
          <ul className="divide-y divide-stone-100 text-xs">
            {products
              .filter((p) => p.stock <= p.lowStockThreshold)
              .slice(0, 6)
              .map((p) => (
                <li key={p.id} className="py-2 flex justify-between">
                  <span className="truncate">{p.name}</span>
                  <span className="font-bold text-amber-600">{p.stock} left</span>
                </li>
              ))}
          </ul>
        </div>
      )}

      <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5]">
        <h3 className="font-serif font-bold text-base text-[#221C18] mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#A25828]" /> My recent activity
        </h3>
        <LogList logs={myLogs} empty="Nothing yet — your changes will appear here." />
      </div>
    </div>
  );
};
