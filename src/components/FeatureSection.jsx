import React, { useEffect, useState } from "react";

export default function FeatureSection() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    // Load site configuration
    fetch('/src/data/siteConfig.json')
      .then(response => response.json())
      .then(data => setConfig(data))
      .catch(error => console.error('Error loading site config:', error));
  }, []);

  if (!config) return <div>Loading...</div>;

  const { featuresSection } = config.homePage;

  return (
    <section className="pt-8 pb-20 bg-white">
      <div className="max-w-[1800px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {featuresSection.features.slice(0, 3).map((feature, idx) => (
            <div
              key={idx}
              className="flex-1 relative rounded-sm overflow-hidden shadow-xl flex items-end min-h-[500px] sm:min-h-[550px] lg:min-h-[600px] bg-center bg-cover group cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
              style={{
                backgroundImage: `url(${feature.image || '/images/IMAGE_11.png'})`,
                fontFamily: "'Albert Sans', sans-serif",
              }}
            >
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Content */}
              <div className="relative z-10 p-8 sm:p-10 lg:p-12 w-full flex flex-col items-start">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-2 leading-tight drop-shadow-lg">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base lg:text-lg text-white/90 mb-6 sm:mb-8 drop-shadow">
                  {feature.description}
                </p>
                
                {/* Shop Now Button */}
                <button className="group inline-flex items-center bg-white hover:bg-gray-50 text-black px-6 sm:px-7 py-3 sm:py-4 rounded-sm text-sm sm:text-base lg:text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  Shop now
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="ml-2 transition-transform group-hover:translate-x-1"
                  >
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
