import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { OrderCustomer } from '../types';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  Truck,
  CheckCircle2,
  AlertCircle,
  Banknote,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    products,
    cartSubtotal,
    settings,
    createOrder,
    setRoute,
    trackEvent,
  } = useStore();

  const [customer, setCustomer] = useState<OrderCustomer>({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    county: '',
    postcode: '',
    country: 'United Kingdom',
  });

  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'white_glove'>('standard');
  // Cash on Delivery is currently active. Other payment methods (Stripe, Klarna, BACS)
  // are safely hidden and can be re-enabled by setting ENABLE_OTHER_PAYMENT_METHODS = true (see README.md).
  const ENABLE_OTHER_PAYMENT_METHODS = false;
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'klarna' | 'bank_transfer'>('cod');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Card details (test simulator)
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');

  React.useEffect(() => {
    trackEvent('checkout_start');
  }, []);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-20 text-center">
        <h2 className="font-serif text-2xl font-bold">Your basket is empty</h2>
        <button
          onClick={() => setRoute({ name: 'shop' })}
          className="mt-4 bg-[#A25828] text-white px-6 py-2.5 rounded-full text-xs font-semibold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  // Calculate pricing
  const subtotal = cartSubtotal;
  const isFreeDelivery = subtotal >= settings.freeDeliveryThreshold;
  const deliveryFee =
    deliveryOption === 'white_glove'
      ? settings.whiteGloveDeliveryFee
      : isFreeDelivery
      ? 0
      : settings.standardDeliveryFee;
  const discountAmount = promoApplied ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.fullName || !customer.email || !customer.phone || !customer.addressLine1 || !customer.postcode) {
      setErrorMsg('Please complete all mandatory delivery address fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Simulate real secure gateway handshake
      await new Promise((res) => setTimeout(res, 800));

      const createdOrder = await createOrder({
        customer,
        paymentMethod,
        deliveryOption,
        promoCode: promoApplied ? 'PLUSH10' : undefined,
      });

      setRoute({ name: 'order-confirmation', orderId: createdOrder.id });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Payment authorization failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-8 border-b border-[#E8E0D5] mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#221C18]">
              Secure UK Checkout
            </h1>
            <p className="text-xs text-[#8A786A] mt-1">
              Plush Comfort UK · Free UK Delivery &amp; Cash on Delivery
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>256-Bit SSL Encrypted</span>
          </div>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Delivery & Payment Details */}
          <div className="lg:col-span-7 space-y-8">
            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Contact Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E0D5] space-y-4">
              <h2 className="font-serif font-bold text-lg text-[#221C18]">
                1. Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="you@domain.co.uk"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828]"
                  />
                  <span className="text-[10px] text-stone-400">For dispatch updates &amp; receipt</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    UK Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="+44 7923 119077"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828]"
                  />
                  <span className="text-[10px] text-stone-400">For 2-man delivery time slot SMS</span>
                </div>
              </div>
            </div>

            {/* 2. UK Delivery Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E0D5] space-y-4">
              <h2 className="font-serif font-bold text-lg text-[#221C18]">
                2. UK Delivery Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.addressLine1}
                    onChange={(e) => setCustomer({ ...customer, addressLine1: e.target.value })}
                    placeholder="House number and street name"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={customer.addressLine2}
                    onChange={(e) => setCustomer({ ...customer, addressLine2: e.target.value })}
                    placeholder="Apartment, suite, unit, etc."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Town / City *
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.city}
                      onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                      placeholder="e.g. Leeds"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      County
                    </label>
                    <input
                      type="text"
                      value={customer.county}
                      onChange={(e) => setCustomer({ ...customer, county: e.target.value })}
                      placeholder="e.g. Greater London"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      UK Postcode *
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.postcode}
                      onChange={(e) => setCustomer({ ...customer, postcode: e.target.value.toUpperCase() })}
                      placeholder="WF12 9EA"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#D5C7B7] focus:outline-none focus:border-[#A25828] uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Delivery Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E0D5] space-y-4">
              <h2 className="font-serif font-bold text-lg text-[#221C18]">
                3. Specialist Delivery Option
              </h2>
              <div className="space-y-3">
                <label
                  onClick={() => setDeliveryOption('standard')}
                  className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    deliveryOption === 'standard'
                      ? 'border-[#A25828] bg-[#FAF5EE] ring-1 ring-[#A25828]'
                      : 'border-[#E8E0D5] hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="deliveryOption"
                      checked={deliveryOption === 'standard'}
                      onChange={() => setDeliveryOption('standard')}
                      className="accent-[#A25828] mt-1"
                    />
                    <div>
                      <h4 className="font-semibold text-sm text-[#221C18]">
                        Standard 2-Man Room of Choice Delivery
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Delivered safely into your room of choice by our 2-man logistics team.
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-[#221C18] tabular-nums">
                    {isFreeDelivery ? 'FREE' : `£${settings.standardDeliveryFee.toFixed(2)}`}
                  </span>
                </label>

                <label
                  onClick={() => setDeliveryOption('white_glove')}
                  className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    deliveryOption === 'white_glove'
                      ? 'border-[#A25828] bg-[#FAF5EE] ring-1 ring-[#A25828]'
                      : 'border-[#E8E0D5] hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="deliveryOption"
                      checked={deliveryOption === 'white_glove'}
                      onChange={() => setDeliveryOption('white_glove')}
                      className="accent-[#A25828] mt-1"
                    />
                    <div>
                      <h4 className="font-semibold text-sm text-[#221C18]">
                        White-Glove Assembly &amp; Packaging Removal
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Our technicians build your bed or attach sofa feet and remove all boxes for eco-recycling.
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-[#221C18] tabular-nums">
                    £{settings.whiteGloveDeliveryFee.toFixed(2)}
                  </span>
                </label>
              </div>
            </div>

            {/* 4. Payment Method — Cash on Delivery Active */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E0D5] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-bold text-lg text-[#221C18]">
                  4. Payment Method
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  Cash on Delivery
                </span>
              </div>

              {/* Active Primary Method: Cash on Delivery */}
              <div className="p-5 rounded-2xl border-2 border-[#A25828] bg-[#FAF5EE] space-y-3.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#A25828] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-[#221C18]">
                        Cash on Delivery (Pay on Handover)
                      </h3>
                      <p className="text-xs text-[#6E5D52]">
                        Pay cash or card to our 2-man logistics team once your pieces arrive and are fully inspected.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                    £0 Today
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#E8CDBB]/70 text-xs text-[#524842]">
                  <div className="flex items-center gap-2 bg-white/80 px-3 py-2 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-[#A25828] shrink-0" />
                    <span><strong>Inspect First</strong> in your room of choice</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 px-3 py-2 rounded-xl">
                    <Truck className="w-4 h-4 text-[#A25828] shrink-0" />
                    <span><strong>2-Man Logistics</strong> white-glove arrival</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 px-3 py-2 rounded-xl">
                    <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span><strong>1 Year</strong> Warranty</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#6E5D52] bg-white/70 p-3 rounded-xl border border-[#E8CDBB]/50 leading-relaxed">
                  <strong>How Delivery Handover Works:</strong> Our specialized UK 2-man delivery logistics crew will transport your furniture into your designated room, assist with unpacking, and give you time to inspect fabric quality and structural craftsmanship. You pay upon complete satisfaction.
                </div>
              </div>

              {/* Alternative payment methods: hidden until store owner enables them via README.md */}
              {ENABLE_OTHER_PAYMENT_METHODS && (
                <div className="pt-4 border-t border-stone-200 space-y-3">
                  <p className="text-xs font-semibold text-stone-600">Select Alternative Payment Method:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        paymentMethod === 'card'
                          ? 'border-[#A25828] bg-[#FAF5EE] text-[#A25828]'
                          : 'border-[#E8E0D5] text-stone-600'
                      }`}
                    >
                      Credit / Debit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('klarna')}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        paymentMethod === 'klarna'
                          ? 'border-[#A25828] bg-[#FAF5EE] text-[#A25828]'
                          : 'border-[#E8E0D5] text-stone-600'
                      }`}
                    >
                      Klarna Pay in 3
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-[#A25828] bg-[#FAF5EE] text-[#A25828]'
                          : 'border-[#E8E0D5] text-stone-600'
                      }`}
                    >
                      Bank Transfer (BACS)
                    </button>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E0D5] space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                          Card Number (Simulated Stripe Test Card)
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-[#D5C7B7] bg-white font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-[#D5C7B7] bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                            CVC Security Code
                          </label>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full text-xs px-3 py-2 rounded-lg border border-[#D5C7B7] bg-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'klarna' && (
                    <div className="p-4 bg-[#FAF5EE] rounded-2xl text-xs text-stone-700 leading-relaxed">
                      Pay in 3 interest-free payments of <strong>£{(finalTotal / 3).toFixed(2)}</strong>. Today you pay nothing until dispatch.
                    </div>
                  )}

                  {paymentMethod === 'bank_transfer' && (
                    <div className="p-4 bg-[#FAF5EE] rounded-2xl text-xs text-stone-700 space-y-1">
                      <p><strong>BACS Wire Details:</strong></p>
                      <p>Account Name: Plush Comfort Ltd</p>
                      <p>Sort Code: 20-45-77 · Account Number: 88192033</p>
                      <p className="text-[11px] text-stone-500">Your order will be handcrafted upon payment receipt.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary Sticky Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E0D5] space-y-5 sticky top-28">
              <h2 className="font-serif font-bold text-lg text-[#221C18]">
                Your Order ({cart.reduce((s, i) => s + i.quantity, 0)} items)
              </h2>

              <div className="max-h-60 overflow-y-auto divide-y divide-[#EFEAE2] pr-1">
                {cart.map((item) => {
                  const prod = products.find((p) => p.id === item.productId);
                  if (!prod) return null;
                  const price = prod.salePrice ?? prod.price;
                  return (
                    <div key={item.id} className="py-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-[#FAF7F2] border border-[#E8E0D5] p-1 shrink-0 flex items-center justify-center">
                          <img src={prod.images[0]} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-stone-900 truncate">{prod.name}</p>
                          <p className="text-stone-500 text-[11px]">{item.selectedColour} · Qty {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-bold tabular-nums shrink-0">
                        £{(price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-[#E8E0D5] space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold tabular-nums text-stone-900">
                    £{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>UK Delivery</span>
                  <span className="tabular-nums font-semibold">
                    {deliveryFee === 0 ? <span className="text-emerald-700">FREE</span> : `£${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="tabular-nums font-semibold">-£{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#221C18] pt-3 text-lg font-bold border-t border-[#E8E0D5]">
                  <span>Total Due</span>
                  <span className="text-[#A25828] tabular-nums text-xl">
                    £{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#A25828] hover:bg-[#8A461A] text-white py-4 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Submitting Order...</span>
                ) : (
                  <>
                    <span>Confirm Order — Pay £{finalTotal.toFixed(2)} on Delivery</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-stone-500 pt-1">
                By placing this order you agree to Plush Comfort UK&apos;s Terms &amp; 30-Day Exchange & Returns.
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
