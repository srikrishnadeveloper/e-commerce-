import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../services/orderService';

interface TrackingStep {
  status: string;
  title: string;
  description: string;
  date?: string;
  completed: boolean;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

interface OrderTrackingData {
  order: {
    _id: string;
    status: string;
    total: number;
    createdAt: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }>;
    shippingAddress: {
      fullName: string;
      addressLine1: string;
      city: string;
      state: string;
      postalCode: string;
    };
  };
  tracking: TrackingStep[];
  shippingInfo?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
  };
}

const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [trackingData, setTrackingData] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTracking = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        const response = await orderService.getOrderTracking(orderId);
        if (response.success) {
          setTrackingData(response.data);
        } else {
          setError('Order not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load tracking information');
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [orderId]);

  const getStatusColor = (status: string, completed: boolean) => {
    if (!completed) return 'bg-gray-200 text-gray-600';
    
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Pending';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/account?tab=orders" 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{trackingData.order._id.slice(-8)}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingData.order.status, true)}`}>
              {trackingData.order.status.charAt(0).toUpperCase() + trackingData.order.status.slice(1)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Order Date</p>
              <p className="font-medium">{formatDate(trackingData.order.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-600">Total</p>
              <p className="font-medium">${trackingData.order.total.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-600">Items</p>
              <p className="font-medium">{trackingData.order.items.length} item(s)</p>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Progress</h2>
          
          <div className="space-y-6">
            {trackingData.tracking.map((step, index) => (
              <div key={step.status} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step.completed ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  {index < trackingData.tracking.length - 1 && (
                    <div className={`w-0.5 h-12 mt-2 mx-auto ${
                      step.completed ? 'bg-green-500' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
                
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 mt-1">{step.description}</p>
                  {step.date && (
                    <p className="text-sm text-gray-500 mt-1">{formatDate(step.date)}</p>
                  )}
                  
                  {step.trackingNumber && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Tracking Number: <span className="font-mono">{step.trackingNumber}</span>
                      </p>
                      {step.trackingUrl && (
                        <a 
                          href={step.trackingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          Track Package
                        </a>
                      )}
                    </div>
                  )}
                  
                  {step.estimatedDelivery && (
                    <p className="text-sm text-gray-600 mt-1">
                      Estimated Delivery: {formatDate(step.estimatedDelivery)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {trackingData.order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <img
                  src={item.image || '/images/placeholder.jpg'}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
          <div className="text-gray-600">
            <p>{trackingData.order.shippingAddress.fullName}</p>
            <p>{trackingData.order.shippingAddress.addressLine1}</p>
            <p>
              {trackingData.order.shippingAddress.city}, {trackingData.order.shippingAddress.state} {trackingData.order.shippingAddress.postalCode}
            </p>
          </div>
        </div>

        {/* Back to Orders */}
        <div className="mt-8 text-center">
          <Link 
            to="/account?tab=orders" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to All Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
