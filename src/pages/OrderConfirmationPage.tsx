import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  MapPin,
  Calendar,
  Printer,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface OrderConfirmationPageProps {
  orderId: string;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ orderId }) => {
  const { orders, setRoute } = useStore();
  const order = orders.find((o) => o.id === orderId) || orders[0];

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold">Order Not Found</h1>
        <button
          onClick={() => setRoute({ name: 'home' })}
          className="mt-4 bg-[#A25828] text-white px-6 py-2.5 rounded-full text-xs font-semibold"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Banner */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8E0D5] shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-[#A25828]">
            Order Confirmed &amp; In Production
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#221C18]">
            Thank You, {order.customer.fullName.split(' ')[0]}!
          </h1>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            Your Plush Comfort order <strong>{order.orderNumber}</strong> has been received by our team.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 bg-[#FAF7F2] border border-[#E8E0D5] px-4 py-2 rounded-xl text-xs font-semibold text-[#221C18]">
              <Calendar className="w-4 h-4 text-[#A25828]" />
              <span>Est. Delivery: {order.estimatedDeliveryDate || '3–5 Working Days'}</span>
            </div>

            {order.trackingNumber && (
              <div className="inline-flex items-center gap-2 bg-[#FAF7F2] border border-[#E8E0D5] px-4 py-2 rounded-xl text-xs font-semibold text-[#221C18]">
                <Truck className="w-4 h-4 text-[#A25828]" />
                <span>Tracking: {order.trackingNumber} ({order.courier})</span>
              </div>
            )}

            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {order.paymentMethod === 'cod' ? 'Payment: Cash on Delivery (Pay on Handover)' : `Payment: ${order.paymentMethod.toUpperCase()}`}
              </span>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="mt-8 bg-white rounded-3xl p-8 border border-[#E8E0D5] space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8E0D5] gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#221C18]">
                Order Summary ({order.orderNumber})
              </h2>
              <span className="text-xs text-stone-400">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { dateStyle: 'full' })}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-black border border-stone-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setRoute({ name: 'account' })}
                className="text-xs font-semibold text-[#A25828] hover:underline"
              >
                Track in Account &rarr;
              </button>
            </div>
          </div>

          {/* Purchased Items */}
          <div className="divide-y divide-[#EFEAE2]">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4 first:pt-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#FAF8F5] border border-[#E8E0D5] overflow-hidden p-1 shrink-0 flex items-center justify-center">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-[#221C18]">{item.name}</h4>
                    <p className="text-xs text-stone-500">
                      {item.selectedColour} {item.selectedSize && `· ${item.selectedSize}`} · Qty {item.quantity}
                    </p>
                    <span className="text-[11px] text-stone-400">SKU: {item.sku}</span>
                  </div>
                </div>
                <span className="font-bold text-sm text-[#221C18] tabular-nums">
                  £{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-4 border-t border-[#E8E0D5] space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span className="font-semibold tabular-nums text-stone-900">
                £{order.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>UK Delivery ({order.deliveryOption})</span>
              <span className="font-semibold tabular-nums">
                {order.deliveryFee === 0 ? <span className="text-emerald-700">FREE</span> : `£${order.deliveryFee.toFixed(2)}`}
              </span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span className="font-semibold tabular-nums">-£{order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#221C18] text-base font-bold pt-2 border-t border-stone-200">
              <span>{order.paymentMethod === 'cod' ? 'Total Due on Delivery' : 'Total Paid'}</span>
              <span className="text-[#A25828] tabular-nums text-lg">
                £{order.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#E8E0D5] text-xs">
            <div className="space-y-1">
              <h4 className="font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#A25828]" />
                Delivery Address
              </h4>
              <p className="font-semibold text-stone-800">{order.customer.fullName}</p>
              <p className="text-stone-600">{order.customer.addressLine1}</p>
              {order.customer.addressLine2 && <p className="text-stone-600">{order.customer.addressLine2}</p>}
              <p className="text-stone-600">
                {order.customer.city}, {order.customer.postcode}
              </p>
              <p className="text-stone-600">{order.customer.country}</p>
              <p className="text-stone-500 pt-1">Tel: {order.customer.phone}</p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A25828]" />
                What Happens Next?
              </h4>
              <p className="text-stone-600 leading-relaxed">
                1. Our team performs a final quality and fabric check.
              </p>
              <p className="text-stone-600 leading-relaxed">
                2. Your pieces are carefully packaged in double-walled protective transit padding.
              </p>
              <p className="text-stone-600 leading-relaxed">
                3. Our 2-man logistics team calls 24 hours prior to schedule your room of choice time slot.
              </p>
              {order.paymentMethod === 'cod' && (
                <p className="text-emerald-800 font-medium leading-relaxed bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 mt-2">
                  4. Pay on Handover: Inspect your furniture upon delivery, then hand cash or pay upon handover.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Back to store */}
        <div className="text-center pt-8">
          <button
            onClick={() => setRoute({ name: 'home' })}
            className="bg-[#A25828] text-white hover:bg-[#8A461A] px-8 py-3.5 rounded-full text-sm font-semibold transition-colors cursor-pointer"
          >
            Continue Browsing Plush Comfort
          </button>
        </div>
      </div>
    </div>
  );
};
