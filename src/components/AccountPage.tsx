import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import addressService from '../services/addressService';
import { Address, AddressFormData } from '../types/Address';
import LogoutConfirmation from './LogoutConfirmation';

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  total: number;
  totalAmount?: number; // legacy field
  items: Array<{
    product?: {
      name: string;
      images: string[];
    };
    name: string;
    image: string;
    quantity: number;
    price: number;
  }>;
}

const AccountPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // User state
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressFormData, setAddressFormData] = useState<AddressFormData>({
    label: 'home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  
  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Account details state
  const [accountForm, setAccountForm] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [accountSaving, setAccountSaving] = useState(false);
  
  // Logout state
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'orders', label: 'Orders' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'account-details', label: 'Account Details' },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'logout', label: 'Logout' }
  ];

  // Check auth and fetch user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      window.dispatchEvent(new Event('auth:openLogin'));
      return;
    }
    fetchUserData();
  }, [navigate]);

  // Fetch addresses when addresses tab is active
  useEffect(() => {
    if (activeTab === 'addresses' && user) {
      fetchAddresses();
    }
  }, [activeTab, user]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders' && user) {
      fetchOrders();
    }
  }, [activeTab, user]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/');
          window.dispatchEvent(new Event('auth:openLogin'));
          return;
        }
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      const userData = data.data || data;
      setUser(userData);
      
      // Populate account form
      const nameParts = (userData.name || '').split(' ');
      setAccountForm(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        displayName: userData.name || '',
        email: userData.email || ''
      }));
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setAddressLoading(true);
    try {
      const data = await addressService.getAddresses();
      // Ensure we always have an array
      setAddresses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
    } finally {
      setAddressLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const ordersData = data.data || data || [];
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = addressService.validateAddress(addressFormData as Address);
    if (!validation.isValid) {
      setAddressErrors(validation.errors);
      return;
    }
    
    setAddressLoading(true);
    try {
      if (editingAddress) {
        await addressService.updateAddress(editingAddress._id!, addressFormData);
      } else {
        await addressService.addAddress(addressFormData);
      }
      await fetchAddresses();
      resetAddressForm();
    } catch (error: any) {
      console.error('Error saving address:', error);
      alert(error.message || 'Failed to save address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await addressService.deleteAddress(addressId);
      await fetchAddresses();
    } catch (error: any) {
      console.error('Error deleting address:', error);
      alert(error.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await addressService.setDefaultAddress(addressId);
      await fetchAddresses();
    } catch (error: any) {
      console.error('Error setting default:', error);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressFormData({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  };

  const resetAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressFormData({
      label: 'home',
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: false
    });
    setAddressErrors({});
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Update profile using correct endpoint (PATCH /api/auth/updateMe)
      const profileResponse = await fetch('http://localhost:5001/api/auth/updateMe', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `${accountForm.firstName} ${accountForm.lastName}`.trim(),
          email: accountForm.email
        })
      });
      
      if (!profileResponse.ok) {
        throw new Error('Failed to update profile');
      }
      
      // Update password if provided
      if (accountForm.currentPassword && accountForm.newPassword) {
        if (accountForm.newPassword !== accountForm.confirmPassword) {
          alert('New passwords do not match');
          setAccountSaving(false);
          return;
        }
        
        // Use correct endpoint (PATCH /api/auth/updatePassword)
        const passwordResponse = await fetch('http://localhost:5001/api/auth/updatePassword', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: accountForm.currentPassword,
            newPassword: accountForm.newPassword,
            newPasswordConfirm: accountForm.confirmPassword
          })
        });
        
        if (!passwordResponse.ok) {
          const data = await passwordResponse.json();
          throw new Error(data.message || 'Failed to change password');
        }
      }
      
      alert('Changes saved successfully!');
      setAccountForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Update local storage
      const updatedUser = { ...user, name: `${accountForm.firstName} ${accountForm.lastName}`.trim() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('auth:changed'));
      
    } catch (error: any) {
      console.error('Error saving account:', error);
      alert(error.message || 'Failed to save changes');
    } finally {
      setAccountSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth:changed'));
    navigate('/');
  };

  const handleTabClick = (tabId: string) => {
    if (tabId === 'logout') {
      setShowLogoutConfirmation(true);
    } else {
      setActiveTab(tabId);
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

  const renderDashboard = () => (
    <div className="text-left px-2 sm:px-0">
      <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Hello {user?.name || 'User'}</h2>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
        From your account dashboard you can view your{' '}
        <button 
          onClick={() => setActiveTab('orders')}
          className="text-red-500 hover:text-red-600 underline"
        >
          recent orders
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

  const renderOrders = () => (
    <div className="px-2 sm:px-0">
      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {ordersLoading ? (
          <div className="py-8 text-center text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No orders found</div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-sm">#{order.orderNumber || order._id.slice(-6)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <p className="text-sm font-medium">₹{(order.total || order.totalAmount || 0).toFixed(2)} <span className="text-gray-500 font-normal">({order.items?.length || 0} items)</span></p>
                <button 
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowOrderModal(true);
                  }}
                  className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors rounded"
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4 px-0 font-medium text-gray-700 text-sm lg:text-base">Order</th>
              <th className="text-left py-4 px-2 lg:px-4 font-medium text-gray-700 text-sm lg:text-base">Date</th>
              <th className="text-left py-4 px-2 lg:px-4 font-medium text-gray-700 text-sm lg:text-base">Status</th>
              <th className="text-left py-4 px-2 lg:px-4 font-medium text-gray-700 text-sm lg:text-base">Total</th>
              <th className="text-left py-4 px-2 lg:px-4 font-medium text-gray-700 text-sm lg:text-base">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ordersLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">Loading orders...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">No orders found</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-0 text-sm lg:text-base">#{order.orderNumber || order._id.slice(-6)}</td>
                  <td className="py-4 px-2 lg:px-4 text-sm lg:text-base whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td className="py-4 px-2 lg:px-4 capitalize text-sm lg:text-base">{order.status}</td>
                  <td className="py-4 px-2 lg:px-4 text-sm lg:text-base whitespace-nowrap">₹{(order.total || order.totalAmount || 0).toFixed(2)} for {order.items?.length || 0} Items</td>
                  <td className="py-4 px-2 lg:px-4">
                    <button 
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderModal(true);
                      }}
                      className="bg-black text-white px-3 lg:px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold">Order #{selectedOrder.orderNumber || selectedOrder._id.slice(-6)}</h2>
                <button onClick={() => setShowOrderModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl p-1">&times;</button>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between border-b pb-3 sm:pb-4 text-sm sm:text-base">
                  <span className="text-gray-600">Date:</span>
                  <span>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b pb-3 sm:pb-4 text-sm sm:text-base">
                  <span className="text-gray-600">Status:</span>
                  <span className="capitalize font-medium">{selectedOrder.status}</span>
                </div>
                <div className="flex justify-between border-b pb-3 sm:pb-4 text-sm sm:text-base">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold">₹{(selectedOrder.total || selectedOrder.totalAmount || 0).toFixed(2)}</span>
                </div>
                
                <div className="mt-4 sm:mt-6">
                  <h3 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">Items</h3>
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 sm:gap-4 py-3 border-b">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image || item.product?.images?.[0] || '/images/placeholder.svg'} 
                          alt={item.name || item.product?.name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{item.name || item.product?.name || 'Product'}</p>
                        <p className="text-gray-500 text-xs sm:text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-sm sm:text-base flex-shrink-0">₹{item.price?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3">
                  <Link 
                    to={`/order-tracking/${selectedOrder._id}`}
                    className="bg-black text-white px-4 sm:px-6 py-2 font-medium hover:bg-gray-800 transition-colors text-center text-sm sm:text-base"
                  >
                    Track Order
                  </Link>
                  <button 
                    onClick={() => setShowOrderModal(false)}
                    className="border border-black px-4 sm:px-6 py-2 font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAddresses = () => (
    <div className="px-2 sm:px-0">
      <button 
        onClick={() => setShowAddressForm(true)}
        className="w-full sm:w-auto bg-black text-white px-4 sm:px-6 py-3 font-medium mb-6 sm:mb-8 hover:bg-gray-800 transition-colors text-sm sm:text-base"
      >
        Add a new address
      </button>
      
      {addressLoading ? (
        <div className="text-gray-500">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="text-gray-500">No addresses saved yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {addresses.map((address) => (
            <div key={address._id} className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg">
              <h3 className="font-semibold mb-3 sm:mb-4 capitalize text-sm sm:text-base">
                {address.label}
                {address.isDefault && <span className="ml-2 text-xs sm:text-sm text-green-600 font-normal">(Default)</span>}
              </h3>
              <div className="text-gray-700 mb-4 leading-relaxed text-sm sm:text-base">
                <p className="font-medium">{address.fullName}</p>
                <p className="break-words">{address.addressLine1}</p>
                {address.addressLine2 && <p className="break-words">{address.addressLine2}</p>}
                <p>{address.city}, {address.state} {address.postalCode}</p>
                <p>{address.country}</p>
                <p className="mt-2">Phone: {address.phone}</p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button 
                  onClick={() => handleEditAddress(address)}
                  className="bg-black text-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteAddress(address._id!)}
                  className="border border-black text-black px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Delete
                </button>
                {!address.isDefault && (
                  <button 
                    onClick={() => handleSetDefault(address._id!)}
                    className="border border-green-600 text-green-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium hover:bg-green-50 transition-colors whitespace-nowrap"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold">{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
                <button onClick={resetAddressForm} className="text-gray-500 hover:text-gray-700 text-2xl p-1">&times;</button>
              </div>
              
              <form onSubmit={handleAddressSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Address Label *</label>
                  <select
                    value={addressFormData.label}
                    onChange={(e) => setAddressFormData({...addressFormData, label: e.target.value as 'home' | 'work' | 'other'})}
                    className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={addressFormData.fullName}
                    onChange={(e) => setAddressFormData({...addressFormData, fullName: e.target.value})}
                    className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                  />
                  {addressErrors.fullName && <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.fullName}</p>}
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={addressFormData.phone}
                    onChange={(e) => setAddressFormData({...addressFormData, phone: e.target.value})}
                    className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                  />
                  {addressErrors.phone && <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.phone}</p>}
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Address Line 1 *</label>
                  <input
                    type="text"
                    value={addressFormData.addressLine1}
                    onChange={(e) => setAddressFormData({...addressFormData, addressLine1: e.target.value})}
                    className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                  />
                  {addressErrors.addressLine1 && <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.addressLine1}</p>}
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Address Line 2</label>
                  <input
                    type="text"
                    value={addressFormData.addressLine2}
                    onChange={(e) => setAddressFormData({...addressFormData, addressLine2: e.target.value})}
                    className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">City *</label>
                    <input
                      type="text"
                      value={addressFormData.city}
                      onChange={(e) => setAddressFormData({...addressFormData, city: e.target.value})}
                      className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                    />
                    {addressErrors.city && <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">State *</label>
                    <input
                      type="text"
                      value={addressFormData.state}
                      onChange={(e) => setAddressFormData({...addressFormData, state: e.target.value})}
                      className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                    />
                    {addressErrors.state && <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.state}</p>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Postal Code *</label>
                    <input
                      type="text"
                      value={addressFormData.postalCode}
                      onChange={(e) => setAddressFormData({...addressFormData, postalCode: e.target.value})}
                      className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                    />
                    {addressErrors.postalCode && <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.postalCode}</p>}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Country</label>
                    <input
                      type="text"
                      value={addressFormData.country}
                      onChange={(e) => setAddressFormData({...addressFormData, country: e.target.value})}
                      className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressFormData.isDefault}
                    onChange={(e) => setAddressFormData({...addressFormData, isDefault: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isDefault" className="text-xs sm:text-sm text-gray-700">Set as default address</label>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-3 sm:pt-4">
                  <button
                    type="submit"
                    disabled={addressLoading}
                    className="w-full sm:w-auto bg-black text-white px-4 sm:px-6 py-2 text-sm sm:text-base font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 rounded"
                  >
                    {addressLoading ? 'Saving...' : (editingAddress ? 'Update Address' : 'Add Address')}
                  </button>
                  <button
                    type="button"
                    onClick={resetAddressForm}
                    className="w-full sm:w-auto border border-black px-4 sm:px-6 py-2 text-sm sm:text-base font-medium hover:bg-gray-50 transition-colors rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderWishlist = () => (
    <div className="px-2 sm:px-0">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Product 1 */}
        <div className="group">
          <div className="relative mb-2 sm:mb-4 bg-gray-100 aspect-square overflow-hidden rounded-lg">
            <img 
              src="/images/IMAGE_1.png" 
              alt="Ribbed Tank Top"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base truncate">Ribbed Tank Top</h3>
          <p className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">$16.95</p>
          <div className="flex gap-1 sm:gap-2">
            <button className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-orange-400 border-2 border-orange-400"></button>
            <button className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-black border-2 border-gray-300"></button>
          </div>
        </div>

        {/* Product 2 */}
        <div className="group">
          <div className="relative mb-2 sm:mb-4 bg-gray-100 aspect-square overflow-hidden rounded-lg">
            <img 
              src="/images/IMAGE_2.png" 
              alt="Ribbed Modal T-shirt"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-sm font-medium rounded">
              You are good to go!
            </div>
          </div>
          <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base truncate">Ribbed Modal T-shirt</h3>
          <p className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">$18.95</p>
          <div className="flex gap-1 sm:gap-2">
            <button className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-400 border-2 border-green-400"></button>
            <button className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-pink-300 border-2 border-gray-300"></button>
            <button className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-200 border-2 border-gray-300"></button>
          </div>
        </div>

        {/* Product 3 */}
        <div className="group">
          <div className="relative mb-2 sm:mb-4 bg-gray-100 aspect-square overflow-hidden rounded-lg">
            <img 
              src="/images/IMAGE_3.png" 
              alt="Oversized Printed T-shirt"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base truncate">Oversized Printed T-shirt</h3>
          <p className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">$10.00</p>
        </div>
      </div>
    </div>
  );

  const renderAccountDetails = () => (
    <div className="px-2 sm:px-0">
      <form onSubmit={handleAccountSubmit} className="max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={accountForm.firstName}
              onChange={(e) => setAccountForm({...accountForm, firstName: e.target.value})}
              className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent rounded"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={accountForm.lastName}
              onChange={(e) => setAccountForm({...accountForm, lastName: e.target.value})}
              className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent rounded"
            />
          </div>
        </div>
        
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Display Name *
          </label>
          <input
            type="text"
            value={accountForm.displayName}
            onChange={(e) => setAccountForm({...accountForm, displayName: e.target.value})}
            className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent rounded"
          />
        </div>

        <div className="mb-6 sm:mb-8">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={accountForm.email}
            onChange={(e) => setAccountForm({...accountForm, email: e.target.value})}
            className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent rounded"
          />
        </div>

        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Password Change</h3>
        
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Current Password (leave blank to leave unchanged)
          </label>
          <input
            type="password"
            value={accountForm.currentPassword}
            onChange={(e) => setAccountForm({...accountForm, currentPassword: e.target.value})}
            className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent rounded"
          />
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            New Password (leave blank to leave unchanged)
          </label>
          <input
            type="password"
            value={accountForm.newPassword}
            onChange={(e) => setAccountForm({...accountForm, newPassword: e.target.value})}
            className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent rounded"
          />
        </div>

        <div className="mb-6 sm:mb-8">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={accountForm.confirmPassword}
            onChange={(e) => setAccountForm({...accountForm, confirmPassword: e.target.value})}
            className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent rounded"
          />
        </div>

        <button
          type="submit"
          disabled={accountSaving}
          className="w-full sm:w-auto bg-black text-white px-6 sm:px-8 py-3 text-sm sm:text-base font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 rounded"
        >
          {accountSaving ? 'Saving...' : 'Save Changes'}
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
      default: return renderDashboard();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Gradient Header Section */}
      <div className="w-full bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-black">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
          {/* Mobile Tab Navigation */}
          <div className="lg:hidden">
            <select
              value={activeTab}
              onChange={(e) => handleTabClick(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base font-medium bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {sidebarItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <nav className="space-y-2 sticky top-4">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full text-left px-4 xl:px-6 py-3 font-medium transition-colors text-sm xl:text-base ${
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
          <div className="flex-1 min-w-0 overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        isOpen={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default AccountPage;
