import React, { useState } from "react";
import { Link } from "react-router-dom";
import siteConfig from '../data/siteConfig.json';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  
  const { branding, navigation } = siteConfig;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleAccordion = (section) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  return (
    <>
      <nav className="w-full h-[74px] md:h-[74px] sm:h-[40px] h-[32px] bg-white flex items-center justify-between px-2 sm:px-3 md:px-6 relative z-50" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
        {/* Mobile Menu Button - Only visible on small screens */}
        <button 
          className="lg:hidden p-1 sm:p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
          onClick={toggleSidebar}
          aria-label="Open menu"
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
          <img 
            src={branding.logo.light} 
            alt={branding.logo.alt} 
            className="h-4 sm:h-5 md:h-6 w-auto border-2 border-red-400 rounded"
          />
        </div>

        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
          {navigation.mainMenu.map((item, index) => (
            <Link 
              key={index}
              to={item.link} 
              className="text-red-500 hover:text-red-700 font-medium transition-colors"
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

          {/* Account Icon - Hidden on mobile */}
          <button 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 hidden lg:block" 
            aria-label="Account"
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

          {/* Compare Icon - Hidden on mobile and tablet */}
          <button 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 hidden lg:block" 
            aria-label="Compare"
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
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
              <path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
              <path d="M12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
              <path d="M12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
            </svg>
          </button>

          {/* Heart Icon - Hidden on mobile */}
          <button 
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
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              2
            </span>
          </button>

          {/* Bag Icon */}
          <button 
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
            <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-xs rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center font-bold text-[9px] sm:text-[10px]">
              0
            </span>
          </button>
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
      <div className={`fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`} style={{ fontFamily: "'Albert Sans', sans-serif" }}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <img 
            src={branding.logo.dark} 
            alt={branding.logo.alt} 
            className="h-6 w-auto border-2 border-red-400 rounded"
          />
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close menu"
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
                className="w-full flex items-center justify-between py-3 text-left font-medium text-gray-900 hover:text-red-500 transition-colors"
              >
                <span className="text-red-500">Home</span>
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
                className="w-full flex items-center justify-between py-3 text-left font-medium text-gray-900 hover:text-red-500 transition-colors"
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
                className="block py-3 text-left font-medium text-gray-900 hover:text-red-500 transition-colors"
              >
                About
              </a>
            </div>

            {/* Contact */}
            <div className="mb-6">
              <Link 
                to="/contact" 
                className="block py-3 text-left font-medium text-gray-900 hover:text-red-500 transition-colors"
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
          {/* Login Button */}
          <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors mb-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="font-medium">Login</span>
          </button>

          {/* Language and Currency */}
          <div className="flex gap-4">
            <select className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="USD">🇺🇸 USD</option>
              <option value="EUR">🇪🇺 EUR</option>
              <option value="GBP">🇬🇧 GBP</option>
            </select>
            <select className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="English">English</option>
              <option value="Spanish">Español</option>
              <option value="French">Français</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
};
        <button 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200" 
          aria-label="Account"
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

        {/* Compare Icon */}
        <button 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 hidden sm:block" 
          aria-label="Compare"
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
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
            <path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
            <path d="M12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
            <path d="M12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z"/>
          </svg>
        </button>

        {/* Heart Icon */}
        <button 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 relative" 
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
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            2
          </span>
        </button>

        {/* Bag Icon */}
        <button 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 relative" 
          aria-label="Shopping Cart"
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
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {/* Cart count badge */}
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            3
          </span>
        </button>
export default Navbar;
