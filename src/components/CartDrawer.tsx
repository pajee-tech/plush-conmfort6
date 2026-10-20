import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { getProductFallbackImage } from '../utils/imageHelper';

export const CartDrawer: React.FC = () => {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cart,
    products,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    settings,
    setRoute,
  } = useStore();

  if (!isCartDrawerOpen) return null;

  const freeDeliveryThreshold = settings.freeDeliveryThreshold;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);
  const freeDeliveryProgress = Math.min(100, (cartSubtotal / freeDeliveryThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-[#E8E0D5] flex items-center justify-between bg-[#FAF8F5]">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-[#221C18]">
                Your Shopping Basket
              </h2>
              <span className="text-xs bg-[#A25828] text-white px-2 py-0.5 rounded-full font-semibold">
                {cart.reduce((sum, i) => sum + i.quantity, 0)} items
              </span>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free UK Delivery Progress Bar */}
          <div className="bg-[#F8F3EC] px-5 py-3 border-b border-[#E8E0D5]">
            <div className="flex items-center justify-between text-xs font-medium text-[#4A3E37] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#A25828]" />
                {amountToFreeDelivery === 0 ? (
                  <span className="text-emerald-700 font-bold">You qualify for FREE UK Delivery!</span>
                ) : (
                  <span>
                    Add <strong className="text-[#A25828]">£{amountToFreeDelivery.toFixed(2)}</strong> more for FREE UK Delivery
                  </span>
                )}
              </span>
              <span className="text-[11px] text-[#8A786A]">{Math.round(freeDeliveryProgress)}%</span>
            </div>
            <div className="w-full bg-[#E5DACE] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#A25828] h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#EFEAE2]">
            {cart.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#8A786A] mb-4">
                  <Truck className="w-8 h-8 opacity-40" />
                </div>
                <p className="font-serif text-lg font-semibold text-[#221C18]">Your basket is empty</p>
                <p className="text-sm text-stone-500 max-w-xs mt-1 mb-6">
                  Explore our luxury sofas and beds — free UK delivery on every order.
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    setRoute({ name: 'shop' });
                  }}
                  className="bg-[#A25828] text-white hover:bg-[#8A461A] px-6 py-2.5 rounded-full text-sm font-semibold transition-colors cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const prod = products.find((p) => p.id === item.productId);
                if (!prod) return null;
                const price = prod.salePrice ?? prod.price;

                return (
                  <div key={item.id} className="py-4 flex gap-4">
                    {/* Item Image */}
                    <div className="w-20 h-20 rounded-xl bg-[#FAF7F2] border border-[#EFEAE2] flex-shrink-0 overflow-hidden p-1 flex items-center justify-center">
                      <img
                        src={prod.images[0] || getProductFallbackImage(prod.name, prod.categoryId)}
                        alt={prod.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = getProductFallbackImage(prod.name, prod.categoryId);
                        }}
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() => {
                              setIsCartDrawerOpen(false);
                              setRoute({ name: 'product', slug: prod.slug });
                            }}
                            className="text-left font-medium text-sm text-[#221C18] hover:text-[#A25828] line-clamp-1 cursor-pointer"
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

                        {/* Selected Variants */}
                        <div className="text-xs text-stone-500 mt-0.5 space-x-2">
                          {item.selectedColour && <span>Colour: {item.selectedColour}</span>}
                          {item.selectedSize && <span>· Size: {item.selectedSize}</span>}
                        </div>
                      </div>

                      {/* Quantity Stepper & Line Price */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-[#E0D7CC] rounded-lg bg-[#FAF8F5]">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="p-1 px-2 text-stone-600 hover:text-black cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-[#221C18] tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="p-1 px-2 text-stone-600 hover:text-black cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-semibold text-sm text-[#221C18] tabular-nums">
                          £{(price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Subtotal & Checkout Actions */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-[#E8E0D5] bg-[#FAF8F5] space-y-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900 tabular-nums">
                    £{cartSubtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600 text-xs">
                  <span>UK Mainland Delivery</span>
                  <span className="tabular-nums font-medium">
                    {cartSubtotal >= freeDeliveryThreshold ? (
                      <span className="text-emerald-700 font-semibold">FREE</span>
                    ) : (
                      `£${settings.standardDeliveryFee.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    setRoute({ name: 'checkout' });
                  }}
                  className="w-full bg-[#A25828] hover:bg-[#8A461A] text-white py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    setRoute({ name: 'basket' });
                  }}
                  className="w-full bg-white hover:bg-stone-50 text-[#4A3E37] border border-[#D5C7B7] py-2.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                >
                  View Full Basket & Postcode Calculator
                </button>
              </div>

              {/* Trust markers */}
              <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-[#8A786A]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Secure UK Checkout
                </span>
                <span>·</span>
                <span>30-Day Exchange & Returns</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
