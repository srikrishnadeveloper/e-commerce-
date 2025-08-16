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
