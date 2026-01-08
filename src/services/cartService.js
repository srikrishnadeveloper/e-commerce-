import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';
const STATIC_BASE_URL = 'http://localhost:5001';

// Helper to normalize image URLs
const normalizeImageUrl = (img) => {
  if (!img) return img;
  if (/^https?:\/\//i.test(img)) return img;
  if (img.startsWith('/images/')) return `${STATIC_BASE_URL}${img}`;
  return `${STATIC_BASE_URL}/images/${img.replace(/^\/?/, '')}`;
};

// Normalize cart item images
const normalizeCartItem = (item) => {
  if (!item) return item;
  if (item.product && item.product.images) {
    item.product.images = item.product.images.map(normalizeImageUrl);
  }
  return item;
};

// Normalize all cart items
const normalizeCart = (cartData) => {
  if (!cartData) return cartData;
  if (cartData.data && cartData.data.items) {
    cartData.data.items = cartData.data.items.map(normalizeCartItem);
  }
  if (cartData.items) {
    cartData.items = cartData.items.map(normalizeCartItem);
  }
  return cartData;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class CartService {
  constructor() {
    this._ids = new Set();
    this._ready = false;
    // Keep cache in sync with global cart changes
    try {
      window.addEventListener('cart:changed', () => {
        this.refreshIds().catch(() => {});
      });
    } catch {}
  }

  async refreshIds() {
    try {
      const data = await this.getCart();
      const items = data?.data?.items || [];
      this._ids = new Set(items.map((it) => String(it.product?._id || it.product)));
      this._ready = true;
      return this._ids;
    } catch (e) {
      this._ids.clear();
      this._ready = false;
      return this._ids;
    }
  }

  async getCartIds() {
    if (!this._ready) {
      await this.refreshIds();
    }
    return this._ids;
  }

  isInCartSync(productId) {
    return this._ids.has(String(productId));
  }
  async getCart() {
    try {
      const response = await api.get('/cart');
      return normalizeCart(response.data);
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get cart' };
    }
  }

  async addToCart(productId, quantity = 1, selectedColor = '', selectedSize = '') {
    try {
      // Optimistically add to local cache before API call
      this._ids.add(String(productId));
      const response = await api.post(`/cart/${productId}`, { 
        quantity,
        selectedColor,
        selectedSize
      });
      try { window.dispatchEvent(new Event('cart:changed')); } catch {}
      return response.data;
    } catch (error) {
      // Revert optimistic update on failure
      this._ids.delete(String(productId));
      throw error.response?.data || { message: 'Failed to add to cart' };
    }
  }

  async updateCartItem(itemId, quantity, selectedColor = '', selectedSize = '') {
    try {
      const response = await api.put(`/cart/item/${itemId}`, { 
        quantity,
        selectedColor,
        selectedSize
      });
      try { window.dispatchEvent(new Event('cart:changed')); } catch {}
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update cart item' };
    }
  }

  async removeFromCart(itemId) {
    try {
      const response = await api.delete(`/cart/item/${itemId}`);
      try { window.dispatchEvent(new Event('cart:changed')); } catch {}
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove from cart' };
    }
  }

  async clearCart() {
    try {
      const response = await api.delete('/cart');
      try { window.dispatchEvent(new Event('cart:changed')); } catch {}
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to clear cart' };
    }
  }

  async getCartCount() {
    try {
      const response = await api.get('/cart');
      return response.data.data.totalItems || 0;
    } catch (error) {
      return 0;
    }
  }
}

export default new CartService();
