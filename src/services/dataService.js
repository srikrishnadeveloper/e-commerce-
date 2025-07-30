// CENTRALIZED DATA SERVICE - Backend API Integration
// This service handles all data operations for the e-commerce platform
// Updated to use backend API endpoints instead of static JSON files

const API_BASE_URL = 'http://localhost:3001/api/v1';

// Generic API request function with error handling
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API Request failed for ${endpoint}:`, error);
    throw error;
  }
};

// =============================================================================
// PRODUCT DATA FUNCTIONS
// =============================================================================

/**
 * Get all products with optional filtering and pagination
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise<Array>} Array of products (maintaining backward compatibility)
 */
export const getProducts = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    const response = await apiRequest(endpoint);
    
    // Return just the products array for backward compatibility
    return response.data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    // Fallback to empty array if API fails
    return [];
  }
};

/**
 * Get a single product by ID
 * @param {number|string} productId - Product ID
 * @returns {Promise<Object|null>} Product data or null if not found
 */
export const getProductById = async (productId) => {
  try {
    const response = await apiRequest(`/products/${productId}`);
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    return null;
  }
};

/**
 * Get related products for a given product
 * @param {number|string} productId - Product ID
 * @param {number} limit - Number of related products to fetch
 * @returns {Promise<Array>} Array of related products
 */
export const getRelatedProducts = async (productId, limit = 4) => {
  try {
    const response = await apiRequest(`/products/${productId}/related?limit=${limit}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching related products for ${productId}:`, error);
    return [];
  }
};

/**
 * Get featured products
 * @param {number} limit - Number of featured products to fetch
 * @returns {Promise<Array>} Array of featured products
 */
export const getFeaturedProducts = async (limit = 8) => {
  try {
    const response = await apiRequest(`/products/featured?limit=${limit}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

/**
 * Get products on sale
 * @param {number} limit - Number of sale products to fetch
 * @returns {Promise<Array>} Array of products on sale
 */
export const getOnSaleProducts = async (limit = 8) => {
  try {
    const response = await apiRequest(`/products/on-sale?limit=${limit}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching sale products:', error);
    return [];
  }
};

/**
 * Get products by category (for backward compatibility)
 * @param {string} categoryId - Category ID
 * @returns {Promise<Array>} Array of products in the category
 */
export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await getProducts({ category: categoryId });
    return response || [];
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    return [];
  }
};

/**
 * Get bestseller products (for backward compatibility)
 * @param {number} limit - Number of bestseller products to return
 * @returns {Promise<Array>} Array of bestseller products
 */
export const getBestsellerProducts = async (limit = 8) => {
  try {
    const response = await getProducts({ bestseller: 'true', limit });
    return response || [];
  } catch (error) {
    console.error('Error fetching bestseller products:', error);
    return [];
  }
};

// =============================================================================
// CATEGORY DATA FUNCTIONS
// =============================================================================

/**
 * Get all product categories
 * @returns {Promise<Array>} Array of categories
 */
export const getCategories = async () => {
  try {
    const response = await apiRequest('/categories');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

/**
 * Get a single category by ID
 * @param {string} categoryId - Category ID
 * @returns {Promise<Object|null>} Category data or null if not found
 */
export const getCategoryById = async (categoryId) => {
  try {
    const response = await apiRequest(`/categories/${categoryId}`);
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching category ${categoryId}:`, error);
    return null;
  }
};

// =============================================================================
// SITE CONFIGURATION FUNCTIONS
// =============================================================================

/**
 * Get site configuration
 * @param {string} businessType - Optional business type filter
 * @returns {Promise<Object>} Site configuration object
 */
