import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

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
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get cart' };
    }
  }

  async addToCart(productId, quantity = 1) {
    try {
      const response = await api.post(`/cart/${productId}`, { quantity });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add to cart' };
    }
  }

  async updateCartItem(itemId, quantity) {
    try {
      const response = await api.put(`/cart/item/${itemId}`, { quantity });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update cart item' };
    }
  }

  async removeFromCart(itemId) {
    try {
      const response = await api.delete(`/cart/item/${itemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove from cart' };
    }
  }

  async clearCart() {
    try {
      const response = await api.delete('/cart');
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
