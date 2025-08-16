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

class OrderService {
  async createOrderFromCart() {
    const response = await api.post('/orders');
    return response.data;
  }

  async getMyOrders() {
    const response = await api.get('/orders');
    return response.data;
  }

  async getOrderById(orderId) {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  }

  async cancelOrder(orderId) {
    const response = await api.patch(`/orders/${orderId}/cancel`);
    return response.data;
  }
}

export default new OrderService();







