import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useNavigation, useBranding } from '../hooks/useSiteConfig';
import authService from '../services/authService';
import wishlistService from '../services/wishlistService';
import cartService from '../services/cartService';
import LoginModal from './LoginModal.tsx';
import RegisterModal from './RegisterModal.tsx';
import SearchSidebar from './SearchSidebar';

const Navbar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  // Use real-time site configuration
  const { data: navigation, loading: navLoading, error: navError } = useNavigation();
  const { data: branding, loading: brandLoading, error: brandError } = useBranding();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  // Check authentication status and load user data
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const userData = authService.getCurrentUserFromStorage();
        setUser(userData);
        
        // Load wishlist and cart counts
        loadWishlistCount();
        loadCartCount();
      } else {
        // Reset counts and user on logout
        setUser(null);
        setWishlistCount(0);
        setCartCount(0);
      }
    };

    const loadWishlistCount = async () => {
      try {
        const response = await wishlistService.getWishlist();
        const count =
          (typeof response?.count === 'number' && response.count) ??
          (Array.isArray(response?.data) ? response.data.length : (Array.isArray(response) ? response.length : 0));
        setWishlistCount(count || 0);
      } catch (error) {
        console.error('Failed to load wishlist count:', error);
      }
    };

    const loadCartCount = async () => {
      try {
        const count = await cartService.getCartCount();
        setCartCount(count);
      } catch (error) {
        console.error('Failed to load cart count:', error);
      }
    };

    checkAuth();
    
    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen to a custom login event to update navbar immediately after login
    const handleAuthEvent = () => checkAuth();
    window.addEventListener('auth:changed', handleAuthEvent);
    // Listen for wishlist/cart changes to refresh counts
    const handleWishlistChanged = () => {
      if (authService.isAuthenticated()) {
        loadWishlistCount();
      }
    };
    const handleCartChanged = () => {
      if (authService.isAuthenticated()) {
        loadCartCount();
      }
    };
    window.addEventListener('wishlist:changed', handleWishlistChanged);
    window.addEventListener('cart:changed', handleCartChanged);
    // Listen for global requests to open auth modals
    const openLoginHandler = () => {
      setShowRegisterModal(false);
      setShowLoginModal(true);
    };
    const openRegisterHandler = () => {
      setShowLoginModal(false);
      setShowRegisterModal(true);
    };
    window.addEventListener('auth:openLogin', openLoginHandler);
    window.addEventListener('auth:openRegister', openRegisterHandler);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:changed', handleAuthEvent);
      window.removeEventListener('auth:openLogin', openLoginHandler);
      window.removeEventListener('auth:openRegister', openRegisterHandler);
      window.removeEventListener('wishlist:changed', handleWishlistChanged);
      window.removeEventListener('cart:changed', handleCartChanged);
    };
  }, []);

  // Accessibility: Close on Escape, trap focus inside when open, and lock body scroll
  useEffect(() => {
    if (isSidebarOpen) {
      // Save focus and lock scroll
      previousFocusRef.current = (document.activeElement as HTMLElement) ?? null;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Focus the close button or first focusable element
      const focusableSelectors = [
        'button', 'a[href]', 'input', 'select', 'textarea', '[tabindex]:not([tabindex="-1"])'
      ].join(',');
      const sidebar = sidebarRef.current;
      setTimeout(() => {
        (closeButtonRef.current || sidebar?.querySelector(focusableSelectors) as HTMLElement)?.focus();
      }, 0);

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsSidebarOpen(false);
          return;
        }
        if (e.key === 'Tab' && sidebar) {
          const focusables = Array.from(sidebar.querySelectorAll<HTMLElement>(focusableSelectors))
            .filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1 && el.offsetParent !== null);
          if (focusables.length === 0) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          const current = document.activeElement as HTMLElement | null;
          if (e.shiftKey) {
            if (current === first || !sidebar.contains(current)) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (current === last || !sidebar.contains(current)) {
              e.preventDefault();
              first.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.removeEventListener('keydown', onKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    } else {
      // Restore focus to toggle button
      previousFocusRef.current?.focus?.();
    }
  }, [isSidebarOpen]);

  // Show loading state if data is not ready
  if (navLoading || brandLoading) {
    return (
      <nav className="w-full h-[74px] md:h-[74px] sm:h-[40px] h-[32px] bg-white flex items-center justify-center px-2 sm:px-3 md:px-6 relative z-50">
        <div className="text-gray-500">Loading...</div>
      </nav>
    );
  }

  // Show error state if there's an error
  if (navError || brandError) {
    console.error('Navbar config error:', navError || brandError);
    return (
      <nav className="w-full h-[74px] md:h-[74px] sm:h-[40px] h-[32px] bg-white flex items-center justify-center px-2 sm:px-3 md:px-6 relative z-50">
        <div className="text-red-500">Error loading navigation</div>
      </nav>
    );
  }

  // Use fallback data if config is not available
  const navData = navigation || {
    mainMenu: [
      { name: "Home", link: "/" },
      { name: "Products", link: "/products" },
      { name: "About", link: "/about" },
      { name: "Contact", link: "/contact" }
    ]
  };

  const brandData = branding || {
    logo: {
      url: "/images/placeholder.svg",
      alt: "Logo"
    }
  };

  return (
    <>
  <nav className="w-full h-[74px] md:h-[74px] sm:h-[40px] h-[32px] bg-white flex items-center justify-between px-2 sm:px-3 md:px-6 z-50" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
        {/* Mobile Menu Button - Only visible on small screens */}
        <button 
          className="lg:hidden p-1 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
          onClick={toggleSidebar}
          ref={toggleButtonRef}
          aria-label="Open menu"
          aria-expanded={isSidebarOpen}
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-gray-700 sm:w-5 sm:h-5"
          >
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Logo - Centered on mobile, left on desktop */}
        <div className="flex items-center lg:justify-start justify-center flex-1 lg:flex-none">
          <Link to="/">
            <img
              src={brandData.logo.url}
              alt={brandData.logo.alt}
              className="h-4 sm:h-5 md:h-6 w-auto"
            />
          </Link>
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
          {navData.mainMenu.map((item, index) => (
            <Link 
              key={index}
              to={item.link} 
              className="text-black hover:text-gray-700 font-medium transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>
      
        {/* Right Icons */}
        <div className="flex items-center gap-x-1 sm:gap-x-2 md:gap-x-3">
          {/* Search Icon */}
          <button 
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors duration-200" 
            aria-label="Search"
            onClick={() => setIsSearchOpen(true)}
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-700 hover:text-gray-900 sm:w-5 sm:h-5"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>

          {/* Account Icon / Logout - Hidden on mobile */}
          {isAuthenticated ? (
            <div className="hidden lg:flex items-center gap-2">
              <Link 
                to="/account"
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200" 
                aria-label="Account"
                title={user?.name || 'My Account'}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-gray-700 hover:text-gray-900"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                onClick={() => authService.logout()}
                aria-label="Logout"
                title="Logout"
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-gray-700 hover:text-gray-900"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          ) : (
            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 hidden lg:block" 
              aria-label="Account"
              onClick={() => setShowLoginModal(true)}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-gray-700 hover:text-gray-900"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          )}

          {/* Removed Compare icon button as it had no purpose */}

          {/* Heart Icon - Hidden on mobile */}
          {isAuthenticated ? (
            <Link 
              to="/wishlist"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 relative hidden lg:block" 
              aria-label="Wishlist"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-gray-700 hover:text-gray-900"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {/* Wishlist count badge */}
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>
          ) : (
            <button 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 relative hidden lg:block" 
              aria-label="Wishlist"
              onClick={() => setShowLoginModal(true)}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-gray-700 hover:text-gray-900"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          )}

          {/* Bag Icon */}
          {isAuthenticated ? (
            <Link 
              to="/cart"
              className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200 relative" 
              aria-label="Shopping Cart"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-gray-700 hover:text-gray-900 sm:w-[18px] sm:h-[18px]"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {/* Cart count badge */}
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-xs rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center font-bold text-[9px] sm:text-[10px]">
                  {cartCount}
                </span>
              )}
            </Link>
          ) : (
            <button 
              className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200 relative" 
              aria-label="Shopping Cart"
              onClick={() => setShowLoginModal(true)}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-gray-700 hover:text-gray-900 sm:w-[18px] sm:h-[18px]"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <div ref={sidebarRef} role="dialog" aria-modal="true" aria-label="Mobile menu" className={`fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ fontFamily: "'Albert Sans', sans-serif" }}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <img
            src={brandData.logo.url}
            alt={brandData.logo.alt}
            className="h-6 w-auto"
          />
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close menu"
            ref={closeButtonRef}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-700"
            >
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation Menu */}
          <div className="p-4">
            {/* Home */}
            <div className="mb-4">
              <button 
                onClick={() => toggleAccordion('home')}
                className="w-full flex items-center justify-between py-3 text-left font-medium text-gray-900 hover:text-black transition-colors"
              >
                <span className="text-black">Home</span>
                <svg 
                  className={`w-5 h-5 transform transition-transform ${openAccordion === 'home' ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Products */}
            <div className="mb-4">
              <Link 
                to="/products"
                className="w-full flex items-center justify-between py-3 text-left font-medium text-gray-900 hover:text-black transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                <span>Products</span>
                <svg 
                  className="w-5 h-5"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* About */}
            <div className="mb-4">
              <a 
                href="#" 
                className="block py-3 text-left font-medium text-gray-900 hover:text-black transition-colors"
              >
                About
              </a>
            </div>

            {/* Contact */}
            <div className="mb-6">
              <Link 
                to="/contact" 
                className="block py-3 text-left font-medium text-gray-900 hover:text-black transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                Contact
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4 mb-6">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span className="text-sm font-medium">Wishlist</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <span className="text-sm font-medium">Search</span>
              </button>
            </div>

            {/* Contact Info Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need help ?</h3>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-900">Address:</p>
                  <p>1234 Fashion Street, Suite 567,</p>
                  <p>New York, NY 10001</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">Email:</p>
                  <a href="mailto:info@fashionshop.com" className="text-blue-600 hover:text-blue-800">
                    info@fashionshop.com
                  </a>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">Phone:</p>
                  <a href="tel:(212)555-1234" className="text-blue-600 hover:text-blue-800">
                    (212) 555-1234
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 p-4">
          {/* Login/Account Button */}
          {isAuthenticated ? (
            <div className="flex flex-col gap-3 mb-4">
              <Link 
                to="/account"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span className="font-medium">My Account</span>
              </Link>
              <button 
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                onClick={() => { authService.logout(); setIsSidebarOpen(false); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <button 
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors mb-4"
              onClick={() => {
                setShowLoginModal(true);
                setIsSidebarOpen(false);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="font-medium">Login</span>
            </button>
          )}

          {/* Language and Currency */}
          <div className="flex gap-4">
            <select className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black">
              <option value="USD">🇺🇸 USD</option>
              <option value="EUR">🇪🇺 EUR</option>
              <option value="GBP">🇬🇧 GBP</option>
            </select>
            <select className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black">
              <option value="English">English</option>
              <option value="Spanish">Español</option>
              <option value="French">Français</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Sidebar */}
      <SearchSidebar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={(response) => {
          console.log('Login successful:', response);
          // The auth:changed event will automatically update the navbar
          setShowLoginModal(false);
        }}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={(response) => {
          console.log('Registration successful:', response);
          // The auth:changed event will automatically update the navbar
          setShowRegisterModal(false);
        }}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </>
  );
};

export default Navbar;
