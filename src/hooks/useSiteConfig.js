import { useState, useEffect, useCallback } from 'react';
import siteConfigService from '../services/siteConfigService';

// Custom hook for site configuration
export const useSiteConfig = (configKey = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (configKey) {
        result = await siteConfigService.getConfig(configKey);
      } else {
        result = await siteConfigService.getAllConfigs();
      }

      setData(result);
      setLastUpdated(new Date());
      console.log(`✅ Site config loaded: ${configKey || 'all'}`);
    } catch (err) {
      console.error(`❌ Failed to load site config: ${configKey || 'all'}`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [configKey]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refresh function
  const refresh = useCallback(async () => {
    if (configKey) {
      await siteConfigService.refreshConfig(configKey);
    } else {
      await siteConfigService.refreshAll();
    }
    await fetchData();
  }, [configKey, fetchData]);

  // Clear cache function
  const clearCache = useCallback(() => {
    siteConfigService.clearCache(configKey);
  }, [configKey]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    clearCache,
    refetch: fetchData
  };
};

// Specialized hooks for common configurations
export const useBranding = () => useSiteConfig('branding');
export const useNavigation = () => useSiteConfig('navigation');
export const useHomepage = () => useSiteConfig('homepage');
export const useFooter = () => useSiteConfig('footer');
export const useAnnouncementBar = () => {
  const { data, loading, error, refresh } = useSiteConfig('announcementBar');
  
  // If there's an error, try with lowercase key
  const { data: fallbackData, loading: fallbackLoading, error: fallbackError } = useSiteConfig('announcementbar');
  
  return {
    data: data || fallbackData || {
      isActive: true,
      announcements: [
        "Welcome to our store - Free shipping on orders over $50!",
        "Summer Sale - Up to 50% off selected items!",
        "New arrivals just landed - Shop the latest trends!"
      ]
    },
    loading: loading && fallbackLoading,
    error: error && fallbackError,
    refresh
  };
};
export const useHero = () => useSiteConfig('hero');
export const useProductPages = () => useSiteConfig('productPages');
export const useCompany = () => useSiteConfig('company');
export const useSEO = () => useSiteConfig('seo');
export const useCart = () => useSiteConfig('cart');
export const useCheckout = () => useSiteConfig('checkout');
export const useErrors = () => useSiteConfig('errors');
export const useLoading = () => useSiteConfig('loading');
export const useAccessibility = () => useSiteConfig('accessibility');
export const usePages = () => useSiteConfig('pages');

// Hook for multiple configurations
export const useMultipleConfigs = (configKeys) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await siteConfigService.getMultipleConfigs(configKeys);
      setData(result);
      setLastUpdated(new Date());
      console.log(`✅ Multiple configs loaded: ${configKeys.join(', ')}`);
    } catch (err) {
      console.error('❌ Failed to load multiple configs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [configKeys]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    for (const key of configKeys) {
      await siteConfigService.refreshConfig(key);
    }
    await fetchData();
  }, [configKeys, fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    refetch: fetchData
  };
};

// Hook for health check
export const useSiteConfigHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = useCallback(async () => {
    try {
      setLoading(true);
      const result = await siteConfigService.healthCheck();
      setHealth(result);
    } catch (error) {
      setHealth({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    health,
    loading,
    checkHealth
  };
};

// Default export for backward compatibility
export default useSiteConfig;
