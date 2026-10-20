import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  Check,
} from 'lucide-react';
import { getProductFallbackImage } from '../utils/imageHelper';

export const BasketPage: React.FC = () => {
  const {
    cart,
    products,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    settings,
    setRoute,
  } = useStore();

  const [postcode, setPostcode] = useState('');
  const [postcodeChecked, setPostcodeChecked] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const freeDeliveryThreshold = settings.freeDeliveryThreshold;
  const isFreeDelivery = cartSubtotal >= freeDeliveryThreshold;
  const deliveryFee = isFreeDelivery ? 0 : settings.standardDeliveryFee;
  const discountAmount = promoApplied ? Math.round(cartSubtotal * 0.1 * 100) / 100 : 0;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount + deliveryFee);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'PLUSH10') {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Invalid coupon code. Try PLUSH10 for 10% off.');
    }
  };

  const handleCheckPostcode = (e: React.FormEvent) => {
    e.preventDefault();
    if (postcode.trim().length >= 3) {
      setPostcodeChecked(true);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-20">
        <div className="max-w-2xl mx-auto px-4 text-center bg-white p-12 rounded-3xl border border-[#E8E0D5]">
          <div className="w-20 h-20 rounded-full bg-[#FAF5EE] flex items-center justify-center text-[#A25828] mx-auto mb-4">
            <Truck className="w-10 h-10 opacity-50" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#221C18]">
            Your Shopping Basket is Empty
          </h1>
          <p className="text-sm text-stone-500 mt-2 max-w-sm mx-auto">
            You haven&apos;t added any handcrafted furniture to your basket yet.
          </p>
          <button
            onClick={() => setRoute({ name: 'shop' })}
            className="mt-6 bg-[#A25828] text-white hover:bg-[#8A461A] px-8 py-3.5 rounded-full text-sm font-semibold transition-colors cursor-pointer"
          >
            Explore Furniture Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#221C18] mb-8">
          Shopping Basket ({cart.reduce((s, i) => s + i.quantity, 0)} items)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl border border-[#E8E0D5] p-6 divide-y divide-[#EFEAE2]">
              {cart.map((item) => {
                const prod = products.find((p) => p.id === item.productId);
                if (!prod) return null;
                const price = prod.salePrice ?? prod.price;

                return (
                  <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-6 items-start">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#FAF7F2] border border-[#E8E0D5] overflow-hidden p-2 shrink-0 flex items-center justify-center">
                      <img
                        src={prod.images[0] || getProductFallbackImage(prod.name, prod.categoryId)}
                        alt={prod.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-4">
                        <button
                          onClick={() => setRoute({ name: 'product', slug: prod.slug })}
                          className="font-serif font-bold text-base sm:text-lg text-[#221C18] hover:text-[#A25828] text-left cursor-pointer"
                        >
                          {prod.name}
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs text-stone-500 space-x-2">
                        <span>SKU: {prod.sku}</span>
                        {item.selectedColour && <span>· Colour: {item.selectedColour}</span>}
                        {item.selectedSize && <span>· Size: {item.selectedSize}</span>}
                      </div>

                      <div className="pt-4 flex items-center justify-between">
                        <div className="flex items-center border border-[#D5C7B7] rounded-full bg-white px-2 py-1">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-stone-600 hover:text-black cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-[#221C18] tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-stone-600 hover:text-black cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-base text-[#221C18] tabular-nums">
                            £{(price * item.quantity).toFixed(2)}
                          </span>
                          {prod.salePrice && (
                            <span className="block text-xs text-stone-400 line-through tabular-nums">
                              £{(prod.price * item.quantity).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Postcode Delivery Checker */}
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-5">
              <h3 className="font-semibold text-xs text-[#221C18] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#A25828]" />
                Estimate UK Delivery Coverage &amp; Lead Time
              </h3>
              <form onSubmit={handleCheckPostcode} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WF12 9EA, SW1A 1AA, M1 1AA"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                  className="px-3.5 py-2 text-xs border border-[#D5C7B7] rounded-lg text-[#221C18] focus:outline-none uppercase w-60"
                />
                <button
                  type="submit"
                  className="bg-[#221C18] hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Check Postcode
                </button>
              </form>
              {postcodeChecked && (
                <div className="mt-3 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>
                    Great news! Postcode <strong>{postcode}</strong> is fully covered by our 2-man room of choice logistics team with delivery in 3–5 working days.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-[#E8E0D5] p-6 space-y-5">
              <h2 className="font-serif text-xl font-bold text-[#221C18]">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs divide-y divide-[#EFEAE2]">
                <div className="flex justify-between text-stone-600 pt-2">
                  <span>Subtotal</span>
                  <span className="font-bold text-stone-900 tabular-nums text-sm">
                    £{cartSubtotal.toFixed(2)}
                  </span>
                </div>

                {promoApplied && (
                  <div className="flex justify-between text-emerald-700 pt-2">
                    <span>Coupon Discount (10% off)</span>
                    <span className="font-bold tabular-nums">
                      -£{discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600 pt-2">
                  <span>UK Mainland Delivery</span>
                  <span className="font-medium tabular-nums">
                    {isFreeDelivery ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      `£${deliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-[#221C18] pt-3 text-base">
                  <span className="font-bold">Total (Inc. VAT)</span>
                  <span className="font-bold text-xl tabular-nums text-[#A25828]">
                    £{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Promo code input */}
              <form onSubmit={handleApplyPromo} className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code (e.g. PLUSH10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-[#D5C7B7] rounded-lg uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-[11px] text-red-500 mt-1">{promoError}</p>}
                {promoApplied && <p className="text-[11px] text-emerald-600 mt-1">10% discount applied!</p>}
              </form>

              {/* Proceed to Checkout CTA */}
              <button
                onClick={() => setRoute({ name: 'checkout' })}
                className="w-full bg-[#A25828] hover:bg-[#8A461A] text-white py-4 rounded-full text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>Proceed to UK Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-4 border-t border-stone-200 space-y-2 text-[11px] text-[#8A786A]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Encrypted 256-bit SSL Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#A25828] shrink-0" />
                  <span>30-Day Money Back Comfort Trial</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
