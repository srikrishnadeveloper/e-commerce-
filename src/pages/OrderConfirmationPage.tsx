import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

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
  shippingAddress?: {
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
  
  // Get order and email from navigation state
  const { order, email } = location.state || {};

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
    return `$${price.toFixed(2)} USD`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Page Header - Same gradient style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center flex items-center justify-center" style={{
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(254, 240, 239, 1) 50%, rgba(243, 251, 251, 1) 76%, rgba(254, 255, 255, 1) 98%)',
          height: '194px'
        }}>
          <h1 className="text-black" style={{ fontSize: '42px', fontWeight: 'normal', fontFamily: "'Albert Sans', sans-serif" }}>
            Payment confirmation
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Payment Confirmation Card */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-xl font-semibold text-black mb-6">
            Payment confirmation
          </h2>
          
          {/* Details Table */}
          <div className="space-y-4">
            {/* Date */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Date</span>
              <span className="text-gray-900">{formatDate(order.createdAt)}</span>
            </div>
            
            {/* Payment method */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Payment method</span>
              <span className="text-gray-900">Cash on Delivery</span>
            </div>
            
            {/* Order ID as Card number replacement */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Order number</span>
              <span className="text-gray-900">#{order._id?.slice(-8).toUpperCase() || 'N/A'}</span>
            </div>
            
            {/* Cardholder name / Customer name */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Customer name</span>
              <span className="text-gray-900">{order.shippingAddress?.fullName || 'N/A'}</span>
            </div>
            
            {/* Email */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Email</span>
              <span className="text-gray-900">{email || 'N/A'}</span>
            </div>
            
            {/* Phone */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Phone</span>
              <span className="text-gray-900">{order.shippingAddress?.phone || 'N/A'}</span>
            </div>
            
            {/* Subtotal */}
            <div className="flex justify-between items-center py-2 pt-4">
              <span className="text-gray-900 font-semibold">Subtotal</span>
              <span className="text-gray-900 font-semibold">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              to="/products"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              to="/account?tab=orders"
              className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg bg-black text-white hover:bg-gray-800 font-medium transition-colors"
            >
              View Orders
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Have a question?
            <Link to="/contact" className="text-red-500 hover:text-red-600 ml-1">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
