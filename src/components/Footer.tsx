import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSiteConfig } from '../hooks/useSiteConfig';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [footerConfig, setFooterConfig] = useState(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState('');

  // Fetch the 'all' config which contains footer data
  const { data: siteConfig, loading: configLoading, error: configError } = useSiteConfig('all');

  // Also try to fetch data directly from API as fallback
  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        console.log('[Footer] Attempting direct API fetch...');
        const response = await fetch('http://localhost:5001/api/siteconfig/all');
        console.log('[Footer] API response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('[Footer] API response data:', data);

          if (data.success && data.data) {
            setFooterConfig(data.data);
            console.log('[Footer] Direct API fetch successful - footer data set');
          } else {
            console.log('[Footer] API response not successful:', data);
          }
        } else {
          console.log('[Footer] API response not ok:', response.status, response.statusText);
        }
      } catch (error) {
        console.log('[Footer] Direct API fetch failed:', error);
      }
    };

    // Always try direct fetch as backup
    fetchFooterData();
  }, []);

  // Use data from either hook or direct fetch
  const activeConfig = siteConfig?.config || footerConfig || {};

  // Debug logging
  console.log('[Footer] Debug Info:', {
    siteConfig,
    footerConfig,
    activeConfig,
    loading: configLoading,
    error: configError,
    hasConfig: !!activeConfig,
    hasFooter: !!activeConfig?.footer,

  });

  // Use default values if data is not loaded yet
  const configData = activeConfig;
  const footerData = configData.footer || {
    copyright: '© 2024 TechCart. All Rights Reserved.',
    getDirectionText: 'Get Direction',
    getDirectionLink: '#',
    newsletter: {
      title: 'Join Our Newsletter',
      description: 'Get exclusive deals and updates straight to your inbox.',
      placeholder: 'Enter your email',
      buttonText: 'Subscribe'
    },
    socialMedia: {
      facebook: { url: '#', enabled: true },
      twitter: { url: '#', enabled: true },
      instagram: { url: '#', enabled: true },
      tiktok: { url: '#', enabled: true },
      pinterest: { url: '#', enabled: true }
    },
    sections: [
      {
        title: 'Company',
        links: [
          { name: 'About Us', link: '/about' },
          { name: 'Shop', link: '/shop' },
          { name: 'Contact Us', link: '/contact' }
        ]
      },
      {
        title: 'Support',
        links: [
          { name: 'FAQ', link: '/faq' },
          { name: 'My Account', link: '/account' },
          { name: 'Policies', link: '/policies' }
        ]
      }
    ]
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email || isSubscribing) return;
    
    setIsSubscribing(true);
    setSubscribeSuccess(false);
    setSubscribeMessage('');
    
    // Simulate API call with a small delay to feel realistic
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Show success message
    setIsSubscribing(false);
    setSubscribeSuccess(true);
    setSubscribeMessage('Thank you for subscribing! Check your inbox for exclusive deals.');
    setEmail('');
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setSubscribeSuccess(false);
      setSubscribeMessage('');
    }, 5000);
  };

  // Show loading state
  if (configLoading) {
    return (
      <footer className="bg-white border-t border-gray-100 py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
        <div className="max-w-[1600px] mx-auto text-center">
          <p className="text-black">Loading footer data...</p>
        </div>
      </footer>
    );
  }

  // Show error state
  if (configError && !activeConfig.footer) {
    return (
      <footer className="bg-white border-t border-gray-100 py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
        <div className="max-w-[1600px] mx-auto text-center">
          <p className="text-black">Error loading footer data: {configError}</p>
          <p className="text-sm text-gray-500 mt-2">Using fallback data</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-white border-t border-gray-100 py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      <div className="max-w-[1600px] mx-auto">
        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-8 lg:gap-8 xl:gap-12 mb-6 sm:mb-8 md:mb-10">
          {/* First Column - Logo and Social Media */}
          <div className="flex flex-col sm:col-span-1 lg:col-span-1">
            {/* Logo */}
            <div className="mb-4 sm:mb-5 md:mb-6">
              <img
                src={configData.branding?.logo?.url || '/images/placeholder.svg'}
                alt={configData.branding?.logo?.alt || 'Logo'}
                className="h-4 sm:h-5 md:h-6 lg:h-6 xl:h-7 w-auto"
              />
            </div>
            


            {/* Get Direction Link */}
            <a
              href={footerData.getDirectionLink || '#'}
              className="text-xs sm:text-sm md:text-base lg:text-base text-black underline hover:no-underline mb-4 sm:mb-5 md:mb-6 inline-block transition-colors hover:text-gray-700"
            >
              {footerData.getDirectionText || 'Get Directions'}
            </a>
            
            {/* Social Media Icons */}
            <div className="flex gap-2 sm:gap-3 md:gap-4 flex-wrap">
              {/* Facebook */}
              {footerData.socialMedia?.facebook?.enabled !== false && (
                <a
                  href={footerData.socialMedia?.facebook?.url || '#'}
                  aria-label="Facebook"
                  className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}

              {/* Twitter */}
              {footerData.socialMedia?.twitter?.enabled !== false && (
                <a
                  href={footerData.socialMedia?.twitter?.url || '#'}
                  aria-label="Twitter"
                  className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              )}

              {/* Instagram */}
              {footerData.socialMedia?.instagram?.enabled !== false && (
                <a
                  href={footerData.socialMedia?.instagram?.url || '#'}
                  aria-label="Instagram"
                  className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.473-3.34-1.257-.609-.536-.99-1.207-1.138-2.034-.148-.827-.05-1.663.314-2.4.364-.737.94-1.321 1.677-1.685.737-.364 1.573-.462 2.4-.314.827.148 1.498.529 2.034 1.138.784.892 1.257 2.043 1.257 3.34 0 2.517-2.043 4.56-4.56 4.56l.356-.388zm7.584-7.653c-.148.827-.529 1.498-1.138 2.034-.892.784-2.043 1.257-3.34 1.257-2.517 0-4.56-2.043-4.56-4.56 0-1.297.473-2.448 1.257-3.34.536-.609 1.207-.99 2.034-1.138.827-.148 1.663-.05 2.4.314.737.364 1.321.948 1.685 1.677.364.737.462 1.573.314 2.4l-.652-.644z"/>
                  </svg>
                </a>
              )}

              {/* TikTok */}
              {footerData.socialMedia?.tiktok?.enabled !== false && (
                <a
                  href={footerData.socialMedia?.tiktok?.url || '#'}
                  aria-label="TikTok"
                  className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              )}

              {/* Pinterest */}
              {footerData.socialMedia?.pinterest?.enabled !== false && (
                <a
                  href={footerData.socialMedia?.pinterest?.url || '#'}
                  aria-label="Pinterest"
                  className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.342-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.747 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
          
          {/* Dynamic Footer Sections */}
          {footerData.sections?.map((section, index) => (
            <div key={index} className="flex flex-col">
              <h3 className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl font-semibold text-black mb-2 sm:mb-3 md:mb-4">
                {section.title}
              </h3>
              <div className="flex flex-col gap-1.5 sm:gap-2">
                {section.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    to={link.link}
                    className="text-xs sm:text-sm md:text-base lg:text-base text-black hover:text-gray-700 hover:underline transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Newsletter Section */}
          <div className="flex flex-col sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl font-semibold text-black mb-2 sm:mb-3 md:mb-4">
              {footerData.newsletter?.title || 'Newsletter'}
            </h3>
            <p className="text-xs sm:text-sm md:text-base lg:text-base text-black mb-3 sm:mb-4 leading-relaxed">
              {footerData.newsletter?.description || 'Subscribe to our newsletter for updates and exclusive offers.'}
            </p>
            
            {/* Newsletter Form */}
            <form onSubmit={handleSubscribe} className="relative mb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={footerData.newsletter?.placeholder || 'Enter your email'}
                className="w-full px-3 sm:px-4 md:px-4 py-2 sm:py-3 md:py-3 pr-24 sm:pr-28 md:pr-32 text-xs sm:text-sm md:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={isSubscribing}
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="absolute right-1 top-1 bottom-1 bg-black text-white px-3 sm:px-4 md:px-6 text-xs sm:text-sm md:text-sm font-medium rounded-full hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px] sm:min-w-[90px] md:min-w-[100px]"
              >
                {isSubscribing ? (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  footerData.newsletter?.buttonText || 'Subscribe'
                )}
              </button>
            </form>
            
            {/* Success/Error Message */}
            {subscribeMessage && (
              <div className={`text-xs sm:text-sm mb-4 sm:mb-5 md:mb-6 flex items-center gap-2 ${subscribeSuccess ? 'text-green-600' : 'text-red-600'}`}>
                {subscribeSuccess && (
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{subscribeMessage}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Divider */}
        <div className="w-full h-px bg-gray-200 my-3 sm:my-4 md:my-5"></div>
        
        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 md:gap-6">
          {/* Copyright and Policy Links */}
          <div className="text-center sm:text-left">
            <p className="text-xs sm:text-sm md:text-base lg:text-base text-gray-600">
              {footerData.copyright || '© 2024 All rights reserved.'}
            </p>
            {/* Policy Links */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-2">
              <Link
                to="/policies#refund"
                className="text-xs sm:text-sm text-gray-500 hover:text-black hover:underline transition-colors"
              >
                Refund Policy
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/policies#terms"
                className="text-xs sm:text-sm text-gray-500 hover:text-black hover:underline transition-colors"
              >
                Terms & Conditions
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/policies#privacy"
                className="text-xs sm:text-sm text-gray-500 hover:text-black hover:underline transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
