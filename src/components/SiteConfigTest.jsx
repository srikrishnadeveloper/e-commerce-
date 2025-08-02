import React from 'react';
import { useSiteConfig, useSiteConfigHealth } from '../hooks/useSiteConfig';

const SiteConfigTest = () => {
  const { data: allConfigs, loading, error, refresh } = useSiteConfig();
  const { health, loading: healthLoading } = useSiteConfigHealth();

  if (loading || healthLoading) {
    return (
      <div className="p-8 bg-gray-100 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Site Configuration Test</h2>
        <div className="text-gray-600">Loading configuration data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-red-800">Site Configuration Test</h2>
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={refresh}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-green-50 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-green-800">✅ Site Configuration Test</h2>
      
      {/* Health Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Health Status</h3>
        <div className="bg-white p-4 rounded border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                health?.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {health?.status || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="font-medium">Config Count:</span> 
              <span className="ml-2">{health?.configCount || 0}</span>
            </div>
            <div>
              <span className="font-medium">Timestamp:</span> 
              <span className="ml-2 text-sm text-gray-600">
                {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Configuration Summary</h3>
        <div className="bg-white p-4 rounded border">
          <div className="grid grid-cols-3 gap-4">
            {allConfigs && Object.keys(allConfigs).map(key => (
              <div key={key} className="text-center p-3 bg-gray-50 rounded">
                <div className="font-medium text-gray-800">{key}</div>
                <div className="text-sm text-gray-600">
                  {allConfigs[key]?.version ? `v${allConfigs[key].version}` : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sample Data */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Sample Data</h3>
        <div className="bg-white p-4 rounded border">
          {allConfigs?.branding && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Branding</h4>
              <div className="text-sm text-gray-600">
                <div>Name: {allConfigs.branding.data?.name}</div>
                <div>Tagline: {allConfigs.branding.data?.tagline}</div>
                <div>Logo: {allConfigs.branding.data?.logo?.light}</div>
              </div>
            </div>
          )}
          
          {allConfigs?.navigation && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">Navigation</h4>
              <div className="text-sm text-gray-600">
                <div>Menu Items: {allConfigs.navigation.data?.mainMenu?.length || 0}</div>
                <div>First Item: {allConfigs.navigation.data?.mainMenu?.[0]?.name}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button 
          onClick={refresh}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🔄 Refresh Config
        </button>
        <div className="text-sm text-gray-600 self-center">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default SiteConfigTest; 