export const getSiteConfig = async (businessType = null) => {
  try {
    const endpoint = businessType ? `/config?businessType=${businessType}` : '/config';
    const response = await apiRequest(endpoint);
    return response.data || {};
  } catch (error) {
    console.error('Error fetching site configuration:', error);
    // Return minimal fallback configuration
    return {
      branding: {
        name: 'E-Commerce Store',
        tagline: 'Your Online Store',
        logo: { light: '/logo.svg', dark: '/logo.png', alt: 'Store Logo' }
      },
      navigation: { menu: [] },
      hero: { slides: [] },
      footer: {},
      featuredCollections: {},
      hotDealsSection: {},
      productListing: {},
      productDetail: {}
    };
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} currentPrice - Current sale price
 * @returns {number} Discount percentage
 */
export const calculateDiscountPercentage = (originalPrice, currentPrice) => {
  if (!originalPrice || originalPrice <= currentPrice) {
    return 0;
  }
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * Format price for display
 * @param {number} price - Price to format
 * @param {string} currency - Currency symbol
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = '$') => {
  return `${currency}${price.toFixed(2)}`;
};

/**
 * Check if product is on sale
 * @param {Object} product - Product object
 * @returns {boolean} True if product is on sale
 */
export const isProductOnSale = (product) => {
  return product.originalPrice && product.originalPrice > product.price;
};

/**
 * Get product primary image
 * @param {Object} product - Product object
 * @returns {string} Primary image URL or fallback
 */
export const getProductPrimaryImage = (product) => {
  if (product.images && product.images.length > 0) {
    // Handle both object format (from API) and string format (legacy)
    const firstImage = product.images[0];
    if (typeof firstImage === 'object' && firstImage.url) {
      return firstImage.url;
    }
    return firstImage;
  }
  return '/placeholder-image.jpg'; // Fallback image
};

// =============================================================================
// SEARCH FUNCTIONS
// =============================================================================

/**
 * Search products by query
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} Array of matching products
 */
export const searchProducts = async (query, filters = {}) => {
  try {
    const params = { search: query, ...filters };
    const response = await getProducts(params);
    return response || [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

// =============================================================================
// FILTERING AND SORTING FUNCTIONS
// =============================================================================

/**
 * Filter products by price range
 * @param {Array} products - Array of products to filter
 * @param {Array} priceRange - [minPrice, maxPrice]
 * @returns {Array} Filtered products
 */
export const filterProductsByPriceRange = (products, priceRange) => {
  if (!products || !Array.isArray(products)) return [];
  const [minPrice, maxPrice] = priceRange;
  
  return products.filter(product => {
    const price = product.price || 0;
    return price >= minPrice && price <= maxPrice;
  });
};

/**
 * Sort products by various criteria
 * @param {Array} products - Array of products to sort
 * @param {string} sortBy - Sort criteria ('default', 'price-low', 'price-high', 'name', 'newest')
 * @returns {Array} Sorted products
 */
export const sortProducts = (products, sortBy) => {
  if (!products || !Array.isArray(products)) return [];
  
  const sortedProducts = [...products];
  
  switch (sortBy) {
    case 'price-low':
      return sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price-high':
      return sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'name':
      return sortedProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case 'newest':
      return sortedProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    case 'default':
    default:
      return sortedProducts;
  }
};

/**
 * Get deals products (alias for getOnSaleProducts for backward compatibility)
 * @param {number} limit - Number of deals products to fetch
 * @returns {Promise<Array>} Array of products on deals
 */
export const getDealsProducts = async (limit = 8) => {
  return getOnSaleProducts(limit);
};

// =============================================================================
// EXPORT ALL FUNCTIONS
// =============================================================================

export default {
  // Product functions
  getProducts,
  getProductById,
  getRelatedProducts,
  getFeaturedProducts,
  getOnSaleProducts,
  getProductsByCategory,
  getBestsellerProducts,
  getDealsProducts,
  
  // Category functions
  getCategories,
  getCategoryById,
  
  // Configuration functions
  getSiteConfig,
  
  // Utility functions
  calculateDiscountPercentage,
  formatPrice,
  isProductOnSale,
  getProductPrimaryImage,
  
  // Search functions
  searchProducts,
  
  // Filtering and sorting functions
  filterProductsByPriceRange,
  sortProducts,
  
  // API configuration
  API_BASE_URL
};
