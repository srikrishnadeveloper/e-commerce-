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
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add to wishlist' };
    }
  }

  // Remove product from wishlist
  async removeFromWishlist(productId) {
    try {
      const response = await api.delete(`/wishlist/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove from wishlist' };
    }
  }

  // Clear wishlist
  async clearWishlist() {
    try {
      const response = await api.delete('/wishlist');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to clear wishlist' };
    }
  }

  // Check if product is in wishlist
  isInWishlist(productId, wishlist) {
    return wishlist.some(item => item._id === productId);
  }
}

export default new WishlistService();

