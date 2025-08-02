// Fast and seamless site configuration service
// Handles real-time data fetching with intelligent caching

const API_BASE_URL = 'http://localhost:5001/api';

// Cache for storing configuration data
const configCache = new Map();
const cacheExpiry = 5 * 60 * 1000; // 5 minutes

// Cache management
const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < cacheExpiry;
};

const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of configCache.entries()) {
    if (!isCacheValid(value.timestamp)) {
      configCache.delete(key);
    }
  }
};

// API request helper with error handling
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Main site configuration service
class SiteConfigService {
  constructor() {
    // Clear expired cache periodically
    setInterval(clearExpiredCache, 60000); // Every minute
  }

  // Get all site configurations
  async getAllConfigs() {
    const cacheKey = 'all_configs';
    const cached = configCache.get(cacheKey);

    if (cached && isCacheValid(cached.timestamp)) {
      console.log('✅ Using cached site configs');
      return cached.data;
    }

    try {
      console.log('🔄 Fetching site configs from backend...');
      const response = await apiRequest('/siteconfig');
      
      if (response.success && response.data) {
        // Cache the result
        configCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
        
        console.log('✅ Site configs fetched and cached');
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Failed to fetch site configs:', error);
      throw error;
    }
  }

  // Get specific configuration by key
  async getConfig(key) {
    const cacheKey = `config_${key}`;
    const cached = configCache.get(cacheKey);

    if (cached && isCacheValid(cached.timestamp)) {
      console.log(`✅ Using cached ${key} config`);
      return cached.data;
    }

    try {
      console.log(`🔄 Fetching ${key} config from backend...`);
      const response = await apiRequest(`/siteconfig/${key}`);
      
      if (response.success && response.data) {
        // Cache the result
        configCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });
        
        console.log(`✅ ${key} config fetched and cached`);
        return response.data;
      } else {
        throw new Error(`Invalid response for ${key}`);
      }
    } catch (error) {
      console.error(`❌ Failed to fetch ${key} config:`, error);
      throw error;
    }
  }

  // Get branding configuration
  async getBranding() {
    return this.getConfig('branding');
  }

  // Get navigation configuration
  async getNavigation() {
    return this.getConfig('navigation');
  }

  // Get homepage configuration
  async getHomepage() {
    return this.getConfig('homepage');
  }

  // Get footer configuration
  async getFooter() {
    return this.getConfig('footer');
  }

  // Get announcement bar configuration
  async getAnnouncementBar() {
    try {
      return await this.getConfig('announcementBar');
    } catch (error) {
      // Try alternative key names
      try {
        return await this.getConfig('announcementbar');
      } catch (fallbackError) {
        // Return fallback data if both fail
        return {
          isActive: true,
          announcements: [
            "Welcome to our store - Free shipping on orders over $50!",
            "Summer Sale - Up to 50% off selected items!",
            "New arrivals just landed - Shop the latest trends!"
          ]
        };
      }
    }
  }

  // Get hero carousel configuration
  async getHero() {
    return this.getConfig('hero');
  }

  // Get product pages configuration
  async getProductPages() {
    return this.getConfig('productPages');
  }

  // Get company information
  async getCompany() {
    return this.getConfig('company');
  }

  // Get SEO configuration
  async getSEO() {
    return this.getConfig('seo');
  }

  // Get cart configuration
  async getCart() {
    return this.getConfig('cart');
  }

  // Get checkout configuration
  async getCheckout() {
    return this.getConfig('checkout');
  }

  // Get error messages configuration
  async getErrors() {
    return this.getConfig('errors');
  }

  // Get loading states configuration
  async getLoading() {
    return this.getConfig('loading');
  }

  // Get accessibility configuration
  async getAccessibility() {
    return this.getConfig('accessibility');
  }

  // Get pages configuration
  async getPages() {
    return this.getConfig('pages');
  }

  // Clear cache for specific key
  clearCache(key = null) {
    if (key) {
      configCache.delete(`config_${key}`);
      console.log(`🧹 Cleared cache for ${key}`);
    } else {
      configCache.clear();
      console.log('🧹 Cleared all cache');
    }
  }

  // Force refresh all configurations
  async refreshAll() {
    this.clearCache();
    return this.getAllConfigs();
  }

  // Force refresh specific configuration
  async refreshConfig(key) {
    this.clearCache(key);
    return this.getConfig(key);
  }

  // Get multiple configurations efficiently
  async getMultipleConfigs(keys) {
    const results = {};
    const uncachedKeys = [];

    // Check cache first
    for (const key of keys) {
      const cacheKey = `config_${key}`;
      const cached = configCache.get(cacheKey);
      
      if (cached && isCacheValid(cached.timestamp)) {
        results[key] = cached.data;
      } else {
        uncachedKeys.push(key);
      }
    }

    // Fetch uncached configurations
    if (uncachedKeys.length > 0) {
      console.log(`🔄 Fetching ${uncachedKeys.length} uncached configs...`);
      
      try {
        const allConfigs = await this.getAllConfigs();
        
        for (const key of uncachedKeys) {
          if (allConfigs[key]) {
            results[key] = allConfigs[key].data;
          }
        }
      } catch (error) {
        console.error('❌ Failed to fetch multiple configs:', error);
        throw error;
      }
    }

    return results;
  }

  // Health check
  async healthCheck() {
    try {
      const response = await apiRequest('/siteconfig');
      return {
        status: 'healthy',
        configCount: response.count || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const siteConfigService = new SiteConfigService();

// Export the service and individual methods for convenience
export default siteConfigService;

// Convenience exports for common use cases
export const {
  getAllConfigs,
  getConfig,
  getBranding,
  getNavigation,
  getHomepage,
  getFooter,
  getAnnouncementBar,
  getHero,
  getProductPages,
  getCompany,
  getSEO,
  getCart,
  getCheckout,
  getErrors,
  getLoading,
  getAccessibility,
  getPages,
  clearCache,
  refreshAll,
  refreshConfig,
  getMultipleConfigs,
  healthCheck
} = siteConfigService; 