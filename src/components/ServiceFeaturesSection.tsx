import React, { useState, useEffect } from "react";
import { getSiteConfig } from '../services/dataService';
import type { SiteConfig, FeaturesSection, FeatureItem } from '../types';

interface IconMap {
  [key: string]: React.ReactElement;
}

const ServiceFeaturesSection: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  useEffect(() => {
    const loadSiteConfig = async () => {
      try {
        const siteConfig = await getSiteConfig();
        setConfig(siteConfig);
      } catch (error) {
        console.error('Error loading site config:', error);
      }
    };
    
    loadSiteConfig();
  }, []);

  if (!config) return <div>Loading...</div>;

  // Add fallback data if featuresSection doesn't exist
  const featuresSection: FeaturesSection = config.homePage?.featuresSection || {
    // Removed heading/subtitle content for cleaner UI
    title: "",
    subtitle: "",
    features: [
      {
        icon: "truck",
        title: "Free Shipping",
        description: "Free shipping on all orders over $50"
      },
      {
        icon: "headphones",
        title: "24/7 Support",
        description: "Get help anytime with our customer service"
      },
      {
        icon: "refresh",
        title: "Easy Returns",
        description: "30-day return policy for all products"
      },
      {
        icon: "shield",
        title: "Secure Payment",
        description: "Your payment information is secure with us"
      }
    ]
  };
  
  const features: FeatureItem[] = featuresSection.features || [];

  // Icon mapping - replace with your preferred icons
  const iconMap: IconMap = {
    truck: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313L16.875 4.5H15.75L14.25 2.25 12 1.5l-2.25.75L8.25 4.5H7.125L5.25 6.188 3 7.5v9a2.25 2.25 0 0 0 2.25 2.25h13.5A2.25 2.25 0 0 0 21 16.5v-9zM9 15.75l-3-3m0 0l3-3m-3 3h12" />
      </svg>
    ),
    headphones: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    refresh: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    shield: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    )
  };

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header removed intentionally */}

        {/* Mobile Carousel View */}
        <div className="block sm:hidden">
          {/* Current Feature Card */}
          <div className="flex flex-col items-center text-center px-8 py-8">
            {/* Icon */}
            <div className="bg-gray-100 rounded-full flex items-center justify-center w-20 h-20 mb-6">
              <div className="text-black">
                {iconMap[features[currentSlide]?.icon] || <div className="w-10 h-10 bg-gray-400 rounded" />}
              </div>
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-semibold text-black mb-3 leading-tight" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
              {features[currentSlide]?.title || 'Feature'}
            </h3>
            
            {/* Description */}
            <p className="text-base text-black leading-relaxed" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
              {features[currentSlide]?.description || 'Feature description'}
            </p>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentSlide ? 'bg-black' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="bg-gray-100 rounded-full flex items-center justify-center w-16 h-16 mb-4">
                <div className="text-black">
                  {iconMap[feature.icon] || <div className="w-8 h-8 bg-gray-400 rounded" />}
                </div>
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-black mb-2" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceFeaturesSection;
