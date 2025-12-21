import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, Color } from '../types';
// CENTRALIZED DATA SERVICE - Single source for all product data
import {
  getProductById,
  getRelatedProducts,
  getSiteConfig,
  calculateDiscountPercentage
} from '../services/dataService';
import cartService from '../services/cartService';
import wishlistService from '../services/wishlistService';
import authService from '../services/authService';

interface ArrowIconProps {
  className?: string;
}

interface ZoomPosition {
  x: number;
  y: number;
}

type TabType = 'description';

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
  const navigate = useNavigate();

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
          const rel = await getRelatedProducts((prod._id || prod.id || '').toString(), prod.categoryId, 10);
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
      setSelectedColor(currentProduct.colors?.[0]?.name || '');
      setSelectedSize(currentProduct.sizes?.[0] || '');
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

  const handleAddToCart = async () => {
    if (!currentProduct) return;
    if (!authService.isAuthenticated()) {
      window.dispatchEvent(new Event('auth:openLogin'));
      return;
    }
    try {
      await cartService.addToCart(currentProduct._id || currentProduct.id, quantity, selectedColor, selectedSize);
      // cartService already dispatches 'cart:changed'
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleAddToWishlist = async () => {
    if (!currentProduct) return;
    if (!authService.isAuthenticated()) {
      window.dispatchEvent(new Event('auth:openLogin'));
      return;
    }
    try {
      await wishlistService.addToWishlist(currentProduct._id || currentProduct.id);
      // wishlistService already dispatches 'wishlist:changed'
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
  };

  const handleBuyNow = async () => {
    if (!currentProduct) return;
    if (!authService.isAuthenticated()) {
      window.dispatchEvent(new Event('auth:openLogin'));
      return;
    }

    try {
      await cartService.addToCart(currentProduct._id || currentProduct.id, quantity, selectedColor, selectedSize);
      setInCart(true); // optimistic flip
      navigate('/checkout');
    } catch (error) {
      console.error('Failed to start checkout:', error);
    }
  };

  // Visual state: in cart / in wishlist
  const [inCart, setInCart] = React.useState(false);
  const [inWishlist, setInWishlist] = React.useState(false);
  React.useEffect(() => {
    if (!currentProduct) return;
    let mounted = true;
    const refresh = async () => {
      // Only fetch cart/wishlist if user is authenticated
      if (!authService.isAuthenticated()) {
        setInCart(false);
        setInWishlist(false);
        return;
      }
      const [cartIds, wishIds] = await Promise.all([
        cartService.getCartIds(),
        wishlistService.getWishlistIds(),
      ]);
      if (!mounted) return;
      const pid = String(currentProduct._id || currentProduct.id);
      setInCart(cartIds.has(pid));
      setInWishlist(wishIds.has(pid));
    };
    refresh();
    const onCart = () => refresh();
    const onWish = () => refresh();
    window.addEventListener('cart:changed', onCart);
    window.addEventListener('wishlist:changed', onWish);
    return () => {
      mounted = false;
      window.removeEventListener('cart:changed', onCart);
      window.removeEventListener('wishlist:changed', onWish);
    };
  }, [currentProduct?._id, currentProduct?.id]);

  // Related products quick actions: maintain cart/wishlist membership sets for visual indicators
  const [relatedCartIds, setRelatedCartIds] = React.useState<Set<string>>(new Set());
  const [relatedWishIds, setRelatedWishIds] = React.useState<Set<string>>(new Set());
  React.useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      // Only fetch cart/wishlist if user is authenticated
      if (!authService.isAuthenticated()) {
        setRelatedCartIds(new Set());
        setRelatedWishIds(new Set());
        return;
      }
      try {
        const [c, w] = await Promise.all([
          cartService.getCartIds(),
          wishlistService.getWishlistIds(),
        ]);
        if (!mounted) return;
        setRelatedCartIds(new Set(Array.from(c)));
        setRelatedWishIds(new Set(Array.from(w)));
      } catch {}
    };
    refresh();
    const onCart = () => refresh();
    const onWish = () => refresh();
    window.addEventListener('cart:changed', onCart);
    window.addEventListener('wishlist:changed', onWish);
    return () => {
      mounted = false;
      window.removeEventListener('cart:changed', onCart);
      window.removeEventListener('wishlist:changed', onWish);
    };
  }, []);

  // Mobile collapsible state for sections (must be declared before any early returns to preserve hook order)
  const [mobileInfoOpen, setMobileInfoOpen] = useState<{pricing:boolean;color:boolean;size:boolean;details:boolean}>(
    { pricing: true, color: true, size: false, details: false }
  );

  const isInRelatedCart = (p: Product) => relatedCartIds.has(String((p as any)._id || (p as any).id));
  const isInRelatedWishlist = (p: Product) => relatedWishIds.has(String((p as any)._id || (p as any).id));

  const handleQuickAddToCart = async (p: Product, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!authService.isAuthenticated()) {
      window.dispatchEvent(new Event('auth:openLogin'));
      return;
    }
    if (isInRelatedCart(p)) return;
    try {
      await cartService.addToCart((p as any)._id || (p as any).id, 1);
      // cartService dispatches 'cart:changed'
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleQuickWishlist = async (p: Product, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!authService.isAuthenticated()) {
      window.dispatchEvent(new Event('auth:openLogin'));
      return;
    }
    try {
      await wishlistService.addToWishlist((p as any)._id || (p as any).id);
      // wishlistService dispatches 'wishlist:changed'
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
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


  const hasColors = Array.isArray(currentProduct.colors) && currentProduct.colors.length > 0;
  const hasSizes = Array.isArray(currentProduct.sizes) && currentProduct.sizes.length > 0;

  return (
    <div className="min-h-screen bg-white pb-28" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Right Column (moves below images on mobile) - Product Information */}
          <div className="space-y-8 pt-6 lg:pt-0">
            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium text-black leading-tight" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
              {currentProduct.name}
            </h1>

            {/* Pricing Row */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-2xl lg:text-3xl font-bold text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>₹{currentProduct.price}</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                {(currentProduct as any)?.discountPercentage || 25}% OFF
              </span>
              <span className="text-lg text-gray-600 line-through" style={{ fontFamily: "'Albert Sans', sans-serif" }}>₹{currentProduct.originalPrice}</span>
            </div>

            {/* Color Selector (collapsible on mobile) */}
            {hasColors && (
              <div className="space-y-3 border-t pt-5 lg:border-none lg:pt-0">
                <button
                  type="button"
                  onClick={() => setMobileInfoOpen(s => ({...s, color: !s.color}))}
                  className="flex w-full items-center justify-between lg:cursor-default"
                  aria-expanded={mobileInfoOpen.color}
                >
                  <h3 className="text-base font-medium text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Color: <span className="font-normal capitalize">{selectedColor}</span></h3>
                  <span className="lg:hidden text-sm text-gray-500">{mobileInfoOpen.color ? '−' : '+'}</span>
                </button>
                {mobileInfoOpen.color && (
                  <div className="flex gap-2">
                    {currentProduct.colors!.map((color: Color) => (
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
                )}
              </div>
            )}

            {/* Size Selector (collapsible on mobile) */}
            {hasSizes && (
              <div className="space-y-3 border-t pt-5 lg:border-none lg:pt-0">
                <button
                  type="button"
                  onClick={() => setMobileInfoOpen(s => ({...s, size: !s.size}))}
                  className="flex w-full items-center justify-between lg:cursor-default"
                  aria-expanded={mobileInfoOpen.size}
                >
                  <h3 className="text-base font-medium text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Size: <span className="font-normal">{selectedSize}</span></h3>
                  <span className="lg:hidden text-sm text-gray-500">{mobileInfoOpen.size ? '−' : '+'}</span>
                </button>
                {mobileInfoOpen.size && (
                  <>
                    <div className="flex justify-end">
                      <button className="text-sm text-gray-600 hover:text-black underline" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Find your size</button>
                    </div>
                    <div className="flex gap-2">
                      {currentProduct.sizes!.map((size: string) => (
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
                  </>
                )}
              </div>
            )}

            {/* Quantity & Actions (desktop primary area) */}
            <div className="space-y-4 hidden sm:block">
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
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={inCart}
                    className={`flex-1 py-4 px-6 rounded-lg font-bold text-lg transition-colors ${inCart ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
                    style={{ fontFamily: "'Albert Sans', sans-serif" }}
                  >
                    {inCart ? 'In Cart' : `Add to Cart - ₹${(currentProduct.price * quantity).toFixed(2)}`}
                  </button>
                  <button
                    onClick={handleAddToWishlist}
                    className={`p-4 rounded-lg transition-colors ${inWishlist ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    title={inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                  >
                    <svg className="w-6 h-6" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-yellow-400 text-black py-4 px-6 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors"
                  style={{ fontFamily: "'Albert Sans', sans-serif" }}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* Left Column - Image Gallery */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4 lg:mb-0 lg:order-first">
            {/* Thumbnails (horizontal scroll on mobile) */}
            <div className="flex lg:flex-col gap-3 order-2 lg:order-1 overflow-x-auto pb-1 lg:pb-0 -mx-2 px-2 lg:mx-0 lg:px-0 scrollbar-hide">
              {currentProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 flex-shrink-0 lg:w-24 lg:h-24 border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                    selectedImage === index ? 'border-black shadow-md' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  aria-label={`Show image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`Product view ${index + 1}`}
                    className="w-full h-full max-w-full max-h-full object-cover"
                    style={{
                      minHeight: '100%',
                      maxHeight: '100%',
                      minWidth: '100%',
                      maxWidth: '100%',
                      objectFit: 'cover'
                    }}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 order-1 lg:order-2 relative">
              <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden shadow-md relative">
                <img
                  ref={imageRef}
                  src={currentProduct.images[selectedImage]}
                  alt={currentProduct.name}
                  className={`w-full h-full max-w-full max-h-full object-cover ${isDesktop ? 'cursor-crosshair' : ''}`}
                  style={{
                    minHeight: '100%',
                    maxHeight: '100%',
                    minWidth: '100%',
                    maxWidth: '100%',
                    objectFit: 'cover'
                  }}
                  onMouseMove={isDesktop ? handleMouseMove : undefined}
                  onMouseEnter={isDesktop ? handleMouseEnter : undefined}
                  onMouseLeave={isDesktop ? handleMouseLeave : undefined}
                  loading="eager"
                />
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
              {isZoomed && isDesktop && (
                <div className="hidden lg:block absolute top-0 left-full ml-4 w-80 h-80 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-10">
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
        </div>

  {/* Info Cards (stack then grid) */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 mt-6 sm:mt-12 mb-8 sm:mb-16">
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <div className="min-w-0">
              <h4 className="font-semibold text-black text-sm sm:text-base" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Delivery Time</h4>
              <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: "'Albert Sans', sans-serif" }}>12–26 days international, 3–6 USA</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <div className="min-w-0">
              <h4 className="font-semibold text-black text-sm sm:text-base" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Return Policy</h4>
              <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Return within 30 days of purchase</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className="min-w-0">
              <h4 className="font-semibold text-black text-sm sm:text-base" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Guarantee Safe Checkout</h4>
              <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Secure payment processing</p>
            </div>
          </div>
        </div>

          {/* Tabbed / Accordion Information Section */}
          <div className="border-t border-gray-200 pt-8 lg:pt-16" id="details-section">
          {/* Tabs */}
          <div className="w-full overflow-x-auto border-b border-gray-200 mb-6 lg:mb-12 scrollbar-hide">
            <div className="flex min-w-max">
              {(['description'] as TabType[]).map((tab) => (
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
              <div className="space-y-8">
                {currentProduct.description && (
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-black mb-4 lg:mb-6" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Description</h3>
                    <p className="text-gray-700 text-sm lg:text-base leading-relaxed">{currentProduct.description}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg lg:text-xl font-bold text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Features</h3>
                  <ul className="space-y-3 text-gray-700 text-sm lg:text-base">
                    {currentProduct.features && currentProduct.features.length > 0 ? (
                      currentProduct.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-black mt-1">•</span>
                          <span>{feature}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        {/* Dynamic fallback features based on product category/tags */}
                        <li className="flex items-start gap-3">
                          <span className="text-black mt-1">•</span>
                          <span>High-quality construction and materials</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-black mt-1">•</span>
                          <span>Designed for durability and performance</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="text-black mt-1">•</span>
                          <span>Easy to use and maintain</span>
                        </li>
                        {currentProduct.tags && currentProduct.tags.includes('electronics') && (
                          <>
                            <li className="flex items-start gap-3">
                              <span className="text-black mt-1">•</span>
                              <span>Advanced technology integration</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-black mt-1">•</span>
                              <span>Energy efficient operation</span>
                            </li>
                          </>
                        )}
                        {currentProduct.tags && currentProduct.tags.includes('clothing') && (
                          <>
                            <li className="flex items-start gap-3">
                              <span className="text-black mt-1">•</span>
                              <span>Comfortable fit and feel</span>
                            </li>
                            <li className="flex items-start gap-3">
                              <span className="text-black mt-1">•</span>
                              <span>Stylish and versatile design</span>
                            </li>
                          </>
                        )}
                        <li className="flex items-start gap-3">
                          <span className="text-black mt-1">•</span>
                          <span>Excellent value for money</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Carousel */}
        <div className="border-t border-gray-200 pt-16 mt-16">
          <h2 className="text-2xl font-bold text-black mb-10" style={{ fontFamily: "'Albert Sans', sans-serif" }}>You May Also Like</h2>

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
                          className="w-full h-full max-w-full max-h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          style={{
                            minHeight: '100%',
                            maxHeight: '100%',
                            minWidth: '100%',
                            maxWidth: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleQuickWishlist(product, e)}
                            title={isInRelatedWishlist(product) ? 'In Wishlist' : 'Add to Wishlist'}
                            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${isInRelatedWishlist(product) ? 'bg-red-100 text-red-600' : 'bg-white hover:bg-gray-100'}`}
                          >
                            <svg className="w-4 h-4" fill={isInRelatedWishlist(product) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleQuickAddToCart(product, e)}
                            disabled={isInRelatedCart(product)}
                            title={isInRelatedCart(product) ? 'In Cart' : 'Add to Cart'}
                            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${isInRelatedCart(product) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-gray-100'}`}
                          >
                            {isInRelatedCart(product) ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-black mb-2" style={{ fontFamily: "'Albert Sans', sans-serif" }}>{product.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                         <span className="font-bold text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>₹{product.price}</span>
                         <span className="text-sm text-gray-600 line-through" style={{ fontFamily: "'Albert Sans', sans-serif" }}>₹{product.originalPrice}</span>
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
                          className="w-full h-full max-w-full max-h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          style={{
                            minHeight: '100%',
                            maxHeight: '100%',
                            minWidth: '100%',
                            maxWidth: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleQuickWishlist(product as Product, e)}
                            title={isInRelatedWishlist(product as Product) ? 'In Wishlist' : 'Add to Wishlist'}
                            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${isInRelatedWishlist(product as Product) ? 'bg-red-100 text-red-600' : 'bg-white hover:bg-gray-100'}`}
                          >
                            <svg className="w-4 h-4" fill={isInRelatedWishlist(product as Product) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleQuickAddToCart(product as Product, e)}
                            disabled={isInRelatedCart(product as Product)}
                            title={isInRelatedCart(product as Product) ? 'In Cart' : 'Add to Cart'}
                            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${isInRelatedCart(product as Product) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-gray-100'}`}
                          >
                            {isInRelatedCart(product as Product) ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-black mb-2" style={{ fontFamily: "'Albert Sans', sans-serif" }}>{product.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>₹{product.price}</span>
                        <span className="text-sm text-gray-600 line-through" style={{ fontFamily: "'Albert Sans', sans-serif" }}>₹{product.originalPrice}</span>
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
                          className="w-full h-full max-w-full max-h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          style={{
                            minHeight: '100%',
                            maxHeight: '100%',
                            minWidth: '100%',
                            maxWidth: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleQuickWishlist(product as Product, e)}
                            title={isInRelatedWishlist(product as Product) ? 'In Wishlist' : 'Add to Wishlist'}
                            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${isInRelatedWishlist(product as Product) ? 'bg-red-100 text-red-600' : 'bg-white hover:bg-gray-100'}`}
                          >
                            <svg className="w-4 h-4" fill={isInRelatedWishlist(product as Product) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleQuickAddToCart(product as Product, e)}
                            disabled={isInRelatedCart(product as Product)}
                            title={isInRelatedCart(product as Product) ? 'In Cart' : 'Add to Cart'}
                            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${isInRelatedCart(product as Product) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-gray-100'}`}
                          >
                            {isInRelatedCart(product as Product) ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-black mb-2" style={{ fontFamily: "'Albert Sans', sans-serif" }}>{product.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>₹{product.price}</span>
                        <span className="text-sm text-gray-600 line-through" style={{ fontFamily: "'Albert Sans', sans-serif" }}>₹{product.originalPrice}</span>
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

          {/* Mobile Grid - Related products simplified spacing */}
          <div className="block md:hidden">
            <div className="grid grid-cols-2 gap-4">
              {relatedProducts.map((product) => (
                <div key={(product._id || product.id)} className="group">
                  <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4 relative">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full max-w-full max-h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      style={{
                        minHeight: '100%',
                        maxHeight: '100%',
                        minWidth: '100%',
                        maxWidth: '100%',
                        objectFit: 'cover'
                      }}
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleQuickWishlist(product, e)}
                        title={isInRelatedWishlist(product) ? 'In Wishlist' : 'Add to Wishlist'}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${isInRelatedWishlist(product) ? 'bg-red-100 text-red-600' : 'bg-white hover:bg-gray-100'}`}
                      >
                        <svg className="w-4 h-4" fill={isInRelatedWishlist(product) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleQuickAddToCart(product, e)}
                        disabled={isInRelatedCart(product)}
                        title={isInRelatedCart(product) ? 'In Cart' : 'Add to Cart'}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${isInRelatedCart(product) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white hover:bg-gray-100'}`}
                      >
                        {isInRelatedCart(product) ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-black mb-2" style={{ fontFamily: "'Albert Sans', sans-serif" }}>{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>₹{product.price}</span>
                    <span className="text-sm text-gray-600 line-through" style={{ fontFamily: "'Albert Sans', sans-serif" }}>₹{product.originalPrice}</span>
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

      {/* Sticky Mobile Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 py-2.5">
          {/* Price Row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-gray-500">Total</span>
              <span className="text-base font-semibold">₹{(currentProduct.price * quantity).toFixed(2)}</span>
            </div>
            <button
              onClick={handleAddToWishlist}
              aria-label={inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              className={`p-2.5 rounded-full border ${inWishlist ? 'bg-red-100 border-red-300 text-red-600' : 'bg-gray-100 border-gray-300 text-gray-700'}`}
            >
              <svg className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
          {/* Action Buttons Row */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              disabled={inCart}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors ${inCart ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
            >
              {inCart ? 'In Cart' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm bg-yellow-400 text-black hover:bg-yellow-500 transition-colors"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
