/**
 * CENTRALIZED DATA SERVICE
 * =======================
 * 
 * This is the SINGLE SOURCE for all product and site configuration data.
 * When transitioning to backend/MongoDB, only this file needs to be modified.
 * 
 * IMPORTANT: All components should import and use this service instead of 
 * directly importing JSON files.
 * 
 * Usage:
 * - getProducts() - Returns all products
 * - getProductById(id) - Returns single product by ID
 * - getProductsByCategory(categoryId) - Returns products by category
 * - getFeaturedProducts() - Returns featured products
 * - getDealsProducts() - Returns products on sale
 * - getBestSellerProducts() - Returns bestseller products
 * - getSiteConfig() - Returns site configuration
 * - getCategories() - Returns product categories
 * 
 * Backend Migration Notes:
 * 1. Replace JSON imports with API calls
 * 2. Add error handling and retry logic
 * 3. Add caching mechanism
 * 4. Add authentication headers if needed
 * 5. Convert to async/await pattern for API calls
 */

// TEMPORARY: Import JSON data (replace with API calls for backend)
import productsData from '../data/products.json';
import siteConfig from '../data/siteConfig.json';

/**
 * PRODUCTS DATA SERVICE
 * ====================
 * All product-related data fetching goes through these functions
 */

/**
 * Get all products
 * Backend: Replace with API call to GET /api/products
 */
export const getProducts = () => {
  try {
    return productsData.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

/**
 * Get single product by ID
 * Backend: Replace with API call to GET /api/products/:id
 */
export const getProductById = (id) => {
  try {
    const products = productsData.products || [];
    return products.find(product => product.id === parseInt(id)) || null;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
};

/**
 * Get products by category
 * Backend: Replace with API call to GET /api/products?category=:categoryId
 */
export const getProductsByCategory = (categoryId) => {
  try {
    const products = productsData.products || [];
    if (!categoryId) return products;
    return products.filter(product => product.categoryId === categoryId);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

/**
 * Get featured products
 * Backend: Replace with API call to GET /api/products?featured=true
 */
export const getFeaturedProducts = () => {
  try {
    const products = productsData.products || [];
    return products.filter(product => product.featured === true);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

/**
 * Get products on sale (deals)
 * Backend: Replace with API call to GET /api/products?onSale=true
 */
export const getDealsProducts = () => {
  try {
    const products = productsData.products || [];
    return products.filter(product => 
      product.originalPrice && product.originalPrice > product.price
    );
  } catch (error) {
    console.error('Error fetching deals products:', error);
    return [];
  }
};

/**
 * Get bestseller products
 * Backend: Replace with API call to GET /api/products?bestseller=true
 */
export const getBestSellerProducts = () => {
  try {
    const products = productsData.products || [];
    return products.filter(product => product.bestseller === true);
  } catch (error) {
    console.error('Error fetching bestseller products:', error);
    return [];
  }
};

/**
 * Get product categories
 * Backend: Replace with API call to GET /api/categories
 */
export const getCategories = () => {
  try {
    return productsData.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

/**
 * Search products by query
 * Backend: Replace with API call to GET /api/products?search=:query
 */
export const searchProducts = (query) => {
  try {
    const products = productsData.products || [];
    if (!query) return products;
    
    const searchTerm = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

/**
 * SITE CONFIGURATION SERVICE
 * ==========================
 * All site configuration data fetching goes through these functions
 */

/**
 * Get complete site configuration
 * Backend: Replace with API call to GET /api/config
 */
export const getSiteConfig = () => {
  try {
    return siteConfig;
  } catch (error) {
    console.error('Error fetching site config:', error);
    return {};
  }
};

/**
 * Get navigation configuration
 * Backend: Replace with API call to GET /api/config/navigation
 */
export const getNavigationConfig = () => {
  try {
    return siteConfig.navigation || {};
  } catch (error) {
    console.error('Error fetching navigation config:', error);
    return {};
  }
};

/**
 * Get homepage configuration
 * Backend: Replace with API call to GET /api/config/homepage
 */
export const getHomepageConfig = () => {
  try {
    return siteConfig.homePage || {};
  } catch (error) {
    console.error('Error fetching homepage config:', error);
    return {};
  }
};

/**
 * Get branding configuration
 * Backend: Replace with API call to GET /api/config/branding
 */
export const getBrandingConfig = () => {
  try {
    return siteConfig.branding || {};
  } catch (error) {
    console.error('Error fetching branding config:', error);
    return {};
  }
};

/**
 * Get footer configuration
 * Backend: Replace with API call to GET /api/config/footer
 */
export const getFooterConfig = () => {
  try {
    return siteConfig.footer || {};
  } catch (error) {
    console.error('Error fetching footer config:', error);
    return {};
  }
};

/**
 * UTILITY FUNCTIONS
 * ================
 * Helper functions for data manipulation
 */

/**
 * Get related products (exclude current product)
 */
export const getRelatedProducts = (currentProductId, categoryId = null, limit = 8) => {
  try {
    const products = productsData.products || [];
    let relatedProducts = products.filter(product => product.id !== parseInt(currentProductId));
    
    if (categoryId) {
      relatedProducts = relatedProducts.filter(product => product.categoryId === categoryId);
    }
    
    return relatedProducts.slice(0, limit);
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
};

/**
 * Calculate discount percentage
 */
export const calculateDiscountPercentage = (originalPrice, currentPrice) => {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * Filter products by price range
 */
export const filterProductsByPriceRange = (products, minPrice, maxPrice) => {
  return products.filter(product => {
    const price = product.price;
    return price >= minPrice && price <= maxPrice;
  });
};

/**
 * Sort products by various criteria
 */
export const sortProducts = (products, sortBy) => {
  const sortedProducts = [...products];
  
  switch (sortBy) {
    case 'price-low-high':
      return sortedProducts.sort((a, b) => a.price - b.price);
    case 'price-high-low':
      return sortedProducts.sort((a, b) => b.price - a.price);
    case 'name-a-z':
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-z-a':
      return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
    case 'newest':
      return sortedProducts.sort((a, b) => b.id - a.id); // Assuming higher ID = newer
    case 'popular':
      return sortedProducts.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
    case 'rating':
      return sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    default:
      return sortedProducts;
  }
};

/**
 * FUTURE BACKEND INTEGRATION NOTES
 * ================================
 * 
 * When integrating with MongoDB/Backend API:
 * 
 * 1. Replace all functions above with async functions
 * 2. Add proper error handling and loading states
 * 3. Implement caching mechanism (Redis/memory cache)
 * 4. Add authentication headers if needed
 * 5. Implement retry logic for failed requests
 * 6. Add request/response interceptors
 * 7. Consider using a state management library (Redux/Zustand)
 * 
 * Example backend integration:
 * 
 * export const getProducts = async () => {
 *   try {
 *     const response = await fetch('/api/products', {
 *       headers: {
 *         'Authorization': `Bearer ${getAuthToken()}`,
 *         'Content-Type': 'application/json'
 *       }
 *     });
 *     
 *     if (!response.ok) {
 *       throw new Error(`HTTP error! status: ${response.status}`);
 *     }
 *     
 *     const data = await response.json();
 *     return data.products || [];
 *   } catch (error) {
 *     console.error('Error fetching products:', error);
 *     throw error; // Re-throw to let components handle loading states
 *   }
 * };
 */
