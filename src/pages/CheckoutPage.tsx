import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cartService from '../services/cartService';
import authService from '../services/authService';
import addressService from '../services/addressService';
import { Address } from '../types/Address';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
  itemTotal: number;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  totalItems: number;
}

interface BillingDetails {
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  orderNotes: string;
}

interface OrderSuccessData {
  order: any;
  email: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<OrderSuccessData | null>(null);
  
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    firstName: '',
    lastName: '',
    country: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    orderNotes: ''
  });

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      window.dispatchEvent(new Event('auth:openLogin'));
      navigate('/cart');
      return;
    }
    
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load cart and addresses in parallel
      const [cartResponse, addresses] = await Promise.all([
        cartService.getCart(),
        addressService.getAddresses()
      ]);
      
      if (cartResponse.success && cartResponse.data) {
        if (!cartResponse.data.items || cartResponse.data.items.length === 0) {
          navigate('/cart');
          return;
        }
        setCart(cartResponse.data);
      } else {
        navigate('/cart');
        return;
      }
      
      // Set saved addresses
      if (Array.isArray(addresses)) {
        setSavedAddresses(addresses);
        // Auto-select default address
        const defaultAddress = addresses.find(addr => addr.isDefault && addr._id);
        if (defaultAddress && defaultAddress._id) {
          setSelectedAddressId(defaultAddress._id);
          populateBillingFromAddress(defaultAddress as Address & { _id: string });
        }
      }
      
      // Pre-fill user email
      const user = authService.getCurrentUserFromStorage();
      if (user?.email) {
        setBillingDetails(prev => ({ ...prev, email: user.email }));
      }
      if (user?.name) {
        const nameParts = user.name.split(' ');
        setBillingDetails(prev => ({ 
          ...prev, 
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || ''
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load checkout data');
    } finally {
      setLoading(false);
    }
  };

  const populateBillingFromAddress = (address: Address & { _id: string }) => {
    const nameParts = address.fullName.split(' ');
    setBillingDetails(prev => ({
      ...prev,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      country: address.country || '',
      city: address.city || '',
      address: address.addressLine1 + (address.addressLine2 ? ', ' + address.addressLine2 : ''),
      phone: address.phone || ''
    }));
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = savedAddresses.find(a => a._id === addressId);
    if (address && address._id) {
      populateBillingFromAddress(address as Address & { _id: string });
    }
  };

  const handleInputChange = (field: keyof BillingDetails, value: string) => {
    setBillingDetails(prev => ({ ...prev, [field]: value }));
    // Clear selected address when manually editing
    if (['firstName', 'lastName', 'country', 'city', 'address', 'phone'].includes(field)) {
      setSelectedAddressId('');
    }
  };

  const handleApplyDiscount = () => {
    // Placeholder for discount code functionality
    if (discountCode.trim()) {
      setError('Discount codes coming soon!');
      setTimeout(() => setError(''), 3000);
    }
  };

  const validateForm = (): boolean => {
    if (!billingDetails.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!billingDetails.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!billingDetails.country.trim()) {
      setError('Country/Region is required');
      return false;
    }
    if (!billingDetails.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!billingDetails.address.trim()) {
      setError('Address is required');
      return false;
    }
    if (!billingDetails.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!billingDetails.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!agreeTerms) {
      setError('Please agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }

    if (!cart) {
      setError('Cart is empty');
      return;
    }

    try {
      setSubmitting(true);
      
      // Build shipping address from billing details
      const shippingAddress = {
        fullName: `${billingDetails.firstName} ${billingDetails.lastName}`.trim(),
        addressLine1: billingDetails.address,
        addressLine2: '',
        city: billingDetails.city,
        state: billingDetails.city, // Using city as state for simplicity
        postalCode: '00000', // Default postal code
        phone: billingDetails.phone,
        country: billingDetails.country
      };
      
      // Create order from cart with shipping address
      const response = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          shippingAddress,
          orderNotes: billingDetails.orderNotes,
          paymentMethod
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Show success popup
        setOrderSuccessData({
          order: data.data,
          email: billingDetails.email
        });
        setShowSuccessPopup(true);
      } else {
        setError(data.message || 'Failed to place order');
      }
    } catch (err: any) {
      console.error('Order creation failed:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Page Header - Same style as ContactUs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center flex items-center justify-center" style={{
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(254, 240, 239, 1) 50%, rgba(243, 251, 251, 1) 76%, rgba(254, 255, 255, 1) 98%)',
          height: '194px'
        }}>
          <h1 className="text-black" style={{ fontSize: '42px', fontWeight: 'normal', fontFamily: "'Albert Sans', sans-serif" }}>
            Check Out
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" aria-live="polite">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Billing Details */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-black mb-6">
                Billing details
              </h2>
              
              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Use saved address
                  </label>
                  <select
                    value={selectedAddressId}
                    onChange={(e) => handleAddressSelect(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="">Enter new address</option>
                    {savedAddresses.map((addr) => (
                      <option key={addr._id} value={addr._id}>
                        {addr.fullName} - {addr.addressLine1}, {addr.city} {addr.isDefault ? '(Default)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Name Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={billingDetails.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Themesflat"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={billingDetails.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country/Region<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={billingDetails.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-700"
                  >
                    <option value="">---</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="India">India</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                    <option value="China">China</option>
                    <option value="Brazil">Brazil</option>
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Town/City<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={billingDetails.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={billingDetails.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={billingDetails.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={billingDetails.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400"
                  />
                </div>

                {/* Order Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order notes (optional)<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={billingDetails.orderNotes}
                    onChange={(e) => handleInputChange('orderNotes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-black mb-6">
                Your order
              </h2>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {cart?.items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <img
                        src={item.product.images?.[0] || '/images/placeholder.svg'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black truncate">{item.product.name}</p>
                    </div>
                    <p className="text-sm font-medium text-black">{formatPrice(item.itemTotal)}</p>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className="flex space-x-2 mb-6">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Discount code"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400"
                />
                <button
                  onClick={handleApplyDiscount}
                  className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Apply
                </button>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-4 border-t border-gray-200">
                <span className="text-lg font-semibold text-black">Total</span>
                <span className="text-lg font-semibold text-black">{formatPrice(cart?.total || 0)}</span>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3 mt-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-red-500 border-gray-300 focus:ring-red-500"
                  />
                  <span className="text-gray-700">Direct bank transfer</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-red-500 border-gray-300 focus:ring-red-500"
                  />
                  <span className="text-gray-700">Cash on delivery</span>
                </label>
              </div>

              {/* Privacy Notice */}
              <p className="text-sm text-gray-600 mt-6">
                Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our
                <a href="/privacy-policy" className="underline hover:text-black">privacy policy</a>.
              </p>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-3 mt-4">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-1 text-black border-gray-300 rounded focus:ring-black"
                />
                <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                  I have read and agree to the website
                  <a href="/terms-and-conditions" className="underline hover:text-black">terms and conditions</a>
                </label>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className={`w-full mt-6 py-4 px-8 rounded-lg font-medium text-lg transition-colors duration-200 ${
                  submitting
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {submitting ? 'Processing...' : 'Place order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup Modal */}
      {showSuccessPopup && orderSuccessData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
              Order Placed Successfully!
            </h2>
            
            {/* Message */}
            <p className="text-gray-600 mb-2">
              Thank you for your purchase.
            </p>
            <p className="text-gray-600 mb-6">
              A confirmation email has been sent to:
              <br />
              <span className="font-semibold text-black">{orderSuccessData.email}</span>
            </p>

            {/* Email Icon */}
            <div className="flex items-center justify-center space-x-2 text-green-600 mb-6">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Check your email inbox</span>
            </div>

            {/* Order ID */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-mono font-bold text-gray-900">
                #{orderSuccessData.order._id?.slice(-8).toUpperCase() || 'N/A'}
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  navigate('/order-confirmation', {
                    state: orderSuccessData
                  });
                }}
                className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                View Order Details
              </button>
              <button
                onClick={() => navigate('/products')}
                className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
