import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import orderService from '../services/orderService';
import wishlistService from '../services/wishlistService';

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'orders', label: 'Orders' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'account-details', label: 'Account Details' },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'logout', label: 'Logout' }
  ];

  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Form state for account details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  // Password fields
  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      window.dispatchEvent(new Event('auth:openLogin'));
      return;
    }
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [userData, ordersData, wishlistData] = await Promise.all([
        authService.getCurrentUser(),
        orderService.getMyOrders(),
        wishlistService.getWishlist()
      ]);
  setUser(userData.data);
  // Initialize form fields from user
  const fullName = userData.data?.name || '';
  const parts = fullName.split(' ');
  setFirstName(parts[0] || '');
  setLastName(parts.slice(1).join(' ') || '');
  setDisplayName(fullName);
  setEmail(userData.data?.email || '');
      setOrders(ordersData.data || []);
      setWishlist(wishlistData.data || []);
    } catch (err) {
      setError('Failed to load account data');
      console.error('Account data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (wishlistId: string) => {
    try {
      await wishlistService.removeFromWishlist(wishlistId);
      setWishlist(prev => prev.filter(item => item._id !== wishlistId));
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      setError('Failed to remove item from wishlist');
    }
  };

  const fetchOrders = async () => {
    try {
      const ordersData = await orderService.getMyOrders();
      setOrders(ordersData.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'My Account';
      case 'orders': return 'My Orders';
      case 'addresses': return 'My Account Address';
      case 'wishlist': return 'My Account Wishlist';
      case 'account-details': return 'My Account Details';
      default: return 'My Account';
    }
  };

  // Handle logout tab
  useEffect(() => {
    if (activeTab === 'logout') {
      authService.logout();
      setActiveTab('dashboard');
    }
  }, [activeTab]);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Update profile if name/email changed
      const newName = displayName?.trim() || `${firstName} ${lastName}`.trim();
      const profilePayload = {
        name: newName,
        email,
      };
      await authService.updateProfile(profilePayload);

      // Update password if provided
      if (passwordCurrent || password || passwordConfirm) {
        if (!passwordCurrent || !password || !passwordConfirm) {
          throw { message: 'Please fill all password fields' };
        }
        if (password !== passwordConfirm) {
          throw { message: 'New passwords do not match' };
        }
        await authService.updatePassword({ passwordCurrent, password, passwordConfirm });
      }

      setSuccess('Account updated successfully');
      await loadUserData();
    } catch (err) {
      const msg = err?.message || err?.error || 'Failed to update account';
      setError(msg);
    }
  };

  const renderDashboard = () => (
    <div className="text-left">
      <h2 className="text-2xl font-semibold mb-4">Hello {user?.name || 'User'}</h2>
      <p className="text-gray-600 leading-relaxed">
        From your account dashboard you can view your{' '}
        <button 
          onClick={() => setActiveTab('orders')}
          className="text-red-500 hover:text-red-600 underline"
        >
          recent orders ({orders.length})
        </button>
        , manage your{' '}
        <button 
          onClick={() => setActiveTab('addresses')}
          className="text-red-500 hover:text-red-600 underline"
        >
          shipping and billing addresses
        </button>
        , and{' '}
        <button 
          onClick={() => setActiveTab('account-details')}
          className="text-red-500 hover:text-red-600 underline"
        >
          edit your password and account details
        </button>
        .
      </p>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReorder = async (orderId: string) => {
    try {
      const response = await orderService.reorderFromOrder(orderId);
      if (response.success) {
        alert('Reorder created successfully!');
        // Refresh orders
        fetchOrders();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to create reorder');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const response = await orderService.cancelOrder(orderId);
        if (response.success) {
          alert('Order cancelled successfully');
          // Refresh orders
          fetchOrders();
        }
      } catch (error: any) {
        alert(error.message || 'Failed to cancel order');
      }
    }
  };

  const renderOrders = () => (
    <div>
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
          <p className="text-gray-600">You haven't placed any orders yet. Start shopping to see your orders here.</p>
          <Link
            to="/"
            className="inline-block mt-4 bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Order #{order._id.slice(-8)}</h3>
                  <p className="text-gray-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-600">Total Amount</p>
                  <p className="text-xl font-semibold">${order.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Items</p>
                  <p className="font-medium">{order.items?.length || 0} item(s)</p>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-600 mb-2">Items:</p>
                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        <img
                          src={item.image || '/images/placeholder.jpg'}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-gray-600 text-sm">
                        +{order.items.length - 2} more item(s)
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/order-tracking/${order._id}`}
                  className="bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                >
                  Track Order
                </Link>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="bg-gray-600 text-white px-4 py-2 text-sm font-medium rounded hover:bg-gray-700 transition-colors"
                >
                  View Details
                </button>
                {order.status === 'delivered' && (
                  <button
                    onClick={() => handleReorder(order._id)}
                    className="bg-green-600 text-white px-4 py-2 text-sm font-medium rounded hover:bg-green-700 transition-colors"
                  >
                    Reorder
                  </button>
                )}
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="bg-red-600 text-white px-4 py-2 text-sm font-medium rounded hover:bg-red-700 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAddresses = () => (
    <div>
      <button className="bg-black text-white px-6 py-3 font-medium mb-8 hover:bg-gray-800 transition-colors">
        Add a new address
      </button>
      {user?.address ? (
        <div className="bg-white border border-gray-200 p-6 max-w-md">
          <h3 className="font-semibold mb-4">Default</h3>
          <div className="text-gray-700 mb-4 leading-relaxed">
            <p>{user.address.street}, {user.address.city},</p>
            <p>{user.address.state} {user.address.zipCode}</p>
            <p className="mt-2">Email: {user.email}</p>
            <p>Phone: {user.address.phone || 'Not provided'}</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-black text-white px-4 py-2 font-medium hover:bg-gray-800 transition-colors">
              Edit
            </button>
            <button className="border border-black text-black px-4 py-2 font-medium hover:bg-gray-50 transition-colors">
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 p-6 max-w-md">
          <h3 className="font-semibold mb-4">No Address Saved</h3>
          <p className="text-gray-600">You haven't added any addresses yet. Click "Add a new address" to get started.</p>
        </div>
      )}
    </div>
  );

  const renderWishlist = () => (
    <div>
      {wishlist.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600">Start adding products to your wishlist to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map((item) => (
            <div key={item._id} className="group">
              <div className="relative mb-4 bg-gray-100 aspect-square overflow-hidden">
                <img 
                  src={item.product?.images?.[0] || '/images/placeholder.svg'} 
                  alt={item.product?.name || 'Product'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button 
                  onClick={() => handleRemoveFromWishlist(item._id)}
                  className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <h3 className="font-semibold mb-2">{item.product?.name || 'Product'}</h3>
              <p className="font-medium mb-3">${item.product?.price || '0.00'}</p>
              <div className="flex gap-2">
                {item.product?.colors?.slice(0, 3).map((color, index) => (
                  <button 
                    key={index}
                    className={`w-5 h-5 rounded-full border-2 border-gray-300`}
                    style={{ backgroundColor: color }}
                  ></button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAccountDetails = () => (
    <div>
      {error && (
        <div className="max-w-2xl mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}
      {success && (
        <div className="max-w-2xl mb-4 p-3 rounded bg-green-50 text-green-700 border border-green-200">{success}</div>
      )}
      <form className="max-w-2xl" onSubmit={handleSaveAccount}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name *
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <h3 className="text-lg font-semibold mb-4">Password Change</h3>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password (leave blank to leave unchanged)
          </label>
          <input
            type="password"
            value={passwordCurrent}
            onChange={(e) => setPasswordCurrent(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password (leave blank to leave unchanged)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors"
        >
          Save Changes
        </button>
      </form>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'orders': return renderOrders();
      case 'addresses': return renderAddresses();
      case 'wishlist': return renderWishlist();
      case 'account-details': return renderAccountDetails();
      case 'logout': return <div>Logging out...</div>;
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Gradient Header Section */}
      <div className="w-full bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-black">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <nav className="space-y-4">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-6 py-3 font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-red-50 text-red-600 border-l-4 border-red-600'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
