import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
// CENTRALIZED DATA SERVICE - Single source for all product and config data
import { 
  getOnSaleProducts, 
  getSiteConfig,
  calculateDiscountPercentage 
} from '../services/dataService';

// Icons
const ArrowLeftIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// Close Icon
const CloseIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Active Deal Badge Component
const ActiveDealBadge = ({ product, onClose, dealId }) => {
  // CENTRALIZED CALCULATION - Use centralized discount calculation
  const discountPercent = calculateDiscountPercentage(product.originalPrice, product.price);
  
  return (
    <div className="absolute top-2 left-2 z-20 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-1">
      <span style={{ fontFamily: "'Albert Sans', sans-serif" }}>{discountPercent}% OFF</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose(dealId);
        }}
        className="ml-1 hover:bg-red-600 rounded-full p-0.5 transition-colors"
        aria-label="Close deal badge"
      >
        <CloseIcon className="w-3 h-3" />
      </button>
    </div>
  );
};

// Deal Card Component
const DealCard = ({ deal, onColorSelect, onCloseDeal }) => {
  return (
         <div className="relative transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg rounded-lg overflow-hidden flex-shrink-0" style={{ 
       width: '280px',
       height: '420px',
       backgroundColor: '#f8f8f8' 
     }}>
      {/* Active Deal Badge */}
      {deal.originalPrice && deal.originalPrice > deal.price && (
        <ActiveDealBadge 
          product={deal}
          onClose={onCloseDeal}
          dealId={deal.id}
        />
      )}
      
             {/* Product Image */}
       <div className="w-full flex items-center justify-center bg-gray-50 overflow-hidden relative" style={{ 
         height: '280px'
       }}>
                 <img
           src={deal.images?.[0] || deal.image}
           alt={deal.name}
           className="w-full h-full object-cover"
           style={{ 
             fontFamily: "'Albert Sans', sans-serif"
           }}
          onError={(e) => {
            console.log('Image failed to load:', deal.images?.[0] || deal.image);
            e.target.style.display = 'block';
            e.target.style.backgroundColor = '#f3f4f6';
            e.target.alt = 'Image not found';
          }}
          onLoad={(e) => {
            console.log('Image loaded successfully:', deal.images?.[0] || deal.image);
          }}
        />
      </div>
      
      {/* Content Section */}
      <div className="w-full text-center px-3" style={{ paddingTop: '10px', display: 'grid', gap: '8px' }}>
                 {/* Product Name */}
         <h3 
           className="text-black leading-tight flex items-center justify-center" 
           style={{ 
             fontSize: '16px', 
             fontFamily: "'Albert Sans', sans-serif", 
             fontWeight: 'normal',
             height: 'clamp(40px, 8vw, 50px)',
             minHeight: 'clamp(40px, 8vw, 50px)',
             maxHeight: 'clamp(40px, 8vw, 50px)',
             overflow: 'hidden',
             display: 'flex',
             alignItems: 'center',
             textAlign: 'center'
           }}
         >
           {deal.name}
         </h3>
         
         {/* Price */}
         <div>
           <span className="text-black" style={{ fontSize: '16px', fontFamily: "'Albert Sans', sans-serif", fontWeight: '600' }}>
             ${deal.price}
           </span>
           {deal.originalPrice && (
             <span className="text-gray-500 line-through ml-2" style={{ fontSize: '16px', fontFamily: "'Albert Sans', sans-serif", fontWeight: '600' }}>
               ${deal.originalPrice}
             </span>
           )}
         </div>
        
        {/* Color Swatches */}
        <div className="flex justify-center gap-2">
          {deal.colors && deal.colors.slice(0, 2).map((color, index) => (
            <button
              key={`${deal.id}-${color.name}-${index}`}
              onClick={() => onColorSelect(deal.id, index)}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                color.selected 
                  ? 'border-black shadow-md scale-110' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color.value }}
              aria-label={`Select ${color.name} color`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

 // Deals Carousel Component
 const DealsCarousel = ({ deals, currentIndex, onColorSelect, onCloseDeal, onPrevious, onNext, isTransitioning }) => {
   const getVisibleCards = () => {
     if (typeof window !== 'undefined') {
       const vw = window.innerWidth;
       if (vw >= 1280) return 4;
       if (vw >= 1024) return 3;
       if (vw >= 768) return 2;
       return 1;
     }
     return 4;
   };

   const visibleCards = getVisibleCards();
   const cardWidth = 280; // Fixed card width for consistent layout
   const GAP = 24; // Reduced gap for better spacing
   const containerWidth = (cardWidth * visibleCards) + (GAP * (visibleCards - 1));

   // Create infinite array
   const infiniteDeals = [...deals, ...deals, ...deals, ...deals, ...deals];

     return (
     <div className="relative flex justify-center items-start w-full">
       {/* Left Arrow */}
       <button
         onClick={onPrevious}
         disabled={isTransitioning}
         className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-black text-black hover:text-white transition-all duration-300 rounded-full shadow-lg w-12 h-12 flex items-center justify-center group disabled:opacity-50"
         aria-label="Previous deals"
       >
         <ArrowLeftIcon className="w-5 h-5" />
       </button>
       
       {/* Carousel Container */}
       <div className="overflow-hidden mx-auto" style={{ width: `${containerWidth}px` }}>
        <div 
          className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
          style={{
            transform: `translateX(-${currentIndex * (cardWidth + GAP)}px)`,
            fontFamily: "'Albert Sans', sans-serif"
          }}
        >
          {infiniteDeals.map((deal, index) => (
            <DealCard
              key={`infinite-${deal.id}-${index}`}
              deal={deal}
              onColorSelect={onColorSelect}
              onCloseDeal={onCloseDeal}
            />
          ))}
        </div>
      </div>
      
             {/* Right Arrow */}
       <button
         onClick={onNext}
         disabled={isTransitioning}
         className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-black text-black hover:text-white transition-all duration-300 rounded-full shadow-lg w-12 h-12 flex items-center justify-center group disabled:opacity-50"
         aria-label="Next deals"
       >
         <ArrowRightIcon className="w-5 h-5" />
       </button>
    </div>
  );
};

function HotDealsSection() {
  const [config, setConfig] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef(null);

  useEffect(() => {
    // CENTRALIZED DATA LOADING - Load all data from single service
    const loadData = async () => {
      try {
        const [siteData, dealsProducts] = await Promise.all([
          getSiteConfig(),
          getOnSaleProducts()
        ]);
        
        setConfig(siteData);
        setProducts(dealsProducts);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleNext = () => {
    if (isTransitioning || !products.length) return;
    
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
    
    setTimeout(() => {
      setIsTransitioning(false);
      // Reset to beginning of actual deals when reaching end of first set
      if (currentIndex >= products.length) {
        setCurrentIndex(0);
      }
    }, 500);
  };

  const handlePrevious = () => {
    if (isTransitioning || !products.length) return;
    
    setIsTransitioning(true);
    
    if (currentIndex === 0) {
      // Jump to end of first set of deals
      setCurrentIndex(products.length - 1);
    } else {
      setCurrentIndex(prev => prev - 1);
    }
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const handleColorSelect = (dealId, colorIndex) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === dealId
          ? {
              ...product,
              colors: product.colors?.map((color, index) => ({
                ...color,
                selected: index === colorIndex
              }))
            }
          : product
      )
    );
  };

  const handleCloseDeal = (dealId) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === dealId
          ? { ...product, onSale: false, dealText: "" }
          : product
      )
    );
  };

  // Auto-scroll every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex, isTransitioning, products.length]);

  if (isLoading) return <div className="py-16 text-center">Loading...</div>;
  if (!config) return <div className="py-16 text-center">Loading...</div>;
  if (!products.length) {
    // Show a placeholder section when no deals are available
    return (
      <section className="py-16 bg-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-black mb-4" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
               Hot Deals
             </h2>
             <p className="text-lg text-black max-w-2xl mx-auto" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
               Check back soon for amazing deals and offers!
             </p>
           </div>
          <div className="text-center">
            <p className="text-gray-500">No deals available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  const { hotDealsSection } = config.homePage;

  return (
    <section className="py-16 bg-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 {/* Header */}
         <div className="text-center mb-12">
           <h2 className="text-3xl font-bold text-black mb-4" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
             {hotDealsSection.title}
           </h2>
           <p className="text-lg text-black max-w-2xl mx-auto mb-4" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
             {hotDealsSection.subtitle}
           </p>
           <button
             onClick={() => window.location.reload()}
             className="text-sm bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
             title="Refresh data from MongoDB"
           >
             🔄 Refresh Deals
           </button>
         </div>

        {/* Deals Carousel */}
        <DealsCarousel
          deals={products}
          currentIndex={currentIndex}
          onColorSelect={handleColorSelect}
          onCloseDeal={handleCloseDeal}
          onPrevious={handlePrevious}
          onNext={handleNext}
          isTransitioning={isTransitioning}
        />

        {/* View All Button */}
        <div className="text-center mt-12">
          <a
            href={hotDealsSection.viewAllLink}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 transition-all duration-300"
            style={{ fontFamily: "'Albert Sans', sans-serif" }}
          >
            {hotDealsSection.viewAllText}
            <ArrowRightIcon className="ml-2 w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default HotDealsSection;
