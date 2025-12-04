// Simplified site configuration service
const API_BASE_URL = 'http://localhost:5001/api';

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
      if (response.success && response.data) {
        console.log('[siteConfigService] ✅ All site configs fetched');
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
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
      if (response.success && response.data) {
        console.log(`[siteConfigService] ✅ Config fetched: ${key}`);
        return response.data;
      } else {
        throw new Error(`Invalid response for key: ${key}`);
      }
    } catch (error) {
      console.error(`[siteConfigService] ❌ Failed to fetch config: ${key}`, error?.message || error);
      throw error;
    }
  }

  // Specific config getters
  getBranding = () => this.getConfig('branding');
  getNavigation = () => this.getConfig('navigation');
  getHomepage = () => this.getConfig('homepage');
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

// Fetch multiple config keys in a single request to avoid many parallel calls
siteConfigService.getMultipleConfigs = async (keys = []) => {
  try {
    // If no keys requested, return entire config map
    if (!Array.isArray(keys) || keys.length === 0) {
      const all = await siteConfigService.getAllConfigs();
      return all || {};
    }

    // Request consolidated config once and pick keys
    const allConfigs = await apiRequest('/siteconfig');
    const configMap = (allConfigs && allConfigs.data) ? allConfigs.data : allConfigs || {};
    const result = {};
    keys.forEach((k) => {
      const key = String(k).toLowerCase();
      result[key] = configMap[key];
    });
    return result;
  } catch (error) {
    console.error('[siteConfigService] ❌ getMultipleConfigs failed:', error?.message || error);
    // Fallback: attempt individual fetches (best-effort)
    const result = {};
    await Promise.all(keys.map(async (k) => {
      try {
        const r = await siteConfigService.getConfig(k);
        result[String(k).toLowerCase()] = r;
      } catch (e) {
        result[String(k).toLowerCase()] = null;
      }
    }));
    return result;
  }
};

siteConfigService.healthCheck = async () => ({ status: 'unknown' });
export default siteConfigService;
