import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import siteConfig from '../data/siteConfig.json';

const Footer = () => {
  const [email, setEmail] = useState('');
  
  const { branding, company, footer } = siteConfig;

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribing email:', email);
    setEmail('');
  };

  return (
    <footer className="bg-white border-t border-gray-100 py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      <div className="max-w-[1600px] mx-auto">
        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-8 lg:gap-8 xl:gap-12 mb-6 sm:mb-8 md:mb-10">
          {/* First Column - Company Info */}
          <div className="flex flex-col sm:col-span-1 lg:col-span-1">
            {/* Logo */}
            <div className="mb-4 sm:mb-5 md:mb-6">
              <img 
                src={branding.logo.light} 
                alt={branding.logo.alt} 
                className="h-4 sm:h-5 md:h-6 lg:h-6 xl:h-7 w-auto border-2 border-red-400 rounded"
              />
            </div>
            
            {/* Address */}
            <div className="mb-3 sm:mb-4 md:mb-4 text-xs sm:text-sm md:text-base lg:text-base text-red-500 leading-relaxed">
              <p className="mb-1">Address: {company.address.street},</p>
              <p className="mb-1">{company.address.city}, {company.address.state} {company.address.zip}</p>
              <p className="mb-1">Email: {company.contact.email}</p>
              <p className="mb-3 sm:mb-4">Phone: {company.contact.phone}</p>
            </div>
            
            {/* Get Direction Link */}
            <a 
              href={footer.getDirectionLink} 
              className="text-xs sm:text-sm md:text-base lg:text-base text-red-500 underline hover:no-underline mb-4 sm:mb-5 md:mb-6 inline-block transition-colors hover:text-red-700"
            >
              {footer.getDirectionText}
            </a>
            
            {/* Social Media Icons */}
            <div className="flex gap-2 sm:gap-3 md:gap-4 flex-wrap">
              {/* Facebook */}
              <a 
                href="#" 
                aria-label="Facebook"
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              
              {/* Twitter */}
              <a 
                href="#" 
                aria-label="Twitter"
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              
              {/* Instagram */}
              <a 
                href="#" 
                aria-label="Instagram"
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.473-3.34-1.257-.609-.536-.99-1.207-1.138-2.034-.148-.827-.05-1.663.314-2.4.364-.737.94-1.321 1.677-1.685.737-.364 1.573-.462 2.4-.314.827.148 1.498.529 2.034 1.138.784.892 1.257 2.043 1.257 3.34 0 2.517-2.043 4.56-4.56 4.56l.356-.388zm7.584-7.653c-.148.827-.529 1.498-1.138 2.034-.892.784-2.043 1.257-3.34 1.257-2.517 0-4.56-2.043-4.56-4.56 0-1.297.473-2.448 1.257-3.34.536-.609 1.207-.99 2.034-1.138.827-.148 1.663-.05 2.4.314.737.364 1.321.948 1.685 1.677.364.737.462 1.573.314 2.4l-.652-.644z"/>
                </svg>
              </a>
              
              {/* TikTok */}
              <a 
                href="#" 
                aria-label="TikTok"
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
              
              {/* Pinterest */}
              <a 
                href="#" 
                aria-label="Pinterest"
                className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.342-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.747 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Dynamic Footer Sections */}
          {footer.sections.map((section, index) => (
            <div key={index} className="flex flex-col">
              <h3 className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl font-semibold text-red-500 mb-2 sm:mb-3 md:mb-4">
                {section.title}
              </h3>
              <div className="flex flex-col gap-1.5 sm:gap-2">
                {section.links.map((link, linkIndex) => (
                  <Link 
                    key={linkIndex}
                    to={link.link} 
                    className="text-xs sm:text-sm md:text-base lg:text-base text-red-500 hover:text-red-700 hover:underline transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Newsletter Section */}
          <div className="flex flex-col sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm sm:text-base md:text-lg lg:text-lg xl:text-xl font-semibold text-red-500 mb-2 sm:mb-3 md:mb-4">
              {footer.newsletter.title}
            </h3>
            <p className="text-xs sm:text-sm md:text-base lg:text-base text-red-500 mb-3 sm:mb-4 leading-relaxed">
              {footer.newsletter.description}
            </p>
            
            {/* Newsletter Form */}
            <form onSubmit={handleSubscribe} className="relative mb-4 sm:mb-5 md:mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={footer.newsletter.placeholder}
                className="w-full px-3 sm:px-4 md:px-4 py-2 sm:py-3 md:py-3 pr-24 sm:pr-28 md:pr-32 text-xs sm:text-sm md:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                required
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 bg-black text-white px-3 sm:px-4 md:px-6 text-xs sm:text-sm md:text-sm font-medium rounded-full hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                {footer.newsletter.buttonText}
              </button>
            </form>
          </div>
        </div>
        
        {/* Divider */}
        <div className="w-full h-px bg-gray-200 my-3 sm:my-4 md:my-5"></div>
        
        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 md:gap-6">
          {/* Copyright */}
          <p className="text-xs sm:text-sm md:text-base lg:text-base text-gray-600 text-center sm:text-left">
            {footer.copyright}
          </p>
          
          {/* Payment Methods */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap justify-center sm:justify-end">
            {/* Visa */}
            <div className="w-8 h-5 sm:w-10 sm:h-6 md:w-12 md:h-8 lg:w-12 lg:h-8 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
              <svg className="w-6 h-4 sm:w-8 sm:h-5 md:w-10 md:h-6" viewBox="0 0 48 32" fill="none">
                <rect width="48" height="32" rx="6" fill="#1A1F71"/>
                <path d="M18.5 11.5h-3l-1.5 9h3l1.5-9zM25 11.5l-2 6.5-1-6.5h-3.5l2.5 9h3l4.5-9H25zM32 14.5c0-1-1-1.5-2-1.5s-1.5.5-1.5 1c0 1 2 1 2 2s-1 1-2 1-1.5-.5-1.5-1h-2.5c0 2 2 2.5 4 2.5s4-1 4-2.5-2-1.5-2-2 1-.5 2-.5s1 .5 1 1H32z" fill="white"/>
              </svg>
            </div>
            
            {/* PayPal */}
            <div className="w-8 h-5 sm:w-10 sm:h-6 md:w-12 md:h-8 lg:w-12 lg:h-8 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
              <svg className="w-6 h-4 sm:w-8 sm:h-5 md:w-10 md:h-6" viewBox="0 0 48 32" fill="none">
                <rect width="48" height="32" rx="6" fill="#003087"/>
                <path d="M16 11h4c2 0 3 1 3 3s-1 3-3 3h-2l-1 3h-2l1-9zM18 15h2c1 0 1-.5 1-1s0-1-1-1h-2l0 2zM26 11h4c2 0 3 1 3 3s-1 3-3 3h-2l-1 3h-2l1-9zM28 15h2c1 0 1-.5 1-1s0-1-1-1h-2l0 2z" fill="#009CDE"/>
              </svg>
            </div>
            
            {/* Mastercard */}
            <div className="w-8 h-5 sm:w-10 sm:h-6 md:w-12 md:h-8 lg:w-12 lg:h-8 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
              <svg className="w-6 h-4 sm:w-8 sm:h-5 md:w-10 md:h-6" viewBox="0 0 48 32" fill="none">
                <rect width="48" height="32" rx="6" fill="white"/>
                <circle cx="19" cy="16" r="7" fill="#EB001B"/>
                <circle cx="29" cy="16" r="7" fill="#F79E1B"/>
              </svg>
            </div>
            
            {/* American Express */}
            <div className="w-8 h-5 sm:w-10 sm:h-6 md:w-12 md:h-8 lg:w-12 lg:h-8 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
              <svg className="w-6 h-4 sm:w-8 sm:h-5 md:w-10 md:h-6" viewBox="0 0 48 32" fill="none">
                <rect width="48" height="32" rx="6" fill="#006FCF"/>
                <path d="M15 12h6v2h-6v-2zM15 16h6v2h-6v-2zM27 12h6v8h-6v-8z" fill="white"/>
              </svg>
            </div>
            
            {/* Discover */}
            <div className="w-8 h-5 sm:w-10 sm:h-6 md:w-12 md:h-8 lg:w-12 lg:h-8 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors duration-200">
              <svg className="w-6 h-4 sm:w-8 sm:h-5 md:w-10 md:h-6" viewBox="0 0 48 32" fill="none">
                <rect width="48" height="32" rx="6" fill="#FF6000"/>
                <path d="M12 14h8v4h-8v-4z" fill="white"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
