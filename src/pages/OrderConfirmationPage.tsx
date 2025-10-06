import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import orderService from '../services/orderService';

interface Order {
  _id: string;
  items: Array<{
    product: {
      _id: string;
      name: string;
      images?: string[];
    };
    name: string;
    price: number;
    quantity: number;
    itemTotal: number;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  paymentStatus: string;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    country: string;
  };
  createdAt: string;
}

const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get order from navigation state
  const { order } = location.state || {};

  useEffect(() => {
    // Redirect if no order data
    if (!order) {
      navigate('/products');
    }
  }, [order, navigate]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'unpaid': return 'text-red-600 bg-red-100';
      case 'refunded': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
            Order Confirmed!
          </h1>
          <p className="text-gray-600 mt-2">
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* Order Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                  Order #{order._id.slice(-8).toUpperCase()}
                </h2>
                <p className="text-sm text-gray-600">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="mt-2 sm:mt-0 flex space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
              Order Items
            </h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  {item.image && (
                    <img
                      src={`http://localhost:5001/api/images/${item.image}`}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-gray-900 font-semibold">{formatPrice(item.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(item.itemTotal)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">
                  {order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-semibold text-gray-900">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
            Shipping Address
          </h3>
          <div className="text-gray-700">
            <p className="font-semibold">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && (
              <p>{order.shippingAddress.addressLine2}</p>
            )}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
            What's Next?
          </h3>
          <div className="space-y-2 text-blue-800">
            <p>• You'll receive an order confirmation email shortly</p>
            <p>• We'll notify you when your order ships</p>
            <p>• Track your order status in your account</p>
            <p>• Estimated delivery: 5-7 business days</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            style={{ fontFamily: "'Albert Sans', sans-serif" }}
          >
            Continue Shopping
          </Link>
          <Link
            to="/account"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm bg-black text-white hover:bg-gray-800 font-medium transition-colors"
            style={{ fontFamily: "'Albert Sans', sans-serif" }}
          >
            View Order History
          </Link>
        </div>

        {/* Support Info */}
        <div className="text-center mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-600">
            Need help with your order?{' '}
            <Link to="/contact" className="text-black hover:underline font-medium">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
