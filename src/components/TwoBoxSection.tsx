import React, { useState, useEffect } from 'react';
import { SiteConfig, Collection } from '../types';

const TwoBoxSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    // Load site configuration
    fetch('/src/data/siteConfig.json')
      .then(response => response.json())
      .then((data: SiteConfig) => setConfig(data))
      .catch(error => console.error('Error loading site config:', error));
  }, []);

  if (!config) return <div>Loading...</div>;

  const { featuredCollections } = config.homePage;

  const handleDotClick = (index: number): void => {
    setCurrentSlide(index);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="mb-12">
          <h2 
            className="hidden sm:block text-xl sm:text-2xl lg:text-3xl font-medium text-black ml-[12.5%] sm:ml-[10%] lg:ml-[8.33%] mb-6"
            style={{ fontFamily: "'Albert Sans', sans-serif" }}
          >
            {featuredCollections.title}
          </h2>
          {/* Divider below section title */}
          <div className="w-3/4 sm:w-4/5 lg:w-5/6 h-[2px] bg-gray-300 rounded-full mx-auto transition-colors" />
        </div>

        {/* Mobile Carousel View */}
        <div className="block sm:hidden px-4">
          {/* Current Collection Card */}
          <div className="relative overflow-hidden bg-gray-100 rounded-lg aspect-[5/4] transition-transform duration-300 hover:scale-[1.02]">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
              style={{
                backgroundImage: `url(${featuredCollections.collections[currentSlide].image})`,
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
              }}
            />
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t ${featuredCollections.collections[currentSlide].gradient}`} />
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              <div className="text-white">
                {/* Title */}
                <h3 
                  className="text-2xl font-medium mb-2 leading-tight text-white"
                  style={{ fontFamily: "'Albert Sans', sans-serif" }}
                >
                  {featuredCollections.collections[currentSlide].title}
                </h3>
                
                {/* Subtitle */}
                <p 
                  className="text-sm font-light mb-4 opacity-90 text-white"
                  style={{ fontFamily: "'Albert Sans', sans-serif" }}
                >
                  {featuredCollections.collections[currentSlide].subtitle}
                </p>
                
                {/* Button */}
                <button className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-gray-100 group/btn rounded">
                  <span style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                    {featuredCollections.collections[currentSlide].buttonText}
                  </span>
                  <svg 
                    className="w-3 h-3 transition-transform group-hover/btn:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            {featuredCollections.collections.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentSlide ? 'bg-black' : 'bg-gray-300'
                }`}
                aria-label={`Go to collection ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Two Large Boxes Container - Matches divider width */}
        <div className="hidden sm:block w-3/4 sm:w-4/5 lg:w-5/6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredCollections.collections.map((collection) => (
              <div
                key={collection.id}
                className="group relative overflow-hidden bg-gray-100 aspect-[5/4] transition-transform duration-300 hover:scale-[1.02]"
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${collection.image})`,
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${collection.gradient}`} />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
                  <div className="text-white">
                    {/* Subtitle */}
                    <p 
                      className="text-sm sm:text-base font-light mb-2 opacity-90 text-white"
                      style={{ fontFamily: "'Albert Sans', sans-serif" }}
                    >
                      {collection.subtitle}
                    </p>
                    
                    {/* Title */}
                    <h3 
                      className="text-2xl sm:text-3xl lg:text-4xl font-medium mb-4 leading-tight text-white"
                      style={{ fontFamily: "'Albert Sans', sans-serif" }}
                    >
                      {collection.title}
                    </h3>
                    
                    {/* Description */}
                    <p 
                      className="text-sm sm:text-base font-light mb-6 opacity-90 max-w-md text-white"
                      style={{ fontFamily: "'Albert Sans', sans-serif" }}
                    >
                      {collection.description}
                    </p>
                    
                    {/* Button */}
                    <button className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 text-sm font-medium transition-all duration-300 hover:bg-gray-100 group/btn">
                      <span style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                        {collection.buttonText}
                      </span>
                      <svg 
                        className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TwoBoxSection;
