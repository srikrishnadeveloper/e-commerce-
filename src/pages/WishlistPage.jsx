import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import wishlistService from '../services/wishlistService';
import cartService from '../services/cartService';
import authService from '../services/authService';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authService.isAuthenticated() && !authService.autoLogin()) {
      window.dispatchEvent(new Event('auth:openLogin'));
      setLoading(false);
      return;
    }
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistService.getWishlist();
      if (response.success) {
        setWishlist(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const response = await wishlistService.removeFromWishlist(productId);
      if (response.success) {
        setWishlist(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to remove item');
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      if (!authService.isAuthenticated()) {
        window.dispatchEvent(new Event('auth:openLogin'));
        return;
      }
      await cartService.addToCart(productId, 1);
      // cartService already dispatches 'cart:changed'
    } catch (err) {
      setError(err.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (!authService.isAuthenticated() && !authService.autoLogin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="mt-4 text-gray-600">Please log in to view your wishlist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h1>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {wishlist.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500 mb-6">Start adding products to your wishlist.</p>
                <Link
                  to="/products"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {wishlist.map((product) => (
                  <div key={product._id} className="border border-gray-200 rounded-lg p-4">
                    <img
                      src={(product.images && product.images[0]) || '/images/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded"
                    />
                    <h3 className="text-lg font-medium text-gray-900 mt-2">{product.name}</h3>
                    <p className="text-lg font-medium text-gray-900">${product.price}</p>
                    <div className="mt-4 flex space-x-2">
                      <button onClick={() => handleAddToCart(product._id)} className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700">
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleRemoveFromWishlist(product._id)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
