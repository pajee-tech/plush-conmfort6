import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import { fetchFirestoreOrders } from '../services/orderService';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  ChevronRight,
  User,
  MapPin,
  Printer,
  Search,
  ExternalLink,
  MessageCircle,
  ShoppingBag,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { orders: storeOrders, setRoute, addToCart, settings } = useStore();
  const [realOrders, setRealOrders] = useState<Order[]>(storeOrders);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'processing' | 'dispatched' | 'delivered'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState<boolean>(false);

  // Fetch real order data from Firestore collection 'orders'
  useEffect(() => {
    let isMounted = true;
    async function loadOrders() {
      setLoading(true);
      try {
        const fetched = await fetchFirestoreOrders();
        if (isMounted) {
          const allOrders = fetched.length > 0 ? fetched : storeOrders;
          setRealOrders(allOrders);
          setSelectedOrder((prev) => {
            if (!prev) return allOrders[0] || null;
            return allOrders.find((o) => o.id === prev.id) || allOrders[0] || null;
          });
        }
      } catch (err) {
        console.warn('Error loading orders:', err);
        if (isMounted && storeOrders.length > 0) {
          setRealOrders(storeOrders);
          setSelectedOrder(storeOrders[0]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadOrders();
    return () => {
      isMounted = false;
    };
  }, [storeOrders]);

  const filteredOrders = realOrders.filter((order) => {
    if (statusFilter !== 'all' && order.fulfilmentStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchCustomer = order.customer.fullName.toLowerCase().includes(q);
      const matchPostcode = order.customer.postcode.toLowerCase().includes(q);
      const matchTracking = order.trackingNumber?.toLowerCase().includes(q);
      return matchNumber || matchCustomer || matchPostcode || matchTracking;
    }
    return true;
  });

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart(item.productId, item.quantity, item.selectedColour, item.selectedSize);
    });
    setRoute({ name: 'basket' });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E8E0D5] mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A25828] mb-1">
              <Package className="w-3.5 h-3.5" />
              <span>Plush Comfort Client Portal</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#221C18]">
              Order History &amp; Live Tracking
            </h1>
            <p className="text-xs text-[#8A786A] mt-1">
              Live status, 2-man vehicle route tracking &amp; official invoices for every order.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setRoute({ name: 'shop' })}
              className="bg-[#A25828] hover:bg-[#8A461A] text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Browse Collections
            </button>
            <button
              onClick={() => setRoute({ name: 'contact' })}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 border border-stone-200 px-4 py-2.5 rounded-full bg-white hover:bg-stone-50"
            >
              Customer Helpline
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8E0D5] flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Search box */}
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order # (e.g. PC-UK-82914), postcode, or name..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-[#D5C7B7] bg-[#FAF8F5] focus:outline-none focus:border-[#A25828]"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: `All (${realOrders.length})` },
              { id: 'processing', label: 'In Production' },
              { id: 'dispatched', label: 'Dispatched' },
              { id: 'delivered', label: 'Delivered' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  statusFilter === tab.id
                    ? 'bg-[#221C18] text-white border-[#221C18]'
                    : 'bg-white text-stone-600 border-[#E8E0D5] hover:bg-stone-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-stone-500">
            Fetching order records from Firestore database...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-[#E8E0D5] max-w-lg mx-auto space-y-4">
            <Package className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-serif text-2xl font-bold text-[#221C18]">
              No Orders Match Your Query
            </h3>
            <p className="text-xs text-stone-500">
              We couldn&apos;t find any orders matching &ldquo;{searchQuery}&rdquo;. Check your order number or reset filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="bg-[#A25828] text-white px-6 py-2.5 rounded-full text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Order Selection List (5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#8A786A] mb-1">
                Your Orders ({filteredOrders.length})
              </h2>

              <div className="space-y-3">
                {filteredOrders.map((order) => {
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#A25828] bg-white ring-2 ring-[#A25828]/20 shadow-md'
                          : 'border-[#E8E0D5] bg-white hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#221C18] font-mono">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            order.fulfilmentStatus === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.fulfilmentStatus === 'dispatched'
                              ? 'bg-blue-100 text-blue-800'
                              : order.fulfilmentStatus === 'cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.fulfilmentStatus}
                        </span>
                      </div>

                      <div className="text-xs text-stone-500 mt-2">
                        <span>{new Date(order.createdAt).toLocaleDateString('en-GB', { dateStyle: 'medium' })}</span>
                        <span> · {order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100 text-xs">
                        <span className="font-bold text-[#221C18] tabular-nums">
                          £{order.total.toFixed(2)}
                        </span>
                        <span className="text-[#A25828] font-semibold flex items-center gap-1">
                          View Timeline &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Detailed Order Status, Timeline, Items & Invoice (7 Cols) */}
            {selectedOrder && (
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E0D5] shadow-xs space-y-6">
                  {/* Top Bar with Print & Tracking Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E0D5] gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#A25828]">
                        Active Order Dossier
                      </span>
                      <h2 className="font-serif text-2xl font-bold text-[#221C18]">
                        {selectedOrder.orderNumber}
                      </h2>
                      <span className="text-xs text-stone-500">
                        Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', { dateStyle: 'full' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-black border border-[#D5C7B7] px-3.5 py-2 rounded-xl transition-colors cursor-pointer bg-white"
                        title="Print Official VAT Invoice"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#A25828]" />
                        <span>Print Invoice</span>
                      </button>

                      {selectedOrder.trackingNumber && (
                        <button
                          onClick={() => setTrackingModalOpen(true)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#A25828] hover:bg-[#8A461A] px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-xs"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Vehicle</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Live 5-Stage Order & Delivery Timeline */}
                  <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#E8E0D5] space-y-4">
                    <h3 className="font-serif font-bold text-base text-[#221C18] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#A25828]" />
                      <span>Live Production &amp; Delivery Timeline</span>
                    </h3>

                    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D5C7B7]">
                      {selectedOrder.timeline.map((event, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#A25828] ring-4 ring-[#FAF8F5]" />
                          <div className="flex items-baseline justify-between text-xs">
                            <span className="font-bold text-[#221C18]">{event.status}</span>
                            <span className="text-[11px] text-stone-400 font-mono">
                              {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                            {event.note}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Courier & Delivery Details Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#524842] p-5 rounded-2xl bg-white border border-[#E8E0D5]">
                    <div className="space-y-1">
                      <strong className="block text-stone-900 font-semibold mb-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#A25828]" />
                        <span>Room of Choice Address</span>
                      </strong>
                      <p className="font-medium text-stone-800">{selectedOrder.customer.fullName}</p>
                      <p>{selectedOrder.customer.addressLine1}</p>
                      {selectedOrder.customer.addressLine2 && <p>{selectedOrder.customer.addressLine2}</p>}
                      <p>{selectedOrder.customer.city}, {selectedOrder.customer.postcode}</p>
                      <p className="text-stone-400">Phone: {selectedOrder.customer.phone}</p>
                    </div>

                    <div className="space-y-1">
                      <strong className="block text-stone-900 font-semibold mb-1 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#A25828]" />
                        <span>Specialist Carrier</span>
                      </strong>
                      <p className="font-medium text-stone-800">{selectedOrder.courier || 'Panther 2-Man Logistics'}</p>
                      <p className="font-mono text-[#A25828] font-bold">
                        Tracking Ref: {selectedOrder.trackingNumber || 'Pending final dispatch'}
                      </p>
                      <p className="text-stone-500">Tier: {selectedOrder.deliveryOption === 'white_glove' ? 'White Glove Assembly' : 'Standard 2-Man Room Delivery'}</p>
                      <p className="text-stone-500">Est Arrival: {selectedOrder.estimatedDeliveryDate}</p>
                    </div>
                  </div>

                  {/* Itemized Order Lines */}
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#221C18] mb-3">
                      Purchased Items ({selectedOrder.items.length})
                    </h3>

                    <div className="divide-y divide-[#EFEAE2] border border-[#E8E0D5] rounded-2xl overflow-hidden bg-white">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-[#FAF8F5] border border-[#E8E0D5] p-1 overflow-hidden shrink-0 flex items-center justify-center">
                              <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-[#221C18]">{item.name}</h4>
                              <p className="text-stone-500 mt-0.5">
                                {item.selectedColour} {item.selectedSize && `· ${item.selectedSize}`} · Qty {item.quantity}
                              </p>
                              <span className="text-[10px] text-stone-400 font-mono">SKU: {item.sku}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-sm text-[#221C18] tabular-nums">
                              £{(item.price * item.quantity).toFixed(2)}
                            </span>
                            <span className="block text-[10px] text-stone-400">
                              £{item.price.toFixed(2)} each
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E8E0D5] space-y-2 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal</span>
                      <span className="font-semibold tabular-nums text-stone-900">
                        £{selectedOrder.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>UK Delivery</span>
                      <span className="font-semibold tabular-nums">
                        {selectedOrder.deliveryFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `£${selectedOrder.deliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Voucher Discount</span>
                        <span className="font-semibold tabular-nums">-£{selectedOrder.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[#221C18] text-base font-bold pt-2 border-t border-stone-200">
                      <span>{selectedOrder.paymentMethod === 'cod' && selectedOrder.paymentStatus !== 'paid' ? 'Total Due on Delivery' : 'Total Paid'}</span>
                      <span className="text-[#A25828] tabular-nums text-lg">
                        £{selectedOrder.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 pt-1 flex justify-between">
                      <span>
                        Payment Method: {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (Pay on Handover)' : selectedOrder.paymentMethod.toUpperCase()}
                      </span>
                      <span>Includes 20% UK VAT (£{(selectedOrder.total * 0.2).toFixed(2)})</span>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <button
                      onClick={() => handleReorder(selectedOrder)}
                      className="inline-flex items-center gap-2 bg-[#221C18] hover:bg-black text-white px-5 py-2.5 rounded-full text-xs font-semibold cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Reorder These Pieces</span>
                    </button>

                    <a
                      href={`https://wa.me/447923119077?text=Hello%20Plush%20Comfort,%20I%20have%20an%20enquiry%20regarding%20my%20order%20${selectedOrder.orderNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Support for this Order &rarr;</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Simulated Live Courier Tracking Modal */}
      {trackingModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setTrackingModalOpen(false)} />
          <div className="relative bg-white rounded-3xl max-w-xl w-full p-8 z-10 space-y-6 shadow-2xl border border-[#E8E0D5] animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#A25828]" />
                <h3 className="font-serif font-bold text-xl text-[#221C18]">
                  Live 2-Man Courier Dispatch Status
                </h3>
              </div>
              <button onClick={() => setTrackingModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400 hover:text-black cursor-pointer" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-stone-700">
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E0D5] space-y-1.5">
                <div className="flex justify-between font-bold text-sm text-[#221C18]">
                  <span>{selectedOrder.courier}</span>
                  <span className="font-mono text-[#A25828]">{selectedOrder.trackingNumber}</span>
                </div>
                <p className="text-stone-500">Destination: {selectedOrder.customer.city}, {selectedOrder.customer.postcode}</p>
                <p className="text-emerald-700 font-semibold">Status: En route on scheduled 2-man room delivery circuit</p>
              </div>

              <div className="space-y-3 pl-4 border-l-2 border-[#A25828]">
                <div>
                  <span className="font-bold block text-stone-900">Dispatched from our UK warehouse</span>
                  <span className="text-[11px] text-stone-400">Inspected by master upholsterer &amp; allocated to driver vehicle</span>
                </div>
                <div>
                  <span className="font-bold block text-stone-900">Customer SMS Window Assigned</span>
                  <span className="text-[11px] text-stone-400">2-hour delivery slot sent to {selectedOrder.customer.phone}</span>
                </div>
                <div>
                  <span className="font-bold block text-stone-900">Estimated Room Delivery</span>
                  <span className="text-[11px] text-stone-400">{selectedOrder.estimatedDeliveryDate}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setTrackingModalOpen(false)}
              className="w-full bg-[#A25828] text-white py-3 rounded-full text-xs font-bold cursor-pointer"
            >
              Close Tracking Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
