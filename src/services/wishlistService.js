import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class WishlistService {
  constructor() {
    this._ids = new Set();
    this._ready = false;
    try {
      window.addEventListener('wishlist:changed', () => {
        this.refreshIds().catch(() => {});
      });
    } catch {}
  }

  async refreshIds() {
    try {
      const data = await this.getWishlist();
      const items = data?.data || data || [];
      this._ids = new Set((Array.isArray(items) ? items : []).map((p) => String(p._id || p.id)));
      this._ready = true;
      return this._ids;
    } catch (e) {
      this._ids.clear();
      this._ready = false;
      return this._ids;
    }
  }

  async getWishlistIds() {
    if (!this._ready) {
      await this.refreshIds();
    }
    return this._ids;
  }

  isInWishlistSync(productId) {
    return this._ids.has(String(productId));
  }
  // Get user wishlist
  async getWishlist() {
    try {
      const response = await api.get('/wishlist');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get wishlist' };
    }
  }

  // Add product to wishlist
  async addToWishlist(productId) {
    try {
      const response = await api.post(`/wishlist/${productId}`);
      try { window.dispatchEvent(new Event('wishlist:changed')); } catch {}
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add to wishlist' };
    }
  }

  // Remove product from wishlist
  async removeFromWishlist(productId) {
    try {
      const response = await api.delete(`/wishlist/${productId}`);
      try { window.dispatchEvent(new Event('wishlist:changed')); } catch {}
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove from wishlist' };
    }
  }

  // Clear wishlist
  async clearWishlist() {
    try {
      const response = await api.delete('/wishlist');
      try { window.dispatchEvent(new Event('wishlist:changed')); } catch {}
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to clear wishlist' };
    }
  }

  // Check if product is in wishlist
  isInWishlist(productId, wishlist) {
    const pid = String(productId);
    return wishlist.some(item => String(item._id) === pid);
  }
}

export default new WishlistService();

