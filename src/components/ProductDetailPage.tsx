import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product, Color } from '../types';
// CENTRALIZED DATA SERVICE - Single source for all product data
import { 
  getProductById, 
  getRelatedProducts, 
  getSiteConfig,
  calculateDiscountPercentage 
} from '../services/dataService';

interface ArrowIconProps {
  className?: string;
}

interface ZoomPosition {
  x: number;
  y: number;
}

type TabType = 'description' | 'review' | 'shipping';

// Arrow Icon Components for Carousel
const ArrowLeftIcon: React.FC<ArrowIconProps> = ({ className }) => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

const ArrowRightIcon: React.FC<ArrowIconProps> = ({ className }) => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Async-loaded data
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isActive = true;
    const load = async () => {
      if (!id) return;
      try {
        const prod = await getProductById(id);
        if (!isActive) return;
        setCurrentProduct(prod);
        if (prod) {
          const rel = await getRelatedProducts((prod._id || prod.id || '').toString(), prod.categoryId, 4);
          if (!isActive) return;
          setRelatedProducts(rel);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };
    load();
    return () => { isActive = false; };
  }, [id]);
  
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>('black');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<TabType>('description');
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [zoomPosition, setZoomPosition] = useState<ZoomPosition>({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  
  const imageRef = useRef<HTMLImageElement>(null);

  // Initialize selected options after product is loaded
  useEffect(() => {
    if (currentProduct) {
      setSelectedColor(currentProduct.colors?.[0]?.name || 'black');
      setSelectedSize(currentProduct.sizes?.[0] || 'M');
    }
  }, [currentProduct]);

  // Check if device is desktop
  useEffect(() => {
    const checkScreenSize = (): void => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Carousel state - initialized after relatedProducts is defined
  const [currentIndex, setCurrentIndex] = useState<number>(0); // Will update after relatedProducts load
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  useEffect(() => {
    setCurrentIndex(relatedProducts.length); // Start from middle of infinite array when items available
  }, [relatedProducts.length]);

  const handleQuantityChange = (change: number): void => {
    setQuantity(Math.max(1, quantity + change));
  };

  // Carousel navigation handlers
  const handlePrevious = (): void => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(prev => prev - 1);
    
    setTimeout(() => {
      setIsTransitioning(false);
      // Reset position if we've scrolled too far left
      setCurrentIndex(prevIndex => {
        if (prevIndex <= 0) {
          return relatedProducts.length * 2; // Jump to equivalent position in the middle
        }
        return prevIndex;
      });
    }, 500);
  };
  
  const handleNext = (): void => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
    
    setTimeout(() => {
      setIsTransitioning(false);
      // Reset position if we've scrolled too far right
      setCurrentIndex(prevIndex => {
        if (prevIndex >= relatedProducts.length * 4) {
          return relatedProducts.length * 2; // Jump to equivalent position in the middle
        }
        return prevIndex;
      });
    }, 500);
  };

  // If still loading or product not found
  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center">Loading...</div>;
  }
  if (!currentProduct) {
    return <div className="min-h-[50vh] flex items-center justify-center">Product not found.</div>;
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>): void => {
    if (!imageRef.current || !isDesktop) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate percentage position
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    setZoomPosition({ x: xPercent, y: yPercent });
  };

  const handleMouseEnter = (): void => {
    if (!isDesktop) return;
    setIsZoomed(true);
  };

  const handleMouseLeave = (): void => {
    if (!isDesktop) return;
    setIsZoomed(false);
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Left Column - Image Gallery */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8 lg:mb-0">
            {/* Thumbnails */}
            <div className="flex lg:flex-col gap-3 order-2 lg:order-1">
              {currentProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 lg:w-24 lg:h-24 border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                    selectedImage === index ? 'border-black shadow-md' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Product view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 order-1 lg:order-2 relative">
              <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden shadow-lg relative">
                <img
                  ref={imageRef}
                  src={currentProduct.images[selectedImage]}
                  alt="Product main view"
                  className={`w-full h-full object-cover ${isDesktop ? 'cursor-crosshair' : ''}`}
                  onMouseMove={isDesktop ? handleMouseMove : undefined}
                  onMouseEnter={isDesktop ? handleMouseEnter : undefined}
                  onMouseLeave={isDesktop ? handleMouseLeave : undefined}
                />
                
                {/* Zoom Lens Overlay - Only on desktop */}
                {isZoomed && isDesktop && (
                  <div
                    className="absolute border-2 border-white shadow-lg pointer-events-none"
                    style={{
                      width: '120px',
                      height: '120px',
                      left: `calc(${zoomPosition.x}% - 60px)`,
                      top: `calc(${zoomPosition.y}% - 60px)`,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(1px)',
                    }}
                  />
                )}
              </div>
              
              {/* Zoom Window - Only on desktop */}
              {isZoomed && isDesktop && (
                <div className="absolute top-0 left-full ml-4 w-80 h-80 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-10">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${currentProduct.images[selectedImage]})`,
                      backgroundSize: '300% 300%',
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    3x Zoom
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Product Information */}
          <div className="space-y-8">
            {/* Product Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-black leading-tight" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
              {currentProduct.name}
            </h1>

            {/* Pricing Row */}
            <div className="flex items-center gap-4">
              <span className="text-2xl lg:text-3xl font-bold text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>${currentProduct.price}</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                25% OFF
              </span>
              <span className="text-lg text-gray-600 line-through" style={{ fontFamily: "'Albert Sans', sans-serif" }}>${currentProduct.originalPrice}</span>
            </div>

            {/* Sales & Urgency Prompts */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-orange-600 font-medium">🔥 Selling fast!</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Only 3 left in stock
              </div>
            </div>

            {/* Color Selector */}
            <div className="space-y-3">
              <h3 className="text-base font-medium text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Color: <span className="font-normal capitalize">{selectedColor}</span></h3>
              <div className="flex gap-2">
                {currentProduct.colors.map((color: Color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                      selectedColor === color.name ? 'border-black' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {color.value === '#FFFFFF' && (
                      <div className="w-full h-full rounded-full border border-gray-200"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Size: <span className="font-normal">{selectedSize}</span></h3>
                <button className="text-sm text-gray-600 hover:text-black underline" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                  Find your size
                </button>
              </div>
              <div className="flex gap-2">
                {currentProduct.sizes.map((size: string) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-2 border text-sm font-medium transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                    style={{ fontFamily: "'Albert Sans', sans-serif" }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              {/* Quantity Stepper */}
              <div className="flex items-center gap-4">
                <span className="text-base font-medium text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Quantity</span>
                <div className="flex items-center border border-gray-300">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors text-gray-600"
                    style={{ fontFamily: "'Albert Sans', sans-serif" }}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 min-w-[50px] text-center text-sm" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors text-gray-600"
                    style={{ fontFamily: "'Albert Sans', sans-serif" }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button className="w-full bg-black text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-gray-800 transition-colors" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                  Add to Cart - ${(currentProduct.price * quantity).toFixed(2)}
                </button>
                <button className="w-full bg-yellow-400 text-black py-4 px-6 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                  Buy with PayPal
                </button>
                <button className="text-gray-600 hover:text-black transition-colors text-sm" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                  More payment options
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 mb-16">
          <div className="flex items-center gap-4 p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <div>
              <h4 className="font-semibold text-black mb-1" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Delivery Time</h4>
              <p className="text-sm text-gray-600" style={{ fontFamily: "'Albert Sans', sans-serif" }}>12–26 days international, 3–6 USA</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <div>
              <h4 className="font-semibold text-black mb-1" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Return Policy</h4>
              <p className="text-sm text-gray-600" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Return within 30 days of purchase</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <h4 className="font-semibold text-black mb-1" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Guarantee Safe Checkout</h4>
              <p className="text-sm text-gray-600" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Secure payment processing</p>
            </div>
          </div>
        </div>

        {/* Tabbed Information Section */}
        <div className="border-t border-gray-200 pt-8 lg:pt-16">
          {/* Tabs */}
          <div className="w-full overflow-x-auto border-b border-gray-200 mb-6 lg:mb-12 scrollbar-hide">
            <div className="flex min-w-max">
              {(['description', 'review', 'shipping'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-shrink-0 px-4 sm:px-6 lg:px-8 py-3 lg:py-4 font-semibold capitalize transition-colors text-sm sm:text-base whitespace-nowrap min-w-fit ${
                    activeTab === tab
                      ? 'border-b-2 border-black text-black'
                      : 'text-gray-600 hover:text-black'
                  }`}
                  style={{ fontFamily: "'Albert Sans', sans-serif" }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[300px] lg:min-h-[400px]" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
            {activeTab === 'description' && (
              <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-black mb-4 lg:mb-6" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Features</h3>
                  <ul className="space-y-3 text-gray-700 text-sm lg:text-base">
                    <li className="flex items-start gap-3">
                      <span className="text-black mt-1">•</span>
                      <span>Active Noise Cancellation technology</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-black mt-1">•</span>
                      <span>Premium leather headband and ear cushions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-black mt-1">•</span>
                      <span>40mm custom-tuned drivers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-black mt-1">•</span>
                      <span>30-hour battery life with ANC on</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-black mt-1">•</span>
                      <span>Quick charge: 5 min = 3 hours playback</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-black mt-1">•</span>
                      <span>Multi-device connectivity</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-black mb-4 lg:mb-6" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Materials & Care</h3>
                  <ul className="space-y-3 text-gray-700 mb-8 text-sm lg:text-base">
                    <li className="flex items-start gap-3">
                      <span className="text-black mt-1">•</span>
                      <span>Premium aluminum and leather construction</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-black mt-1">•</span>
                      <span>Memory foam ear cushions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-black mt-1">•</span>
                      <span>Tangle-free cable included</span>
                    </li>
                  </ul>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Care Instructions:</span>
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg" title="Wipe clean">
                        🧽
                      </div>
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg" title="Dry storage">
                        🌡️
                      </div>
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg" title="Handle with care">
                        ⚠️
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-black mb-2">4.8</div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">Based on 124 reviews</div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5,4,3,2,1].map(stars => (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="text-sm w-3">{stars}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 5 : stars === 2 ? 3 : 2}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600 w-8">{stars === 5 ? 87 : stars === 4 ? 25 : stars === 3 ? 6 : stars === 2 ? 4 : 2}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="font-semibold">John D.</div>
                        <div className="text-sm text-gray-600">Verified Purchase</div>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">Amazing sound quality and comfortable fit. The noise cancellation works perfectly for my daily commute. Highly recommended!</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg lg:text-xl font-bold text-black mb-4 lg:mb-6" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Shipping Information</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-black mb-2">Standard Shipping</h4>
                        <p className="text-gray-700">5-7 business days - FREE on orders over $50</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-black mb-2">Express Shipping</h4>
                        <p className="text-gray-700">2-3 business days - $9.99</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-black mb-2">Overnight Shipping</h4>
                        <p className="text-gray-700">1 business day - $19.99</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-black mb-2">International Shipping</h4>
                        <p className="text-gray-700">12-26 business days depending on location</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-black mb-2">Order Processing</h4>
                        <p className="text-gray-700">Orders are processed within 1-2 business days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>

        {/* Related Products Carousel */}
        <div className="border-t border-gray-200 pt-16 mt-16">
          <h2 className="text-2xl font-bold text-black mb-10" style={{ fontFamily: "'Albert Sans', sans-serif" }}>People Also Bought</h2>
          
          {/* Desktop Carousel */}
          <div className="hidden md:block relative">
            {/* Left Arrow */}
            <button
              onClick={handlePrevious}
              disabled={isTransitioning}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-black text-black hover:text-white transition-all duration-300 rounded-full shadow-lg w-12 h-12 flex items-center justify-center group disabled:opacity-50"
              aria-label="Previous products"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            
            {/* Right Arrow */}
            <button
              onClick={handleNext}
              disabled={isTransitioning}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-black text-black hover:text-white transition-all duration-300 rounded-full shadow-lg w-12 h-12 flex items-center justify-center group disabled:opacity-50"
              aria-label="Next products"
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            
            {/* Carousel Container - Responsive for different screen sizes */}
            <div className="overflow-hidden mx-16">
              {/* Large Desktop: 4 cards (1280px+) */}
              <div className="hidden xl:block">
                <div 
                  className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
                  style={{
                    transform: `translateX(calc(-${currentIndex} * (25% + 0.375rem)))`, // Move by card width + gap
                    gap: '1.5rem'
                  }}
                >
                  {[...relatedProducts, ...relatedProducts, ...relatedProducts, ...relatedProducts, ...relatedProducts].map((product, index) => (
                    <Link to={`/product/${(product._id || product.id)}`} key={`infinite-${(product._id || product.id)}-${index}`} className="group flex-shrink-0" style={{ width: 'calc(25% - 1.125rem)' }}>
                      <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4 relative">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-black mb-2" style={{ fontFamily: "'Albert Sans', sans-serif" }}>{product.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>${product.price}</span>
                        <span className="text-sm text-gray-600 line-through" style={{ fontFamily: "'Albert Sans', sans-serif" }}>${product.originalPrice}</span>
                      </div>
                      <div className="flex gap-1">
                        {product.colors.map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: color.value }}
                          ></div>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Medium Desktop: 3 cards (1024px - 1279px) */}
              <div className="hidden lg:block xl:hidden">
                <div 
                  className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
                  style={{
                    transform: `translateX(calc(-${currentIndex} * (33.333% + 0.5rem)))`, // Move by card width + gap
                    gap: '1.5rem'
                  }}
                >
                  {[...relatedProducts, ...relatedProducts, ...relatedProducts, ...relatedProducts, ...relatedProducts].map((product, index) => (
                    <div key={`infinite-${product.id}-${index}`} className="group flex-shrink-0" style={{ width: 'calc(33.333% - 1rem)' }}>
                      <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4 relative">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-black mb-2" style={{ fontFamily: "'Albert Sans', sans-serif" }}>{product.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>${product.price}</span>
                        <span className="text-sm text-gray-600 line-through" style={{ fontFamily: "'Albert Sans', sans-serif" }}>${product.originalPrice}</span>
                      </div>
                      <div className="flex gap-1">
                        {product.colors.map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: color.value }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Small Desktop: 2 cards (768px - 1023px) */}
              <div className="hidden md:block lg:hidden">
                <div 
                  className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
                  style={{
                    transform: `translateX(calc(-${currentIndex} * (50% + 0.75rem)))`, // Move by card width + gap
                    gap: '1.5rem'
                  }}
                >
                  {[...relatedProducts, ...relatedProducts, ...relatedProducts, ...relatedProducts, ...relatedProducts].map((product, index) => (
                    <div key={`infinite-${product.id}-${index}`} className="group flex-shrink-0" style={{ width: 'calc(50% - 0.75rem)' }}>
                      <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4 relative">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-black mb-2" style={{ fontFamily: "'Albert Sans', sans-serif" }}>{product.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>${product.price}</span>
                        <span className="text-sm text-gray-600 line-through" style={{ fontFamily: "'Albert Sans', sans-serif" }}>${product.originalPrice}</span>
                      </div>
                      <div className="flex gap-1">
                        {product.colors.map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: color.value }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile Grid - Same as original */}
          <div className="block md:hidden">
            <div className="grid grid-cols-2 gap-4">
              {relatedProducts.map((product) => (
                <div key={(product._id || product.id)} className="group">
                  <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4 relative">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                      <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-black mb-2" style={{ fontFamily: "'Albert Sans', sans-serif" }}>{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>${product.price}</span>
                    <span className="text-sm text-gray-600 line-through" style={{ fontFamily: "'Albert Sans', sans-serif" }}>${product.originalPrice}</span>
                  </div>
                  <div className="flex gap-1">
                    {product.colors.map((color, colorIndex) => (
                      <div
                        key={colorIndex}
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: color.value }}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
