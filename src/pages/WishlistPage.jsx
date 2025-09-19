import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import wishlistService from '../services/wishlistService';
import cartService from '../services/cartService';
import authService from '../services/authService';

// Small utilities for pid and image resolution (consistent with other components)
const getPid = (p) => String((p && (p._id || p.id)) || '');
const resolveImageSrc = (raw) => {
  const src = (raw || '').trim();
  if (!src) return '/images/placeholder.svg';
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/api/images/') || src.startsWith('/images/')) return src;
  return `/images/${src.replace(/^\/?/, '')}`;
};

// Price helpers to support optional variant arrays if provided by backend
const getActivePrice = (product, idx) => {
  const vp = product && product.variantPrices;
  if (Array.isArray(vp) && vp[idx] != null) return vp[idx];
  return product?.price ?? 0;
};
const getActiveOriginalPrice = (product, idx) => {
  const vop = product && product.variantOriginalPrices;
  if (Array.isArray(vop) && vop[idx] != null) return vop[idx];
  return product?.originalPrice;
};

// A single wishlist card matching the look-and-feel of the provided UI (image, name, price, swatches)
const WishlistCard = ({
  product,
  selectedIndex,
  onSelectColor,
  onAddToCart,
  onRemove,
  inCart,
}) => {
  const pid = getPid(product);
  const colors = product?.colors || [];
  const safeIndex = Math.max(0, Math.min(selectedIndex ?? 0, Math.max(0, colors.length - 1)));
  const activeImage = (product?.images && product.images[safeIndex]) || product?.images?.[0];
  const activePrice = getActivePrice(product, safeIndex);
  const activeOriginal = getActiveOriginalPrice(product, safeIndex);

  return (
    <div className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <Link to={`/product/${pid}`} className="block bg-gray-50">
        <div className="w-full aspect-[4/5] overflow-hidden">
          <img
            src={resolveImageSrc(activeImage)}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/product/${pid}`} className="block">
          <h3 className="text-base sm:text-lg text-gray-900 hover:underline line-clamp-2">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-gray-900 font-semibold">${activePrice}</span>
          {activeOriginal && activeOriginal > activePrice && (
            <span className="text-gray-500 line-through">${activeOriginal}</span>
          )}
        </div>

        {/* Swatches */}
        {colors?.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            {colors.map((c, idx) => (
              <button
                key={`${pid}-${c.name}-${idx}`}
                type="button"
                aria-label={`Select ${c.name} color`}
                aria-pressed={safeIndex === idx}
                onClick={() => onSelectColor(pid, idx)}
                className={`w-5 h-5 rounded-full border-2 transition-transform duration-150 hover:scale-110 ${
                  safeIndex === idx ? 'border-black shadow-sm' : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onAddToCart(pid)}
            disabled={inCart}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              inCart ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {inCart ? 'In Cart' : 'Add to Cart'}
          </button>
          <button
            type="button"
            onClick={() => onRemove(pid)}
            className="px-3 py-2 rounded-md text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
            aria-label="Remove from wishlist"
            title="Remove"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartIds, setCartIds] = useState(new Set());
  // Track which swatch is selected per product id for image/price changes
  const [selectedById, setSelectedById] = useState({});

  useEffect(() => {
    if (!authService.isAuthenticated() && !authService.autoLogin()) {
      window.dispatchEvent(new Event('auth:openLogin'));
      setLoading(false);
      return;
    }
    fetchWishlist();
  }, []);

  // Keep local cart membership in sync for visual indicators
  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      try {
        const ids = await cartService.getCartIds();
        if (!mounted) return;
        setCartIds(new Set(Array.from(ids)));
      } catch {}
    };
    refresh();
    const onCart = () => refresh();
    window.addEventListener('cart:changed', onCart);
    return () => {
      mounted = false;
      window.removeEventListener('cart:changed', onCart);
    };
  }, []);

  const initSelectedMap = useCallback((items) => {
    const map = {};
    for (const p of items) {
      const idx = (p.colors || []).findIndex((c) => c && c.selected);
      map[getPid(p)] = idx >= 0 ? idx : 0;
    }
    return map;
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistService.getWishlist();
      if (response.success) {
        const items = response.data || [];
        setWishlist(items);
        setSelectedById((prev) => ({ ...initSelectedMap(items) }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectColor = (productId, colorIndex) => {
    setSelectedById((prev) => ({ ...prev, [String(productId)]: colorIndex }));
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const response = await wishlistService.removeFromWishlist(productId);
      if (response.success) {
        const items = response.data || [];
        setWishlist(items);
        setSelectedById((prev) => {
          const next = { ...prev };
          delete next[String(productId)];
          return next;
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to remove item');
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      if (cartIds.has(String(productId))) return;
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

  const isInCart = (productId) => cartIds.has(String(productId));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-medium text-gray-900">My Favorites</h1>
          <p className="text-gray-500 mt-1">Items you’ve saved for later</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your favorites is empty</h3>
            <p className="text-gray-500 mb-6">Start adding products to your favorites.</p>
            <Link
              to="/products"
              className="inline-flex items-center px-5 py-2.5 rounded-md text-white bg-black hover:bg-gray-800"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {wishlist.map((product) => (
              <WishlistCard
                key={getPid(product)}
                product={product}
                selectedIndex={selectedById[getPid(product)] ?? 0}
                onSelectColor={handleSelectColor}
                onAddToCart={handleAddToCart}
                onRemove={handleRemoveFromWishlist}
                inCart={isInCart(getPid(product))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
