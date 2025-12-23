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
      setSelectedImage(0); // Reset to first image when product changes
      // Check if sizeVariants exist, otherwise use sizes
      const sizeVariants = (currentProduct as any).sizeVariants;
      if (sizeVariants && sizeVariants.length > 0) {
        setSelectedSize(sizeVariants[0].size || '');
      } else {
        setSelectedSize(currentProduct.sizes?.[0] || '');
      }
    }
  }, [currentProduct]);

  // Get images for the currently selected color (or all images if no color selected/no color images)
  const getDisplayImages = (): string[] => {
    if (!currentProduct) return [];
    
    // Check if selected color has images
    if (selectedColor && currentProduct.colors) {
      const colorObj = currentProduct.colors.find((c: Color) => c.name === selectedColor);
      const colorImages = (colorObj as any)?.images;
      if (colorImages && Array.isArray(colorImages) && colorImages.length > 0) {
        return colorImages;
      }
    }
    // Fallback to all product images
    return currentProduct.images || [];
  };

  const displayImages = getDisplayImages();

  // Reset selected image when color changes
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedColor]);

  // Get the current price based on selected size variant
  const getCurrentPrice = (): { price: number; originalPrice: number } => {
    if (!currentProduct) return { price: 0, originalPrice: 0 };
    
    const sizeVariants = (currentProduct as any).sizeVariants;
    if (sizeVariants && sizeVariants.length > 0 && selectedSize) {
      const variant = sizeVariants.find((v: any) => v.size === selectedSize);
      if (variant) {
        return {
          price: variant.price,
          originalPrice: variant.originalPrice || currentProduct.originalPrice || variant.price
        };
      }
    }
    return {
      price: currentProduct.price,
      originalPrice: currentProduct.originalPrice || currentProduct.price
    };
  };

  // Get the current main image based on selected color and thumbnail
  const getCurrentImage = (): string => {
    if (!currentProduct) return '';
    
    // Use displayImages which are already filtered by color
    return displayImages[selectedImage] || displayImages[0] || currentProduct.images[0];
  };

  const { price: displayPrice, originalPrice: displayOriginalPrice } = getCurrentPrice();
  const displayImage = getCurrentImage();

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

  // Compute display products for carousel - only repeat if there are enough unique products
  const carouselProducts = React.useMemo(() => {
    if (relatedProducts.length === 0) return [];
    // If we have 4+ unique products, create infinite scroll by repeating
    if (relatedProducts.length >= 4) {
      return [...relatedProducts, ...relatedProducts, ...relatedProducts, ...relatedProducts, ...relatedProducts];
    }
    // Otherwise just show the unique products without repeating
    return relatedProducts;
  }, [relatedProducts]);

  // Check if carousel should be enabled (need enough products for scrolling to make sense)
  const isCarouselEnabled = relatedProducts.length >= 4;

  useEffect(() => {
    if (isCarouselEnabled) {
      setCurrentIndex(relatedProducts.length); // Start from middle of infinite array when items available
    } else {
      setCurrentIndex(0);
    }
  }, [relatedProducts.length, isCarouselEnabled]);

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
    if (isTransitioning || !isCarouselEnabled) return;

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
    if (isTransitioning || !isCarouselEnabled) return;

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
  const hasSizes = Array.isArray(currentProduct.sizes) && currentProduct.sizes.length > 0 || 
                   Array.isArray((currentProduct as any).sizeVariants) && (currentProduct as any).sizeVariants.length > 0;
  
  // Get available sizes (from sizeVariants or sizes array)
  const availableSizes = (currentProduct as any).sizeVariants?.length > 0 
    ? (currentProduct as any).sizeVariants.map((v: any) => v.size)
    : currentProduct.sizes || [];

  // Calculate discount percentage based on current variant price
  const discountPercentage = displayOriginalPrice > displayPrice 
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
    : 0;

  return (
    <div className={`min-h-screen bg-white ${relatedProducts.length > 0 ? 'pb-28' : 'pb-20 sm:pb-8'}`} style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Right Column (moves below images on mobile) - Product Information */}
          <div className="space-y-8 pt-6 lg:pt-0">
            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium text-black leading-tight" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
              {currentProduct.name}
            </h1>

            {/* Pricing Row - Dynamic based on selected size */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-2xl lg:text-3xl font-bold text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>₹{displayPrice}</span>
              {discountPercentage > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                  {discountPercentage}% OFF
                </span>
              )}
              {displayOriginalPrice > displayPrice && (
                <span className="text-lg text-gray-600 line-through" style={{ fontFamily: "'Albert Sans', sans-serif" }}>₹{displayOriginalPrice}</span>
              )}
            </div>
            {/* Color Selector - Always visible */}
            {hasColors && (
              <div className="space-y-3 border-t pt-5">
                <h3 className="text-base font-medium text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Color: <span className="font-normal capitalize">{selectedColor}</span></h3>
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
              </div>
            )}

            {/* Size Selector - Always visible */}
            {hasSizes && (
              <div className="space-y-3 border-t pt-5">
                <h3 className="text-base font-medium text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>Size: <span className="font-normal">{selectedSize || 'Select a size'}</span></h3>
                <div className="flex gap-2 flex-wrap">
                      {(currentProduct as any).sizeVariants?.length > 0 ? (
                        // Render size variants with individual prices
                        (currentProduct as any).sizeVariants.map((variant: any) => (
                          <button
                            key={variant.size}
                            onClick={() => setSelectedSize(variant.size)}
                            disabled={variant.inStock === false}
                            className={`px-3 py-2 border text-sm font-medium transition-all duration-200 ${
                              selectedSize === variant.size
                                ? 'border-black bg-black text-white'
                                : variant.inStock === false
                                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
                            }`}
                            style={{ fontFamily: "'Albert Sans', sans-serif" }}
                          >
                            <span>{variant.size}</span>
                            {variant.price && variant.price !== currentProduct.price && (
                              <span className="text-xs ml-1 opacity-75">₹{variant.price}</span>
                            )}
                          </button>
                        ))
                      ) : (
                        // Render regular sizes without price variants
                        availableSizes.map((size: string) => (
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
                        ))
                      )}
                </div>
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
                    {inCart ? 'In Cart' : `Add to Cart - ₹${(displayPrice * quantity).toFixed(2)}`}
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
            {/* Thumbnails (horizontal scroll on mobile) - Shows only selected color's images */}
            <div className="flex lg:flex-col gap-3 order-2 lg:order-1 overflow-x-auto pb-1 lg:pb-0 -mx-2 px-2 lg:mx-0 lg:px-0 scrollbar-hide">
              {displayImages.map((image, index) => (
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

            {/* Main Image - Shows color-specific image if available */}
            <div className="flex-1 order-1 lg:order-2 relative">
              <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden shadow-md relative">
                <img
                  ref={imageRef}
                  src={displayImage}
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
                      backgroundImage: `url(${displayImage})`,
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
              </div>
            )}
          </div>
        </div>

        {/* Related Products - Simple Grid */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-200 pt-8 sm:pt-12 mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-black mb-6 sm:mb-8" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
              You May Also Like
            </h2>

            {/* Responsive Grid - 2 cols mobile, 3 cols tablet, 4 cols desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {relatedProducts.map((product) => (
                <Link 
                  to={`/product/${(product._id || product.id)}`} 
                  key={(product._id || product.id)} 
                  className="group"
                >
                  {/* Product Card */}
                  <div className="bg-white rounded-lg overflow-hidden">
                    {/* Image Container */}
                    <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden relative">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Quick Actions - Desktop only */}
                      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
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
                      {/* Discount Badge */}
                      {product.originalPrice && product.price < product.originalPrice && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="pt-3 pb-1">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2 mb-1" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-black" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
                          ₹{product.price}
                        </span>
                        {product.originalPrice && product.price < product.originalPrice && (
                          <span className="text-xs sm:text-sm text-gray-400 line-through">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                      {/* Color Dots */}
                      {product.colors && product.colors.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {product.colors.slice(0, 4).map((color, colorIndex) => (
                            <div
                              key={colorIndex}
                              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-gray-200"
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            />
                          ))}
                          {product.colors.length > 4 && (
                            <span className="text-xs text-gray-400">+{product.colors.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 py-2.5">
          {/* Price Row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-gray-500">Total</span>
              <span className="text-base font-semibold">₹{(displayPrice * quantity).toFixed(2)}</span>
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
