import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cartService from '../services/cartService';
import authService from '../services/authService';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItem, setUpdatingItem] = useState(null);

  useEffect(() => {
    if (!authService.isAuthenticated() && !authService.autoLogin()) {
      window.dispatchEvent(new Event('auth:openLogin'));
      setLoading(false);
      return;
    }
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdatingItem(itemId);
      const response = await cartService.updateCartItem(itemId, newQuantity);
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to update quantity');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await cartService.removeFromCart(itemId);
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        const response = await cartService.clearCart();
        if (response.success) {
          setCart(response.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to clear cart');
      }
    }
  };

  const handleCheckout = () => {
    // Navigate to checkout page
    navigate('/checkout');
  };

  const FREE_SHIPPING_THRESHOLD = 50; // keep UI consistent with backend free shipping rule

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Gradient Banner (reuse from ContactUs) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="text-center flex items-center justify-center h-36 md:h-48 lg:h-[194px] rounded-xl md:rounded-2xl"
          style={{
            background:
              'linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(254, 240, 239, 1) 50%, rgba(243, 251, 251, 1) 76%, rgba(254, 255, 255, 1) 98%)'
          }}
        >
          <h1 className="text-black text-3xl md:text-4xl font-normal">Shopping Cart</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" aria-live="polite">
            {error}
          </div>
        )}

        {!cart || cart.items.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <h3 className="text-xl md:text-2xl text-black mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Start shopping to add items to your cart.</p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left: Cart Items */}
            <div className="lg:col-span-2">
              {/* Limited products notice */}
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                <span className="text-red-500">🔥</span>
                <span>These products are limited, checkout within</span>
                <span className="inline-block w-24 h-[3px] bg-red-500 rounded-full align-middle"></span>
              </div>

              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={item._id} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                    <div className="grid grid-cols-[56px_1fr] sm:grid-cols-[96px_1fr_auto] items-center gap-3 sm:gap-4">
                      {/* Image */}
                      <div className="relative w-14 h-14 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={(item.product.images && item.product.images[0]) || '/images/placeholder.jpg'}
                          alt={item.product.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>

                      {/* Title + unit price */}
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base lg:text-lg text-black truncate">{item.product.name}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm">${item.product.price}</p>
                      </div>

                      {/* Item total on larger screens */}
                      <p className="hidden sm:block text-base font-medium text-black whitespace-nowrap">${item.itemTotal.toFixed(2)}</p>
                    </div>

                    {/* Controls row: qty on the left, total + remove on the right (mobile) */}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          disabled={updatingItem === item._id}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                          aria-label={`Decrease quantity of ${item.product.name}`}
                        >
                          –
                        </button>
                        <span className="w-6 sm:w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          disabled={updatingItem === item._id}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                          aria-label={`Increase quantity of ${item.product.name}`}
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4">
                        <span className="sm:hidden inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-black text-sm font-medium">
                          + ${item.itemTotal.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="text-red-600 hover:text-red-700 text-xs sm:text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer actions and order note */}
              <div className="mt-6 flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4">
                <button
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Clear Cart
                </button>
                <Link
                  to="/products"
                  className="text-black hover:text-gray-800 font-medium"
                >
                  Continue Shopping
                </Link>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Add Order Note</h4>
                <textarea
                  rows={4}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 resize-none"
                />
              </div>
            </div>

            {/* Right: Summary + Free shipping progress */}
            <div className="lg:col-span-1 lg:sticky lg:top-24 self-start">
              {/* Free Shipping Bar */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                {(() => {
                  const progress = Math.min(100, Math.round((cart.subtotal / FREE_SHIPPING_THRESHOLD) * 100));
                  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cart.subtotal);
                  return (
                    <>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden" aria-label="Free shipping progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                        <div
                          className="h-2 bg-red-500"
                          style={{ width: `${progress}%`, transition: 'width 300ms ease' }}
                        />
                      </div>
                      <p className="mt-3 text-sm text-gray-700">
                        {cart.shipping === 0 ? (
                          <span className="text-green-600 font-medium">You’ve unlocked Free Shipping!</span>
                        ) : (
                          <>
                            Buy <span className="font-medium">${remaining.toFixed(2)}</span> more to enjoy <span className="font-medium">Free Shipping</span>
                          </>
                        )}
                      </p>
                    </>
                  );
                })()}
              </div>

              {/* Order Summary */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Estimate Shipping</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Subtotal ({cart.totalItems} items)</span>
                    <span className="text-black">₹{cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Shipping</span>
                    <span className="text-black">{cart.shipping === 0 ? 'Free' : `₹${cart.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-black">Total</span>
                      <span className="text-black">₹{cart.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2 text-sm text-gray-600">
                  <input id="agree" type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300" defaultChecked />
                  <label htmlFor="agree" className="select-none">
                    I agree with the <span className="underline">terms and conditions</span>
                  </label>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full mt-6 bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-900 font-medium"
                >
                  Check out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

