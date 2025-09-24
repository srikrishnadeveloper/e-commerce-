// Simplified site configuration service
// Prefer env override, fallback to localhost
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
  ? import.meta.env.VITE_API_BASE
  : 'http://localhost:5001/api';

// API request helper with error handling
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
      const message = `HTTP ${response.status}: ${response.statusText} at ${endpoint}`;
      console.error('[siteConfigService] Response Error:', message);
      throw new Error(message);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error('[siteConfigService] ❌ API request failed:', {
      endpoint,
      baseUrl: API_BASE_URL,
      error: error?.message || String(error)
    });
    throw error;
  }
};

// Main site configuration service
class SiteConfigService {
  // Get all site configurations
  async getAllConfigs() {
    try {
      console.log('[siteConfigService] 🔄 Fetching all site configs...');
      const response = await apiRequest('/siteconfig');
      // Accept both wrapped and direct formats
      if (response && response.success && response.data) {
        console.log('[siteConfigService] ✅ All site configs fetched');
        return response.data;
      }
      if (response && !response.success) {
        throw new Error(response.message || 'Invalid response format');
      }
      return response; // direct config map fallback
    } catch (error) {
      console.error('[siteConfigService] ❌ Failed to fetch all site configs:', error?.message || error);
      throw error;
    }
  }

  // Get specific configuration by key
  async getConfig(key) {
    try {
      console.log(`[siteConfigService] 🔄 Fetching config: ${key}`);
      const response = await apiRequest(`/siteconfig/${key}`);
      // Accept both wrapped and direct formats
      if (response && response.success && response.data) {
        console.log(`[siteConfigService] ✅ Config fetched: ${key}`);
        return response.data;
      }
      if (response && response.success === false) {
        throw new Error(response.message || `Invalid response for key: ${key}`);
      }
      return response; // direct section fallback
    } catch (error) {
      console.error(`[siteConfigService] ❌ Failed to fetch config: ${key}`, error?.message || error);
      throw error;
    }
  }

  // Normalize homepage to prevent undefined access in UI components
  ensureHomepageDefaults(section) {
    const homepage = section && typeof section === 'object' ? { ...section } : {};

    // Hot Deals Section defaults
    homepage.hotDealsSection = homepage.hotDealsSection || {};
    homepage.hotDealsSection.enabled = homepage.hotDealsSection.enabled !== false; // default true
    homepage.hotDealsSection.title = homepage.hotDealsSection.title || '';
    homepage.hotDealsSection.subtitle = homepage.hotDealsSection.subtitle || '';
    homepage.hotDealsSection.productIds = Array.isArray(homepage.hotDealsSection.productIds)
      ? homepage.hotDealsSection.productIds
      : [];

    // Testimonials Section defaults
    homepage.testimonialSection = homepage.testimonialSection || {};
    homepage.testimonialSection.title = homepage.testimonialSection.title || 'Customer Testimonials';
    homepage.testimonialSection.navigationLabels = homepage.testimonialSection.navigationLabels || {};
    homepage.testimonialSection.navigationLabels.previous = homepage.testimonialSection.navigationLabels.previous || 'Previous';
    homepage.testimonialSection.navigationLabels.next = homepage.testimonialSection.navigationLabels.next || 'Next';
    homepage.testimonialSection.testimonials = Array.isArray(homepage.testimonialSection.testimonials)
      ? homepage.testimonialSection.testimonials
      : [
          {
            name: "John Doe",
            role: "Customer",
            text: "Great service and fast delivery!",
            rating: 5
          },
          {
            name: "Jane Smith",
            role: "Customer",
            text: "Excellent quality products.",
            rating: 5
          },
          {
            name: "Mike Johnson",
            role: "Customer",
            text: "Highly recommended!",
            rating: 5
          }
        ];

    // Featured Collections defaults
    homepage.featuredCollections = homepage.featuredCollections || {};
    homepage.featuredCollections.title = homepage.featuredCollections.title || 'Featured Collections';
    homepage.featuredCollections.enabled = homepage.featuredCollections.enabled !== false; // default true
    const list = Array.isArray(homepage.featuredCollections.collections)
      ? homepage.featuredCollections.collections
      : [];
    // Guarantee at least two items for proper display (mobile carousel + desktop grid)
    if (list.length === 0) {
      homepage.featuredCollections.collections = [
        {
          id: 'default-1',
          title: 'Electronics',
          subtitle: 'Latest Tech',
          description: 'Discover the latest in technology and gadgets',
          image: '/images/IMAGE_11.png',
          buttonText: 'Shop Now',
          buttonLink: '/collections/electronics',
          gradient: 'from-blue-500 to-purple-600',
        },
        {
          id: 'default-2',
          title: 'Fashion',
          subtitle: 'Trendy Styles',
          description: 'Stay fashionable with our latest collection',
          image: '/images/IMAGE_11.png',
          buttonText: 'Explore',
          buttonLink: '/collections/fashion',
          gradient: 'from-pink-500 to-red-600',
        },
      ];
    } else {
      homepage.featuredCollections.collections = list.map((c) => ({
        id: c?.id ?? Math.random().toString(36).slice(2),
        title: c?.title ?? '',
        subtitle: c?.subtitle ?? '',
        description: c?.description ?? '',
        image: c?.image ?? '/images/IMAGE_11.png',
        buttonText: c?.buttonText ?? 'Shop Now',
        buttonLink: c?.buttonLink ?? '#',
        gradient: c?.gradient ?? 'from-gray-500 to-gray-700',
      }));
    }
    return homepage;
  }

  // Specific config getters
  getBranding = () => this.getConfig('branding');
  getNavigation = () => this.getConfig('navigation');
  getHomepage = async () => {
    const raw = await this.getConfig('homepage');
    return this.ensureHomepageDefaults(raw);
  };
  getFooter = () => this.getConfig('footer');
  getAnnouncementBar = () => this.getConfig('announcementbar');
  getHero = () => this.getConfig('hero');
  getSEO = () => this.getConfig('seo');
  getCompany = () => this.getConfig('company');
}

// Create and export a singleton instance
const siteConfigService = new SiteConfigService();
// no-op b/c hooks may call these; they can be implemented later without breaking callers
siteConfigService.refreshConfig = async () => {};
siteConfigService.refreshAll = async () => {};
siteConfigService.clearCache = () => {};
siteConfigService.getMultipleConfigs = async () => ({});
siteConfigService.healthCheck = async () => ({ status: 'unknown' });
export default siteConfigService;
