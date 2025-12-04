import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import cartService from '../services/cartService';
import orderService from '../services/orderService';
import authService from '../services/authService';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItem, setUpdatingItem] = useState(null);

  useEffect(() => {
    if (!authService.isAuthenticated() && !authService.autoLogin()) {
      // Request opening the login modal instead of redirecting
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

  const handleCheckout = async () => {
    try {
      setError('');
      const response = await orderService.createOrderFromCart();
      if (response.success) {
        const orderId = response.data?._id;
        const target = orderId ? `/account?tab=orders&id=${orderId}` : `/account?tab=orders`;
        window.location.href = target;
      }
    } catch (err) {
      setError(err.message || 'Failed to create order');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!authService.isAuthenticated() && !authService.autoLogin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="mt-4 text-gray-600">Please log in to view your cart.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {!cart || cart.items.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 mb-6">Start shopping to add items to your cart.</p>
                <Link
                  to="/products"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <div key={item._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <img
                          src={(item.product.images && item.product.images[0]) || '/images/placeholder.jpg'}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">{item.product.name}</h3>
                          <p className="text-gray-600">${item.product.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={updatingItem === item._id}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={updatingItem === item._id}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-medium">₹{item.itemTotal.toFixed(2)}</p>
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={handleClearCart}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Clear Cart
                    </button>
                    <Link
                      to="/products"
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Subtotal ({cart.totalItems} items)</span>
                        <span>₹{cart.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{cart.shipping === 0 ? 'Free' : `₹${cart.shipping.toFixed(2)}`}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>₹{cart.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button onClick={handleCheckout} className="w-full mt-6 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 font-medium">
                      Place Order
                    </button>
                    
                    {cart.shipping > 0 && (
                      <p className="text-sm text-gray-600 mt-2 text-center">
                        Add ₹{(50 - cart.subtotal).toFixed(2)} more for free shipping
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

